[CmdletBinding()]
param(
    [string]$TaskHint,

    [string]$TargetHint,

    [string]$FutureHint,

    [string]$TargetFeltClearer = 'false',

    [string]$NextStepFeltNameable = 'false',

    [string]$BridgeStayedThin = 'true',

    [string]$Notes,

    [switch]$SaveObservation = $true,

    [switch]$SaveRun = $true,

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

$runScript = Join-Path $PSScriptRoot 'run-structure-work.ps1'

if (-not (Test-Path -LiteralPath $runScript)) {
    throw "Run structure work script not found: $runScript"
}

$scaffold = Get-NextStructureWorkScaffoldData -TaskHint $TaskHint -TargetHint $TargetHint -FutureHint $FutureHint

$targetFeltClearerValue = ConvertTo-LooseBoolean -Value $TargetFeltClearer -Default $false
$nextStepFeltNameableValue = ConvertTo-LooseBoolean -Value $NextStepFeltNameable -Default $false
$bridgeStayedThinValue = ConvertTo-LooseBoolean -Value $BridgeStayedThin -Default $true

$runArgs = @{
    Task = $scaffold.NextRun.Task
    Target = $scaffold.NextRun.Target
    Future = $scaffold.NextRun.Future
    TargetFeltClearer = $targetFeltClearerValue
    NextStepFeltNameable = $nextStepFeltNameableValue
    BridgeStayedThin = $bridgeStayedThinValue
    Format = $Format
}

if ($PSBoundParameters.ContainsKey('Notes')) {
    $runArgs.Notes = $Notes
}

if ($SaveObservation) {
    $runArgs.SaveObservation = $true
}

if ($SaveRun) {
    $runArgs.SaveRun = $true
}

& $runScript @runArgs
