// Made by loxqcx on Discord.
import { useEffect, useMemo, useState } from 'react';

export function useDiscordProfiles(members) {
  const [state, setState] = useState({ status: 'loading', profiles: [] });
  const userIds = useMemo(() => members.map((member) => member.discordUserId).filter(Boolean).join(','), [members]);

  useEffect(() => {
    if (!userIds) {
      setState({ status: 'idle', profiles: [] });
      return undefined;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/discord-users?ids=${encodeURIComponent(userIds)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Discord profiles are unavailable.');
        const data = await response.json();
        setState({ status: 'live', profiles: data.profiles || [] });
      } catch (error) {
        if (error.name !== 'AbortError') setState({ status: 'error', profiles: [] });
      }
    };

    load();
    return () => controller.abort();
  }, [userIds]);

  return state;
}
