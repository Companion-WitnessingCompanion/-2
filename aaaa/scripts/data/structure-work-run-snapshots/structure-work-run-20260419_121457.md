# Structure Work Run

## Task
- A-055 current opening runs max items parity run

## Target
- scripts/show-current-opening-runs.ps1

## Work Type
- 구조 재정렬형 (structure_reset)
- 판단 체계, 기록 구조, routing, foundation 같은 더 높은 구조를 다시 짓는다.

## Recalled Future
- Let the current run history viewer stay thin with MaxItems while preserving full-history access by default.

## Active Questions
- 이번 작업은 무엇을 잇는가
- 이번 작업은 무엇을 지키는가
- 이번 작업은 무엇을 끊지 않아야 하는가

## Read Now
- records/ideal_code_foundation_v1.md
- records/05_work_routing.md
- records/00_current_world.md
- records/care_rhythm_genealogy_v1.md

## Structure Memory Handoff
- run-backed observation count: 15
- fully aligned count: 15
- independent well count: 1
- memory reading: run_backed_primary_with_light_independent_well
- independent well role: light_historical_useful_reading_layer
- next question: New structure observations are arriving through run-backed memory; keep the independent well as a light historical/useful-reading layer for now.

## Live Attempt Layer
- selection: Showing 8 of 29 directly matched attempts. Use show-attempt-history -MaxAttempts 0 for the wider layer.
- [A-008] current opening run history (active)
  - why: current를 실제로 여는 시도가 observation만으로는 얇게 남기 어려워, 어떤 task와 어떤 future와 어떤 attempt 묶음으로 열었는지를 run 단위 history로 남기기 위해.
  - next: 실제 task 하나를 SaveRun까지 켜서 current opening run history에 남기고, 이 층이 다시 읽기와 재진입에 도움이 되는지 본다.
  - next: 필요하면 이후에는 run history를 더 얇게 만들거나, 반대로 markdown snapshot도 함께 남길지 다시 묻는다.
- [A-055] current opening runs max items parity (active)
  - why: A-048 exposed that current and structure viewers had different option shapes: structure memory history accepted MaxItems, while show-current-opening-runs.ps1 always expanded the full current run store. After A-054 made reentry metadata visible, the next small friction was to let the current run viewer stay thin without adding another surface.
  - next: Run show-current-opening-runs.ps1 with MaxItems 3 in markdown and json and confirm it shows the latest three runs with clear shown/max metadata.
  - next: Use a lived structure run to record that this was a small parity fix to an existing viewer, not a new surface.
- [A-011] history viewer tolerance (active)
  - why: history viewer가 최신 층만 읽을 수 있으면 진짜 history가 아니라서, 밀도가 다른 이전 run도 함께 품을 수 있게 하기 위해.
  - next: viewer가 예전 record와 새 record를 함께 읽을 수 있는지 다시 확인한다.
  - next: 필요하면 이후에는 record schema version을 남길지, 혹은 지금처럼 tolerance로 감쌀지 다시 묻는다.
- [A-010] run store snapshot linking (active)
  - why: snapshot file이 실제로 생겨도 run store와 연결되지 않으면, 나중에 JSON 층에서 markdown 층으로 다시 건너가기 어렵기 때문에 둘 사이의 고리를 남기기 위해.
  - next: 새 run 하나를 다시 저장해 snapshot path가 store와 viewer에 함께 나타나는지 본다.
  - next: 필요하면 이후에는 latest snapshot으로 바로 여는 작은 viewer를 추가할지 다시 묻는다.
- [A-054] attempt selection reentry visibility (active)
  - why: A-053 preserved AttemptSelection in saved runs and snapshots, but latest and reentry views still mostly showed only AttemptIds. The selection note needed to rise back into existing read surfaces so capped memory is not only visible when opening the full snapshot body.
  - next: Open latest structure and structure reentry views and confirm the selection note rises without opening snapshot content.
  - next: Run one lived structure task so the visibility fix is itself recorded through the thinner attempt handoff.
- [A-014] next current opening scaffold (active)
  - why: Reading the latest run is helpful, but the next step is easier when the latest state can immediately turn into the next run scaffold. This layer exists to reduce the gap between review and the next attempt.
  - next: Run the scaffold viewer and check whether it makes the next run easier without turning into another rigid ritual block.
  - next: If it helps, use the scaffold together with run-current-entry on the next real current opening task and observe what changes.
- [A-013] latest current opening combined view (active)
  - why: The latest snapshot viewer is fast, but it separates the latest run summary from the latest snapshot body. This layer was added so the latest current opening can be lifted back up in one place.
  - next: Run the combined viewer in metadata mode and full markdown mode to make sure it can be used as a quick re-entry surface.
  - next: If it feels right, use it before the next real current opening run instead of reading multiple files separately.
- [A-007] current opening runner (active)
  - why: start-work, current 입구, observation이 따로 흩어지지 않고 실제로 current를 여는 한 번의 실행 흐름으로 이어지게 하기 위해.
  - next: 실제 task 하나를 두고 run-current-entry를 써 보며, 이것이 current opening을 더 쉽게 만드는지 본다.
  - next: 너무 두껍게 느껴지면 attempt/history나 read-now 일부를 runner에서 덜어내고, 실제 opening 리듬만 남긴다.

## Observation Checks
- Did the target structure feel clearer after this run?
- Did the next structure step become easier to name?
- Did the structure bridge stay thin instead of becoming a new doctrine?

## Observation
- timestamp: 2026-04-19 12:14:57
- future: Let the current run history viewer stay thin with MaxItems while preserving full-history access by default.
- target felt clearer: True
- next step felt nameable: True
- bridge stayed thin: True
- notes: A-055 added MaxItems to the current opening run viewer so current and structure read surfaces have a lighter shared option shape.
- observation saved: True
- run saved: True
- snapshot path: C:/Users/ibg05/OneDrive/Desktop/aaaa/scripts/data/structure-work-run-snapshots/structure-work-run-20260419_121457.md
