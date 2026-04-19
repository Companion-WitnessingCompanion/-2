@{
    SilentPauseHint = '현재를 읽을 때는 세 줄보다 먼저 한 박자 조용히 멈춘다.'

    EntryRitual = @(
        '이번 하중 앞에서 다시 불려야 할 미래가 있는가?',
        '있다면 하나를 펼쳐본다.',
        '그 상태로 들어간다.'
    )

    ActiveQuestions = @(
        '이번 작업은 무엇을 잇는가',
        '이번 작업은 무엇을 지키는가',
        '이번 작업은 무엇을 끊지 않아야 하는가'
    )

    Layers = @(
        @{
            Name = 'ideal'
            Label = '이상의 이상'
            Purpose = '무엇을 만들 것인가보다 어떤 세계를 유지할 것인가를 먼저 붙든다.'
            Files = @(
                'records/ideal_code_foundation_v1.md'
            )
        },
        @{
            Name = 'current'
            Label = '조건의 조건'
            Purpose = '지금 이 작업이 어떤 입구와 어떤 질문으로 시작되어야 하는지를 정한다.'
            Files = @(
                'records/00_current_world.md',
                'records/05_work_routing.md'
            )
        },
        @{
            Name = 'care'
            Label = '코드의 코드'
            Purpose = '문서와 판단과 구현 사이의 리듬이 굶지 않게, 어떤 귀와 어떤 태도로 시작해야 하는지를 조율한다.'
            Files = @(
                'records/care_rhythm_genealogy_v1.md'
            )
        }
    )

    DefaultWorkType = 'continuation'

    WorkTypes = @(
        @{
            Name = 'continuation'
            Label = '이어가기형'
            Description = '이미 열린 세션, 구현, 패치, 설명, 정돈을 계속 이어간다.'
            Triggers = @('이어', '계속', 'continue', 'implement', 'patch', '수정', '구현')
            BaseReadSet = @(
                'records/00_current_world.md',
                'records/05_work_routing.md',
                'records/ideal_code_foundation_v1.md',
                'records/care_rhythm_genealogy_v1.md'
            )
        },
        @{
            Name = 'seed'
            Label = '씨앗형'
            Description = '아직 판단으로 올라가기 전의 긴장, 실마리, seed를 붙든다.'
            Triggers = @('seed', '씨앗', '실마리', '긴장', 'idea', '아이디어')
            BaseReadSet = @(
                'records/00_current_world.md',
                'records/care_rhythm_genealogy_v1.md'
            )
        },
        @{
            Name = 'promotion'
            Label = '승격형'
            Description = '씨앗이나 메모를 더 공식적인 판단으로 올린다.'
            Triggers = @('승격', 'judgment', '판단', '공식', '정식')
            BaseReadSet = @(
                'records/00_current_world.md',
                'records/05_work_routing.md',
                'records/ideal_code_foundation_v1.md'
            )
        },
        @{
            Name = 'retrial'
            Label = '재심형'
            Description = '이미 있는 판단과 경계와 상태를 다시 듣고 조정한다.'
            Triggers = @('재심', '재검토', 'retrial', 'revisit', '다시 판단', '경계')
            BaseReadSet = @(
                'records/00_current_world.md',
                'records/05_work_routing.md',
                'records/ideal_code_foundation_v1.md'
            )
        },
        @{
            Name = 'current_update'
            Label = '현재 갱신형'
            Description = '입구, 좌우명, 활성 질문, current의 호흡을 다시 다듬는다.'
            Triggers = @('current', '입구', '좌우명', '0번', '활성 질문', 'current_world')
            BaseReadSet = @(
                'records/00_current_world.md',
                'records/05_work_routing.md',
                'records/care_rhythm_genealogy_v1.md',
                'records/ideal_code_foundation_v1.md'
            )
        },
        @{
            Name = 'structure_reset'
            Label = '구조 재정렬형'
            Description = '판단 체계, 기록 구조, routing, foundation 같은 더 높은 구조를 다시 짓는다.'
            Triggers = @('구조', '체계', 'routing', 'foundation', '헌법', 'lineage', '정렬', '폴더')
            BaseReadSet = @(
                'records/ideal_code_foundation_v1.md',
                'records/05_work_routing.md',
                'records/00_current_world.md',
                'records/care_rhythm_genealogy_v1.md'
            )
        },
        @{
            Name = 'emergency'
            Label = '응급형'
            Description = '지금 당장 무너지는 것을 막되, 임시를 정식처럼 굳히지 않는다.'
            Triggers = @('응급', '긴급', 'hotfix', 'urgent', '막아', '바로', 'unblock')
            BaseReadSet = @(
                'records/00_current_world.md',
                'records/ideal_code_foundation_v1.md'
            )
        }
    )
}
