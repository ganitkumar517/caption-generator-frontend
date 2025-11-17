import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Caption, CaptionStyle } from "@/pages/Index";

interface CaptionEditorProps {
  captions: Caption[];
  setCaptions: (captions: Caption[]) => void;
  captionStyle: CaptionStyle;
  setCaptionStyle: (style: CaptionStyle) => void;
}

const CaptionEditor = ({
  captions,
  captionStyle,
  setCaptionStyle,
}: CaptionEditorProps) => {
  const styleDescriptions = {
    "bottom-subtitle": "Classic bottom-centered subtitles",
    "top-bar": "News-style top bar captions",
    karaoke: "Karaoke-style highlighting",
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div>
        <h2 className="text-lg font-semibold mb-2">Caption Styles</h2>
        <p className="text-sm text-muted-foreground">
          Choose how captions appear on your video
        </p>
      </div>

      <RadioGroup value={captionStyle} onValueChange={(value) => setCaptionStyle(value as CaptionStyle)}>
        <div className="space-y-3">
          {(Object.keys(styleDescriptions) as CaptionStyle[]).map((style) => (
            <div
              key={style}
              className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
              onClick={() => setCaptionStyle(style)}
            >
              <RadioGroupItem value={style} id={style} className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor={style} className="cursor-pointer font-medium capitalize">
                  {style.replace("-", " ")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {styleDescriptions[style]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>

      {captions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Caption Timeline</h3>
            <span className="text-sm text-muted-foreground">
              {captions.length} segments
            </span>
          </div>
          
          <ScrollArea className="h-[300px] rounded-lg border border-border/50 p-3">
            <div className="space-y-2">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className="p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors font-hinglish"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {caption.start.toFixed(2)}s - {caption.end.toFixed(2)}s
                  </div>
                  <div className="text-sm">{caption.text}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
};

export default CaptionEditor;
