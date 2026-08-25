// Made by loxqcx on Discord.
import { describe, expect, it, vi } from 'vitest';
import { buildDeletedEmbed, buildModeratedEmbed, cleanupDuplicateDecisionReplies, findReviewMessage, handleReviewReaction, markAllReviewsDeleted, migrateLegacyReviewIds, sendDecisionReplyOnce, syncPendingReviewReactions } from './reviews.js';

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
      channel: { messages: { fetch: vi.fn().mockResolvedValue(new Map()) } },
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

  it('finds reviews in any state by their footer ID', async () => {
    const approved = { id: 'approved-message', embeds: [{ footer: { text: 'RoViral Review | approved | target-id' } }] };
    const pending = { id: 'pending-message', embeds: [{ footer: { text: 'RoViral Review | pending | other-id' } }] };
    const channel = { messages: { fetch: vi.fn().mockResolvedValue(new Map([[pending.id, pending], [approved.id, approved]])) } };
    await expect(findReviewMessage(channel, 'TARGET-ID')).resolves.toBe(approved);
    await expect(findReviewMessage(channel, 'OTHER-ID')).resolves.toBe(pending);
  });

  it('marks review embeds deleted without editing unrelated messages', async () => {
    const edit = vi.fn();
    const unrelatedEdit = vi.fn();
    const review = { id: 'review', author: { id: 'bot-id' }, embeds: [{ footer: { text: 'RoViral Review | declined | review3' }, fields: [{ name: 'Review ID', value: 'review3' }] }], edit };
    const unrelated = { id: 'unrelated', author: { id: 'bot-id' }, embeds: [], edit: unrelatedEdit };
    const channel = { messages: { fetch: vi.fn().mockResolvedValue(new Map([[review.id, review], [unrelated.id, unrelated]])) } };
    await expect(markAllReviewsDeleted(channel, 'bot-id')).resolves.toBe(1);
    expect(edit.mock.calls[0][0].embeds[0]).toMatchObject({
      title: 'Deleted',
      fields: [{ name: 'Review ID', value: 'review3' }],
      footer: { text: 'RoViral Review | deleted | review3' },
    });
    expect(unrelatedEdit).not.toHaveBeenCalled();
  });

  it('preserves review information when changing the embed to deleted', () => {
    const embed = {
      title: 'Approved review',
      description: 'Original description',
      fields: [{ name: 'Review', value: 'Original review text' }, { name: 'Review ID', value: 'review4' }],
      thumbnail: { url: 'https://example.com/avatar.png' },
      footer: { text: 'RoViral Review | approved | review4' },
    };
    expect(buildDeletedEmbed(embed)).toMatchObject({
      title: 'Deleted',
      color: 0xe05252,
      description: 'Original description',
      fields: embed.fields,
      thumbnail: embed.thumbnail,
      footer: { text: 'RoViral Review | deleted | review4' },
    });
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
      channel: { messages: { fetch: vi.fn().mockResolvedValue(new Map()) } },
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

  it('migrates legacy IDs to simple sequential IDs', async () => {
    const firstEdit = vi.fn();
    const secondEdit = vi.fn();
    const first = {
      id: '100',
      author: { id: 'bot-id' },
      embeds: [{ footer: { text: 'RoViral Review | approved | old-first' }, fields: [{ name: 'Review ID', value: 'old-first' }] }],
      edit: firstEdit,
    };
    const second = {
      id: '200',
      author: { id: 'bot-id' },
      embeds: [{ footer: { text: 'RoViral Review | pending | old-second' }, fields: [{ name: 'Review ID', value: 'old-second' }] }],
      edit: secondEdit,
    };
    const client = {
      user: { id: 'bot-id' },
      channels: { fetch: vi.fn().mockResolvedValue({ messages: { fetch: vi.fn().mockResolvedValue(new Map([[second.id, second], [first.id, first]])) } }) },
    };
    await expect(migrateLegacyReviewIds(client, 'channel-id')).resolves.toBe(2);
    expect(firstEdit.mock.calls[0][0].embeds[0].footer.text).toContain('| review1');
    expect(secondEdit.mock.calls[0][0].embeds[0].footer.text).toContain('| review2');
    expect(firstEdit.mock.calls[0][0].embeds[0].fields).toContainEqual(expect.objectContaining({ name: 'Legacy Review ID', value: 'old-first' }));
  });

  it('keeps only one simultaneous decision confirmation', async () => {
    const duplicateDelete = vi.fn();
    const first = { id: '200', author: { id: 'bot-id' }, reference: { messageId: '100' }, content: 'Review approved', delete: vi.fn() };
    const duplicate = { id: '300', author: { id: 'bot-id' }, reference: { messageId: '100' }, content: 'Review approved', delete: duplicateDelete };
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Map())
      .mockResolvedValueOnce(new Map([[first.id, first], [duplicate.id, duplicate]]));
    const message = {
      id: '100',
      author: { id: 'bot-id' },
      channel: { messages: { fetch } },
      reply: vi.fn().mockResolvedValue(first),
    };
    await sendDecisionReplyOnce(message, 'Review approved', async () => {});
    expect(message.reply).toHaveBeenCalledOnce();
    expect(duplicateDelete).toHaveBeenCalledOnce();
  });

  it('cleans duplicate confirmations at startup', async () => {
    const duplicateDelete = vi.fn();
    const first = { id: '200', author: { id: 'bot-id' }, reference: { messageId: '100' }, content: 'Review declined', delete: vi.fn() };
    const duplicate = { id: '300', author: { id: 'bot-id' }, reference: { messageId: '100' }, content: 'Review declined', delete: duplicateDelete };
    const client = {
      user: { id: 'bot-id' },
      channels: { fetch: vi.fn().mockResolvedValue({ messages: { fetch: vi.fn().mockResolvedValue(new Map([[first.id, first], [duplicate.id, duplicate]])) } }) },
    };
    await expect(cleanupDuplicateDecisionReplies(client, 'channel-id')).resolves.toBe(1);
    expect(duplicateDelete).toHaveBeenCalledOnce();
  });
});
