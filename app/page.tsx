"use client";

import { useMemo, useState } from "react";
import { detectPlatform, isHttpUrl } from "@/lib/platform";

export default function Home() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const platform = useMemo(() => url.trim() ? detectPlatform(url.trim()) : null, [url]);
  const valid = isHttpUrl(url.trim());

  async function handleDownload() {
    setError("");
    setMessage("");
    if (!valid) {
      setError("Please paste a valid http:// or https:// URL.");
      return;
    }
    if (platform !== "Direct media") {
      setError(
        platform && platform !== "Unknown"
          ? `${platform} link detected. This platform adapter is not enabled in this starter build. Use an official download option or a direct media URL you are authorized to download.`
          : "This link is not recognized as a direct media file. Try a direct .mp4, .webm, .mov, .mp3 or other supported media URL."
      );
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url.trim())}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Download could not be started.");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || "videodrop-media";
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setMessage("Download started. Check your browser downloads.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-shell">
      <nav className="nav">
        <a className="brand" href="#"><span className="brand-mark">▶</span> VideoDrop</a>
        <span className="nav-pill">Simple · Fast · Responsible</span>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span className="pulse" /> YOUR MEDIA, ONE PLACE</div>
        <h1>One link.<br /><span>One place.</span></h1>
        <p className="hero-copy">
          Paste a media link and get started. VideoDrop currently supports direct media-file URLs;
          more platform integrations can be added through authorized adapters.
        </p>

        <div className="download-card">
          <label htmlFor="media-url">Paste your video or audio URL</label>
          <div className="input-row">
            <span className="link-icon">↗</span>
            <input
              id="media-url"
              type="url"
              placeholder="https://example.com/video.mp4"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); setMessage(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleDownload(); }}
            />
            {url && <button className="clear-btn" onClick={() => setUrl("")} aria-label="Clear URL">×</button>}
          </div>
          <div className="detected-row">
            <span>{platform ? "Detected source" : "Supported input"}</span>
            <strong>{platform || "Direct media URLs"}</strong>
          </div>
          <button className="download-btn" onClick={handleDownload} disabled={busy || !url.trim()}>
            {busy ? <><span className="spinner" /> Preparing download…</> : <>Download media <span>→</span></>}
          </button>
          {error && <p className="feedback error">{error}</p>}
          {message && <p className="feedback success">{message}</p>}
          <p className="small-note">Only download content you own or have permission to save. Platform restrictions and copyright rules apply.</p>
        </div>

        <div className="platforms">
          <span>LINK DETECTION FOR</span>
          <div className="platform-list">
            {["YouTube", "Instagram", "Facebook", "TikTok", "Terabox", "Vimeo"].map((p) =>
              <span className="platform-chip" key={p}>{p}</span>
            )}
          </div>
          <p className="platform-note">Detection is available; direct downloading from these platforms requires separate authorized integrations.</p>
        </div>
      </section>

      <section className="steps">
        <div><span className="step-no">01</span><h3>Paste a link</h3><p>Start with a direct media-file URL.</p></div>
        <div><span className="step-no">02</span><h3>We check it</h3><p>VideoDrop validates the URL and media response.</p></div>
        <div><span className="step-no">03</span><h3>Save your file</h3><p>Download the media to your device.</p></div>
      </section>
      <footer><span>© {new Date().getFullYear()} VideoDrop</span><span>Built for content you have permission to download.</span></footer>
    </main>
  );
}
