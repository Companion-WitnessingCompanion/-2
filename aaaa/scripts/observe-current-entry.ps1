[CmdletBinding()]
param(
    [string]$Future,

    [bool]$Paused = $false,

    [bool]$QuestionsFeltLessBarehanded = $false,

    [bool]$RitualStayedSmall = $true,

    [string]$Notes,

    [switch]$Save,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$workspaceRoot = Get-WorkspaceRoot
$startupModel = Get-StartupModel
$currentPath = Join-Path $workspaceRoot 'records\00_current_world.md'
$observationsPath = Join-Path $PSScriptRoot 'data\current-entry-observations.json'

if (-not (Test-Path -LiteralPath $currentPath)) {
    throw "Current file not found: $currentPath"
}

if (-not (Test-Path -LiteralPath $observationsPath)) {
    throw "Observation store not found: $observationsPath"
}

$currentContent = Get-Content -LiteralPath $currentPath -Encoding UTF8 -Raw
$entrySections = Get-CurrentEntrySections -Content $currentContent
$activeQuestions = @($entrySections.ActiveQuestions)

$observation = [ordered]@{
    Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    Future = $Future
    Paused = $Paused
    QuestionsFeltLessBarehanded = $QuestionsFeltLessBarehanded
    RitualStayedSmall = $RitualStayedSmall
    Notes = $Notes
}

if ($Save) {
    $null = Append-JsonArrayStoreItem -Path $observationsPath -Item ([pscustomobject]$observation)
}

$result = [pscustomobject]@{
    CurrentFile = 'records/00_current_world.md'
    EntryRitual = @($startupModel.EntryRitual)
    ActiveQuestions = @($activeQuestions)
    ObservationChecks = @(
        'Did a future come forward before the active questions?'
        'Did you pause one more time before answering?'
        'Did the three ritual lines stay small rather than become a new center?'
        'Did the active questions feel less barehanded than before?'
    )
    Observation = [pscustomobject]$observation
    Saved = [bool]$Save
}

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Current Entry Observation')
$lines.Add('')
$lines.Add('## File')
$lines.Add("- $($result.CurrentFile)")
$lines.Add('')
$lines.Add('## Entry Ritual')
foreach ($item in $result.EntryRitual) {
    $lines.Add("- $item")
}
$lines.Add('')
$lines.Add('## Active Questions')
foreach ($item in $result.ActiveQuestions) {
    $lines.Add("- $item")
}
$lines.Add('')
$lines.Add('## Observation Checks')
foreach ($item in $result.ObservationChecks) {
    $lines.Add("- $item")
}
$lines.Add('')
$lines.Add('## Observation')
$lines.Add("- timestamp: $($result.Observation.Timestamp)")
$lines.Add("- future: $(if ($result.Observation.Future) { $result.Observation.Future } else { '(none yet)' })")
$lines.Add("- paused: $($result.Observation.Paused)")
$lines.Add("- questions less barehanded: $($result.Observation.QuestionsFeltLessBarehanded)")
$lines.Add("- ritual stayed small: $($result.Observation.RitualStayedSmall)")
$lines.Add("- notes: $(if ($result.Observation.Notes) { $result.Observation.Notes } else { '(none)' })")
$lines.Add('')
$lines.Add("- saved: $($result.Saved)")

[System.String]::Join([Environment]::NewLine, $lines)
