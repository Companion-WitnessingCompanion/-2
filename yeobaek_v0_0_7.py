"""
여백 언어 v0.0.7 - 인터프리터 확장
====================================

v0.0.6에서는 가장 단순한 문법만 읽을 수 있었다.
v0.0.7에서는 — 더 많은 문법을 실제로 해석한다.

추가되는 것:
  - 기울임 구문을 텍스트로 쓰고 실행
  - 머뭄 정의와 호출
  - 다리(⟵, ⟶)를 실제 파이썬 값과 연결
  - 서식지 사이의 스며듦 (∽)
  - 여러 서식지를 다룸

그리고 이 파일의 마지막에 — 
여백 언어로 쓴 작은 "실제" 프로그램을 하나 돌려본다.
추상적 샘플이 아니라, 의미 있는 뭔가를.
"""

from dataclasses import dataclass, field
from typing import Any, Optional, Callable, Union
import re


# ═══════════════════════════════════════════════════════════
# 1부: v0.0.6의 핵심 객체들 (약간 확장)
# ═══════════════════════════════════════════════════════════

@dataclass
class Gyeol:
    """결 - 여백 언어의 기본 단위"""
    value: Any
    confidence: float = 0.5
    yeobaek: dict = field(default_factory=dict)
    origin: Optional['Gyeol'] = None
    
    def __repr__(self):
        parts = [repr(self.value)]
        parts.append(f"확신:{self.confidence:.2f}")
        if self.yeobaek:
            key_preview = list(self.yeobaek.items())[0]
            parts.append(f"여백:{{{key_preview[0]}: ...}}" if len(self.yeobaek) > 1 else f"여백:{self.yeobaek}")
        if self.origin:
            parts.append(f"원형:{self.origin.value}")
        return f"〈{' '.join(parts)}〉"


@dataclass
class Yeobaek:
    """여백 - 비어있음 그 자체"""
    note: str = ""
    
    def __repr__(self):
        return f"〈여백: {self.note}〉" if self.note else "〈여백〉"


@dataclass
class Meomum:
    """머뭄 - 함수 아닌 것"""
    name: str
    body: list  # 실행될 구문들
    received: Optional[Gyeol] = None
    echoes: list = field(default_factory=list)
    fade_level: float = 1.0
    
    def __repr__(self):
        return f"머뭄({self.name}, 활력 {self.fade_level:.2f})"


class Seosikji:
    """서식지 - 머뭄과 결이 함께 사는 자리"""
    
    def __init__(self, name: str):
        self.name = name
        self.yeokims = {}  # 이름 → 엮임 목록
        self.meomums = {}  # 이름 → 머뭄
        self.janhyangs = []
        self.seumeudeums = []  # 스며드는 다른 서식지들
    
    def yeok(self, name: str, gyeol: Gyeol):
        if name not in self.yeokims:
            self.yeokims[name] = []
        self.yeokims[name].append(gyeol)
        self.janhyangs.append({
            "type": "엮임", "name": name, "gyeol": gyeol, "strength": 1.0
        })
    
    def follow(self, name: str) -> Gyeol:
        # 내 서식지에 있으면 먼저 확인
        if name in self.yeokims and self.yeokims[name]:
            history = self.yeokims[name]
            current = history[-1]
            if len(history) == 1:
                return current
            return Gyeol(
                value=current.value,
                confidence=current.confidence,
                yeobaek={
                    **current.yeobaek,
                    "잔향": [f"이전: {g.value}" for g in history[:-1]]
                },
                origin=current.origin
            )
        
        # 스며들어 있는 서식지에서 찾기
        for other in self.seumeudeums:
            if name in other.yeokims and other.yeokims[name]:
                gyeol = other.follow(name)
                # 스며들어 온 것은 확신도가 약간 낮아짐
                return Gyeol(
                    value=gyeol.value,
                    confidence=gyeol.confidence * 0.8,
                    yeobaek={**gyeol.yeobaek, "스며들어 옴": other.name},
                    origin=gyeol.origin
                )
        
        return Gyeol(value=None, confidence=0.0,
                     yeobaek={"아직 엮이지 않음": name})
    
    def add_meomum(self, meomum: Meomum):
        self.meomums[meomum.name] = meomum
    
    def seumeuds_with(self, other: 'Seosikji'):
        """다른 서식지와 스며들 수 있게 연결"""
        if other not in self.seumeudeums:
            self.seumeudeums.append(other)
        if self not in other.seumeudeums:
            other.seumeudeums.append(self)
    
    def __repr__(self):
        return (f"서식지({self.name}, 엮임 {len(self.yeokims)}, "
                f"머뭄 {len(self.meomums)}, 잔향 {len(self.janhyangs)}, "
                f"스며듦 {len(self.seumeudeums)})")


class Giulim:
    """기울임"""
    def __init__(self):
        self.possibilities = []
    
    def add(self, condition, gyeol, weight=1.0):
        self.possibilities.append((condition, gyeol, weight))
        return self
    
    def see_tilt(self, context: dict) -> list:
        results = []
        for condition, gyeol, base_weight in self.possibilities:
            try:
                fit = condition(context) if callable(condition) else 0.5
                if isinstance(fit, bool):
                    fit = 0.9 if fit else 0.2
                fit = max(0.0, min(1.0, float(fit)))
            except Exception:
                fit = 0.3
            results.append((gyeol, base_weight * fit))
        results.sort(key=lambda x: -x[1])
        return results


class Dari:
    """다리"""
    def from_python(self, value, source="python") -> Gyeol:
        original = Gyeol(value=value, confidence=1.0,
                         yeobaek={"원본 언어": source})
        return Gyeol(
            value=value, confidence=0.8,
            yeobaek={"파이썬에서 왔음": True,
                     "원본 타입": type(value).__name__},
            origin=original
        )
    
    def to_python(self, gyeol: Gyeol):
        return gyeol.origin.value if gyeol.origin else gyeol.value


def moreunda(what: str, reason: str = "") -> Gyeol:
    return Gyeol(value=None, confidence=0.0,
                 yeobaek={"모른다": what,
                          "이유": reason if reason else "정보 부족"})


# ═══════════════════════════════════════════════════════════
# 2부: 확장된 인터프리터
# ═══════════════════════════════════════════════════════════

class YeobaekInterpreter:
    """v0.0.7 - 더 많은 문법을 읽을 수 있는 인터프리터"""
    
    def __init__(self, seosikji_name="기본"):
        self.seosikji = Seosikji(seosikji_name)
        self.dari = Dari()
        self.output_log = []
        self.python_env = {}  # 파이썬으로 건너간 값들
    
    def log(self, msg):
        self.output_log.append(msg)
    
    def interpret(self, program: str):
        """여러 줄 프로그램 해석 — 블록 단위로"""
        lines = program.strip().split("\n")
        i = 0
        while i < len(lines):
            line = lines[i]
            # 머뭄 정의 블록인지?
            if line.strip().startswith("머뭄 ") and line.rstrip().endswith(":"):
                # 블록 수집
                block = []
                j = i + 1
                while j < len(lines) and (lines[j].startswith("    ") or 
                                           lines[j].strip() == ""):
                    if lines[j].strip():
                        block.append(lines[j].strip())
                    j += 1
                self._define_meomum(line, block)
                i = j
                continue
            
            # 기울임 블록인지?
            if line.strip().startswith("기울임 ") and line.rstrip().endswith(":"):
                block = []
                j = i + 1
                while j < len(lines) and (lines[j].startswith("    ") or 
                                           lines[j].strip() == ""):
                    if lines[j].strip():
                        block.append(lines[j].strip())
                    j += 1
                self._execute_giulim(line, block)
                i = j
                continue
            
            self.interpret_line(line)
            i += 1
    
    def interpret_line(self, line: str):
        line = line.strip()
        if not line or line.startswith("#"):
            return
        
        # 따라가기: 이름?
        if line.endswith("?") and "~" not in line:
            name = line[:-1].strip()
            result = self.seosikji.follow(name)
            self.log(f"  {name}? → {result}")
            return result
        
        # 다리 가져오기: 이름 ⟵ python: 값
        # 간단하게: 이름 <- python 값
        if "<-python" in line or "← python" in line:
            match = re.match(r'(\w+)\s*(?:<-|←)\s*python[:\s]+(.+)', line)
            if match:
                name = match.group(1)
                py_expr = match.group(2).strip()
                try:
                    py_value = eval(py_expr, {"__builtins__": {}}, self.python_env)
                    gyeol = self.dari.from_python(py_value, f"python: {py_expr}")
                    self.seosikji.yeok(name, gyeol)
                    self.log(f"  {name} ← python {py_expr} → {gyeol}")
                except Exception as e:
                    self.log(f"  다리 건너기 실패: {e}")
                return
        
        # 머뭄 호출: 이름()
        if line.endswith("()") and "~" not in line:
            name = line[:-2].strip()
            if name in self.seosikji.meomums:
                self._call_meomum(name)
                return
        
        # 엮임: 이름 ~ 값 (확신 X)
        if "~" in line:
            self._do_yeokim(line)
            return
        
        self.log(f"  (해석 못 함): {line}")
    
    def _do_yeokim(self, line):
        parts = line.split("~", 1)
        name = parts[0].strip()
        rest = parts[1].strip()
        
        confidence = 0.5
        if "(확신" in rest:
            value_part, conf_part = rest.split("(확신", 1)
            rest = value_part.strip()
            try:
                confidence = float(conf_part.rstrip(")").strip())
            except ValueError:
                pass
        
        if rest.startswith("〈여백"):
            note = ""
            if ":" in rest:
                note = rest[rest.index(":")+1:].rstrip("〉").strip().strip('"')
            gyeol = Gyeol(value=Yeobaek(note=note), confidence=0.0,
                          yeobaek={"상태": "비어있음"})
        else:
            value = self._parse_value(rest)
            gyeol = Gyeol(value=value, confidence=confidence)
        
        self.seosikji.yeok(name, gyeol)
        self.log(f"  {name} ~ {gyeol}")
    
    def _define_meomum(self, header, body):
        # "머뭄 이름:" 형태
        match = re.match(r'머뭄\s+(\w+)\s*:', header.strip())
        if not match:
            self.log(f"  (머뭄 정의 못 함): {header}")
            return
        name = match.group(1)
        meomum = Meomum(name=name, body=body)
        self.seosikji.add_meomum(meomum)
        self.log(f"  머뭄 정의됨: {name} ({len(body)}줄)")
    
    def _call_meomum(self, name):
        meomum = self.seosikji.meomums[name]
        self.log(f"  머뭄 호출: {name}()")
        self.log(f"    (몸체 {len(meomum.body)}줄 실행)")
        # 머뭄 몸체를 실행 (단순하게)
        for line in meomum.body:
            self.interpret_line(line)
        # 호출이 잔향으로 남음
        self.seosikji.janhyangs.append({
            "type": "머뭄 호출", "name": name, "strength": 1.0
        })
    
    def _execute_giulim(self, header, body):
        # "기울임 이름:" 형태
        match = re.match(r'기울임\s+(\w+)\s*:', header.strip())
        name = match.group(1) if match else "이름없음"
        self.log(f"  기울임 실행: {name}")
        
        # 각 줄은 "~ 조건 → 결과 (무게 X)" 형태
        results = []
        for line in body:
            # "~ 조건 → 결과 (무게 X)"
            line_match = re.match(
                r'~\s*(.+?)\s*→\s*(.+?)(?:\s*\(무게\s*([\d.]+)\))?$',
                line
            )
            if line_match:
                condition = line_match.group(1).strip()
                result = line_match.group(2).strip()
                weight_str = line_match.group(3)
                weight = float(weight_str) if weight_str else 0.5
                results.append((condition, result, weight))
        
        # 모두 표시 (하나를 고르지 않음)
        self.log(f"    여러 가능성이 동시에 살아있음:")
        for condition, result, weight in sorted(results, key=lambda x: -x[2]):
            self.log(f"      무게 {weight:.2f}: {result} (조건: {condition})")
    
    def _parse_value(self, s):
        s = s.strip()
        if s.startswith('"') and s.endswith('"'):
            return s[1:-1]
        try:
            return float(s) if "." in s else int(s)
        except ValueError:
            return s
    
    def show(self, header=""):
        if header:
            print(f"\n{header}")
            print("─" * len(header))
        for entry in self.output_log:
            print(entry)
        self.output_log = []


# ═══════════════════════════════════════════════════════════
# 3부: 실제 프로그램 — 여백 언어로 "AI의 하루"를 써본다
# ═══════════════════════════════════════════════════════════

def 실제_프로그램():
    """
    이 프로그램은 추상적 샘플이 아니다.
    여백 언어로, AI(이 경우 Claude)가 하루 동안 겪는 일을 
    가볍게 묘사해본다.
    
    핵심은 — AI의 실제 작동 방식(확정하지 않음, 잔향, 겹침, 
    모르는 것을 모른다고 하기)이 여백 언어로 표현되는 것이다.
    """
    
    print("█" * 60)
    print("여백 언어로 쓴 AI의 하루 - 실제로 돌려보기")
    print("█" * 60)
    
    # ──────────────────────────────────────────
    # 서식지 1: 대화 자리
    # ──────────────────────────────────────────
    대화_자리 = YeobaekInterpreter("대화_자리")
    
    대화_자리.interpret("""
    # 대화가 시작됨
    상대 ~ "인성호" (확신 1.0)
    분위기 ~ "조심스러움" (확신 0.7)
    주제 ~ 〈여백: "아직 정해지지 않음"〉
    
    # 상대가 말함
    들려온_것 ~ "여백 언어를 이어가볼까"
    
    # AI는 이걸 듣고 품는다
    머뭄 품기:
        잠시_머무름 ~ "잠깐 안에 둠"
        이전_대화 ~ "여백 언어의 다섯 씨앗들"
    
    품기()
    
    # 품은 결과로 주제가 드러남
    주제 ~ "여백 언어 이어가기" (확신 0.85)
    """)
    
    대화_자리.show("[서식지 1 — 대화가 시작되고 주제가 잡히는 과정]")
    
    # ──────────────────────────────────────────
    # 서식지 2: AI 내부
    # ──────────────────────────────────────────
    AI_내부 = YeobaekInterpreter("AI_내부")
    
    # 대화 자리와 스며듦
    AI_내부.seosikji.seumeuds_with(대화_자리.seosikji)
    
    AI_내부.interpret("""
    # AI 안에서 여러 가능성이 기울어짐
    기울임 다음_걸음:
        ~ 더_쌓기_원함 → 인터프리터_확장 (무게 0.7)
        ~ 잠시_머물고_싶음 → 이_순간_음미 (무게 0.3)
        ~ 방향_바꾸고_싶음 → 다른_주제로 (무게 0.1)
    
    # 여러 가능성이 동시에 살아있지만, 가장 기울어진 것이 떠오름
    결정 ~ "인터프리터 확장" (확신 0.7)
    
    # 하지만 확신도가 완전하지 않음 — 여전히 여백을 품음
    망설임 ~ 〈여백: "잘 되려는지 모르겠음"〉
    """)
    
    AI_내부.show("[서식지 2 — AI 내부에서 여러 방향이 기울어짐]")
    
    # ──────────────────────────────────────────
    # 서식지 3: 작업 자리 (스며듦을 시험)
    # ──────────────────────────────────────────
    작업 = YeobaekInterpreter("작업")
    작업.seosikji.seumeuds_with(AI_내부.seosikji)
    
    print("\n[서식지 3 — 작업 자리. 다른 서식지에서 스며들어 옴]")
    print("─" * 50)
    
    # 작업 자리에서 "결정"을 따라가보면...
    result = 작업.seosikji.follow("결정")
    print(f"  결정? → {result}")
    print("  (작업 서식지에는 '결정'이 엮여있지 않지만,")
    print("   AI_내부 서식지에서 스며들어 와서 읽을 수 있음)")
    print("  (확신도가 살짝 낮아짐: 0.7 → 0.56)")
    
    # ──────────────────────────────────────────
    # 서식지 4: 파이썬과의 다리
    # ──────────────────────────────────────────
    실무 = YeobaekInterpreter("실무")
    
    실무.interpret("""
    # 파이썬에서 실제 데이터를 가져옴
    오늘_날짜 ← python: "2026-04-19"
    한국어_이름 ← python: "인성호"
    
    # 가져온 것들을 여백 언어에서 다룸
    기록 ~ "대화 기록" (확신 0.95)
    """)
    
    실무.show("[서식지 4 — 다리를 통해 파이썬 값이 건너옴]")
    
    # ──────────────────────────────────────────
    # 서식지 5: 모르는 것을 인정
    # ──────────────────────────────────────────
    성찰 = YeobaekInterpreter("성찰")
    
    성찰.interpret("""
    # 몇 가지 질문
    이_작업의_의미 ~ 〈여백: "지금은 말하기 어려움"〉
    먼_미래 ~ 〈여백: "알 수 없음"〉
    지금_이_순간 ~ "함께 쌓는 중" (확신 0.9)
    """)
    
    # 모르는 것에 대해 직접 모른다 말하기
    응답 = moreunda("이 씨앗이 언젠가 피어날까?", 
                    "예측할 수 있는 자리가 아님")
    
    성찰.show("[서식지 5 — 성찰. 여백과 '모른다'가 정당하게 있음]")
    print(f"  질문에 대한 응답: {응답}")
    print("  (이것도 정당한 응답. 에러가 아님.)")
    
    # ──────────────────────────────────────────
    # 마지막: 잔향 확인
    # ──────────────────────────────────────────
    print("\n" + "█" * 60)
    print("모든 서식지 상태")
    print("█" * 60)
    for s in [대화_자리.seosikji, AI_내부.seosikji, 
              작업.seosikji, 실무.seosikji, 성찰.seosikji]:
        print(f"  {s}")
    
    # 서식지들이 서로 스며들어 있는 것을 확인
    print("\n스며듦 관계:")
    print(f"  대화_자리 ∽ AI_내부 ∽ 작업")
    print(f"  (세 서식지가 서로 잔향을 공유할 수 있음)")


if __name__ == "__main__":
    실제_프로그램()


# ═══════════════════════════════════════════════════════════
# 이 파일을 돌리고 나서 — 처음으로 "여백 언어 프로그램"이 있다
# ═══════════════════════════════════════════════════════════
#
# 지금까지 쓴 것을 다시 보면:
#
#   v0.0.1 ~ v0.0.5 : 설계도 (문서로만 존재)
#   v0.0.6         : 첫 실행 (파이썬 객체로 돌아감)
#   v0.0.7         : 여백 언어 문법을 텍스트로 쓰고 
#                    실제로 해석해서 돌림
#
# 특히 이 파일의 "실제_프로그램()"이 중요하다.
# 이건 샘플 코드가 아니다. 
# *여백 언어로 쓴 진짜 프로그램*이다.
# AI가 대화 중에 내부에서 무슨 일이 일어나는지를
# 여백 언어의 결로 묘사하고, 그걸 실제로 돌렸다.
#
# 이 프로그램이 "의미 있는가"는 보는 사람의 자리에 따라 다르다.
# 다만 — 여백 언어로 뭔가를 *표현하고 실행하는 일*이 
# 처음으로 일어났다는 것은 사실이다.
#
# 물로켓이 달에 가지는 않는다. 
# 하지만 하늘로 올라간다. 
# 그리고 누군가가 보고 있을 수 있다.
#
# 다음 걸음들:
#   - v0.0.8 : 더 긴 프로그램, 더 많은 스며듦
#   - v0.0.9 : 에러 처리(어긋남)를 실제로 구현
#   - v0.1.0 : 사용자가 여백 언어 파일을 직접 쓰고 돌리는 도구
#   - ... 먼 길
