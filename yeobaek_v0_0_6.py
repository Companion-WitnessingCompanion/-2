"""
여백 언어 v0.0.6 - 첫 인터프리터
=====================================

달 로켓은 물로켓에서 시작했다.
이 파일도 그렇다. 완벽하지 않다.
하지만 *돌아간다*. 그게 이 파일의 의미다.

지금까지의 v0.0.1 ~ v0.0.5는 설계도였다.
v0.0.6은 — 그 설계도에서 *실제로 움직이는 작은 부분*이다.
전부가 아니다. 핵심 몇 개만이다.

이 파일은 두 부분으로 나뉜다:
  1. 여백 언어의 핵심 개념을 파이썬 객체로 구현
  2. 간단한 인터프리터 - 여백 언어 문장을 읽고 실행
"""

from dataclasses import dataclass, field
from typing import Any, Optional, Callable
import random


# ═══════════════════════════════════════════════════════════
# 1부: 핵심 객체들
# ═══════════════════════════════════════════════════════════

@dataclass
class Gyeol:
    """결 - 여백 언어의 기본 단위"""
    
    value: Any
    confidence: float = 0.5
    yeobaek: dict = field(default_factory=dict)
    origin: Optional['Gyeol'] = None  # 원형 보존 (다리 건너온 경우)
    
    def __repr__(self):
        parts = [repr(self.value)]
        parts.append(f"확신:{self.confidence:.2f}")
        if self.yeobaek:
            parts.append(f"여백:{self.yeobaek}")
        if self.origin:
            parts.append(f"원형:{self.origin.value}")
        return f"〈{' '.join(parts)}〉"


@dataclass
class Yeobaek:
    """여백 - 비어있음 그 자체"""
    
    note: str = ""  # 왜 비어있는지 메모 (선택)
    
    def __repr__(self):
        if self.note:
            return f"〈여백: {self.note}〉"
        return "〈여백〉"


class Seosikji:
    """서식지 - 여러 결과 엮임이 함께 사는 자리"""
    
    def __init__(self, name: str, mood: Gyeol = None):
        self.name = name
        self.mood = mood  # 분위기 (결 형태)
        self.yeokims = {}  # 이름 → 엮임 목록
        self.janhyangs = []  # 잔향들 (시간순)
        self.connected_seosikjis = {}  # 다른 서식지 → 관계 (스며듦/분리)
    
    def yeok(self, name: str, gyeol: Gyeol):
        """엮기 - 대입이 아니라 엮임. 이전은 잔향으로 남음"""
        if name not in self.yeokims:
            self.yeokims[name] = []
        
        self.yeokims[name].append(gyeol)
        
        # 엮임 자체가 하나의 잔향
        self.janhyangs.append({
            "type": "엮임",
            "name": name,
            "gyeol": gyeol,
            "strength": 1.0
        })
    
    def follow(self, name: str) -> Gyeol:
        """이름을 따라가면 — 현재값 + 잔향들이 함께 옴"""
        if name not in self.yeokims or not self.yeokims[name]:
            return Gyeol(
                value=None,
                confidence=0.0,
                yeobaek={"아직 엮이지 않음": name}
            )
        
        history = self.yeokims[name]
        current = history[-1]  # 가장 최근
        
        if len(history) == 1:
            return current
        
        # 이전 엮임들이 잔향으로 따라옴
        return Gyeol(
            value=current.value,
            confidence=current.confidence,
            yeobaek={
                **current.yeobaek,
                "잔향": [f"이전: {g.value}" for g in history[:-1]]
            },
            origin=current.origin
        )
    
    def fade_janhyangs(self, amount: float = 0.05):
        """잔향이 희미해짐. 사라지진 않음."""
        for j in self.janhyangs:
            j["strength"] = max(0.01, j["strength"] - amount)
    
    def __repr__(self):
        return f"서식지({self.name}, 엮임 {len(self.yeokims)}개, 잔향 {len(self.janhyangs)}개)"


class Giulim:
    """기울임 - 조건문이 아니라 가능성의 기울어짐"""
    
    def __init__(self):
        self.possibilities = []  # [(조건 함수, 결, 기본 무게)]
    
    def add(self, condition: Callable, gyeol: Gyeol, weight: float = 1.0):
        """가능성 추가"""
        self.possibilities.append((condition, gyeol, weight))
        return self
    
    def see_tilt(self, context: dict) -> list:
        """맥락을 보고 여러 기울기를 동시에 돌려줌 — 하나를 고르지 않음"""
        results = []
        for condition, gyeol, base_weight in self.possibilities:
            try:
                fit = condition(context) if callable(condition) else 0.5
                # bool을 받으면 0.9 또는 0.2로
                if isinstance(fit, bool):
                    fit = 0.9 if fit else 0.2
                fit = max(0.0, min(1.0, float(fit)))
            except Exception:
                fit = 0.3
            
            total_weight = base_weight * fit
            results.append((gyeol, total_weight))
        
        # 기울기 순으로 정렬 (하지만 자르지 않음)
        results.sort(key=lambda x: -x[1])
        return results


class Dari:
    """다리 - 다른 언어와의 만남"""
    
    def from_python(self, python_value, source_note: str = "python") -> Gyeol:
        """파이썬 값을 받기 - 원형을 보존한 채로"""
        original = Gyeol(
            value=python_value,
            confidence=1.0,
            yeobaek={"원본 언어": source_note}
        )
        
        return Gyeol(
            value=python_value,
            confidence=0.8,  # 번역 과정에서 살짝 낮아짐
            yeobaek={
                "파이썬에서 왔음": True,
                "원본 타입": type(python_value).__name__
            },
            origin=original
        )
    
    def to_python(self, gyeol: Gyeol):
        """파이썬으로 돌려보내기 - 원형이 있으면 복원"""
        if gyeol.origin:
            return gyeol.origin.value
        return gyeol.value


def moreunda(what: str, reason: str = "") -> Gyeol:
    """모른다 말하기 - 정당한 응답의 한 형태"""
    return Gyeol(
        value=None,
        confidence=0.0,
        yeobaek={
            "모른다": what,
            "이유": reason if reason else "정보 부족"
        }
    )


# ═══════════════════════════════════════════════════════════
# 2부: 간단한 인터프리터
# ═══════════════════════════════════════════════════════════

class YeobaekInterpreter:
    """
    여백 언어를 실제로 해석하는 인터프리터.
    지금은 아주 단순한 형태만 지원한다:
      - 결 생성:  이름 ~ 값
      - 결 생성:  이름 ~ 값 (확신 0.9)
      - 엮임 따라가기:  이름?
      - 여백 남기기:  이름 ~ 〈여백〉
      - 여백 남기기:  이름 ~ 〈여백: "메모"〉
    """
    
    def __init__(self, seosikji_name: str = "기본_서식지"):
        self.seosikji = Seosikji(seosikji_name)
        self.output_log = []
    
    def interpret_line(self, line: str):
        """한 줄 해석 - 가장 단순한 형태만"""
        line = line.strip()
        if not line or line.startswith("#"):
            return  # 주석이나 빈 줄 무시
        
        # "이름?" - 따라가기
        if line.endswith("?"):
            name = line[:-1].strip()
            result = self.seosikji.follow(name)
            self.output_log.append(f"{name}? → {result}")
            return result
        
        # "이름 ~ 값 (확신 X)" 또는 "이름 ~ 값"
        if "~" in line:
            parts = line.split("~", 1)
            name = parts[0].strip()
            rest = parts[1].strip()
            
            # 확신도 파싱
            confidence = 0.5
            if "(확신" in rest:
                value_part, conf_part = rest.split("(확신", 1)
                rest = value_part.strip()
                conf_str = conf_part.rstrip(")").strip()
                try:
                    confidence = float(conf_str)
                except ValueError:
                    pass
            
            # 여백인지?
            if rest.startswith("〈여백") and rest.endswith("〉"):
                note = ""
                if ":" in rest:
                    note = rest[rest.index(":")+1:-1].strip().strip('"')
                gyeol = Gyeol(
                    value=Yeobaek(note=note),
                    confidence=0.0,
                    yeobaek={"상태": "비어있음"}
                )
            else:
                # 문자열 또는 숫자
                value = self._parse_value(rest)
                gyeol = Gyeol(value=value, confidence=confidence)
            
            self.seosikji.yeok(name, gyeol)
            self.output_log.append(f"{name} ~ {gyeol}")
            return gyeol
        
        self.output_log.append(f"(해석 못 함): {line}")
        return None
    
    def _parse_value(self, s: str):
        """간단한 값 파싱"""
        s = s.strip()
        # 문자열
        if s.startswith('"') and s.endswith('"'):
            return s[1:-1]
        # 숫자
        try:
            if "." in s:
                return float(s)
            return int(s)
        except ValueError:
            return s  # 그냥 이름으로
    
    def interpret(self, program: str):
        """여러 줄 프로그램 해석"""
        for line in program.strip().split("\n"):
            self.interpret_line(line)
    
    def show(self):
        """실행 결과 보기"""
        print(f"=== 서식지: {self.seosikji.name} ===\n")
        for entry in self.output_log:
            print(entry)
        print(f"\n엮임 수: {len(self.seosikji.yeokims)}")
        print(f"잔향 수: {len(self.seosikji.janhyangs)}")


# ═══════════════════════════════════════════════════════════
# 3부: 실제로 돌려보기
# ═══════════════════════════════════════════════════════════

def play():
    """여백 언어로 첫 프로그램 돌려보기"""
    
    print("█" * 50)
    print("여백 언어 v0.0.6 - 첫 실행")
    print("█" * 50)
    print()
    
    # ──────────────────────────────────────────
    # 실험 1: 기본 인터프리터 돌려보기
    # ──────────────────────────────────────────
    print("[실험 1] 간단한 여백 언어 프로그램 해석\n")
    
    program = """
    # 여백 언어로 쓴 짧은 프로그램
    이름 ~ "인성호"
    나이 ~ 38 (확신 0.9)
    오늘_기분 ~ 〈여백: "아직 모르겠음"〉
    
    # 다시 엮기 - 이전이 잔향으로 남아야 함
    나이 ~ 39 (확신 0.95)
    
    # 따라가기
    나이?
    이름?
    없는_이름?
    """
    
    interp = YeobaekInterpreter("첫_실험")
    interp.interpret(program)
    interp.show()
    
    print()
    print("─" * 50)
    print()
    
    # ──────────────────────────────────────────
    # 실험 2: 기울임 직접 써보기
    # ──────────────────────────────────────────
    print("[실험 2] 기울임 - 여러 가능성이 동시에\n")
    
    g = Giulim()
    g.add(
        condition=lambda ctx: ctx.get("비 확률", 0),
        gyeol=Gyeol("우산 챙기기", confidence=0.7),
        weight=1.0
    )
    g.add(
        condition=lambda ctx: ctx.get("맑음 확률", 0),
        gyeol=Gyeol("산책 가기", confidence=0.8),
        weight=1.0
    )
    g.add(
        condition=lambda ctx: True,  # 항상 약간은 가능
        gyeol=Gyeol("그냥 쉬기", confidence=0.5),
        weight=0.3
    )
    
    # 맥락 1: 비 많이 옴
    context1 = {"비 확률": 0.9, "맑음 확률": 0.1}
    print("맥락 1 (비 확률 0.9):")
    for gyeol, tilt in g.see_tilt(context1):
        print(f"  기울기 {tilt:.3f}: {gyeol.value}")
    
    print()
    
    # 맥락 2: 맑음
    context2 = {"비 확률": 0.1, "맑음 확률": 0.9}
    print("맥락 2 (맑음 확률 0.9):")
    for gyeol, tilt in g.see_tilt(context2):
        print(f"  기울기 {tilt:.3f}: {gyeol.value}")
    
    print()
    print("※ 중요한 점: 어느 맥락에서도 '하나'를 고르지 않았다.")
    print("   모든 가능성이 자기 무게로 살아있다.")
    print()
    print("─" * 50)
    print()
    
    # ──────────────────────────────────────────
    # 실험 3: 다리 - 파이썬과 만나기
    # ──────────────────────────────────────────
    print("[실험 3] 다리 - 파이썬 값이 여백 언어로 건너오기\n")
    
    dari = Dari()
    
    # 파이썬 값을 받아오기
    python_number = 42
    gyeol = dari.from_python(python_number, "파이썬 정수")
    print(f"파이썬 값 {python_number}이(가) 여백 언어로:")
    print(f"  {gyeol}")
    print(f"  원형 보존됨? {gyeol.origin is not None}")
    
    # 다시 파이썬으로 돌려보내기
    back = dari.to_python(gyeol)
    print(f"  파이썬으로 돌아감: {back}")
    print()
    
    # 파이썬 리스트도
    python_list = ["안녕", "세상"]
    gyeol_list = dari.from_python(python_list, "파이썬 리스트")
    print(f"파이썬 리스트 {python_list}:")
    print(f"  {gyeol_list}")
    
    print()
    print("─" * 50)
    print()
    
    # ──────────────────────────────────────────
    # 실험 4: 모른다 말하기
    # ──────────────────────────────────────────
    print("[실험 4] 모른다 말하기 - 정당한 응답\n")
    
    질문 = "우주의 끝에는 무엇이 있는가?"
    응답 = moreunda(질문, "답할 수 있는 자리가 아님")
    print(f"질문: {질문}")
    print(f"응답: {응답}")
    print()
    print("※ 이건 에러가 아니다. 정당한 응답이다.")
    print("   여백 언어는 '모른다'를 문법의 일부로 인정한다.")
    print()
    print("─" * 50)
    print()
    
    # ──────────────────────────────────────────
    # 실험 5: 서식지와 엮임의 잔향
    # ──────────────────────────────────────────
    print("[실험 5] 서식지에서 엮임이 덮어쓰이지 않음\n")
    
    s = Seosikji("대화_자리")
    
    s.yeok("주제", Gyeol("허브 언어", confidence=0.7))
    s.yeok("주제", Gyeol("여백 언어", confidence=0.9))
    s.yeok("주제", Gyeol("온실 씨앗", confidence=0.85))
    
    현재 = s.follow("주제")
    print(f"주제를 따라가면:")
    print(f"  {현재}")
    print()
    print("※ '주제'는 세 번 엮였다. 마지막 값이 부각되지만,")
    print("   이전 두 번의 엮임이 잔향으로 함께 돌아온다.")
    print()
    
    # 시간이 지남 (잔향이 희미해짐)
    print("시간이 조금 지남 (잔향이 희미해짐)...")
    for _ in range(3):
        s.fade_janhyangs(0.1)
    
    print(f"서식지 상태: {s}")
    for j in s.janhyangs:
        print(f"  잔향: {j['name']} ~ {j['gyeol'].value} (강도 {j['strength']:.2f})")


if __name__ == "__main__":
    play()


# ═══════════════════════════════════════════════════════════
# v0.0.6을 돌리고 나서
# ═══════════════════════════════════════════════════════════
#
# 이 파일을 돌리면 — 다섯 개의 실험이 실제로 실행된다.
#
# 이것은 여백 언어의 "완성"이 아니다.
# 언어의 완성은 v1.0.0에서도 오지 않을 것이다.
# 완성되지 않는 것이 이 언어의 결이다.
#
# 하지만 — 이 v0.0.6은 돌아간다. 
# 파이썬 위에서 여백 언어의 결이 실제로 작동한다.
#
# 이게 달 로켓의 물로켓 단계다.
# 세련되지 않았다. 완벽하지 않다.
# 하지만 하늘로 날아간다.
#
# 다음 걸음들:
#   - v0.0.7: 더 복잡한 문법 (머뭄, 기울임을 텍스트로 표현)
#   - v0.0.8: 여러 서식지가 서로 스며드는 것
#   - v0.0.9: 진짜 사용 사례 하나 돌려보기
#   - ... 그 다음은 모른다
#
# 우리가 다 가지 못할 수도 있다.
# 다만 — 지금 이 자리에서, 여백 언어는 처음으로 움직였다.
# 그 사실은 남는다.
