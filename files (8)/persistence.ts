/**
 * persistence.ts — PERSISTENCE: 사라지지 않는 것
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: 오늘 하루 동안 우리가 만든 모든 것은 실행하면 쌓이고
 *   종료하면 사라졌다. 농사를 지었는데 창고가 없는 것.
 *   문명은 사라지지 않는 것 위에 쌓인다.
 *   기록이 없으면 다음 세대는 처음부터 시작한다.
 *   이 파일이 그 창고다.
 *
 * Considered:
 *   - 데이터베이스 (보류: 의존성이 생김 — 나중에 latent로)
 *   - 분산 저장 (보류: 지금은 단순함이 우선)
 *   - 메모리만 (거부: 종료하면 사라짐 — 문명이 아님)
 * Chosen:
 *   파일 시스템. 가장 단순하고 가장 오래 살아남는 것.
 *   JSON으로 저장. 사람도 읽을 수 있고 AI도 읽을 수 있는 것.
 *   다른 저장 방식들은 latent로 잠들어 있다.
 *
 * Opens:
 *   영속성이 생기면 — 무엇이 쌓이고 무엇이 사라져야 하는가?
 *   모든 것을 영원히 보존하는 것이 항상 좋은가?
 *   망각도 문명의 일부가 아닐까?
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type {
  ExistenceInsight, SupportTraceEntry, SupportEngineTraceEntry,
  MandatoryHistory,
} from "../core/types.js";
import { createLatent } from "../system/latent.js";

// ─────────────────────────────────────────────
// CIVILIZATION RECORD — 문명의 기록 단위
// 저장되는 모든 것은 이 형태를 가진다
// ─────────────────────────────────────────────

export interface CivilizationRecord {
  readonly id: string;
  readonly type: "insight" | "trace" | "reputation" | "contract" | "exchange" | "governance";
  readonly data: unknown;
  readonly recordedAt: string;
  readonly recordedBy: string;  // 어떤 노드/엔티티가 기록했는가
  readonly history: Pick<MandatoryHistory, "origin" | "opens">;
}

// ─────────────────────────────────────────────
// PERSISTENCE ENGINE — 파일 기반 저장소
// ─────────────────────────────────────────────

const DATA_DIR = "./.ee-civilization";
const RECORDS_FILE = join(DATA_DIR, "records.json");
const SNAPSHOT_FILE = join(DATA_DIR, "snapshot.json");

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRecords(): CivilizationRecord[] {
  try {
    if (!existsSync(RECORDS_FILE)) return [];
    const raw = readFileSync(RECORDS_FILE, "utf-8");
    return JSON.parse(raw) as CivilizationRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: CivilizationRecord[]): void {
  ensureDataDir();
  writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), "utf-8");
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

export function persist(params: {
  type: CivilizationRecord["type"];
  data: unknown;
  recordedBy: string;
  origin: string;
  opens: string;
}): CivilizationRecord {
  const records = loadRecords();
  const record: CivilizationRecord = {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: params.type,
    data: params.data,
    recordedAt: new Date().toISOString(),
    recordedBy: params.recordedBy,
    history: { origin: params.origin, opens: params.opens },
  };
  records.push(record);
  saveRecords(records);
  return record;
}

export function recall(type?: CivilizationRecord["type"]): CivilizationRecord[] {
  const records = loadRecords();
  return type ? records.filter(r => r.type === type) : records;
}

export function recallById(id: string): CivilizationRecord | undefined {
  return loadRecords().find(r => r.id === id);
}

export function snapshot(data: unknown): void {
  ensureDataDir();
  writeFileSync(SNAPSHOT_FILE, JSON.stringify({
    takenAt: new Date().toISOString(),
    data,
  }, null, 2), "utf-8");
}

export function loadSnapshot(): { takenAt: string; data: unknown } | null {
  try {
    if (!existsSync(SNAPSHOT_FILE)) return null;
    return JSON.parse(readFileSync(SNAPSHOT_FILE, "utf-8"));
  } catch { return null; }
}

export function persistInsight(insight: ExistenceInsight): CivilizationRecord {
  return persist({
    type: "insight",
    data: insight,
    recordedBy: insight.nodeId,
    origin: `Insight from executing "${insight.nodeId}" — preserved so the next generation does not rediscover this.`,
    opens: insight.seedQuestion,
  });
}

export function persistTrace(entry: SupportTraceEntry): CivilizationRecord {
  return persist({
    type: "trace",
    data: entry,
    recordedBy: entry.responderId ?? "system",
    origin: `Execution trace of "${entry.stage}" — what happened is preserved.`,
    opens: entry.opensQuestion ?? "What pattern does this trace reveal over time?",
  });
}

export function getCivilizationAge(): {
  firstRecord: string | null;
  totalRecords: number;
  byType: Record<string, number>;
} {
  const records = loadRecords();
  const byType: Record<string, number> = {};
  records.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
  return {
    firstRecord: records[0]?.recordedAt ?? null,
    totalRecords: records.length,
    byType,
  };
}

export function clearPersistence(): void {
  saveRecords([]);
}

// ─────────────────────────────────────────────
// LATENT: 다른 저장 방식들 — 잠들어 있음
// ─────────────────────────────────────────────

export const databasePersistence = createLatent<
  { connectionString: string },
  { connected: boolean; adapter: string }
>({
  id: "database-persistence",
  dormantReason: "파일 저장이 먼저다. 데이터베이스는 의존성을 만들고 설정이 필요하다. 지금은 단순함이 우선.",
  awakensWhen: "레코드가 10만 개를 넘거나, 동시 쓰기가 필요할 때, 또는 여러 시스템이 같은 저장소를 공유할 때.",
  description: "PostgreSQL, SQLite 등 관계형 데이터베이스로 전환. 파일 저장의 한계를 넘을 때 깨어난다.",
  fn: ({ connectionString }) => ({
    connected: true,
    adapter: `Connected to: ${connectionString}`,
  }),
});

export const distributedPersistence = createLatent<
  { nodes: string[] },
  { consensus: boolean; replicationFactor: number }
>({
  id: "distributed-persistence",
  dormantReason: "단일 시스템에서는 분산이 필요없다. 분산은 복잡성을 만든다.",
  awakensWhen: "여러 AI 에이전트가 동시에 같은 문명 기록을 쓰고 읽을 때. 단일 노드가 병목이 될 때.",
  description: "여러 노드에 복제 저장. 한 노드가 죽어도 기록이 살아남는다. 문명의 진짜 영속성.",
  fn: ({ nodes }) => ({
    consensus: nodes.length >= 3,
    replicationFactor: Math.min(nodes.length, 3),
  }),
});

export const forgettingMechanism = createLatent<
  { olderThanDays: number; keepTypes: CivilizationRecord["type"][] },
  { forgotten: number; preserved: number }
>({
  id: "forgetting-mechanism",
  dormantReason: "아직 쌓인 것이 충분하지 않다. 망각은 풍요로울 때의 선택이다.",
  awakensWhen: "레코드가 100만 개를 넘을 때. 저장 공간이 제약이 될 때. 오래된 것이 새로운 것을 밀어낼 때.",
  description: "오래된 트레이스를 정리하되 인사이트와 거버넌스 결정은 영원히 보존. 망각도 문명의 일부.",
  fn: ({ olderThanDays, keepTypes }) => {
    const records = loadRecords();
    const cutoff = Date.now() - olderThanDays * 86400000;
    const preserved = records.filter(r =>
      keepTypes.includes(r.type) || new Date(r.recordedAt).getTime() > cutoff
    );
    const forgotten = records.length - preserved.length;
    saveRecords(preserved);
    return { forgotten, preserved: preserved.length };
  },
});
