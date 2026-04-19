[CmdletBinding()]
param(
    [switch]$MetadataOnly,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$runStorePath = Join-Path $PSScriptRoot 'data\current-opening-runs.json'
$snapshotDir = Join-Path $PSScriptRoot 'data\current-opening-run-snapshots'

if (-not (Test-Path -LiteralPath $runStorePath)) {
    throw "Current opening run store not found: $runStorePath"
}

if (-not (Test-Path -LiteralPath $snapshotDir)) {
    throw "Current opening snapshot directory not found: $snapshotDir"
}

$runs = @(Read-JsonArrayStore -Path $runStorePath)
$latestRunWithSnapshot = @(
    $runs |
        Where-Object { $_.PSObject.Properties.Name -contains 'SnapshotPath' -and -not [string]::IsNullOrWhiteSpace($_.SnapshotPath) } |
        Select-Object -Last 1
)

$snapshotFile = $null
$snapshotRelativePath = $null

if ($latestRunWithSnapshot.Count -gt 0) {
    $snapshotRelativePath = Normalize-RelativePath -InputPath $latestRunWithSnapshot[0].SnapshotPath
    $candidate = Join-Path (Get-WorkspaceRoot) $snapshotRelativePath

    if (Test-Path -LiteralPath $candidate) {
        $snapshotFile = Get-Item -LiteralPath $candidate
    }
}

if (-not $snapshotFile) {
    $snapshotFile = Get-ChildItem -LiteralPath $snapshotDir -File | Sort-Object LastWriteTime | Select-Object -Last 1
    if (-not $snapshotFile) {
        throw "No current opening snapshots found in $snapshotDir"
    }
    $snapshotRelativePath = Normalize-RelativePath -InputPath $snapshotFile.FullName
}

$content = if ($MetadataOnly) { $null } else { Get-Content -LiteralPath $snapshotFile.FullName -Encoding UTF8 -Raw }

$result = [pscustomobject]@{
    SnapshotPath = $snapshotRelativePath
    SnapshotName = $snapshotFile.Name
    LastWriteTime = $snapshotFile.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
    FromRunStore = [bool]($latestRunWithSnapshot.Count -gt 0)
    MetadataOnly = [bool]$MetadataOnly
    Content = $content
}

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 6
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Latest Current Opening Snapshot')
$lines.Add('')
$lines.Add('## Snapshot')
$lines.Add("- name: $($result.SnapshotName)")
$lines.Add("- path: $($result.SnapshotPath)")
$lines.Add("- last write: $($result.LastWriteTime)")
$lines.Add("- from run store: $($result.FromRunStore)")

if (-not $MetadataOnly) {
    $lines.Add('')
    $lines.Add('## Content')
    $lines.Add($result.Content)
}

[System.String]::Join([Environment]::NewLine, $lines)
