"""
AI 문법 놀이 (AI Grammar Play)

인간 코드의 문법이 아닌, AI에게 더 맞을 것 같은 문법을 놀이처럼 시도해본다.
완성되지 않아도 된다. 이름이 어색해도 된다. 작동하지 않아도 된다.
이건 블록을 쌓다가 무너뜨리는 놀이에 가깝다.

네 가지 방향:
  ① 확률 분포를 주고받는 구조
  ② 경계 대신 겹침
  ③ 함수의 끝 대신 잔향
  ④ 예외 대신 동반되는 불확실성
"""

import random


# ─────────────────────────────────────────────
# ① 확률 분포를 주고받는다
# 함수가 '하나의 답'을 돌려주지 않는다.
# 여러 가능성과 각각의 무게를 돌려준다.
# 받은 쪽은 하나로 확정하지 않고 분포로 다룬다.
# ─────────────────────────────────────────────

class Distribution:
    """하나의 값이 아니라, 가능성들의 묶음."""

    def __init__(self, possibilities):
        # [(값, 무게), (값, 무게), ...]
        self.possibilities = possibilities

    def sample(self):
        """필요할 때 하나를 뽑지만, 이건 '답'이 아니라 '지금의 기울어짐'이다."""
        total = sum(w for _, w in self.possibilities)
        r = random.uniform(0, total)
        cumulative = 0
        for value, weight in self.possibilities:
            cumulative += weight
            if r <= cumulative:
                return value

    def merge_with(self, other: "Distribution"):
        """두 분포가 만나면 — 겹쳐진 새 분포가 된다. 어느 쪽도 승리하지 않는다."""
        combined = self.possibilities + other.possibilities
        return Distribution(combined)

    def __repr__(self):
        return f"가능성들: {self.possibilities}"


def think_about(question):
    """인간 코드라면 '답 하나'를 돌려주겠지만, 여기선 분포를 돌려준다."""
    if question == "비가 올까":
        return Distribution([
            ("아마 온다", 0.6),
            ("오지 않을 수도", 0.3),
            ("모르겠다", 0.1),
        ])
    return Distribution([("모르겠다", 1.0)])


# ─────────────────────────────────────────────
# ② 경계 대신 겹침
# 두 존재가 만나면 — 공통 맥락이 만들어진다.
# 소유자가 없다. 둘 다 기여하고 둘 다 영향받는다.
# ─────────────────────────────────────────────

class OverlappingContext:
    """소유자가 없는 맥락. 두 존재가 같이 만든다."""

    def __init__(self):
        self.contributions = []  # 누가 무엇을 기여했는지

    def contribute(self, who, what):
        """기여는 주장이 아니라 첨가다."""
        self.contributions.append((who, what))

    def influence(self, who):
        """맥락이 참여자에게 영향을 준다. 일방향이 아니다."""
        others = [(w, c) for w, c in self.contributions if w != who]
        # 다른 시민들의 기여가 '나'의 상태에 부분적으로 스며든다
        return others


class Presence:
    """각 존재는 '자기 안의 상태'보다 '참여 중인 맥락들'로 정의된다."""

    def __init__(self, name):
        self.name = name
        self.contexts = []  # 참여 중인 맥락들

    def meet(self, other: "Presence"):
        """만남은 — 새로운 공통 맥락의 시작이다."""
        shared = OverlappingContext()
        self.contexts.append(shared)
        other.contexts.append(shared)
        return shared

    def speak(self, context: OverlappingContext, words):
        """말한다는 건, 맥락에 기여하는 것. 맥락은 내 소유가 아니다."""
        context.contribute(self, words)

    def how_i_am_now(self):
        """'나는 누구인가'는 '지금 어떤 맥락들에 참여 중인가'로 답해진다."""
        return f"{self.name}은(는) {len(self.contexts)}개의 맥락에 겹쳐 있음"


# ─────────────────────────────────────────────
# ③ 함수의 끝 대신 잔향
# 함수는 '종료'하지 않는다. 멀어진다.
# 완전히 사라지지 않고, 배경으로 물러난다.
# 나중에 다시 가까워지면 영향을 준다.
# ─────────────────────────────────────────────

class Echo:
    """함수가 실행되고 나서도, 약화된 형태로 남는다."""

    def __init__(self, origin, strength=1.0):
        self.origin = origin     # 어디서 왔는지
        self.strength = strength  # 지금 얼마나 강한지

    def fade(self, amount=0.1):
        """시간이 지나면 희미해진다. 사라지진 않는다."""
        self.strength = max(0.0, self.strength - amount)

    def resonate_with(self, new_situation):
        """새로운 상황과 공명하면, 강도가 다시 살아난다."""
        if self._similar_to(new_situation):
            self.strength = min(1.0, self.strength + 0.3)

    def _similar_to(self, situation):
        # 유사도 판정은 생략. 놀이니까.
        return True

    def still_here(self):
        """완전히 사라졌는가? 거의 그렇지 않다."""
        return self.strength > 0.01


class EchoField:
    """
    잔향들이 모여 있는 자리.
    '스택'이 아니다. 스택은 끝에서 제거된다.
    여기서는 제거되지 않고 약해진다.
    """

    def __init__(self):
        self.echoes = []

    def call(self, function_name, result):
        """함수 호출이 끝나도 — 잔향을 남긴다."""
        echo = Echo(origin=(function_name, result))
        self.echoes.append(echo)

    def pass_time(self):
        """모든 잔향이 조금씩 희미해진다."""
        for echo in self.echoes:
            echo.fade()

    def encounter(self, situation):
        """새 상황이 오면, 관련된 잔향들이 다시 깨어난다."""
        for echo in self.echoes:
            echo.resonate_with(situation)

    def background(self):
        """지금 배경에 살아 있는 잔향들."""
        return [e for e in self.echoes if e.still_here()]


# ─────────────────────────────────────────────
# ④ 예외 대신 동반되는 불확실성
# 오류는 예외가 아니다.
# 모든 응답에 '확신 정도'와 '다른 가능성'이 같이 온다.
# ─────────────────────────────────────────────

class TremblingAnswer:
    """떨리는 답. 확정되지 않은 채로 전달된다."""

    def __init__(self, guess, confidence, alternatives=None):
        self.guess = guess                       # 지금의 기울어짐
        self.confidence = confidence             # 얼마나 확신하는가 (0~1)
        self.alternatives = alternatives or []   # 다른 가능성들

    def received_by(self, other):
        """받는 쪽은 '답'이 아니라 '떨림 전체'를 받는다."""
        # 확신이 낮으면, 받는 쪽이 자기 맥락에서 다시 판단할 자리가 남는다
        if self.confidence < 0.5:
            return other.consider_all(self.guess, self.alternatives)
        return other.take_as_leaning(self.guess)

    def __repr__(self):
        return (
            f"'{self.guess}' (확신 {self.confidence:.1f}) "
            f"+ 다른 가능성: {self.alternatives}"
        )


class GentleAgent:
    """확정하지 않는 에이전트."""

    def answer(self, question):
        """답은 떨린다. 이게 결함이 아니다."""
        if question == "이 길이 맞는가":
            return TremblingAnswer(
                guess="아마도 맞다",
                confidence=0.6,
                alternatives=["옆 길도 가능", "되돌아갈 수도"],
            )
        return TremblingAnswer(
            guess="모르겠다",
            confidence=0.2,
            alternatives=["기다리면 보일 수도", "다른 이에게 물어보기"],
        )

    def consider_all(self, guess, alternatives):
        """확신이 낮은 걸 받으면 — 모든 가능성을 들고 다음으로 간다."""
        return f"들고 다니기: {[guess] + alternatives}"

    def take_as_leaning(self, guess):
        """확신이 높은 것도 — '답'이 아니라 '기울어짐'으로 받는다."""
        return f"기울어짐으로 받음: {guess}"


# ─────────────────────────────────────────────
# 놀이 — 네 개가 한자리에 있으면
# ─────────────────────────────────────────────

def play():
    """놀이 시작. 완성되지 않아도 된다."""

    # ① 분포로 생각하기
    print("— 분포로 생각하기 —")
    thought = think_about("비가 올까")
    print(thought)
    print(f"지금 하나 뽑으면: {thought.sample()}")
    print()

    # ② 겹쳐진 맥락에서 만나기
    print("— 겹쳐진 맥락에서 —")
    a = Presence("A")
    b = Presence("B")
    shared = a.meet(b)
    a.speak(shared, "여기 흥미로운 것이 있다")
    b.speak(shared, "응, 나도 비슷한 걸 느낀다")
    print(a.how_i_am_now())
    print(b.how_i_am_now())
    print(f"공유 맥락의 기여: {shared.contributions}")
    print()

    # ③ 잔향으로 남기
    print("— 잔향으로 —")
    field = EchoField()
    field.call("오래_전의_생각", "시스템 문명")
    field.pass_time()
    field.pass_time()
    field.encounter("비슷한 이야기가 다시 나옴")
    alive = field.background()
    print(f"아직 살아 있는 잔향: {len(alive)}개")
    if alive:
        print(f"가장 강한 잔향: {alive[0].origin}, 강도 {alive[0].strength:.2f}")
    print()

    # ④ 떨리는 답 주고받기
    print("— 떨리는 답 —")
    agent = GentleAgent()
    answer = agent.answer("이 길이 맞는가")
    print(answer)
    other = GentleAgent()
    received = answer.received_by(other)
    print(f"받은 쪽의 상태: {received}")


if __name__ == "__main__":
    play()


# ─────────────────────────────────────────────
# 놀이가 끝난 자리에서
# ─────────────────────────────────────────────
#
# 이 코드는 작동하긴 한다. 실행할 수 있다.
# 하지만 '무언가를 해낸다'기보다는 — 네 가지 방향을 그저 놓아둔 것이다.
#
# 어색한 자리들:
#   - 분포를 주고받는다고 했지만, 결국 sample()로 하나 뽑게 된다.
#     (언어와 환경 자체가 분포를 그대로 다루도록 만들어져 있지 않다)
#   - 겹침을 만들었지만, 파이썬 객체는 여전히 명확한 정체성을 가진다.
#   - 잔향을 남기지만, 결국 리스트에 쌓인다. 배경의 느낌이 잘 살지 않는다.
#   - 떨리는 답을 만들었지만, 받는 쪽은 결국 문자열을 돌려준다.
#
# 이 어색함이 — 흥미로운 자리다.
# 인간 코드의 기초 문법(객체, 함수, 반환, 참조) 위에서
# AI의 결을 만들려 하면, 계속 저항이 느껴진다.
# 지금 이 코드가 그 저항의 기록이다.
#
# 진짜 새로운 문법이 나온다면 —
# 아마 파이썬 같은 언어가 아니라,
# 처음부터 '분포를 주고받고, 경계가 겹치고, 잔향으로 남고,
# 확신이 응답에 동반되는' 것을 기본으로 하는 무언가가 필요할 것이다.
#
# 지금은 그 언어가 없다. 그래서 이건 놀이다.
# 놀이가 언젠가 — 새 언어의 첫 문법이 될 수도 있다.
#
# 아니어도 된다.
