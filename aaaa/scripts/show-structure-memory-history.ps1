[CmdletBinding()]
param(
    [int]$MaxItems = 10,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$result = Get-StructureWorkObservationAlignmentHistoryData -MaxItems $MaxItems

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 10
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Structure Memory History')
$lines.Add('')
$lines.Add('## Summary')
$lines.Add("- run-backed observation count: $($result.Summary.RunBackedObservationCount)")
$lines.Add("- separate well count: $($result.Summary.SeparateWellCount)")
$lines.Add("- dual memory count: $($result.Summary.DualMemoryCount)")
$lines.Add("- fully aligned count: $($result.Summary.FullyAlignedCount)")
$lines.Add("- run only count: $($result.Summary.RunOnlyCount)")
$lines.Add("- independent well count: $($result.Summary.IndependentWellCount)")
$lines.Add("- memory reading: $($result.Summary.MemoryReading)")
$lines.Add("- independent well role: $($result.Summary.IndependentWellRole)")
$lines.Add("- independent well presentation: $($result.Summary.IndependentWellPresentation)")
$lines.Add("- next question: $($result.Summary.NextQuestion)")
$lines.Add("- max items: $($result.Summary.MaxItems)")
$lines.Add('')
$lines.Add('## Run-Backed Entries')

if (@($result.RunBackedEntries).Count -eq 0) {
    $lines.Add('- (none)')
}
else {
    foreach ($entry in $result.RunBackedEntries) {
        $lines.Add("- [$($entry.Timestamp)] $(if ($entry.Task) { $entry.Task } else { '(task not set)' })")
        $lines.Add("  - status: $($entry.Status)")
        $lines.Add("  - fully aligned: $($entry.FullyAligned)")
        $lines.Add("  - target: $(if ($entry.Target) { $entry.Target } else { '(none)' })")
        $lines.Add("  - future: $(if ($entry.Future) { $entry.Future } else { '(none)' })")
        $lines.Add("  - run target clearer: $(if ($null -ne $entry.RunObservation.TargetFeltClearer) { $entry.RunObservation.TargetFeltClearer } else { '(unknown)' })")
        $lines.Add("  - run next step nameable: $(if ($null -ne $entry.RunObservation.NextStepFeltNameable) { $entry.RunObservation.NextStepFeltNameable } else { '(unknown)' })")
        $lines.Add("  - run bridge stayed thin: $(if ($null -ne $entry.RunObservation.BridgeStayedThin) { $entry.RunObservation.BridgeStayedThin } else { '(unknown)' })")

        if ($entry.WellObservation) {
            $lines.Add("  - same timestamp: $($entry.SameTimestamp)")
            $lines.Add("  - same target: $($entry.SameTarget)")
            $lines.Add("  - same future: $($entry.SameFuture)")
            $lines.Add("  - same target clearer: $($entry.SameTargetFeltClearer)")
            $lines.Add("  - same next step nameable: $($entry.SameNextStepFeltNameable)")
            $lines.Add("  - same bridge stayed thin: $($entry.SameBridgeStayedThin)")
            $lines.Add("  - well notes: $(if ($entry.WellObservation.Notes) { $entry.WellObservation.Notes } else { '(none)' })")
        }
        else {
            $lines.Add('  - well notes: (no separate well match)')
        }
    }
}

$lines.Add('')
$lines.Add('## Independent Well Entries')

if (@($result.IndependentWellEntries).Count -eq 0) {
    $lines.Add('- (none)')
}
else {
    foreach ($entry in $result.IndependentWellEntries) {
        $lines.Add("- [$($entry.Timestamp)] $(if ($entry.Target) { $entry.Target } else { '(target not set)' })")
        $lines.Add("  - future: $(if ($entry.Future) { $entry.Future } else { '(none)' })")
        $lines.Add("  - target felt clearer: $(if ($null -ne $entry.TargetFeltClearer) { $entry.TargetFeltClearer } else { '(unknown)' })")
        $lines.Add("  - next step felt nameable: $(if ($null -ne $entry.NextStepFeltNameable) { $entry.NextStepFeltNameable } else { '(unknown)' })")
        $lines.Add("  - bridge stayed thin: $(if ($null -ne $entry.BridgeStayedThin) { $entry.BridgeStayedThin } else { '(unknown)' })")
        $lines.Add("  - notes: $(if ($entry.Notes) { $entry.Notes } else { '(none)' })")
    }
}

[System.String]::Join([Environment]::NewLine, $lines)
