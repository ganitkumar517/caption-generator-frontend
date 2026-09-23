const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Ask the server to delete a temp uploaded video (+ captions).
 * Uses sendBeacon when possible so refresh/close still cleans up.
 */
export function cleanupTempVideo(videoId: string | undefined | null) {
  if (!videoId) return;

  const payload = JSON.stringify({ videoId });
  const url = `${API_BASE}/videos/cleanup`;

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(
        url,
        new Blob([payload], { type: "application/json" })
      );
      if (ok) return;
    }
  } catch (_) {
    /* fall through */
  }

  // Best-effort fallback (may be cancelled during unload)
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
