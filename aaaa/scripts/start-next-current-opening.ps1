[CmdletBinding()]
param(
    [string]$TaskHint,

    [string]$FutureHint,

    [string]$Paused = 'false',

    [string]$QuestionsFeltLessBarehanded = 'false',

    [string]$RitualStayedSmall = 'true',

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

$runScript = Join-Path $PSScriptRoot 'run-current-entry.ps1'

if (-not (Test-Path -LiteralPath $runScript)) {
    throw "Run current entry script not found: $runScript"
}

$scaffold = Get-NextCurrentOpeningScaffoldData -TaskHint $TaskHint -FutureHint $FutureHint

$pausedValue = ConvertTo-LooseBoolean -Value $Paused -Default $false
$lessBarehandedValue = ConvertTo-LooseBoolean -Value $QuestionsFeltLessBarehanded -Default $false
$ritualStayedSmallValue = ConvertTo-LooseBoolean -Value $RitualStayedSmall -Default $true

$runArgs = @{
    Task = $scaffold.NextRun.Task
    Future = $scaffold.NextRun.Future
    Paused = $pausedValue
    QuestionsFeltLessBarehanded = $lessBarehandedValue
    RitualStayedSmall = $ritualStayedSmallValue
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
