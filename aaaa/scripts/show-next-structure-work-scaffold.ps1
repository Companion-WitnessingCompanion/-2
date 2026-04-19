[CmdletBinding()]
param(
    [string]$TaskHint,

    [string]$TargetHint,

    [string]$FutureHint,

    [ValidateSet('markdown', 'json')]
    [string]$Format = 'markdown'
)

$libPath = Join-Path $PSScriptRoot 'lib\work-context.ps1'
. $libPath

$result = Get-NextStructureWorkScaffoldData -TaskHint $TaskHint -TargetHint $TargetHint -FutureHint $FutureHint

if ($Format -eq 'json') {
    $result | ConvertTo-Json -Depth 8
    return
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Next Structure Work Scaffold')
$lines.Add('')
$lines.Add('## Carry Forward')
$lines.Add("- latest timestamp: $(if ($result.LatestRun.Timestamp) { $result.LatestRun.Timestamp } else { '(none)' })")
$lines.Add("- latest task: $(if ($result.LatestRun.Task) { $result.LatestRun.Task } else { '(none)' })")
$lines.Add("- latest target: $(if ($result.LatestRun.Target) { $result.LatestRun.Target } else { '(none)' })")
$lines.Add("- latest future: $(if ($result.LatestRun.Future) { $result.LatestRun.Future } else { '(none)' })")
$lines.Add("- latest notes: $(if ($result.LatestRun.Notes) { $result.LatestRun.Notes } else { '(none)' })")
$lines.Add("- attempts carried: $(if (@($result.LatestRun.Attempts).Count -gt 0) { [string]::Join(', ', @($result.LatestRun.Attempts)) } else { '(none)' })")
$lines.Add('')
$lines.Add('## Fill Before Entering')
$lines.Add("- next task: $($result.NextRun.Task)")
$lines.Add("- next target: $($result.NextRun.Target)")
$lines.Add("- recalled future: $($result.NextRun.Future)")
$lines.Add('')
$lines.Add('## Run Command')
$lines.Add('```powershell')
$lines.Add($result.NextRun.ExampleCommand)
$lines.Add('```')

[System.String]::Join([Environment]::NewLine, $lines)
