/**
 * HOW TO USE existence-engineering IN YOUR PROJECT
 *
 * This file shows how any other codebase can use
 * existence-engineering as its foundation.
 *
 * Every entity, every function, every connection
 * will carry mandatory history.
 * Not as a suggestion. As a condition.
 */

import {
  LivingSystem,
  validateReason,
  validateInsight,
  validateQuestion,
} from "./index.js";

// ─────────────────────────────────────────────
// EXAMPLE 1: A simple web feature
// ─────────────────────────────────────────────

const system = new LivingSystem();

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  existence-engineering v1.0.0");
console.log("  History is the root, not the overhead.\n");

// Creating without history FAILS
console.log("── What happens without history ──\n");

try {
  system.create({ name: "Login feature", reason: "needed", historyEntry: {
    origin: "x", considered: ["a"], chosen: "b", opens: "c?"
  }});
} catch (e: unknown) {
  console.log("  ✗ Refused:", (e as Error).message.split("\n")[0]);
}

try {
  system.create({ name: "Login feature", reason: "TODO", historyEntry: {
    origin: "x", considered: ["a"], chosen: "b", opens: "c?"
  }});
} catch (e: unknown) {
  console.log("  ✗ Refused:", (e as Error).message.split("\n")[0]);
}

// Creating WITH history succeeds
console.log("\n── Creating with proper history ──\n");

const login = system.create({
  name: "User authentication",
  reason: "Users need secure access to their data without losing their work",
  source: "desire",
  historyEntry: {
    origin: "Sprint 12 feedback: users losing sessions mid-work. Security audit found gaps.",
    considered: [
      "JWT only (rejected: no refresh mechanism, sessions die unexpectedly)",
      "Session cookies only (rejected: CSRF vulnerability in current stack)",
    ],
    chosen: "JWT with refresh tokens — balances security with user continuity",
    opens: "Should session duration be configurable per user trust level?",
  },
});

console.log(`  ✦ "${login.name}" created`);
console.log(`    Alternatives recorded: ${login.origin.history.considered.length}`);
console.log(`    Opens: ${login.origin.history.opens}\n`);

const dataSync = system.create({
  name: "Real-time data sync",
  reason: "Users on multiple devices see stale data causing conflicting edits",
  source: "desire",
  historyEntry: {
    origin: "Support tickets: 23% of issues are data conflicts between devices.",
    considered: [
      "Polling every 5s (rejected: too much server load, still has conflicts)",
      "WebSockets (chosen path — real-time, manageable complexity)",
    ],
    chosen: "WebSocket with optimistic updates and conflict resolution on server",
    opens: "What happens when WebSocket is unavailable? Graceful degradation strategy?",
  },
});

console.log(`  ✦ "${dataSync.name}" created\n`);

// Connect with reason
system.connect(
  login.id,
  dataSync.id,
  "enables",
  "Authentication must be established before real-time sync can know whose data to sync"
);
console.log(`  → "Auth" enables "Data sync"\n`);

// Progress
system.progress(login.id, "Implemented JWT generation and refresh flow");
system.progress(dataSync.id, "WebSocket server connected and tested");

// Error — with mandatory question
console.log("── Error handling ──\n");
const errResult = system.handleError(
  login.id,
  "Token refresh fails under high load"
);
console.log(`  ⚠ ${errResult.signal.meaning}`);
console.log(`  Q: ${errResult.signal.question}\n`);

// Complete — with mandatory insight
console.log("── Completion gate ──\n");

try {
  system.complete(login.id, { insight: "done", seedQuestion: "next?" });
} catch (e: unknown) {
  console.log("  ✗ Refused:", (e as Error).message.split("\n")[0], "\n");
}

const { entity: completedLogin, whatBecomesNext } = system.complete(
  login.id,
  {
    insight: "JWT refresh under load needs connection pooling — not just token logic. Infrastructure matters as much as auth logic.",
    seedQuestion: "How do we test auth under realistic load before production?",
  }
);

console.log(`  ◉ "${completedLogin.name}" completed`);
console.log(`  Insight preserved: "${completedLogin.insight}"`);
console.log(`  What becomes next: ${whatBecomesNext}\n`);

// Observe
console.log("── System observation ──\n");
const obs = system.observe();
console.log(`  Health: ${obs.health.toUpperCase()}`);
console.log(`  ${obs.summary}`);
console.log(`  History depth: ${obs.historyDepth} records\n`);

console.log(`  Open questions:`);
obs.openQuestions.slice(0, 3).forEach(q => console.log(`    ? ${q}`));

console.log(`\n  Preserved insights:`);
obs.preservedInsights.forEach(i => {
  console.log(`    ◈ ${i.name}: "${i.insight?.slice(0, 60)}..."`);
});

// Print full history
system.printHistory();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  The next developer reading this code");
console.log("  is not starting over.");
console.log("  They are continuing.\n");

// ─────────────────────────────────────────────
// EXAMPLE 2: Using validators in plain functions
// (Without the full system — just the validation)
// ─────────────────────────────────────────────

console.log("── Using validators standalone ──\n");

// In any function, anywhere in your codebase:
function createUser(
  email: string,
  reasonForCreation: string // Must explain why this user is being created
) {
  const validatedReason = validateReason(reasonForCreation);
  // If we got here — reason is valid
  return { email, createdFor: validatedReason };
}

try {
  createUser("user@example.com", "needed");
} catch (e: unknown) {
  console.log("  ✗ createUser refused:", (e as Error).message.split("\n")[0]);
}

const user = createUser(
  "user@example.com",
  "User requested account during checkout to save order history"
);
console.log(`  ✓ User created: ${user.email}`);
console.log(`  Reason preserved: ${user.createdFor}\n`);
