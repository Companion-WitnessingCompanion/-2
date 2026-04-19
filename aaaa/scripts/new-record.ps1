[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("session", "judgment", "emergency")]
    [string]$Kind,

    [string]$Reason,

    [string]$RelatedSession
)

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$recordsDir = Join-Path $workspaceRoot "records"

if (-not (Test-Path -LiteralPath $recordsDir)) {
    throw "Records directory not found: $recordsDir"
}

function Get-NextNumber {
    param(
        [string]$Pattern,
        [string]$Regex
    )

    $max = 0
    $files = Get-ChildItem -LiteralPath $recordsDir -File -Filter $Pattern -ErrorAction SilentlyContinue

    foreach ($file in $files) {
        if ($file.Name -match $Regex) {
            $value = [int]$Matches[1]
            if ($value -gt $max) {
                $max = $value
            }
        }
    }

    return ($max + 1)
}

function New-SessionRecord {
    $date = Get-Date -Format "yyyy-MM-dd"
    $next = Get-NextNumber -Pattern "10_session_${date}_pilot_*.md" -Regex "^10_session_\d{4}-\d{2}-\d{2}_pilot_(\d{2})\.md$"
    $seq = "{0:D2}" -f $next
    $fileName = "10_session_${date}_pilot_${seq}.md"
    $title = "Session $date Pilot $seq"
    $firstLine = if ($Reason) {
        "이번 세션은 $Reason 때문에 시작되었다."
    }
    else {
        "이번 세션은 아직 이름 붙지 않은 문제 앞에서 시작되었다."
    }

    $content = @(
        $firstLine,
        "",
        "# $title",
        "",
        "## 작업 선택",
        "- 유형:",
        "- 직접 원인:",
        "- 먼저 읽은 세트:",
        "- 끊지 않으려는 것:",
        "- 상향 조건:",
        "",
        "## 시작 전 읽은 문서",
        "- ideal_code_foundation_v1.md",
        "- translation_rhythm_entry_73_105_v1.md",
        "- attitude_memory_laws_166_186_v1.md",
        "- ground_memory_absence_success_187_210_v1.md",
        "",
        "## 이번 세션의 입구 질문",
        "- 무엇을 잇는가",
        "- 무엇을 지키는가",
        "- 무엇을 끊지 않는가",
        "",
        "## 이번 세션의 잠정 목적",
        "- ",
        "",
        "## Seed Inbox",
        "",
        "### S-001",
        "문제:",
        "가치:",
        "기울기:",
        "재검토:",
        "",
        "## 세션 종료 정리",
        "- 무엇이 태어났는가:",
        "- 무엇이 바뀌었는가:",
        "- 무엇을 다음에 다시 읽어야 하는가:"
    )

    return @{
        FileName = $fileName
        Content = $content
        Next = "Fill the session purpose and first Seed."
    }
}

function New-JudgmentRecord {
    $next = Get-NextNumber -Pattern "20_J-*.md" -Regex "^20_J-(\d{3})\.md$"
    $seq = "{0:D3}" -f $next
    $label = "J-$seq"
    $fileName = "20_${label}.md"
    $firstLine = if ($Reason) {
        "이 판단은 $Reason 때문에 정식 판단으로 올라왔다."
    }
    else {
        "이 판단은 아직 이름 붙지 않은 이유 때문에 정식 판단으로 올라왔다."
    }

    $relatedSessionLine = if ($RelatedSession) {
        "- 관련 세션: $RelatedSession"
    }
    else {
        "- 관련 세션:"
    }

    $content = @(
        $firstLine,
        "",
        "# $label",
        "",
        "## 핵문장",
        "우리는 [문제] 앞에서 [가치]를 지키기 위해 [선택]을 하며, [대가]를 감수한다.",
        "이 판단은 [조건] 아래에서 유효하고, [경계]를 넘지 않아야 하며, [증거]에 의해 지금 필요해진다.",
        "",
        "## 상태",
        "- 후보 / 활성 / 보류 / 계승 / 지층",
        "",
        "## 연결",
        "- 부모:",
        $relatedSessionLine,
        "- 관련 문서:",
        "- 관련 코드:",
        "",
        "## 재검토",
        "- 언제:",
        "- 무엇이 바뀌면 다시 보는가:"
    )

    return @{
        FileName = $fileName
        Content = $content
        Next = "Write the core judgment sentence and set its state."
    }
}

function New-EmergencyRecord {
    $next = Get-NextNumber -Pattern "30_E-*.md" -Regex "^30_E-(\d{3})\.md$"
    $seq = "{0:D3}" -f $next
    $label = "E-$seq"
    $fileName = "30_${label}.md"
    $firstLine = if ($Reason) {
        "이 문서는 $Reason 상황에서의 응급 봉합을 망각으로 굳히지 않기 위해 남긴다."
    }
    else {
        "이 문서는 아직 이름 붙지 않은 상황에서의 응급 봉합을 망각으로 굳히지 않기 위해 남긴다."
    }

    $relatedSessionLine = if ($RelatedSession) {
        "- 관련 세션: $RelatedSession"
    }
    else {
        "- 관련 세션:"
    }

    $content = @(
        $firstLine,
        "",
        "# $label",
        "",
        "## 위험",
        "- 무엇이 무너지고 있었는가:",
        "",
        "## 응급 이유",
        "- 왜 지금 바로 막아야 했는가:",
        "",
        "## 임시 조치",
        "- 무엇을 했는가:",
        "",
        "## 보호 대상",
        "- 무엇을 우선 지켰는가:",
        "",
        "## 후속 필요",
        "- 무엇을 다시 읽고 고쳐야 하는가:",
        "",
        "## 연결",
        $relatedSessionLine,
        "",
        "## 상태",
        "- 임시 / 응급 / 재심 필요"
    )

    return @{
        FileName = $fileName
        Content = $content
        Next = "Describe the temporary action and what must be revisited."
    }
}

$result = switch ($Kind) {
    "session" { New-SessionRecord }
    "judgment" { New-JudgmentRecord }
    "emergency" { New-EmergencyRecord }
}

$path = Join-Path $recordsDir $result.FileName

if (Test-Path -LiteralPath $path) {
    throw "Refusing to overwrite existing file: $path"
}

[System.IO.File]::WriteAllText(
    $path,
    ($result.Content -join [Environment]::NewLine) + [Environment]::NewLine,
    [System.Text.UTF8Encoding]::new($true)
)

Write-Output "Created: $path"
Write-Output "Kind: $Kind"
Write-Output "Next: $($result.Next)"
