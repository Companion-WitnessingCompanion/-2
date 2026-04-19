[CmdletBinding()]
param(
    [switch]$MetadataOnly,

    [int]$MaxAttemptIds = 0,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$result = Get-LatestCurrentOpeningData -IncludeSnapshotContent:(-not $MetadataOnly)

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Latest Current Opening')
$lines.Add('')
$lines.Add('## Run Count')
$lines.Add("- $($result.RunCount)")
$lines.Add("- max attempt ids: $(if ($MaxAttemptIds -gt 0) { $MaxAttemptIds } else { 'all' })")
$lines.Add('')
$lines.Add('## Latest Run')

if ($null -eq $result.LatestRun) {
    $lines.Add('- (none)')
}
else {
    $lines.Add("- timestamp: $(if ($result.LatestRun.Timestamp) { $result.LatestRun.Timestamp } else { '(none)' })")
    $lines.Add("- task: $(if ($result.LatestRun.Task) { $result.LatestRun.Task } else { '(none)' })")
    $lines.Add("- future: $(if ($result.LatestRun.Future) { $result.LatestRun.Future } else { '(none)' })")
    $lines.Add("- paused: $(if ($null -ne $result.LatestRun.Paused) { $result.LatestRun.Paused } else { '(unknown)' })")
    $lines.Add("- questions less barehanded: $(if ($null -ne $result.LatestRun.QuestionsFeltLessBarehanded) { $result.LatestRun.QuestionsFeltLessBarehanded } else { '(unknown)' })")
    $lines.Add("- ritual stayed small: $(if ($null -ne $result.LatestRun.RitualStayedSmall) { $result.LatestRun.RitualStayedSmall } else { '(unknown)' })")
    $lines.Add("- attempts: $(Format-AttemptIdsForDisplay -AttemptIds @($result.LatestRun.Attempts) -MaxAttemptIds $MaxAttemptIds)")
    if ($result.LatestRun.AttemptSelection -and $result.LatestRun.AttemptSelection.SelectionNote) {
        $lines.Add("- attempt selection: $($result.LatestRun.AttemptSelection.SelectionNote)")
    }
    if ($result.LatestRun.SnapshotPath) {
        $lines.Add("- snapshot path: $($result.LatestRun.SnapshotPath)")
    }
}

$lines.Add('')
$lines.Add('## Snapshot')
$lines.Add("- name: $($result.Snapshot.SnapshotName)")
$lines.Add("- path: $($result.Snapshot.SnapshotPath)")
$lines.Add("- last write: $($result.Snapshot.LastWriteTime)")
$lines.Add("- from latest run: $($result.Snapshot.FromRunStore)")

if (-not $MetadataOnly) {
    $lines.Add('')
    $lines.Add('## Snapshot Content')
    $lines.Add($result.Snapshot.Content)
}

[System.String]::Join([Environment]::NewLine, $lines)
