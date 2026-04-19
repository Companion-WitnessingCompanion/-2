[CmdletBinding()]
param(
    [string]$Task,

    [string]$Target,

    [string]$WorkType,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$context = New-StartWorkContext -Task $Task -Target $Target -WorkType $WorkType

if ($Format -eq 'json') {
    $context | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Start Work Brief')
$lines.Add('')

if ($context.Task) {
    $lines.Add('## Task')
    $lines.Add("- $($context.Task)")
    $lines.Add('')
}

if ($context.Target) {
    $lines.Add('## Target')
    $lines.Add("- $($context.Target)")
    $lines.Add('')
}

$lines.Add('## Work Type')
$lines.Add("- $($context.WorkType.Label) ($($context.WorkType.Name))")
$lines.Add("- $($context.WorkType.Description)")
$lines.Add("- source: $($context.WorkType.Source)")
$lines.Add('')

$lines.Add('## Silent Pause')
$lines.Add("- $($context.Notes[0])")
$lines.Add('')

$lines.Add('## Entry Ritual')
foreach ($line in $context.EntryRitual) {
    $lines.Add("- $line")
}
$lines.Add('')

$lines.Add('## Active Questions')
foreach ($question in $context.ActiveQuestions) {
    $lines.Add("- $question")
}
$lines.Add('')

$lines.Add('## Layer Order')
foreach ($layer in $context.Layers) {
    $lines.Add("- $($layer.Label): $($layer.Purpose)")
    foreach ($file in $layer.Files) {
        $lines.Add("  - $file")
    }
}
$lines.Add('')

$lines.Add('## Attempt Layer')
if ($context.AttemptHistory.Stance) {
    $lines.Add("- stance: $($context.AttemptHistory.Stance)")
}
if ($context.AttemptHistory.SelectionNote) {
    $lines.Add("- selection: $($context.AttemptHistory.SelectionNote)")
}
foreach ($attempt in $context.AttemptHistory.Attempts) {
    $lines.Add("- [$($attempt.Id)] $($attempt.Title) ($($attempt.Status))")
    $lines.Add("  - why: $($attempt.WhyStarted)")
    foreach ($item in $attempt.WhatWasAdded) {
        $lines.Add("  - added: $item")
    }
    foreach ($item in $attempt.ExposedIssues) {
        $lines.Add("  - exposed: $item")
    }
    foreach ($item in $attempt.NextAttempt) {
        $lines.Add("  - next: $item")
    }
}
$lines.Add('')

$lines.Add('## Read Now')
foreach ($path in $context.ReadNow) {
    $lines.Add("- $path")
}
$lines.Add('')

$lines.Add('## Candidate Context')
$lines.Add("- current: $([string]::Join(', ', $context.CandidateContext.CurrentCandidates))")
$lines.Add("- judgment: $(if ($context.CandidateContext.JudgmentCandidates.Count -gt 0) { [string]::Join(', ', $context.CandidateContext.JudgmentCandidates) } else { '(none)' })")
$lines.Add("- summary: $(if ($context.CandidateContext.SummaryCandidate) { $context.CandidateContext.SummaryCandidate } else { '(none)' })")
$lines.Add("- session: $(if ($context.CandidateContext.SessionCandidates.Count -gt 0) { [string]::Join(', ', $context.CandidateContext.SessionCandidates) } else { '(none)' })")
$lines.Add('')

$reentry = $context.CurrentOpeningReentry
if ($reentry) {
    $lines.Add('## Current Opening Reentry')
    $lines.Add("- run count: $($reentry.Latest.RunCount)")

    if ($reentry.Latest.RawLatestTimestamp -and $reentry.Latest.SelectedLatestTimestamp -and ($reentry.Latest.RawLatestTimestamp -ne $reentry.Latest.SelectedLatestTimestamp)) {
        $lines.Add("- raw latest timestamp: $($reentry.Latest.RawLatestTimestamp)")
        $lines.Add("- selected latest timestamp: $($reentry.Latest.SelectedLatestTimestamp)")
    }

    if ($reentry.Latest.LatestRun) {
        $lines.Add("- latest task: $(if ($reentry.Latest.LatestRun.Task) { $reentry.Latest.LatestRun.Task } else { '(none)' })")
        $lines.Add("- latest future: $(if ($reentry.Latest.LatestRun.Future) { $reentry.Latest.LatestRun.Future } else { '(none)' })")
        if ($reentry.Latest.LatestRun.AttemptSelection -and $reentry.Latest.LatestRun.AttemptSelection.SelectionNote) {
            $lines.Add("- latest attempt selection: $($reentry.Latest.LatestRun.AttemptSelection.SelectionNote)")
        }
        $lines.Add("- latest snapshot: $($reentry.Latest.Snapshot.SnapshotName)")
    }

    $lines.Add("- begin current work preview:")
    $lines.Add('```powershell')
    $lines.Add($reentry.BeginPreviewCommand)
    $lines.Add('```')
    $lines.Add("- begin current work run:")
    $lines.Add('```powershell')
    $lines.Add($reentry.BeginRunCommand)
    $lines.Add('```')
    $lines.Add("- starter command:")
    $lines.Add('```powershell')
    $lines.Add($reentry.StarterCommand)
    $lines.Add('```')
    $lines.Add("- direct run command:")
    $lines.Add('```powershell')
    $lines.Add($reentry.Scaffold.NextRun.ExampleCommand)
    $lines.Add('```')
    $lines.Add('')
}

$structureReentry = $context.StructureWorkReentry
if ($structureReentry) {
    $lines.Add('## Structure Work Reentry')
    $lines.Add("- run count: $($structureReentry.Latest.RunCount)")

    if ($structureReentry.Latest.RawLatestTimestamp -and $structureReentry.Latest.SelectedLatestTimestamp -and ($structureReentry.Latest.RawLatestTimestamp -ne $structureReentry.Latest.SelectedLatestTimestamp)) {
        $lines.Add("- raw latest timestamp: $($structureReentry.Latest.RawLatestTimestamp)")
        $lines.Add("- selected latest timestamp: $($structureReentry.Latest.SelectedLatestTimestamp)")
    }

    if ($structureReentry.Latest.LatestRun) {
        $lines.Add("- latest task: $(if ($structureReentry.Latest.LatestRun.Task) { $structureReentry.Latest.LatestRun.Task } else { '(none)' })")
        $lines.Add("- latest target: $(if ($structureReentry.Latest.LatestRun.Target) { $structureReentry.Latest.LatestRun.Target } else { '(none)' })")
        $lines.Add("- latest future: $(if ($structureReentry.Latest.LatestRun.Future) { $structureReentry.Latest.LatestRun.Future } else { '(none)' })")
        if ($structureReentry.Latest.LatestRun.AttemptSelection -and $structureReentry.Latest.LatestRun.AttemptSelection.SelectionNote) {
            $lines.Add("- latest attempt selection: $($structureReentry.Latest.LatestRun.AttemptSelection.SelectionNote)")
        }
        $lines.Add("- latest snapshot: $($structureReentry.Latest.Snapshot.SnapshotName)")
    }

    $lines.Add("- latest observation count: $($structureReentry.LatestObservation.Count)")
    if ($structureReentry.LatestObservation.LatestObservation) {
        $lines.Add("- latest observation target clearer: $(if ($null -ne $structureReentry.LatestObservation.LatestObservation.TargetFeltClearer) { $structureReentry.LatestObservation.LatestObservation.TargetFeltClearer } else { '(unknown)' })")
        $lines.Add("- latest observation next step nameable: $(if ($null -ne $structureReentry.LatestObservation.LatestObservation.NextStepFeltNameable) { $structureReentry.LatestObservation.LatestObservation.NextStepFeltNameable } else { '(unknown)' })")
        $lines.Add("- latest observation bridge stayed thin: $(if ($null -ne $structureReentry.LatestObservation.LatestObservation.BridgeStayedThin) { $structureReentry.LatestObservation.LatestObservation.BridgeStayedThin } else { '(unknown)' })")
    }
    $lines.Add("- observation memory status: $($structureReentry.ObservationAlignment.Status)")
    $lines.Add("- observation fully aligned: $($structureReentry.ObservationAlignment.FullyAligned)")
    $lines.Add("- memory history run-backed count: $($structureReentry.MemoryHistory.Summary.RunBackedObservationCount)")
    $lines.Add("- memory history fully aligned count: $($structureReentry.MemoryHistory.Summary.FullyAlignedCount)")
    $lines.Add("- memory history independent well count: $($structureReentry.MemoryHistory.Summary.IndependentWellCount)")
    $lines.Add("- memory history reading: $($structureReentry.MemoryHistory.Summary.MemoryReading)")
    $lines.Add("- memory history independent well role: $($structureReentry.MemoryHistory.Summary.IndependentWellRole)")
    $lines.Add("- memory history independent well presentation: $($structureReentry.MemoryHistory.Summary.IndependentWellPresentation)")
    $lines.Add("- memory history next question: $($structureReentry.MemoryHistory.Summary.NextQuestion)")
    if ($structureReentry.MemoryHandoffDelta) {
        $lines.Add("- latest entry handoff delta status: $($structureReentry.MemoryHandoffDelta.Status)")
        $lines.Add("- latest entry handoff run-backed delta: $($structureReentry.MemoryHandoffDelta.RunBackedObservationDelta)")
        $lines.Add("- latest entry handoff fully aligned delta: $($structureReentry.MemoryHandoffDelta.FullyAlignedDelta)")
        $lines.Add("- latest entry handoff independent well delta: $($structureReentry.MemoryHandoffDelta.IndependentWellDelta)")
        $lines.Add("- latest entry handoff delta next question: $($structureReentry.MemoryHandoffDelta.NextQuestion)")
    }
    $lines.Add("- memory history command:")
    $lines.Add('```powershell')
    $lines.Add($structureReentry.MemoryHistoryCommand)
    $lines.Add('```')

    $lines.Add("- next target: $($structureReentry.Scaffold.NextRun.Target)")
    $lines.Add("- begin structure work preview:")
    $lines.Add('```powershell')
    $lines.Add($structureReentry.BeginPreviewCommand)
    $lines.Add('```')
    $lines.Add("- begin structure work run:")
    $lines.Add('```powershell')
    $lines.Add($structureReentry.BeginRunCommand)
    $lines.Add('```')
    $lines.Add("- starter command:")
    $lines.Add('```powershell')
    $lines.Add($structureReentry.StarterCommand)
    $lines.Add('```')
    $lines.Add("- direct run command:")
    $lines.Add('```powershell')
    $lines.Add($structureReentry.Scaffold.NextRun.ExampleCommand)
    $lines.Add('```')
    $lines.Add('')
}

$lines.Add('## Notes')
foreach ($note in $context.Notes) {
    $lines.Add("- $note")
}

[System.String]::Join([Environment]::NewLine, $lines)
