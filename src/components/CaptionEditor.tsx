import { useState, useRef, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X, Search } from "lucide-react";
import type { Caption } from "@/pages/Index";
import {
  CAPTION_TEMPLATES,
  type CaptionStyle,
} from "@/lib/captionTemplates";
import { CaptionStyleOverlay } from "@/components/CaptionStyleOverlay";
import { useUpdateCaptionsMutation } from "@/services/api";
import { cn } from "@/lib/utils";

interface CaptionEditorProps {
  captions: Caption[];
  setCaptions: (captions: Caption[]) => void;
  captionStyle: CaptionStyle;
  setCaptionStyle: (style: CaptionStyle) => void;
  videoId?: string;
}

const CaptionEditor = ({
  captions,
  setCaptions,
  captionStyle,
  setCaptionStyle,
  videoId,
}: CaptionEditorProps) => {
  const [updateCaptions] = useUpdateCaptionsMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<"templates" | "timeline">("templates");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CAPTION_TEMPLATES;
    return CAPTION_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (caption: Caption) => {
    setEditingId(caption.id);
    setDraftText(caption.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftText("");
  };

  const saveEditing = async () => {
    if (!editingId) return;

    const nextText = draftText.trim();
    if (!nextText) {
      cancelEditing();
      return;
    }

    const nextCaptions = captions.map((caption) =>
      caption.id === editingId ? { ...caption, text: nextText } : caption
    );

    setCaptions(nextCaptions);
    setEditingId(null);
    setDraftText("");

    if (videoId) {
      try {
        await updateCaptions({ videoId, captions: nextCaptions }).unwrap();
      } catch (error) {
        console.warn("Failed to persist caption edit:", error);
      }
    }
  };

  return (
    <Card className="p-5 space-y-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div>
        <h2 className="text-lg font-semibold mb-1">Captions</h2>
        <p className="text-sm text-muted-foreground">
          Pick a Kalakar-style template, then edit your timeline
        </p>
      </div>

      <div className="flex gap-1 border-b border-border/60">
        {(
          [
            ["templates", "Templates"],
            ["timeline", "Timeline"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors relative",
              panel === id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {id === "timeline" && captions.length > 0 ? (
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                {captions.length}
              </span>
            ) : null}
            {panel === id ? (
              <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-emerald-400" />
            ) : null}
          </button>
        ))}
      </div>

      {panel === "templates" ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a template"
              className="h-9 pl-8 text-sm"
            />
          </div>

          <ScrollArea className="h-[420px] pr-2">
            <div className="space-y-3">
              {filteredTemplates.map((template) => {
                const selected = captionStyle === template.id ||
                  (template.id === "classic" && captionStyle === "bottom-subtitle");

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setCaptionStyle(template.id)}
                    className={cn(
                      "w-full text-left rounded-xl border overflow-hidden transition-all",
                      selected
                        ? "border-emerald-400/80 ring-1 ring-emerald-400/40"
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                      <span className="text-sm font-semibold">{template.name}</span>
                      {template.isNew ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                          New
                        </span>
                      ) : null}
                    </div>

                    <div className="mx-2 mb-2 rounded-lg bg-black min-h-[88px] flex items-center justify-center px-3 py-4 overflow-hidden">
                      <CaptionStyleOverlay
                        text={template.sampleText}
                        styleId={template.id}
                        progress={0.55}
                        preview
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 px-3 pb-2.5">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}

              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No templates match “{query}”
                </p>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="space-y-3">
          {captions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Generate captions to edit the timeline.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Caption Timeline</h3>
                <span className="text-xs text-muted-foreground">
                  {captions.length} segments
                </span>
              </div>

              <ScrollArea className="h-[420px] rounded-lg border border-border/50 p-3">
                <div className="space-y-2">
                  {captions.map((caption) => {
                    const isEditing = editingId === caption.id;

                    return (
                      <div
                        key={caption.id}
                        className="group relative p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors font-hinglish"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            {caption.start.toFixed(2)}s - {caption.end.toFixed(2)}s
                          </div>

                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => startEditing(caption)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                              aria-label="Edit caption"
                              title="Edit caption"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              ref={inputRef}
                              value={draftText}
                              onChange={(e) => setDraftText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveEditing();
                                }
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  cancelEditing();
                                }
                              }}
                              className="h-8 text-sm font-hinglish"
                            />
                            <button
                              type="button"
                              onClick={saveEditing}
                              className="p-1.5 rounded-md text-green-500 hover:bg-green-500/10"
                              aria-label="Save caption"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary"
                              aria-label="Cancel edit"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm pr-6">{caption.text}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default CaptionEditor;
