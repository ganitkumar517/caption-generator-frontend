import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption, CaptionStyle } from "@/pages/Index";

export interface VideoCompositionProps {
  videoUrl?: string;
  captions?: Caption[];
  captionStyle?: CaptionStyle;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  videoUrl = "",
  captions = [],
  captionStyle = "bottom-subtitle",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find the current caption based on time
  const currentCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime <= caption.end
  );

  const renderCaption = () => {
    if (!currentCaption) return null;

    const baseStyle = {
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', 'Inter', sans-serif",
      color: "white",
      textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
      padding: "12px 24px",
      fontSize: "32px",
      fontWeight: 600,
      lineHeight: 1.4,
    };

    switch (captionStyle) {
      case "bottom-subtitle":
        return (
          <div
            style={{
              position: "absolute",
              bottom: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              ...baseStyle,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              borderRadius: "8px",
              maxWidth: "80%",
              textAlign: "center",
            }}
          >
            {currentCaption.text}
          </div>
        );

      case "top-bar":
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              ...baseStyle,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              padding: "20px 40px",
              textAlign: "center",
              borderBottom: "3px solid rgba(56, 189, 248, 0.8)",
            }}
          >
            {currentCaption.text}
          </div>
        );

      case "karaoke":
        const progress = ((currentTime - currentCaption.start) / (currentCaption.end - currentCaption.start)) * 100;
        return (
          <div
            style={{
              position: "absolute",
              bottom: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              ...baseStyle,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              borderRadius: "8px",
              maxWidth: "80%",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: `${progress}%`,
                backgroundColor: "rgba(56, 189, 248, 0.3)",
                transition: "width 0.1s linear",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>
              {currentCaption.text}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill>
        <Video src={videoUrl} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      <AbsoluteFill>{renderCaption()}</AbsoluteFill>
    </AbsoluteFill>
  );
};
