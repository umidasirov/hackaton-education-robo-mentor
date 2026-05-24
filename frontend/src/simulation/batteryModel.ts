/**
 * 9V PP3-style battery — simplified DC model for the canvas simulator.
 * A real cell has ~9V OCV, ~1–3Ω internal resistance (alkaline), etc.; we only
 * model “pack in circuit” so rails are not magic when a terminal is floating.
 */

/** Typical open-circuit voltage (nominal), for UI / future load math */
export const BATTERY_9V_NOMINAL_VOLTS = 9;

/** Typical series internal resistance (Ω), alkaline PP3 — order-of-magnitude */
export const BATTERY_9V_INTERNAL_OHMS_TYPICAL = 2;

type WireLike = {
  start: { componentId: string; pinName: string };
  end: { componentId: string; pinName: string };
};

/**
 * Both (+) and (−) must have at least one wire, or the pack is treated as
 * not inserted into the net (no VCC/GND sentinels from the battery).
 */
export function battery9vBothTerminalsWired(wires: WireLike[], batteryComponentId: string): boolean {
  let vcc = false;
  let gnd = false;
  for (const w of wires) {
    for (const ep of [w.start, w.end]) {
      if (ep.componentId !== batteryComponentId) continue;
      if (ep.pinName === 'VCC') vcc = true;
      if (ep.pinName === 'GND') gnd = true;
    }
  }
  return vcc && gnd;
}
