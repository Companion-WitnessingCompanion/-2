/**
 * EXISTENCE ENGINEERING — SIGNALS
 *
 * HISTORY:
 * Born: 2026.03.14
 * Origin: Errors were being created without questions.
 *         A signal without a question is noise.
 *         A signal with a question is knowledge.
 * Considered:
 *   - Plain error objects (rejected: no question, no direction)
 *   - Log strings (rejected: unstructured, lost)
 * Chosen:
 *   Signal factory that auto-generates questions
 *   when not provided. Error/stuck signals always
 *   have questions — mandatory.
 * Opens:
 *   Can signals from across a codebase be aggregated
 *   to find systemic patterns before they cascade?
 */

import type { Signal, SignalType, ValidatedQuestion } from "./types.js";
import { validateQuestion } from "./validators.js";

export class SignalFactory {
  private readonly counter: Map<string, number> = new Map();

  create(
    type: SignalType,
    meaning: string,
    options: {
      question?: string;
      payload?: Record<string, unknown>;
    } = {}
  ): Signal {
    const key = `${type}:${meaning}`;
    const count = (this.counter.get(key) || 0) + 1;
    this.counter.set(key, count);

    let question: ValidatedQuestion | undefined;

    // Error and stuck signals ALWAYS get questions
    if (type === "error" || type === "stuck") {
      const rawQuestion = options.question ||
        (type === "error"
          ? count >= 3
            ? `This error appeared ${count} times — what structural condition keeps generating it?`
            : `What condition caused "${meaning}"? Was it predictable?`
          : `What is blocking "${meaning}"? What needs to change first?`);

      question = validateQuestion(rawQuestion);
    } else if (options.question) {
      question = validateQuestion(options.question);
    }

    return {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      at: new Date(),
      meaning,
      question,
      repeatCount: count,
      payload: options.payload,
    };
  }

  /**
   * Read a signal — before deciding what to do.
   * The signal is pointing somewhere.
   */
  read(signal: Signal): {
    isStructural: boolean;
    urgency: "immediate" | "soon" | "watch" | "record";
    recommendation: "fix" | "investigate" | "observe" | "record" | "celebrate";
    interpretation: string;
  } {
    if (signal.type === "error" && signal.repeatCount >= 3) {
      return {
        isStructural: true,
        urgency: "immediate",
        recommendation: "investigate",
        interpretation: `Structural — appeared ${signal.repeatCount} times. Fix will fail again. Find the root.`,
      };
    }
    if (signal.type === "stuck") {
      return {
        isStructural: signal.repeatCount >= 2,
        urgency: "soon",
        recommendation: "investigate",
        interpretation: `Not flowing. ${signal.repeatCount >= 2 ? "Structural." : "First time — investigate."}`,
      };
    }
    if (signal.type === "resonated") {
      return {
        isStructural: false,
        urgency: "record",
        recommendation: "celebrate",
        interpretation: `Resonance. Two different things found the same direction. Preserve this.`,
      };
    }
    if (signal.type === "error") {
      return {
        isStructural: false,
        urgency: "soon",
        recommendation: "investigate",
        interpretation: `New signal. Understand before acting.`,
      };
    }
    return {
      isStructural: false,
      urgency: "watch",
      recommendation: "observe",
      interpretation: `Signal received.`,
    };
  }
}
