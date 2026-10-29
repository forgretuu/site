import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import sanitizeHtml from "sanitize-html";
import { getProfile } from "./profile";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export type Revision = { date: string; note: string };
export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  published: string;
  tags: string[];
  thumbnail: string;
  revisions: Revision[];
};
export type Post = PostMeta & { content: string };

function readPost(filename: string): Post {
  const slug = filename.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(postsDirectory, filename), "utf8");
  const { data, content } = matter(source);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    published: String(data.published ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    thumbnail: data.thumbnail ? String(data.thumbnail) : "",
    revisions: Array.isArray(data.revisions)
      ? data.revisions.map((revision: { date?: string; note?: string }) => ({ date: String(revision.date ?? ""), note: String(revision.note ?? "") }))
      : [],
    content,
  };
}

export function getPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map(readPost)
    .sort((a, b) => b.published.localeCompare(a.published))
    .map(({ content: _content, ...meta }) => meta);
}

export function getPost(slug: string): Post | null {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return null;
  const filename = `${slug}.md`;
  return fs.existsSync(path.join(postsDirectory, filename)) ? readPost(filename) : null;
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);
  return sanitizeHtml(String(result), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "span", "math", "annotation", "semantics", "mrow", "mi", "mo", "mn", "msup", "mfrac"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "aria-hidden"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "loading"],
      annotation: ["encoding"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function splitMarkdownByStandaloneUrls(markdown: string): Array<{ type: "markdown" | "url"; value: string }> {
  const parts: Array<{ type: "markdown" | "url"; value: string }> = [];
  let lines: string[] = [];
  const flush = () => {
    const value = lines.join("\n").trim();
    if (value) parts.push({ type: "markdown", value });
    lines = [];
  };
  for (const line of markdown.split("\n")) {
    const value = line.trim();
    if (/^https?:\/\/\S+$/.test(value)) {
      flush();
      parts.push({ type: "url", value });
    } else {
      lines.push(line);
    }
  }
  flush();
  return parts;
}
