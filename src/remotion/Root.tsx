import { Composition } from "remotion";
import { VideoComposition } from "./VideoComposition";
import type { Caption, CaptionStyle } from "@/pages/Index";

interface VideoCompositionInputProps {
  videoUrl: string;
  captions: Caption[];
  captionStyle: CaptionStyle;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoWithCaptions"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoUrl: "",
          captions: [],
          captionStyle: "bottom-subtitle",
        }}
      />
    </>
  );
};
