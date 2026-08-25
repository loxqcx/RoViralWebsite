// Made by loxqcx on Discord.
import { describe, expect, it } from 'vitest';
import { buildDiscordPayload, normalizeSubmission, validateSubmission } from './contact';

describe('contact API helpers', () => {
  it('normalizes and limits user input', () => {
    const data = normalizeSubmission({ name: '  Erik  ', message: 'x'.repeat(2500) });
    expect(data.name).toBe('Erik');
    expect(data.message).toHaveLength(2000);
  });

  it('rejects invalid required fields', () => {
    const data = normalizeSubmission({ name: 'Erik', email: 'bad', service: 'Audit', budget: 'Not sure', message: 'A detailed enough project message.' });
    expect(validateSubmission(data)).toBe('Please enter a valid email address.');
  });

  it('builds a restricted Discord mention payload', () => {
    const data = normalizeSubmission({
      name: 'Erik', email: 'erik@example.com', company: 'Studio', discord: 'erik', gameLink: 'https://roblox.com/games/123', service: 'Game Trailers', budget: '$5,000 - $10,000', message: 'We are preparing a major game launch.',
    });
    const payload = buildDiscordPayload(data, ['1338968623095615508', 'not-an-id']);
    expect(payload.content).toBe('<@1338968623095615508>');
    expect(payload.allowed_mentions.users).toEqual(['1338968623095615508']);
    expect(payload.embeds[0].fields).toHaveLength(8);
    expect(payload.embeds[0].fields.at(-1).value.length).toBeLessThanOrEqual(1024);
  });
});
