// Made by loxqcx on Discord.
import { describe, expect, it } from 'vitest';
import { chooseRotatingThumbnail } from './gameThumbnails.js';

describe('game thumbnail rotation', () => {
  it('chooses a different image when more than one is available', () => {
    expect(chooseRotatingThumbnail(['one', 'two'], 'one', () => 0)).toBe('two');
  });

  it('uses the only available image and handles an empty list', () => {
    expect(chooseRotatingThumbnail(['one'], 'one')).toBe('one');
    expect(chooseRotatingThumbnail([])).toBe('');
  });
});
