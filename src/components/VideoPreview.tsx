import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Player } from "@remotion/player";
import { VideoComposition } from "@/remotion/VideoComposition";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Caption, CaptionStyle } from "@/pages/Index";
import { useExportVideoMutation } from "@/services/api";

interface VideoPreviewProps {
  videoUrl: string;
  captions: Caption[];
  captionStyle: CaptionStyle;
  videoId?: string;
}

const VideoPreview = ({ videoUrl, captions, captionStyle, videoId }: VideoPreviewProps) => {
  const [isRendering, setIsRendering] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const { toast } = useToast();

  const [exportVideo] = useExportVideoMutation();

  const handleExport = async () => {
    setIsRendering(true);
    setDownloadUrl(""); // Reset previous download URL

    toast({
      title: "Export started",
      description: "Your video is being rendered with captions. This may take a few minutes.",
    });

    try {
      // Use RTK Query mutation instead of fetch
      const result = await exportVideo({
        videoUrl,
        videoId,
        captions,
        captionStyle,
      }).unwrap();

      console.log('Export successful:', result);

      setDownloadUrl(result.downloadUrl);

      toast({
        title: "Export complete!",
        description: "Your captioned video is ready for download",
      });

      // Auto-download after 1 second
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename || 'captioned-video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1000);

    } catch (error: any) {
      console.error('Export error:', error);

      let errorMessage = 'Failed to export video';
      let errorDescription = 'Please try again';

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
        if (data.error?.includes('FFmpeg')) {
          errorMessage = 'Video encoding failed';
          errorDescription = 'Make sure FFmpeg is installed on the server';
        } else if (data.error?.includes('captions')) {
          errorMessage = 'No captions found';
          errorDescription = 'Please generate captions first';
        }
      } else if (error instanceof Error) {
        if (error.message.includes('FFmpeg')) {
          errorMessage = 'Video encoding failed';
          errorDescription = 'Make sure FFmpeg is installed on the server';
        } else if (error.message.includes('captions')) {
          errorMessage = 'No captions found';
          errorDescription = 'Please generate captions first';
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

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'captioned-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preview</h2>
          <p className="text-sm text-muted-foreground">
            See how your captions will look
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
          component={VideoComposition}
          inputProps={{
            videoUrl,
            captions,
            captionStyle,
          }}
          durationInFrames={300} // 10 seconds at 30fps - adjust based on actual video
          fps={30}
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