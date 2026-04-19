[CmdletBinding()]
param(
    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

function New-EntrySurface {
    param(
        [string]$Name,
        [string]$Role,
        [string]$UseWhen,
        [string]$Path,
        [string]$Example
    )

    $fullPath = Join-Path $PSScriptRoot $Path

    [pscustomobject]@{
        Name = $Name
        Role = $Role
        UseWhen = $UseWhen
        Path = $Path
        Exists = Test-Path -LiteralPath $fullPath
        Example = $Example
    }
}

$surfaces = @(
    New-EntrySurface `
        -Name 'begin-work' `
        -Role 'primary doorway' `
        -UseWhen 'Start most work here when the task and target are known or can be inferred.' `
        -Path 'begin-work.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\begin-work.ps1 -Task "<task>" -Target "<target>" -Format markdown'

    New-EntrySurface `
        -Name 'start-work' `
        -Role 'brief-only doorway' `
        -UseWhen 'Use when you need the read set, work type, attempts, and reentry hints without saving a lived run.' `
        -Path 'start-work.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-work.ps1 -Task "<task>" -Target "<target>" -Format markdown'

    New-EntrySurface `
        -Name 'current opening reentry' `
        -Role 'current memory surface' `
        -UseWhen 'Use when current_update work needs the latest opening rhythm, scaffold, and current run command.' `
        -Path 'show-current-opening-reentry.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\show-current-opening-reentry.ps1 -Format markdown'

    New-EntrySurface `
        -Name 'structure work reentry' `
        -Role 'structure memory surface' `
        -UseWhen 'Use when structure_reset work needs latest run, observation alignment, memory history counts, and next structure commands.' `
        -Path 'show-structure-work-reentry.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\show-structure-work-reentry.ps1 -Format markdown'

    New-EntrySurface `
        -Name 'structure memory history' `
        -Role 'structure memory well' `
        -UseWhen 'Use when deciding whether run-backed structure memory and the separate observation well are aligned or diverging over time.' `
        -Path 'show-structure-memory-history.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\show-structure-memory-history.ps1 -Format markdown'

    New-EntrySurface `
        -Name 'attempt history' `
        -Role 'why-this-layer-exists well' `
        -UseWhen 'Use when a tool or behavior feels surprising and you need to see why that layer was added instead of rewriting it immediately.' `
        -Path 'show-attempt-history.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\show-attempt-history.ps1 -Format markdown'
)

$supportingSurfaces = @(
    New-EntrySurface `
        -Name 'begin-current-work' `
        -Role 'specialized current bridge' `
        -UseWhen 'Use directly only when bypassing generic begin-work is clearer for a current_update experiment.' `
        -Path 'begin-current-work.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\begin-current-work.ps1 -Task "<task>" -Format markdown'

    New-EntrySurface `
        -Name 'begin-structure-work' `
        -Role 'specialized structure bridge' `
        -UseWhen 'Use directly only when bypassing generic begin-work is clearer for a structure_reset experiment.' `
        -Path 'begin-structure-work.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\begin-structure-work.ps1 -Task "<task>" -Target "records/ideal_code_foundation_v1.md" -Format markdown'

    New-EntrySurface `
        -Name 'current opening runs' `
        -Role 'current run history' `
        -UseWhen 'Use when you need the whole current-opening run list, not only the latest reentry surface.' `
        -Path 'show-current-opening-runs.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\show-current-opening-runs.ps1 -Format markdown'

    New-EntrySurface `
        -Name 'structure observations' `
        -Role 'structure observation well' `
        -UseWhen 'Use when you need only the separate structure observation well without the heavier reentry surface.' `
        -Path 'show-structure-work-observations.ps1' `
        -Example 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\show-structure-work-observations.ps1 -Format markdown'
)

$result = [pscustomobject]@{
    Principle = 'Prefer the thinnest doorway that can honestly start the work.'
    DefaultStart = 'begin-work'
    PrimarySurfaces = @($surfaces)
    SupportingSurfaces = @($supportingSurfaces)
}

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Work Entry Map')
$lines.Add('')
$lines.Add("Principle: $($result.Principle)")
$lines.Add("Default start: $($result.DefaultStart)")
$lines.Add('')
$lines.Add('## Primary Surfaces')

foreach ($surface in $result.PrimarySurfaces) {
    $lines.Add("- $($surface.Name) [$($surface.Role)]")
    $lines.Add("  - use when: $($surface.UseWhen)")
    $lines.Add("  - path: scripts/$($surface.Path)")
    $lines.Add("  - exists: $($surface.Exists)")
    $lines.Add('  - example:')
    $lines.Add('```powershell')
    $lines.Add($surface.Example)
    $lines.Add('```')
}

$lines.Add('')
$lines.Add('## Supporting Surfaces')

foreach ($surface in $result.SupportingSurfaces) {
    $lines.Add("- $($surface.Name) [$($surface.Role)]")
    $lines.Add("  - use when: $($surface.UseWhen)")
    $lines.Add("  - path: scripts/$($surface.Path)")
    $lines.Add("  - exists: $($surface.Exists)")
    $lines.Add('  - example:')
    $lines.Add('```powershell')
    $lines.Add($surface.Example)
    $lines.Add('```')
}

[System.String]::Join([Environment]::NewLine, $lines)
