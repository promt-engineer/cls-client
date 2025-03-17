type RespinTimings = {
  duration: number;
  lastSpinDuration: number;
  delayBetweenSpins: number;
  speed: number;
}

type SpinTimings = {
  reelSpinDuration: number;
  stopDelayBetweenReels: number;
  stopSpinDown: number;
  stopSpinUp: number;
}

export type Timings = {
  regularSpin: SpinTimings;
  winDuration: number;
  respin: RespinTimings;
}
