[CmdletBinding()]
param(
    [switch]$IncludeSnapshotContent,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$result = Get-CurrentOpeningReentryData -IncludeSnapshotContent:$IncludeSnapshotContent

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 10
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Current Opening Reentry')
$lines.Add('')
$lines.Add('## Latest Current Opening')
$lines.Add("- run count: $($result.Latest.RunCount)")
if ($result.Latest.RawLatestTimestamp -and $result.Latest.SelectedLatestTimestamp -and ($result.Latest.RawLatestTimestamp -ne $result.Latest.SelectedLatestTimestamp)) {
    $lines.Add("- raw latest timestamp: $($result.Latest.RawLatestTimestamp)")
    $lines.Add("- selected latest timestamp: $($result.Latest.SelectedLatestTimestamp)")
}

if ($result.Latest.LatestRun) {
    $lines.Add("- latest task: $(if ($result.Latest.LatestRun.Task) { $result.Latest.LatestRun.Task } else { '(none)' })")
    $lines.Add("- latest future: $(if ($result.Latest.LatestRun.Future) { $result.Latest.LatestRun.Future } else { '(none)' })")
    $lines.Add("- paused: $(if ($null -ne $result.Latest.LatestRun.Paused) { $result.Latest.LatestRun.Paused } else { '(unknown)' })")
    $lines.Add("- questions less barehanded: $(if ($null -ne $result.Latest.LatestRun.QuestionsFeltLessBarehanded) { $result.Latest.LatestRun.QuestionsFeltLessBarehanded } else { '(unknown)' })")
    $lines.Add("- ritual stayed small: $(if ($null -ne $result.Latest.LatestRun.RitualStayedSmall) { $result.Latest.LatestRun.RitualStayedSmall } else { '(unknown)' })")
    if ($result.Latest.LatestRun.AttemptSelection -and $result.Latest.LatestRun.AttemptSelection.SelectionNote) {
        $lines.Add("- latest attempt selection: $($result.Latest.LatestRun.AttemptSelection.SelectionNote)")
    }
}

$lines.Add("- latest snapshot: $($result.Latest.Snapshot.SnapshotName)")
$lines.Add("- snapshot path: $($result.Latest.Snapshot.SnapshotPath)")
$lines.Add('')
$lines.Add('## Next Run Scaffold')
$lines.Add("- next task: $($result.Scaffold.NextRun.Task)")
$lines.Add("- recalled future: $($result.Scaffold.NextRun.Future)")
$lines.Add('')
$lines.Add('## Active Questions')
foreach ($question in $result.Scaffold.ActiveQuestions) {
    $lines.Add("- $question")
}

$lines.Add('')
$lines.Add('## Begin Current Work Preview')
$lines.Add('```powershell')
$lines.Add($result.BeginPreviewCommand)
$lines.Add('```')
$lines.Add('')
$lines.Add('## Begin Current Work Run')
$lines.Add('```powershell')
$lines.Add($result.BeginRunCommand)
$lines.Add('```')
$lines.Add('')
$lines.Add('## Run Command')
$lines.Add('```powershell')
$lines.Add($result.StarterCommand)
$lines.Add('```')
$lines.Add('')
$lines.Add('## Direct Run Command')
$lines.Add('```powershell')
$lines.Add($result.Scaffold.NextRun.ExampleCommand)
$lines.Add('```')

if ($IncludeSnapshotContent -and $result.Latest.Snapshot.Content) {
    $lines.Add('')
    $lines.Add('## Latest Snapshot Content')
    $lines.Add($result.Latest.Snapshot.Content)
}

[System.String]::Join([Environment]::NewLine, $lines)
