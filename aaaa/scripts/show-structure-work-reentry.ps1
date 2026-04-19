[CmdletBinding()]
param(
    [switch]$IncludeSnapshotContent,

    [string]$TaskHint,

    [string]$TargetHint,

    [string]$FutureHint,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$result = Get-StructureWorkReentryData -IncludeSnapshotContent:$IncludeSnapshotContent -TaskHint $TaskHint -TargetHint $TargetHint -FutureHint $FutureHint

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 10
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Structure Work Reentry')
$lines.Add('')
$lines.Add('## Latest Structure Work')
$lines.Add("- run count: $($result.Latest.RunCount)")

if ($result.Latest.RawLatestTimestamp -and $result.Latest.SelectedLatestTimestamp -and ($result.Latest.RawLatestTimestamp -ne $result.Latest.SelectedLatestTimestamp)) {
    $lines.Add("- raw latest timestamp: $($result.Latest.RawLatestTimestamp)")
    $lines.Add("- selected latest timestamp: $($result.Latest.SelectedLatestTimestamp)")
}

if ($result.Latest.LatestRun) {
    $lines.Add("- latest task: $(if ($result.Latest.LatestRun.Task) { $result.Latest.LatestRun.Task } else { '(none)' })")
    $lines.Add("- latest target: $(if ($result.Latest.LatestRun.Target) { $result.Latest.LatestRun.Target } else { '(none)' })")
    $lines.Add("- latest future: $(if ($result.Latest.LatestRun.Future) { $result.Latest.LatestRun.Future } else { '(none)' })")
    if ($result.Latest.LatestRun.AttemptSelection -and $result.Latest.LatestRun.AttemptSelection.SelectionNote) {
        $lines.Add("- latest attempt selection: $($result.Latest.LatestRun.AttemptSelection.SelectionNote)")
    }
}

$lines.Add("- latest snapshot: $($result.Latest.Snapshot.SnapshotName)")
$lines.Add("- snapshot path: $($result.Latest.Snapshot.SnapshotPath)")
$lines.Add('')
$lines.Add('## Latest Observation')
$lines.Add("- observation count: $($result.LatestObservation.Count)")
if ($result.LatestObservation.LatestObservation) {
    $lines.Add("- latest observation timestamp: $($result.LatestObservation.LatestObservation.Timestamp)")
    $lines.Add("- target felt clearer: $(if ($null -ne $result.LatestObservation.LatestObservation.TargetFeltClearer) { $result.LatestObservation.LatestObservation.TargetFeltClearer } else { '(unknown)' })")
    $lines.Add("- next step felt nameable: $(if ($null -ne $result.LatestObservation.LatestObservation.NextStepFeltNameable) { $result.LatestObservation.LatestObservation.NextStepFeltNameable } else { '(unknown)' })")
    $lines.Add("- bridge stayed thin: $(if ($null -ne $result.LatestObservation.LatestObservation.BridgeStayedThin) { $result.LatestObservation.LatestObservation.BridgeStayedThin } else { '(unknown)' })")
}
$lines.Add('')
$lines.Add('## Observation Alignment')
$lines.Add("- status: $($result.ObservationAlignment.Status)")
$lines.Add("- fully aligned: $($result.ObservationAlignment.FullyAligned)")
if ($result.ObservationAlignment.RunAvailable -and $result.ObservationAlignment.WellAvailable) {
    $lines.Add("- same timestamp: $($result.ObservationAlignment.SameTimestamp)")
    $lines.Add("- same target: $($result.ObservationAlignment.SameTarget)")
    $lines.Add("- same future: $($result.ObservationAlignment.SameFuture)")
    $lines.Add("- same target clearer: $($result.ObservationAlignment.SameTargetFeltClearer)")
    $lines.Add("- same next step nameable: $($result.ObservationAlignment.SameNextStepFeltNameable)")
    $lines.Add("- same bridge stayed thin: $($result.ObservationAlignment.SameBridgeStayedThin)")
}
$lines.Add('')
$lines.Add('## Memory History')
$lines.Add("- run-backed observation count: $($result.MemoryHistory.Summary.RunBackedObservationCount)")
$lines.Add("- dual memory count: $($result.MemoryHistory.Summary.DualMemoryCount)")
$lines.Add("- fully aligned count: $($result.MemoryHistory.Summary.FullyAlignedCount)")
$lines.Add("- independent well count: $($result.MemoryHistory.Summary.IndependentWellCount)")
$lines.Add("- memory reading: $($result.MemoryHistory.Summary.MemoryReading)")
$lines.Add("- independent well role: $($result.MemoryHistory.Summary.IndependentWellRole)")
$lines.Add("- independent well presentation: $($result.MemoryHistory.Summary.IndependentWellPresentation)")
$lines.Add("- next question: $($result.MemoryHistory.Summary.NextQuestion)")
$lines.Add("- history command:")
$lines.Add('```powershell')
$lines.Add($result.MemoryHistoryCommand)
$lines.Add('```')
$lines.Add('')

if ($result.MemoryHandoffDelta) {
    $lines.Add('## Latest Entry Handoff Delta')
    $lines.Add("- status: $($result.MemoryHandoffDelta.Status)")
    $lines.Add("- entry run-backed count: $($result.MemoryHandoffDelta.EntryRunBackedObservationCount)")
    $lines.Add("- current run-backed count: $($result.MemoryHandoffDelta.CurrentRunBackedObservationCount)")
    $lines.Add("- run-backed delta: $($result.MemoryHandoffDelta.RunBackedObservationDelta)")
    $lines.Add("- entry fully aligned count: $($result.MemoryHandoffDelta.EntryFullyAlignedCount)")
    $lines.Add("- current fully aligned count: $($result.MemoryHandoffDelta.CurrentFullyAlignedCount)")
    $lines.Add("- fully aligned delta: $($result.MemoryHandoffDelta.FullyAlignedDelta)")
    $lines.Add("- independent well delta: $($result.MemoryHandoffDelta.IndependentWellDelta)")
    $lines.Add("- same reading: $($result.MemoryHandoffDelta.SameMemoryReading)")
    $lines.Add("- same independent well role: $($result.MemoryHandoffDelta.SameIndependentWellRole)")
    $lines.Add("- next question: $($result.MemoryHandoffDelta.NextQuestion)")
    $lines.Add('')
}

$lines.Add('## Next Run Scaffold')
$lines.Add("- next task: $($result.Scaffold.NextRun.Task)")
$lines.Add("- next target: $($result.Scaffold.NextRun.Target)")
$lines.Add("- recalled future: $($result.Scaffold.NextRun.Future)")
$lines.Add('')
$lines.Add('## Begin Structure Work Preview')
$lines.Add('```powershell')
$lines.Add($result.BeginPreviewCommand)
$lines.Add('```')
$lines.Add('')
$lines.Add('## Begin Structure Work Run')
$lines.Add('```powershell')
$lines.Add($result.BeginRunCommand)
$lines.Add('```')
$lines.Add('')
$lines.Add('## Starter Command')
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
