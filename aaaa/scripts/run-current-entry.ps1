[CmdletBinding()]
param(
    [string]$Task,

    [string]$Future,

    [bool]$Paused = $false,

    [bool]$QuestionsFeltLessBarehanded = $false,

    [bool]$RitualStayedSmall = $true,

    [string]$Notes,

    [switch]$SaveObservation,

    [switch]$SaveRun,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

function Convert-CurrentOpeningRunToMarkdown {
    param(
        [object]$Run
    )

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('# Current Opening Run')
    $lines.Add('')

    if ($Run.Task) {
        $lines.Add('## Task')
        $lines.Add("- $($Run.Task)")
        $lines.Add('')
    }

    $lines.Add('## Current File')
    $lines.Add("- $($Run.CurrentFile)")
    $lines.Add('')

    $lines.Add('## Work Type')
    $lines.Add("- $($Run.WorkType.Label) ($($Run.WorkType.Name))")
    if ($Run.WorkType.Description) {
        $lines.Add("- $($Run.WorkType.Description)")
    }
    $lines.Add('')

    $lines.Add('## Silent Pause')
    $lines.Add("- $($Run.SilentPause)")
    $lines.Add('')

    $lines.Add('## Entry Ritual')
    foreach ($line in $Run.EntryRitual) {
        $lines.Add("- $line")
    }
    $lines.Add('')

    $lines.Add('## Recalled Future')
    $lines.Add("- $(if ($Run.RecalledFuture) { $Run.RecalledFuture } else { '(choose one before entering if needed)' })")
    $lines.Add('')

    $lines.Add('## Active Questions')
    foreach ($question in $Run.ActiveQuestions) {
        $lines.Add("- $question")
    }
    $lines.Add('')

    $lines.Add('## Read Now')
    foreach ($path in $Run.ReadNow) {
        $lines.Add("- $path")
    }
    $lines.Add('')

    $lines.Add('## Live Attempt Layer')
    if ($Run.AttemptSelection -and $Run.AttemptSelection.SelectionNote) {
        $lines.Add("- selection: $($Run.AttemptSelection.SelectionNote)")
    }
    foreach ($attempt in $Run.AttemptHistory) {
        $lines.Add("- [$($attempt.Id)] $($attempt.Title) ($($attempt.Status))")
        $lines.Add("  - why: $($attempt.WhyStarted)")
        foreach ($item in $attempt.NextAttempt) {
            $lines.Add("  - next: $item")
        }
    }
    $lines.Add('')

    $lines.Add('## Observation Checks')
    foreach ($check in $Run.ObservationChecks) {
        $lines.Add("- $check")
    }
    $lines.Add('')

    $lines.Add('## Observation')
    $lines.Add("- timestamp: $($Run.Observation.Timestamp)")
    $lines.Add("- future: $(if ($Run.Observation.Future) { $Run.Observation.Future } else { '(none yet)' })")
    $lines.Add("- paused: $($Run.Observation.Paused)")
    $lines.Add("- questions less barehanded: $($Run.Observation.QuestionsFeltLessBarehanded)")
    $lines.Add("- ritual stayed small: $($Run.Observation.RitualStayedSmall)")
    $lines.Add("- notes: $(if ($Run.Observation.Notes) { $Run.Observation.Notes } else { '(none)' })")
    $lines.Add("- observation saved: $($Run.ObservationSaved)")
    $lines.Add("- run saved: $($Run.RunSaved)")

    if ($Run.SnapshotPath) {
        $lines.Add("- snapshot path: $($Run.SnapshotPath)")
    }

    return [System.String]::Join([Environment]::NewLine, $lines)
}

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$currentRelativePath = 'records/00_current_world.md'
$workspaceRoot = Get-WorkspaceRoot
$currentPath = Join-Path $workspaceRoot 'records\00_current_world.md'
$observeScriptPath = Join-Path $PSScriptRoot 'observe-current-entry.ps1'
$runStorePath = Join-Path $PSScriptRoot 'data\current-opening-runs.json'
$snapshotDir = Join-Path $PSScriptRoot 'data\current-opening-run-snapshots'

if (-not (Test-Path -LiteralPath $currentPath)) {
    throw "Current file not found: $currentPath"
}

if (-not (Test-Path -LiteralPath $observeScriptPath)) {
    throw "Observation script not found: $observeScriptPath"
}

if (-not (Test-Path -LiteralPath $runStorePath)) {
    throw "Current opening run store not found: $runStorePath"
}

$context = New-StartWorkContext -Task $Task -Target $currentRelativePath -WorkType 'current_update'
$currentContent = Get-Content -LiteralPath $currentPath -Encoding UTF8 -Raw
$entrySections = Get-CurrentEntrySections -Content $currentContent -RelativePath $currentRelativePath

$observeArgs = @{
    Paused = $Paused
    QuestionsFeltLessBarehanded = $QuestionsFeltLessBarehanded
    RitualStayedSmall = $RitualStayedSmall
    Format = 'json'
}

if ($PSBoundParameters.ContainsKey('Future')) {
    $observeArgs.Future = $Future
}

if ($PSBoundParameters.ContainsKey('Notes')) {
    $observeArgs.Notes = $Notes
}

if ($SaveObservation) {
    $observeArgs.Save = $true
}

$observationResult = & $observeScriptPath @observeArgs | ConvertFrom-Json
$attempts = @($context.AttemptHistory.Attempts)
$attemptSelection = [pscustomobject]@{
    SelectionMode = $context.AttemptHistory.SelectionMode
    MaxAttempts = $context.AttemptHistory.MaxAttempts
    TotalMatches = $context.AttemptHistory.TotalMatches
    ShownCount = $context.AttemptHistory.ShownCount
    HiddenCount = $context.AttemptHistory.HiddenCount
    SelectionNote = $context.AttemptHistory.SelectionNote
}

$result = [pscustomobject]@{
    CurrentFile = $currentRelativePath
    Task = $Task
    WorkType = $context.WorkType
    SilentPause = if ($context.Notes.Count -gt 0) { $context.Notes[0] } else { $null }
    EntryRitual = @($context.EntryRitual)
    RecalledFuture = if ($Future) { $Future } else { $null }
    ActiveQuestions = @($entrySections.ActiveQuestions)
    ReadNow = @($context.ReadNow)
    AttemptHistory = @(
        $attempts | ForEach-Object {
            [pscustomobject]@{
                Id = $_.Id
                Title = $_.Title
                Status = $_.Status
                WhyStarted = $_.WhyStarted
                NextAttempt = @($_.NextAttempt)
            }
        }
    )
    AttemptSelection = $attemptSelection
    ObservationChecks = @($observationResult.ObservationChecks)
    Observation = $observationResult.Observation
    ObservationSaved = [bool]$observationResult.Saved
    RunSaved = $false
    SnapshotPath = $null
}

if ($SaveRun) {
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    if (-not (Test-Path -LiteralPath $snapshotDir)) {
        $null = New-Item -ItemType Directory -Path $snapshotDir -Force
    }

    $snapshotFileName = "current-opening-run-$timestamp.md"
    $snapshotPath = Join-Path $snapshotDir $snapshotFileName
    $snapshotRelativePath = Normalize-RelativePath -InputPath $snapshotPath

    $result.RunSaved = $true
    $result.SnapshotPath = $snapshotRelativePath

    $runRecord = [pscustomobject]@{
        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        Task = $Task
        CurrentFile = $currentRelativePath
        WorkType = [pscustomobject]@{
            Name = $context.WorkType.Name
            Label = $context.WorkType.Label
        }
        SilentPause = $result.SilentPause
        EntryRitual = @($context.EntryRitual)
        RecalledFuture = if ($Future) { $Future } else { $null }
        ActiveQuestions = @($entrySections.ActiveQuestions)
        ReadNow = @($context.ReadNow)
        AttemptIds = @($attempts | ForEach-Object { $_.Id })
        AttemptSelection = $result.AttemptSelection
        Observation = $result.Observation
        ObservationSaved = [bool]$result.ObservationSaved
        SnapshotPath = $snapshotRelativePath
    }

    $snapshotRun = [pscustomobject]@{
        CurrentFile = $result.CurrentFile
        Task = $result.Task
        WorkType = $result.WorkType
        SilentPause = $result.SilentPause
        EntryRitual = $result.EntryRitual
        RecalledFuture = $result.RecalledFuture
        ActiveQuestions = $result.ActiveQuestions
        ReadNow = $result.ReadNow
        AttemptHistory = $result.AttemptHistory
        AttemptSelection = $result.AttemptSelection
        ObservationChecks = $result.ObservationChecks
        Observation = $result.Observation
        ObservationSaved = $result.ObservationSaved
        RunSaved = $result.RunSaved
        SnapshotPath = $result.SnapshotPath
    }

    $snapshotMarkdown = Convert-CurrentOpeningRunToMarkdown -Run $snapshotRun
    [System.IO.File]::WriteAllText($snapshotPath, $snapshotMarkdown + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
    $null = Append-JsonArrayStoreItem -Path $runStorePath -Item $runRecord
}

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

Convert-CurrentOpeningRunToMarkdown -Run $result
