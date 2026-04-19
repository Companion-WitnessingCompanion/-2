[CmdletBinding()]
param(
    [int]$MaxItems = 0,

    [int]$MaxAttemptIds = 0,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$storePath = Join-Path $PSScriptRoot 'data\current-opening-runs.json'

if (-not (Test-Path -LiteralPath $storePath)) {
    throw "Current opening run store not found: $storePath"
}

$runs = @(Read-JsonArrayStore -Path $storePath)
$selectedRuns = if ($MaxItems -gt 0) {
    @($runs | Select-Object -Last $MaxItems)
}
else {
    @($runs)
}

if ($Format -eq 'json') {
    [pscustomobject]@{
        Count = $runs.Count
        ShownCount = @($selectedRuns).Count
        MaxItems = $MaxItems
        MaxAttemptIds = $MaxAttemptIds
        Runs = @($selectedRuns)
    } | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Current Opening Runs')
$lines.Add('')
$lines.Add("## Count")
$lines.Add("- $($runs.Count)")
$lines.Add("- shown: $(@($selectedRuns).Count)")
$lines.Add("- max items: $(if ($MaxItems -gt 0) { $MaxItems } else { 'all' })")
$lines.Add("- max attempt ids: $(if ($MaxAttemptIds -gt 0) { $MaxAttemptIds } else { 'all' })")
$lines.Add('')
$lines.Add('## Runs')

foreach ($run in $selectedRuns) {
    $future = if ($run.PSObject.Properties.Name -contains 'RecalledFuture') { $run.RecalledFuture } else { $null }
    $observation = if ($run.PSObject.Properties.Name -contains 'Observation') { $run.Observation } else { $null }
    $paused = if ($observation -and ($observation.PSObject.Properties.Name -contains 'Paused')) { $observation.Paused } else { $null }
    $lessBarehanded = if ($observation -and ($observation.PSObject.Properties.Name -contains 'QuestionsFeltLessBarehanded')) { $observation.QuestionsFeltLessBarehanded } else { $null }
    $ritualStayedSmall = if ($observation -and ($observation.PSObject.Properties.Name -contains 'RitualStayedSmall')) { $observation.RitualStayedSmall } else { $null }
    $attemptIds = @()
    if ($run.PSObject.Properties.Name -contains 'AttemptIds') {
        $attemptIds = @($run.AttemptIds)
    }
    $attemptDisplay = Format-AttemptIdsForDisplay -AttemptIds $attemptIds -MaxAttemptIds $MaxAttemptIds

    $lines.Add("- [$($run.Timestamp)] $(if ($run.Task) { $run.Task } else { '(task not set)' })")
    $lines.Add("  - future: $(if ($future) { $future } else { '(none)' })")
    $lines.Add("  - paused: $(if ($null -ne $paused) { $paused } else { '(unknown)' })")
    $lines.Add("  - questions less barehanded: $(if ($null -ne $lessBarehanded) { $lessBarehanded } else { '(unknown)' })")
    $lines.Add("  - ritual stayed small: $(if ($null -ne $ritualStayedSmall) { $ritualStayedSmall } else { '(unknown)' })")
    $lines.Add("  - attempts: $attemptDisplay")
    if ($run.PSObject.Properties.Name -contains 'AttemptSelection' -and $run.AttemptSelection -and $run.AttemptSelection.PSObject.Properties.Name -contains 'SelectionNote') {
        $lines.Add("  - attempt selection: $($run.AttemptSelection.SelectionNote)")
    }
    if ($run.PSObject.Properties.Name -contains 'SnapshotPath' -and $run.SnapshotPath) {
        $lines.Add("  - snapshot: $($run.SnapshotPath)")
    }
}

[System.String]::Join([Environment]::NewLine, $lines)
