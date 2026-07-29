import type { DeviceQaSessionArchive, DeviceQaSessionSample } from './DeviceQaSessionRecorder';

export type DeviceQaStabilityGrade = 'excellent' | 'stable' | 'constrained' | 'unstable' | 'insufficient';
export type DeviceQaConfidence = 'low' | 'medium' | 'high';
export type DeviceQaGraphicsRecommendation = 'high' | 'medium' | 'low';

export interface DeviceQaSessionAnalysis {
  readonly score: number;
  readonly grade: DeviceQaStabilityGrade;
  readonly gradeLabel: string;
  readonly confidence: DeviceQaConfidence;
  readonly recommendedFps: 30 | 60;
  readonly recommendedGraphics: DeviceQaGraphicsRecommendation;
  readonly visibleSamples: number;
  readonly hiddenSamples: number;
  readonly visibleDurationSeconds: number;
  readonly batteryDrainPer20Minutes?: number;
  readonly issues: readonly string[];
  readonly strengths: readonly string[];
  readonly verdict: string;
}

export function analyzeDeviceQaSession(session: DeviceQaSessionArchive | undefined): DeviceQaSessionAnalysis | undefined {
  if (!session) return undefined;
  const visible = session.samples.filter((sample) => sample.visibility === 'visible' || sample.visibility === 'unknown');
  const hiddenSamples = session.samples.length - visible.length;
  const visibleDurationSeconds = estimateVisibleDuration(visible, session.sampleIntervalSeconds);
  const confidence = resolveConfidence(visible.length, visibleDurationSeconds);
  if (visible.length < 3) {
    return {
      score: 0,
      grade: 'insufficient',
      gradeLabel: '표본 부족',
      confidence,
      recommendedFps: 30,
      recommendedGraphics: 'medium',
      visibleSamples: visible.length,
      hiddenSamples,
      visibleDurationSeconds,
      issues: ['전투 화면이 보이는 상태에서 최소 3개 이상의 표본이 필요합니다.'],
      strengths: [],
      verdict: 'QA 기록 시간이 짧아 기기 품질을 아직 판정할 수 없습니다.',
    };
  }

  const fpsRatio = average(visible.map((sample) => safeRatio(sample.fps, sample.targetFps)));
  const lowRatio = average(visible.map((sample) => safeRatio(sample.onePercentLow, sample.targetFps)));
  const longRatio = average(visible.map((sample) => sample.longFrameRatio));
  const severeRatio = average(visible.map((sample) => sample.severeFrameRatio));
  const maximumP99 = Math.max(...visible.map((sample) => sample.p99FrameMs));
  const safeShare = visible.filter((sample) => sample.adaptiveLevel === 'safe').length / visible.length;
  const score = round(clamp(
    100 * (
      0.42 * clamp(fpsRatio, 0, 1)
      + 0.33 * clamp(lowRatio, 0, 1)
      + 0.15 * clamp(1 - longRatio * 5.5, 0, 1)
      + 0.1 * clamp(1 - severeRatio * 11, 0, 1)
    )
    - Math.min(8, session.summary.adaptiveLevelChanges * 1.5)
    - safeShare * 7,
    0,
    100,
  ));
  const grade = resolveGrade(score);
  const recommendedFps: 30 | 60 = score >= 80 && lowRatio >= 0.78 && longRatio <= 0.055 && maximumP99 <= 45 ? 60 : 30;
  const recommendedGraphics: DeviceQaGraphicsRecommendation = score >= 89 && maximumP99 <= 30
    ? 'high'
    : score >= 68 && safeShare < 0.45
      ? 'medium'
      : 'low';
  const issues = buildIssues({ lowRatio, longRatio, severeRatio, maximumP99, safeShare, hiddenSamples, sampleCount: session.samples.length });
  const strengths = buildStrengths({ fpsRatio, lowRatio, longRatio, safeShare, adaptiveChanges: session.summary.adaptiveLevelChanges });
  const batteryDrainPer20Minutes = resolveBatteryDrain(session);
  return {
    score,
    grade,
    gradeLabel: gradeLabel(grade),
    confidence,
    recommendedFps,
    recommendedGraphics,
    visibleSamples: visible.length,
    hiddenSamples,
    visibleDurationSeconds,
    ...(batteryDrainPer20Minutes !== undefined ? { batteryDrainPer20Minutes } : {}),
    issues,
    strengths,
    verdict: `${gradeLabel(grade)} · ${recommendedFps} FPS / 그래픽 ${graphicsLabel(recommendedGraphics)} 권장`,
  };
}

function buildIssues(input: {
  readonly lowRatio: number;
  readonly longRatio: number;
  readonly severeRatio: number;
  readonly maximumP99: number;
  readonly safeShare: number;
  readonly hiddenSamples: number;
  readonly sampleCount: number;
}): string[] {
  const issues: string[] = [];
  if (input.lowRatio < 0.7) issues.push('1% Low가 목표 FPS 대비 낮아 전투 입력 체감이 끊길 수 있습니다.');
  if (input.longRatio > 0.08) issues.push('33ms 이상 긴 프레임 비율이 높습니다.');
  if (input.severeRatio > 0.025 || input.maximumP99 > 60) issues.push('50ms 이상 심각한 프레임 또는 P99 급등이 감지됐습니다.');
  if (input.safeShare >= 0.45) issues.push('세션의 절반 가까이 안정 우선 렌더 단계가 사용됐습니다.');
  if (input.sampleCount > 0 && input.hiddenSamples / input.sampleCount > 0.2) issues.push('화면이 숨겨진 표본이 많아 전투 표본 신뢰도가 낮아졌습니다.');
  return issues;
}

function buildStrengths(input: {
  readonly fpsRatio: number;
  readonly lowRatio: number;
  readonly longRatio: number;
  readonly safeShare: number;
  readonly adaptiveChanges: number;
}): string[] {
  const strengths: string[] = [];
  if (input.fpsRatio >= 0.94) strengths.push('평균 FPS가 목표에 가깝게 유지됐습니다.');
  if (input.lowRatio >= 0.82) strengths.push('1% Low가 안정적으로 유지됐습니다.');
  if (input.longRatio <= 0.035) strengths.push('긴 프레임 비율이 낮습니다.');
  if (input.safeShare === 0) strengths.push('안정 우선 렌더 단계로 강제 하향되지 않았습니다.');
  if (input.adaptiveChanges <= 1) strengths.push('품질 단계 변동이 적었습니다.');
  return strengths;
}

function resolveBatteryDrain(session: DeviceQaSessionArchive): number | undefined {
  const consumed = session.battery.consumedPercent;
  if (consumed === undefined || session.durationSeconds < 60 || session.battery.charging) return undefined;
  return round((consumed / session.durationSeconds) * 1_200, 2);
}

function estimateVisibleDuration(samples: readonly DeviceQaSessionSample[], interval: number): number {
  if (samples.length <= 1) return samples.length * interval;
  return round(Math.min(samples.at(-1)?.elapsedSeconds ?? 0, samples.length * interval));
}

function resolveConfidence(samples: number, duration: number): DeviceQaConfidence {
  if (samples >= 120 && duration >= 600) return 'high';
  if (samples >= 20 && duration >= 120) return 'medium';
  return 'low';
}

function resolveGrade(score: number): DeviceQaStabilityGrade {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'stable';
  if (score >= 65) return 'constrained';
  return 'unstable';
}

export function gradeLabel(grade: DeviceQaStabilityGrade): string {
  const labels: Readonly<Record<DeviceQaStabilityGrade, string>> = {
    excellent: '매우 안정',
    stable: '안정',
    constrained: '제약 있음',
    unstable: '불안정',
    insufficient: '표본 부족',
  };
  return labels[grade];
}

function graphicsLabel(value: DeviceQaGraphicsRecommendation): string {
  return value === 'high' ? '높음' : value === 'medium' ? '중간' : '낮음';
}

function safeRatio(value: number, target: number): number {
  return target <= 0 ? 0 : value / target;
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}
