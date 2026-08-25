// Made by loxqcx on Discord.
import { describe, expect, it } from 'vitest';
import { fetchDiscordProfiles, getDiscordAvatarUrl, parseDiscordUserIds } from './discord-users';

describe('Discord profile API helpers', () => {
  it('parses unique valid Discord IDs', () => {
    expect(parseDiscordUserIds('1338968623095615508,bad,1338968623095615508,898661166727962626')).toEqual([
      '1338968623095615508',
      '898661166727962626',
    ]);
  });

  it('builds a Discord CDN avatar URL', () => {
    expect(getDiscordAvatarUrl({ id: '1338968623095615508', avatar: 'avatar_hash', discriminator: '0' }))
      .toBe('https://cdn.discordapp.com/avatars/1338968623095615508/avatar_hash.webp?size=256');
  });

  it('returns safe public profile fields', async () => {
    const fetchImpl = async (url, options) => {
      expect(url).toBe('https://discord.com/api/v10/users/1338968623095615508');
      expect(options.headers.Authorization).toBe('Bot test-token');
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: '1338968623095615508', username: 'loxqcx', global_name: 'Lox', avatar: 'hash', discriminator: '0' }),
      };
    };

    const result = await fetchDiscordProfiles(['1338968623095615508'], 'test-token', fetchImpl);
    expect(result.profiles[0]).toMatchObject({
      id: '1338968623095615508',
      available: true,
      username: 'loxqcx',
      displayName: 'Lox',
      avatarUrl: 'https://cdn.discordapp.com/avatars/1338968623095615508/hash.webp?size=256',
    });
  });
});
