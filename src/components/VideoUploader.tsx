import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Caption } from "@/pages/Index";
import {
  useUploadVideoMutation,
  useGenerateCaptionsMutation,
} from "@/services/api";

interface VideoUploaderProps {
  onVideoUpload: (url: string, videoId?: string) => void;
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
  const [generateCaptions] = useGenerateCaptionsMutation();
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      formData.append('video', file);


      const { video } = await uploadVideo(formData).unwrap();

      console.log('Video uploaded successfully:', video);

      setVideoId(video.id);
      onVideoUpload(video.url, video.id);

      toast({
        title: "Video uploaded",
        description: "Your video has been uploaded successfully. Ready to generate captions!",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          (error as any)?.data?.error ||
          (error as any)?.data?.details ||
          (error as any)?.error ||
          (error instanceof Error ? error.message : "Failed to upload video. Please try again."),
        variant: "destructive",
      });
    } finally {
      // isUploading comes from RTK Query hook; no manual reset needed
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

    toast({
      title: "Generating captions",
      description: "Using AI to generate captions for your video. This may take a minute...",
    });

    console.log('Generating captions for:', videoUrl);

    try {
      const data = await generateCaptions({
        videoUrl,
        videoId,
      }).unwrap();

      if (data.captions && data.captions.length > 0) {
        console.log('Captions generated:', data.captions.length, 'segments');
        onCaptionsGenerated(data.captions);

        toast({
          title: "Captions generated successfully!",
          description: `Generated ${data.captions.length} caption segments using AI`,
        });
      } else {
        throw new Error('No captions were generated');
      }
    } catch (error) {
      console.error("Caption generation error:", error);

      let errorMessage = "Failed to generate captions";
      let errorDescription =
        (error as any)?.data?.error ||
        (error as any)?.data?.details ||
        (error as any)?.error ||
        "Please check the console for details";

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "AI API key not configured";
          errorDescription = "Please add AI_API_KEY to your backend .env file";
        } else if (error.message.includes('FFmpeg')) {
          errorMessage = "FFmpeg not available";
          errorDescription = "Please install FFmpeg on your system";
        } else if (error.message.includes('credits')) {
          errorMessage = "Insufficient AI credits";
          errorDescription = "Please add credits to your AI account";
        } else if (!errorDescription || errorDescription === "Please check the console for details") {
          errorDescription = error.message;
        }
      }

      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
              {uploadedFileName || "MP4 format, max 100MB"}
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


          <Button
            onClick={handleGenerateCaptions}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Captions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-Generate Captions with AI
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⏳ Transcribing audio with  AI...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This typically takes 30-60 seconds depending on video length
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default VideoUploader;