import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VideoDrop — One link. One place.",
  description: "A simple downloader for direct media links and content you are authorized to download."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
