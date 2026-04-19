[CmdletBinding()]
param(
    [string]$Target = 'records/ideal_code_foundation_v1.md',

    [string]$Future,

    [string]$TargetFeltClearer = 'false',

    [string]$NextStepFeltNameable = 'false',

    [string]$BridgeStayedThin = 'true',

    [string]$Notes,

    [switch]$Save,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

function ConvertTo-LooseBoolean {
    param(
        [object]$Value,
        [bool]$Default = $false
    )

    if ($null -eq $Value) {
        return $Default
    }

    if ($Value -is [bool]) {
        return [bool]$Value
    }

    $text = "$Value".Trim().ToLowerInvariant()

    if ([string]::IsNullOrWhiteSpace($text)) {
        return $Default
    }

    switch ($text) {
        'true' { return $true }
        '$true' { return $true }
        '1' { return $true }
        'yes' { return $true }
        'y' { return $true }
        'false' { return $false }
        '$false' { return $false }
        '0' { return $false }
        'no' { return $false }
        'n' { return $false }
        default { return $Default }
    }
}

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$targetRelativePath = Normalize-RelativePath -InputPath $Target
if (-not $targetRelativePath) {
    $targetRelativePath = $Target
}

$workspaceRoot = Get-WorkspaceRoot
$targetPath = Join-Path $workspaceRoot $targetRelativePath
$observationsPath = Get-StructureWorkObservationStorePath
$context = New-StartWorkContext -Task 'structure observation' -Target $targetRelativePath -WorkType 'structure_reset'

if (-not (Test-Path -LiteralPath $targetPath)) {
    throw "Structure target file not found: $targetPath"
}

if (-not (Test-Path -LiteralPath $observationsPath)) {
    Write-JsonArrayStore -Path $observationsPath -Items @()
}

$targetFeltClearerValue = ConvertTo-LooseBoolean -Value $TargetFeltClearer -Default $false
$nextStepFeltNameableValue = ConvertTo-LooseBoolean -Value $NextStepFeltNameable -Default $false
$bridgeStayedThinValue = ConvertTo-LooseBoolean -Value $BridgeStayedThin -Default $true

$observation = [ordered]@{
    Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    Target = $targetRelativePath
    Future = $Future
    TargetFeltClearer = $targetFeltClearerValue
    NextStepFeltNameable = $nextStepFeltNameableValue
    BridgeStayedThin = $bridgeStayedThinValue
    Notes = $Notes
}

if ($Save) {
    $null = Append-JsonArrayStoreItem -Path $observationsPath -Item ([pscustomobject]$observation)
}

$result = [pscustomobject]@{
    Target = $targetRelativePath
    WorkType = $context.WorkType
    ReadNow = @($context.ReadNow)
    ActiveQuestions = @($context.ActiveQuestions)
    ObservationChecks = @(
        'Did the target structure feel clearer after this run?'
        'Did the next structure step become easier to name?'
        'Did the structure bridge stay thin instead of becoming a new doctrine?'
    )
    Observation = [pscustomobject]$observation
    Saved = [bool]$Save
}

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Structure Work Observation')
$lines.Add('')
$lines.Add('## Target')
$lines.Add("- $($result.Target)")
$lines.Add('')
$lines.Add('## Work Type')
$lines.Add("- $($result.WorkType.Label) ($($result.WorkType.Name))")
$lines.Add('')
$lines.Add('## Read Now')
foreach ($item in $result.ReadNow) {
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
$lines.Add("- target felt clearer: $($result.Observation.TargetFeltClearer)")
$lines.Add("- next step felt nameable: $($result.Observation.NextStepFeltNameable)")
$lines.Add("- bridge stayed thin: $($result.Observation.BridgeStayedThin)")
$lines.Add("- notes: $(if ($result.Observation.Notes) { $result.Observation.Notes } else { '(none)' })")
$lines.Add('')
$lines.Add("- saved: $($result.Saved)")

[System.String]::Join([Environment]::NewLine, $lines)
