import fs from "node:fs";
import path from "node:path";
import TOML from "@iarna/toml";

export type Profile = {
  name: string;
  subtitle: string;
  email: string;
  icon_url: string;
  introduction: string;
  social_links: Array<{ label: string; href: string }>;
  career: Array<{ date: string; detail: string }>;
  theme: {
    background_color: string;
    text_color: string;
    accent_color: string;
  };
  blog: {
    default_thumbnail: string;
  };
};

export function getProfile(): Profile {
  const filePath = path.join(process.cwd(), "profile.toml");
  const source = fs.readFileSync(filePath, "utf8");
  return TOML.parse(source) as unknown as Profile;
}
