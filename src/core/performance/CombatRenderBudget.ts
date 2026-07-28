import type { GraphicsQualityPreset } from '../graphics/GraphicsQualityController';
import type { EstimatedPerformancePressure } from './AdaptivePerformanceController';

export interface CombatRenderBudgetSnapshot {
  readonly effectLimit: number;
  readonly floatingTextLimit: number;
  readonly arcSegments: number;
  readonly effectLayers: number;
  readonly intensity: number;
  readonly ambientMotes: number;
}

export class CombatRenderBudget {
  private value: CombatRenderBudgetSnapshot = {
    effectLimit: 16,
    floatingTextLimit: 16,
    arcSegments: 22,
    effectLayers: 2,
    intensity: 0.78,
    ambientMotes: 12,
  };

  public update(quality: GraphicsQualityPreset, pressure: EstimatedPerformancePressure): void {
    const qualityScale = quality.mode === 'high' ? 1 : quality.mode === 'balanced' ? 0.74 : 0.48;
    const pressureScale = pressure === 'stable' ? 1 : pressure === 'elevated' ? 0.74 : 0.52;
    const scale = qualityScale * pressureScale;
    this.value = {
      effectLimit: Math.max(7, Math.round(28 * scale)),
      floatingTextLimit: Math.max(8, Math.round(24 * Math.max(0.52, scale))),
      arcSegments: Math.max(12, Math.round(34 * Math.max(0.4, scale))),
      effectLayers: scale >= 0.8 ? 3 : scale >= 0.48 ? 2 : 1,
      intensity: Math.max(0.42, Math.min(1.15, 0.45 + scale * 0.7)),
      ambientMotes: Math.max(4, Math.round(20 * scale)),
    };
  }

  public snapshot(): CombatRenderBudgetSnapshot {
    return this.value;
  }

  public canSpawnEffect(activeCount: number): boolean {
    return activeCount < this.value.effectLimit;
  }

  public canSpawnFloatingText(activeCount: number, emphasized: boolean): boolean {
    return emphasized || activeCount < this.value.floatingTextLimit;
  }
}
