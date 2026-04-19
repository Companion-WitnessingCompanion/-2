[CmdletBinding()]
param(
    [string]$Task,

    [string]$Target,

    [string]$FutureHint,

    [string]$TargetFeltClearer = 'false',

    [string]$NextStepFeltNameable = 'false',

    [string]$BridgeStayedThin = 'true',

    [string]$Notes,

    [switch]$PreviewOnly,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$starterPath = Join-Path $PSScriptRoot 'start-next-structure-work.ps1'

if (-not (Test-Path -LiteralPath $starterPath)) {
    throw "Starter script not found: $starterPath"
}

$context = New-StartWorkContext -Task $Task -Target $Target -WorkType 'structure_reset'
$effectiveTarget = if ($context.Target) { $context.Target } else { $Target }
$resolvedFuture = if ($PSBoundParameters.ContainsKey('FutureHint')) { $FutureHint } else { $null }
$structureMemoryHandoff = Get-StructureMemoryHandoffData -StructureWorkReentry $context.StructureWorkReentry

$summary = [pscustomobject]@{
    Task = $context.Task
    Target = $effectiveTarget
    WorkType = $context.WorkType
    ReadNow = @($context.ReadNow)
    RecalledFuture = $resolvedFuture
    StructureMemoryHandoff = $structureMemoryHandoff
}

if ($PreviewOnly) {
    if ($Format -eq 'json') {
        [pscustomobject]@{
            PreviewOnly = $true
            Brief = $summary
            StarterCommand = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$starterPath`" -TaskHint `"$($summary.Task)`" -TargetHint `"$($summary.Target)`" -FutureHint `"$($summary.RecalledFuture)`" -Format json"
        } | ConvertTo-Json -Depth 8
        return
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('# Begin Structure Work')
    $lines.Add('')
    $lines.Add('## Brief')
    $lines.Add("- task: $(if ($summary.Task) { $summary.Task } else { '(none)' })")
    $lines.Add("- target: $(if ($summary.Target) { $summary.Target } else { '(none)' })")
    $lines.Add("- work type: $($summary.WorkType.Label) ($($summary.WorkType.Name))")
    $lines.Add("- recalled future: $(if ($summary.RecalledFuture) { $summary.RecalledFuture } else { '(none)' })")
    $lines.Add('')
    $lines.Add('## Read Now')
    foreach ($path in $summary.ReadNow) {
        $lines.Add("- $path")
    }

    if ($summary.StructureMemoryHandoff) {
        $lines.Add('')
        $lines.Add('## Structure Memory Handoff')
        $lines.Add("- run-backed observation count: $($summary.StructureMemoryHandoff.RunBackedObservationCount)")
        $lines.Add("- fully aligned count: $($summary.StructureMemoryHandoff.FullyAlignedCount)")
        $lines.Add("- independent well count: $($summary.StructureMemoryHandoff.IndependentWellCount)")
        $lines.Add("- memory reading: $($summary.StructureMemoryHandoff.MemoryReading)")
        $lines.Add("- independent well role: $($summary.StructureMemoryHandoff.IndependentWellRole)")
        $lines.Add("- next question: $($summary.StructureMemoryHandoff.NextQuestion)")
    }

    $lines.Add('')
    $lines.Add('## Starter Command')
    $lines.Add('```powershell')
    $lines.Add("powershell -NoProfile -ExecutionPolicy Bypass -File `"$starterPath`" -TaskHint `"$($summary.Task)`" -TargetHint `"$($summary.Target)`" -FutureHint `"$($summary.RecalledFuture)`" -Format markdown")
    $lines.Add('```')

    [System.String]::Join([Environment]::NewLine, $lines)
    return
}

$starterArgs = @{
    TaskHint = $summary.Task
    TargetHint = $summary.Target
    TargetFeltClearer = $TargetFeltClearer
    NextStepFeltNameable = $NextStepFeltNameable
    BridgeStayedThin = $BridgeStayedThin
    Format = $Format
}

if ($resolvedFuture) {
    $starterArgs.FutureHint = $resolvedFuture
}

if ($PSBoundParameters.ContainsKey('Notes')) {
    $starterArgs.Notes = $Notes
}

if ($Format -eq 'json') {
    $runResult = & $starterPath @starterArgs | ConvertFrom-Json

    [pscustomobject]@{
        PreviewOnly = $false
        Brief = $summary
        Run = $runResult
    } | ConvertTo-Json -Depth 10
    return
}

$runMarkdown = & $starterPath @starterArgs

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Begin Structure Work')
$lines.Add('')
$lines.Add('## Brief')
$lines.Add("- task: $(if ($summary.Task) { $summary.Task } else { '(none)' })")
$lines.Add("- target: $(if ($summary.Target) { $summary.Target } else { '(none)' })")
$lines.Add("- work type: $($summary.WorkType.Label) ($($summary.WorkType.Name))")
$lines.Add("- recalled future: $(if ($summary.RecalledFuture) { $summary.RecalledFuture } else { '(none)' })")

if ($summary.StructureMemoryHandoff) {
    $lines.Add('')
    $lines.Add('## Structure Memory Handoff')
    $lines.Add("- run-backed observation count: $($summary.StructureMemoryHandoff.RunBackedObservationCount)")
    $lines.Add("- fully aligned count: $($summary.StructureMemoryHandoff.FullyAlignedCount)")
    $lines.Add("- independent well count: $($summary.StructureMemoryHandoff.IndependentWellCount)")
    $lines.Add("- memory reading: $($summary.StructureMemoryHandoff.MemoryReading)")
    $lines.Add("- independent well role: $($summary.StructureMemoryHandoff.IndependentWellRole)")
    $lines.Add("- next question: $($summary.StructureMemoryHandoff.NextQuestion)")
}

$lines.Add('')
$lines.Add('## Structure Run')
$lines.Add($runMarkdown)

[System.String]::Join([Environment]::NewLine, $lines)
