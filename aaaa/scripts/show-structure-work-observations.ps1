[CmdletBinding()]
param(
    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$storePath = Get-StructureWorkObservationStorePath
$observations = if (Test-Path -LiteralPath $storePath) {
    @(Read-JsonArrayStore -Path $storePath)
}
else {
    @()
}
$observationCount = (@($observations) | Measure-Object).Count

if ($Format -eq 'json') {
    [pscustomobject]@{
        Count = $observationCount
        Observations = @($observations)
    } | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Structure Work Observations')
$lines.Add('')
$lines.Add('## Count')
$lines.Add("- $observationCount")
$lines.Add('')
$lines.Add('## Observations')

foreach ($item in $observations) {
    $lines.Add("- [$($item.Timestamp)] $(if ($item.Target) { $item.Target } else { '(target not set)' })")
    $lines.Add("  - future: $(if ($item.Future) { $item.Future } else { '(none)' })")
    $lines.Add("  - target felt clearer: $(if ($null -ne $item.TargetFeltClearer) { $item.TargetFeltClearer } else { '(unknown)' })")
    $lines.Add("  - next step felt nameable: $(if ($null -ne $item.NextStepFeltNameable) { $item.NextStepFeltNameable } else { '(unknown)' })")
    $lines.Add("  - bridge stayed thin: $(if ($null -ne $item.BridgeStayedThin) { $item.BridgeStayedThin } else { '(unknown)' })")
    $lines.Add("  - notes: $(if ($item.Notes) { $item.Notes } else { '(none)' })")
}

[System.String]::Join([Environment]::NewLine, $lines)
