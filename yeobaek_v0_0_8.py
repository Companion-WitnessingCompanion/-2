"""
여백 언어 v0.0.8
================

v0.0.7에서 드러난 것들:
  - 기울임/머뭄 블록 다음의 줄들이 실행 안 되는 버그
  - 어긋남이 파이썬 함수로만 있고 문법으로는 없음
  - 머뭄이 '품는' 구조가 아직 흐릿함

v0.0.8에서 고치고 더하는 것:
  - 블록 파싱 수정
  - 어긋남을 문법 수준에서: 어긋남("이유")
  - 머뭄이 값을 받고, 품고, 응답하는 구조
  - 기울임의 결과를 실제로 값으로 받기
"""

from dataclasses import dataclass, field
from typing import Any, Optional, Callable
import re


# ═══════════════════════════════════════════════════════════
# 1부: 핵심 객체들
# ═══════════════════════════════════════════════════════════

@dataclass
class Gyeol:
    value: Any
    confidence: float = 0.5
    yeobaek: dict = field(default_factory=dict)
    origin: Optional['Gyeol'] = None
    
    def __repr__(self):
        parts = [repr(self.value)]
        parts.append(f"확신:{self.confidence:.2f}")
        if self.yeobaek:
            first = list(self.yeobaek.keys())[0]
            parts.append(f"여백:{{{first}...}}" if len(self.yeobaek) > 1 
                         else f"여백:{self.yeobaek}")
        if self.origin:
            parts.append(f"원형:{self.origin.value}")
        return f"〈{' '.join(parts)}〉"


@dataclass
class Yeobaek:
    note: str = ""
    def __repr__(self):
        return f"〈여백: {self.note}〉" if self.note else "〈여백〉"


@dataclass
class Eotnajim:
    """어긋남 - 에러가 아닌, 정당한 상태 표현"""
    reason: str
    confidence_impact: float = 0.3  # 확신도를 이만큼 낮춤
    
    def __repr__(self):
        return f"〈어긋남: {self.reason}〉"


def make_eotnajim_gyeol(reason: str, original_value=None) -> Gyeol:
    """어긋남을 결로 만듦 — 흐름은 멈추지 않음"""
    return Gyeol(
        value=original_value,
        confidence=0.2,
        yeobaek={
            "어긋남": reason,
            "상태": "흐름은 계속됨"
        }
    )


def moreunda(what: str, reason: str = "") -> Gyeol:
    return Gyeol(value=None, confidence=0.0,
                 yeobaek={"모른다": what,
                          "이유": reason if reason else "정보 부족"})


@dataclass
class Meomum:
    """머뭄 - 받고, 품고, 응답하는 구조"""
    name: str
    body: list  # 몸체 코드 줄들
    received_gyeol: Optional[Gyeol] = None  # 받은 결
    held_for: int = 0  # 품은 횟수
    echoes: list = field(default_factory=list)  # 잔향들
    fade_level: float = 1.0
    
    def receive(self, gyeol: Gyeol):
        """받음 — 즉시 반응하지 않음"""
        self.received_gyeol = gyeol
        self.held_for = 0
    
    def hold(self):
        """품음 — 시간을 지나게 함"""
        self.held_for += 1
    
    def respond(self, made_value=None) -> Gyeol:
        """응답 만듦 — 품은 만큼 확신이 생길 수도"""
        # 오래 품었을수록 확신이 조금 높아짐 (단, 지나치면 떨어짐)
        confidence_from_holding = min(0.3, self.held_for * 0.1)
        
        # 받은 것의 확신도에 품은 시간의 보탬
        base_conf = (self.received_gyeol.confidence 
                     if self.received_gyeol else 0.5)
        
        response = Gyeol(
            value=made_value,
            confidence=min(0.95, base_conf + confidence_from_holding),
            yeobaek={
                "이 머뭄에서 나옴": self.name,
                "품은 시간": self.held_for,
                "받은 것": (self.received_gyeol.value 
                          if self.received_gyeol else None)
            }
        )
        
        # 이 응답이 잔향으로 남음
        self.echoes.append({
            "받은 것": self.received_gyeol,
            "응답": response,
            "품은 시간": self.held_for,
            "강도": 1.0
        })
        
        return response
    
    def fade(self, amount=0.05):
        """시간이 지남"""
        self.fade_level = max(0.01, self.fade_level - amount)
        for echo in self.echoes:
            echo["강도"] = max(0.01, echo["강도"] - amount)
    
    def resonate(self):
        """비슷한 맥락이 오면 다시 선명해짐"""
        self.fade_level = min(1.0, self.fade_level + 0.3)
    
    def __repr__(self):
        return (f"머뭄({self.name}, "
                f"품음 {self.held_for}, "
                f"잔향 {len(self.echoes)}, "
                f"활력 {self.fade_level:.2f})")


class Seosikji:
    def __init__(self, name: str):
        self.name = name
        self.yeokims = {}
        self.meomums = {}
        self.janhyangs = []
        self.seumeudeums = []
    
    def yeok(self, name: str, gyeol: Gyeol):
        if name not in self.yeokims:
            self.yeokims[name] = []
        self.yeokims[name].append(gyeol)
        self.janhyangs.append({
            "type": "엮임", "name": name, "gyeol": gyeol, "strength": 1.0
        })
    
    def follow(self, name: str) -> Gyeol:
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
        
        for other in self.seumeudeums:
            if name in other.yeokims and other.yeokims[name]:
                gyeol = other.follow(name)
                return Gyeol(
                    value=gyeol.value,
                    confidence=gyeol.confidence * 0.8,
                    yeobaek={**gyeol.yeobaek, "스며들어 옴": other.name},
                    origin=gyeol.origin
                )
        
        return Gyeol(value=None, confidence=0.0,
                     yeobaek={"아직 엮이지 않음": name})
    
    def add_meomum(self, m: Meomum):
        self.meomums[m.name] = m
    
    def seumeuds_with(self, other: 'Seosikji'):
        if other not in self.seumeudeums:
            self.seumeudeums.append(other)
        if self not in other.seumeudeums:
            other.seumeudeums.append(self)
    
    def __repr__(self):
        return (f"서식지({self.name}, 엮임 {len(self.yeokims)}, "
                f"머뭄 {len(self.meomums)}, 잔향 {len(self.janhyangs)}, "
                f"스며듦 {len(self.seumeudeums)})")


class Giulim:
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


# ═══════════════════════════════════════════════════════════
# 2부: 인터프리터 (버그 수정 + 새 문법)
# ═══════════════════════════════════════════════════════════

class YeobaekInterpreter:
    def __init__(self, seosikji_name="기본"):
        self.seosikji = Seosikji(seosikji_name)
        self.dari = Dari()
        self.output_log = []
        self.python_env = {}
        self.last_giulim_result = None  # 마지막 기울임 결과
    
    def log(self, msg):
        self.output_log.append(msg)
    
    def interpret(self, program: str):
        """블록 파싱 수정된 버전"""
        # 먼저 줄들을 파싱해서 블록으로 묶음
        raw_lines = program.split("\n")
        
        # dedent: 공통 들여쓰기 제거
        lines = self._dedent(raw_lines)
        
        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            
            # 빈 줄이나 주석
            if not stripped or stripped.startswith("#"):
                i += 1
                continue
            
            # 머뭄 정의 블록
            if stripped.startswith("머뭄 ") and stripped.endswith(":"):
                block, next_i = self._collect_block(lines, i + 1)
                self._define_meomum(stripped, block)
                i = next_i
                continue
            
            # 기울임 블록
            if stripped.startswith("기울임 ") and stripped.endswith(":"):
                block, next_i = self._collect_block(lines, i + 1)
                self._execute_giulim(stripped, block)
                i = next_i
                continue
            
            # 일반 문장
            self.interpret_line(stripped)
            i += 1
    
    def _dedent(self, lines):
        """들여쓰기 정규화"""
        # 비어있지 않은 줄 중 최소 들여쓰기 찾기
        min_indent = float('inf')
        for line in lines:
            if line.strip():
                indent = len(line) - len(line.lstrip())
                min_indent = min(min_indent, indent)
        
        if min_indent == float('inf') or min_indent == 0:
            return lines
        
        return [line[min_indent:] if line.strip() else line 
                for line in lines]
    
    def _collect_block(self, lines, start_i):
        """블록 수집 — 들여쓰기된 줄들만"""
        block = []
        i = start_i
        while i < len(lines):
            line = lines[i]
            if not line.strip():
                # 빈 줄은 건너뜀 (블록 안에 있을 수 있음)
                i += 1
                continue
            if line.startswith(" ") or line.startswith("\t"):
                # 들여쓰기된 줄
                block.append(line.strip())
                i += 1
            else:
                # 들여쓰기 없는 줄 — 블록 끝
                break
        return block, i
    
    def interpret_line(self, line: str):
        line = line.strip()
        if not line or line.startswith("#"):
            return None
        
        # 따라가기
        if line.endswith("?") and "~" not in line:
            name = line[:-1].strip()
            result = self.seosikji.follow(name)
            self.log(f"  {name}? → {result}")
            return result
        
        # 다리
        if "<- python" in line or "← python" in line:
            match = re.match(r'(\w+)\s*(?:<-|←)\s*python[:\s]+(.+)', line)
            if match:
                name, expr = match.group(1), match.group(2).strip()
                try:
                    value = eval(expr, {"__builtins__": {}}, self.python_env)
                    gyeol = self.dari.from_python(value, f"python: {expr}")
                    self.seosikji.yeok(name, gyeol)
                    self.log(f"  {name} ← python {expr} → {gyeol}")
                except Exception as e:
                    # 어긋남으로 처리 — 멈추지 않음
                    gyeol = make_eotnajim_gyeol(f"파이썬 실행 실패: {e}")
                    self.seosikji.yeok(name, gyeol)
                    self.log(f"  {name} ← python (어긋남: {e})")
                return
        
        # 머뭄 호출 - 값 받음: 결과 ← 머뭄이름(입력)
        match = re.match(r'(\w+)\s*(?:<-|←)\s*(\w+)\s*\((.*?)\)', line)
        if match and match.group(2) in self.seosikji.meomums:
            result_name = match.group(1)
            meomum_name = match.group(2)
            input_expr = match.group(3).strip()
            self._call_meomum_with_input(result_name, meomum_name, input_expr)
            return
        
        # 머뭄 호출 - 값 안 받음: 머뭄이름()
        if line.endswith("()") and "~" not in line:
            name = line[:-2].strip()
            if name in self.seosikji.meomums:
                self._call_meomum(name)
                return
        
        # 엮임
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
        
        # 여백
        if rest.startswith("〈여백"):
            note = ""
            if ":" in rest:
                note = rest[rest.index(":")+1:].rstrip("〉").strip().strip('"')
            gyeol = Gyeol(value=Yeobaek(note=note), confidence=0.0,
                          yeobaek={"상태": "비어있음"})
        # 어긋남 - 새 문법!
        elif rest.startswith("어긋남("):
            reason_match = re.match(r'어긋남\((["\']?)(.+?)\1\)', rest)
            reason = reason_match.group(2) if reason_match else "이유 없음"
            gyeol = make_eotnajim_gyeol(reason)
        # 모른다 - 새 문법!
        elif rest.startswith("모른다("):
            what_match = re.match(r'모른다\((["\']?)(.+?)\1\)', rest)
            what = what_match.group(2) if what_match else "무엇인지"
            gyeol = moreunda(what)
        else:
            value = self._parse_value(rest)
            gyeol = Gyeol(value=value, confidence=confidence)
        
        self.seosikji.yeok(name, gyeol)
        self.log(f"  {name} ~ {gyeol}")
    
    def _define_meomum(self, header, body):
        match = re.match(r'머뭄\s+(\w+)\s*:', header)
        if not match:
            return
        name = match.group(1)
        meomum = Meomum(name=name, body=body)
        self.seosikji.add_meomum(meomum)
        self.log(f"  머뭄 정의됨: {name} (몸체 {len(body)}줄)")
    
    def _call_meomum(self, name):
        meomum = self.seosikji.meomums[name]
        self.log(f"  머뭄 호출: {name}()")
        for line in meomum.body:
            self.interpret_line(line)
    
    def _call_meomum_with_input(self, result_name, meomum_name, input_expr):
        """결과 ← 머뭄(입력) 형태의 호출"""
        meomum = self.seosikji.meomums[meomum_name]
        
        # 입력을 결로 만듦
        if input_expr in self.seosikji.yeokims:
            input_gyeol = self.seosikji.follow(input_expr)
        else:
            value = self._parse_value(input_expr)
            input_gyeol = Gyeol(value=value, confidence=0.7)
        
        # 머뭄이 받음
        meomum.receive(input_gyeol)
        self.log(f"  머뭄 {meomum_name}(받음: {input_gyeol.value})")
        
        # 몸체 실행 = 품는 과정
        for line in meomum.body:
            self.interpret_line(line)
            meomum.hold()  # 각 줄 실행이 한 번의 품음
        
        # 응답 만듦
        # 몸체의 마지막 엮임이 응답의 재료
        response_value = None
        if meomum.body:
            last_line = meomum.body[-1]
            if "~" in last_line:
                name = last_line.split("~")[0].strip()
                if name in self.seosikji.yeokims:
                    response_value = self.seosikji.follow(name).value
        
        response = meomum.respond(made_value=response_value)
        self.seosikji.yeok(result_name, response)
        self.log(f"  → {result_name} ~ {response}")
    
    def _execute_giulim(self, header, body):
        match = re.match(r'기울임\s+(\w+)\s*:', header)
        name = match.group(1) if match else "이름없음"
        self.log(f"  기울임: {name}")
        
        results = []
        for line in body:
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
        
        sorted_results = sorted(results, key=lambda x: -x[2])
        for condition, result, weight in sorted_results:
            self.log(f"    무게 {weight:.2f}: {result} ← {condition}")
        
        # 기울임 결과 저장 (다음 엮임이 이걸 받을 수 있음)
        if sorted_results:
            top_result = sorted_results[0]
            self.last_giulim_result = Gyeol(
                value=top_result[1],
                confidence=top_result[2],
                yeobaek={
                    "기울임에서 나옴": name,
                    "다른 가능성들": [(r, w) for _, r, w in sorted_results[1:]]
                }
            )
    
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
            print("─" * 60)
        for entry in self.output_log:
            print(entry)
        self.output_log = []


# ═══════════════════════════════════════════════════════════
# 3부: 실제 프로그램 — 이번엔 제대로 작동하는지 시험
# ═══════════════════════════════════════════════════════════

def 실험():
    print("█" * 60)
    print("여백 언어 v0.0.8 - 버그 수정 + 어긋남 + 품는 머뭄")
    print("█" * 60)
    
    # 실험 1: 블록 파싱 버그 수정 확인
    print("\n[실험 1] 기울임 다음 줄들이 실행되는지")
    print("─" * 60)
    
    interp = YeobaekInterpreter("실험1")
    interp.interpret("""
    초기_상태 ~ "대화 시작"
    
    기울임 방향:
        ~ 깊이_가고_싶음 → 더_쌓기 (무게 0.7)
        ~ 쉬고_싶음 → 잠시_머물기 (무게 0.3)
    
    # 이 아래 줄들이 v0.0.7에서는 실행 안 됐음
    결정 ~ "계속 간다" (확신 0.85)
    이유 ~ "흐름이 살아있음"
    """)
    
    interp.show()
    print(f"\n엮임 확인: {list(interp.seosikji.yeokims.keys())}")
    print("(v0.0.7에서는 '초기_상태'만 있었음.")
    print(" v0.0.8에서는 '결정'과 '이유'도 있어야 함)")
    
    # 실험 2: 어긋남을 문법으로 쓰기
    print("\n[실험 2] 어긋남과 모른다를 문법으로")
    print("─" * 60)
    
    interp2 = YeobaekInterpreter("실험2")
    interp2.interpret("""
    좋은_결과 ~ "성공했음" (확신 0.9)
    
    시도한_것 ~ 어긋남("기술적 한계에 부딪힘")
    깊은_질문 ~ 모른다("우주의 끝")
    
    # 흐름은 계속됨
    다음_할_일 ~ "다른 방법 찾기"
    """)
    
    interp2.show()
    print("\n※ 어긋남이 있어도 다음 줄이 실행됨. 흐름이 멈추지 않음.")
    
    # 실험 3: 품는 머뭄 — 받고, 품고, 응답
    print("\n[실험 3] 머뭄이 실제로 값을 받고 품고 응답")
    print("─" * 60)
    
    interp3 = YeobaekInterpreter("실험3")
    interp3.interpret("""
    머뭄 깊이_생각하기:
        잠시_머무름 ~ "안에 둠"
        결_가다듬음 ~ "생각이 정돈됨"
        결과 ~ "응답이 떠오름"
    
    들어온_질문 ~ "여백 언어는 가능한가?"
    
    응답 ← 깊이_생각하기(들어온_질문)
    """)
    
    interp3.show()
    print("\n머뭄 상태:")
    for name, m in interp3.seosikji.meomums.items():
        print(f"  {m}")
    
    # 실험 4: 종합 — AI의 응답 과정 묘사
    print("\n[실험 4] 종합 — AI가 응답을 만드는 과정")
    print("─" * 60)
    
    interp4 = YeobaekInterpreter("AI_응답")
    interp4.interpret("""
    # 1. 상대의 말을 받음
    들려온 ~ "더 가보자"
    
    # 2. 기울임 — 여러 방향이 떠오름
    기울임 방향_검토:
        ~ 더_쌓기 → 새_기능_추가 (무게 0.8)
        ~ 돌아보기 → 이전_것_다시_검토 (무게 0.3)
        ~ 멈추기 → 잠시_쉼 (무게 0.1)
    
    # 3. 품는 머뭄 정의
    머뭄 응답_만들기:
        받은_맥락 ~ "대화의 흐름"
        이전_잔향 ~ "v0.0.6, v0.0.7의 결과"
        방향 ~ "v0.0.8을 향해"
    
    # 4. 머뭄 호출
    나의_응답 ← 응답_만들기(들려온)
    
    # 5. 마지막 자리
    현재_상태 ~ "구현 중" (확신 0.85)
    모르는_것 ~ 모른다("이게 어디까지 갈 수 있을지")
    """)
    
    interp4.show()
    
    print("\n최종 서식지 상태:")
    print(f"  {interp4.seosikji}")
    
    print("\n나의_응답 따라가기:")
    response = interp4.seosikji.follow("나의_응답")
    print(f"  {response}")


if __name__ == "__main__":
    실험()


# ═══════════════════════════════════════════════════════════
# v0.0.8의 진전
# ═══════════════════════════════════════════════════════════
#
# 고친 것:
#   - 블록 파싱이 이제 제대로 작동 (들여쓰기 정규화 + 블록 수집 개선)
#   - 기울임/머뭄 이후의 줄들이 실행됨
#
# 더한 것:
#   - 어긋남이 문법의 일부: `x ~ 어긋남("이유")`
#   - 모른다가 문법의 일부: `x ~ 모른다("질문")`
#   - 머뭄이 받고/품고/응답하는 구조
#   - `결과 ← 머뭄(입력)` 형태의 호출
#   - 품은 시간에 따라 확신도가 조금씩 조정됨
#
# 시도해서 드러난 것들:
#   - 문법이 확장될수록 파싱이 복잡해짐
#   - 머뭄의 "품음"을 실제로 구현하려니 추상적이던 것이 구체가 됨
#   - 어긋남이 문법에 들어가니 — 정말로 "에러가 아닌 상태"가 됨
#
# 다음 걸음:
#   - v0.0.9: 머뭄의 잔향이 다른 머뭄에 영향
#   - v0.0.10: 사용자 입력 받아서 돌리는 REPL
#   - v0.1.0: 파일로 저장된 .yeobaek 프로그램 읽고 실행
