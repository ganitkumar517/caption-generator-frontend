import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@/pages/Index";
import type { CaptionStyle } from "@/lib/captionTemplates";
import { CaptionStyleOverlay } from "@/components/CaptionStyleOverlay";

export interface VideoCompositionProps {
  videoUrl?: string;
  captions?: Caption[];
  captionStyle?: CaptionStyle;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  videoUrl = "",
  captions = [],
  captionStyle = "kathmandu",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const currentCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime <= caption.end
  );

  const progress = currentCaption
    ? (currentTime - currentCaption.start) /
      Math.max(0.001, currentCaption.end - currentCaption.start)
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill>
        <Video src={videoUrl} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      <AbsoluteFill>
        {currentCaption ? (
          <CaptionStyleOverlay
            text={currentCaption.text}
            styleId={captionStyle}
            progress={progress}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
