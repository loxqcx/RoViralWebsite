// Made by loxqcx on Discord.
import { describe, expect, it, vi } from 'vitest';
import { deleteReviewCommand, handleCommand, registerCommands, testCommand } from './commands.js';

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

  it('registers both commands without replacing other commands', async () => {
    const create = vi.fn();
    const client = {
      application: {
        commands: {
          fetch: vi.fn().mockResolvedValue({ find: () => undefined }),
          create,
        },
      },
    };

    await expect(registerCommands(client)).resolves.toBe('Registered /test and /deleter globally.');
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledWith(testCommand.toJSON());
    expect(create).toHaveBeenCalledWith(deleteReviewCommand.toJSON());
  });

  it('deletes an approved review by ID', async () => {
    const remove = vi.fn();
    const channel = {
      messages: {
        fetch: vi.fn().mockResolvedValue(new Map([['message-id', {
          id: 'message-id',
          author: { id: 'bot-id' },
          embeds: [{ footer: { text: 'RoViral Review | approved | review-id' } }],
          delete: remove,
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
    expect(remove).toHaveBeenCalledOnce();
    expect(editReply).toHaveBeenCalledWith(expect.stringContaining('Review deleted'));
  });
});
