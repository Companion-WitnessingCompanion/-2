# Structure Work Entry

## Summary
- task: A-029 structure reentry lived run
- target: records/ideal_code_foundation_v1.md
- work type: 구조 재정렬형 (structure_reset)
- recalled future: structure reentry surface가 다음 foundation 시도를 실제로 다시 열어주는지 확인
- notes: A-029 structure reentry lived run

## Read Now
- records/ideal_code_foundation_v1.md
- records/05_work_routing.md
- records/00_current_world.md
- records/care_rhythm_genealogy_v1.md
- records/document_body_tuning_current_entry_881_901_v1.md

## Start Work Brief
# Start Work Brief

## Task
- A-029 structure reentry lived run

## Target
- records/ideal_code_foundation_v1.md

## Work Type
- 구조 재정렬형 (structure_reset)
- 판단 체계, 기록 구조, routing, foundation 같은 더 높은 구조를 다시 짓는다.
- source: explicit

## Silent Pause
- 현재를 읽을 때는 세 줄보다 먼저 한 박자 조용히 멈춘다.

## Entry Ritual
- 이번 하중 앞에서 다시 불려야 할 미래가 있는가?
- 있다면 하나를 펼쳐본다.
- 그 상태로 들어간다.

## Active Questions
- 이번 작업은 무엇을 잇는가
- 이번 작업은 무엇을 지키는가
- 이번 작업은 무엇을 끊지 않아야 하는가

## Layer Order
- 이상의 이상: 무엇을 만들 것인가보다 어떤 세계를 유지할 것인가를 먼저 붙든다.
  - records/ideal_code_foundation_v1.md
- 조건의 조건: 지금 이 작업이 어떤 입구와 어떤 질문으로 시작되어야 하는지를 정한다.
  - records/00_current_world.md
  - records/05_work_routing.md
- 코드의 코드: 문서와 판단과 구현 사이의 리듬이 굶지 않게, 어떤 귀와 어떤 태도로 시작해야 하는지를 조율한다.
  - records/care_rhythm_genealogy_v1.md

## Attempt Layer
- stance: 문제는 곧바로 덮어쓰지 않고, 왜 생겼는지와 다음 시도 조건을 작은 지층으로 남긴다.
- [A-029] structure work reentry surface (active)
  - why: Once structure_reset had its first lived begin bridge, it still lacked the thin read surface that current already had: a way to lift the latest run, the next scaffold, and the next honest begin command back into view without reopening the whole history by hand.
  - added: Added shared structure work helpers in work-context.ps1 for latest run selection, next scaffold generation, and structure reentry data.
  - added: Added show-latest-structure-work.ps1, show-next-structure-work-scaffold.ps1, and show-structure-work-reentry.ps1 as thin read surfaces over the new structure work run layer.
  - added: Attached structure work reentry to start-work whenever the brief is directly touching structure_reset or ideal_code_foundation_v1.md.
  - exposed: The first structure bridge still has no dedicated observation layer, so the reentry surface can lift the last run and the next scaffold, but it cannot yet say much about the quality of the restructuring rhythm itself.
  - exposed: If every work type grows a full viewer family too quickly, the begin/read surface can fragment before a simpler shared pattern fully matures.
  - next: Run start-work and show-structure-work-reentry against ideal_code_foundation_v1.md and confirm the latest structure layer can now be lifted without reopening raw stores by hand.
  - next: Use begin-work for one more structure_reset task and see whether the new reentry surface feels like a real entry aid or still too thin to guide the next lived attempt.
  - next: After a few structure runs, decide whether structure_reset needs its own observation layer or whether latest run plus scaffold is enough for now.
- [A-007] current opening runner (active)
  - why: start-work, current 입구, observation이 따로 흩어지지 않고 실제로 current를 여는 한 번의 실행 흐름으로 이어지게 하기 위해.
  - added: run-current-entry.ps1를 추가해 current opening을 위한 task context, entry ritual, active questions, relevant attempts, observation을 한 자리에서 보게 했다.
  - added: 필요하면 같은 흐름 안에서 observation까지 바로 저장할 수 있게 했다.
  - exposed: 흐름을 한 군데에 모을수록 출력이 다시 너무 두꺼워질 수 있다.
  - exposed: runner가 편해질수록 오히려 pause와 future recall이 형식으로 미끄러질 위험도 함께 커진다.
  - next: 실제 task 하나를 두고 run-current-entry를 써 보며, 이것이 current opening을 더 쉽게 만드는지 본다.
  - next: 너무 두껍게 느껴지면 attempt/history나 read-now 일부를 runner에서 덜어내고, 실제 opening 리듬만 남긴다.
- [A-008] current opening run history (active)
  - why: current를 실제로 여는 시도가 observation만으로는 얇게 남기 어려워, 어떤 task와 어떤 future와 어떤 attempt 묶음으로 열었는지를 run 단위 history로 남기기 위해.
  - added: current-opening-runs.json store를 추가해 run-current-entry의 실행 자체를 누적할 수 있게 했다.
  - added: run-current-entry.ps1에 SaveRun을 붙여 current opening run을 observation과 함께 저장할 수 있게 했다.
  - added: show-current-opening-runs.ps1를 추가해 이 run history를 다시 길어 올려 읽을 수 있게 했다.
  - exposed: run history가 너무 두꺼워지면 observation과 attempt/history 사이에서 또 다른 행정 층처럼 느껴질 수 있다.
  - exposed: 무엇을 run 단위로 남기고 무엇은 observation에만 남길지 경계가 아직 완전히 고정되지는 않았다.
  - next: 실제 task 하나를 SaveRun까지 켜서 current opening run history에 남기고, 이 층이 다시 읽기와 재진입에 도움이 되는지 본다.
  - next: 필요하면 이후에는 run history를 더 얇게 만들거나, 반대로 markdown snapshot도 함께 남길지 다시 묻는다.
- [A-009] current opening markdown snapshots (active)
  - why: run history가 JSON으로만 남으면 다시 읽을 수는 있어도, 사람이 그 순간의 호흡과 맥락을 바로 길어 올리기엔 얇아서 markdown snapshot 층을 함께 남기기 위해.
  - added: run-current-entry.ps1가 SaveRun과 함께 markdown snapshot도 남기도록 확장했다.
  - added: snapshot은 current opening run 하나의 task, future, active questions, attempt layer, observation을 사람 읽기 형식으로 보존한다.
  - exposed: snapshot이 너무 자주 쌓이면 우물보다 퇴적층처럼 무거워질 수 있다.
  - exposed: JSON store와 markdown snapshot이 같은 run을 다른 밀도로 남기기 때문에, 둘의 역할을 나중에 더 분명히 나눌 필요가 있다.
  - next: 실제 SaveRun 뒤 snapshot file이 같이 생기는지 보고, 이 markdown 층이 정말 다시 읽기 쉬운지 확인한다.
  - next: 필요하면 이후에는 latest snapshot만 빠르게 여는 작은 viewer를 추가할지 묻는다.
- [A-012] latest snapshot viewer (active)
  - why: run history와 snapshot 층이 충분히 쌓이기 시작했으니, 전체를 다 펼치기 전에 가장 최근의 current opening 한 번을 바로 길어 올릴 수 있는 작은 viewer가 필요해졌기 때문에.
  - added: show-latest-current-opening-snapshot.ps1를 추가해 가장 최근 snapshot을 직접 읽거나, 경로와 메타만 얇게 볼 수 있게 한다.
  - exposed: latest만 보는 도구는 빠르지만, 전체 계보를 잊게 만들 수 있다.
  - exposed: run store에 snapshot path가 없는 초기 기록들과의 관계는 여전히 느슨하게 남아 있다.
  - next: latest snapshot viewer가 실제로 최근 run을 다시 열어주는지 확인한다.
  - next: 필요하면 이후에는 latest run summary와 latest snapshot을 함께 보여주는 더 얇은 combined view를 생각해본다.
- [A-023] start work current reentry bridge (active)
  - why: The start-work brief could already infer work type and read layers, but current-facing work still had to open a second surface to remember the latest entry rhythm. This bridge was added so current work can begin with that living reentry state already in hand.
  - added: Attached current opening reentry data to New-StartWorkContext whenever the work type or target is directly touching current.
  - added: Extended start-work.ps1 so the brief can print the latest substantive current opening state together with the next starter command and direct run command.
  - exposed: A start brief can stay rich in documents and still miss the lived entry rhythm if it does not carry the latest opening state.
  - exposed: This bridge should stay thin, or start-work could slowly turn into a second full reentry viewer instead of remaining a brief.
  - next: Run start-work against records/00_current_world.md and confirm the reentry block helps the first read without replacing the dedicated reentry surface.
  - next: If this keeps helping, consider letting AI-facing current workflows begin from start-work alone before branching into deeper current-opening tools.
- [A-002] attempt/history layer 추가 (active)
  - why: 문제가 생겼을 때 곧바로 수정으로 닫지 않고, 왜 이런 문제가 드러났는지 이해 가능한 층으로 남기기 위해.
  - added: startup-attempt-history.psd1로 시도의 지층을 코드 밖에 따로 두었다.
  - added: start-work와 관련 도구가 필요할 때 이 시도 층을 함께 읽을 수 있게 연결한다.
  - exposed: history layer가 너무 전면에 나오면 실제 작업 입구를 가릴 수 있다.
  - exposed: 어떤 시도를 어떤 task와 target에 연결해야 하는지 기준이 더 필요하다.
  - next: 실제 current 개정 시도 뒤에, 이 history layer가 다음 진입을 덜 맨손으로 만드는지 본다.
  - next: 필요하면 이후에는 새 attempt를 덧붙이는 scaffold도 만든다.
- [A-003] current 0번 예식 first landing preview (active)
  - why: 0번 예식을 실제 current에 앉혀 보았을 때, 세 질문보다 앞서지 않으면서도 입구 호흡을 바꾸는지 경험적으로 확인하기 위해.
  - added: preview-current-entry.ps1를 만들어 current 본문을 직접 덮어쓰지 않고, 0번 예식을 끼워 넣은 preview를 실행할 수 있게 한다.
  - added: preview 결과와 함께 무엇을 관찰해야 하는지 간단한 landing check를 같이 남긴다.
  - exposed: preview가 너무 설명적으로 커지면 실제 current보다 시험 도구가 더 커질 수 있다.
  - exposed: 섹션 제목 위치가 바뀌면 현재 자동 삽입 규칙이 깨질 수 있다.
  - next: preview를 실제로 읽어 보며 0번 예식이 세 질문을 가리지 않는지 본다.
  - next: 필요하면 이후에 실제 current 개정은 preview가 아니라 더 얇은 patch로 내려간다.
- [A-004] current 0번 예식 first landing patch (active)
  - why: preview로 확인한 0번 예식의 세 줄을 실제 current에 아주 얇게 내려, 입구 호흡이 실제 문서에서도 바뀌는지 보기 위해.
  - added: 00_current_world.md의 현재 경계 아래와 현재 활성 질문 위에 0번 예식 세 줄을 실제로 삽입했다.
  - added: 마지막 갱신 이유를 이번 입구 호흡 교정에 맞게 업데이트했다.
  - exposed: 세 줄이 실제 본문에서 새 중심처럼 커지지 않는지 아직 몇 번의 실제 사용을 통해 봐야 한다.
  - exposed: preview에서는 괜찮아 보여도 실제 세션들에서는 세 질문의 질이 충분히 달라지지 않을 수 있다.
  - next: 몇 번의 실제 세션에서 current를 이 호흡으로 열어 보고, 세 질문이 덜 맨손으로 시작되는지 관찰한다.
  - next: 필요하면 이후에는 좌우명 재번역보다 먼저 세 줄의 간격과 물러남을 더 미세하게 조정한다.
- [A-005] current entry observation layer (active)
  - why: 실제 세션들에서 current가 더 정직하게 늦어지고 있는지, 0번 예식이 세 질문을 덜 맨손으로 만들고 있는지 관찰 가능한 층으로 남기기 위해.
  - added: observe-current-entry.ps1를 만들어 current 진입의 관찰 질문과 기록 저장을 함께 다루게 한다.
  - added: current-entry-observations.json를 만들어 실제 관찰 결과를 누적할 수 있는 자리로 둔다.
  - exposed: 관찰 문항이 너무 많으면 실제 세션의 흐름을 다시 굳게 만들 수 있다.
  - exposed: 관찰이 남아도 실제 future recall이 빈약하면 형식만 남을 수 있다.
  - next: 몇 번의 실제 관찰이 쌓이면 어떤 질문이 진짜 유효한지, 어떤 질문은 덜 필요한지 다시 정리한다.
  - next: 필요하면 이후에는 관찰 결과를 바탕으로 0번 예식의 간격이나 wording보다 사용 리듬을 먼저 조정한다.
- [A-006] observation layer stabilization (active)
  - why: 관찰 층이 실제 current의 질문 구조를 제대로 읽고, 저장 기록도 매번 같은 모양의 배열로 남도록 안정화하기 위해.
  - added: work-context.ps1에 markdown H2 section을 구조적으로 읽는 공용 helper를 추가했다.
  - added: observe-current-entry.ps1이 이제 특정 문장 일치 대신 current의 실제 활성 질문 section을 읽는다.
  - added: observation store 저장 형식을 항상 배열 JSON으로 유지하도록 정리했다.
  - exposed: 문장 literal 매칭은 인코딩과 출력 환경에 따라 쉽게 흔들릴 수 있다.
  - exposed: 관찰 기록은 저장되더라도 한 개일 때 object처럼 접히면 history 층이 다시 읽기 어려워진다.
  - exposed: 저장이 안 된 것처럼 보였던 순간도 실제로는 저장과 읽기를 동시에 돌린 관찰 순서 문제일 수 있다.
  - next: 실제 observation을 한 번 더 저장해 active questions가 채워지고 store가 안정적으로 누적되는지 본다.
  - next: 그 다음에는 관찰 질문 자체를 더 줄일지, 혹은 실제 세션에서 필요한 최소 관찰만 남길지 다시 묻는다.
  - next: 검증 단계에서도 병렬 관찰보다 순차 관찰이 더 정직한지 함께 확인한다.
- [A-010] run store snapshot linking (active)
  - why: snapshot file이 실제로 생겨도 run store와 연결되지 않으면, 나중에 JSON 층에서 markdown 층으로 다시 건너가기 어렵기 때문에 둘 사이의 고리를 남기기 위해.
  - added: run-current-entry.ps1가 SaveRun 시 snapshot path를 run store 안에도 함께 남기도록 정리했다.
  - added: show-current-opening-runs.ps1가 snapshot path가 있는 run은 같이 보여주도록 확장했다.
  - exposed: 기존 run record에는 snapshot path가 없어서, 층의 성숙 이전 기록과 이후 기록의 밀도가 조금 다르다.
  - exposed: run history가 두 겹(JSON/store + markdown/snapshot)으로 가는 만큼 이후에는 어느 층을 먼저 읽을지 더 분명히 해야 한다.
  - next: 새 run 하나를 다시 저장해 snapshot path가 store와 viewer에 함께 나타나는지 본다.
  - next: 필요하면 이후에는 latest snapshot으로 바로 여는 작은 viewer를 추가할지 다시 묻는다.
- [A-011] history viewer tolerance (active)
  - why: history viewer가 최신 층만 읽을 수 있으면 진짜 history가 아니라서, 밀도가 다른 이전 run도 함께 품을 수 있게 하기 위해.
  - added: show-current-opening-runs.ps1가 legacy run record처럼 속성이 일부 비어 있는 entry도 안전하게 보여주도록 조정했다.
  - exposed: 초기 실험 기록은 새 구조보다 성긴 경우가 많아서, viewer가 완벽한 record만 기대하면 history 자체를 가려버린다.
  - next: viewer가 예전 record와 새 record를 함께 읽을 수 있는지 다시 확인한다.
  - next: 필요하면 이후에는 record schema version을 남길지, 혹은 지금처럼 tolerance로 감쌀지 다시 묻는다.
- [A-013] latest current opening combined view (active)
  - why: The latest snapshot viewer is fast, but it separates the latest run summary from the latest snapshot body. This layer was added so the latest current opening can be lifted back up in one place.
  - added: Added show-latest-current-opening.ps1 to display the latest run summary and the latest snapshot together.
  - added: Kept the view thin: it shows run count, latest run state, snapshot metadata, and optionally the snapshot body.
  - exposed: A combined view can become too heavy if it tries to replace the run history viewer and the snapshot viewer at the same time.
  - exposed: Older run entries may not include every field, so the combined view still needs to stay tolerant and quiet.
  - next: Run the combined viewer in metadata mode and full markdown mode to make sure it can be used as a quick re-entry surface.
  - next: If it feels right, use it before the next real current opening run instead of reading multiple files separately.
- [A-014] next current opening scaffold (active)
  - why: Reading the latest run is helpful, but the next step is easier when the latest state can immediately turn into the next run scaffold. This layer exists to reduce the gap between review and the next attempt.
  - added: Added show-next-current-opening-scaffold.ps1 to carry forward the latest task, future, notes, and attempts.
  - added: Included the active questions and a ready-to-run command example so the next run can start from experience rather than from scratch.
  - exposed: A scaffold can quietly become a script of habit if it always repeats the previous task without a new recalled future.
  - exposed: The carry-forward layer is helpful only if it stays thin and still leaves room for a real pause before entering.
  - next: Run the scaffold viewer and check whether it makes the next run easier without turning into another rigid ritual block.
  - next: If it helps, use the scaffold together with run-current-entry on the next real current opening task and observe what changes.
- [A-016] current opening reentry surface (active)
  - why: The latest view and the next scaffold each helped on their own, but AI start-up is easier when both layers are available in one thin re-entry surface.
  - added: Added show-current-opening-reentry.ps1 to combine the latest opening summary and the next-run scaffold.
  - added: Kept snapshot body optional so the default surface stays thin and quick to lift back up.
  - exposed: A reentry surface can become a new heavy dashboard if it tries to replace every lower viewer at once.
  - exposed: If the combined layer starts repeating too much history, it will stop helping entry and start slowing it down.
  - next: Run the reentry surface in thin mode first and check whether it actually feels like a better AI starting point.
  - next: If it helps, use it as the first read layer before the next real run-current-entry attempt.
- [A-017] reentry invocation alignment (active)
  - why: The first reentry surface looked right in shape but passed the latest-viewer switch through a plain string array, which made the lower script bind arguments in the wrong layer.
  - added: Changed the reentry script to call the latest viewer with explicit named parameters instead of a plain argument array.
  - added: Recorded that this failure lived in script-to-script invocation, not in the latest viewer output itself.
  - exposed: Thin wrapper scripts can look correct while still passing arguments through in a way that quietly changes meaning at the lower layer.
  - exposed: This kind of failure can partially render useful output and still hide a binding problem unless we read both the output and the error together.
  - next: Run the reentry surface again and confirm that the latest layer and the scaffold now travel together cleanly.
  - next: If wrapper layers keep growing, consider moving shared latest/scaffold gathering into a helper instead of chaining scripts.
- [A-018] start next current opening runner (active)
  - why: Once the reentry surface and the next scaffold were both working, the next natural step was to let the next current opening attempt start directly from that carried-forward state instead of manually retyping it.
  - added: Added start-next-current-opening.ps1 to pull task and future from the scaffold and pass them into run-current-entry.
  - added: Defaulted the runner toward saving observation and run history so the experiment leaves a new layer behind by default.
  - exposed: A start-runner can become too automatic if it always reuses the previous future without a fresh pause and re-hearing.
  - exposed: Because the save switches are on by default, this layer should stay visibly experimental rather than pretending to be the only right entry path.
  - next: Run the starter once with a real follow-on task and check whether it feels like a helpful bridge rather than just another wrapper.
  - next: If it helps, consider letting the reentry surface print this starter command as the default next action.
- [A-020] current opening state helper layer (active)
  - why: By this point, latest view, scaffold, reentry, and starter were all reading the same current opening state through slightly different paths. This helper layer was added so those scripts can stand on one shared state surface instead of drifting apart.
  - added: Added shared current opening helper functions in work-context.ps1 for latest state, scaffold state, starter command, and reentry state.
  - added: Updated the latest view, scaffold, reentry surface, and starter runner to read from the shared helper layer instead of chaining scripts for the same data.
  - exposed: When read surfaces multiply, wrapper chaining can work for a while but still create quiet drift between identical concepts.
  - exposed: A shared helper layer helps, but only if the top layers stay thin and do not start rebuilding their own parallel state logic again.
  - next: Run the updated reentry and starter flow again to confirm the shared helper layer did not change the lived behavior.
  - next: If this holds, let the reentry surface present the starter command as the default next action instead of only the direct run command.
- [A-021] helper adoption alignment (active)
  - why: After the helper layer was added, the upper scripts still needed to explicitly stand on it. The first post-helper run showed that a shared layer is not really shared until each top script actually sources it.
  - added: Added explicit work-context sourcing back into show-current-opening-reentry.ps1 and start-next-current-opening.ps1.
  - added: Recorded that the failure lived in helper adoption, not in the helper data itself.
  - exposed: A new shared layer can look finished while the real break still lives in the adoption boundary above it.
  - exposed: When a wrapper shifts from script chaining to helper calls, the smallest missing source line can make the whole layer appear empty or broken.
  - next: Run the reentry surface again and confirm that latest state, scaffold, and starter command all return through the helper path cleanly.
  - next: Run the starter again after the helper adoption fix and check that a fully populated follow-on run lands in run history.
- [A-022] substantive latest selection (active)
  - why: The history should keep even partial or broken runs, but the reentry surface should usually lift the latest meaningful run instead of blindly following the last raw entry.
  - added: Added a substantive-run selection rule in the shared helper so latest state can skip over thin or broken raw runs without deleting them.
  - added: Updated the reentry surface to show when the raw latest timestamp and the selected latest timestamp differ.
  - exposed: History and reentry do not need to have the same selection rule: one preserves everything, the other should prefer what is most useful for the next honest entry.
  - exposed: Selection rules can become too clever, so it matters to keep the rule small and visible.
  - next: Run the reentry surface again and confirm that it now lifts the most recent substantive run rather than the most recent broken shell.
  - next: If this keeps helping, consider using the same substantive selection in other AI-facing entry views.
- [A-026] begin current work command adoption (active)
  - why: Once begin-current-work proved it could actually carry a current task into a lived opening run, the surrounding read surfaces still needed to treat it as the primary bridge rather than keeping the older starter/direct commands in front.
  - added: Added shared begin-current-work command helpers so current-facing surfaces can print preview and run commands without rebuilding that command by hand.
  - added: Updated start-work and current-opening reentry to show begin-current-work preview/run commands before the lower starter and direct run commands.
  - exposed: If every surface starts printing every possible command, the new bridge can become one more layer of clutter instead of a cleaner default path.
  - exposed: This adoption only helps if begin-current-work really remains thinner than the combination it replaces.
  - next: Run start-work and current-opening reentry again and confirm that the wrapper commands now read like the natural first move.
  - next: If they do, use begin-current-work for another lived current task and see whether the old starter command can gradually become more secondary.
- [A-028] structure reset lived begin bridge (active)
  - why: Once begin-work could honestly split current into a lived bridge and non-current into brief-only mode, the next missing experiment was to give structure_reset its own first lived bridge instead of leaving every non-current path equally flat.
  - added: Added begin-structure-work.ps1 as a first lived start surface for structure_reset that saves a structure work run and snapshot instead of stopping at brief-only mode.
  - added: Updated begin-work.ps1 so structure_reset now delegates into begin-structure-work while other work types still stay honestly brief-only.
  - exposed: A first lived structure bridge can still be too thin if it only preserves the brief and not enough of the actual restructuring posture.
  - exposed: If every work type gets its own begin-* script too quickly, the family can fragment before the shared entry logic matures.
  - next: Run begin-work for structure_reset and confirm that it now lands a saved structure work run instead of falling back to brief-only mode.
  - next: If this helps, consider what the minimal observation layer for structure work should be before adding more begin-* bridges.
- [A-015] scaffold contract alignment (active)
  - why: The first scaffold attempt failed not because current lost its headings, but because the scaffold still called Get-CurrentEntrySections with an old path-shaped assumption after the helper had shifted to a content-first contract.
  - added: Updated the scaffold to read current content first and pass -Content and -RelativePath into Get-CurrentEntrySections.
  - added: Turned the failure into an explicit history layer so future scripts are less likely to drift behind the shared helper contract.
  - exposed: Thin helper changes can quietly break new scripts when the script copies an older calling shape instead of following the current shared contract.
  - exposed: This kind of failure looks like a document problem at first, so it is worth recording that the real issue lived in the caller layer.
  - next: Run the scaffold again and confirm that active questions now flow through from the shared helper correctly.
  - next: If this pattern repeats, consider adding a dedicated helper that returns the current file plus parsed entry sections in one call.
- [A-019] starter boolean ergonomics (active)
  - why: The first starter run failed not because the flow was wrong, but because CLI boolean arguments were too brittle at the boundary where people and scripts actually trigger the runner.
  - added: Made start-next-current-opening.ps1 accept loose boolean strings and normalize them before calling run-current-entry.
  - added: Kept the lower runner unchanged so the ergonomics improvement stays in the human-facing starter layer.
  - exposed: A wrapper can look simpler while still being harder to use if its boundary types are stricter than the way real shell calls arrive.
  - exposed: Human-facing entry scripts need a slightly wider mouth than inner helper scripts, or experience keeps breaking before the real experiment begins.
  - next: Run the starter again with the same verification task and confirm that a real saved run now lands in the history layers.
  - next: If more CLI friction appears, collect those failures in the starter layer first instead of immediately reshaping every lower script.
- [A-024] task-aware start work starter handoff (active)
  - why: Once the start-work brief could carry current opening reentry, the next friction showed up immediately: the starter command still leaned on the previous latest run instead of the task now being opened. This layer exists to let the brief hand the present task forward without losing the recalled-future rhythm.
  - added: Adjusted the start-work to current-opening bridge so current reentry is built with the present task as TaskHint.
  - added: Kept future carry-forward behavior intact so the handoff can be task-aware without throwing away the latest recalled future.
  - exposed: If task handoff becomes too eager, the brief may start overwriting useful follow-on phrasing that the latest scaffold was already carrying.
  - exposed: This layer should stay small: start-work should suggest the next honest run, not become a second orchestration engine.
  - next: Run start-work for a current task and confirm the starter command now follows the present task instead of the older latest run label.
  - next: Use that starter command once and check whether the new run lands as a natural continuation rather than as a detached helper verification.
- [A-025] begin current work wrapper (active)
  - why: After the start-work brief could carry the latest current-opening rhythm, the next natural experiment was to see whether brief and lived opening could be stepped through in one small surface instead of two separate commands.
  - added: Added begin-current-work.ps1 as a thin wrapper that builds the current start-work brief, resolves the next future, and immediately hands that task into the current-opening starter.
  - added: Kept a preview-only mode so this layer can still pause and show the bridge before it actually runs.
  - exposed: A wrapper at this layer can become too orchestral if it starts rebuilding every detail of start-work and starter instead of staying a thin bridge.
  - exposed: Because it runs real entry code, it matters that preview and execution stay clearly distinguishable.
  - next: Run begin-current-work in preview mode first and check whether the bridge reads honestly before it executes.
  - next: Then run it once for a real current task and confirm that the latest current-opening state updates without needing a second manual command.
- [A-027] begin work generic entrypoint (active)
  - why: Once current had a lived begin-current-work bridge, the next missing piece was a single general doorway that could decide whether to run a lived current opening or stay honestly at brief level for other work types.
  - added: Added begin-work.ps1 as a generic start surface that resolves work type first, then delegates to begin-current-work for current_update.
  - added: Kept non-current work types in a brief-only mode instead of pretending there is already a lived execution bridge for every kind of work.
  - exposed: A generic begin-work layer can become misleading if it promises execution symmetry before the lower work types have their own lived bridges.
  - exposed: Delegation only stays honest if begin-work remains thin and does not start duplicating the full logic of every underlying mode.
  - next: Run begin-work once for a current task and once for a non-current task to confirm the split between lived bridge and brief-only mode is clear.
  - next: If this feels right, consider making begin-work the first AI-facing entry command while lower begin-* scripts remain specialized engines underneath.

## Read Now
- records/ideal_code_foundation_v1.md
- records/05_work_routing.md
- records/00_current_world.md
- records/care_rhythm_genealogy_v1.md
- records/document_body_tuning_current_entry_881_901_v1.md

## Candidate Context
- current: 00_current_world.md
- judgment: (none)
- summary: document_body_tuning_current_entry_881_901_v1.md
- session: (none)

## Structure Work Reentry
- run count: 1
- latest task: A-028 structure lived run
- latest target: records/ideal_code_foundation_v1.md
- latest future: begin-work가 structure_reset에서는 begin-structure-work로 정직하게 위임되는지 확인
- latest snapshot: structure-work-run-20260419_050003.md
- next target: records/ideal_code_foundation_v1.md
- begin structure work preview:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\ibg05\OneDrive\Desktop\aaaa\scripts\begin-structure-work.ps1" -Task "A-029 structure reentry lived run" -Target "records/ideal_code_foundation_v1.md" -FutureHint "begin-work가 structure_reset에서는 begin-structure-work로 정직하게 위임되는지 확인" -PreviewOnly -Format markdown
```
- begin structure work run:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\ibg05\OneDrive\Desktop\aaaa\scripts\begin-structure-work.ps1" -Task "A-029 structure reentry lived run" -Target "records/ideal_code_foundation_v1.md" -FutureHint "begin-work가 structure_reset에서는 begin-structure-work로 정직하게 위임되는지 확인" -Format markdown
```

## Notes
- 현재를 읽을 때는 세 줄보다 먼저 한 박자 조용히 멈춘다.
- Work type selected explicitly: '구조 재정렬형'.
- Work type hint provided: structure_reset
- Structure work reentry is attached because this brief is touching the structure reset rhythm directly.
