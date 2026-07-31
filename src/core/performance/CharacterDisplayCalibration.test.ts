import { describe, expect, it } from 'vitest';
import { resolveCharacterDisplayCalibration } from './CharacterDisplayCalibration';

describe('CharacterDisplayCalibration', () => {
  it('selects Android Chrome and iOS Safari capture-ready baselines', () => {
    const android = resolveCharacterDisplayCalibration('Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36');
    const ios = resolveCharacterDisplayCalibration('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1');
    expect(android.platform).toBe('android-chrome');
    expect(ios.platform).toBe('ios-safari');
    expect(android.studioScale).not.toBe(ios.studioScale);
  });

  it('does not claim physical capture verification before measurements exist', () => {
    expect(resolveCharacterDisplayCalibration('desktop').captureStatus).toBe('pending-physical-capture');
  });
});
