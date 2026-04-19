[CmdletBinding()]
param(
    [string]$Task,

    [string]$Target,

    [string]$WorkType,

    [string]$FutureHint,

    [string]$Paused = 'false',

    [string]$QuestionsFeltLessBarehanded = 'false',

    [string]$RitualStayedSmall = 'true',

    [string]$Notes,

    [string]$TargetFeltClearer = 'false',

    [string]$NextStepFeltNameable = 'false',

    [string]$BridgeStayedThin = 'true',

    [switch]$PreviewOnly,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$startWorkPath = Join-Path $PSScriptRoot 'start-work.ps1'
$beginCurrentWorkPath = Join-Path $PSScriptRoot 'begin-current-work.ps1'
$beginStructureWorkPath = Join-Path $PSScriptRoot 'begin-structure-work.ps1'

if (-not (Test-Path -LiteralPath $startWorkPath)) {
    throw "Start work script not found: $startWorkPath"
}

if (-not (Test-Path -LiteralPath $beginCurrentWorkPath)) {
    throw "Begin current work script not found: $beginCurrentWorkPath"
}

if (-not (Test-Path -LiteralPath $beginStructureWorkPath)) {
    throw "Begin structure work script not found: $beginStructureWorkPath"
}

$context = New-StartWorkContext -Task $Task -Target $Target -WorkType $WorkType
$effectiveTarget = if ($context.Target) { $context.Target } else { $Target }
$effectiveFuture = if ($PSBoundParameters.ContainsKey('FutureHint')) {
    $FutureHint
}
elseif ($context.CurrentOpeningReentry -and $context.CurrentOpeningReentry.Scaffold -and $context.CurrentOpeningReentry.Scaffold.NextRun) {
    $context.CurrentOpeningReentry.Scaffold.NextRun.Future
}
else {
    $null
}

if ($context.WorkType.Name -eq 'current_update') {
    $currentArgs = @{
        Task = $Task
        Format = $Format
        Paused = $Paused
        QuestionsFeltLessBarehanded = $QuestionsFeltLessBarehanded
        RitualStayedSmall = $RitualStayedSmall
    }

    if ($effectiveFuture) {
        $currentArgs.FutureHint = $effectiveFuture
    }

    if ($PSBoundParameters.ContainsKey('Notes')) {
        $currentArgs.Notes = $Notes
    }

    if ($PreviewOnly) {
        $currentArgs.PreviewOnly = $true
    }

    & $beginCurrentWorkPath @currentArgs
    return
}

if ($context.WorkType.Name -eq 'structure_reset') {
    $structureArgs = @{
        Task = $Task
        Target = $effectiveTarget
        TargetFeltClearer = $TargetFeltClearer
        NextStepFeltNameable = $NextStepFeltNameable
        BridgeStayedThin = $BridgeStayedThin
        Format = $Format
    }

    if ($effectiveFuture) {
        $structureArgs.FutureHint = $effectiveFuture
    }

    if ($PSBoundParameters.ContainsKey('Notes')) {
        $structureArgs.Notes = $Notes
    }

    if ($PreviewOnly) {
        $structureArgs.PreviewOnly = $true
    }

    & $beginStructureWorkPath @structureArgs
    return
}

if ($Format -eq 'json') {
    [pscustomobject]@{
        Mode = 'brief_only'
        PreviewOnly = [bool]$PreviewOnly
        Brief = $context
        Notes = @(
            'Execution bridging currently exists for current_update and structure_reset.',
            'This work type still begins from start-work brief and then continues by hand.'
        )
    } | ConvertTo-Json -Depth 10
    return
}

$briefMarkdown = & $startWorkPath -Task $Task -Target $effectiveTarget -WorkType $context.WorkType.Name -Format markdown

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Begin Work')
$lines.Add('')
$lines.Add("- mode: brief_only")
$lines.Add("- work type: $($context.WorkType.Label) ($($context.WorkType.Name))")
$lines.Add("- target: $(if ($effectiveTarget) { $effectiveTarget } else { '(none)' })")
$lines.Add("- note: execution bridging currently exists for current_update and structure_reset.")
$lines.Add('')
$lines.Add('## Start Work Brief')
$lines.Add($briefMarkdown)

[System.String]::Join([Environment]::NewLine, $lines)
