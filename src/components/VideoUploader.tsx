import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Caption } from "@/pages/Index";
import { useUploadVideoMutation } from "@/services/api";
import { generateCaptionsOverWebSocket } from "@/services/captionSocket";

export const CAPTION_LANGUAGES = [
  {
    value: "hi",
    label: "Hindi",
    description: "Devanagari script captions (कैसे हो भाई?)",
  },
  {
    value: "hinglish",
    label: "Hinglish",
    description: "AI-written Roman Hinglish (kese ho bhai?)",
  },
  {
    value: "en",
    label: "English",
    description: "Translated English captions",
  },
  {
    value: "es",
    label: "Spanish",
    description: "Translated Spanish captions",
  },
  {
    value: "fr",
    label: "French",
    description: "Translated French captions",
  },
  {
    value: "de",
    label: "German",
    description: "Translated German captions",
  },
  {
    value: "pt",
    label: "Portuguese",
    description: "Translated Portuguese captions",
  },
] as const;

export type CaptionLanguage = (typeof CAPTION_LANGUAGES)[number]["value"];

interface VideoUploaderProps {
  onVideoUpload: (
    url: string,
    videoId?: string,
    meta?: {
      duration?: number;
      originalDuration?: number;
      trimmed?: boolean;
    }
  ) => void;
  onCaptionsGenerated: (captions: Caption[]) => void;
  videoUrl: string;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const VideoUploader = ({
  onVideoUpload,
  onCaptionsGenerated,
  videoUrl,
  isGenerating,
  setIsGenerating,
}: VideoUploaderProps) => {
  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoMutation();
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [language, setLanguage] = useState<CaptionLanguage>("hi");
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4 recommended)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 100MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const { video } = await uploadVideo(formData).unwrap();

      console.log("Video uploaded successfully:", video);

      setVideoId(video.id);
      onVideoUpload(video.url, video.id, {
        duration: video.duration,
        originalDuration: video.originalDuration,
        trimmed: video.trimmed,
      });

      toast({
        title: "Video uploaded",
        description: video.trimmed
          ? `Video was longer than 60s, so it was trimmed to the first ${Math.round(video.duration || 60)} seconds.`
          : `Uploaded successfully (${(video.duration || 0).toFixed(1)}s). Ready to generate captions!`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          (error as any)?.data?.error ||
          (error as any)?.data?.details ||
          (error as any)?.error ||
          (error instanceof Error
            ? error.message
            : "Failed to upload video. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleGenerateCaptions = async () => {
    if (!videoUrl) {
      toast({
        title: "No video",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgressPercent(2);
    setProgressMessage("Connecting via WebSocket...");

    const languageLabel =
      CAPTION_LANGUAGES.find((l) => l.value === language)?.label ?? language;

    toast({
      title: "Generating captions",
      description: `Live progress over WebSocket · ${languageLabel}`,
    });

    console.log(
      "Generating captions via WebSocket:",
      videoUrl,
      "| language:",
      language
    );

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const data = await generateCaptionsOverWebSocket({
        videoUrl,
        videoId,
        language,
        signal: abortRef.current.signal,
        onProgress: ({ percent, message }) => {
          setProgressPercent(percent);
          setProgressMessage(message);
        },
      });

      if (data.captions && data.captions.length > 0) {
        console.log("Captions generated:", data.captions.length, "segments");
        setProgressPercent(100);
        setProgressMessage(`Done — ${data.captions.length} segments`);
        onCaptionsGenerated(data.captions);

        toast({
          title: "Captions generated successfully!",
          description: `Generated ${data.captions.length} caption segments (${languageLabel})`,
        });
      } else {
        throw new Error("No captions were generated");
      }
    } catch (error) {
      console.error("Caption generation error:", error);

      let errorMessage = "Failed to generate captions";
      let errorDescription =
        error instanceof Error
          ? error.message
          : "Please check the console for details";

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "AI API key not configured";
          errorDescription =
            "Please add ASSEMBLYAI_API_KEY to your backend .env file";
        } else if (error.message.includes("FFmpeg")) {
          errorMessage = "FFmpeg not available";
          errorDescription = "Please install FFmpeg on your system";
        } else if (error.message.includes("WebSocket")) {
          errorMessage = "WebSocket connection failed";
          errorDescription =
            "Make sure the backend is running and reachable on the API port";
        }
      }

      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div>
        <h2 className="text-lg font-semibold mb-2">Upload Video</h2>
        <p className="text-sm text-muted-foreground">
          Upload an MP4 file to start creating captions with AI
        </p>
      </div>

      <div
        className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">Click to upload video</p>
            <p className="text-sm text-muted-foreground mt-1">
              {uploadedFileName || "MP4 format, max 100MB · up to 60 seconds"}
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading video...</span>
        </div>
      )}

      {videoUrl && !isUploading && (
        <>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Video uploaded successfully
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              File: {uploadedFileName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption-language">Caption language</Label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as CaptionLanguage)}
              disabled={isGenerating}
            >
              <SelectTrigger id="caption-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {CAPTION_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex flex-col items-start py-0.5">
                      <span>{lang.label}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {lang.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {
                CAPTION_LANGUAGES.find((lang) => lang.value === language)
                  ?.description
              }
            </p>
          </div>

          <Button
            onClick={handleGenerateCaptions}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating via WebSocket...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-Generate Captions with AI
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="p-3 space-y-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  {progressMessage || "Working..."}
                </p>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Live updates over WebSocket — keep this tab open until finished.
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default VideoUploader;
