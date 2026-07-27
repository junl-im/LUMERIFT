import { describe, expect, it } from 'vitest';
import { circlesOverlap, isPointInDirectionalArc, normalize } from './geometry';

describe('combat geometry', () => {
  it('영벡터 정규화 시 지정한 대체 방향을 사용한다', () => {
    expect(normalize({ x: 0, y: 0 }, { x: 0, y: -1 })).toEqual({ x: 0, y: -1 });
  });

  it('원형 공격 범위의 충돌을 판정한다', () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 15, y: 0 }, 5)).toBe(true);
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 16, y: 0 }, 5)).toBe(false);
  });

  it('캐릭터 전방 부채꼴 밖의 대상을 제외한다', () => {
    expect(isPointInDirectionalArc({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 50, y: 10 }, 80, Math.PI / 4)).toBe(true);
    expect(isPointInDirectionalArc({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -30, y: 0 }, 80, Math.PI / 4)).toBe(false);
  });
});
