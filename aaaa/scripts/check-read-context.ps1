[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Target,

    [string]$WorkType
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$readContext = Get-ReadContextData -Target $Target -WorkType $WorkType

Write-Output "Target: $($readContext.Target)"
Write-Output ""
Write-Output "Current candidates:"
foreach ($candidate in $readContext.CurrentCandidates) {
    Write-Output "- $candidate"
}
Write-Output ""
Write-Output "Judgment candidates:"

if ($readContext.JudgmentCandidates.Count -gt 0) {
    foreach ($candidate in $readContext.JudgmentCandidates) {
        Write-Output "- $candidate"
    }
}
else {
    Write-Output "- (none)"
}

Write-Output ""
Write-Output "Summary candidates:"

if ($readContext.SummaryCandidate) {
    Write-Output "- $($readContext.SummaryCandidate)"
}
else {
    Write-Output "- (none)"
}

Write-Output ""
Write-Output "Session candidates:"

if ($readContext.SessionCandidates.Count -gt 0) {
    foreach ($session in $readContext.SessionCandidates) {
        Write-Output "- $session"
    }
}
else {
    Write-Output "- (none)"
}

Write-Output ""
Write-Output "Notes:"

if ($readContext.Notes.Count -gt 0) {
    foreach ($note in $readContext.Notes) {
        Write-Output "- $note"
    }
}
else {
    Write-Output "- (none)"
}
