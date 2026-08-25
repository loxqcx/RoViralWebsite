// Made by loxqcx on Discord.
import { describe, expect, it, vi } from 'vitest';
import { buildModeratedEmbed, findReviewMessage, handleReviewReaction, syncPendingReviewReactions } from './reviews.js';

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

  it('locks in a decline and replies to the request', async () => {
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
    expect(edit.mock.calls[0][0].embeds[0].footer.text).toContain('| declined |');
    expect(reply).toHaveBeenCalledWith({ content: 'Review declined', allowedMentions: { parse: [] } });
  });

  it('finds only approved reviews by their footer ID', async () => {
    const approved = { id: 'approved-message', embeds: [{ footer: { text: 'RoViral Review | approved | target-id' } }] };
    const pending = { id: 'pending-message', embeds: [{ footer: { text: 'RoViral Review | pending | other-id' } }] };
    const channel = { messages: { fetch: vi.fn().mockResolvedValue(new Map([[pending.id, pending], [approved.id, approved]])) } };
    await expect(findReviewMessage(channel, 'TARGET-ID')).resolves.toBe(approved);
  });

  it('restores both reactions on pending reviews at startup', async () => {
    const react = vi.fn();
    const pendingMessage = {
      author: { id: 'bot-id' },
      embeds: [{ footer: { text: 'RoViral Review | pending | pending-id' } }],
      react,
    };
    const client = {
      user: { id: 'bot-id' },
      channels: {
        fetch: vi.fn().mockResolvedValue({
          messages: { fetch: vi.fn().mockResolvedValue(new Map([['message-id', pendingMessage]])) },
        }),
      },
    };
    await expect(syncPendingReviewReactions(client, 'channel-id')).resolves.toBe(1);
    expect(react).toHaveBeenNthCalledWith(1, '\u2705');
    expect(react).toHaveBeenNthCalledWith(2, '\u274c');
  });

  it('recovers an approval reaction made while the bot was offline', async () => {
    const edit = vi.fn();
    const reply = vi.fn();
    const pendingMessage = {
      author: { id: 'bot-id' },
      embeds: [{ footer: { text: 'RoViral Review | pending | offline-id' } }],
      reactions: {
        cache: new Map([
          ['approve', { emoji: { name: '\u2705' }, count: 2, me: true }],
          ['decline', { emoji: { name: '\u274c' }, count: 1, me: true }],
        ]),
      },
      edit,
      reply,
    };
    const client = {
      user: { id: 'bot-id' },
      channels: {
        fetch: vi.fn().mockResolvedValue({
          messages: { fetch: vi.fn().mockResolvedValue(new Map([['message-id', pendingMessage]])) },
        }),
      },
    };
    await syncPendingReviewReactions(client, 'channel-id');
    expect(edit.mock.calls[0][0].embeds[0].footer.text).toContain('| approved |');
    expect(reply).toHaveBeenCalledWith({ content: 'Review approved', allowedMentions: { parse: [] } });
  });
});
