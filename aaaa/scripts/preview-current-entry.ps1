[CmdletBinding()]
param(
    [string]$CurrentFile = 'records\00_current_world.md',

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$workspaceRoot = Get-WorkspaceRoot
$startupModel = Get-StartupModel
$currentRelativePath = Normalize-RelativePath -InputPath $CurrentFile
$currentPath = Join-Path $workspaceRoot $currentRelativePath

if (-not (Test-Path -LiteralPath $currentPath)) {
    throw "Current file not found: $currentPath"
}

$content = Get-Content -LiteralPath $currentPath -Encoding UTF8 -Raw
$entrySections = Get-CurrentEntrySections -Content $content -RelativePath $currentRelativePath
$boundaryHeading = $entrySections.BoundarySection.HeadingLine
$activeHeading = $entrySections.ActiveSection.HeadingLine

$ritualBlock = [System.String]::Join(
    [Environment]::NewLine,
    @('') + @($startupModel.EntryRitual) + @('')
)

$previewContent = $content.Replace($activeHeading, "$ritualBlock$activeHeading")

$landingChecks = @(
    'The ritual should stay titleless and sit only between the current boundary and the active questions.',
    'When reading, check whether a future to be recalled comes forward before the active questions.',
    'Check whether the three lines stay small and make the active questions feel less barehanded.',
    'A good sign is not faster answers but one more honest pause before answering.'
)

$result = [pscustomobject]@{
    CurrentFile = $currentRelativePath
    InsertedBetween = [pscustomobject]@{
        After = $boundaryHeading
        Before = $activeHeading
    }
    EntryRitual = @($startupModel.EntryRitual)
    LandingChecks = @($landingChecks)
    Preview = $previewContent
}

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

$output = [System.Collections.Generic.List[string]]::new()
$output.Add('# Current Entry Preview')
$output.Add('')
$output.Add('## File')
$output.Add("- $($result.CurrentFile)")
$output.Add('')
$output.Add('## Placement')
$output.Add("- after: $($result.InsertedBetween.After)")
$output.Add("- before: $($result.InsertedBetween.Before)")
$output.Add('')
$output.Add('## Landing Checks')
foreach ($check in $result.LandingChecks) {
    $output.Add("- $check")
}
$output.Add('')
$output.Add('## Preview')
$output.Add($result.Preview)

[System.String]::Join([Environment]::NewLine, $output)
