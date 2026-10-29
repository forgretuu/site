import type { Embed } from "@/lib/embed";

export function LinkCard({ embed }: { embed: Embed }) {
  return (
    <a className="link-card" href={embed.url} target="_blank" rel="noreferrer">
      <span className="link-card-copy">
        <strong>{embed.title}</strong>
        {embed.description && <span>{embed.description}</span>}
        <small>{embed.siteName}</small>
      </span>
      {embed.image && <img src={embed.image} alt="" loading="lazy" />}
    </a>
  );
}
