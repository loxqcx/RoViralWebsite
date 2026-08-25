// Made by loxqcx on Discord.
import PageHero from '../components/PageHero';
import { teamPageConfig } from '../config/team';
import { useDiscordProfiles } from '../hooks/useDiscordProfiles';

export default function TeamPage() {
  const discord = useDiscordProfiles(teamPageConfig.members);
  const profilesById = new Map(discord.profiles.map((profile) => [String(profile.id), profile]));

  return (
    <>
      <PageHero {...teamPageConfig.hero} />
      <section className="team-section section-pad">
        <div className="container team-grid">
          {teamPageConfig.members.map((person, index) => {
            const profile = profilesById.get(String(person.discordUserId));
            const username = profile?.username || person.discordUsername;

            return (
              <article className="team-card" key={person.discordUserId || person.name}>
                <div className="team-portrait team-portrait--discord">
                  {profile?.avatarUrl
                    ? <img className="team-avatar" src={profile.avatarUrl} alt={`${username} Discord avatar`} />
                    : <span className="team-avatar-fallback">{person.initials}</span>}
                  <i>{String(index + 1).padStart(2, '0')}</i>
                </div>
                <h2>{person.name}</h2>
                {username && <span className="team-discord-handle">@{username} on Discord</span>}
                <strong>{person.role}</strong>
                <p>{person.bio}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
