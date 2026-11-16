# VideoDrop

A Next.js starter for a responsible, direct-media downloader.

## What works in this build

- Responsive homepage for mobile and desktop.
- URL/platform detection for YouTube, Instagram, Facebook, TikTok, Terabox, X, Reddit and Vimeo.
- Downloads direct public media-file URLs (MP4, WebM, MOV, M4V, MP3, M4A, OGG, WAV and supported octet-stream responses).
- Server-side URL validation and basic SSRF protections.
- 100 MB maximum when the source provides a Content-Length header.
- Clear errors for unsupported platform links.

## Important limitation

Platform names are detected for user feedback, but this starter does **not** extract media from YouTube, Instagram, Facebook, TikTok, Terabox, X, Reddit, Vimeo or Diskwala pages. Those services have different APIs, access rules, authentication requirements and restrictions. Add a platform adapter only where the service provides an authorized API or download mechanism. Do not bypass DRM, private-content controls, paywalls or access restrictions, and only download content you own or have permission to save.

The download API is intentionally limited to direct HTTP(S) media URLs. Redirects are rejected, and private/local network destinations are blocked. This is a starter implementation, not a hardened public-scale download service.

## Run locally

Requirements: Node.js 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Extract this ZIP.
2. Push the project folder to a GitHub repository.
3. In Vercel, choose **Add New → Project** and import the repository.
4. Keep the framework preset as Next.js.
5. Deploy.

No environment variables are required for the starter.

## Before public launch

- Add persistent rate limiting (for example, Redis/Upstash).
- Add request quotas and abuse monitoring.
- Re-check DNS/IP resolution on every redirect if redirect support is ever added.
- Add a clear copyright/acceptable-use policy and takedown contact.
- Review the hosting provider's limits for response streaming, execution time and bandwidth.
- Add platform integrations only after checking each platform's current developer terms and permitted download methods.
