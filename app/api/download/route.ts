import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import net from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024;
const ALLOWED_TYPES = [
  "video/mp4", "video/webm", "video/quicktime", "video/x-m4v",
  "audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/ogg",
  "application/octet-stream"
];

function isPrivateIPv4(ip: string) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  return p[0] === 10 || p[0] === 127 || p[0] === 0 ||
    (p[0] === 169 && p[1] === 254) ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) || p[0] >= 224;
}

function isPrivateIP(ip: string) {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) {
    const normalized = ip.toLowerCase();
    return normalized === "::1" || normalized === "::" ||
      normalized.startsWith("fc") || normalized.startsWith("fd") ||
      normalized.startsWith("fe80:") || normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
  }
  return true;
}

async function validatePublicHost(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("Local network URLs are not allowed.");
  }
  const literalVersion = net.isIP(hostname);
  if (literalVersion) {
    if (isPrivateIP(hostname)) throw new Error("Private or local network URLs are not allowed.");
    return;
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some(record => isPrivateIP(record.address))) {
    throw new Error("This host is not allowed.");
  }
}

function safeFilename(url: URL, contentType: string) {
  const last = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "download");
  const cleaned = last.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  if (/\.(mp4|webm|mov|m4v|mp3|m4a|ogg|wav)$/i.test(cleaned)) return cleaned;
  const ext = contentType.includes("webm") ? ".webm" :
    contentType.includes("quicktime") ? ".mov" :
    contentType.includes("audio") ? ".mp3" : ".mp4";
  return `${cleaned}${ext}`;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) return NextResponse.json({ error: "Missing URL." }, { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
    if (!["http:", "https:"].includes(target.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
    if (target.username || target.password) throw new Error("URLs containing credentials are not allowed.");
    await validatePublicHost(target.hostname);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid URL." }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      redirect: "manual",
      headers: { "User-Agent": "VideoDrop/1.0 (authorized direct media fetch)" },
      signal: AbortSignal.timeout(25000)
    });

    if ([301, 302, 303, 307, 308].includes(upstream.status)) {
      return NextResponse.json({ error: "Redirected media URLs are not supported in this starter build. Use the final direct media URL." }, { status: 400 });
    }
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: `The source returned HTTP ${upstream.status}.` }, { status: 502 });
    }

    const contentType = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `Unsupported content type: ${contentType || "unknown"}. Use a direct video or audio file URL.` }, { status: 415 });
    }

    const length = Number(upstream.headers.get("content-length") || 0);
    if (length > MAX_BYTES) {
      return NextResponse.json({ error: "This starter build supports files up to 100 MB." }, { status: 413 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename(target, contentType)}"`,
        "Cache-Control": "no-store",
        ...(length ? { "Content-Length": String(length) } : {})
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to fetch this media URL."
    }, { status: 502 });
  }
}
