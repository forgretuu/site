import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getPosts();
  return (
    <SiteShell breadcrumbs={[{ label: "blog" }]}>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p>記事はまだありません。</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <article className="post-row" key={post.slug}>
              {post.thumbnail && <img src={post.thumbnail} alt="" />}
              <div>
                <time dateTime={post.published}>{post.published}</time>
                <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
                <p>{post.description}</p>
                <div className="tags">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>#{tag}</Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
