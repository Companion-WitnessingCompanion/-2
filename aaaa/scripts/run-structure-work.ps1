[CmdletBinding()]
param(
    [string]$Task,

    [string]$Target = 'records/ideal_code_foundation_v1.md',

    [string]$Future,

    [bool]$TargetFeltClearer = $false,

    [bool]$NextStepFeltNameable = $false,

    [bool]$BridgeStayedThin = $true,

    [string]$Notes,

    [switch]$SaveObservation,

    [switch]$SaveRun,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

function Convert-StructureWorkRunToMarkdown {
    param(
        [object]$Run
    )

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('# Structure Work Run')
    $lines.Add('')

    if ($Run.Task) {
        $lines.Add('## Task')
        $lines.Add("- $($Run.Task)")
        $lines.Add('')
    }

    $lines.Add('## Target')
    $lines.Add("- $($Run.Target)")
    $lines.Add('')

    $lines.Add('## Work Type')
    $lines.Add("- $($Run.WorkType.Label) ($($Run.WorkType.Name))")
    if ($Run.WorkType.Description) {
        $lines.Add("- $($Run.WorkType.Description)")
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

    if ($Run.StructureMemoryHandoff) {
        $lines.Add('## Structure Memory Handoff')
        $lines.Add("- run-backed observation count: $($Run.StructureMemoryHandoff.RunBackedObservationCount)")
        $lines.Add("- fully aligned count: $($Run.StructureMemoryHandoff.FullyAlignedCount)")
        $lines.Add("- independent well count: $($Run.StructureMemoryHandoff.IndependentWellCount)")
        $lines.Add("- memory reading: $($Run.StructureMemoryHandoff.MemoryReading)")
        $lines.Add("- independent well role: $($Run.StructureMemoryHandoff.IndependentWellRole)")
        $lines.Add("- next question: $($Run.StructureMemoryHandoff.NextQuestion)")
        $lines.Add('')
    }

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
    $lines.Add("- target felt clearer: $($Run.Observation.TargetFeltClearer)")
    $lines.Add("- next step felt nameable: $($Run.Observation.NextStepFeltNameable)")
    $lines.Add("- bridge stayed thin: $($Run.Observation.BridgeStayedThin)")
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

$targetRelativePath = Normalize-RelativePath -InputPath $Target
if (-not $targetRelativePath) {
    $targetRelativePath = $Target
}

$targetPath = Join-Path (Get-WorkspaceRoot) $targetRelativePath
$observeScriptPath = Join-Path $PSScriptRoot 'observe-structure-work.ps1'
$runStorePath = Get-StructureWorkRunStorePath
$snapshotDir = Get-StructureWorkSnapshotDirectory

if (-not (Test-Path -LiteralPath $targetPath)) {
    throw "Structure target not found: $targetPath"
}

if (-not (Test-Path -LiteralPath $observeScriptPath)) {
    throw "Observe structure work script not found: $observeScriptPath"
}

if (-not (Test-Path -LiteralPath $runStorePath)) {
    throw "Structure work run store not found: $runStorePath"
}

$context = New-StartWorkContext -Task $Task -Target $targetRelativePath -WorkType 'structure_reset'
$attempts = @($context.AttemptHistory.Attempts)
$attemptSelection = [pscustomobject]@{
    SelectionMode = $context.AttemptHistory.SelectionMode
    MaxAttempts = $context.AttemptHistory.MaxAttempts
    TotalMatches = $context.AttemptHistory.TotalMatches
    ShownCount = $context.AttemptHistory.ShownCount
    HiddenCount = $context.AttemptHistory.HiddenCount
    SelectionNote = $context.AttemptHistory.SelectionNote
}
$structureMemoryHandoff = Get-StructureMemoryHandoffData -StructureWorkReentry $context.StructureWorkReentry

$observeArgs = @{
    Target = $targetRelativePath
    TargetFeltClearer = $TargetFeltClearer
    NextStepFeltNameable = $NextStepFeltNameable
    BridgeStayedThin = $BridgeStayedThin
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

$result = [pscustomobject]@{
    Target = $targetRelativePath
    Task = $Task
    WorkType = $context.WorkType
    RecalledFuture = if ($Future) { $Future } else { $null }
    ActiveQuestions = @($context.ActiveQuestions)
    ReadNow = @($context.ReadNow)
    StructureMemoryHandoff = $structureMemoryHandoff
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

    $snapshotFileName = "structure-work-run-$timestamp.md"
    $snapshotPath = Join-Path $snapshotDir $snapshotFileName
    $snapshotRelativePath = Normalize-RelativePath -InputPath $snapshotPath

    $result.RunSaved = $true
    $result.SnapshotPath = $snapshotRelativePath

    $runRecord = [pscustomobject]@{
        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        Task = $Task
        Target = $targetRelativePath
        WorkType = [pscustomobject]@{
            Name = $context.WorkType.Name
            Label = $context.WorkType.Label
        }
        RecalledFuture = if ($Future) { $Future } else { $null }
        ActiveQuestions = @($context.ActiveQuestions)
        ReadNow = @($context.ReadNow)
        AttemptIds = @($attempts | ForEach-Object { $_.Id })
        AttemptSelection = $result.AttemptSelection
        StructureMemoryHandoff = $result.StructureMemoryHandoff
        Observation = $result.Observation
        ObservationSaved = [bool]$result.ObservationSaved
        Notes = $Notes
        SnapshotPath = $snapshotRelativePath
    }

    $snapshotRun = [pscustomobject]@{
        Target = $result.Target
        Task = $result.Task
        WorkType = $result.WorkType
        RecalledFuture = $result.RecalledFuture
        ActiveQuestions = $result.ActiveQuestions
        ReadNow = $result.ReadNow
        StructureMemoryHandoff = $result.StructureMemoryHandoff
        AttemptHistory = $result.AttemptHistory
        AttemptSelection = $result.AttemptSelection
        ObservationChecks = $result.ObservationChecks
        Observation = $result.Observation
        ObservationSaved = $result.ObservationSaved
        RunSaved = $result.RunSaved
        SnapshotPath = $result.SnapshotPath
    }

    $snapshotMarkdown = Convert-StructureWorkRunToMarkdown -Run $snapshotRun
    [System.IO.File]::WriteAllText($snapshotPath, $snapshotMarkdown + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
    $null = Append-JsonArrayStoreItem -Path $runStorePath -Item $runRecord
}

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

Convert-StructureWorkRunToMarkdown -Run $result
