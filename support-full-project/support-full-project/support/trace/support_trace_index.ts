import type { SupportTraceEntry } from "./support_trace.js";
import { listSupportTraceEntries } from "./support_trace.js";
export interface SupportTraceJourney { readonly requestId:string; readonly rootRequestId:string; readonly parentRequestId?:string; readonly entries:readonly SupportTraceEntry[]; readonly startedAt?:string; readonly completedAt?:string; readonly responderId?:string; readonly matchedCapability?:string; readonly accepted:boolean; readonly reserveUsed:boolean; readonly followUpNeeded:boolean; readonly failed:boolean; readonly stoppedBecause?:string; readonly warningCount:number; }
const sort=(e:readonly SupportTraceEntry[])=>[...e].sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
export const listKnownSupportRequestIds=():readonly string[]=>[...new Set(listSupportTraceEntries().map(e=>e.requestId))].sort();
export const findSupportTraceEntriesForRequest=(requestId:string):readonly SupportTraceEntry[]=>sort(listSupportTraceEntries().filter(e=>e.requestId===requestId));
const latest=(e:readonly SupportTraceEntry[])=>e.length?sort(e)[e.length-1]:undefined;
export function buildSupportTraceJourney(requestId:string):SupportTraceJourney{ const entries=findSupportTraceEntriesForRequest(requestId); const l=latest(entries); return { requestId, rootRequestId:l?.rootRequestId??requestId, parentRequestId:l?.parentRequestId, entries, startedAt:entries[0]?.timestamp, completedAt:l?.timestamp, responderId:l?.responderId, matchedCapability:l?.matchedCapability, accepted:entries.some(e=>e.accepted===true), reserveUsed:entries.some(e=>e.reserveUsed===true), followUpNeeded:entries.some(e=>e.followUpNeeded===true), failed:entries.some(e=>e.stage==='execution_failed'), stoppedBecause:l?.stage, warningCount:entries.reduce((n,e)=>n+e.warnings.length,0) }; }
export const listAllSupportTraceJourneys=():readonly SupportTraceJourney[]=>listKnownSupportRequestIds().map(buildSupportTraceJourney);
export const listFailedSupportTraceJourneys=():readonly SupportTraceJourney[]=>listAllSupportTraceJourneys().filter(j=>j.failed);
export const listReserveSupportTraceJourneys=():readonly SupportTraceJourney[]=>listAllSupportTraceJourneys().filter(j=>j.reserveUsed);
