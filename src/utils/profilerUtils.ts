import type { ProfilerOnRenderCallback } from "react";

export const onRenderModal: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  _startTime,
  _commitTime
) => {
  console.log(`[PROFILER] ${id} | phase: ${phase} | actualDuration: ${actualDuration.toFixed(2)}ms | baseDuration: ${baseDuration.toFixed(2)}ms`);
};
