// Made by loxqcx on Discord.
import { describe, expect, it } from 'vitest';
import { buildReviewPayload, createReview, getNextReviewId, normalizeReview, parseApprovedReview, readReviewState, validateReview } from './reviews.js';

describe('review submissions', () => {
  it('normalizes and validates a review', () => {
    const review = normalizeReview({ discord: '@loxqcx', name: 'Erik', message: 'A strong experience working together.', stars: '4' });
    expect(review).toEqual({ discord: 'loxqcx', name: 'Erik', message: 'A strong experience working together.', stars: 4 });
    expect(validateReview(review)).toBeNull();
  });

  it('rejects invalid stars and identities', () => {
    expect(validateReview(normalizeReview({ discord: '!', message: 'Long enough review.', stars: 8 }))).toMatch(/valid Discord/);
    expect(validateReview(normalizeReview({ discord: 'loxqcx', message: 'Long enough review.', stars: 8 }))).toMatch(/1 to 5/);
  });

  it('builds a mention-safe pending embed', () => {
    const payload = buildReviewPayload(
      { discord: 'loxqcx', name: '', message: '<@123> was excellent to work with.', stars: 5 },
      { id: '123456789012345678', username: 'loxqcx', displayName: 'Lox', avatarUrl: 'https://example.com/avatar.png' },
      'review-id',
    );
    expect(payload.allowed_mentions).toEqual({ parse: [] });
    expect(readReviewState(payload.embeds[0])).toEqual({ state: 'pending', id: 'review-id' });
    expect(payload.embeds[0].fields).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Review ID', value: 'review-id' }),
      expect.objectContaining({ name: 'Moderation', value: expect.stringContaining('\u274c') }),
    ]));
  });

  it('only exposes approved embeds', () => {
    const payload = buildReviewPayload(
      { discord: 'loxqcx', name: 'Erik', message: 'A strong experience working together.', stars: 4 },
      { id: '123456789012345678', username: 'loxqcx', displayName: 'Lox', avatarUrl: '' },
      'review-id',
    );
    expect(parseApprovedReview({ embeds: payload.embeds })).toBeNull();
    payload.embeds[0].footer.text = 'RoViral Review | approved | review-id';
    expect(parseApprovedReview({ embeds: payload.embeds, timestamp: '2026-08-24T00:00:00.000Z' })).toMatchObject({
      id: 'review-id', displayName: 'Erik', username: 'loxqcx', stars: 4,
    });
  });

  it('posts the embed and both moderation reactions', async () => {
    const calls = [];
    const fetchMock = async (url, options) => {
      calls.push({ url, options });
      if (options.method === 'POST') return { ok: true, json: async () => ({ id: 'message-id' }) };
      if (!options.method) return { ok: true, json: async () => [] };
      return { ok: true };
    };
    const result = await createReview(
      { discord: 'outsideuser', name: '', message: 'A strong experience working together.', stars: 5 },
      { token: 'private-test-token', channelId: '123456789012345678', guildId: '' },
      fetchMock,
    );
    expect(result).toEqual({ status: 200, data: { ok: true, message: 'Review sent' } });
    expect(calls).toHaveLength(4);
    expect(calls[1].url).toContain('/channels/123456789012345678/messages');
    expect(JSON.parse(calls[1].options.body).embeds[0].footer.text).toContain('| review1');
    expect(calls.slice(2).every((call) => call.options.method === 'PUT')).toBe(true);
  });

  it('increments simple review IDs', async () => {
    const fetchMock = async () => ({
      ok: true,
      json: async () => [
        { embeds: [{ footer: { text: 'RoViral Review | approved | review2' } }] },
        { embeds: [{ footer: { text: 'RoViral Review | pending | review7' } }] },
        { embeds: [{ footer: { text: 'RoViral Review | approved | old-uuid' } }] },
      ],
    });
    await expect(getNextReviewId({ token: 'token', channelId: 'channel' }, fetchMock)).resolves.toBe('review8');
  });
});
