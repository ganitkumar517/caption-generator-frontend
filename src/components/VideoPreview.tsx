import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Player } from "@remotion/player";
import { VideoComposition } from "@/remotion/VideoComposition";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Caption, CaptionStyle } from "@/pages/Index";
import { useExportVideoMutation } from "@/services/api";

const FPS = 30;
export const MAX_VIDEO_DURATION_SECONDS = 60;

interface VideoPreviewProps {
  videoUrl: string;
  captions: Caption[];
  captionStyle: CaptionStyle;
  videoId?: string;
  durationSeconds?: number;
}

const VideoPreview = ({
  videoUrl,
  captions,
  captionStyle,
  videoId,
  durationSeconds,
}: VideoPreviewProps) => {
  const [isRendering, setIsRendering] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [durationInFrames, setDurationInFrames] = useState(
    Math.ceil(MAX_VIDEO_DURATION_SECONDS * FPS)
  );
  const [resolvedDuration, setResolvedDuration] = useState<number>(
    durationSeconds ?? MAX_VIDEO_DURATION_SECONDS
  );
  const { toast } = useToast();

  const [exportVideo] = useExportVideoMutation();

  useEffect(() => {
    let cancelled = false;

    const applyDuration = (seconds: number) => {
      const capped = Math.min(
        Math.max(seconds || MAX_VIDEO_DURATION_SECONDS, 1),
        MAX_VIDEO_DURATION_SECONDS
      );
      if (cancelled) return;
      setResolvedDuration(capped);
      setDurationInFrames(Math.max(1, Math.ceil(capped * FPS)));
    };

    if (durationSeconds && durationSeconds > 0) {
      applyDuration(durationSeconds);
      return () => {
        cancelled = true;
      };
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      applyDuration(video.duration);
    };
    video.onerror = () => {
      applyDuration(MAX_VIDEO_DURATION_SECONDS);
    };

    return () => {
      cancelled = true;
      video.src = "";
    };
  }, [videoUrl, durationSeconds]);

  const triggerFileDownload = async (url: string, filename: string) => {
    // Fetch as blob so download stays in this tab (cross-origin <a download> opens/plays instead).
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed (${response.status})`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "captioned-video.mp4";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleExport = async () => {
    setIsRendering(true);
    setDownloadUrl("");

    toast({
      title: "Export started",
      description: "Burning captions into your video. Download starts when ready.",
    });

    try {
      const result = await exportVideo({
        videoUrl,
        videoId,
        captions,
        captionStyle,
      }).unwrap();

      console.log("Export successful:", result);

      const filename = result.filename || "captioned-video.mp4";
      setDownloadUrl(result.downloadUrl);

      await triggerFileDownload(result.downloadUrl, filename);

      toast({
        title: "Export complete!",
        description: "Choose where to save your captioned MP4.",
      });
    } catch (error: any) {
      console.error("Export error:", error);

      let errorMessage = "Failed to export video";
      let errorDescription = "Please try again";

      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        typeof error.data === "object"
      ) {
        const { data } = error;
        if (data.details || data.error) {
          errorDescription = data.details || data.error;
        }
        if (data.error?.includes("FFmpeg")) {
          errorMessage = "Video encoding failed";
          errorDescription = "Make sure FFmpeg is installed on the server";
        } else if (data.error?.includes("captions")) {
          errorMessage = "No captions found";
          errorDescription = "Please generate captions first";
        }
      } else if (error instanceof Error) {
        if (error.message.includes("FFmpeg")) {
          errorMessage = "Video encoding failed";
          errorDescription = "Make sure FFmpeg is installed on the server";
        } else if (error.message.includes("captions")) {
          errorMessage = "No captions found";
          errorDescription = "Please generate captions first";
        } else {
          errorDescription = error.message;
        }
      }

      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    try {
      await triggerFileDownload(downloadUrl, "captioned-video.mp4");
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Could not save the video. Try Export again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preview</h2>
          <p className="text-sm text-muted-foreground">
            See how your captions will look · {resolvedDuration.toFixed(1)}s
            {resolvedDuration >= MAX_VIDEO_DURATION_SECONDS - 0.05
              ? ` (max ${MAX_VIDEO_DURATION_SECONDS}s)`
              : ""}
          </p>
        </div>

        <div className="flex gap-2">
          {downloadUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-primary/50 hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Again
            </Button>
          )}

          {captions.length > 0 && (
            <Button
              onClick={handleExport}
              disabled={isRendering}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Video
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <Player
          key={`${videoUrl}-${durationInFrames}-${captionStyle}`}
          component={VideoComposition}
          inputProps={{
            videoUrl,
            captions,
            captionStyle,
          }}
          durationInFrames={durationInFrames}
          fps={FPS}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls
        />
      </div>

      {isRendering && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                Rendering video with captions...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This process uses FFmpeg to burn captions directly into the video.
                Typical render time: 30-90 seconds depending on video length.
              </p>
            </div>
          </div>
        </div>
      )}

      {downloadUrl && !isRendering && (
        <div className="flex items-center gap-2 text-sm p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-medium text-green-600 dark:text-green-400">
              ✓ Export completed successfully!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your video should download automatically. If not, click "Download Again" button above.
            </p>
          </div>
        </div>
      )}

      {captions.length > 0 && !isRendering && !downloadUrl && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-primary/5 rounded-lg border border-primary/20">
          <svg
            className="w-5 h-5 text-primary flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-medium">Ready to export</p>
            <p className="text-xs mt-1">
              Click "Export Video" to download your video with captions permanently embedded.
              The exported video will work on any device or platform.
            </p>
          </div>
        </div>
      )}

      {captions.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <svg
            className="w-5 h-5 text-yellow-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>
            Generate captions first to enable video export with embedded captions.
          </p>
        </div>
      )}
    </Card>
  );
};

export default VideoPreview;
