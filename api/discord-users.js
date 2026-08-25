// Made by loxqcx on Discord.
const MAX_USER_IDS = 20;

export function parseDiscordUserIds(value) {
  const raw = Array.isArray(value) ? value.join(',') : String(value || '');
  return [...new Set(raw.split(',').map((id) => id.trim()).filter((id) => /^\d{17,20}$/.test(id)))].slice(0, MAX_USER_IDS);
}

export function getDiscordAvatarUrl(user) {
  if (user.avatar) return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`;

  const index = user.discriminator && user.discriminator !== '0'
    ? Number(user.discriminator) % 5
    : Number((BigInt(user.id) >> 22n) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export async function fetchDiscordProfiles(userIds, token, fetchImpl = fetch) {
  if (!token) throw new Error('Discord bot token is not configured.');

  const profiles = await Promise.all(userIds.map(async (id) => {
    const discordResponse = await fetchImpl(`https://discord.com/api/v10/users/${id}`, {
      headers: { Authorization: `Bot ${token}` },
    });

    if (discordResponse.status === 401 || discordResponse.status === 403) throw new Error('Discord bot authentication failed.');
    if (!discordResponse.ok) return { id, available: false };

    const user = await discordResponse.json();
    const username = user.discriminator && user.discriminator !== '0'
      ? `${user.username}#${user.discriminator}`
      : user.username;

    return {
      id: String(user.id),
      available: true,
      username,
      displayName: user.global_name || user.username,
      avatarUrl: getDiscordAvatarUrl(user),
    };
  }));

  return { profiles, updatedAt: new Date().toISOString() };
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const userIds = parseDiscordUserIds(request.query?.ids);
  if (!userIds.length) return response.status(400).json({ error: 'Provide at least one valid Discord user ID.' });
  if (!process.env.DISCORD_BOT_TOKEN) {
    return response.status(200).json({
      profiles: userIds.map((id) => ({ id, available: false })),
      configured: false,
    });
  }

  try {
    const data = await fetchDiscordProfiles(userIds, process.env.DISCORD_BOT_TOKEN);
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    return response.status(200).json(data);
  } catch (error) {
    console.error('Discord profile lookup failed.', error);
    return response.status(502).json({ error: 'Discord profiles are temporarily unavailable.' });
  }
}
