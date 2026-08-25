// Made by loxqcx on Discord.
import { describe, expect, it, vi } from 'vitest';
import { deleteAllReviewsCommand, deleteReviewCommand, handleCommand, registerCommands, testCommand } from './commands.js';

describe('Discord commands', () => {
  it('defines the test slash command', () => {
    expect(testCommand.toJSON()).toMatchObject({
      name: 'test',
      description: 'Check that the RoViral bot is working.',
    });
  });

  it('defines the review deletion command with a required ID', () => {
    expect(deleteReviewCommand.toJSON()).toMatchObject({
      name: 'deleter',
      options: [{ name: 'id', required: true }],
    });
  });

  it('defines the delete-all review command', () => {
    expect(deleteAllReviewsCommand.toJSON()).toMatchObject({ name: 'deleteallrev' });
  });

  it('replies to /test', async () => {
    const reply = vi.fn();
    const handled = await handleCommand({
      isChatInputCommand: () => true,
      commandName: 'test',
      reply,
    });

    expect(handled).toBe(true);
    expect(reply).toHaveBeenCalledWith({
      content: 'lox test successful',
      allowedMentions: { parse: [] },
    });
  });

  it('registers all commands without replacing other commands', async () => {
    const create = vi.fn();
    const client = {
      application: {
        commands: {
          fetch: vi.fn().mockResolvedValue({ find: () => undefined }),
          create,
        },
      },
    };

    await expect(registerCommands(client)).resolves.toBe('Registered /test and /deleter and /deleteallrev globally.');
    expect(create).toHaveBeenCalledTimes(3);
    expect(create).toHaveBeenCalledWith(testCommand.toJSON());
    expect(create).toHaveBeenCalledWith(deleteReviewCommand.toJSON());
    expect(create).toHaveBeenCalledWith(deleteAllReviewsCommand.toJSON());
  });

  it('marks an approved review deleted by ID', async () => {
    const edit = vi.fn();
    const channel = {
      messages: {
        fetch: vi.fn().mockResolvedValue(new Map([['message-id', {
          id: 'message-id',
          author: { id: 'bot-id' },
          embeds: [{ title: 'Approved review', color: 1, fields: [{ name: 'Review', value: 'Kept information' }], footer: { text: 'RoViral Review | approved | review-id' } }],
          edit,
        }]])),
      },
    };
    const editReply = vi.fn();
    const handled = await handleCommand({
      isChatInputCommand: () => true,
      commandName: 'deleter',
      user: { id: 'staff-id' },
      memberPermissions: { has: () => true },
      deferReply: vi.fn(),
      editReply,
      options: { getString: () => 'review-id' },
      client: {
        user: { id: 'bot-id' },
        channels: { fetch: vi.fn().mockResolvedValue(channel) },
      },
    });

    expect(handled).toBe(true);
    expect(edit.mock.calls[0][0].embeds[0]).toMatchObject({
      title: 'Deleted',
      color: 0xe05252,
      fields: [{ name: 'Review', value: 'Kept information' }],
      footer: { text: 'RoViral Review | deleted | review-id' },
    });
    expect(editReply).toHaveBeenCalledWith(expect.stringContaining('Review marked as deleted'));
  });

  it('deletes all review records', async () => {
    const firstEdit = vi.fn();
    const secondEdit = vi.fn();
    const channel = {
      messages: {
        fetch: vi.fn().mockResolvedValue(new Map([
          ['first', { id: 'first', author: { id: 'bot-id' }, embeds: [{ footer: { text: 'RoViral Review | approved | review1' }, fields: [{ name: 'Review ID', value: 'review1' }] }], edit: firstEdit }],
          ['second', { id: 'second', author: { id: 'bot-id' }, embeds: [{ footer: { text: 'RoViral Review | pending | review2' }, fields: [{ name: 'Review ID', value: 'review2' }] }], edit: secondEdit }],
        ])),
      },
    };
    const editReply = vi.fn();
    const deferReply = vi.fn();
    await handleCommand({
      isChatInputCommand: () => true,
      commandName: 'deleteallrev',
      user: { id: 'staff-id' },
      memberPermissions: { has: () => true },
      deferReply,
      editReply,
      client: {
        user: { id: 'bot-id' },
        channels: { fetch: vi.fn().mockResolvedValue(channel) },
      },
    });
    expect(firstEdit.mock.calls[0][0].embeds[0].title).toBe('Deleted');
    expect(secondEdit.mock.calls[0][0].embeds[0].footer.text).toContain('| deleted | review2');
    expect(deferReply).toHaveBeenCalledWith();
    expect(editReply).toHaveBeenCalledWith('All reviews have been deleted');
  });
});
