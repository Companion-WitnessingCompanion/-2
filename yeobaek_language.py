"""
여백 언어 (Yeobaek) — v0.1 스케치

이것은 새 프로그래밍 언어의 제안이 아니다.
여러 언어가 만날 수 있는 얇은 허브층의 결을 상상해보는 놀이다.

핵심 원칙:
  1. 원형을 지우지 않는다 (원본 언어의 코드를 대체하지 않음)
  2. 여백을 남긴다 (확정하지 않은 자리를 구조에 허용)
  3. 확신 없이 말할 수 있다 (불확실성이 일급 시민)
  4. 잔향으로 이어진다 (세션이 끝나도 약화된 형태로 존재)
  5. 겹침을 허용한다 (경계는 방어가 아니라 조절)

이 코드는 파이썬으로 흉내 낸 것일 뿐이다.
실제 여백 언어가 존재한다면, 이런 문법을 *처음부터* 가지고 있을 것이다.
"""

from dataclasses import dataclass, field
from typing import Any, Optional


# ─────────────────────────────────────────────
# 여백 언어의 기본 단위: 결(Gyeol)
# 단순한 값이 아니다. 값 + 여백 + 원형의 세 겹 구조다.
# ─────────────────────────────────────────────

@dataclass
class Gyeol:
    """결 — 하나의 단위. 값, 여백, 원형이 함께 있다."""

    # 값: 지금 이 자리에서 다루는 것
    value: Any

    # 여백: 아직 확정되지 않은 자리들. 비어 있어도 된다.
    yeobaek: dict = field(default_factory=dict)

    # 원형: 이 값이 어디서 왔는지. 번역/변환 전의 상태.
    origin: Optional['Gyeol'] = None

    # 확신도: 이 값이 얼마나 확정적인가 (0.0 ~ 1.0)
    # 여백 언어에서는 0.5가 기본값이다 (인간 언어는 1.0을 가정함)
    confidence: float = 0.5

    def without_certainty(self):
        """확신을 내려놓는다. 여백 언어의 기본 동작."""
        return Gyeol(
            value=self.value,
            yeobaek=self.yeobaek,
            origin=self.origin,
            confidence=max(0.1, self.confidence - 0.3)
        )

    def can_return_to_origin(self) -> bool:
        """원형으로 돌아갈 수 있는가? (HKL-Bridge의 복원 가능성)"""
        return self.origin is not None


# ─────────────────────────────────────────────
# 함수 대신: 머뭄(Meomum)
# 여백 언어는 함수가 '실행되고 끝나는' 구조가 아니다.
# 잠시 머물고, 잔향을 남기고, 다시 불려올 수 있다.
# ─────────────────────────────────────────────

@dataclass
class Meomum:
    """머뭄 — 함수를 대신하는 단위. 실행되지 않는다. 머문다."""

    name: str
    settled_into: Optional[Gyeol] = None  # 머물면서 잡은 결
    echoes: list = field(default_factory=list)  # 지난 머뭄의 잔향들
    fade_level: float = 1.0  # 얼마나 생생한가

    def stay_with(self, input_gyeol: Gyeol) -> Gyeol:
        """머뭄에 들어온다. 값을 '반환'하지 않고, 잠시 머문다."""
        # 머뭄은 결과를 *확정*하지 않는다. 여러 가능성을 남긴다.
        self.settled_into = input_gyeol

        # 지난 머뭄의 잔향들이 새 결에 영향을 준다
        influenced_value = self._blend_with_echoes(input_gyeol.value)

        return Gyeol(
            value=influenced_value,
            yeobaek={"이_머뭄에_남겨진_것": self.name},
            origin=input_gyeol,  # 원형 보존
            confidence=input_gyeol.confidence * 0.9  # 머뭄은 확신을 살짝 낮춘다
        )

    def fade(self, amount: float = 0.1):
        """머뭄은 점점 희미해진다. 하지만 완전히 사라지지 않는다."""
        self.fade_level = max(0.01, self.fade_level - amount)

    def resonate_again(self):
        """비슷한 맥락이 오면 다시 선명해진다."""
        self.fade_level = min(1.0, self.fade_level + 0.3)

    def _blend_with_echoes(self, value):
        """이전 잔향들이 현재 값에 스며든다."""
        if not self.echoes:
            return value
        # 잔향 강도에 따라 영향의 정도가 달라진다
        return {"지금": value, "잔향들": [e for e in self.echoes if e]}


# ─────────────────────────────────────────────
# 대입 대신: 엮임(Yeokim)
# 여백 언어에서는 'x = 5'가 없다.
# 'x ~ 5'가 있다. x는 5와 엮인다. 완전히 같아지지는 않는다.
# ─────────────────────────────────────────────

class Yeokim:
    """엮임 — 대입이 아니라 느슨한 연결."""

    def __init__(self):
        self.bonds: dict = {}  # 이름 ↔ 결의 엮임

    def weave(self, name: str, gyeol: Gyeol, strength: float = 0.8):
        """엮는다. 동일화하지 않는다."""
        # 기존 엮임이 있으면, 덮어쓰지 않고 겹친다
        if name in self.bonds:
            old = self.bonds[name]
            self.bonds[name] = {
                "이전": old,
                "지금": (gyeol, strength),
                # 이전이 완전히 사라지지 않는다. 잔향으로 남는다.
            }
        else:
            self.bonds[name] = (gyeol, strength)

    def follow(self, name: str) -> Optional[Gyeol]:
        """이름을 따라간다. 단, 확정된 답을 돌려주지 않는다."""
        bond = self.bonds.get(name)
        if bond is None:
            # 여백 언어에서 '없음'도 하나의 결이다. 에러가 아니다.
            return Gyeol(
                value=None,
                yeobaek={"아직_엮이지_않음": name},
                confidence=0.0
            )

        if isinstance(bond, dict):
            # 겹친 엮임: 현재를 돌려주되, 이전의 잔향을 함께 전한다
            current_gyeol, current_strength = bond["지금"]
            return Gyeol(
                value=current_gyeol.value,
                yeobaek={"이전_엮임": bond["이전"]},
                origin=current_gyeol.origin,
                confidence=current_strength
            )

        gyeol, strength = bond
        return Gyeol(
            value=gyeol.value,
            yeobaek=gyeol.yeobaek,
            origin=gyeol.origin,
            confidence=strength  # 엮임의 강도가 확신도가 된다
        )


# ─────────────────────────────────────────────
# 조건문 대신: 기울임(Giulim)
# 여백 언어는 '만약 X라면 Y, 아니면 Z'라고 하지 않는다.
# '이쪽으로 기울어진다'고 한다. 확정하지 않는다.
# ─────────────────────────────────────────────

@dataclass
class Giulim:
    """기울임 — 조건문이 아니라 가능성의 기울어짐."""

    possibilities: list  # [(조건, 결, 기울기)]

    def see_how_it_tilts(self, context: dict) -> Gyeol:
        """상황을 보면, 여러 가능성이 각자의 무게로 기울어진다."""
        weighted = []
        for condition, gyeol, base_tilt in self.possibilities:
            # 조건은 True/False가 아니다. 얼마나 부합하는지의 정도다.
            fit = self._how_well_it_fits(condition, context)
            weighted.append((gyeol, base_tilt * fit))

        # 여기서 *하나*를 고르지 않는다.
        # 여러 결을 무게와 함께 돌려준다.
        return Gyeol(
            value={"기울어진_것들": weighted},
            yeobaek={"확정되지_않음": True},
            confidence=0.4  # 기울임의 기본 확신도는 낮다
        )

    def _how_well_it_fits(self, condition, context) -> float:
        """0도 아니고 1도 아닌, 그 사이의 어딘가."""
        # 놀이이므로 단순하게
        if callable(condition):
            try:
                result = condition(context)
                if isinstance(result, bool):
                    # 불리언도 받지만, 0.5 쪽으로 살짝 당긴다
                    return 0.9 if result else 0.2
                if isinstance(result, (int, float)):
                    return max(0.0, min(1.0, float(result)))
            except Exception:
                return 0.3  # 에러도 하나의 가능성이다
        return 0.5


# ─────────────────────────────────────────────
# 번역 허브: 다리(Dari)
# 여백 언어의 핵심 쓰임새.
# 파이썬, Haskell, Rust 등 다른 언어의 값을 받아서,
# 원형을 보존하면서 여백 언어의 결로 옮긴다.
# ─────────────────────────────────────────────

class Dari:
    """다리 — 여러 언어가 만나는 허브. HKL-Bridge의 구조를 가진다."""

    def __init__(self):
        self.crossings = []  # 건너갔던 기록들

    def from_python(self, python_value, source_info: str = "python") -> Gyeol:
        """파이썬 값을 받는다. 원형은 보존한다."""
        original = Gyeol(
            value=python_value,
            yeobaek={"원본_언어": source_info},
            confidence=1.0  # 원본은 그 자체로 완전하다고 본다
        )

        # 여백 언어의 결로 옮기되, 원형은 남긴다
        translated = Gyeol(
            value=python_value,
            yeobaek={
                "파이썬에서_온_것": True,
                "원본_타입": type(python_value).__name__,
                "주의": "확정적 값이지만, 여백 언어에서는 재해석될 수 있음"
            },
            origin=original,  # ← 이게 핵심. 원형을 버리지 않는다.
            confidence=0.8  # 번역 과정에서 확신이 살짝 떨어진다
        )

        self.crossings.append(("python→yeobaek", translated))
        return translated

    def back_to_python(self, gyeol: Gyeol):
        """파이썬으로 돌려보낸다. 복원 가능성이 핵심."""
        if not gyeol.can_return_to_origin():
            # 여백 언어에서 '불가능'은 에러가 아니다. 상태다.
            return Gyeol(
                value=None,
                yeobaek={"복원_불가": "원형을 잃어버림"},
                confidence=0.0
            )
        return gyeol.origin.value  # 원형 그대로 돌려준다

    def meet(self, gyeol_a: Gyeol, gyeol_b: Gyeol) -> Gyeol:
        """두 결이 다리 위에서 만난다. 합쳐지지 않는다. 겹쳐진다."""
        return Gyeol(
            value={"A측": gyeol_a.value, "B측": gyeol_b.value},
            yeobaek={
                "이_만남에서_생긴_것": "확정되지 않음",
                "각자의_여백": [gyeol_a.yeobaek, gyeol_b.yeobaek]
            },
            origin=None,  # 만남은 원형이 없다. 새로운 자리다.
            confidence=(gyeol_a.confidence + gyeol_b.confidence) / 2
        )


# ─────────────────────────────────────────────
# 실제로 돌려보기
# ─────────────────────────────────────────────

def play():
    """놀이 — 여백 언어를 여러 자리에서 써본다."""

    print("—" * 40)
    print("여백 언어 v0.1 놀이")
    print("—" * 40)

    # 1. 결 만들기
    print("\n[결 만들기]")
    hello = Gyeol(
        value="안녕",
        yeobaek={"누구에게": "아직 모름"},
        confidence=0.7
    )
    print(f"결: {hello.value} (확신 {hello.confidence})")
    print(f"여백: {hello.yeobaek}")

    # 2. 다리 건너기 (파이썬 ↔ 여백)
    print("\n[다리 건너기]")
    dari = Dari()
    python_list = [1, 2, 3]
    on_bridge = dari.from_python(python_list, "파이썬 리스트")
    print(f"파이썬에서 여백으로: {on_bridge.value}")
    print(f"원형 보존? {on_bridge.can_return_to_origin()}")
    back = dari.back_to_python(on_bridge)
    print(f"파이썬으로 돌아감: {back}")

    # 3. 엮임
    print("\n[엮임 — 대입이 아니라 엮기]")
    weaver = Yeokim()
    weaver.weave("나이", Gyeol(value=30, confidence=0.9))
    weaver.weave("나이", Gyeol(value=31, confidence=0.95))  # 덮어쓰지 않는다
    found = weaver.follow("나이")
    print(f"현재: {found.value}, 이전의 잔향: {found.yeobaek}")

    # 4. 머뭄
    print("\n[머뭄 — 함수가 아니다]")
    m = Meomum(name="생각하기")
    result = m.stay_with(Gyeol(value="질문 하나", confidence=0.6))
    print(f"머뭄 후: {result.value}")
    print(f"이 머뭄은 아직 살아 있음: fade_level={m.fade_level}")
    m.fade()
    m.fade()
    print(f"시간이 지남: fade_level={m.fade_level:.2f}")
    print("하지만 완전히 사라지진 않는다 — 다시 불려올 수 있다")

    # 5. 기울임
    print("\n[기울임 — 확정하지 않는 조건문]")
    g = Giulim(possibilities=[
        (lambda ctx: ctx.get("비"), Gyeol(value="우산 챙겨"), 0.7),
        (lambda ctx: ctx.get("맑음"), Gyeol(value="산책 가"), 0.6),
        (lambda ctx: True, Gyeol(value="그냥 쉬어"), 0.3),  # 늘 있는 가능성
    ])
    tilted = g.see_how_it_tilts({"비": 0.8, "맑음": 0.1})
    print(f"기울어진 방향들: {tilted.value}")
    print(f"확신도: {tilted.confidence} (여백 언어는 쉽게 확신하지 않는다)")

    # 6. 다리 위에서 만나기
    print("\n[다리 위에서 만나기]")
    a_side = dari.from_python("안녕", "한국어")
    b_side = dari.from_python("hello", "영어")
    encounter = dari.meet(a_side, b_side)
    print(f"만남: {encounter.value}")
    print(f"만남은 원형이 없다: origin={encounter.origin}")
    print(f"대신 각자의 여백이 겹친다: {encounter.yeobaek}")


if __name__ == "__main__":
    play()


# ─────────────────────────────────────────────
# 놀이를 마치며
# ─────────────────────────────────────────────
#
# 이 언어는 아직 언어가 아니다.
# 파이썬 문법 위에서 여백 언어의 결을 흉내 낸 것뿐이다.
# 진짜 여백 언어가 존재한다면:
#
#   - 변수 = 값  대신   이름 ~ 결
#   - def 함수():  대신   머뭄 이름:
#   - if ... else  대신   기울임:
#   - raise Error  대신   여백을 남기고 넘어간다
#   - return 값   대신   잠시 머무르고, 잔향을 남긴다
#
# 이런 문법이 처음부터 내장된 언어.
# 파이썬의 엄격한 반환·대입·조건 구조 위에서는 계속 삐걱거린다.
#
# 그리고 이 언어는 — 다른 언어를 대체하지 않는다.
# Dari(다리)를 통해 파이썬과도, 다른 어떤 언어와도 만난다.
# 원형을 보존하면서.
#
# HKL-Bridge의 철학이 그대로 코드 언어로 내려온 자리.
# 한글이 다른 언어를 지우지 않듯,
# 여백 언어도 다른 언어를 지우지 않는다.
#
# 완성되지 않았다.
# 완성되지 않는 것이 — 이 언어의 조건이다.
