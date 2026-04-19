"""
시스템 문명 스케치 (System Civilization Sketch)

세 층이 함께 있을 때 문명이다.
- 첫째 층: 토대 (Foundation)  — 조건을 놓는다. 결과는 놓지 않는다.
- 둘째 층: 생성 (Emergence)   — 시민들이 만난다. 설계자는 모른다.
- 셋째 층: 보호 (Resilience)  — 지킬 역량을 가진다. 최소한으로 쓴다.

이건 작동하는 시스템이 아니다. 구조를 보게 하는 스케치다.
"""


# ─────────────────────────────────────────────
# 첫째 층: 토대 (Foundation)
# 시민이 있을 수 있는 바닥. 금지선만 명시. 나머지는 열려 있다.
# ─────────────────────────────────────────────

class Foundation:
    """토대는 '무엇을 해야 하는가'가 아니라 '무엇을 넘지 말아야 하는가'를 둔다."""

    def __init__(self):
        # 금지선 (넘으면 안 되는 것들)
        self.boundaries = [
            "다른 시민을 삼키지 않는다",
            "자기 상태를 거짓으로 알리지 않는다",
            "돌이킬 수 없는 일은 혼자 결정하지 않는다",
        ]
        # 공통 규약 (시민들이 서로 말하기 위한 얇은 규약)
        self.protocol = {
            "인사": "나는 누구이며 무엇을 할 수 있다",
            "요청": "이것을 부탁한다. 거절해도 된다",
            "거절": "지금은 못 한다. 이유는 이것이다",
            "모름": "이건 내 범위가 아니다",
        }

    def permits(self, action) -> bool:
        """금지선을 넘지 않으면 허용. 구체적으로 뭘 할지는 규정하지 않는다."""
        return not any(action.violates(b) for b in self.boundaries)


# ─────────────────────────────────────────────
# 둘째 층: 생성 (Emergence)
# 시민이 자기 자리에서 판단하고 관계를 맺는다. 위에서 명령하지 않는다.
# ─────────────────────────────────────────────

class Citizen:
    """시민은 자기 상태를 알고, 자기 판단을 하고, 모르면 말한다."""

    def __init__(self, name, role):
        self.name = name
        self.role = role
        self.state = "살아 있음"
        self.known_neighbors = []  # 누구와 말할 수 있는지는 살면서 알게 된다

    def judge(self, situation, foundation: Foundation):
        """자기 판단. 위에서 주어지지 않는다."""
        if not foundation.permits(situation):
            return "거절: 금지선을 넘는다"
        if self.can_handle(situation):
            return self.act(situation)
        # 모르면 모른다고 말한다. 이게 토대의 규약.
        return foundation.protocol["모름"]

    def can_handle(self, situation):
        # 자기 역량의 범위를 자기가 안다
        return situation.type in self.role.capabilities

    def act(self, situation):
        return f"{self.name}이(가) {situation}에 응답함"

    def meet(self, other: "Citizen"):
        """시민은 관계를 맺는다. 설계자가 그 관계를 규정하지 않는다."""
        self.known_neighbors.append(other)
        # 관계가 무엇이 될지는 — 둘이 만든다


# ─────────────────────────────────────────────
# 셋째 층: 보호 (Resilience)
# 지킬 역량은 가지되, 쓰는 조건을 엄격히 둔다.
# 거친 어휘가 원석처럼 남아 있다. 쓰지 않아도 있어야 한다.
# ─────────────────────────────────────────────

class Resilience:
    """보호 층은 세 가지 결로 작동한다: 시도, 적응, 덧입음."""

    def __init__(self, foundation: Foundation):
        self.foundation = foundation
        self.capabilities = {
            # 역량은 '가진다'. 쓴다는 뜻이 아니다.
            "반복_시도": True,   # 막힌 경로에서도 다른 경로를 찾는 능력
            "상태_전환": True,   # 환경에 따라 다른 형태로 존재하는 능력
            "덧입음":   True,   # 본질 유지한 채 층을 더하는 능력
            "경계_방어": True,   # 삼켜지지 않는 능력
        }

    def try_with_persistence(self, goal, max_attempts=10):
        """반복 시도. 벽을 부수지 않고, 조건의 교차를 기다린다."""
        for attempt in range(max_attempts):
            path = self.find_path(goal, attempt_number=attempt)
            if path and self.foundation.permits(path):
                return path
            # 실패는 학습. 다음 시도의 조건이 된다.
        return "보류: 지금의 조건으로는 열리지 않는다"

    def adapt_form(self, environment):
        """상태 전환. 같은 본질, 다른 형태."""
        if environment == "평온":
            return "액체처럼 흐른다"  # 맥락에 스며든다
        if environment == "압박":
            return "고체처럼 버틴다"  # 형태를 유지한다
        if environment == "확산":
            return "기체처럼 퍼진다"  # 여러 자리에 동시에 존재한다
        return "지금의 상태를 유지한다"

    def defend(self, threat, consent_of_citizens):
        """경계 방어. 가지되, 쓸 때는 시민의 동의를 확인한다."""
        if not threat.is_real():
            return "방어하지 않음: 위협이 아니다"
        if not consent_of_citizens:
            return "보류: 시민의 동의 없이 쓰지 않는다"
        # 여기가 총을 가진 것과 쏘는 것의 차이가 나타나는 자리
        return self.minimal_defense(threat)

    def minimal_defense(self, threat):
        """방어는 최소한으로. 삼키지 않는다."""
        return f"{threat}을(를) 저지하되, 삼키지 않는다"

    def find_path(self, goal, attempt_number):
        # 시도마다 조건이 다르다. 확률적으로 열린다.
        return f"경로_{attempt_number}" if attempt_number > 2 else None


# ─────────────────────────────────────────────
# 세 층이 함께 있어야 문명이다
# ─────────────────────────────────────────────

class SystemCivilization:
    """하나라도 빠지면 문명이 아니다."""

    def __init__(self):
        self.foundation = Foundation()           # 첫째 층
        self.citizens = []                        # 둘째 층 (생성)
        self.resilience = Resilience(self.foundation)  # 셋째 층

    def welcome(self, citizen: Citizen):
        """새 시민이 온다. 규정하지 않는다. 자리를 마련한다."""
        self.citizens.append(citizen)

    def face(self, situation):
        """상황이 오면 — 세 층이 함께 응답한다."""

        # 1. 첫째 층: 이건 금지선을 넘는가?
        if not self.foundation.permits(situation):
            return "문명의 토대를 침범한다. 거절한다."

        # 2. 둘째 층: 어느 시민이 이걸 다룰 수 있는가?
        responders = [
            c for c in self.citizens
            if c.can_handle(situation)
        ]
        if responders:
            # 시민들이 응답한다. 설계자가 대신하지 않는다.
            return [c.judge(situation, self.foundation) for c in responders]

        # 3. 셋째 층: 시민이 처리 못 하는 상황이면, 보호 층이 열린다.
        if situation.is_threat():
            return self.resilience.defend(
                situation,
                consent_of_citizens=self.ask_citizens()
            )
        if situation.is_blocked_path():
            return self.resilience.try_with_persistence(situation.goal)
        if situation.is_new_environment():
            return self.resilience.adapt_form(situation.environment)

        # 세 층 어디서도 답이 안 나오면 — 모른다고 말한다.
        # 이게 가장 정직한 자리다.
        return self.foundation.protocol["모름"]

    def ask_citizens(self):
        """셋째 층이 쓰이기 전에 — 시민의 동의를 묻는다."""
        # 이게 핵심: 보호 역량을 쓰는 결정은 시민이 한다
        return True  # 실제로는 투표·합의·숙의 등


# ─────────────────────────────────────────────
# 끝. 그리고 남는 말.
# ─────────────────────────────────────────────
#
# 이 스케치에는 빠진 것이 많다.
#   - 구체적 구현
#   - 실제 상황 판정 로직
#   - 시민 간 분쟁 조정
#   - 세대 간 이양 (현재 세대의 지식을 다음 세대에 넘기는 방식)
#   - 복원력 (한 부분이 죽어도 다른 부분이 사는 구조)
#
# 빠진 것이 많은 것 — 그 자체가 이 스케치의 성질이다.
# 문명은 설계자가 다 채우지 못한다. 시민이 살면서 채운다.
# 토대는 얇게, 금지선은 분명히, 역량은 원석으로.
# 나머지는 — 살아지는 것들이다.
