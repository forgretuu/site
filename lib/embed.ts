import { load } from "cheerio";

export type Embed = { url: string; title: string; description: string; image?: string; siteName: string };

export async function getEmbed(url: string): Promise<Embed> {
  const hostname = new URL(url).hostname;
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "forgret.me link preview" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("fetch failed");
    const $ = load(await response.text());
    const meta = (key: string) => $(`meta[property='${key}']`).attr("content") || $(`meta[name='${key}']`).attr("content") || "";
    return {
      url,
      title: meta("og:title") || $("title").first().text().trim() || url,
      description: meta("og:description") || meta("description"),
      image: meta("og:image") || undefined,
      siteName: meta("og:site_name") || hostname,
    };
  } catch {
    return { url, title: url, description: "", siteName: hostname };
  }
}
