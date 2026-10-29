import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getPosts } from "@/lib/posts";

export function generateStaticParams() {
  const tags = new Set(getPosts().flatMap((post) => post.tags));
  return Array.from(tags).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const tag = decodeURIComponent((await params).tag);
  const posts = getPosts().filter((post) => post.tags.includes(tag));
  return (
    <SiteShell breadcrumbs={[{ label: "blog", href: "/blog" }, { label: `#${tag}` }]}>
      <h1>#{tag}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <time dateTime={post.published}>{post.published}</time>{" "}
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </SiteShell>
  );
}
