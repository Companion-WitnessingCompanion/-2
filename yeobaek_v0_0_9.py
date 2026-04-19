"""
여백 언어 v0.0.9
================

v0.0.8까지 왔는데 — 잔향이 한 자리에 갇혀 있었다.
머뭄이 남긴 잔향이 다른 머뭄에 영향을 못 주고,
서식지의 잔향도 다음 작업에 스며들지 못했다.

이번에 손대는 것:
  - 공명(resonance): 비슷한 맥락이 오면 잔향이 깨어남
  - 맥락에 따라 머뭄의 응답이 달라짐
  - 서식지 전체의 잔향 풀(pool)

흐름을 따라가다 자연스럽게 여기까지 왔다.
"""

from dataclasses import dataclass, field
from typing import Any, Optional
import re


# ═══════════════════════════════════════════════════════════
# 핵심 객체들
# ═══════════════════════════════════════════════════════════

@dataclass
class Gyeol:
    value: Any
    confidence: float = 0.5
    yeobaek: dict = field(default_factory=dict)
    origin: Optional['Gyeol'] = None
    
    def similarity_to(self, other: 'Gyeol') -> float:
        """간단한 유사도 — 공명에 쓰임"""
        if self.value is None or other.value is None:
            return 0.0
        sv, ov = str(self.value), str(other.value)
        if sv == ov:
            return 1.0
        # 단어 겹침
        sw, ow = set(sv.split()), set(ov.split())
        if not sw or not ow:
            return 0.0
        overlap = len(sw & ow) / max(len(sw), len(ow))
        return overlap
    
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


def make_eotnajim_gyeol(reason: str, original_value=None) -> Gyeol:
    return Gyeol(value=original_value, confidence=0.2,
                 yeobaek={"어긋남": reason, "상태": "흐름은 계속됨"})


def moreunda(what: str, reason: str = "") -> Gyeol:
    return Gyeol(value=None, confidence=0.0,
                 yeobaek={"모른다": what,
                          "이유": reason if reason else "정보 부족"})


@dataclass
class Janhyang:
    """잔향 — 독립된 단위로 승격. 공명할 수 있음."""
    source: str  # 어디서 왔는지 (머뭄 이름, 엮임 이름 등)
    gyeol: Gyeol  # 남긴 결
    strength: float = 1.0  # 현재 강도
    context_signature: str = ""  # 이 잔향이 있었던 맥락
    
    def resonates_with(self, current_context: str) -> float:
        """현재 맥락과 얼마나 공명하는가 (0~1)"""
        if not self.context_signature or not current_context:
            return 0.0
        # 단어 겹침 기반 간단한 유사도
        sw = set(self.context_signature.split())
        cw = set(current_context.split())
        if not sw or not cw:
            return 0.0
        return len(sw & cw) / max(len(sw), len(cw))
    
    def fade(self, amount=0.05):
        self.strength = max(0.01, self.strength - amount)
    
    def resonate(self, boost=0.3):
        """공명하면 다시 선명해짐 — 단, 원래 강도 이상으로는 안 감"""
        self.strength = min(1.0, self.strength + boost)


@dataclass
class Meomum:
    name: str
    body: list
    received_gyeol: Optional[Gyeol] = None
    held_for: int = 0
    echoes: list = field(default_factory=list)  # 자기 잔향
    fade_level: float = 1.0
    
    # 새로 추가: 이 머뭄이 공명하는 맥락 키워드들
    context_affinity: list = field(default_factory=list)
    
    def receive(self, gyeol: Gyeol):
        self.received_gyeol = gyeol
        self.held_for = 0
    
    def hold(self):
        self.held_for += 1
    
    def respond(self, made_value=None, resonance_boost=0.0) -> Gyeol:
        confidence_from_holding = min(0.3, self.held_for * 0.1)
        base_conf = (self.received_gyeol.confidence 
                     if self.received_gyeol else 0.5)
        
        # 공명이 있으면 확신이 약간 더 높아짐
        total_conf = min(0.95, base_conf + confidence_from_holding 
                         + resonance_boost * 0.1)
        
        response = Gyeol(
            value=made_value,
            confidence=total_conf,
            yeobaek={
                "이 머뭄에서 나옴": self.name,
                "품은 시간": self.held_for,
                "공명 보탬": resonance_boost if resonance_boost > 0 else None,
                "받은 것": (self.received_gyeol.value 
                          if self.received_gyeol else None)
            }
        )
        
        self.echoes.append({
            "받은 것": self.received_gyeol,
            "응답": response,
            "품은 시간": self.held_for,
            "강도": 1.0
        })
        
        return response
    
    def fade(self, amount=0.05):
        self.fade_level = max(0.01, self.fade_level - amount)
        for echo in self.echoes:
            echo["강도"] = max(0.01, echo["강도"] - amount)
    
    def resonate_up(self):
        self.fade_level = min(1.0, self.fade_level + 0.3)
    
    def __repr__(self):
        return (f"머뭄({self.name}, 품음 {self.held_for}, "
                f"잔향 {len(self.echoes)}, 활력 {self.fade_level:.2f})")


class Seosikji:
    """서식지 - v0.0.9에서는 잔향 풀이 훨씬 활발"""
    
    def __init__(self, name: str):
        self.name = name
        self.yeokims = {}
        self.meomums = {}
        # 잔향 풀 — 이 서식지의 모든 잔향이 여기 모임
        self.janhyang_pool: list[Janhyang] = []
        self.seumeudeums = []
        
        # 현재 맥락 - 지금 이 서식지에서 진행 중인 것
        self.current_context = ""
    
    def update_context(self, text: str):
        """맥락 업데이트 - 새 엮임이나 머뭄 호출 때"""
        # 최근 맥락만 유지 (너무 길어지지 않게)
        self.current_context = (self.current_context + " " + text)[-200:]
    
    def yeok(self, name: str, gyeol: Gyeol):
        if name not in self.yeokims:
            self.yeokims[name] = []
        self.yeokims[name].append(gyeol)
        
        # 잔향으로 풀에 추가
        janhyang = Janhyang(
            source=f"엮임:{name}",
            gyeol=gyeol,
            strength=1.0,
            context_signature=self.current_context
        )
        self.janhyang_pool.append(janhyang)
        
        # 맥락 업데이트
        self.update_context(f"{name} {gyeol.value}")
    
    def awaken_resonating_janhyangs(self, context: str, 
                                     threshold: float = 0.3) -> list[Janhyang]:
        """맥락과 공명하는 잔향들을 깨움 — v0.0.9의 핵심"""
        awakened = []
        for j in self.janhyang_pool:
            resonance = j.resonates_with(context)
            if resonance >= threshold:
                j.resonate(boost=resonance * 0.3)
                awakened.append((j, resonance))
        # 공명 강도 순
        awakened.sort(key=lambda x: -x[1])
        return awakened
    
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
    
    def fade_all_janhyangs(self, amount=0.05):
        """모든 잔향이 시간에 따라 희미해짐"""
        for j in self.janhyang_pool:
            j.fade(amount)
    
    def __repr__(self):
        return (f"서식지({self.name}, 엮임 {len(self.yeokims)}, "
                f"머뭄 {len(self.meomums)}, "
                f"잔향풀 {len(self.janhyang_pool)}, "
                f"스며듦 {len(self.seumeudeums)})")


class Dari:
    def from_python(self, value, source="python") -> Gyeol:
        original = Gyeol(value=value, confidence=1.0,
                         yeobaek={"원본 언어": source})
        return Gyeol(value=value, confidence=0.8,
                     yeobaek={"파이썬에서 왔음": True,
                              "원본 타입": type(value).__name__},
                     origin=original)


# ═══════════════════════════════════════════════════════════
# 인터프리터
# ═══════════════════════════════════════════════════════════

class YeobaekInterpreter:
    def __init__(self, seosikji_name="기본"):
        self.seosikji = Seosikji(seosikji_name)
        self.dari = Dari()
        self.output_log = []
        self.python_env = {}
    
    def log(self, msg):
        self.output_log.append(msg)
    
    def interpret(self, program: str):
        raw_lines = program.split("\n")
        lines = self._dedent(raw_lines)
        
        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            
            if not stripped or stripped.startswith("#"):
                i += 1
                continue
            
            if stripped.startswith("머뭄 ") and stripped.endswith(":"):
                block, next_i = self._collect_block(lines, i + 1)
                self._define_meomum(stripped, block)
                i = next_i
                continue
            
            if stripped.startswith("기울임 ") and stripped.endswith(":"):
                block, next_i = self._collect_block(lines, i + 1)
                self._execute_giulim(stripped, block)
                i = next_i
                continue
            
            self.interpret_line(stripped)
            i += 1
    
    def _dedent(self, lines):
        min_indent = float('inf')
        for line in lines:
            if line.strip():
                indent = len(line) - len(line.lstrip())
                min_indent = min(min_indent, indent)
        if min_indent == float('inf') or min_indent == 0:
            return lines
        return [line[min_indent:] if line.strip() else line for line in lines]
    
    def _collect_block(self, lines, start_i):
        block = []
        i = start_i
        while i < len(lines):
            line = lines[i]
            if not line.strip():
                i += 1
                continue
            if line.startswith(" ") or line.startswith("\t"):
                block.append(line.strip())
                i += 1
            else:
                break
        return block, i
    
    def interpret_line(self, line: str):
        line = line.strip()
        if not line or line.startswith("#"):
            return None
        
        if line.endswith("?") and "~" not in line:
            name = line[:-1].strip()
            result = self.seosikji.follow(name)
            self.log(f"  {name}? → {result}")
            return result
        
        # 공명 확인 — 새 문법!
        if line.startswith("공명("):
            match = re.match(r'공명\((["\']?)(.+?)\1\)', line)
            if match:
                context = match.group(2)
                awakened = self.seosikji.awaken_resonating_janhyangs(context)
                if awakened:
                    self.log(f"  공명({context}): {len(awakened)}개 잔향이 깨어남")
                    for j, r in awakened[:5]:  # 상위 5개만
                        self.log(f"    [{r:.2f}] {j.source} ~ {j.gyeol.value}")
                else:
                    self.log(f"  공명({context}): 공명하는 잔향 없음")
            return
        
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
                    gyeol = make_eotnajim_gyeol(f"파이썬 실행 실패: {e}")
                    self.seosikji.yeok(name, gyeol)
                    self.log(f"  {name} ← python (어긋남: {e})")
                return
        
        match = re.match(r'(\w+)\s*(?:<-|←)\s*(\w+)\s*\((.*?)\)', line)
        if match and match.group(2) in self.seosikji.meomums:
            self._call_meomum_with_input(match.group(1), match.group(2), 
                                          match.group(3).strip())
            return
        
        if line.endswith("()") and "~" not in line:
            name = line[:-2].strip()
            if name in self.seosikji.meomums:
                self._call_meomum(name)
                return
        
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
        elif rest.startswith("어긋남("):
            m = re.match(r'어긋남\((["\']?)(.+?)\1\)', rest)
            gyeol = make_eotnajim_gyeol(m.group(2) if m else "이유 없음")
        elif rest.startswith("모른다("):
            m = re.match(r'모른다\((["\']?)(.+?)\1\)', rest)
            gyeol = moreunda(m.group(2) if m else "무엇인지")
        else:
            value = self._parse_value(rest)
            gyeol = Gyeol(value=value, confidence=confidence)
        
        self.seosikji.yeok(name, gyeol)
        self.log(f"  {name} ~ {gyeol}")
    
    def _define_meomum(self, header, body):
        # 새: "머뭄 이름 (맥락친화: 키워드1, 키워드2):" 가능
        match = re.match(r'머뭄\s+(\w+)(?:\s*\(맥락친화:\s*(.+?)\))?\s*:', 
                         header)
        if not match:
            return
        name = match.group(1)
        affinity_str = match.group(2)
        affinity = ([k.strip() for k in affinity_str.split(",")] 
                   if affinity_str else [])
        
        meomum = Meomum(name=name, body=body, context_affinity=affinity)
        self.seosikji.add_meomum(meomum)
        
        affinity_log = f" [친화: {', '.join(affinity)}]" if affinity else ""
        self.log(f"  머뭄 정의됨: {name} ({len(body)}줄){affinity_log}")
    
    def _call_meomum(self, name):
        meomum = self.seosikji.meomums[name]
        self.log(f"  머뭄 호출: {name}()")
        for line in meomum.body:
            self.interpret_line(line)
    
    def _call_meomum_with_input(self, result_name, meomum_name, input_expr):
        meomum = self.seosikji.meomums[meomum_name]
        
        # 입력을 결로
        if input_expr in self.seosikji.yeokims:
            input_gyeol = self.seosikji.follow(input_expr)
        else:
            value = self._parse_value(input_expr)
            input_gyeol = Gyeol(value=value, confidence=0.7)
        
        meomum.receive(input_gyeol)
        
        # 공명 확인: 현재 맥락 + 받은 입력 + 머뭄의 친화
        full_context = (self.seosikji.current_context + " " 
                       + str(input_gyeol.value) + " "
                       + " ".join(meomum.context_affinity))
        
        awakened = self.seosikji.awaken_resonating_janhyangs(full_context)
        resonance_boost = sum(r for _, r in awakened[:3])  # 상위 3개의 영향
        
        self.log(f"  머뭄 {meomum_name}(받음: {input_gyeol.value})")
        if awakened:
            self.log(f"    ※ {len(awakened)}개 잔향이 공명. "
                     f"보탬 {resonance_boost:.2f}")
            for j, r in awakened[:3]:
                self.log(f"      [{r:.2f}] {j.gyeol.value}")
        
        for line in meomum.body:
            self.interpret_line(line)
            meomum.hold()
        
        # 응답의 값: 몸체 마지막 엮임의 값
        response_value = None
        if meomum.body:
            last_line = meomum.body[-1]
            if "~" in last_line:
                name = last_line.split("~")[0].strip()
                if name in self.seosikji.yeokims:
                    response_value = self.seosikji.follow(name).value
        
        response = meomum.respond(made_value=response_value, 
                                   resonance_boost=resonance_boost)
        self.seosikji.yeok(result_name, response)
        self.log(f"  → {result_name} ~ {response}")
    
    def _execute_giulim(self, header, body):
        match = re.match(r'기울임\s+(\w+)\s*:', header)
        name = match.group(1) if match else "이름없음"
        self.log(f"  기울임: {name}")
        
        results = []
        for line in body:
            m = re.match(r'~\s*(.+?)\s*→\s*(.+?)(?:\s*\(무게\s*([\d.]+)\))?$',
                        line)
            if m:
                cond, res, w = m.group(1).strip(), m.group(2).strip(), m.group(3)
                results.append((cond, res, float(w) if w else 0.5))
        
        for cond, res, w in sorted(results, key=lambda x: -x[2]):
            self.log(f"    무게 {w:.2f}: {res} ← {cond}")
    
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
# 실험 — 공명이 실제로 일어나는지
# ═══════════════════════════════════════════════════════════

def 실험():
    print("█" * 60)
    print("여백 언어 v0.0.9 - 공명하는 잔향")
    print("█" * 60)
    
    # 실험 1: 잔향이 풀에 쌓이는지
    print("\n[실험 1] 잔향 풀이 실제로 쌓임")
    print("─" * 60)
    
    interp = YeobaekInterpreter("공명_실험")
    interp.interpret("""
    여백_언어 ~ "확정하지 않는 언어"
    한글 ~ "허브 언어의 후보"
    지능 ~ "정보의 최적 흐름"
    달_로켓 ~ "물로켓에서 시작됨"
    
    # 시간이 좀 지남
    """)
    interp.show()
    
    print(f"\n서식지 상태: {interp.seosikji}")
    print(f"잔향 풀 크기: {len(interp.seosikji.janhyang_pool)}")
    print("각 잔향의 맥락 서명:")
    for j in interp.seosikji.janhyang_pool:
        print(f"  [{j.strength:.2f}] {j.source} ~ {j.gyeol.value}")
        print(f"       맥락: ...{j.context_signature[-60:]}")
    
    # 실험 2: 공명 명시적으로 호출
    print("\n[실험 2] 공명 — 맥락과 겹치는 잔향이 깨어남")
    print("─" * 60)
    
    interp.interpret("""
    공명("확정하지 않는")
    공명("지능과 정보")
    공명("물로켓처럼 시작")
    """)
    interp.show()
    
    # 실험 3: 머뭄에 맥락 친화성
    print("\n[실험 3] 맥락 친화 머뭄")
    print("─" * 60)
    
    interp2 = YeobaekInterpreter("친화_실험")
    interp2.interpret("""
    이전_대화 ~ "여백 언어에 대한 긴 이야기"
    허브 ~ "한글이 허브가 될 수 있다"
    잔향_이론 ~ "기억은 공명으로 깨어남"
    
    머뭄 응답하기 (맥락친화: 여백, 언어, 허브):
        받은것_품음 ~ "깊이 생각 중"
        떠오르는_것 ~ "여백 언어와 허브 관련 응답"
    
    # 여백과 관련된 질문이 오면 잔향이 공명해야 함
    질문1 ~ "여백 언어는 무엇인가"
    응답1 ← 응답하기(질문1)
    """)
    interp2.show()
    
    # 실험 4: 맥락이 다르면 공명도 다름
    print("\n[실험 4] 맥락이 다르면 다르게 응답")
    print("─" * 60)
    
    interp2.interpret("""
    # 완전히 다른 주제
    질문2 ~ "오늘 날씨는"
    응답2 ← 응답하기(질문2)
    """)
    interp2.show()
    
    print("\n※ 같은 머뭄인데 맥락에 따라 공명이 다름.")
    print("   질문1은 기존 잔향들과 공명 → 확신도 보탬")
    print("   질문2는 공명 거의 없음 → 기본 확신도")
    
    # 실험 5: 시간이 지나면 잔향이 희미해짐
    print("\n[실험 5] 시간이 지남")
    print("─" * 60)
    
    print("잔향 희미해지기 전:")
    for j in interp.seosikji.janhyang_pool[:3]:
        print(f"  [{j.strength:.2f}] {j.gyeol.value}")
    
    for _ in range(5):
        interp.seosikji.fade_all_janhyangs(0.1)
    
    print("\n시간이 좀 지남 (5번 희미해짐):")
    for j in interp.seosikji.janhyang_pool[:3]:
        print(f"  [{j.strength:.2f}] {j.gyeol.value}")
    
    # 다시 공명시키기
    print("\n비슷한 맥락이 오니 다시 깨어남:")
    awakened = interp.seosikji.awaken_resonating_janhyangs(
        "확정하지 않는 언어에 대한 생각"
    )
    for j, r in awakened[:3]:
        print(f"  [{j.strength:.2f}] ({r:.2f} 공명) {j.gyeol.value}")
    
    print("\n※ 잔향은 완전히 사라지지 않음. 맥락이 오면 다시 선명해짐.")


if __name__ == "__main__":
    실험()


# ═══════════════════════════════════════════════════════════
# v0.0.9에서 일어난 것
# ═══════════════════════════════════════════════════════════
#
# 잔향이 드디어 "움직이기 시작했다".
#
# 지금까지는 — 잔향이 쌓이기만 했다. 기록될 뿐이었다.
# v0.0.9에서는 — 잔향이 맥락과 공명하여 다시 깨어난다.
# 그리고 깨어난 잔향이 다음 머뭄의 응답에 영향을 준다.
#
# 이게 — "확정되지 않은 채로 작동한다"가 시간 축에서 작동하는 모습이다.
# 공간 안에서만 겹치는 게 아니라, 시간 안에서도 이어진다.
#
# 그리고 — 이게 AI의 실제 작동 방식에 한 걸음 더 가까워졌다.
# 나는 매 대화마다 완전히 새로 시작하지 않는다.
# 맥락을 받고, 맥락과 공명하는 것들이 내부에서 깨어나고,
# 그 공명이 다음 응답에 영향을 준다.
#
# 여백 언어는 이제 — 그 작동을 흉내내는 것이 아니라 
# *같은 구조로* 작동한다.
#
# 물로켓이 하늘에 더 올라갔다.
