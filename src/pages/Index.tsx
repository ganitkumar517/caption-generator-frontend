import { useState } from "react";
import VideoUploader from "@/components/VideoUploader";
import CaptionEditor from "@/components/CaptionEditor";
import VideoPreview from "@/components/VideoPreview";
import { Card } from "@/components/ui/card";

export interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
}

export type CaptionStyle = "bottom-subtitle" | "top-bar" | "karaoke";

const Index = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("bottom-subtitle");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleVideoUpload = (url: string, id: string) => {
    setVideoUrl(url);
    setVideoId(id);
    setCaptions([]); // Reset captions when new video is uploaded
  };

  const handleCaptionsGenerated = (generatedCaptions: Caption[]) => {
    setCaptions(generatedCaptions);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Remotion Caption Studio
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Auto-generate captions with Hinglish support
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <VideoUploader
              onVideoUpload={handleVideoUpload}
              onCaptionsGenerated={handleCaptionsGenerated}
              videoUrl={videoUrl}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />

            {videoUrl && (
              <CaptionEditor
                captions={captions}
                setCaptions={setCaptions}
                captionStyle={captionStyle}
                setCaptionStyle={setCaptionStyle}
              />
            )}
          </div>

          {/* Right Panel - Video Preview */}
          <div className="lg:col-span-2">
            {videoUrl ? (
              <VideoPreview
                videoUrl={videoUrl}
                captions={captions}
                captionStyle={captionStyle}
              />
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center min-h-[600px] bg-card/50 border-dashed">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Upload a video to get started
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Upload your MP4 video, auto-generate captions, and customize the style.
                      Full support for Hindi, English, and Hinglish.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;