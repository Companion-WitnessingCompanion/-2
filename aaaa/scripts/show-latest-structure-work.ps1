[CmdletBinding()]
param(
    [switch]$MetadataOnly,

    [int]$MaxAttemptIds = 0,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$result = Get-LatestStructureWorkData -IncludeSnapshotContent:(-not $MetadataOnly)
$latestObservation = Get-LatestStructureWorkObservationData
$alignment = Get-StructureWorkObservationAlignmentData -LatestStructureWorkData $result -LatestObservationData $latestObservation

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Latest Structure Work')
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
    $lines.Add("- target: $(if ($result.LatestRun.Target) { $result.LatestRun.Target } else { '(none)' })")
    $lines.Add("- future: $(if ($result.LatestRun.Future) { $result.LatestRun.Future } else { '(none)' })")
    $lines.Add("- notes: $(if ($result.LatestRun.Notes) { $result.LatestRun.Notes } else { '(none)' })")
    $lines.Add("- attempts: $(Format-AttemptIdsForDisplay -AttemptIds @($result.LatestRun.Attempts) -MaxAttemptIds $MaxAttemptIds)")
    if ($result.LatestRun.AttemptSelection -and $result.LatestRun.AttemptSelection.SelectionNote) {
        $lines.Add("- attempt selection: $($result.LatestRun.AttemptSelection.SelectionNote)")
    }
    if ($result.LatestRun.SnapshotPath) {
        $lines.Add("- snapshot path: $($result.LatestRun.SnapshotPath)")
    }
    if ($result.LatestRun.Observation) {
        $lines.Add("- run observation timestamp: $(if ($result.LatestRun.Observation.Timestamp) { $result.LatestRun.Observation.Timestamp } else { '(none)' })")
        $lines.Add("- run observation target clearer: $(if ($null -ne $result.LatestRun.Observation.TargetFeltClearer) { $result.LatestRun.Observation.TargetFeltClearer } else { '(unknown)' })")
        $lines.Add("- run observation next step nameable: $(if ($null -ne $result.LatestRun.Observation.NextStepFeltNameable) { $result.LatestRun.Observation.NextStepFeltNameable } else { '(unknown)' })")
        $lines.Add("- run observation bridge stayed thin: $(if ($null -ne $result.LatestRun.Observation.BridgeStayedThin) { $result.LatestRun.Observation.BridgeStayedThin } else { '(unknown)' })")
    }
    if ($result.LatestRun.StructureMemoryHandoff) {
        $lines.Add("- entry handoff run-backed count: $($result.LatestRun.StructureMemoryHandoff.RunBackedObservationCount)")
        $lines.Add("- entry handoff fully aligned count: $($result.LatestRun.StructureMemoryHandoff.FullyAlignedCount)")
        $lines.Add("- entry handoff independent well count: $($result.LatestRun.StructureMemoryHandoff.IndependentWellCount)")
        $lines.Add("- entry handoff reading: $($result.LatestRun.StructureMemoryHandoff.MemoryReading)")
        $lines.Add("- entry handoff independent well role: $($result.LatestRun.StructureMemoryHandoff.IndependentWellRole)")
    }
}

$lines.Add('')
$lines.Add('## Observation Memory')
$lines.Add("- status: $($alignment.Status)")
$lines.Add("- separate well count: $($latestObservation.Count)")
$lines.Add("- fully aligned: $($alignment.FullyAligned)")
if ($alignment.RunAvailable -and $alignment.WellAvailable) {
    $lines.Add("- same timestamp: $($alignment.SameTimestamp)")
    $lines.Add("- same target: $($alignment.SameTarget)")
    $lines.Add("- same future: $($alignment.SameFuture)")
    $lines.Add("- same target clearer: $($alignment.SameTargetFeltClearer)")
    $lines.Add("- same next step nameable: $($alignment.SameNextStepFeltNameable)")
    $lines.Add("- same bridge stayed thin: $($alignment.SameBridgeStayedThin)")
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
