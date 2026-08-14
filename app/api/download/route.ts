import { NextRequest, NextResponse } from "next/server";

function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "pexels.com" ||
    h.endsWith(".pexels.com") ||
    h === "pixabay.com" ||
    h.endsWith(".pixabay.com")
  );
}
const MAX_BYTES = 50 * 1024 * 1024;

function fileExt(pathname: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(pathname);
  if (match && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(match[1].toLowerCase())) {
    return match[1].toLowerCase();
  }
  return "jpg";
}

function safeName(raw: string): string {
  const cleaned = raw.replace(/[^\w.\-]+/g, "_").slice(0, 80);
  return cleaned.trim() || "wallpaper";
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const rawUrl = params.get("url");
  const name = safeName(params.get("name") ?? "wallpaper");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (target.protocol !== "https:" || !isAllowedHost(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
  }

  const contentLength = Number(upstream.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const filename = `${name}.${fileExt(target.pathname)}`;
  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/octet-stream",
  );
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  if (contentLength > 0) {
    headers.set("Content-Length", String(contentLength));
  }

  return new Response(upstream.body, { status: 200, headers });
}