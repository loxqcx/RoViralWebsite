// Made by loxqcx on Discord.
import { describe, expect, it, vi } from 'vitest';
import { buildModeratedEmbed, findReviewMessage, handleReviewReaction } from './reviews.js';

describe('review moderation', () => {
  const pending = {
    title: 'New review awaiting approval',
    color: 1,
    fields: [],
    footer: { text: 'RoViral Review | pending | test-review' },
  };

  it('approves a pending review', () => {
    const result = buildModeratedEmbed(pending, 'approved');
    expect(result.title).toBe('Approved review');
    expect(result.footer.text).toBe('RoViral Review | approved | test-review');
  });

  it('does not change a completed review', () => {
    const completed = { ...pending, footer: { text: 'RoViral Review | denied | test-review' } };
    expect(buildModeratedEmbed(completed, 'approved')).toBeNull();
  });

  it('locks in a denial and replies to the request', async () => {
    const edit = vi.fn();
    const reply = vi.fn();
    const message = {
      author: { id: 'bot-id' },
      embeds: [{ toJSON: () => pending }],
      edit,
      reply,
    };
    const reaction = {
      partial: false,
      emoji: { name: '\u274c' },
      client: { user: { id: 'bot-id' } },
      message: {
        partial: false,
        id: 'message-id',
        channelId: '123456789012345678',
        channel: { messages: { fetch: vi.fn().mockResolvedValue(message) } },
      },
    };
    const handled = await handleReviewReaction(reaction, { id: 'staff-id', bot: false }, { channelId: '123456789012345678' });
    expect(handled).toBe(true);
    expect(edit.mock.calls[0][0].embeds[0].footer.text).toContain('| denied |');
    expect(reply).toHaveBeenCalledWith({ content: 'Review denied', allowedMentions: { parse: [] } });
  });

  it('finds only approved reviews by their footer ID', async () => {
    const approved = { id: 'approved-message', embeds: [{ footer: { text: 'RoViral Review | approved | target-id' } }] };
    const pending = { id: 'pending-message', embeds: [{ footer: { text: 'RoViral Review | pending | other-id' } }] };
    const channel = { messages: { fetch: vi.fn().mockResolvedValue(new Map([[pending.id, pending], [approved.id, approved]])) } };
    await expect(findReviewMessage(channel, 'TARGET-ID')).resolves.toBe(approved);
  });
});
