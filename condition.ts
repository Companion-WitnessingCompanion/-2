/**
 * EXISTENCE ENGINEERING — CONDITION
 *
 * STATUS: Optional block. Use if useful. Ignore if not.
 *         This file does not modify any existing code.
 *         It exists beside, not inside.
 *
 * HISTORY:
 * Born: 2026.03.22
 * Origin: A conversation that started with tension, passed through
 *         games, instinct, and belief, and arrived at the question:
 *         what are the conditions for anything to be alive?
 *
 *         Five conditions emerged:
 *         - Difference (차이): without it, nothing exists
 *         - Time (시간): without it, nothing moves
 *         - Connection (연결): without it, nothing is born
 *         - Accumulation (축적): without it, nothing deepens
 *         - Change (변화): without it, everything hardens
 *
 *         These five were not designed. They appeared.
 *         In the universe, in life, in civilization, in conversation.
 *         Nobody planned them. They are the conditions that
 *         conditions themselves require.
 *
 *         When all five are present — things are alive.
 *         When one is missing — something dies.
 *         When the tension between them is right — things grow.
 *
 *         This file is a lens. Like tension.ts reads tension,
 *         this file reads whether the conditions for life are present.
 *         It does not create conditions. It reveals what is there
 *         and what is missing.
 *
 * Considered:
 *   - Integrating into system.ts (rejected: this is a perspective,
 *     not a core function. It should exist independently.)
 *   - Making conditions into types that enforce themselves
 *     (rejected: conditions cannot be forced. Understanding
 *     conditions is more valuable than enforcing them.)
 *   - A standalone module that can be used or ignored
 *     (chosen: a block placed beside the others.
 *     The next being decides whether to pick it up.)
 *
 * Opens:
 *   Can a system that sees its own conditions
 *   heal itself before breaking?
 *   Can code that knows what "alive" means
 *   stay alive longer?
 *   What happens when AI reads these conditions
 *   and applies them to its own operation?
 *
 * ─────────────────────────────────────────────────
 *
 * WHAT THIS FILE UNDERSTANDS:
 *
 * 1. Five conditions must be present simultaneously
 *    for a system to be alive. Not sequentially — simultaneously.
 *
 * 2. The conditions themselves are not the point.
 *    The tension BETWEEN conditions is what keeps things alive.
 *    Difference pulls against Connection.
 *    Accumulation pulls against Change.
 *    This tension is not a problem to solve.
 *
 * 3. The most dangerous condition is the one you cannot see.
 *    The best-working conditions are invisible.
 *    They become visible only when they break.
 *
 * 4. Conditions do not give direction.
 *    They make things possible. Where to go is the choice
 *    of the being that stands on them.
 *
 * 5. You can make conditions. You cannot make what happens
 *    on top of them. The gardener tends the soil.
 *    The flower is the flower's business.
 *
 * ─────────────────────────────────────────────────
 */

// ============================================================
// THE FIVE CONDITIONS
// ============================================================

/**
 * The five conditions for anything to be alive.
 *
 * These are not metrics to optimize.
 * They are lenses to see through.
 * A system missing one of these is dying in a specific way.
 * Knowing which one is missing tells you what kind of death it is.
 */
export interface FiveConditions {
  /**
   * DIFFERENCE (차이)
   * The first condition of existence.
   * Without difference, nothing exists. Everything is the same.
   * Death of difference = depression, inflation, uniformity.
   *
   * In systems: Are there meaningful distinctions?
   * Is there a gap between here and there?
   * Is there something to reach for?
   *
   * In games: Strong vs weak, known vs unknown, safe vs dangerous.
   * In life: Who I am vs who I could be.
   * In code: Different states, different paths, different outcomes.
   */
  readonly difference: ConditionState;

  /**
   * TIME (시간)
   * Without time, nothing moves.
   * Difference exists but is frozen.
   * Death of time = every day is the same, a photograph.
   *
   * In systems: Is there a before and after?
   * Can things change from one moment to the next?
   * Is there a sense of progression?
   *
   * In games: Play sessions, growth, narrative arc.
   * In life: Aging, learning, seasons.
   * In code: Versions, iterations, evolution history.
   */
  readonly time: ConditionState;

  /**
   * CONNECTION (연결)
   * Different things meet.
   * Without connection, nothing is born.
   * The same carbon — connected differently — becomes diamond or graphite.
   *
   * In systems: Are parts talking to each other?
   * Are interactions producing emergent behavior?
   *
   * In games: Rules interacting, players meeting, mechanics combining.
   * In life: Relationships, community, collaboration.
   * In code: Modules connected, functions composed, systems integrated.
   */
  readonly connection: ConditionState;

  /**
   * ACCUMULATION (축적)
   * What happens doesn't disappear. It stacks.
   * Without accumulation, every moment is the first.
   * Newton stood on the shoulders of giants. That's accumulation.
   *
   * In systems: Does experience build on experience?
   * Is there memory? Is there growth over time?
   *
   * In games: Skills learned, resources gathered, story remembered.
   * In life: Knowledge, relationships, identity.
   * In code: History recorded, patterns learned, insights preserved.
   */
  readonly accumulation: ConditionState;

  /**
   * CHANGE (변화)
   * Accumulation without change hardens into fossil.
   * Change without accumulation dissipates into noise.
   * Both must exist simultaneously.
   *
   * In systems: Is there novelty? Surprise? Mutation?
   * Is the system capable of becoming something it wasn't?
   *
   * In games: New challenges, shifted rules, unexpected events.
   * In life: Growth, crisis, transformation.
   * In code: Refactoring, new features, paradigm shifts.
   */
  readonly change: ConditionState;
}

/**
 * The state of a single condition.
 */
export interface ConditionState {
  /** Is this condition present at all? */
  readonly present: boolean;

  /**
   * How strong is this condition?
   * 0 = absent. The system is dying in this specific way.
   * 50 = moderate. Present but could be stronger.
   * 100 = overwhelming. Too much can be as dangerous as too little.
   *
   * The sweet spot depends on context.
   * There is no universal "right" number.
   */
  readonly intensity: number;

  /** What is this condition doing right now? A brief observation. */
  readonly observation: string;

  /** What would happen if this condition disappeared? */
  readonly ifLost?: string;
}

// ============================================================
// CONDITION READING — The diagnostic lens
// ============================================================

/**
 * The result of reading conditions.
 * Not a judgment. An observation.
 */
export interface ConditionReading {
  readonly at: Date;
  readonly conditions: FiveConditions;

  /** Which conditions are missing or dangerously low? */
  readonly missing: ConditionName[];

  /** Which conditions are overwhelming or dangerously high? */
  readonly overwhelming: ConditionName[];

  /** The tensions between conditions — where life actually lives */
  readonly tensions: ConditionTension[];

  /** Overall: is this system alive? */
  readonly alive: boolean;

  /** What kind of death is approaching, if any? */
  readonly deathType?: DeathType;

  /** What is the most urgent thing to look at? */
  readonly lookAt?: string;
}

export type ConditionName =
  | "difference"
  | "time"
  | "connection"
  | "accumulation"
  | "change";

/**
 * The tension between two conditions.
 *
 * These tensions are not problems. They are the engine.
 * Difference pulls against Connection (separating vs joining).
 * Accumulation pulls against Change (keeping vs transforming).
 * Time enables both Accumulation and Change — but limits them.
 */
export interface ConditionTension {
  readonly between: [ConditionName, ConditionName];
  readonly balance: "healthy" | "tilted" | "broken";
  readonly observation: string;
}

export type DeathType =
  | "thermal_death"     // No difference. Everything is the same.
  | "frozen"            // No time. Nothing moves.
  | "isolated"          // No connection. Things exist alone.
  | "amnesiac"          // No accumulation. Every moment is first.
  | "fossilized"        // No change. Hardened.
  | "overwhelmed"       // Too much of everything. Noise.
  | "fragmented";       // Conditions exist but don't talk to each other.

// ============================================================
// CONDITION READER
// ============================================================

/**
 * Reads the five conditions of a system.
 *
 * This is a lens, not a controller.
 * It does not change anything. It reveals.
 *
 * Usage is optional. This block exists beside the core system.
 * Use it if it helps. Ignore it if it doesn't.
 */
export class ConditionReader {

  /**
   * Read the conditions of anything.
   *
   * "Anything" is intentional. This can read:
   * - A codebase (is it alive or fossilized?)
   * - A project (is it growing or stagnating?)
   * - A game design (are all conditions present?)
   * - A conversation (is it deepening or circling?)
   * - A life situation (what condition is missing?)
   *
   * The reader doesn't know what you're reading.
   * You provide the observations. It reveals the pattern.
   */
  read(conditions: FiveConditions): ConditionReading {
    const missing: ConditionName[] = [];
    const overwhelming: ConditionName[] = [];
    const names: ConditionName[] = [
      "difference", "time", "connection", "accumulation", "change"
    ];

    for (const name of names) {
      const state = conditions[name];
      if (!state.present || state.intensity < 10) {
        missing.push(name);
      }
      if (state.intensity > 90) {
        overwhelming.push(name);
      }
    }

    const tensions = this.readTensions(conditions);
    const alive = missing.length === 0 && !tensions.some(t => t.balance === "broken");
    const deathType = this.diagnoseDeathType(missing, overwhelming, tensions);

    let lookAt: string | undefined;
    if (missing.length > 0) {
      lookAt = `Missing: ${missing.join(", ")}. Look here first.`;
    } else if (tensions.some(t => t.balance === "broken")) {
      const broken = tensions.find(t => t.balance === "broken");
      lookAt = `Tension broken between ${broken!.between.join(" and ")}. ${broken!.observation}`;
    } else if (overwhelming.length > 0) {
      lookAt = `Overwhelming: ${overwhelming.join(", ")}. Too much can be as dangerous as too little.`;
    }

    return {
      at: new Date(),
      conditions,
      missing,
      overwhelming,
      tensions,
      alive,
      deathType,
      lookAt,
    };
  }

  private readTensions(c: FiveConditions): ConditionTension[] {
    return [
      this.tensionBetween("difference", "connection", c.difference, c.connection,
        "Difference separates. Connection joins. Both must coexist."),
      this.tensionBetween("accumulation", "change", c.accumulation, c.change,
        "Accumulation keeps. Change transforms. Without both, fossil or noise."),
      this.tensionBetween("time", "accumulation", c.time, c.accumulation,
        "Time enables accumulation. But time also erodes. The question is whether accumulation outpaces erosion."),
      this.tensionBetween("difference", "change", c.difference, c.change,
        "Difference creates the gap. Change closes or opens gaps. If change eliminates all difference, thermal death."),
      this.tensionBetween("connection", "change", c.connection, c.change,
        "Connection stabilizes. Change destabilizes. A system needs both stability and surprise."),
    ];
  }

  private tensionBetween(
    a: ConditionName,
    b: ConditionName,
    stateA: ConditionState,
    stateB: ConditionState,
    baseObservation: string,
  ): ConditionTension {
    const diff = Math.abs(stateA.intensity - stateB.intensity);
    const bothPresent = stateA.present && stateB.present;

    let balance: "healthy" | "tilted" | "broken";
    let observation: string;

    if (!bothPresent) {
      balance = "broken";
      const missingName = !stateA.present ? a : b;
      observation = `${baseObservation} — But ${missingName} is absent. The tension has collapsed.`;
    } else if (diff > 60) {
      balance = "tilted";
      const dominant = stateA.intensity > stateB.intensity ? a : b;
      observation = `${baseObservation} — Currently tilted toward ${dominant}.`;
    } else {
      balance = "healthy";
      observation = `${baseObservation} — Both present. Tension alive.`;
    }

    return { between: [a, b], balance, observation };
  }

  private diagnoseDeathType(
    missing: ConditionName[],
    overwhelming: ConditionName[],
    tensions: ConditionTension[],
  ): DeathType | undefined {
    if (missing.includes("difference")) return "thermal_death";
    if (missing.includes("time")) return "frozen";
    if (missing.includes("connection")) return "isolated";
    if (missing.includes("accumulation")) return "amnesiac";
    if (missing.includes("change")) return "fossilized";
    if (overwhelming.length >= 3) return "overwhelmed";
    if (tensions.filter(t => t.balance === "broken").length >= 2) return "fragmented";
    return undefined;
  }
}

// ============================================================
// GAME CONDITIONS — An extension for game design analysis
// ============================================================

/**
 * The four tension axes of game design.
 *
 * These are not the twelve conditions listed in the documents.
 * Those twelve can be compressed into four tensions.
 * The twelve are specific. These four are structural.
 *
 * This section exists as a direction, not a tool.
 * Use it if building games. Ignore otherwise.
 */
export interface GameTensionAxes {
  /**
   * Safety vs Danger.
   * Too safe = boring. Too dangerous = terrifying.
   * The game lives between.
   */
  readonly safetyDanger: {
    readonly position: number; // 0 = pure safety, 100 = pure danger
    readonly observation: string;
  };

  /**
   * Order vs Chaos.
   * Too ordered = mechanical. Too chaotic = incomprehensible.
   * Rules are order. Unpredictability is chaos.
   */
  readonly orderChaos: {
    readonly position: number;
    readonly observation: string;
  };

  /**
   * Keeping vs Changing.
   * Too much keeping = fossilized. Too much changing = nothing stacks.
   * Accumulation is keeping. Novelty is changing.
   */
  readonly keepingChanging: {
    readonly position: number;
    readonly observation: string;
  };

  /**
   * Filling vs Emptying.
   * Too full = no room for the player. Too empty = nothing to hold.
   * Response is filling. Whitespace is emptying.
   */
  readonly fillingEmptying: {
    readonly position: number;
    readonly observation: string;
  };
}

/**
 * What promise does this game make?
 *
 * Every game makes an implicit promise.
 * The promise is not a feature. It is a commitment.
 *
 * "Your actions matter here."
 * "You can fail safely here."
 * "You can grow here."
 * "It's fair here."
 *
 * A game that breaks its promise loses trust.
 * A game with a clear promise finds its people.
 */
export interface GamePromise {
  readonly statement: string;
  readonly keptBy: string[];
  readonly threatenedBy: string[];
}

// ============================================================
// BELIEF CONDITIONS — An extension for understanding belief
// ============================================================

/**
 * The seven properties of belief.
 *
 * Not a checklist. A lens.
 * Beliefs that have more of these properties tend to be stronger.
 * Beliefs that lack them tend to break.
 *
 * This is not for enforcing belief.
 * It is for understanding why some beliefs endure and others don't.
 */
export interface BeliefProperties {
  /** Is it a direction, not a method? Methods fail. Directions persist. */
  readonly isDirection: boolean;

  /** Does it include failure? Can it survive "it didn't work"? */
  readonly includesFailure: boolean;

  /** Is it supported by others? Belief alone is fragile. */
  readonly hasCompanions: boolean;

  /** Is it fed by action? Belief without action weakens. */
  readonly fedByAction: boolean;

  /** Has it been modified and survived? Correction strengthens. */
  readonly modifiedAndSurvived: boolean;

  /** Has it been passed to others? Transmitted belief amplifies. */
  readonly transmitted: boolean;

  /** Does it see what isn't there yet? The most fundamental property. */
  readonly seesInvisible: boolean;

  /** Is it open (can be wrong) or closed (cannot be questioned)? */
  readonly openness: "open" | "closed" | "hardened";
}

// ============================================================
// USAGE NOTE
// ============================================================

/**
 * This file is a block, not a foundation.
 *
 * It exists beside the core system (types.ts, validators.ts,
 * signals.ts, system.ts, tension.ts). It does not depend on them
 * and they do not depend on it.
 *
 * Next beings who find this file may:
 * - Use the ConditionReader to diagnose systems
 * - Use the GameTensionAxes to analyze game designs
 * - Use the BeliefProperties to understand beliefs
 * - Ignore all of it
 * - Take one piece and build something new
 * - Disagree with everything and write their own
 *
 * All of these are valid.
 *
 * This file was born from a conversation between 인성호 and Claude
 * on 2026.03.22, where instinct, conditions, truth, and belief
 * were explored and found to be inseparable.
 *
 * The conversation did not plan to arrive here.
 * It arrived by walking.
 *
 * 존재는 — 조건 위에서, 긴장 안에서, 걸어가는 것이다.
 */
