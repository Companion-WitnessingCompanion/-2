Set-StrictMode -Version Latest

function Get-WorkspaceRoot {
    return (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
}

function Get-RecordsDirectory {
    $recordsDir = Join-Path (Get-WorkspaceRoot) 'records'

    if (-not (Test-Path -LiteralPath $recordsDir)) {
        throw "Records directory not found: $recordsDir"
    }

    return $recordsDir
}

function Get-ScriptsDirectory {
    return (Split-Path -Parent $PSScriptRoot)
}

function Get-StartupModel {
    $configPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'config\startup-model.psd1'

    if (-not (Test-Path -LiteralPath $configPath)) {
        throw "Startup model not found: $configPath"
    }

    $content = Get-Content -LiteralPath $configPath -Encoding UTF8 -Raw
    $scriptBlock = [ScriptBlock]::Create($content)
    return $scriptBlock.InvokeReturnAsIs()
}

function Get-StartupAttemptHistory {
    $historyPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'config\startup-attempt-history.psd1'

    if (-not (Test-Path -LiteralPath $historyPath)) {
        return [pscustomobject]@{
            Stance = $null
            Attempts = @()
        }
    }

    $content = Get-Content -LiteralPath $historyPath -Encoding UTF8 -Raw
    $scriptBlock = [ScriptBlock]::Create($content)
    $result = $scriptBlock.InvokeReturnAsIs()

    return [pscustomobject]@{
        Stance = $result.Stance
        Attempts = @($result.Attempts)
    }
}

function Normalize-RelativePath {
    param(
        [string]$InputPath
    )

    if ([string]::IsNullOrWhiteSpace($InputPath)) {
        return $null
    }

    $workspaceRoot = Get-WorkspaceRoot
    $resolvedPath = $null

    try {
        $candidate = Join-Path $workspaceRoot $InputPath
        $resolvedPath = (Resolve-Path -LiteralPath $candidate -ErrorAction Stop).Path
    }
    catch {
        try {
            $resolvedPath = (Resolve-Path -LiteralPath $InputPath -ErrorAction Stop).Path
        }
        catch {
            $resolvedPath = $null
        }
    }

    if ($resolvedPath) {
        $baseUri = [System.Uri]::new(($workspaceRoot.TrimEnd('\') + '\'))
        $fullUri = [System.Uri]::new($resolvedPath)
        $relativeUri = $baseUri.MakeRelativeUri($fullUri)
        return ([System.Uri]::UnescapeDataString($relativeUri.ToString()) -replace '\\', '/')
    }

    return (($InputPath -replace '\\', '/') -replace '^\./', '')
}

function Test-WorkspaceRelativePath {
    param(
        [string]$RelativePath
    )

    if ([string]::IsNullOrWhiteSpace($RelativePath)) {
        return $false
    }

    $fullPath = Join-Path (Get-WorkspaceRoot) $RelativePath
    return Test-Path -LiteralPath $fullPath
}

function Get-FileContent {
    param(
        [string]$Path
    )

    return [System.IO.File]::ReadAllText($Path)
}

function Get-MarkdownH2Sections {
    param(
        [string]$Content
    )

    $matches = [regex]::Matches($Content, '(?m)^## .+$')
    $sections = @()

    for ($index = 0; $index -lt $matches.Count; $index++) {
        $match = $matches[$index]
        $bodyStart = $match.Index + $match.Length
        $bodyEnd = if ($index + 1 -lt $matches.Count) { $matches[$index + 1].Index } else { $Content.Length }
        $bodyLength = $bodyEnd - $bodyStart
        $body = if ($bodyLength -gt 0) { $Content.Substring($bodyStart, $bodyLength) } else { '' }
        $bodyLines = @(
            ($body -split "`r?`n") |
                Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
        )

        $sections += [pscustomobject]@{
            Index       = $index
            HeadingLine = $match.Value.Trim()
            Heading     = ($match.Value -replace '^##\s*', '').Trim()
            Body        = $body.Trim("`r", "`n")
            BodyLines   = $bodyLines
        }
    }

    return @($sections)
}

function Get-CurrentEntrySections {
    param(
        [string]$Content,
        [string]$RelativePath = 'records/00_current_world.md'
    )

    $sections = @(Get-MarkdownH2Sections -Content $Content)

    if ($sections.Count -lt 5) {
        throw "Expected at least five H2 headings in $RelativePath, but found $($sections.Count)"
    }

    $boundarySection = $sections[3]
    $activeSection = $sections[4]
    $activeQuestions = @(
        $activeSection.BodyLines |
            Where-Object { $_ -match '^\s*-\s+' } |
            ForEach-Object { ($_ -replace '^\s*-\s+', '').Trim() }
    )

    return [pscustomobject]@{
        Sections        = $sections
        BoundarySection = $boundarySection
        ActiveSection   = $activeSection
        ActiveQuestions = $activeQuestions
    }
}

function Read-JsonArrayStore {
    param(
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return @()
    }

    $raw = Get-Content -LiteralPath $Path -Encoding UTF8 -Raw

    if ([string]::IsNullOrWhiteSpace($raw)) {
        return @()
    }

    return @((ConvertFrom-Json -InputObject $raw))
}

function Write-JsonArrayStore {
    param(
        [string]$Path,
        [object[]]$Items
    )

    $json = ConvertTo-Json -InputObject @($Items) -Depth 8
    [System.IO.File]::WriteAllText($Path, $json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}

function Append-JsonArrayStoreItem {
    param(
        [string]$Path,
        [object]$Item
    )

    $items = @(Read-JsonArrayStore -Path $Path)
    $updated = @($items) + @($Item)
    Write-JsonArrayStore -Path $Path -Items $updated

    return @($updated)
}

function Format-AttemptIdsForDisplay {
    param(
        [object[]]$AttemptIds,
        [int]$MaxAttemptIds = 0
    )

    $allAttemptIds = @(
        @($AttemptIds) |
            Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } |
            ForEach-Object { [string]$_ }
    )

    if ($allAttemptIds.Count -eq 0) {
        return '(none)'
    }

    $shownAttemptIds = if ($MaxAttemptIds -gt 0) {
        @($allAttemptIds | Select-Object -First $MaxAttemptIds)
    }
    else {
        @($allAttemptIds)
    }

    $hiddenAttemptCount = [Math]::Max(0, $allAttemptIds.Count - $shownAttemptIds.Count)
    $display = [string]::Join(', ', $shownAttemptIds)

    if ($hiddenAttemptCount -gt 0) {
        return "$display (+$hiddenAttemptCount more)"
    }

    return $display
}

function Get-CurrentOpeningRunStorePath {
    return (Join-Path (Get-ScriptsDirectory) 'data\current-opening-runs.json')
}

function Get-CurrentOpeningSnapshotDirectory {
    return (Join-Path (Get-ScriptsDirectory) 'data\current-opening-run-snapshots')
}

function Get-CurrentWorldPath {
    return (Join-Path (Get-WorkspaceRoot) 'records\00_current_world.md')
}

function Get-IdealCodeFoundationPath {
    return (Join-Path (Get-WorkspaceRoot) 'records\ideal_code_foundation_v1.md')
}

function Test-CurrentOpeningRunIsSubstantive {
    param(
        [object]$Run
    )

    if ($null -eq $Run) {
        return $false
    }

    $task = if ($Run.PSObject.Properties.Name -contains 'Task') { $Run.Task } else { $null }
    $future = if ($Run.PSObject.Properties.Name -contains 'RecalledFuture') { $Run.RecalledFuture } else { $null }
    $snapshotPath = if ($Run.PSObject.Properties.Name -contains 'SnapshotPath') { $Run.SnapshotPath } else { $null }

    return (-not [string]::IsNullOrWhiteSpace($task)) -or
        (-not [string]::IsNullOrWhiteSpace($future)) -or
        (-not [string]::IsNullOrWhiteSpace($snapshotPath))
}

function Get-LatestCurrentOpeningData {
    param(
        [switch]$IncludeSnapshotContent
    )

    $runStorePath = Get-CurrentOpeningRunStorePath
    $snapshotDir = Get-CurrentOpeningSnapshotDirectory

    if (-not (Test-Path -LiteralPath $runStorePath)) {
        throw "Current opening run store not found: $runStorePath"
    }

    if (-not (Test-Path -LiteralPath $snapshotDir)) {
        throw "Current opening snapshot directory not found: $snapshotDir"
    }

    $runs = @(Read-JsonArrayStore -Path $runStorePath)
    $latestRun = @($runs | Select-Object -Last 1)
    $latestSubstantiveRun = @(
        $runs |
            Where-Object { Test-CurrentOpeningRunIsSubstantive -Run $_ } |
            Select-Object -Last 1
    )
    $selectedRun = if ($latestSubstantiveRun.Count -gt 0) { $latestSubstantiveRun[0] } elseif ($latestRun.Count -gt 0) { $latestRun[0] } else { $null }

    $latestRunSummary = $null
    $snapshotRelativePath = $null
    $snapshotFile = $null
    $fromRunStore = $false

    if ($null -ne $selectedRun) {
        $run = $selectedRun
        $future = if ($run.PSObject.Properties.Name -contains 'RecalledFuture') { $run.RecalledFuture } else { $null }
        $observation = if ($run.PSObject.Properties.Name -contains 'Observation') { $run.Observation } else { $null }
        $paused = if ($observation -and ($observation.PSObject.Properties.Name -contains 'Paused')) { $observation.Paused } else { $null }
        $lessBarehanded = if ($observation -and ($observation.PSObject.Properties.Name -contains 'QuestionsFeltLessBarehanded')) { $observation.QuestionsFeltLessBarehanded } else { $null }
        $ritualStayedSmall = if ($observation -and ($observation.PSObject.Properties.Name -contains 'RitualStayedSmall')) { $observation.RitualStayedSmall } else { $null }
        $attemptIds = @()
        if ($run.PSObject.Properties.Name -contains 'AttemptIds') {
            $attemptIds = @($run.AttemptIds)
        }
        $attemptSelection = if ($run.PSObject.Properties.Name -contains 'AttemptSelection') { $run.AttemptSelection } else { $null }

        $latestRunSummary = [pscustomobject]@{
            Timestamp = $run.Timestamp
            Task = $run.Task
            Future = $future
            Paused = $paused
            QuestionsFeltLessBarehanded = $lessBarehanded
            RitualStayedSmall = $ritualStayedSmall
            Attempts = @($attemptIds)
            AttemptSelection = $attemptSelection
            SnapshotPath = if ($run.PSObject.Properties.Name -contains 'SnapshotPath') { $run.SnapshotPath } else { $null }
        }

        if ($run.PSObject.Properties.Name -contains 'SnapshotPath' -and -not [string]::IsNullOrWhiteSpace($run.SnapshotPath)) {
            $snapshotRelativePath = Normalize-RelativePath -InputPath $run.SnapshotPath
            $candidate = Join-Path (Get-WorkspaceRoot) $snapshotRelativePath

            if (Test-Path -LiteralPath $candidate) {
                $snapshotFile = Get-Item -LiteralPath $candidate
                $fromRunStore = $true
            }
        }
    }

    if (-not $snapshotFile) {
        $snapshotFile = Get-ChildItem -LiteralPath $snapshotDir -File | Sort-Object LastWriteTime | Select-Object -Last 1
        if (-not $snapshotFile) {
            throw "No current opening snapshots found in $snapshotDir"
        }

        $snapshotRelativePath = Normalize-RelativePath -InputPath $snapshotFile.FullName
    }

    $snapshotContent = if ($IncludeSnapshotContent) { Get-Content -LiteralPath $snapshotFile.FullName -Encoding UTF8 -Raw } else { $null }

    return [pscustomobject]@{
        RunCount = $runs.Count
        RawLatestTimestamp = if ($latestRun.Count -gt 0) { $latestRun[0].Timestamp } else { $null }
        SelectedLatestTimestamp = if ($null -ne $selectedRun) { $selectedRun.Timestamp } else { $null }
        SelectedLatestWasSubstantive = [bool]($latestSubstantiveRun.Count -gt 0)
        LatestRun = $latestRunSummary
        Snapshot = [pscustomobject]@{
            SnapshotPath = $snapshotRelativePath
            SnapshotName = $snapshotFile.Name
            LastWriteTime = $snapshotFile.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            FromRunStore = [bool]$fromRunStore
            MetadataOnly = [bool](-not $IncludeSnapshotContent)
            Content = $snapshotContent
        }
    }
}

function Get-NextCurrentOpeningScaffoldData {
    param(
        [string]$TaskHint,
        [string]$FutureHint
    )

    $runStorePath = Get-CurrentOpeningRunStorePath
    $currentFile = Get-CurrentWorldPath
    $currentRelativePath = 'records/00_current_world.md'

    if (-not (Test-Path -LiteralPath $runStorePath)) {
        throw "Current opening run store not found: $runStorePath"
    }

    if (-not (Test-Path -LiteralPath $currentFile)) {
        throw "Current file not found: $currentFile"
    }

    $runs = @(Read-JsonArrayStore -Path $runStorePath)
    $latestRun = @($runs | Select-Object -Last 1)
    $latestSubstantiveRun = @(
        $runs |
            Where-Object { Test-CurrentOpeningRunIsSubstantive -Run $_ } |
            Select-Object -Last 1
    )
    $latest = if ($latestSubstantiveRun.Count -gt 0) { $latestSubstantiveRun[0] } elseif ($latestRun.Count -gt 0) { $latestRun[0] } else { $null }
    $currentContent = Get-FileContent -Path $currentFile
    $currentSections = Get-CurrentEntrySections -Content $currentContent -RelativePath $currentRelativePath

    $carryTask = if ($latest -and $latest.Task) { $latest.Task } else { $null }
    $carryFuture = if ($latest -and ($latest.PSObject.Properties.Name -contains 'RecalledFuture')) { $latest.RecalledFuture } else { $null }
    $carryAttempts = if ($latest -and ($latest.PSObject.Properties.Name -contains 'AttemptIds')) { @($latest.AttemptIds) } else { @() }
    $carryNotes = if ($latest -and ($latest.PSObject.Properties.Name -contains 'Observation') -and $latest.Observation -and ($latest.Observation.PSObject.Properties.Name -contains 'Notes')) { $latest.Observation.Notes } else { $null }

    $nextTask = if ($TaskHint) { $TaskHint } elseif ($carryTask) { "follow-on from: $carryTask" } else { '<next task>' }
    $nextFuture = if ($FutureHint) { $FutureHint } elseif ($carryFuture) { $carryFuture } else { '<recalled future>' }

    $runScriptPath = Join-Path (Get-ScriptsDirectory) 'run-current-entry.ps1'
    $exampleCommand = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$runScriptPath`" -Task `"$nextTask`" -Future `"$nextFuture`" -Format markdown"

    return [pscustomobject]@{
        LatestRun = [pscustomobject]@{
            Timestamp = if ($latest) { $latest.Timestamp } else { $null }
            Task = $carryTask
            Future = $carryFuture
            Attempts = @($carryAttempts)
            Notes = $carryNotes
        }
        ActiveQuestions = @($currentSections.ActiveQuestions)
        NextRun = [pscustomobject]@{
            Task = $nextTask
            Future = $nextFuture
            ExampleCommand = $exampleCommand
        }
    }
}

function Get-StartNextCurrentOpeningCommand {
    param(
        [string]$TaskHint,
        [string]$FutureHint
    )

    $starterPath = Join-Path (Get-ScriptsDirectory) 'start-next-current-opening.ps1'
    return "powershell -NoProfile -ExecutionPolicy Bypass -File `"$starterPath`" -TaskHint `"$TaskHint`" -FutureHint `"$FutureHint`" -Format markdown"
}

function Get-BeginCurrentWorkCommand {
    param(
        [string]$Task,
        [string]$FutureHint,
        [switch]$PreviewOnly
    )

    $beginPath = Join-Path (Get-ScriptsDirectory) 'begin-current-work.ps1'
    $previewArg = if ($PreviewOnly) { ' -PreviewOnly' } else { '' }
    return "powershell -NoProfile -ExecutionPolicy Bypass -File `"$beginPath`" -Task `"$Task`" -FutureHint `"$FutureHint`"$previewArg -Format markdown"
}

function Get-CurrentOpeningReentryData {
    param(
        [switch]$IncludeSnapshotContent,
        [string]$TaskHint,
        [string]$FutureHint
    )

    $latest = Get-LatestCurrentOpeningData -IncludeSnapshotContent:$IncludeSnapshotContent
    $scaffold = Get-NextCurrentOpeningScaffoldData -TaskHint $TaskHint -FutureHint $FutureHint
    $starterCommand = Get-StartNextCurrentOpeningCommand -TaskHint $scaffold.NextRun.Task -FutureHint $scaffold.NextRun.Future
    $beginPreviewCommand = Get-BeginCurrentWorkCommand -Task $scaffold.NextRun.Task -FutureHint $scaffold.NextRun.Future -PreviewOnly
    $beginRunCommand = Get-BeginCurrentWorkCommand -Task $scaffold.NextRun.Task -FutureHint $scaffold.NextRun.Future

    return [pscustomobject]@{
        Latest = $latest
        Scaffold = $scaffold
        BeginPreviewCommand = $beginPreviewCommand
        BeginRunCommand = $beginRunCommand
        StarterCommand = $starterCommand
        IncludeSnapshotContent = [bool]$IncludeSnapshotContent
    }
}

function Get-StructureWorkRunStorePath {
    return (Join-Path (Get-ScriptsDirectory) 'data\structure-work-runs.json')
}

function Get-StructureWorkObservationStorePath {
    return (Join-Path (Get-ScriptsDirectory) 'data\structure-work-observations.json')
}

function Get-StructureWorkSnapshotDirectory {
    return (Join-Path (Get-ScriptsDirectory) 'data\structure-work-run-snapshots')
}

function Test-StructureWorkRunIsSubstantive {
    param(
        [object]$Run
    )

    if ($null -eq $Run) {
        return $false
    }

    $task = if ($Run.PSObject.Properties.Name -contains 'Task') { $Run.Task } else { $null }
    $target = if ($Run.PSObject.Properties.Name -contains 'Target') { $Run.Target } else { $null }
    $future = if ($Run.PSObject.Properties.Name -contains 'RecalledFuture') { $Run.RecalledFuture } else { $null }
    $snapshotPath = if ($Run.PSObject.Properties.Name -contains 'SnapshotPath') { $Run.SnapshotPath } else { $null }

    return (-not [string]::IsNullOrWhiteSpace($task)) -or
        (-not [string]::IsNullOrWhiteSpace($target)) -or
        (-not [string]::IsNullOrWhiteSpace($future)) -or
        (-not [string]::IsNullOrWhiteSpace($snapshotPath))
}

function Get-LatestStructureWorkData {
    param(
        [switch]$IncludeSnapshotContent
    )

    $runStorePath = Get-StructureWorkRunStorePath
    $snapshotDir = Get-StructureWorkSnapshotDirectory

    if (-not (Test-Path -LiteralPath $runStorePath)) {
        throw "Structure work run store not found: $runStorePath"
    }

    if (-not (Test-Path -LiteralPath $snapshotDir)) {
        throw "Structure work snapshot directory not found: $snapshotDir"
    }

    $runs = @(Read-JsonArrayStore -Path $runStorePath)
    $latestRun = @($runs | Select-Object -Last 1)
    $latestSubstantiveRun = @(
        $runs |
            Where-Object { Test-StructureWorkRunIsSubstantive -Run $_ } |
            Select-Object -Last 1
    )
    $selectedRun = if ($latestSubstantiveRun.Count -gt 0) { $latestSubstantiveRun[0] } elseif ($latestRun.Count -gt 0) { $latestRun[0] } else { $null }

    $latestRunSummary = $null
    $snapshotRelativePath = $null
    $snapshotFile = $null
    $fromRunStore = $false

      if ($null -ne $selectedRun) {
          $run = $selectedRun
          $future = if ($run.PSObject.Properties.Name -contains 'RecalledFuture') { $run.RecalledFuture } else { $null }
          $attemptIds = if ($run.PSObject.Properties.Name -contains 'AttemptIds') { @($run.AttemptIds) } else { @() }
          $attemptSelection = if ($run.PSObject.Properties.Name -contains 'AttemptSelection') { $run.AttemptSelection } else { $null }
          $notes = if ($run.PSObject.Properties.Name -contains 'Notes') { $run.Notes } else { $null }
          $target = if ($run.PSObject.Properties.Name -contains 'Target') { $run.Target } else { $null }
          $observation = if ($run.PSObject.Properties.Name -contains 'Observation') { $run.Observation } else { $null }
          $structureMemoryHandoff = if ($run.PSObject.Properties.Name -contains 'StructureMemoryHandoff') { $run.StructureMemoryHandoff } else { $null }

          $latestRunSummary = [pscustomobject]@{
              Timestamp = $run.Timestamp
              Task = $run.Task
              Target = $target
              Future = $future
              Attempts = @($attemptIds)
              AttemptSelection = $attemptSelection
              Notes = $notes
              Observation = if ($observation) {
                  [pscustomobject]@{
                      Timestamp = if ($observation.PSObject.Properties.Name -contains 'Timestamp') { $observation.Timestamp } else { $null }
                      Target = if ($observation.PSObject.Properties.Name -contains 'Target') { $observation.Target } else { $null }
                      Future = if ($observation.PSObject.Properties.Name -contains 'Future') { $observation.Future } else { $null }
                      TargetFeltClearer = if ($observation.PSObject.Properties.Name -contains 'TargetFeltClearer') { $observation.TargetFeltClearer } else { $null }
                      NextStepFeltNameable = if ($observation.PSObject.Properties.Name -contains 'NextStepFeltNameable') { $observation.NextStepFeltNameable } else { $null }
                      BridgeStayedThin = if ($observation.PSObject.Properties.Name -contains 'BridgeStayedThin') { $observation.BridgeStayedThin } else { $null }
                      Notes = if ($observation.PSObject.Properties.Name -contains 'Notes') { $observation.Notes } else { $null }
                  }
              } else {
                  $null
              }
              StructureMemoryHandoff = if ($structureMemoryHandoff) {
                  [pscustomobject]@{
                      RunBackedObservationCount = if ($structureMemoryHandoff.PSObject.Properties.Name -contains 'RunBackedObservationCount') { $structureMemoryHandoff.RunBackedObservationCount } else { $null }
                      FullyAlignedCount = if ($structureMemoryHandoff.PSObject.Properties.Name -contains 'FullyAlignedCount') { $structureMemoryHandoff.FullyAlignedCount } else { $null }
                      IndependentWellCount = if ($structureMemoryHandoff.PSObject.Properties.Name -contains 'IndependentWellCount') { $structureMemoryHandoff.IndependentWellCount } else { $null }
                      MemoryReading = if ($structureMemoryHandoff.PSObject.Properties.Name -contains 'MemoryReading') { $structureMemoryHandoff.MemoryReading } else { $null }
                      IndependentWellRole = if ($structureMemoryHandoff.PSObject.Properties.Name -contains 'IndependentWellRole') { $structureMemoryHandoff.IndependentWellRole } else { $null }
                      IndependentWellPresentation = if ($structureMemoryHandoff.PSObject.Properties.Name -contains 'IndependentWellPresentation') { $structureMemoryHandoff.IndependentWellPresentation } else { $null }
                      NextQuestion = if ($structureMemoryHandoff.PSObject.Properties.Name -contains 'NextQuestion') { $structureMemoryHandoff.NextQuestion } else { $null }
                  }
              } else {
                  $null
              }
              SnapshotPath = if ($run.PSObject.Properties.Name -contains 'SnapshotPath') { $run.SnapshotPath } else { $null }
          }

        if ($run.PSObject.Properties.Name -contains 'SnapshotPath' -and -not [string]::IsNullOrWhiteSpace($run.SnapshotPath)) {
            $snapshotRelativePath = Normalize-RelativePath -InputPath $run.SnapshotPath
            $candidate = Join-Path (Get-WorkspaceRoot) $snapshotRelativePath

            if (Test-Path -LiteralPath $candidate) {
                $snapshotFile = Get-Item -LiteralPath $candidate
                $fromRunStore = $true
            }
        }
    }

    if (-not $snapshotFile) {
        $snapshotFile = Get-ChildItem -LiteralPath $snapshotDir -File | Sort-Object LastWriteTime | Select-Object -Last 1
        if (-not $snapshotFile) {
            throw "No structure work snapshots found in $snapshotDir"
        }

        $snapshotRelativePath = Normalize-RelativePath -InputPath $snapshotFile.FullName
    }

    $snapshotContent = if ($IncludeSnapshotContent) { Get-Content -LiteralPath $snapshotFile.FullName -Encoding UTF8 -Raw } else { $null }

    return [pscustomobject]@{
        RunCount = $runs.Count
        RawLatestTimestamp = if ($latestRun.Count -gt 0) { $latestRun[0].Timestamp } else { $null }
        SelectedLatestTimestamp = if ($null -ne $selectedRun) { $selectedRun.Timestamp } else { $null }
        SelectedLatestWasSubstantive = [bool]($latestSubstantiveRun.Count -gt 0)
        LatestRun = $latestRunSummary
        Snapshot = [pscustomobject]@{
            SnapshotPath = $snapshotRelativePath
            SnapshotName = $snapshotFile.Name
            LastWriteTime = $snapshotFile.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            FromRunStore = [bool]$fromRunStore
            MetadataOnly = [bool](-not $IncludeSnapshotContent)
            Content = $snapshotContent
        }
    }
}

function Get-LatestStructureWorkObservationData {
    $storePath = Get-StructureWorkObservationStorePath
    $observations = if (Test-Path -LiteralPath $storePath) {
        @(Read-JsonArrayStore -Path $storePath)
    }
    else {
        @()
    }

    $count = (@($observations) | Measure-Object).Count
    $latest = if ($count -gt 0) { @($observations | Select-Object -Last 1)[0] } else { $null }

    return [pscustomobject]@{
        Count = $count
        LatestObservation = if ($latest) {
            [pscustomobject]@{
                Timestamp = $latest.Timestamp
                Target = if ($latest.PSObject.Properties.Name -contains 'Target') { $latest.Target } else { $null }
                Future = if ($latest.PSObject.Properties.Name -contains 'Future') { $latest.Future } else { $null }
                TargetFeltClearer = if ($latest.PSObject.Properties.Name -contains 'TargetFeltClearer') { $latest.TargetFeltClearer } else { $null }
                NextStepFeltNameable = if ($latest.PSObject.Properties.Name -contains 'NextStepFeltNameable') { $latest.NextStepFeltNameable } else { $null }
                BridgeStayedThin = if ($latest.PSObject.Properties.Name -contains 'BridgeStayedThin') { $latest.BridgeStayedThin } else { $null }
                Notes = if ($latest.PSObject.Properties.Name -contains 'Notes') { $latest.Notes } else { $null }
            }
        } else {
            $null
        }
    }
}

function Get-StructureWorkObservationAlignmentData {
    param(
        [object]$LatestStructureWorkData,
        [object]$LatestObservationData
    )

    $latestRun = if ($LatestStructureWorkData) { $LatestStructureWorkData.LatestRun } else { $null }
    $runObservation = if ($latestRun -and ($latestRun.PSObject.Properties.Name -contains 'Observation')) { $latestRun.Observation } else { $null }
    $wellObservation = if ($LatestObservationData) { $LatestObservationData.LatestObservation } else { $null }

    $runAvailable = ($null -ne $runObservation)
    $wellAvailable = ($null -ne $wellObservation)

    $status = if ($runAvailable -and $wellAvailable) {
        'dual_memory'
    }
    elseif ($runAvailable) {
        'run_only'
    }
    elseif ($wellAvailable) {
        'well_only'
    }
    else {
        'empty'
    }

    $sameTimestamp = [bool]($runAvailable -and $wellAvailable -and ($runObservation.Timestamp -eq $wellObservation.Timestamp))
    $sameFuture = [bool]($runAvailable -and $wellAvailable -and ($runObservation.Future -eq $wellObservation.Future))
    $sameTarget = [bool]($runAvailable -and $wellAvailable -and ($runObservation.Target -eq $wellObservation.Target))
    $sameTargetFeltClearer = [bool]($runAvailable -and $wellAvailable -and ($runObservation.TargetFeltClearer -eq $wellObservation.TargetFeltClearer))
    $sameNextStepFeltNameable = [bool]($runAvailable -and $wellAvailable -and ($runObservation.NextStepFeltNameable -eq $wellObservation.NextStepFeltNameable))
    $sameBridgeStayedThin = [bool]($runAvailable -and $wellAvailable -and ($runObservation.BridgeStayedThin -eq $wellObservation.BridgeStayedThin))
    $fullyAligned = [bool](
        $runAvailable -and
        $wellAvailable -and
        $sameTimestamp -and
        $sameTarget -and
        $sameFuture -and
        $sameTargetFeltClearer -and
        $sameNextStepFeltNameable -and
        $sameBridgeStayedThin
    )

    return [pscustomobject]@{
        Status = $status
        RunObservation = $runObservation
        WellObservation = $wellObservation
        RunAvailable = [bool]$runAvailable
        WellAvailable = [bool]$wellAvailable
        SameTimestamp = $sameTimestamp
        SameTarget = $sameTarget
        SameFuture = $sameFuture
        SameTargetFeltClearer = $sameTargetFeltClearer
        SameNextStepFeltNameable = $sameNextStepFeltNameable
        SameBridgeStayedThin = $sameBridgeStayedThin
        FullyAligned = $fullyAligned
    }
}

function Get-StructureWorkObservationAlignmentHistoryData {
    param(
        [int]$MaxItems = 10
    )

    $runStorePath = Get-StructureWorkRunStorePath
    $observationStorePath = Get-StructureWorkObservationStorePath

    if (-not (Test-Path -LiteralPath $runStorePath)) {
        throw "Structure work run store not found: $runStorePath"
    }

    $runs = @(Read-JsonArrayStore -Path $runStorePath)
    $observations = if (Test-Path -LiteralPath $observationStorePath) {
        @(Read-JsonArrayStore -Path $observationStorePath)
    }
    else {
        @()
    }

    $runEntries = foreach ($run in $runs) {
        if (-not ($run.PSObject.Properties.Name -contains 'Observation') -or $null -eq $run.Observation) {
            continue
        }

        $runObservation = $run.Observation
        $wellObservation = @(
            $observations |
                Where-Object { $_.Timestamp -eq $runObservation.Timestamp } |
                Select-Object -Last 1
        )

        $alignment = Get-StructureWorkObservationAlignmentData `
            -LatestStructureWorkData ([pscustomobject]@{
                LatestRun = [pscustomobject]@{
                    Observation = $runObservation
                }
            }) `
            -LatestObservationData ([pscustomobject]@{
                LatestObservation = if ($wellObservation.Count -gt 0) { $wellObservation[0] } else { $null }
            })

        [pscustomobject]@{
            Timestamp = $run.Timestamp
            Task = $run.Task
            Target = if ($run.PSObject.Properties.Name -contains 'Target') { $run.Target } else { $null }
            Future = if ($run.PSObject.Properties.Name -contains 'RecalledFuture') { $run.RecalledFuture } else { $null }
            Notes = if ($run.PSObject.Properties.Name -contains 'Notes') { $run.Notes } else { $null }
            Status = $alignment.Status
            FullyAligned = $alignment.FullyAligned
            SameTimestamp = $alignment.SameTimestamp
            SameTarget = $alignment.SameTarget
            SameFuture = $alignment.SameFuture
            SameTargetFeltClearer = $alignment.SameTargetFeltClearer
            SameNextStepFeltNameable = $alignment.SameNextStepFeltNameable
            SameBridgeStayedThin = $alignment.SameBridgeStayedThin
            RunObservation = [pscustomobject]@{
                Timestamp = if ($runObservation.PSObject.Properties.Name -contains 'Timestamp') { $runObservation.Timestamp } else { $null }
                Target = if ($runObservation.PSObject.Properties.Name -contains 'Target') { $runObservation.Target } else { $null }
                Future = if ($runObservation.PSObject.Properties.Name -contains 'Future') { $runObservation.Future } else { $null }
                TargetFeltClearer = if ($runObservation.PSObject.Properties.Name -contains 'TargetFeltClearer') { $runObservation.TargetFeltClearer } else { $null }
                NextStepFeltNameable = if ($runObservation.PSObject.Properties.Name -contains 'NextStepFeltNameable') { $runObservation.NextStepFeltNameable } else { $null }
                BridgeStayedThin = if ($runObservation.PSObject.Properties.Name -contains 'BridgeStayedThin') { $runObservation.BridgeStayedThin } else { $null }
                Notes = if ($runObservation.PSObject.Properties.Name -contains 'Notes') { $runObservation.Notes } else { $null }
            }
            WellObservation = if ($wellObservation.Count -gt 0) {
                $latestWellObservation = $wellObservation[0]
                [pscustomobject]@{
                    Timestamp = if ($latestWellObservation.PSObject.Properties.Name -contains 'Timestamp') { $latestWellObservation.Timestamp } else { $null }
                    Target = if ($latestWellObservation.PSObject.Properties.Name -contains 'Target') { $latestWellObservation.Target } else { $null }
                    Future = if ($latestWellObservation.PSObject.Properties.Name -contains 'Future') { $latestWellObservation.Future } else { $null }
                    TargetFeltClearer = if ($latestWellObservation.PSObject.Properties.Name -contains 'TargetFeltClearer') { $latestWellObservation.TargetFeltClearer } else { $null }
                    NextStepFeltNameable = if ($latestWellObservation.PSObject.Properties.Name -contains 'NextStepFeltNameable') { $latestWellObservation.NextStepFeltNameable } else { $null }
                    BridgeStayedThin = if ($latestWellObservation.PSObject.Properties.Name -contains 'BridgeStayedThin') { $latestWellObservation.BridgeStayedThin } else { $null }
                    Notes = if ($latestWellObservation.PSObject.Properties.Name -contains 'Notes') { $latestWellObservation.Notes } else { $null }
                }
            }
            else {
                $null
            }
        }
    }

    $allRunEntries = @(
        $runEntries |
            Sort-Object Timestamp -Descending
    )

    $matchedWellTimestamps = @(
        $allRunEntries |
            Where-Object { $null -ne $_.WellObservation } |
            ForEach-Object { $_.WellObservation.Timestamp }
    )

    $independentWellEntries = foreach ($observation in $observations) {
        if ($matchedWellTimestamps -contains $observation.Timestamp) {
            continue
        }

        [pscustomobject]@{
            Timestamp = $observation.Timestamp
            Target = if ($observation.PSObject.Properties.Name -contains 'Target') { $observation.Target } else { $null }
            Future = if ($observation.PSObject.Properties.Name -contains 'Future') { $observation.Future } else { $null }
            TargetFeltClearer = if ($observation.PSObject.Properties.Name -contains 'TargetFeltClearer') { $observation.TargetFeltClearer } else { $null }
            NextStepFeltNameable = if ($observation.PSObject.Properties.Name -contains 'NextStepFeltNameable') { $observation.NextStepFeltNameable } else { $null }
            BridgeStayedThin = if ($observation.PSObject.Properties.Name -contains 'BridgeStayedThin') { $observation.BridgeStayedThin } else { $null }
            Notes = if ($observation.PSObject.Properties.Name -contains 'Notes') { $observation.Notes } else { $null }
        }
    }
    $independentWellEntries = @($independentWellEntries | Sort-Object Timestamp -Descending)

    $limitedRunEntries = if ($MaxItems -gt 0) {
        @($allRunEntries | Select-Object -First $MaxItems)
    }
    else {
        @($allRunEntries)
    }

    $limitedIndependentWellEntries = if ($MaxItems -gt 0) {
        @($independentWellEntries | Select-Object -First $MaxItems)
    }
    else {
        @($independentWellEntries)
    }

    $runBackedObservationCount = (@($allRunEntries) | Measure-Object).Count
    $separateWellCount = (@($observations) | Measure-Object).Count
    $dualMemoryCount = (@($allRunEntries | Where-Object { $_.Status -eq 'dual_memory' }) | Measure-Object).Count
    $fullyAlignedCount = (@($allRunEntries | Where-Object { $_.FullyAligned }) | Measure-Object).Count
    $runOnlyCount = (@($allRunEntries | Where-Object { $_.Status -eq 'run_only' }) | Measure-Object).Count
    $independentWellCount = (@($independentWellEntries) | Measure-Object).Count

    if ($runOnlyCount -gt 0 -or $fullyAlignedCount -lt $dualMemoryCount) {
        $memoryReading = 'needs_attention'
        $nextQuestion = 'A run-backed memory and the separate well are diverging; inspect the mismatch before adding more layers.'
    }
    elseif ($runBackedObservationCount -ge 3 -and $fullyAlignedCount -eq $runBackedObservationCount -and $independentWellCount -gt 0) {
        $memoryReading = 'run_backed_primary_with_light_independent_well'
        $nextQuestion = 'New structure observations are arriving through run-backed memory; keep the independent well as a light historical/useful-reading layer for now.'
    }
    elseif ($runBackedObservationCount -gt 0 -and $fullyAlignedCount -eq $runBackedObservationCount -and $independentWellCount -eq 0) {
        $memoryReading = 'run_backed_aligned'
        $nextQuestion = 'Run-backed memory is carrying the structure observations cleanly; watch whether a separate well is still needed.'
    }
    elseif ($runBackedObservationCount -eq 0 -and $separateWellCount -gt 0) {
        $memoryReading = 'well_only'
        $nextQuestion = 'Structure observation still lives only as a separate well; try one lived run before deciding on convergence.'
    }
    else {
        $memoryReading = 'forming'
        $nextQuestion = 'Keep observing until the memory shape has enough lived runs to judge.'
    }

    switch ($memoryReading) {
        'needs_attention' {
            $independentWellRole = 'inspect_before_role'
            $independentWellPresentation = 'Do not assign a settled role yet; inspect the mismatch before changing the memory layers.'
        }
        'run_backed_primary_with_light_independent_well' {
            $independentWellRole = 'light_historical_useful_reading_layer'
            $independentWellPresentation = 'Show independent well entries after run-backed memory as older useful-reading layers; do not hide, merge, or promote them by default.'
        }
        'run_backed_aligned' {
            $independentWellRole = 'none_currently'
            $independentWellPresentation = 'No independent well entries are currently present; keep watching whether a separate well becomes useful again.'
        }
        'well_only' {
            $independentWellRole = 'primary_current_memory'
            $independentWellPresentation = 'The separate well is still the primary readable structure memory until lived runs begin carrying observations.'
        }
        default {
            $independentWellRole = 'undecided'
            $independentWellPresentation = 'Keep independent well entries visible until the memory shape has enough lived runs to judge.'
        }
    }

    return [pscustomobject]@{
        Summary = [pscustomobject]@{
            RunBackedObservationCount = $runBackedObservationCount
            SeparateWellCount = $separateWellCount
            DualMemoryCount = $dualMemoryCount
            FullyAlignedCount = $fullyAlignedCount
            RunOnlyCount = $runOnlyCount
            IndependentWellCount = $independentWellCount
            MemoryReading = $memoryReading
            IndependentWellRole = $independentWellRole
            IndependentWellPresentation = $independentWellPresentation
            NextQuestion = $nextQuestion
            MaxItems = $MaxItems
        }
        RunBackedEntries = $limitedRunEntries
        IndependentWellEntries = $limitedIndependentWellEntries
    }
}

function Get-NextStructureWorkScaffoldData {
    param(
        [string]$TaskHint,
        [string]$TargetHint,
        [string]$FutureHint
    )

    $runStorePath = Get-StructureWorkRunStorePath
    $defaultTarget = 'records/ideal_code_foundation_v1.md'

    if (-not (Test-Path -LiteralPath $runStorePath)) {
        throw "Structure work run store not found: $runStorePath"
    }

    $runs = @(Read-JsonArrayStore -Path $runStorePath)
    $latestRun = @($runs | Select-Object -Last 1)
    $latestSubstantiveRun = @(
        $runs |
            Where-Object { Test-StructureWorkRunIsSubstantive -Run $_ } |
            Select-Object -Last 1
    )
    $latest = if ($latestSubstantiveRun.Count -gt 0) { $latestSubstantiveRun[0] } elseif ($latestRun.Count -gt 0) { $latestRun[0] } else { $null }

    $carryTask = if ($latest -and $latest.Task) { $latest.Task } else { $null }
    $carryTarget = if ($latest -and ($latest.PSObject.Properties.Name -contains 'Target')) { $latest.Target } else { $null }
    $carryFuture = if ($latest -and ($latest.PSObject.Properties.Name -contains 'RecalledFuture')) { $latest.RecalledFuture } else { $null }
    $carryAttempts = if ($latest -and ($latest.PSObject.Properties.Name -contains 'AttemptIds')) { @($latest.AttemptIds) } else { @() }
    $carryAttemptSelection = if ($latest -and ($latest.PSObject.Properties.Name -contains 'AttemptSelection')) { $latest.AttemptSelection } else { $null }
    $carryNotes = if ($latest -and ($latest.PSObject.Properties.Name -contains 'Notes')) { $latest.Notes } else { $null }

    $normalizedTargetHint = if ($TargetHint) { Normalize-RelativePath -InputPath $TargetHint } else { $null }
    $nextTask = if ($TaskHint) { $TaskHint } elseif ($carryTask) { "follow-on from: $carryTask" } else { '<next structure task>' }
    $nextTarget = if ($normalizedTargetHint) { $normalizedTargetHint } elseif ($TargetHint) { $TargetHint } elseif ($carryTarget) { $carryTarget } else { $defaultTarget }
    $nextFuture = if ($FutureHint) { $FutureHint } elseif ($carryFuture) { $carryFuture } else { '<structure future>' }

    $runScriptPath = Join-Path (Get-ScriptsDirectory) 'run-structure-work.ps1'
    $exampleCommand = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$runScriptPath`" -Task `"$nextTask`" -Target `"$nextTarget`" -Future `"$nextFuture`" -Format markdown"

    return [pscustomobject]@{
        LatestRun = [pscustomobject]@{
            Timestamp = if ($latest) { $latest.Timestamp } else { $null }
            Task = $carryTask
            Target = $carryTarget
            Future = $carryFuture
            Attempts = @($carryAttempts)
            AttemptSelection = $carryAttemptSelection
            Notes = $carryNotes
        }
        NextRun = [pscustomobject]@{
            Task = $nextTask
            Target = $nextTarget
            Future = $nextFuture
            ExampleCommand = $exampleCommand
        }
    }
}

function Get-BeginStructureWorkCommand {
    param(
        [string]$Task,
        [string]$Target,
        [string]$FutureHint,
        [switch]$PreviewOnly
    )

    $beginPath = Join-Path (Get-ScriptsDirectory) 'begin-structure-work.ps1'
    $previewArg = if ($PreviewOnly) { ' -PreviewOnly' } else { '' }
    return "powershell -NoProfile -ExecutionPolicy Bypass -File `"$beginPath`" -Task `"$Task`" -Target `"$Target`" -FutureHint `"$FutureHint`"$previewArg -Format markdown"
}

function Get-StartNextStructureWorkCommand {
    param(
        [string]$TaskHint,
        [string]$TargetHint,
        [string]$FutureHint
    )

    $starterPath = Join-Path (Get-ScriptsDirectory) 'start-next-structure-work.ps1'
    return "powershell -NoProfile -ExecutionPolicy Bypass -File `"$starterPath`" -TaskHint `"$TaskHint`" -TargetHint `"$TargetHint`" -FutureHint `"$FutureHint`" -Format markdown"
}

function Get-ShowStructureMemoryHistoryCommand {
    param(
        [int]$MaxItems = 10
    )

    $viewerPath = Join-Path (Get-ScriptsDirectory) 'show-structure-memory-history.ps1'
    return "powershell -NoProfile -ExecutionPolicy Bypass -File `"$viewerPath`" -MaxItems $MaxItems -Format markdown"
}

function Get-StructureMemoryHandoffData {
    param(
        [object]$StructureWorkReentry
    )

    if (-not $StructureWorkReentry -or -not $StructureWorkReentry.MemoryHistory -or -not $StructureWorkReentry.MemoryHistory.Summary) {
        return $null
    }

    $summary = $StructureWorkReentry.MemoryHistory.Summary

    return [pscustomobject]@{
        RunBackedObservationCount = $summary.RunBackedObservationCount
        FullyAlignedCount = $summary.FullyAlignedCount
        IndependentWellCount = $summary.IndependentWellCount
        MemoryReading = $summary.MemoryReading
        IndependentWellRole = $summary.IndependentWellRole
        IndependentWellPresentation = $summary.IndependentWellPresentation
        NextQuestion = $summary.NextQuestion
    }
}

function Get-StructureMemoryHandoffDeltaData {
    param(
        [object]$EntryHandoff,
        [object]$CurrentMemorySummary
    )

    if (-not $EntryHandoff -or -not $CurrentMemorySummary) {
        return $null
    }

    $entryRunBacked = if ($null -ne $EntryHandoff.RunBackedObservationCount) { [int]$EntryHandoff.RunBackedObservationCount } else { $null }
    $currentRunBacked = if ($null -ne $CurrentMemorySummary.RunBackedObservationCount) { [int]$CurrentMemorySummary.RunBackedObservationCount } else { $null }
    $entryFullyAligned = if ($null -ne $EntryHandoff.FullyAlignedCount) { [int]$EntryHandoff.FullyAlignedCount } else { $null }
    $currentFullyAligned = if ($null -ne $CurrentMemorySummary.FullyAlignedCount) { [int]$CurrentMemorySummary.FullyAlignedCount } else { $null }
    $entryIndependentWell = if ($null -ne $EntryHandoff.IndependentWellCount) { [int]$EntryHandoff.IndependentWellCount } else { $null }
    $currentIndependentWell = if ($null -ne $CurrentMemorySummary.IndependentWellCount) { [int]$CurrentMemorySummary.IndependentWellCount } else { $null }

    $runBackedDelta = if ($null -ne $entryRunBacked -and $null -ne $currentRunBacked) { $currentRunBacked - $entryRunBacked } else { $null }
    $fullyAlignedDelta = if ($null -ne $entryFullyAligned -and $null -ne $currentFullyAligned) { $currentFullyAligned - $entryFullyAligned } else { $null }
    $independentWellDelta = if ($null -ne $entryIndependentWell -and $null -ne $currentIndependentWell) { $currentIndependentWell - $entryIndependentWell } else { $null }
    $sameReading = [bool]($EntryHandoff.MemoryReading -eq $CurrentMemorySummary.MemoryReading)
    $sameIndependentWellRole = [bool]($EntryHandoff.IndependentWellRole -eq $CurrentMemorySummary.IndependentWellRole)

    if (($null -ne $runBackedDelta -and $runBackedDelta -lt 0) -or
        ($null -ne $fullyAlignedDelta -and $fullyAlignedDelta -lt 0) -or
        ($null -ne $independentWellDelta -and $independentWellDelta -ne 0) -or
        (-not $sameReading) -or
        (-not $sameIndependentWellRole)) {
        $status = 'inspect_handoff_shift'
        $nextQuestion = 'Entry-time handoff and current memory shape changed in a way that needs inspection before treating it as ordinary accumulation.'
    }
    elseif (($runBackedDelta -eq 0) -and ($fullyAlignedDelta -eq 0)) {
        $status = 'no_post_run_shift'
        $nextQuestion = 'The latest run did not move the memory counts; check whether this was a dry run, a preview, or an intentionally unsaved observation.'
    }
    else {
        $status = 'expected_post_run_accumulation'
        $nextQuestion = 'Entry-time handoff stayed stable while current memory advanced; treat the delta as the latest saved run being added, not as drift.'
    }

    return [pscustomobject]@{
        Status = $status
        EntryRunBackedObservationCount = $entryRunBacked
        CurrentRunBackedObservationCount = $currentRunBacked
        RunBackedObservationDelta = $runBackedDelta
        EntryFullyAlignedCount = $entryFullyAligned
        CurrentFullyAlignedCount = $currentFullyAligned
        FullyAlignedDelta = $fullyAlignedDelta
        EntryIndependentWellCount = $entryIndependentWell
        CurrentIndependentWellCount = $currentIndependentWell
        IndependentWellDelta = $independentWellDelta
        SameMemoryReading = $sameReading
        SameIndependentWellRole = $sameIndependentWellRole
        NextQuestion = $nextQuestion
    }
}

function Get-StructureWorkReentryData {
    param(
        [switch]$IncludeSnapshotContent,
        [string]$TaskHint,
        [string]$TargetHint,
        [string]$FutureHint
    )

    $latest = Get-LatestStructureWorkData -IncludeSnapshotContent:$IncludeSnapshotContent
    $latestObservation = Get-LatestStructureWorkObservationData
    $observationAlignment = Get-StructureWorkObservationAlignmentData -LatestStructureWorkData $latest -LatestObservationData $latestObservation
    $memoryHistory = Get-StructureWorkObservationAlignmentHistoryData -MaxItems 5
    $memoryHandoffDelta = Get-StructureMemoryHandoffDeltaData -EntryHandoff $latest.LatestRun.StructureMemoryHandoff -CurrentMemorySummary $memoryHistory.Summary
    $scaffold = Get-NextStructureWorkScaffoldData -TaskHint $TaskHint -TargetHint $TargetHint -FutureHint $FutureHint
    $starterCommand = Get-StartNextStructureWorkCommand -TaskHint $scaffold.NextRun.Task -TargetHint $scaffold.NextRun.Target -FutureHint $scaffold.NextRun.Future
    $beginPreviewCommand = Get-BeginStructureWorkCommand -Task $scaffold.NextRun.Task -Target $scaffold.NextRun.Target -FutureHint $scaffold.NextRun.Future -PreviewOnly
    $beginRunCommand = Get-BeginStructureWorkCommand -Task $scaffold.NextRun.Task -Target $scaffold.NextRun.Target -FutureHint $scaffold.NextRun.Future
    $memoryHistoryCommand = Get-ShowStructureMemoryHistoryCommand -MaxItems 5

    return [pscustomobject]@{
        Latest = $latest
        LatestObservation = $latestObservation
        ObservationAlignment = $observationAlignment
        MemoryHistory = $memoryHistory
        MemoryHandoffDelta = $memoryHandoffDelta
        MemoryHistoryCommand = $memoryHistoryCommand
        Scaffold = $scaffold
        BeginPreviewCommand = $beginPreviewCommand
        BeginRunCommand = $beginRunCommand
        StarterCommand = $starterCommand
        IncludeSnapshotContent = [bool]$IncludeSnapshotContent
    }
}

function Get-JudgmentCandidates {
    param(
        [string]$TargetRelativePath,
        [string]$TargetLeafName
    )

    if ([string]::IsNullOrWhiteSpace($TargetRelativePath) -and [string]::IsNullOrWhiteSpace($TargetLeafName)) {
        return @()
    }

    $recordsDir = Get-RecordsDirectory
    $results = @()
    $files = Get-ChildItem -LiteralPath $recordsDir -File -Filter '20_J-*.md' -ErrorAction SilentlyContinue

    foreach ($file in $files) {
        $content = Get-FileContent -Path $file.FullName
        $score = 0

        if ($TargetRelativePath -and $content -match [regex]::Escape($TargetRelativePath)) {
            $score += 3
        }
        elseif ($TargetLeafName -and $content -match [regex]::Escape($TargetLeafName)) {
            $score += 2
        }

        if ($score -gt 0) {
            $results += [pscustomobject]@{
                Name         = $file.Name
                FullName     = $file.FullName
                Content      = $content
                Score        = $score
                LastWriteUtc = $file.LastWriteTimeUtc
            }
        }
    }

    return @(
        $results |
            Sort-Object -Property @{ Expression = 'Score'; Descending = $true }, @{ Expression = 'LastWriteUtc'; Descending = $true } |
            Select-Object -First 2
    )
}

function Get-SessionCandidates {
    param(
        [object[]]$JudgmentCandidates
    )

    $sessionNames = @()

    foreach ($candidate in $JudgmentCandidates) {
        $matches = [regex]::Matches($candidate.Content, '10_session_\d{4}-\d{2}-\d{2}_pilot_\d{2}\.md')
        foreach ($match in $matches) {
            $sessionNames += $match.Value
        }
    }

    return @(
        $sessionNames |
            Sort-Object -Descending |
            Get-Unique |
            Select-Object -First 1
    )
}

function Get-SummaryFiles {
    $recordsDir = Get-RecordsDirectory
    $files = Get-ChildItem -LiteralPath $recordsDir -File -Filter '*.md' -ErrorAction SilentlyContinue

    return @(
        $files | Where-Object {
            $_.Name -notmatch '^(00_current_world|05_work_routing|10_session_|20_J-|30_E-)'
        }
    )
}

function Get-SummaryCandidate {
    param(
        [string]$TargetRelativePath,
        [string]$TargetLeafName,
        [object[]]$JudgmentCandidates
    )

    $summaryFiles = Get-SummaryFiles
    $candidates = @()

    foreach ($file in $summaryFiles) {
        $content = Get-FileContent -Path $file.FullName
        $score = 0

        foreach ($judgment in $JudgmentCandidates) {
            $judgmentLabel = ($judgment.Name -replace '^20_', '')

            if ($content -match [regex]::Escape($judgmentLabel)) {
                $score += 3
            }
            elseif ($content -match [regex]::Escape($judgment.Name)) {
                $score += 2
            }
        }

        if ($TargetRelativePath -and $content -match [regex]::Escape($TargetRelativePath)) {
            $score += 2
        }
        elseif ($TargetLeafName -and $content -match [regex]::Escape($TargetLeafName)) {
            $score += 1
        }

        if ($score -gt 0) {
            $candidates += [pscustomobject]@{
                Name         = $file.Name
                Score        = $score
                LastWriteUtc = $file.LastWriteTimeUtc
            }
        }
    }

    if ($candidates.Count -gt 0) {
        return $candidates |
            Sort-Object -Property @{ Expression = 'Score'; Descending = $true }, @{ Expression = 'LastWriteUtc'; Descending = $true } |
            Select-Object -First 1
    }

    return $summaryFiles |
        Sort-Object -Property LastWriteTimeUtc -Descending |
        Select-Object -First 1
}

function Get-ReadContextData {
    param(
        [string]$Target,
        [string]$WorkType
    )

    $targetRelativePath = Normalize-RelativePath -InputPath $Target
    $targetLeafName = if ($targetRelativePath) { Split-Path -Leaf $targetRelativePath } else { $null }

    $judgmentCandidates = if ($targetRelativePath -or $targetLeafName) {
        @(Get-JudgmentCandidates -TargetRelativePath $targetRelativePath -TargetLeafName $targetLeafName)
    }
    else {
        @()
    }

    $sessionCandidates = @(Get-SessionCandidates -JudgmentCandidates $judgmentCandidates)
    $summaryCandidate = if ($targetRelativePath -or $targetLeafName -or $judgmentCandidates.Count -gt 0) {
        Get-SummaryCandidate -TargetRelativePath $targetRelativePath -TargetLeafName $targetLeafName -JudgmentCandidates $judgmentCandidates
    }
    else {
        $null
    }

    $notes = @()

    if ($WorkType) {
        $notes += "Work type hint provided: $WorkType"
    }

    if (@($judgmentCandidates).Count -gt 0 -and $WorkType -and $WorkType.ToLowerInvariant() -eq 'retrial') {
        $notes += 'Retrial may be relevant.'
        $notes += 'Recheck the linked judgment scope/strength before widening its force.'
    }

    return [pscustomobject]@{
        Target            = $targetRelativePath
        CurrentCandidates = @('00_current_world.md')
        JudgmentCandidates = @($judgmentCandidates | ForEach-Object { $_.Name })
        SummaryCandidate  = if ($summaryCandidate) { $summaryCandidate.Name } else { $null }
        SessionCandidates = @($sessionCandidates)
        Notes             = @($notes)
    }
}

function Resolve-ExplicitWorkTypeModel {
    param(
        [string]$WorkType,
        [object]$StartupModel
    )

    if ([string]::IsNullOrWhiteSpace($WorkType)) {
        return $null
    }

    foreach ($candidate in $StartupModel.WorkTypes) {
        if ($candidate.Name -eq $WorkType -or $candidate.Label -eq $WorkType) {
            return $candidate
        }
    }

    return $null
}

function Resolve-InferredWorkTypeModel {
    param(
        [string]$Task,
        [string]$TargetRelativePath,
        [object]$StartupModel
    )

    $haystack = @($Task, $TargetRelativePath) -join ' '
    $scores = @{}

    foreach ($workType in $StartupModel.WorkTypes) {
        $scores[$workType.Name] = 0

        foreach ($trigger in $workType.Triggers) {
            if (-not [string]::IsNullOrWhiteSpace($trigger) -and $haystack -like "*$trigger*") {
                $scores[$workType.Name] += 1
            }
        }
    }

    $targetLeafName = if ($TargetRelativePath) { Split-Path -Leaf $TargetRelativePath } else { $null }

    if ($targetLeafName -eq '00_current_world.md') {
        $scores['current_update'] += 4
    }
    elseif ($targetLeafName -in @('ideal_code_foundation_v1.md', '05_work_routing.md', 'care_rhythm_genealogy_v1.md')) {
        $scores['structure_reset'] += 4
    }
    elseif ($targetLeafName -like '20_J-*') {
        $scores['retrial'] += 3
    }
    elseif ($targetLeafName -like '10_session_*') {
        $scores['continuation'] += 2
    }
    elseif ($targetLeafName -like '30_E-*') {
        $scores['emergency'] += 3
    }

    $bestName = $StartupModel.DefaultWorkType
    $bestScore = 0

    foreach ($entry in $scores.GetEnumerator()) {
        if ($entry.Value -gt $bestScore) {
            $bestName = $entry.Key
            $bestScore = $entry.Value
        }
    }

    foreach ($candidate in $StartupModel.WorkTypes) {
        if ($candidate.Name -eq $bestName) {
            return $candidate
        }
    }

    throw "Unable to resolve work type model for: $bestName"
}

function Get-RelevantStartupAttempts {
    param(
        [string]$Task,
        [string]$TargetRelativePath,
        [int]$MaxAttempts = 8
    )

    $history = Get-StartupAttemptHistory
    $targetRelativePath = Normalize-RelativePath -InputPath $TargetRelativePath
    $haystack = @($Task, $targetRelativePath) -join ' '
    $ranked = @()
    $selectionMode = 'matched'

    foreach ($attempt in @($history.Attempts)) {
        $score = 0

        foreach ($trigger in @($attempt.Triggers)) {
            if (-not [string]::IsNullOrWhiteSpace($trigger) -and $haystack -like "*$trigger*") {
                $score += 1
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($targetRelativePath)) {
            foreach ($file in @($attempt.Files)) {
                $attemptFile = Normalize-RelativePath -InputPath $file
                if ($attemptFile -eq $targetRelativePath) {
                    $score += 3
                    break
                }
            }
        }

        if ($score -gt 0 -and $attempt.Status -eq 'active') {
            $score += 1
        }

        if ($score -gt 0) {
            $ranked += [pscustomobject]@{
                Attempt = $attempt
                Score   = $score
            }
        }
    }

    if ($ranked.Count -eq 0) {
        $selectionMode = 'latest_active_fallback'
        $ranked = @(
            foreach ($attempt in @($history.Attempts)) {
                if ($attempt.Status -eq 'active') {
                    [pscustomobject]@{
                        Attempt = $attempt
                        Score   = 0
                    }
                }
            }
        )
    }

    $sortedRanked = @(
        $ranked |
            Sort-Object -Property @{ Expression = 'Score'; Descending = $true }, @{ Expression = { $_.Attempt.Id }; Descending = $true }
    )
    $selectedRanked = if ($MaxAttempts -gt 0) {
        @($sortedRanked | Select-Object -First $MaxAttempts)
    }
    else {
        @($sortedRanked)
    }
    $attempts = @($selectedRanked | ForEach-Object { $_.Attempt })
    $hiddenCount = [Math]::Max(0, @($sortedRanked).Count - @($attempts).Count)
    $selectionNote = if ($hiddenCount -gt 0 -and $selectionMode -eq 'latest_active_fallback') {
        "No direct trigger or target match; showing $(@($attempts).Count) latest active attempts out of $(@($sortedRanked).Count). Use show-attempt-history -MaxAttempts 0 for the wider layer."
    }
    elseif ($hiddenCount -gt 0) {
        "Showing $(@($attempts).Count) of $(@($sortedRanked).Count) directly matched attempts. Use show-attempt-history -MaxAttempts 0 for the wider layer."
    }
    elseif ($selectionMode -eq 'latest_active_fallback') {
        "No direct trigger or target match; showing the latest active attempts as a fallback."
    }
    else {
        "Showing all $(@($attempts).Count) directly matched attempts."
    }

    return [pscustomobject]@{
        Stance        = $history.Stance
        Attempts      = $attempts
        SelectionMode = $selectionMode
        MaxAttempts   = $MaxAttempts
        TotalMatches  = @($sortedRanked).Count
        ShownCount    = @($attempts).Count
        HiddenCount   = $hiddenCount
        SelectionNote = $selectionNote
    }
}

function Get-ExistingRelativePaths {
    param(
        [string[]]$RelativePaths
    )

    return @(
        $RelativePaths | Where-Object { Test-WorkspaceRelativePath -RelativePath $_ }
    )
}

function Add-UniqueRelativePath {
    param(
        [System.Collections.Generic.List[string]]$List,
        [string]$RelativePath
    )

    if ([string]::IsNullOrWhiteSpace($RelativePath)) {
        return
    }

    if (-not (Test-WorkspaceRelativePath -RelativePath $RelativePath)) {
        return
    }

    if (-not $List.Contains($RelativePath)) {
        $List.Add($RelativePath)
    }
}

function New-StartWorkContext {
    param(
        [string]$Task,
        [string]$Target,
        [string]$WorkType
    )

    $startupModel = Get-StartupModel
    $targetRelativePath = Normalize-RelativePath -InputPath $Target
    $workTypeModel = Resolve-ExplicitWorkTypeModel -WorkType $WorkType -StartupModel $startupModel
    $workTypeSource = 'inferred'

    if ($workTypeModel) {
        $workTypeSource = 'explicit'
    }
    else {
        $workTypeModel = Resolve-InferredWorkTypeModel -Task $Task -TargetRelativePath $targetRelativePath -StartupModel $startupModel
    }

    $readContext = Get-ReadContextData -Target $Target -WorkType $WorkType
    $attemptHistory = Get-RelevantStartupAttempts -Task $Task -TargetRelativePath $targetRelativePath
    $layers = @()

    foreach ($layer in $startupModel.Layers) {
        $existingFiles = @(Get-ExistingRelativePaths -RelativePaths $layer.Files)
        $layers += [pscustomobject]@{
            Name    = $layer.Name
            Label   = $layer.Label
            Purpose = $layer.Purpose
            Files   = $existingFiles
        }
    }

    $readNow = [System.Collections.Generic.List[string]]::new()

    foreach ($path in $workTypeModel.BaseReadSet) {
        Add-UniqueRelativePath -List $readNow -RelativePath $path
    }

    foreach ($judgmentName in $readContext.JudgmentCandidates) {
        Add-UniqueRelativePath -List $readNow -RelativePath ("records/$judgmentName")
    }

    if ($readContext.SummaryCandidate) {
        Add-UniqueRelativePath -List $readNow -RelativePath ("records/$($readContext.SummaryCandidate)")
    }

    foreach ($sessionName in $readContext.SessionCandidates) {
        Add-UniqueRelativePath -List $readNow -RelativePath ("records/$sessionName")
    }

    if ($targetRelativePath -and $targetRelativePath -like 'records/*') {
        Add-UniqueRelativePath -List $readNow -RelativePath $targetRelativePath
    }

    $notes = [System.Collections.Generic.List[string]]::new()
    $notes.Add($startupModel.SilentPauseHint)

    if ($workTypeSource -eq 'explicit') {
        $notes.Add("Work type selected explicitly: '$($workTypeModel.Label)'.")
    }
    else {
        $notes.Add("Work type inferred from task/target: '$($workTypeModel.Label)'.")
    }

    foreach ($note in $readContext.Notes) {
        $notes.Add($note)
    }

    $currentOpeningReentry = $null
    $structureWorkReentry = $null
    $touchesCurrentEntry = ($workTypeModel.Name -eq 'current_update') -or ($targetRelativePath -eq 'records/00_current_world.md')

    if ($touchesCurrentEntry) {
        try {
            $currentOpeningReentry = Get-CurrentOpeningReentryData -TaskHint $Task
            $notes.Add('Current opening reentry is attached because this brief is touching the current entry rhythm directly.')
        }
        catch {
            $notes.Add("Current opening reentry is unavailable right now: $($_.Exception.Message)")
        }
    }

    $touchesStructureEntry = ($workTypeModel.Name -eq 'structure_reset') -or ($targetRelativePath -eq 'records/ideal_code_foundation_v1.md')

    if ($touchesStructureEntry) {
        try {
            $structureWorkReentry = Get-StructureWorkReentryData -TaskHint $Task -TargetHint $targetRelativePath
            $notes.Add('Structure work reentry is attached because this brief is touching the structure reset rhythm directly.')
        }
        catch {
            $notes.Add("Structure work reentry is unavailable right now: $($_.Exception.Message)")
        }
    }

    return [pscustomobject]@{
        Task            = $Task
        Target          = $targetRelativePath
        WorkType        = [pscustomobject]@{
            Name        = $workTypeModel.Name
            Label       = $workTypeModel.Label
            Description = $workTypeModel.Description
            Source      = $workTypeSource
        }
        EntryRitual     = @($startupModel.EntryRitual)
        ActiveQuestions = @($startupModel.ActiveQuestions)
        Layers          = $layers
        AttemptHistory  = $attemptHistory
        ReadNow         = @($readNow.ToArray())
        CandidateContext = $readContext
        CurrentOpeningReentry = $currentOpeningReentry
        StructureWorkReentry = $structureWorkReentry
        Notes           = @($notes.ToArray())
    }
}
