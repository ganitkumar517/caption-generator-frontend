import type { Caption } from "@/pages/Index";

export type CaptionSocketProgress = {
  type: "progress";
  stage: string;
  percent: number;
  message: string;
};

export type CaptionSocketComplete = {
  type: "complete";
  success: boolean;
  captions: Caption[];
  count: number;
  language: string;
  provider?: string;
};

export type CaptionSocketError = {
  type: "error";
  error: string;
  details?: string;
};

export type CaptionSocketReady = {
  type: "ready";
  message?: string;
};

export type CaptionSocketMessage =
  | CaptionSocketProgress
  | CaptionSocketComplete
  | CaptionSocketError
  | CaptionSocketReady
  | { type: "pong" };

function getWsBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  // VITE_API_URL is like http://localhost:4000/api → ws://localhost:4000
  const httpBase = apiUrl.replace(/\/api\/?$/, "");
  return httpBase.replace(/^http/, "ws");
}

export function generateCaptionsOverWebSocket(options: {
  videoUrl: string;
  videoId?: string;
  language?: string;
  onProgress?: (progress: {
    stage: string;
    percent: number;
    message: string;
  }) => void;
  signal?: AbortSignal;
}): Promise<CaptionSocketComplete> {
  const { videoUrl, videoId, language = "hi", onProgress, signal } = options;
  const wsUrl = `${getWsBaseUrl()}/ws/captions`;

  return new Promise((resolve, reject) => {
    let settled = false;
    const ws = new WebSocket(wsUrl);

    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = (payload: CaptionSocketComplete) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(payload);
    };

    const onAbort = () => {
      fail(new Error("Caption generation cancelled"));
    };

    signal?.addEventListener("abort", onAbort);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "generate",
          videoUrl,
          videoId,
          language,
        })
      );
    };

    ws.onmessage = (event) => {
      let data: CaptionSocketMessage;
      try {
        data = JSON.parse(String(event.data));
      } catch {
        fail(new Error("Invalid WebSocket response"));
        return;
      }

      if (data.type === "ready" || data.type === "pong") {
        return;
      }

      if (data.type === "progress") {
        onProgress?.({
          stage: data.stage,
          percent: data.percent,
          message: data.message,
        });
        return;
      }

      if (data.type === "complete") {
        succeed(data);
        return;
      }

      if (data.type === "error") {
        fail(new Error(data.details || data.error || "Caption generation failed"));
      }
    };

    ws.onerror = () => {
      fail(new Error("WebSocket connection failed. Is the backend running?"));
    };

    ws.onclose = () => {
      if (!settled) {
        fail(new Error("WebSocket closed before captions finished"));
      }
    };
  });
}
