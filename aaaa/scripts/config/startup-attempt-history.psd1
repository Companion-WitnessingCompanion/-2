@{
    Stance = '문제는 곧바로 덮어쓰지 않고, 왜 생겼는지와 다음 시도 조건을 작은 지층으로 남긴다.'

    Attempts = @(
        @{
            Id = 'A-001'
            Status = 'observed'
            Title = '첫 start-work brief 골격'
            WhyStarted = '문서와 기록의 철학을 AI가 작업 시작 전에 실제로 읽을 수 있는 코드로 내리기 위해.'
            WhatWasAdded = @(
                'startup-model.psd1로 entry ritual, active question, layer, work type을 코드 밖으로 분리했다.',
                'work-context.ps1와 start-work.ps1를 만들어 작업 시작 brief를 실제로 생성하게 했다.',
                'check-read-context.ps1가 공용 read-context 로직을 재사용하도록 정리했다.'
            )
            ExposedIssues = @(
                'PowerShell data file import가 로컬 startup model을 엄격하게 파싱하지 못했다.',
                'Windows/PowerShell 출력 흐름에서 일부 한글 메모가 깨졌다.',
                '추정된 work type이 notes에 hint처럼 다시 흘러드는 작은 혼선이 드러났다.'
            )
            NextAttempt = @(
                '시도 이유와 드러난 문제를 코드 옆의 attempt/history layer로 따로 남긴다.',
                '문제는 삭제보다 추가 기록으로 다루고, 다음 시도 조건을 함께 남긴다.'
            )
            Triggers = @('start-work', 'history', 'attempt', '시도', '역사', '코드의 코드')
            Files = @(
                'scripts/config/startup-model.psd1',
                'scripts/lib/work-context.ps1',
                'scripts/start-work.ps1',
                'scripts/check-read-context.ps1'
            )
        },
        @{
            Id = 'A-002'
            Status = 'active'
            Title = 'attempt/history layer 추가'
            WhyStarted = '문제가 생겼을 때 곧바로 수정으로 닫지 않고, 왜 이런 문제가 드러났는지 이해 가능한 층으로 남기기 위해.'
            WhatWasAdded = @(
                'startup-attempt-history.psd1로 시도의 지층을 코드 밖에 따로 두었다.',
                'start-work와 관련 도구가 필요할 때 이 시도 층을 함께 읽을 수 있게 연결한다.'
            )
            ExposedIssues = @(
                'history layer가 너무 전면에 나오면 실제 작업 입구를 가릴 수 있다.',
                '어떤 시도를 어떤 task와 target에 연결해야 하는지 기준이 더 필요하다.'
            )
            NextAttempt = @(
                '실제 current 개정 시도 뒤에, 이 history layer가 다음 진입을 덜 맨손으로 만드는지 본다.',
                '필요하면 이후에는 새 attempt를 덧붙이는 scaffold도 만든다.'
            )
            Triggers = @('start-work', 'history', 'attempt', '시도', '역사', 'current', 'entry', '호흡')
            Files = @(
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-003'
            Status = 'active'
            Title = 'current 0번 예식 first landing preview'
            WhyStarted = '0번 예식을 실제 current에 앉혀 보았을 때, 세 질문보다 앞서지 않으면서도 입구 호흡을 바꾸는지 경험적으로 확인하기 위해.'
            WhatWasAdded = @(
                'preview-current-entry.ps1를 만들어 current 본문을 직접 덮어쓰지 않고, 0번 예식을 끼워 넣은 preview를 실행할 수 있게 한다.',
                'preview 결과와 함께 무엇을 관찰해야 하는지 간단한 landing check를 같이 남긴다.'
            )
            ExposedIssues = @(
                'preview가 너무 설명적으로 커지면 실제 current보다 시험 도구가 더 커질 수 있다.',
                '섹션 제목 위치가 바뀌면 현재 자동 삽입 규칙이 깨질 수 있다.'
            )
            NextAttempt = @(
                'preview를 실제로 읽어 보며 0번 예식이 세 질문을 가리지 않는지 본다.',
                '필요하면 이후에 실제 current 개정은 preview가 아니라 더 얇은 patch로 내려간다.'
            )
            Triggers = @('preview', 'current', '0번', 'entry', 'landing', '호흡', '예식')
            Files = @(
                'scripts/preview-current-entry.ps1'
            )
        },
        @{
            Id = 'A-004'
            Status = 'active'
            Title = 'current 0번 예식 first landing patch'
            WhyStarted = 'preview로 확인한 0번 예식의 세 줄을 실제 current에 아주 얇게 내려, 입구 호흡이 실제 문서에서도 바뀌는지 보기 위해.'
            WhatWasAdded = @(
                '00_current_world.md의 현재 경계 아래와 현재 활성 질문 위에 0번 예식 세 줄을 실제로 삽입했다.',
                '마지막 갱신 이유를 이번 입구 호흡 교정에 맞게 업데이트했다.'
            )
            ExposedIssues = @(
                '세 줄이 실제 본문에서 새 중심처럼 커지지 않는지 아직 몇 번의 실제 사용을 통해 봐야 한다.',
                'preview에서는 괜찮아 보여도 실제 세션들에서는 세 질문의 질이 충분히 달라지지 않을 수 있다.'
            )
            NextAttempt = @(
                '몇 번의 실제 세션에서 current를 이 호흡으로 열어 보고, 세 질문이 덜 맨손으로 시작되는지 관찰한다.',
                '필요하면 이후에는 좌우명 재번역보다 먼저 세 줄의 간격과 물러남을 더 미세하게 조정한다.'
            )
            Triggers = @('current', '0번', 'landing', 'patch', 'entry', '호흡', '예식')
            Files = @(
                'records/00_current_world.md'
            )
        },
        @{
            Id = 'A-005'
            Status = 'active'
            Title = 'current entry observation layer'
            WhyStarted = '실제 세션들에서 current가 더 정직하게 늦어지고 있는지, 0번 예식이 세 질문을 덜 맨손으로 만들고 있는지 관찰 가능한 층으로 남기기 위해.'
            WhatWasAdded = @(
                'observe-current-entry.ps1를 만들어 current 진입의 관찰 질문과 기록 저장을 함께 다루게 한다.',
                'current-entry-observations.json를 만들어 실제 관찰 결과를 누적할 수 있는 자리로 둔다.'
            )
            ExposedIssues = @(
                '관찰 문항이 너무 많으면 실제 세션의 흐름을 다시 굳게 만들 수 있다.',
                '관찰이 남아도 실제 future recall이 빈약하면 형식만 남을 수 있다.'
            )
            NextAttempt = @(
                '몇 번의 실제 관찰이 쌓이면 어떤 질문이 진짜 유효한지, 어떤 질문은 덜 필요한지 다시 정리한다.',
                '필요하면 이후에는 관찰 결과를 바탕으로 0번 예식의 간격이나 wording보다 사용 리듬을 먼저 조정한다.'
            )
            Triggers = @('observe', 'observation', 'current', 'entry', '호흡', '관찰', '세션')
            Files = @(
                'scripts/observe-current-entry.ps1',
                'scripts/data/current-entry-observations.json'
            )
        },
        @{
            Id = 'A-006'
            Status = 'active'
            Title = 'observation layer stabilization'
            WhyStarted = '관찰 층이 실제 current의 질문 구조를 제대로 읽고, 저장 기록도 매번 같은 모양의 배열로 남도록 안정화하기 위해.'
            WhatWasAdded = @(
                'work-context.ps1에 markdown H2 section을 구조적으로 읽는 공용 helper를 추가했다.',
                'observe-current-entry.ps1이 이제 특정 문장 일치 대신 current의 실제 활성 질문 section을 읽는다.',
                'observation store 저장 형식을 항상 배열 JSON으로 유지하도록 정리했다.'
            )
            ExposedIssues = @(
                '문장 literal 매칭은 인코딩과 출력 환경에 따라 쉽게 흔들릴 수 있다.',
                '관찰 기록은 저장되더라도 한 개일 때 object처럼 접히면 history 층이 다시 읽기 어려워진다.',
                '저장이 안 된 것처럼 보였던 순간도 실제로는 저장과 읽기를 동시에 돌린 관찰 순서 문제일 수 있다.'
            )
            NextAttempt = @(
                '실제 observation을 한 번 더 저장해 active questions가 채워지고 store가 안정적으로 누적되는지 본다.',
                '그 다음에는 관찰 질문 자체를 더 줄일지, 혹은 실제 세션에서 필요한 최소 관찰만 남길지 다시 묻는다.',
                '검증 단계에서도 병렬 관찰보다 순차 관찰이 더 정직한지 함께 확인한다.'
            )
            Triggers = @('observe', 'observation', 'stabilize', 'history', 'current', 'entry')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/observe-current-entry.ps1',
                'scripts/data/current-entry-observations.json'
            )
        },
        @{
            Id = 'A-007'
            Status = 'active'
            Title = 'current opening runner'
            WhyStarted = 'start-work, current 입구, observation이 따로 흩어지지 않고 실제로 current를 여는 한 번의 실행 흐름으로 이어지게 하기 위해.'
            WhatWasAdded = @(
                'run-current-entry.ps1를 추가해 current opening을 위한 task context, entry ritual, active questions, relevant attempts, observation을 한 자리에서 보게 했다.',
                '필요하면 같은 흐름 안에서 observation까지 바로 저장할 수 있게 했다.'
            )
            ExposedIssues = @(
                '흐름을 한 군데에 모을수록 출력이 다시 너무 두꺼워질 수 있다.',
                'runner가 편해질수록 오히려 pause와 future recall이 형식으로 미끄러질 위험도 함께 커진다.'
            )
            NextAttempt = @(
                '실제 task 하나를 두고 run-current-entry를 써 보며, 이것이 current opening을 더 쉽게 만드는지 본다.',
                '너무 두껍게 느껴지면 attempt/history나 read-now 일부를 runner에서 덜어내고, 실제 opening 리듬만 남긴다.'
            )
            Triggers = @('run', 'runner', 'current', 'entry', 'opening', 'session', 'flow')
            Files = @(
                'scripts/run-current-entry.ps1'
            )
        },
        @{
            Id = 'A-008'
            Status = 'active'
            Title = 'current opening run history'
            WhyStarted = 'current를 실제로 여는 시도가 observation만으로는 얇게 남기 어려워, 어떤 task와 어떤 future와 어떤 attempt 묶음으로 열었는지를 run 단위 history로 남기기 위해.'
            WhatWasAdded = @(
                'current-opening-runs.json store를 추가해 run-current-entry의 실행 자체를 누적할 수 있게 했다.',
                'run-current-entry.ps1에 SaveRun을 붙여 current opening run을 observation과 함께 저장할 수 있게 했다.',
                'show-current-opening-runs.ps1를 추가해 이 run history를 다시 길어 올려 읽을 수 있게 했다.'
            )
            ExposedIssues = @(
                'run history가 너무 두꺼워지면 observation과 attempt/history 사이에서 또 다른 행정 층처럼 느껴질 수 있다.',
                '무엇을 run 단위로 남기고 무엇은 observation에만 남길지 경계가 아직 완전히 고정되지는 않았다.'
            )
            NextAttempt = @(
                '실제 task 하나를 SaveRun까지 켜서 current opening run history에 남기고, 이 층이 다시 읽기와 재진입에 도움이 되는지 본다.',
                '필요하면 이후에는 run history를 더 얇게 만들거나, 반대로 markdown snapshot도 함께 남길지 다시 묻는다.'
            )
            Triggers = @('run', 'history', 'current', 'entry', 'opening', 'save', 'session')
            Files = @(
                'scripts/run-current-entry.ps1',
                'scripts/show-current-opening-runs.ps1',
                'scripts/data/current-opening-runs.json'
            )
        },
        @{
            Id = 'A-009'
            Status = 'active'
            Title = 'current opening markdown snapshots'
            WhyStarted = 'run history가 JSON으로만 남으면 다시 읽을 수는 있어도, 사람이 그 순간의 호흡과 맥락을 바로 길어 올리기엔 얇아서 markdown snapshot 층을 함께 남기기 위해.'
            WhatWasAdded = @(
                'run-current-entry.ps1가 SaveRun과 함께 markdown snapshot도 남기도록 확장했다.',
                'snapshot은 current opening run 하나의 task, future, active questions, attempt layer, observation을 사람 읽기 형식으로 보존한다.'
            )
            ExposedIssues = @(
                'snapshot이 너무 자주 쌓이면 우물보다 퇴적층처럼 무거워질 수 있다.',
                'JSON store와 markdown snapshot이 같은 run을 다른 밀도로 남기기 때문에, 둘의 역할을 나중에 더 분명히 나눌 필요가 있다.'
            )
            NextAttempt = @(
                '실제 SaveRun 뒤 snapshot file이 같이 생기는지 보고, 이 markdown 층이 정말 다시 읽기 쉬운지 확인한다.',
                '필요하면 이후에는 latest snapshot만 빠르게 여는 작은 viewer를 추가할지 묻는다.'
            )
            Triggers = @('snapshot', 'markdown', 'run', 'history', 'current', 'entry')
            Files = @(
                'scripts/run-current-entry.ps1'
            )
        },
        @{
            Id = 'A-010'
            Status = 'active'
            Title = 'run store snapshot linking'
            WhyStarted = 'snapshot file이 실제로 생겨도 run store와 연결되지 않으면, 나중에 JSON 층에서 markdown 층으로 다시 건너가기 어렵기 때문에 둘 사이의 고리를 남기기 위해.'
            WhatWasAdded = @(
                'run-current-entry.ps1가 SaveRun 시 snapshot path를 run store 안에도 함께 남기도록 정리했다.',
                'show-current-opening-runs.ps1가 snapshot path가 있는 run은 같이 보여주도록 확장했다.'
            )
            ExposedIssues = @(
                '기존 run record에는 snapshot path가 없어서, 층의 성숙 이전 기록과 이후 기록의 밀도가 조금 다르다.',
                'run history가 두 겹(JSON/store + markdown/snapshot)으로 가는 만큼 이후에는 어느 층을 먼저 읽을지 더 분명히 해야 한다.'
            )
            NextAttempt = @(
                '새 run 하나를 다시 저장해 snapshot path가 store와 viewer에 함께 나타나는지 본다.',
                '필요하면 이후에는 latest snapshot으로 바로 여는 작은 viewer를 추가할지 다시 묻는다.'
            )
            Triggers = @('snapshot', 'path', 'run', 'history', 'link', 'current')
            Files = @(
                'scripts/run-current-entry.ps1',
                'scripts/show-current-opening-runs.ps1'
            )
        },
        @{
            Id = 'A-011'
            Status = 'active'
            Title = 'history viewer tolerance'
            WhyStarted = 'history viewer가 최신 층만 읽을 수 있으면 진짜 history가 아니라서, 밀도가 다른 이전 run도 함께 품을 수 있게 하기 위해.'
            WhatWasAdded = @(
                'show-current-opening-runs.ps1가 legacy run record처럼 속성이 일부 비어 있는 entry도 안전하게 보여주도록 조정했다.'
            )
            ExposedIssues = @(
                '초기 실험 기록은 새 구조보다 성긴 경우가 많아서, viewer가 완벽한 record만 기대하면 history 자체를 가려버린다.'
            )
            NextAttempt = @(
                'viewer가 예전 record와 새 record를 함께 읽을 수 있는지 다시 확인한다.',
                '필요하면 이후에는 record schema version을 남길지, 혹은 지금처럼 tolerance로 감쌀지 다시 묻는다.'
            )
            Triggers = @('viewer', 'history', 'legacy', 'tolerance', 'current', 'run')
            Files = @(
                'scripts/show-current-opening-runs.ps1'
            )
        },
        @{
            Id = 'A-012'
            Status = 'active'
            Title = 'latest snapshot viewer'
            WhyStarted = 'run history와 snapshot 층이 충분히 쌓이기 시작했으니, 전체를 다 펼치기 전에 가장 최근의 current opening 한 번을 바로 길어 올릴 수 있는 작은 viewer가 필요해졌기 때문에.'
            WhatWasAdded = @(
                'show-latest-current-opening-snapshot.ps1를 추가해 가장 최근 snapshot을 직접 읽거나, 경로와 메타만 얇게 볼 수 있게 한다.'
            )
            ExposedIssues = @(
                'latest만 보는 도구는 빠르지만, 전체 계보를 잊게 만들 수 있다.',
                'run store에 snapshot path가 없는 초기 기록들과의 관계는 여전히 느슨하게 남아 있다.'
            )
            NextAttempt = @(
                'latest snapshot viewer가 실제로 최근 run을 다시 열어주는지 확인한다.',
                '필요하면 이후에는 latest run summary와 latest snapshot을 함께 보여주는 더 얇은 combined view를 생각해본다.'
            )
            Triggers = @('latest', 'snapshot', 'viewer', 'current', 'entry', 'run')
            Files = @(
                'scripts/show-latest-current-opening-snapshot.ps1'
            )
        },
        @{
            Id = 'A-013'
            Status = 'active'
            Title = 'latest current opening combined view'
            WhyStarted = 'The latest snapshot viewer is fast, but it separates the latest run summary from the latest snapshot body. This layer was added so the latest current opening can be lifted back up in one place.'
            WhatWasAdded = @(
                'Added show-latest-current-opening.ps1 to display the latest run summary and the latest snapshot together.',
                'Kept the view thin: it shows run count, latest run state, snapshot metadata, and optionally the snapshot body.'
            )
            ExposedIssues = @(
                'A combined view can become too heavy if it tries to replace the run history viewer and the snapshot viewer at the same time.',
                'Older run entries may not include every field, so the combined view still needs to stay tolerant and quiet.'
            )
            NextAttempt = @(
                'Run the combined viewer in metadata mode and full markdown mode to make sure it can be used as a quick re-entry surface.',
                'If it feels right, use it before the next real current opening run instead of reading multiple files separately.'
            )
            Triggers = @('latest', 'current', 'opening', 'combined', 'view', 'snapshot', 'run')
            Files = @(
                'scripts/show-latest-current-opening.ps1'
            )
        },
        @{
            Id = 'A-014'
            Status = 'active'
            Title = 'next current opening scaffold'
            WhyStarted = 'Reading the latest run is helpful, but the next step is easier when the latest state can immediately turn into the next run scaffold. This layer exists to reduce the gap between review and the next attempt.'
            WhatWasAdded = @(
                'Added show-next-current-opening-scaffold.ps1 to carry forward the latest task, future, notes, and attempts.',
                'Included the active questions and a ready-to-run command example so the next run can start from experience rather than from scratch.'
            )
            ExposedIssues = @(
                'A scaffold can quietly become a script of habit if it always repeats the previous task without a new recalled future.',
                'The carry-forward layer is helpful only if it stays thin and still leaves room for a real pause before entering.'
            )
            NextAttempt = @(
                'Run the scaffold viewer and check whether it makes the next run easier without turning into another rigid ritual block.',
                'If it helps, use the scaffold together with run-current-entry on the next real current opening task and observe what changes.'
            )
            Triggers = @('next', 'scaffold', 'current', 'opening', 'carry-forward', 'run')
            Files = @(
                'scripts/show-next-current-opening-scaffold.ps1'
            )
        },
        @{
            Id = 'A-015'
            Status = 'active'
            Title = 'scaffold contract alignment'
            WhyStarted = 'The first scaffold attempt failed not because current lost its headings, but because the scaffold still called Get-CurrentEntrySections with an old path-shaped assumption after the helper had shifted to a content-first contract.'
            WhatWasAdded = @(
                'Updated the scaffold to read current content first and pass -Content and -RelativePath into Get-CurrentEntrySections.',
                'Turned the failure into an explicit history layer so future scripts are less likely to drift behind the shared helper contract.'
            )
            ExposedIssues = @(
                'Thin helper changes can quietly break new scripts when the script copies an older calling shape instead of following the current shared contract.',
                'This kind of failure looks like a document problem at first, so it is worth recording that the real issue lived in the caller layer.'
            )
            NextAttempt = @(
                'Run the scaffold again and confirm that active questions now flow through from the shared helper correctly.',
                'If this pattern repeats, consider adding a dedicated helper that returns the current file plus parsed entry sections in one call.'
            )
            Triggers = @('scaffold', 'contract', 'alignment', 'current', 'helper', 'content')
            Files = @(
                'scripts/show-next-current-opening-scaffold.ps1',
                'scripts/lib/work-context.ps1'
            )
        },
        @{
            Id = 'A-016'
            Status = 'active'
            Title = 'current opening reentry surface'
            WhyStarted = 'The latest view and the next scaffold each helped on their own, but AI start-up is easier when both layers are available in one thin re-entry surface.'
            WhatWasAdded = @(
                'Added show-current-opening-reentry.ps1 to combine the latest opening summary and the next-run scaffold.',
                'Kept snapshot body optional so the default surface stays thin and quick to lift back up.'
            )
            ExposedIssues = @(
                'A reentry surface can become a new heavy dashboard if it tries to replace every lower viewer at once.',
                'If the combined layer starts repeating too much history, it will stop helping entry and start slowing it down.'
            )
            NextAttempt = @(
                'Run the reentry surface in thin mode first and check whether it actually feels like a better AI starting point.',
                'If it helps, use it as the first read layer before the next real run-current-entry attempt.'
            )
            Triggers = @('reentry', 'current', 'opening', 'latest', 'scaffold', 'ai-start')
            Files = @(
                'scripts/show-current-opening-reentry.ps1'
            )
        },
        @{
            Id = 'A-017'
            Status = 'active'
            Title = 'reentry invocation alignment'
            WhyStarted = 'The first reentry surface looked right in shape but passed the latest-viewer switch through a plain string array, which made the lower script bind arguments in the wrong layer.'
            WhatWasAdded = @(
                'Changed the reentry script to call the latest viewer with explicit named parameters instead of a plain argument array.',
                'Recorded that this failure lived in script-to-script invocation, not in the latest viewer output itself.'
            )
            ExposedIssues = @(
                'Thin wrapper scripts can look correct while still passing arguments through in a way that quietly changes meaning at the lower layer.',
                'This kind of failure can partially render useful output and still hide a binding problem unless we read both the output and the error together.'
            )
            NextAttempt = @(
                'Run the reentry surface again and confirm that the latest layer and the scaffold now travel together cleanly.',
                'If wrapper layers keep growing, consider moving shared latest/scaffold gathering into a helper instead of chaining scripts.'
            )
            Triggers = @('reentry', 'invocation', 'binding', 'wrapper', 'current')
            Files = @(
                'scripts/show-current-opening-reentry.ps1'
            )
        },
        @{
            Id = 'A-018'
            Status = 'active'
            Title = 'start next current opening runner'
            WhyStarted = 'Once the reentry surface and the next scaffold were both working, the next natural step was to let the next current opening attempt start directly from that carried-forward state instead of manually retyping it.'
            WhatWasAdded = @(
                'Added start-next-current-opening.ps1 to pull task and future from the scaffold and pass them into run-current-entry.',
                'Defaulted the runner toward saving observation and run history so the experiment leaves a new layer behind by default.'
            )
            ExposedIssues = @(
                'A start-runner can become too automatic if it always reuses the previous future without a fresh pause and re-hearing.',
                'Because the save switches are on by default, this layer should stay visibly experimental rather than pretending to be the only right entry path.'
            )
            NextAttempt = @(
                'Run the starter once with a real follow-on task and check whether it feels like a helpful bridge rather than just another wrapper.',
                'If it helps, consider letting the reentry surface print this starter command as the default next action.'
            )
            Triggers = @('start', 'next', 'current', 'opening', 'runner', 'reentry')
            Files = @(
                'scripts/start-next-current-opening.ps1'
            )
        },
        @{
            Id = 'A-019'
            Status = 'active'
            Title = 'starter boolean ergonomics'
            WhyStarted = 'The first starter run failed not because the flow was wrong, but because CLI boolean arguments were too brittle at the boundary where people and scripts actually trigger the runner.'
            WhatWasAdded = @(
                'Made start-next-current-opening.ps1 accept loose boolean strings and normalize them before calling run-current-entry.',
                'Kept the lower runner unchanged so the ergonomics improvement stays in the human-facing starter layer.'
            )
            ExposedIssues = @(
                'A wrapper can look simpler while still being harder to use if its boundary types are stricter than the way real shell calls arrive.',
                'Human-facing entry scripts need a slightly wider mouth than inner helper scripts, or experience keeps breaking before the real experiment begins.'
            )
            NextAttempt = @(
                'Run the starter again with the same verification task and confirm that a real saved run now lands in the history layers.',
                'If more CLI friction appears, collect those failures in the starter layer first instead of immediately reshaping every lower script.'
            )
            Triggers = @('starter', 'boolean', 'ergonomics', 'current', 'opening', 'runner')
            Files = @(
                'scripts/start-next-current-opening.ps1'
            )
        },
        @{
            Id = 'A-020'
            Status = 'active'
            Title = 'current opening state helper layer'
            WhyStarted = 'By this point, latest view, scaffold, reentry, and starter were all reading the same current opening state through slightly different paths. This helper layer was added so those scripts can stand on one shared state surface instead of drifting apart.'
            WhatWasAdded = @(
                'Added shared current opening helper functions in work-context.ps1 for latest state, scaffold state, starter command, and reentry state.',
                'Updated the latest view, scaffold, reentry surface, and starter runner to read from the shared helper layer instead of chaining scripts for the same data.'
            )
            ExposedIssues = @(
                'When read surfaces multiply, wrapper chaining can work for a while but still create quiet drift between identical concepts.',
                'A shared helper layer helps, but only if the top layers stay thin and do not start rebuilding their own parallel state logic again.'
            )
            NextAttempt = @(
                'Run the updated reentry and starter flow again to confirm the shared helper layer did not change the lived behavior.',
                'If this holds, let the reentry surface present the starter command as the default next action instead of only the direct run command.'
            )
            Triggers = @('helper', 'state', 'current', 'opening', 'reentry', 'scaffold')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-latest-current-opening.ps1',
                'scripts/show-next-current-opening-scaffold.ps1',
                'scripts/show-current-opening-reentry.ps1',
                'scripts/start-next-current-opening.ps1'
            )
        },
        @{
            Id = 'A-021'
            Status = 'active'
            Title = 'helper adoption alignment'
            WhyStarted = 'After the helper layer was added, the upper scripts still needed to explicitly stand on it. The first post-helper run showed that a shared layer is not really shared until each top script actually sources it.'
            WhatWasAdded = @(
                'Added explicit work-context sourcing back into show-current-opening-reentry.ps1 and start-next-current-opening.ps1.',
                'Recorded that the failure lived in helper adoption, not in the helper data itself.'
            )
            ExposedIssues = @(
                'A new shared layer can look finished while the real break still lives in the adoption boundary above it.',
                'When a wrapper shifts from script chaining to helper calls, the smallest missing source line can make the whole layer appear empty or broken.'
            )
            NextAttempt = @(
                'Run the reentry surface again and confirm that latest state, scaffold, and starter command all return through the helper path cleanly.',
                'Run the starter again after the helper adoption fix and check that a fully populated follow-on run lands in run history.'
            )
            Triggers = @('helper', 'adoption', 'alignment', 'reentry', 'starter', 'current')
            Files = @(
                'scripts/show-current-opening-reentry.ps1',
                'scripts/start-next-current-opening.ps1'
            )
        },
        @{
            Id = 'A-022'
            Status = 'active'
            Title = 'substantive latest selection'
            WhyStarted = 'The history should keep even partial or broken runs, but the reentry surface should usually lift the latest meaningful run instead of blindly following the last raw entry.'
            WhatWasAdded = @(
                'Added a substantive-run selection rule in the shared helper so latest state can skip over thin or broken raw runs without deleting them.',
                'Updated the reentry surface to show when the raw latest timestamp and the selected latest timestamp differ.'
            )
            ExposedIssues = @(
                'History and reentry do not need to have the same selection rule: one preserves everything, the other should prefer what is most useful for the next honest entry.',
                'Selection rules can become too clever, so it matters to keep the rule small and visible.'
            )
            NextAttempt = @(
                'Run the reentry surface again and confirm that it now lifts the most recent substantive run rather than the most recent broken shell.',
                'If this keeps helping, consider using the same substantive selection in other AI-facing entry views.'
            )
            Triggers = @('substantive', 'latest', 'selection', 'reentry', 'history', 'current')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-current-opening-reentry.ps1'
            )
        },
        @{
            Id = 'A-023'
            Status = 'active'
            Title = 'start work current reentry bridge'
            WhyStarted = 'The start-work brief could already infer work type and read layers, but current-facing work still had to open a second surface to remember the latest entry rhythm. This bridge was added so current work can begin with that living reentry state already in hand.'
            WhatWasAdded = @(
                'Attached current opening reentry data to New-StartWorkContext whenever the work type or target is directly touching current.',
                'Extended start-work.ps1 so the brief can print the latest substantive current opening state together with the next starter command and direct run command.'
            )
            ExposedIssues = @(
                'A start brief can stay rich in documents and still miss the lived entry rhythm if it does not carry the latest opening state.',
                'This bridge should stay thin, or start-work could slowly turn into a second full reentry viewer instead of remaining a brief.'
            )
            NextAttempt = @(
                'Run start-work against records/00_current_world.md and confirm the reentry block helps the first read without replacing the dedicated reentry surface.',
                'If this keeps helping, consider letting AI-facing current workflows begin from start-work alone before branching into deeper current-opening tools.'
            )
            Triggers = @('start-work', 'current', 'reentry', 'brief', 'entry')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/start-work.ps1'
            )
        },
        @{
            Id = 'A-024'
            Status = 'active'
            Title = 'task-aware start work starter handoff'
            WhyStarted = 'Once the start-work brief could carry current opening reentry, the next friction showed up immediately: the starter command still leaned on the previous latest run instead of the task now being opened. This layer exists to let the brief hand the present task forward without losing the recalled-future rhythm.'
            WhatWasAdded = @(
                'Adjusted the start-work to current-opening bridge so current reentry is built with the present task as TaskHint.',
                'Kept future carry-forward behavior intact so the handoff can be task-aware without throwing away the latest recalled future.'
            )
            ExposedIssues = @(
                'If task handoff becomes too eager, the brief may start overwriting useful follow-on phrasing that the latest scaffold was already carrying.',
                'This layer should stay small: start-work should suggest the next honest run, not become a second orchestration engine.'
            )
            NextAttempt = @(
                'Run start-work for a current task and confirm the starter command now follows the present task instead of the older latest run label.',
                'Use that starter command once and check whether the new run lands as a natural continuation rather than as a detached helper verification.'
            )
            Triggers = @('start-work', 'task', 'starter', 'handoff', 'current')
            Files = @(
                'scripts/lib/work-context.ps1'
            )
        },
        @{
            Id = 'A-025'
            Status = 'active'
            Title = 'begin current work wrapper'
            WhyStarted = 'After the start-work brief could carry the latest current-opening rhythm, the next natural experiment was to see whether brief and lived opening could be stepped through in one small surface instead of two separate commands.'
            WhatWasAdded = @(
                'Added begin-current-work.ps1 as a thin wrapper that builds the current start-work brief, resolves the next future, and immediately hands that task into the current-opening starter.',
                'Kept a preview-only mode so this layer can still pause and show the bridge before it actually runs.'
            )
            ExposedIssues = @(
                'A wrapper at this layer can become too orchestral if it starts rebuilding every detail of start-work and starter instead of staying a thin bridge.',
                'Because it runs real entry code, it matters that preview and execution stay clearly distinguishable.'
            )
            NextAttempt = @(
                'Run begin-current-work in preview mode first and check whether the bridge reads honestly before it executes.',
                'Then run it once for a real current task and confirm that the latest current-opening state updates without needing a second manual command.'
            )
            Triggers = @('begin', 'current', 'work', 'wrapper', 'bridge')
            Files = @(
                'scripts/begin-current-work.ps1'
            )
        },
        @{
            Id = 'A-026'
            Status = 'active'
            Title = 'begin current work command adoption'
            WhyStarted = 'Once begin-current-work proved it could actually carry a current task into a lived opening run, the surrounding read surfaces still needed to treat it as the primary bridge rather than keeping the older starter/direct commands in front.'
            WhatWasAdded = @(
                'Added shared begin-current-work command helpers so current-facing surfaces can print preview and run commands without rebuilding that command by hand.',
                'Updated start-work and current-opening reentry to show begin-current-work preview/run commands before the lower starter and direct run commands.'
            )
            ExposedIssues = @(
                'If every surface starts printing every possible command, the new bridge can become one more layer of clutter instead of a cleaner default path.',
                'This adoption only helps if begin-current-work really remains thinner than the combination it replaces.'
            )
            NextAttempt = @(
                'Run start-work and current-opening reentry again and confirm that the wrapper commands now read like the natural first move.',
                'If they do, use begin-current-work for another lived current task and see whether the old starter command can gradually become more secondary.'
            )
            Triggers = @('begin-current-work', 'adoption', 'reentry', 'start-work', 'current')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/start-work.ps1',
                'scripts/show-current-opening-reentry.ps1'
            )
        },
        @{
            Id = 'A-027'
            Status = 'active'
            Title = 'begin work generic entrypoint'
            WhyStarted = 'Once current had a lived begin-current-work bridge, the next missing piece was a single general doorway that could decide whether to run a lived current opening or stay honestly at brief level for other work types.'
            WhatWasAdded = @(
                'Added begin-work.ps1 as a generic start surface that resolves work type first, then delegates to begin-current-work for current_update.',
                'Kept non-current work types in a brief-only mode instead of pretending there is already a lived execution bridge for every kind of work.'
            )
            ExposedIssues = @(
                'A generic begin-work layer can become misleading if it promises execution symmetry before the lower work types have their own lived bridges.',
                'Delegation only stays honest if begin-work remains thin and does not start duplicating the full logic of every underlying mode.'
            )
            NextAttempt = @(
                'Run begin-work once for a current task and once for a non-current task to confirm the split between lived bridge and brief-only mode is clear.',
                'If this feels right, consider making begin-work the first AI-facing entry command while lower begin-* scripts remain specialized engines underneath.'
            )
            Triggers = @('begin-work', 'generic', 'entrypoint', 'start', 'current')
            Files = @(
                'scripts/begin-work.ps1'
            )
        },
        @{
            Id = 'A-028'
            Status = 'active'
            Title = 'structure reset lived begin bridge'
            WhyStarted = 'Once begin-work could honestly split current into a lived bridge and non-current into brief-only mode, the next missing experiment was to give structure_reset its own first lived bridge instead of leaving every non-current path equally flat.'
            WhatWasAdded = @(
                'Added begin-structure-work.ps1 as a first lived start surface for structure_reset that saves a structure work run and snapshot instead of stopping at brief-only mode.',
                'Updated begin-work.ps1 so structure_reset now delegates into begin-structure-work while other work types still stay honestly brief-only.'
            )
            ExposedIssues = @(
                'A first lived structure bridge can still be too thin if it only preserves the brief and not enough of the actual restructuring posture.',
                'If every work type gets its own begin-* script too quickly, the family can fragment before the shared entry logic matures.'
            )
            NextAttempt = @(
                'Run begin-work for structure_reset and confirm that it now lands a saved structure work run instead of falling back to brief-only mode.',
                'If this helps, consider what the minimal observation layer for structure work should be before adding more begin-* bridges.'
            )
            Triggers = @('structure_reset', 'begin-structure-work', 'begin-work', 'foundation', 'routing')
            Files = @(
                'scripts/begin-structure-work.ps1',
                'scripts/begin-work.ps1'
            )
        },
        @{
            Id = 'A-029'
            Status = 'active'
            Title = 'structure work reentry surface'
            WhyStarted = 'Once structure_reset had its first lived begin bridge, it still lacked the thin read surface that current already had: a way to lift the latest run, the next scaffold, and the next honest begin command back into view without reopening the whole history by hand.'
            WhatWasAdded = @(
                'Added shared structure work helpers in work-context.ps1 for latest run selection, next scaffold generation, and structure reentry data.',
                'Added show-latest-structure-work.ps1, show-next-structure-work-scaffold.ps1, and show-structure-work-reentry.ps1 as thin read surfaces over the new structure work run layer.',
                'Attached structure work reentry to start-work whenever the brief is directly touching structure_reset or ideal_code_foundation_v1.md.'
            )
            ExposedIssues = @(
                'The first structure bridge still has no dedicated observation layer, so the reentry surface can lift the last run and the next scaffold, but it cannot yet say much about the quality of the restructuring rhythm itself.',
                'If every work type grows a full viewer family too quickly, the begin/read surface can fragment before a simpler shared pattern fully matures.'
            )
            NextAttempt = @(
                'Run start-work and show-structure-work-reentry against ideal_code_foundation_v1.md and confirm the latest structure layer can now be lifted without reopening raw stores by hand.',
                'Use begin-work for one more structure_reset task and see whether the new reentry surface feels like a real entry aid or still too thin to guide the next lived attempt.',
                'After a few structure runs, decide whether structure_reset needs its own observation layer or whether latest run plus scaffold is enough for now.'
            )
            Triggers = @('structure_reset', 'structure work', 'reentry', 'ideal_code_foundation', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/start-work.ps1',
                'scripts/show-latest-structure-work.ps1',
                'scripts/show-next-structure-work-scaffold.ps1',
                'scripts/show-structure-work-reentry.ps1'
            )
        },
        @{
            Id = 'A-030'
            Status = 'active'
            Title = 'structure work observation layer'
            WhyStarted = 'Once structure_reset had a lived begin bridge and a reentry surface, the next missing question was no longer where to re-enter, but whether the run actually helped. This layer exists to leave behind a minimal observation surface without forcing structure work into the full current-opening observation shape.'
            WhatWasAdded = @(
                'Added observe-structure-work.ps1 to capture a thin structure observation around target clarity, next-step nameability, and whether the bridge stayed thin.',
                'Added show-structure-work-observations.ps1 so the observation layer can be re-read without opening raw JSON by hand.',
                'Added a dedicated structure work observation store path in work-context.ps1.'
            )
            ExposedIssues = @(
                'This first observation layer still lives beside structure runs instead of inside them, so structure history and structure observation are related but not yet merged into one run record.',
                'If structure observation grows too quickly, it could become a second doctrine instead of a light check on whether the bridge actually helped.'
            )
            NextAttempt = @(
                'Save one real structure observation after a lived structure run and see whether the three checks are enough to tell if the reentry layer helped.',
                'After a few observations, decide whether structure observations should stay separate or be folded into structure runs the way current opening observations are.'
            )
            Triggers = @('structure observation', 'structure_reset', 'observation', 'foundation', 'reentry')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/observe-structure-work.ps1',
                'scripts/show-structure-work-observations.ps1'
            )
        },
        @{
            Id = 'A-031'
            Status = 'active'
            Title = 'structure observation boundary tolerance'
            WhyStarted = 'The first attempt to save a structure observation failed at the CLI boundary: boolean inputs were too strict for lived shell use, and the observation viewer still treated a missing store as an error instead of as an honest empty layer.'
            WhatWasAdded = @(
                'Made observe-structure-work.ps1 accept loose boolean values at the human-facing boundary before normalizing them into real booleans.',
                'Changed show-structure-work-observations.ps1 so an unopened observation layer reads as an empty history instead of as a hard failure.'
            )
            ExposedIssues = @(
                'Structure observation now opens more gently, but it still remains a separate layer beside structure runs rather than inside them.',
                'Boundary tolerance is helpful only if it stays at the edge; lower layers should not quietly lose their structural shape.'
            )
            NextAttempt = @(
                'Save the first real structure observation with loose CLI values and confirm the new store becomes readable immediately.',
                'After that, decide whether the next layer should merge observation into structure runs or keep observation as its own lighter well.'
            )
            Triggers = @('structure observation', 'boolean', 'tolerance', 'store', 'boundary')
            Files = @(
                'scripts/observe-structure-work.ps1',
                'scripts/show-structure-work-observations.ps1'
            )
        },
        @{
            Id = 'A-032'
            Status = 'active'
            Title = 'structure observation reentry bridge'
            WhyStarted = 'Once structure observations could actually be saved and re-read, the next missing layer was to let structure reentry and start-work lift that observation together with the latest run. Otherwise the observation well stayed real but detached.'
            WhatWasAdded = @(
                'Added a latest-structure-observation helper in work-context.ps1 and attached it to structure reentry data.',
                'Extended show-structure-work-reentry.ps1 and start-work.ps1 so the latest structure observation now comes back up alongside the latest run and next scaffold.',
                'Aligned show-structure-work-observations.ps1 json count with the markdown count path so the viewer stays stable in both formats.'
            )
            ExposedIssues = @(
                'Structure observation is now visible at reentry, but it still remains adjacent to the run rather than embedded inside the run record itself.',
                'If too many small surfaces all start repeating the same observation facts, reentry could slowly become another thick dashboard.'
            )
            NextAttempt = @(
                'Open start-work and structure reentry again for ideal_code_foundation_v1.md and confirm the latest structure observation now rises with the latest run.',
                'After a few more structure cycles, decide whether the next honest step is merging observation into structure runs or keeping this lighter side-well arrangement.'
            )
            Triggers = @('structure observation', 'reentry', 'start-work', 'foundation', 'latest observation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/start-work.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/show-structure-work-observations.ps1'
            )
        },
        @{
            Id = 'A-033'
            Status = 'active'
            Title = 'structure run and observation handoff'
            WhyStarted = 'Once structure observation rose back into reentry, the next missing layer was lived continuity: structure still had begin-work and observation as neighboring actions rather than one thin run that could leave both history and feeling together.'
            WhatWasAdded = @(
                'Added run-structure-work.ps1 to leave a lived structure run with observation, snapshot, and run-store persistence in one pass.',
                'Added start-next-structure-work.ps1 so structure_reset now has a starter layer like current opening instead of forcing a manual join between begin and observe.',
                'Rewired begin-structure-work.ps1 and structure reentry surfaces so the new structure run/starter commands rise back up into the normal entry path.'
            )
            ExposedIssues = @(
                'Structure now has a lived run path, but we still need to see whether embedding observation into run records is enough or whether the separate observation well remains the more honest primary memory.',
                'If begin, starter, and direct run all say nearly the same thing, structure reentry could become command-heavy instead of staying thin.'
            )
            NextAttempt = @(
                'Run one real structure cycle through the new starter path and confirm the latest structure run and latest structure observation still agree with each other.',
                'After a few lived cycles, decide whether the separate observation well should stay primary or yield some responsibility back to the richer run record.'
            )
            Triggers = @('structure run', 'structure observation', 'starter', 'reentry', 'foundation')
            Files = @(
                'scripts/run-structure-work.ps1',
                'scripts/start-next-structure-work.ps1',
                'scripts/begin-structure-work.ps1',
                'scripts/lib/work-context.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/start-work.ps1'
            )
        },
        @{
            Id = 'A-034'
            Status = 'active'
            Title = 'structure dual-memory alignment'
            WhyStarted = 'Once structure runs began carrying their own embedded observation while the separate observation well still remained alive, the next honest question was not yet which layer to delete but whether the two memories were actually saying the same thing.'
            WhatWasAdded = @(
                'Added a structure observation alignment helper in work-context.ps1 to compare the latest run-embedded observation with the latest separate observation well.',
                'Extended show-latest-structure-work.ps1, show-structure-work-reentry.ps1, and start-work.ps1 so the dual-memory status now rises as an explicit alignment surface instead of staying implicit.'
            )
            ExposedIssues = @(
                'If the two memories stay aligned for many cycles, the separate well may start to feel redundant even if it still serves as a lighter reading surface.',
                'If the two memories diverge, we will need to understand whether that divergence is a bug, a timing issue, or a sign that each layer is serving a genuinely different use.'
            )
            NextAttempt = @(
                'Open the latest structure views again and confirm that the run memory and the separate well currently read as fully aligned for A-033.',
                'After a few more lived runs, decide whether the next honest move is to keep both memories with explicit alignment or let one layer become secondary.'
            )
            Triggers = @('structure memory', 'alignment', 'observation', 'reentry', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-latest-structure-work.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/start-work.ps1'
            )
        },
        @{
            Id = 'A-035'
            Status = 'active'
            Title = 'structure begin parity with lived observation'
            WhyStarted = 'After structure got its own starter and lived run path, one asymmetry remained: begin-structure-work and the generic begin-work bridge could enter structure work, but they still could not carry the same observation feeling fields that current bridges already knew how to pass through.'
            WhatWasAdded = @(
                'Extended begin-structure-work.ps1 so it can pass target clarity, next-step nameability, and bridge-thinness into start-next-structure-work instead of forcing structure observation defaults at the begin layer.',
                'Extended begin-work.ps1 so generic structure_reset entry can now carry those same lived observation fields when it delegates into begin-structure-work.'
            )
            ExposedIssues = @(
                'Structure begin surfaces are now more symmetric with current, but that also means begin-work carries more work-type-specific feeling fields than before.',
                'If these feeling fields start appearing everywhere without real lived use, the bridge could become more ceremonial than helpful.'
            )
            NextAttempt = @(
                'Run begin-work once for structure_reset with explicit observation values and confirm the saved run and the separate well both reflect those values instead of defaults.',
                'After that, decide whether this parity is enough or whether structure also needs its own friendlier wrapper-level defaults and previews.'
            )
            Triggers = @('begin-work', 'structure_reset', 'observation parity', 'bridge', 'foundation')
            Files = @(
                'scripts/begin-structure-work.ps1',
                'scripts/begin-work.ps1'
            )
        },
        @{
            Id = 'A-036'
            Status = 'active'
            Title = 'structure memory history viewer'
            WhyStarted = 'Once latest alignment could be seen, the next missing layer was time: we still could not tell whether dual memory was only aligned at the newest point or whether it had been stable across several lived structure cycles, nor could we easily see which well entries still lived independently.'
            WhatWasAdded = @(
                'Added a structure memory history helper in work-context.ps1 that compares every run-backed observation with the separate well by timestamp and keeps independent well entries visible instead of collapsing them into the latest view.',
                'Added show-structure-memory-history.ps1 so the time-shape of structure memory can be re-read as a thin surface before deciding whether one memory layer should become secondary.'
            )
            ExposedIssues = @(
                'History now shows more than the latest point, but repeated alignment does not by itself prove that two layers should stay forever; it only shows whether they are still telling the same story.',
                'If the independent well entries keep growing while run-backed entries stay aligned, we will need to ask whether the well is becoming a separate use rather than merely a duplicate memory.'
            )
            NextAttempt = @(
                'Open the new structure memory history surface and confirm that A-033 and A-035 appear as dual-memory aligned entries while A-030 remains visible as an independent well entry.',
                'After a few more lived structure runs, use that history surface to judge whether the separate well still earns its place as a lighter reading layer.'
            )
            Triggers = @('structure memory', 'history', 'alignment', 'well', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-structure-memory-history.ps1'
            )
        },
        @{
            Id = 'A-037'
            Status = 'active'
            Title = 'structure memory history rises into reentry'
            WhyStarted = 'Once structure memory history existed as its own thin viewer, the next missing layer was returnability: reentry and start-work could still show latest alignment, but they did not yet hand back the time-shape of memory without another manual search.'
            WhatWasAdded = @(
                'Attached recent structure memory history and a direct history viewer command to Get-StructureWorkReentryData so reentry now carries latest state and recent memory shape together.',
                'Extended show-structure-work-reentry.ps1 and start-work.ps1 so structure surfaces now expose recent memory counts and the command to reopen the history layer.'
            )
            ExposedIssues = @(
                'Reentry now carries one more reflective surface, so we need to keep checking that this still feels like a thin handoff rather than a dashboard that explains too much before the next lived attempt.',
                'If the same history counts keep appearing without changing decisions, we may need to let the explicit history command carry more of the weight and keep the brief itself lighter.'
            )
            NextAttempt = @(
                'Open start-work and structure reentry again for ideal_code_foundation_v1.md and confirm that the recent memory counts and the history command now rise together with latest alignment.',
                'After another lived structure run, use the history command from reentry itself and see whether it actually shortens the path back into judgment.'
            )
            Triggers = @('structure memory', 'reentry', 'history command', 'start-work', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/start-work.ps1'
            )
        },
        @{
            Id = 'A-038'
            Status = 'active'
            Title = 'work entry map'
            WhyStarted = 'As entry, reentry, run, observation, snapshot, and history surfaces increased, the next risk was not raw file count but choice cost: an AI or human could know that the layers exist and still not know which surface to open first.'
            WhatWasAdded = @(
                'Added show-work-entry-map.ps1 as a thin static map of the primary doorways and supporting wells, with a simple principle: prefer the thinnest doorway that can honestly start the work.',
                'Separated primary surfaces from supporting surfaces so the growing toolset can be worn like a light entry layer instead of felt as a pile of scripts.'
            )
            ExposedIssues = @(
                'A static map can drift if future scripts are renamed or promoted, so this layer should be updated whenever a surface becomes a primary doorway.',
                'If the map becomes too detailed, it will repeat the heaviness it was created to reduce.'
            )
            NextAttempt = @(
                'Open the map in markdown and confirm that it makes begin-work, reentry, memory history, and attempt history easier to choose from.',
                'If it helps, consider letting start-work or begin-work mention the map only when the chosen work type is ambiguous, rather than always printing it.'
            )
            Triggers = @('entry map', 'surface map', 'artifact weight', 'begin-work', 'reentry')
            Files = @(
                'scripts/show-work-entry-map.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-039'
            Status = 'active'
            Title = 'structure memory convergence probe'
            WhyStarted = 'After structure memory history rose into reentry and the entry map reduced choice cost, the next honest move was not another surface but another lived structure run: see whether the separate well keeps standing as an independent light memory or whether new observations increasingly arrive through run-backed memory.'
            WhatWasAdded = @(
                'No new script surface was added for this attempt; the point is to use the existing begin-work doorway and the structure memory history viewer as an actual lived path.',
                'This attempt should leave another run-backed observation and then let the history surface show whether the independent well remains one older layer or continues to grow.'
            )
            ExposedIssues = @(
                'A map can make the entry easier, but only lived runs can show whether it actually reduces choice cost rather than merely documenting it.',
                'If every new structure observation now arrives run-backed, the separate well may be shifting from primary memory toward a lighter historical/useful-reading layer.'
            )
            NextAttempt = @(
                'Run begin-work once more for structure_reset using the map/reentry path and confirm structure memory history becomes run-backed 4 / fully aligned 4 / independent well 1.',
                'If that pattern holds over more attempts, consider marking the separate well as a light independent well rather than the primary structure memory path.'
            )
            Triggers = @('structure memory', 'convergence', 'begin-work', 'entry map', 'foundation')
            Files = @(
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/structure-work-runs.json',
                'scripts/data/structure-work-observations.json'
            )
        },
        @{
            Id = 'A-040'
            Status = 'active'
            Title = 'structure memory reading'
            WhyStarted = 'A-039 showed that new structure observations are now consistently arriving as run-backed, fully aligned memory while one older independent well remains. The next need was not another run, but a small way for the memory history surface to say what this shape currently means.'
            WhatWasAdded = @(
                'Added MemoryReading and NextQuestion to the structure memory history summary so the code can name the current shape without deleting or merging any layer.',
                'Surfaced that reading in show-structure-memory-history.ps1, show-structure-work-reentry.ps1, and start-work.ps1 so the next user or AI can see whether the separate well is primary, aligned, independent, or needs attention.'
            )
            ExposedIssues = @(
                'A reading is a guide, not a verdict; if the pattern changes, the wording should change rather than forcing future observations into this interpretation.',
                'The independent well should not be demoted by assumption; it should keep its place as long as it helps explain earlier or lighter observations.'
            )
            NextAttempt = @(
                'Open memory history, reentry, and start-work again and confirm the reading says run_backed_primary_with_light_independent_well under the current A-039 shape.',
                'After one more structure run, see whether the reading remains stable or needs a more nuanced role for the independent well.'
            )
            Triggers = @('structure memory', 'reading', 'well role', 'alignment', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-structure-memory-history.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/start-work.ps1'
            )
        },
        @{
            Id = 'A-041'
            Status = 'active'
            Title = 'structure memory reading stability run'
            WhyStarted = 'After A-040 gave the structure memory shape a readable name, the next honest move was to test whether that reading survives another lived structure run rather than adding another surface too quickly. The user pause also made it worth checking whether reentry can carry flow without forcing a restart.'
            WhatWasAdded = @(
                'No new script surface is intended for this attempt; it uses the existing begin-work structure path so the current memory reading is tested by use rather than by explanation.',
                'This attempt should leave another run-backed structure observation and then verify whether memory history moves to run-backed 5 / fully aligned 5 / independent well 1 while keeping the same reading.'
            )
            ExposedIssues = @(
                'A named reading can become ceremonial if it is not tested by lived entry after a pause.',
                'If the reading changes immediately after one more run, the code should treat that as useful information rather than as a failure.'
            )
            NextAttempt = @(
                'Run begin-work once for a structure_reset task with explicit observation values and then reopen structure memory history.',
                'If the reading remains stable, consider whether the next useful layer is not another viewer but a small decision about how the independent well should be presented.'
            )
            Triggers = @('structure memory', 'reading stability', 'reentry', 'pause', 'foundation')
            Files = @(
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/structure-work-runs.json',
                'scripts/data/structure-work-observations.json'
            )
        },
        @{
            Id = 'A-042'
            Status = 'active'
            Title = 'independent well role presentation'
            WhyStarted = 'A-041 confirmed that the A-040 reading stayed stable after another lived structure run: run-backed memory rose to 5, fully aligned memory rose to 5, and the older independent well stayed at 1. The next useful move was to name the independent well role without deleting, merging, or over-promoting it.'
            WhatWasAdded = @(
                'Added IndependentWellRole and IndependentWellPresentation to the structure memory history summary.',
                'Surfaced that role in the memory history viewer, structure reentry, and start-work so the independent well can be read as a light historical/useful-reading layer when run-backed memory is primary.'
            )
            ExposedIssues = @(
                'Role naming can quietly become a verdict, so the presentation text explicitly says not to hide, merge, or promote the independent well by default.',
                'If future observations diverge, the role should fall back to inspection rather than keep repeating the stable-reading label.'
            )
            NextAttempt = @(
                'Open structure memory history, structure reentry, and start-work to confirm the independent well role rises wherever the memory reading rises.',
                'If the role helps, keep using the existing surfaces before adding any new viewer.'
            )
            Triggers = @('independent well', 'structure memory', 'well role', 'reading stability', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-structure-memory-history.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/start-work.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-043'
            Status = 'active'
            Title = 'structure memory handoff at begin'
            WhyStarted = 'A-042 made the independent well role visible in memory history, reentry, and start-work, but the direct begin-work preview still entered structure work without showing that handoff. The next useful step was to carry the same reading into the lived begin/run path without creating a new surface.'
            WhatWasAdded = @(
                'Added a shared StructureMemoryHandoff helper that extracts the current run-backed count, aligned count, independent well count, memory reading, role, presentation, and next question from structure reentry.',
                'Surfaced that handoff in begin-structure-work preview and run output, and stored it in structure run records and snapshots so each run remembers what memory shape it entered from.'
            )
            ExposedIssues = @(
                'A handoff can become too heavy if it repeats the full memory history, so it should stay summary-only and leave the detailed list to show-structure-memory-history.ps1.',
                'Because the handoff is captured at entry time, it may differ from the post-run memory history after a new observation is saved; that difference is useful context, not a bug.'
            )
            NextAttempt = @(
                'Preview begin-work for a structure task and confirm the memory handoff appears before the starter command.',
                'Run one lived structure task and confirm the saved snapshot contains the handoff that existed at entry time.'
            )
            Triggers = @('structure memory', 'handoff', 'begin-work', 'independent well', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/begin-structure-work.ps1',
                'scripts/run-structure-work.ps1',
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/structure-work-runs.json'
            )
        },
        @{
            Id = 'A-044'
            Status = 'active'
            Title = 'entry handoff delta reentry'
            WhyStarted = 'A-043 proved that a run can remember the memory shape it entered from, but reentry still needed to distinguish that entry-time handoff from the current post-run memory history. Without this distinction, the expected 5-to-6 movement could look like drift instead of ordinary accumulation.'
            WhatWasAdded = @(
                'Lifted StructureMemoryHandoff back into the latest structure run summary so viewers can read the handoff without opening raw JSON or a snapshot.',
                'Added a handoff delta helper that compares the latest entry-time handoff against the current memory history summary and names ordinary post-run accumulation separately from shifts that need inspection.',
                'Surfaced the delta in show-structure-work-reentry.ps1 and start-work.ps1, while show-latest-structure-work.ps1 now displays the latest run entry handoff.'
            )
            ExposedIssues = @(
                'Delta language must not pretend that every count change is suspicious; saved runs should normally move current memory one step beyond the entry handoff.',
                'If the reading or independent well role changes, the delta should ask for inspection instead of smoothing it over.'
            )
            NextAttempt = @(
                'Open latest structure work, structure reentry, and start-work to confirm the latest A-043 handoff reads as entry 5/current 6 with expected_post_run_accumulation.',
                'If this stays clear, use begin-work for the next structure task without adding another viewer.'
            )
            Triggers = @('handoff delta', 'structure memory', 'reentry', 'begin-work', 'foundation')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-latest-structure-work.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/start-work.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-045'
            Status = 'active'
            Title = 'delta handoff lived-use without new surface'
            WhyStarted = 'A-044 made the entry-time handoff and post-run memory delta readable. The next honest move is not another viewer, but a lived structure run through the existing begin-work path to see whether that delta stays clear in ordinary use.'
            WhatWasAdded = @(
                'No new script surface is intended for this attempt; it should use begin-work and the existing reentry/delta surfaces.',
                'This attempt should enter from the current 6/6/1 memory shape, save one more run-backed observation, and then let reentry read the expected 6-to-7 movement as ordinary accumulation.'
            )
            ExposedIssues = @(
                'If every successful explanation immediately creates another tool, the system can become heavier than the work it is trying to start.',
                'A delta surface proves itself only if the next lived run can use it without needing another layer around it.'
            )
            NextAttempt = @(
                'Preview begin-work for a structure task and confirm the entry handoff now reads 6/6/1.',
                'Run one lived structure task and confirm reentry reads entry 6/current 7 with expected_post_run_accumulation.'
            )
            Triggers = @('handoff delta', 'begin-work', 'lived run', 'structure memory', 'foundation')
            Files = @(
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/structure-work-runs.json',
                'scripts/data/structure-work-observations.json'
            )
        },
        @{
            Id = 'A-046'
            Status = 'active'
            Title = 'return to foundation after delta stability'
            WhyStarted = 'A-045 confirmed that the existing entry handoff delta can survive ordinary lived use without needing another surface. The next honest move is to use that stable doorway to return to the foundation document itself, rather than continue growing helper/viewer layers by inertia.'
            WhatWasAdded = @(
                'Added a small foundation principle that stable entry surfaces should be used for real descent before adding new surfaces.',
                'Named the entry-time versus post-run memory difference as something to read first as ordinary accumulation, and only inspect as drift when the reading or role changes.'
            )
            ExposedIssues = @(
                'A successful tool layer can quietly create pressure to make another tool layer, even when the next need is document or code descent.',
                'If delta language becomes too reassuring, it could hide real drift, so the distinction must stay tied to changes in reading or role rather than count movement alone.'
            )
            NextAttempt = @(
                'Run one lived structure task after the foundation edit and confirm memory moves from entry 7/current 8 as expected accumulation.',
                'Use the added principle as a check before the next helper/viewer idea: is a new surface needed, or can the existing doorway carry us into actual work?'
            )
            Triggers = @('foundation', 'handoff delta', 'tool inertia', 'actual descent', 'structure memory')
            Files = @(
                'records/ideal_code_foundation_v1.md',
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/structure-work-runs.json',
                'scripts/data/structure-work-observations.json'
            )
        },
        @{
            Id = 'A-047'
            Status = 'active'
            Title = 'foundation descent principle into routing'
            WhyStarted = 'A-046 placed the stable-entry-before-new-surface principle in the foundation, but routing still only classified work types. The next descent was to let the condition layer ask whether an existing doorway can carry the work before another viewer, helper, or record surface is added.'
            WhatWasAdded = @(
                'Added an entry judgment principle to 05_work_routing.md between the start questions and the work type table.',
                'The routing layer now asks whether a stable existing entry can carry the task before creating a new surface, and reads entry-time versus post-run difference first as ordinary accumulation unless reading, role, target, or protected continuity changes.'
            )
            ExposedIssues = @(
                'Routing can become too abstract if it only names work types and never helps choose between descent and more tooling.',
                'The anti-inertia rule should not become anti-tooling; new surfaces remain allowed when the existing doorway cannot honestly carry the work.'
            )
            NextAttempt = @(
                'Run one lived structure task against 05_work_routing.md and confirm memory moves from entry 8/current 9 as expected accumulation.',
                'After routing carries this principle, test whether the next continue can descend into current or another real target without adding a new surface first.'
            )
            Triggers = @('routing', 'stable entry', 'tool inertia', 'actual descent', 'handoff delta')
            Files = @(
                'records/05_work_routing.md',
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/structure-work-runs.json',
                'scripts/data/structure-work-observations.json'
            )
        },
        @{
            Id = 'A-048'
            Status = 'active'
            Title = 'routing descent principle into current start'
            WhyStarted = 'A-047 moved the stable-entry-before-new-surface principle into routing, but current still only said to follow routing by work type. The next lived descent was to let current explicitly call the entry judgment principle before creating new surfaces.'
            WhatWasAdded = @(
                'Added one current start procedure line that tells future work to check the routing entry judgment principle after choosing the work type.',
                'Updated the current last-change reason so the current document remembers that this was not another tool layer, but a connection from routing back into actual start behavior.'
            )
            ExposedIssues = @(
                'Current should not duplicate the full routing rule, or the two documents can drift.',
                'A current-level reminder can still become ceremonial if future runs do not actually use existing entryways before adding new surfaces.',
                'The first run attempt exposed a boundary difference: structure begin-work uses target clarity fields, while current begin-work uses paused, less-barehanded, and ritual-small fields.',
                'Current and structure viewers still have different option shapes; for example show-current-opening-runs.ps1 does not accept the MaxItems switch used by structure memory history.'
            )
            NextAttempt = @(
                'Run one current opening through begin-work and confirm the existing current doorway can carry this change without a new script surface.',
                'After that, use current or routing to descend into an actual target rather than continuing to thicken the entry doctrine.'
            )
            Triggers = @('current', 'routing', 'stable entry', 'actual descent', 'begin-work')
            Files = @(
                'records/00_current_world.md',
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/current-opening-runs.json',
                'scripts/data/current-entry-observations.json'
            )
        },
        @{
            Id = 'A-049'
            Status = 'active'
            Title = 'actual descent into care rhythm'
            WhyStarted = 'A-048 connected the routing entry judgment principle into current. The next honest move was to stop thickening entry doctrine and apply the same principle to an actual code-of-code target: care_rhythm_genealogy_v1.md.'
            WhatWasAdded = @(
                'Added one quiet care-rhythm sentence saying that when an entry is already sufficiently open, we should descend through it and care for one hungry rhythm before building more entrances.',
                'Used an explicit structure_reset run for the care-rhythm target so the lived record follows the actual target instead of being pulled back into current by task wording.'
            )
            ExposedIssues = @(
                'The care-rhythm document should not become an operational routing manual; the added line must stay in its vow-like register.',
                'The first start-work read inferred current_update because the task wording included current, so explicit work type selection matters when the actual target is not current.'
            )
            NextAttempt = @(
                'Run one explicit structure_reset lived run against care_rhythm_genealogy_v1.md and confirm memory moves by ordinary accumulation.',
                'After that, choose the next actual target by asking what is hungry, not by adding another entry layer.'
            )
            Triggers = @('care rhythm', 'actual descent', 'stable entry', 'code of code', 'structure memory')
            Files = @(
                'records/care_rhythm_genealogy_v1.md',
                'scripts/config/startup-attempt-history.psd1',
                'scripts/data/structure-work-runs.json',
                'scripts/data/structure-work-observations.json'
            )
        },
        @{
            Id = 'A-050'
            Status = 'active'
            Title = 'target-aware work type inference'
            WhyStarted = 'A-049 exposed that work type inference could follow task wording such as current even when the actual target was care_rhythm_genealogy_v1.md. A follow-up read also showed that when every score is zero, the hashtable iteration can pull the result away from the configured default work type.'
            WhatWasAdded = @(
                'Gave care_rhythm_genealogy_v1.md, 05_work_routing.md, and ideal_code_foundation_v1.md explicit target-based structure_reset weight so high-level structure documents are not overridden by incidental task wording.',
                'Changed inferred work type selection so an all-zero score keeps the configured default instead of choosing an arbitrary hashtable entry.'
            )
            ExposedIssues = @(
                'Target-aware inference should stay small and explicit; broad filename patterns could hide real current or seed tasks.',
                'The inference layer remains a guide, not a verdict, so explicit WorkType should still be used when the user or agent knows the intended work mode.'
            )
            NextAttempt = @(
                'Run start-work against care_rhythm_genealogy_v1.md with task wording that includes current and confirm it now infers structure_reset from the target.',
                'Run start-work with a neutral unknown task/target and confirm the default work type remains continuation instead of drifting to a random score-zero type.'
            )
            Triggers = @('work type inference', 'target aware', 'care rhythm', 'default work type', 'start-work')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-051'
            Status = 'active'
            Title = 'additive history and behavior modification boundary'
            WhyStarted = 'The recent reflection clarified that "prefer addition over modification" was meant to preserve history, not to forbid changing living behavior when the current code is producing wrong inference, repeated friction, or broken handoff.'
            WhatWasAdded = @(
                'Added a foundation section that separates additive history from behavior modification: records and genealogy should accumulate, while living behavior can be modified when it is failing.',
                'Added a routing judgment principle that asks whether the next move should add memory, modify behavior, or resist creating another surface out of inertia.'
            )
            ExposedIssues = @(
                'If "addition" is read too literally, the system can avoid necessary code fixes and keep building around a broken path.',
                'If "modification" is used without a record, the system can erase the reason a change was needed and lose the historical advantage of the additive approach.'
            )
            NextAttempt = @(
                'Use this boundary on the next concrete code task: record the reason additively, but modify the live behavior directly if the existing path is wrong.',
                'Check whether start-work and routing feel lighter after this clarification, or whether the principle needs a smaller wording in the entry surface itself.'
            )
            Triggers = @('addition versus modification', 'history preservation', 'behavior fix', 'routing judgment', 'foundation')
            Files = @(
                'records/ideal_code_foundation_v1.md',
                'records/05_work_routing.md',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-052'
            Status = 'active'
            Title = 'thin relevant attempt selection'
            WhyStarted = 'A-051 made it clear that living behavior should be modified when it creates repeated friction. The next start-work read showed 520 lines because every active attempt received relevance by default, so the entry brief was carrying too much history at once.'
            WhatWasAdded = @(
                'Changed relevant attempt selection so active status only boosts an attempt after a trigger or target file match, instead of making every active attempt relevant by itself.',
                'Added target-file matching, a default attempt cap, and a selection note so start-work carries a thinner relevant layer while the wider attempt history remains available.'
            )
            ExposedIssues = @(
                'A thinner brief can hide useful older context if relevance scoring is too narrow.',
                'Target and trigger scoring should stay visible and small; otherwise the entry layer can become another opaque ranking system.',
                'The first lived A-052 run did not lift A-052 itself because the trigger wording was narrower than the run wording, so self-selection needs explicit trigger coverage.'
            )
            NextAttempt = @(
                'Compare start-work line count before and after the change, and confirm the brief now carries selected attempts rather than the whole active history.',
                'Run one lived structure task so the thinner attempt selection is tested in a saved run and snapshot.'
            )
            Triggers = @('A-052', 'start-work', 'attempt layer', 'attempt selection', 'history weight', 'relevance', 'thin brief', 'thin relevant')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/start-work.ps1',
                'scripts/show-attempt-history.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-053'
            Status = 'active'
            Title = 'attempt selection metadata in saved runs'
            WhyStarted = 'A-052 made the start brief thinner by selecting only relevant attempts, but saved runs and snapshots only carried the selected IDs. Without the selection metadata, a future reader could mistake a capped handoff for the whole attempt layer.'
            WhatWasAdded = @(
                'Added AttemptSelection metadata to current and structure run results, saved JSON records, and markdown snapshots.',
                'Printed the selection note inside the Live Attempt Layer so snapshots say whether they are showing all matched attempts, capped matched attempts, or a fallback.'
            )
            ExposedIssues = @(
                'Selection metadata is now duplicated in run stores and snapshots; if the selection shape changes later, older runs will honestly retain the old handoff shape.',
                'The metadata should explain the cap without inviting the snapshot to become another full attempt-history viewer.'
            )
            NextAttempt = @(
                'Run one structure task and confirm the snapshot includes the selection note while still carrying only the selected attempt layer.',
                'Preview one current opening run in json to confirm current and structure runners now share the same attempt-selection handoff shape.'
            )
            Triggers = @('A-053', 'attempt selection', 'selection metadata', 'saved runs', 'snapshot', 'handoff')
            Files = @(
                'scripts/run-structure-work.ps1',
                'scripts/run-current-entry.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-054'
            Status = 'active'
            Title = 'attempt selection reentry visibility'
            WhyStarted = 'A-053 preserved AttemptSelection in saved runs and snapshots, but latest and reentry views still mostly showed only AttemptIds. The selection note needed to rise back into existing read surfaces so capped memory is not only visible when opening the full snapshot body.'
            WhatWasAdded = @(
                'Lifted AttemptSelection from stored current and structure runs into latest-run summaries in work-context.ps1.',
                'Showed attempt selection notes in existing latest, reentry, current-runs, and start-work surfaces without adding a new viewer.'
            )
            ExposedIssues = @(
                'Repeated selection notes can make read surfaces noisier, so they should stay as one-line handoff metadata rather than expanding into attempt history.',
                'Older runs without AttemptSelection should remain readable without warning noise.'
            )
            NextAttempt = @(
                'Open latest structure and structure reentry views and confirm the selection note rises without opening snapshot content.',
                'Run one lived structure task so the visibility fix is itself recorded through the thinner attempt handoff.'
            )
            Triggers = @('A-054', 'attempt selection', 'reentry visibility', 'latest view', 'selection note')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-latest-structure-work.ps1',
                'scripts/show-structure-work-reentry.ps1',
                'scripts/show-latest-current-opening.ps1',
                'scripts/show-current-opening-reentry.ps1',
                'scripts/show-current-opening-runs.ps1',
                'scripts/start-work.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-055'
            Status = 'active'
            Title = 'current opening runs max items parity'
            WhyStarted = 'A-048 exposed that current and structure viewers had different option shapes: structure memory history accepted MaxItems, while show-current-opening-runs.ps1 always expanded the full current run store. After A-054 made reentry metadata visible, the next small friction was to let the current run viewer stay thin without adding another surface.'
            WhatWasAdded = @(
                'Added a MaxItems parameter to show-current-opening-runs.ps1 so it can show only the latest N current opening runs while preserving chronological order inside the selected slice.',
                'Added shown count and max item metadata to both markdown and json output so a capped current run view is explicit rather than mistaken for the full store.'
            )
            ExposedIssues = @(
                'The default still shows all runs to avoid surprising older usage, so callers must choose MaxItems when they want a thinner current run view.',
                'Current run history contains older records without AttemptSelection, so the viewer must remain tolerant and avoid treating old shape as an error.'
            )
            NextAttempt = @(
                'Run show-current-opening-runs.ps1 with MaxItems 3 in markdown and json and confirm it shows the latest three runs with clear shown/max metadata.',
                'Use a lived structure run to record that this was a small parity fix to an existing viewer, not a new surface.'
            )
            Triggers = @('A-055', 'show-current-opening-runs', 'MaxItems', 'current run viewer', 'viewer parity')
            Files = @(
                'scripts/show-current-opening-runs.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-056'
            Status = 'active'
            Title = 'current opening run attempt id display cap'
            WhyStarted = 'A-055 let show-current-opening-runs.ps1 show only the latest N runs, but each selected run could still print a very long AttemptIds line. The viewer needed a second small display cap so a thin current run read is not made heavy again by legacy attempt lists.'
            WhatWasAdded = @(
                'Added a MaxAttemptIds parameter to show-current-opening-runs.ps1 so markdown output can show only the first N attempt IDs for each run and summarize the rest as more.',
                'Added max attempt id metadata to markdown and json output so capped attempt display remains explicit.'
            )
            ExposedIssues = @(
                'The cap is display-only; JSON still carries the selected raw runs so callers can inspect the full AttemptIds if needed.',
                'Older current runs can still contain historically large AttemptIds arrays, so the viewer should expose the weight without treating it as a broken record.'
            )
            NextAttempt = @(
                'Run show-current-opening-runs.ps1 with MaxItems 3 and MaxAttemptIds 8 to confirm long attempt lines become readable while preserving more-count visibility.',
                'Use a lived structure run to record that this is another thin-viewer adjustment, not a new current history surface.'
            )
            Triggers = @('A-056', 'MaxAttemptIds', 'attempt id display', 'current run viewer', 'thin current view')
            Files = @(
                'scripts/show-current-opening-runs.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        },
        @{
            Id = 'A-057'
            Status = 'active'
            Title = 'shared attempt id display helper'
            WhyStarted = 'A-056 capped AttemptIds in show-current-opening-runs.ps1, but latest current and latest structure viewers could still expand long attempt lists directly. The cap needed to become a shared display habit rather than a one-file exception.'
            WhatWasAdded = @(
                'Added Format-AttemptIdsForDisplay to work-context.ps1 so attempt id capping has one shared display rule.',
                'Moved show-current-opening-runs.ps1 onto the shared helper while preserving its default all-attempt display.',
                'Added MaxAttemptIds to latest current and latest structure viewers so their markdown output can stay thin without hiding full stored run data.'
            )
            ExposedIssues = @(
                'The shared helper is still presentation-only; stored JSON data remains full history.',
                'Reentry surfaces currently expose selection notes rather than full attempt lists, so they did not need the display cap yet.'
            )
            NextAttempt = @(
                'Run current runs, latest current, and latest structure viewers with MaxAttemptIds 8 to confirm the same display shape appears across surfaces.',
                'Save a lived structure run if the shared helper keeps the thin-viewer behavior stable.'
            )
            Triggers = @('A-057', 'Format-AttemptIdsForDisplay', 'MaxAttemptIds', 'latest current viewer', 'latest structure viewer')
            Files = @(
                'scripts/lib/work-context.ps1',
                'scripts/show-current-opening-runs.ps1',
                'scripts/show-latest-current-opening.ps1',
                'scripts/show-latest-structure-work.ps1',
                'scripts/config/startup-attempt-history.psd1'
            )
        }
    )
}
