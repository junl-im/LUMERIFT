import { describe, expect, it } from 'vitest';
import { ObjectPool } from './ObjectPool';

describe('ObjectPool', () => {
  it('반납된 객체를 재사용한다', () => {
    let created = 0;
    const pool = new ObjectPool(() => ({ id: ++created }));
    const first = pool.acquire();
    pool.release(first);
    const second = pool.acquire();
    expect(second).toBe(first);
    expect(created).toBe(1);
  });
});
