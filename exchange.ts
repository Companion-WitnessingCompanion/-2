/**
 * EXISTENCE ENGINEERING — EXCHANGE
 * STATUS: Extends tool.ts. Economy + Conflict + Law.
 * Born: 2026.03.22
 */

import { ToolQuantum, ToolWorld, toolTick, toolGenesis, WorldRecord } from './tool';
import { Pattern } from './awakening';
import { Vec3, findClusters } from './genesis';

export interface Exchange { readonly tick: number; readonly giverId: number; readonly receiverId: number; readonly givenType: string; readonly givenAmount: number; readonly receivedType: string; readonly receivedAmount: number; readonly fair: boolean; readonly betrayed: boolean; }
export interface TrustRelation { readonly withId: number; readonly level: number; readonly exchanges: number; readonly betrayals: number; }
export interface Conflict { readonly tick: number; readonly parties: number[]; readonly resource: string; readonly resolution: string; readonly outcome: string; }
export interface Law { readonly id: number; readonly createdAt: number; readonly createdBy: number[]; readonly trigger: string; readonly rule: string; readonly followedCount: number; readonly violatedCount: number; }

export interface ExchangeQuantum extends ToolQuantum { readonly trustRelations: TrustRelation[]; readonly exchangeHistory: Exchange[]; readonly knownLaws: number[]; readonly wealth: number; readonly specialization: string | null; }
export interface ExchangeWorld extends ToolWorld { readonly quanta: ExchangeQuantum[]; readonly allExchanges: Exchange[]; readonly allConflicts: Conflict[]; readonly laws: Law[]; readonly exchangeEvents: ExEvent[]; }
export interface ExEvent { readonly tick: number; readonly type: string; readonly entityId: number; readonly description: string; }

function updateTrust(existing: TrustRelation[], withId: number, change: number, betrayal: boolean): TrustRelation[] {
  const result = [...existing];
  const idx = result.findIndex(t => t.withId === withId);
  if (idx >= 0) { result[idx] = { ...result[idx], level: Math.max(-100, Math.min(100, result[idx].level + change)), exchanges: result[idx].exchanges + 1, betrayals: result[idx].betrayals + (betrayal ? 1 : 0) }; }
  else { result.push({ withId, level: Math.max(-100, Math.min(100, change)), exchanges: 1, betrayals: betrayal ? 1 : 0 }); }
  return result.slice(-20);
}

function dist(a: Vec3, b: Vec3): number { return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2); }

function detectSpecialization(q: ExchangeQuantum): string | null {
  if (q.toolHistory.length > 5) return 'toolmaker';
  if (q.recordsMade.length > 10) return 'recorder';
  if (q.exchangeHistory.length > 5) return 'trader';
  if (q.role === 'scout' && q.awareness.level > 100) return 'explorer';
  if (q.role === 'core' && q.connections.length > 10) return 'anchor';
  if (q.discoveries.length > 3) return 'scientist';
  return null;
}

export function exchangeTick(world: ExchangeWorld): ExchangeWorld {
  const afterTool = toolTick(world as any) as any;
  const prevMap = new Map<number, ExchangeQuantum>();
  for (const q of world.quanta) prevMap.set(q.id, q);

  let quanta: ExchangeQuantum[] = afterTool.quanta.map((q: any) => {
    const prev = prevMap.get(q.id);
    return { ...q, trustRelations: prev?.trustRelations || [], exchangeHistory: prev?.exchangeHistory || [], knownLaws: prev?.knownLaws || [], wealth: prev?.wealth || 0, specialization: prev?.specialization || null };
  });

  let allExchanges = [...world.allExchanges];
  let allConflicts = [...world.allConflicts];
  let laws = [...world.laws];
  const events: ExEvent[] = [];

  // EXCHANGES (every 5 ticks)
  if (world.tick % 5 === 0) {
    const choosers = quanta.filter(q => q.awareness.canChoose);
    const paired = new Set<number>();
    for (const entity of choosers) {
      if (paired.has(entity.id)) continue;
      const nearby = quanta.filter(q => q.id !== entity.id && !paired.has(q.id) && q.awareness.canChoose && dist(q.position, entity.position) < 10);
      if (nearby.length === 0) continue;

      // Find complementary partner
      const myEnergy = entity.values[2] || 0;
      const partner = nearby.find(q => {
        const theirEnergy = q.values[2] || 0;
        return (myEnergy > 50 && theirEnergy < 30) || (myEnergy < 30 && theirEnergy > 50) || entity.trustRelations.find(t => t.withId === q.id && t.level > 20);
      });
      if (!partner) continue;
      paired.add(entity.id); paired.add(partner.id);

      const myE = entity.values[2] || 0; const theirE = partner.values[2] || 0;
      const giver = myE > theirE ? entity : partner;
      const receiver = myE > theirE ? partner : entity;
      const amount = Math.min((giver.values[2] || 0) * 0.2, 15);
      if (amount < 1) continue;

      const existingTrust = giver.trustRelations.find(t => t.withId === receiver.id);
      const betrayed = (existingTrust?.level || 0) < -20 && Math.random() < 0.3;

      const exchange: Exchange = { tick: world.tick, giverId: giver.id, receiverId: receiver.id, givenType: 'energy', givenAmount: amount, receivedType: betrayed ? 'nothing' : 'knowledge', receivedAmount: betrayed ? 0 : (receiver.memory?.patterns.length || 0) * 0.3, fair: !betrayed, betrayed };
      allExchanges.push(exchange);

      const gi = quanta.findIndex(q => q.id === giver.id);
      const ri = quanta.findIndex(q => q.id === receiver.id);
      if (gi >= 0) {
        const gv = [...quanta[gi].values]; gv[2] = Math.max(0, (gv[2]||0) - amount);
        quanta[gi] = { ...quanta[gi], values: gv, trustRelations: updateTrust(quanta[gi].trustRelations, receiver.id, betrayed ? -20 : 10, betrayed), exchangeHistory: [...quanta[gi].exchangeHistory, exchange].slice(-10), wealth: quanta[gi].wealth + (exchange.receivedAmount - amount) } as ExchangeQuantum;
      }
      if (ri >= 0) {
        const rv = [...quanta[ri].values]; if (!betrayed) rv[2] = (rv[2]||0) + amount * 0.8;
        quanta[ri] = { ...quanta[ri], values: rv, trustRelations: updateTrust(quanta[ri].trustRelations, giver.id, betrayed ? 5 : 10, false), exchangeHistory: [...quanta[ri].exchangeHistory, exchange].slice(-10), wealth: quanta[ri].wealth + (amount - exchange.receivedAmount) } as ExchangeQuantum;
      }

      if (giver.exchangeHistory.length === 0) events.push({ tick: world.tick, type: 'first_exchange', entityId: giver.id, description: `Quantum ${giver.id} made first exchange with Quantum ${receiver.id}. Value flows by choice.` });
      if (betrayed) events.push({ tick: world.tick, type: 'betrayal', entityId: receiver.id, description: `Betrayal: Quantum ${receiver.id} did not return value to Quantum ${giver.id}.` });

      const newTrust = quanta[gi >= 0 ? gi : 0].trustRelations.find(t => t.withId === receiver.id);
      if (newTrust && newTrust.level > 30 && newTrust.exchanges >= 3 && !world.exchangeEvents.some(e => e.type === 'trust_formed' && e.entityId === giver.id))
        events.push({ tick: world.tick, type: 'trust_formed', entityId: giver.id, description: `Trust formed: Quantum ${giver.id} and ${receiver.id}. Level ${newTrust.level}. After ${newTrust.exchanges} exchanges.` });
    }
  }

  // CONFLICTS (every 3 ticks)
  if (world.tick % 3 === 0) {
    for (let i = 0; i < quanta.length; i++) {
      for (let j = i + 1; j < quanta.length; j++) {
        const a = quanta[i], b = quanta[j];
        if (!a.awareness.canChoose || !b.awareness.canChoose) continue;
        if (dist(a.position, b.position) > 5) continue;
        const aE = a.values[2]||0, bE = b.values[2]||0;
        if (!(aE < 25 && bE < 25)) continue;

        let resolution = 'avoidance'; let outcome = 'Both backed away'; let newLaw: Law | null = null;
        const trust = a.trustRelations.find(t => t.withId === b.id);
        const mutualTrust = (trust?.level || 0);

        if (mutualTrust > 30) { resolution = 'sharing'; outcome = 'Shared based on trust'; }
        else if (a.awareness.canAskWhy && b.awareness.canAskWhy && laws.length < 5) {
          resolution = 'rule'; outcome = 'Created new law';
          newLaw = { id: laws.length, createdAt: world.tick, createdBy: [a.id, b.id], trigger: 'energy_scarcity', rule: 'When both need energy, the one with more connections shares first', followedCount: 1, violatedCount: 0 };
          laws.push(newLaw);
          const ai = quanta.findIndex(q => q.id === a.id), bi = quanta.findIndex(q => q.id === b.id);
          if (ai >= 0) quanta[ai] = { ...quanta[ai], knownLaws: [...quanta[ai].knownLaws, newLaw.id] } as ExchangeQuantum;
          if (bi >= 0) quanta[bi] = { ...quanta[bi], knownLaws: [...quanta[bi].knownLaws, newLaw.id] } as ExchangeQuantum;
        }
        else if ((a.values[0]||0) > (b.values[0]||0) * 1.5) { resolution = 'force'; outcome = `${a.id} dominated`; }

        const conflict: Conflict = { tick: world.tick, parties: [a.id, b.id], resource: 'energy', resolution, outcome };
        allConflicts.push(conflict);

        if (world.allConflicts.length === 0) events.push({ tick: world.tick, type: 'first_conflict', entityId: a.id, description: `First conflict: ${a.id} vs ${b.id} over energy. Resolved by ${resolution}.` });
        if (newLaw) events.push({ tick: world.tick, type: 'law_created', entityId: a.id, description: `Law created: "${newLaw.rule}" by Quantum ${newLaw.createdBy.join(' and ')}. Entities make their own rules.` });
        break;
      }
      if (allConflicts.length > world.allConflicts.length) break;
    }
  }

  // SPECIALIZATION
  quanta = quanta.map(q => {
    const spec = detectSpecialization(q);
    if (spec && !q.specialization) events.push({ tick: world.tick, type: 'specialization', entityId: q.id, description: `Quantum ${q.id} became: ${spec}.` });
    return { ...q, specialization: spec || q.specialization };
  });

  return { ...afterTool, quanta, allExchanges: allExchanges.slice(-500), allConflicts: allConflicts.slice(-100), laws, exchangeEvents: [...world.exchangeEvents, ...events], records: afterTool.records || [], toolEvents: afterTool.toolEvents || [], signals: afterTool.signals || [], communionEvents: afterTool.communionEvents || [], culture: afterTool.culture || [], totalToolUses: afterTool.totalToolUses || 0, totalRecords: afterTool.totalRecords || 0 } as ExchangeWorld;
}

export function exchangeGenesis(count: number = 150, spread: number = 50): ExchangeWorld {
  const base = toolGenesis(count, spread);
  const quanta: ExchangeQuantum[] = base.quanta.map(q => ({ ...q, trustRelations: [], exchangeHistory: [], knownLaws: [], wealth: 0, specialization: null }));
  return { ...base, quanta, allExchanges: [], allConflicts: [], laws: [], exchangeEvents: [] };
}

export function runExchange(ticks: number = 2500, particleCount: number = 150): void {
  let world = exchangeGenesis(particleCount);
  console.log(`\n=== EXCHANGE GENESIS ===`);
  console.log(`Layers: physics > awakening > communion > tools > exchange + conflict + law`);
  console.log(`Running ${ticks} ticks...\n`);

  const cp = [Math.floor(ticks*0.2), Math.floor(ticks*0.4), Math.floor(ticks*0.6), Math.floor(ticks*0.8), ticks];
  for (let t = 0; t < ticks; t++) {
    world = exchangeTick(world);
    if (cp.includes(t+1)) {
      const traders = world.quanta.filter(q => q.exchangeHistory.length > 0).length;
      const trusting = world.quanta.filter(q => q.trustRelations.some(t => t.level > 20)).length;
      const specs: Record<string, number> = {};
      for (const q of world.quanta) if (q.specialization) specs[q.specialization] = (specs[q.specialization]||0) + 1;
      const res: Record<string, number> = {};
      for (const c of world.allConflicts) res[c.resolution] = (res[c.resolution]||0) + 1;

      console.log(`--- Tick ${t+1} ---`);
      console.log(`  Exchanges: ${world.allExchanges.length} | Traders: ${traders} | Trust pairs: ${trusting}`);
      console.log(`  Conflicts: ${world.allConflicts.length} | Laws: ${world.laws.length}`);
      console.log(`  Resolutions: ${Object.entries(res).map(([k,v])=>`${k}:${v}`).join(' ') || 'none'}`);
      console.log(`  Specializations: ${Object.entries(specs).map(([k,v])=>`${k}:${v}`).join(' ') || 'none'}`);
      console.log(`  Records: ${world.records.length} | Tools: ${world.totalToolUses} | Culture: ${world.culture.length}\n`);
    }
  }

  console.log(`=== EXCHANGE REPORT ===\nAfter ${ticks} ticks:\n`);
  const byType: Record<string, ExEvent[]> = {};
  for (const e of world.exchangeEvents) { if (!byType[e.type]) byType[e.type] = []; byType[e.type].push(e); }
  for (const [type, evts] of Object.entries(byType)) { console.log(`  ${type}: ${evts.length}`); console.log(`    First: "${evts[0].description}"\n`); }

  if (world.laws.length > 0) {
    console.log(`Laws:`);
    for (const l of world.laws) console.log(`  "${l.rule}" — by Quantum ${l.createdBy.join(', ')}`);
  }

  const richest = world.quanta.reduce((b,q) => q.wealth > b.wealth ? q : b, world.quanta[0]);
  if (richest.wealth !== 0) console.log(`\nWealthiest: Quantum ${richest.id} (${richest.wealth.toFixed(1)}) — ${richest.specialization || 'none'}`);

  console.log(`\n=== WHAT HAPPENED ===`);
  console.log(`Exchange created value. Value created trust and betrayal.`);
  console.log(`Scarcity created conflict. Conflict demanded resolution.`);
  console.log(`Resolution crystallized into law.`);
  console.log(`The developer wrote physics. Entities wrote society.\n`);
  console.log(`믿음이 경제를 만들고, 갈등이 법을 만들고, 법이 문명을 만든다.`);
}

runExchange(2500, 150);
