import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkCard } from "@/components/link-card";
import { SiteShell } from "@/components/site-shell";
import { getEmbed } from "@/lib/embed";
import { getPost, getPosts, renderMarkdown, splitMarkdownByStandaloneUrls } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} | forgret.me`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, images: [post.thumbnail || "/default-og.png"], type: "article" },
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const parts = await Promise.all(
    splitMarkdownByStandaloneUrls(post.content).map(async (part) =>
      part.type === "url"
        ? { type: "url" as const, embed: await getEmbed(part.value) }
        : { type: "markdown" as const, html: await renderMarkdown(part.value) }
    )
  );
  return (
    <SiteShell breadcrumbs={[{ label: "blog", href: "/blog" }, { label: post.title }]}>
      <header className="post-header">
        {post.thumbnail && <img className="post-thumbnail" src={post.thumbnail} alt="" />}
        <h1>{post.title}</h1>
        <time dateTime={post.published}>{post.published}</time>
        <div className="tags">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>#{tag}</Link>
          ))}
        </div>
      </header>
      {parts.map((part, index) =>
        part.type === "url"
          ? <LinkCard key={`${part.embed.url}-${index}`} embed={part.embed} />
          : <div className="markdown" key={index} dangerouslySetInnerHTML={{ __html: part.html }} />
      )}
      {post.revisions.length > 0 && (
        <section className="revisions">
          <h2>更新履歴</h2>
          <ul>
            {post.revisions.map((revision) => (
              <li key={`${revision.date}-${revision.note}`}>
                <time dateTime={revision.date}>{revision.date}</time> {revision.note}
              </li>
            ))}
          </ul>
        </section>
      )}
    </SiteShell>
  );
}
