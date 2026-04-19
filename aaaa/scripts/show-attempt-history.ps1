[CmdletBinding()]
param(
    [string]$Task,

    [string]$Target,

    [int]$MaxAttempts = 0,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$targetRelativePath = Normalize-RelativePath -InputPath $Target
$history = Get-RelevantStartupAttempts -Task $Task -TargetRelativePath $targetRelativePath -MaxAttempts $MaxAttempts

if ($Format -eq 'json') {
    $history | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Attempt History')
$lines.Add('')

if ($history.Stance) {
    $lines.Add("## Stance")
    $lines.Add("- $($history.Stance)")
    if ($history.SelectionNote) {
        $lines.Add("- selection: $($history.SelectionNote)")
    }
    $lines.Add('')
}

$lines.Add('## Attempts')
foreach ($attempt in $history.Attempts) {
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

[System.String]::Join([Environment]::NewLine, $lines)
