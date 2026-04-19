[CmdletBinding()]
param(
    [string]$Task,

    [string]$FutureHint,

    [string]$Paused = 'false',

    [string]$QuestionsFeltLessBarehanded = 'false',

    [string]$RitualStayedSmall = 'true',

    [string]$Notes,

    [switch]$PreviewOnly,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$starterPath = Join-Path $PSScriptRoot 'start-next-current-opening.ps1'

if (-not (Test-Path -LiteralPath $starterPath)) {
    throw "Starter script not found: $starterPath"
}

$target = 'records/00_current_world.md'
$context = New-StartWorkContext -Task $Task -Target $target -WorkType 'current_update'
$reentry = $context.CurrentOpeningReentry

$resolvedFuture = if ($PSBoundParameters.ContainsKey('FutureHint')) {
    $FutureHint
}
elseif ($reentry -and $reentry.Scaffold -and $reentry.Scaffold.NextRun) {
    $reentry.Scaffold.NextRun.Future
}
else {
    $null
}

$briefSummary = [pscustomobject]@{
    Task = $context.Task
    Target = $context.Target
    WorkType = $context.WorkType
    ReadNow = @($context.ReadNow)
    LatestCurrentOpeningTask = if ($reentry -and $reentry.Latest -and $reentry.Latest.LatestRun) { $reentry.Latest.LatestRun.Task } else { $null }
    LatestCurrentOpeningFuture = if ($reentry -and $reentry.Latest -and $reentry.Latest.LatestRun) { $reentry.Latest.LatestRun.Future } else { $null }
    NextFuture = $resolvedFuture
}

if ($PreviewOnly) {
    if ($Format -eq 'json') {
        [pscustomobject]@{
            Brief = $briefSummary
            PreviewOnly = $true
            StarterCommand = if ($reentry) { $reentry.StarterCommand } else { $null }
        } | ConvertTo-Json -Depth 8
        return
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    $futureArg = if ($resolvedFuture) { " -FutureHint `"$resolvedFuture`"" } else { '' }
    $lines.Add('# Begin Current Work')
    $lines.Add('')
    $lines.Add('## Brief')
    $lines.Add("- task: $(if ($briefSummary.Task) { $briefSummary.Task } else { '(none)' })")
    $lines.Add("- target: $($briefSummary.Target)")
    $lines.Add("- work type: $($briefSummary.WorkType.Label) ($($briefSummary.WorkType.Name))")
    $lines.Add("- latest current opening task: $(if ($briefSummary.LatestCurrentOpeningTask) { $briefSummary.LatestCurrentOpeningTask } else { '(none)' })")
    $lines.Add("- latest current opening future: $(if ($briefSummary.LatestCurrentOpeningFuture) { $briefSummary.LatestCurrentOpeningFuture } else { '(none)' })")
    $lines.Add("- next future: $(if ($briefSummary.NextFuture) { $briefSummary.NextFuture } else { '(none)' })")
    $lines.Add('')
    $lines.Add('## Starter Command')
    $lines.Add('```powershell')
    $lines.Add("powershell -NoProfile -ExecutionPolicy Bypass -File `"$starterPath`" -TaskHint `"$Task`"$futureArg -Format markdown")
    $lines.Add('```')

    [System.String]::Join([Environment]::NewLine, $lines)
    return
}

$starterArgs = @{
    TaskHint = $Task
    Paused = $Paused
    QuestionsFeltLessBarehanded = $QuestionsFeltLessBarehanded
    RitualStayedSmall = $RitualStayedSmall
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
        Brief = $briefSummary
        PreviewOnly = $false
        Run = $runResult
    } | ConvertTo-Json -Depth 10
    return
}

$runMarkdown = & $starterPath @starterArgs

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Begin Current Work')
$lines.Add('')
$lines.Add('## Brief')
$lines.Add("- task: $(if ($briefSummary.Task) { $briefSummary.Task } else { '(none)' })")
$lines.Add("- target: $($briefSummary.Target)")
$lines.Add("- work type: $($briefSummary.WorkType.Label) ($($briefSummary.WorkType.Name))")
$lines.Add("- latest current opening task: $(if ($briefSummary.LatestCurrentOpeningTask) { $briefSummary.LatestCurrentOpeningTask } else { '(none)' })")
$lines.Add("- latest current opening future: $(if ($briefSummary.LatestCurrentOpeningFuture) { $briefSummary.LatestCurrentOpeningFuture } else { '(none)' })")
$lines.Add("- next future: $(if ($briefSummary.NextFuture) { $briefSummary.NextFuture } else { '(none)' })")
$lines.Add('')
$lines.Add('## Opening Run')
$lines.Add($runMarkdown)

[System.String]::Join([Environment]::NewLine, $lines)
