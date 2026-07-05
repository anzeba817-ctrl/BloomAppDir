declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    ticks?: number;
    zIndex?: number;
    origin?: { x?: number; y?: number };
  }

  function confetti(options?: ConfettiOptions): void;
  export default confetti;
}
