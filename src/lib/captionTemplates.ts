export type CaptionStyle =
  | "classic"
  | "bottom-subtitle"
  | "top-bar"
  | "karaoke"
  | "kathmandu"
  | "dhaka"
  | "mumbai"
  | "welcome";

export type CaptionTemplateTag = "Bold" | "Shadow" | "Glow" | "Boxed" | "Mixed";

export interface CaptionTemplate {
  id: CaptionStyle;
  name: string;
  description: string;
  previewLines: string[];
  highlightWordIndex: number;
  tags: CaptionTemplateTag[];
  isNew?: boolean;
  /** Sample used only in gallery cards */
  sampleText: string;
}

/** Normalize legacy ids */
export function normalizeCaptionStyle(style: CaptionStyle | string): CaptionStyle {
  if (style === "bottom-subtitle") return "classic";
  return (style as CaptionStyle) || "classic";
}

export const CAPTION_TEMPLATES: CaptionTemplate[] = [
  {
    id: "kathmandu",
    name: "Kathmandu",
    description: "Chunky stacked lowercase with yellow word pop",
    previewLines: ["the quick", "brown fox", "jumps"],
    highlightWordIndex: 1,
    tags: ["Bold", "Shadow"],
    isNew: true,
    sampleText: "the quick brown fox jumps",
  },
  {
    id: "dhaka",
    name: "Dhaka",
    description: "Tall uppercase with neon yellow accent",
    previewLines: ["THE QUICK BROWN"],
    highlightWordIndex: 2,
    tags: ["Bold", "Glow"],
    isNew: true,
    sampleText: "THE QUICK BROWN FOX",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    description: "Bold white captions with cyan word hit",
    previewLines: ["watch this", "moment"],
    highlightWordIndex: 1,
    tags: ["Bold", "Shadow"],
    sampleText: "watch this moment",
  },
  {
    id: "welcome",
    name: "Welcome",
    description: "Script intro + oversized accent word",
    previewLines: ["Hello and to", "WELCOME"],
    highlightWordIndex: 1,
    tags: ["Mixed", "Bold"],
    isNew: true,
    sampleText: "Hello and welcome",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Clean boxed bottom subtitles",
    previewLines: ["Your caption text"],
    highlightWordIndex: -1,
    tags: ["Boxed", "Shadow"],
    sampleText: "Your caption text here",
  },
  {
    id: "top-bar",
    name: "Top Bar",
    description: "News-style full-width top banner",
    previewLines: ["Breaking · caption line"],
    highlightWordIndex: -1,
    tags: ["Boxed"],
    sampleText: "Breaking news caption",
  },
  {
    id: "karaoke",
    name: "Karaoke",
    description: "Progress fill as words play",
    previewLines: ["Sing along captions"],
    highlightWordIndex: -1,
    tags: ["Boxed", "Glow"],
    sampleText: "Sing along captions",
  },
];

export function getCaptionTemplate(style: CaptionStyle | string): CaptionTemplate {
  const id = normalizeCaptionStyle(style);
  return (
    CAPTION_TEMPLATES.find((t) => t.id === id) ||
    CAPTION_TEMPLATES.find((t) => t.id === "classic")!
  );
}

export function splitCaptionWords(text: string): string[] {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Active word index from progress 0..1 within a caption cue */
export function getActiveWordIndex(wordCount: number, progress: number): number {
  if (wordCount <= 0) return -1;
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(wordCount - 1, Math.floor(p * wordCount));
}

export function getTemplateAccent(style: CaptionStyle | string): string {
  switch (normalizeCaptionStyle(style)) {
    case "kathmandu":
      return "#f5e642";
    case "dhaka":
      return "#ffe566";
    case "mumbai":
      return "#38bdf8";
    case "welcome":
      return "#ef4444";
    case "karaoke":
      return "#38bdf8";
    default:
      return "#ffffff";
  }
}
