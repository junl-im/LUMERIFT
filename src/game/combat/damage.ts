export interface DamageInput {
  readonly attack: number;
  readonly skillMultiplier: number;
  readonly defense: number;
  readonly critical: boolean;
  readonly criticalMultiplier?: number;
  readonly elementalMultiplier?: number;
}

export function calculateDamage(input: DamageInput): number {
  const criticalMultiplier = input.critical ? (input.criticalMultiplier ?? 1.5) : 1;
  const elementalMultiplier = input.elementalMultiplier ?? 1;
  const raw = input.attack * input.skillMultiplier * criticalMultiplier * elementalMultiplier;
  const defenseReduction = input.defense / (input.defense + 100);
  return Math.max(1, Math.round(raw * (1 - defenseReduction)));
}
