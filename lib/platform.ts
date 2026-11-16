export type Platform =
  | "YouTube"
  | "Instagram"
  | "Facebook"
  | "TikTok"
  | "Terabox"
  | "X"
  | "Reddit"
  | "Vimeo"
  | "Direct media"
  | "Unknown";

const rules: Array<[Platform, RegExp]> = [
  ["YouTube", /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i],
  ["Instagram", /(^|\.)instagram\.com$/i],
  ["Facebook", /(^|\.)facebook\.com$|(^|\.)fb\.watch$/i],
  ["TikTok", /(^|\.)tiktok\.com$/i],
  ["Terabox", /(^|\.)terabox\.com$|(^|\.)1024terabox\.com$/i],
  ["X", /(^|\.)x\.com$|(^|\.)twitter\.com$/i],
  ["Reddit", /(^|\.)reddit\.com$|(^|\.)redd\.it$/i],
  ["Vimeo", /(^|\.)vimeo\.com$/i]
];

export function detectPlatform(input: string): Platform {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (/\.(mp4|webm|mov|m4v|mp3|m4a|ogg|wav)(\?.*)?$/i.test(url.pathname + url.search)) {
      return "Direct media";
    }
    for (const [name, pattern] of rules) if (pattern.test(host)) return name;
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

export function isHttpUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
