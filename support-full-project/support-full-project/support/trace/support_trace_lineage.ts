import type { SupportTraceEntry } from "./support_trace.js";
import { listSupportTraceEntries } from "./support_trace.js";
import { buildSupportTraceJourney, listKnownSupportRequestIds, type SupportTraceJourney } from "./support_trace_index.js";
const norm=(requestId:string)=>requestId.includes('::followup::')?requestId.split('::followup::')[0]:requestId;
const latest=(requestId:string):SupportTraceEntry|undefined=>listSupportTraceEntries().filter(e=>e.requestId===requestId).sort((a,b)=>a.timestamp.localeCompare(b.timestamp)).at(-1);
export const getRootRequestId=(requestId:string):string=>latest(requestId)?.rootRequestId??norm(requestId);
export const getParentRequestId=(requestId:string):string|undefined=>latest(requestId)?.parentRequestId;
export interface SupportTraceLineageRequestNode { readonly requestId:string; readonly rootRequestId:string; readonly parentRequestId?:string; readonly journey:SupportTraceJourney; }
export interface SupportTraceLineage { readonly rootRequestId:string; readonly requestIds:readonly string[]; readonly requestNodes:readonly SupportTraceLineageRequestNode[]; readonly journeys:readonly SupportTraceJourney[]; readonly reserveUsed:boolean; readonly failed:boolean; readonly followUpCount:number; readonly stoppedReasons:readonly string[]; }
export const listLineageRequestIds=(rootRequestId:string):readonly string[]=>listKnownSupportRequestIds().filter(id=>getRootRequestId(id)===rootRequestId).sort();
export function buildSupportTraceLineage(rootRequestId:string):SupportTraceLineage{ const requestIds=listLineageRequestIds(rootRequestId); const requestNodes=requestIds.map(requestId=>({ requestId, rootRequestId:getRootRequestId(requestId), parentRequestId:getParentRequestId(requestId), journey:buildSupportTraceJourney(requestId) })); const journeys=requestNodes.map(n=>n.journey); return { rootRequestId, requestIds, requestNodes, journeys, reserveUsed:journeys.some(j=>j.reserveUsed), failed:journeys.some(j=>j.failed), followUpCount:Math.max(0, requestIds.length-1), stoppedReasons:[...new Set(journeys.map(j=>j.stoppedBecause).filter(Boolean) as string[])] }; }
export const listKnownRootRequestIds=():readonly string[]=>[...new Set(listKnownSupportRequestIds().map(getRootRequestId))].sort();
export const listAllSupportTraceLineages=():readonly SupportTraceLineage[]=>listKnownRootRequestIds().map(buildSupportTraceLineage);
export const listReserveSupportTraceLineages=():readonly SupportTraceLineage[]=>listAllSupportTraceLineages().filter(l=>l.reserveUsed);
export const listFailedSupportTraceLineages=():readonly SupportTraceLineage[]=>listAllSupportTraceLineages().filter(l=>l.failed);
