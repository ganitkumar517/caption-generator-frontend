import type { CSSProperties } from "react";
import {
  getActiveWordIndex,
  getTemplateAccent,
  normalizeCaptionStyle,
  splitCaptionWords,
  type CaptionStyle,
} from "@/lib/captionTemplates";

interface CaptionStyleOverlayProps {
  text: string;
  styleId: CaptionStyle | string;
  /** 0..1 progress within the current caption cue */
  progress?: number;
  /** Compact mode for gallery cards */
  preview?: boolean;
}

function WordSpan({
  word,
  active,
  accent,
  glow,
  style,
}: {
  word: string;
  active: boolean;
  accent: string;
  glow?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        color: active ? accent : "#ffffff",
        textShadow: active && glow
          ? `0 0 18px ${accent}, 0 0 36px ${accent}88, 0 4px 12px rgba(0,0,0,0.85)`
          : "0 3px 10px rgba(0,0,0,0.85)",
        ...style,
      }}
    >
      {word}
    </span>
  );
}

export function CaptionStyleOverlay({
  text,
  styleId,
  progress = 0.45,
  preview = false,
}: CaptionStyleOverlayProps) {
  const style = normalizeCaptionStyle(styleId);
  const words = splitCaptionWords(text);
  const activeIdx = getActiveWordIndex(words.length, progress);
  const accent = getTemplateAccent(style);
  const scale = preview ? 0.55 : 1;

  if (words.length === 0) return null;

  if (style === "top-bar") {
    return (
      <div
        style={{
          position: preview ? "relative" : "absolute",
          top: preview ? undefined : 0,
          left: preview ? undefined : 0,
          right: preview ? undefined : 0,
          width: preview ? "100%" : undefined,
          backgroundColor: "rgba(0,0,0,0.88)",
          borderBottom: `3px solid ${accent}`,
          padding: preview ? "10px 12px" : "22px 40px",
          textAlign: "center",
          color: "#fff",
          fontFamily: "'Oswald', 'Noto Sans', sans-serif",
          fontWeight: 700,
          fontSize: preview ? 14 : 36,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
    );
  }

  if (style === "classic" || style === "bottom-subtitle") {
    return (
      <div
        style={{
          position: preview ? "relative" : "absolute",
          bottom: preview ? undefined : 80 * scale,
          left: preview ? undefined : "50%",
          transform: preview ? undefined : "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: 8,
          padding: preview ? "8px 14px" : "12px 24px",
          maxWidth: preview ? "100%" : "80%",
          textAlign: "center",
          color: "#fff",
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          fontWeight: 600,
          fontSize: preview ? 13 : 32,
          lineHeight: 1.35,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        {text}
      </div>
    );
  }

  if (style === "karaoke") {
    const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    return (
      <div
        style={{
          position: preview ? "relative" : "absolute",
          bottom: preview ? undefined : 80,
          left: preview ? undefined : "50%",
          transform: preview ? undefined : "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: 8,
          padding: preview ? "8px 14px" : "12px 24px",
          maxWidth: preview ? "100%" : "80%",
          textAlign: "center",
          overflow: "hidden",
          color: "#fff",
          fontFamily: "'Noto Sans', sans-serif",
          fontWeight: 700,
          fontSize: preview ? 13 : 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            backgroundColor: "rgba(56,189,248,0.35)",
          }}
        />
        <span style={{ position: "relative", zIndex: 1 }}>{text}</span>
      </div>
    );
  }

  if (style === "kathmandu") {
    // Stack ~2-3 words per line for that Kalakar chunky look
    const lines: string[][] = [];
    for (let i = 0; i < words.length; i += 2) {
      lines.push(words.slice(i, i + 2));
    }
    let wordOffset = 0;

    return (
      <div
        style={{
          position: preview ? "relative" : "absolute",
          bottom: preview ? undefined : 100,
          left: preview ? undefined : "50%",
          transform: preview ? undefined : "translateX(-50%)",
          textAlign: "center",
          fontFamily: "'Anton', 'Impact', 'Noto Sans', sans-serif",
          fontSize: preview ? 22 : 72,
          lineHeight: 0.95,
          letterSpacing: "0.02em",
          textTransform: "lowercase",
          maxWidth: preview ? "100%" : "90%",
        }}
      >
        {lines.map((line, li) => {
          const start = wordOffset;
          wordOffset += line.length;
          return (
            <div key={li}>
              {line.map((word, wi) => {
                const globalIdx = start + wi;
                return (
                  <span key={wi}>
                    <WordSpan
                      word={word}
                      active={globalIdx === activeIdx}
                      accent={accent}
                      style={{ marginRight: wi < line.length - 1 ? "0.28em" : 0 }}
                    />
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === "dhaka") {
    return (
      <div
        style={{
          position: preview ? "relative" : "absolute",
          bottom: preview ? undefined : 110,
          left: preview ? undefined : "50%",
          transform: preview ? undefined : "translateX(-50%)",
          textAlign: "center",
          fontFamily: "'Bebas Neue', 'Oswald', Impact, sans-serif",
          fontSize: preview ? 26 : 78,
          lineHeight: 1,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          maxWidth: preview ? "100%" : "92%",
          whiteSpace: preview ? "normal" : "nowrap",
        }}
      >
        {words.map((word, i) => (
          <span key={i}>
            <WordSpan
              word={word}
              active={i === activeIdx}
              accent={accent}
              glow
              style={{
                marginRight: i < words.length - 1 ? "0.22em" : 0,
                fontSize: i === activeIdx ? "1.08em" : "1em",
              }}
            />
          </span>
        ))}
      </div>
    );
  }

  if (style === "mumbai") {
    return (
      <div
        style={{
          position: preview ? "relative" : "absolute",
          bottom: preview ? undefined : 100,
          left: preview ? undefined : "50%",
          transform: preview ? undefined : "translateX(-50%)",
          textAlign: "center",
          fontFamily: "'Oswald', 'Noto Sans', sans-serif",
          fontWeight: 700,
          fontSize: preview ? 20 : 64,
          lineHeight: 1.05,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          maxWidth: preview ? "100%" : "88%",
        }}
      >
        {words.map((word, i) => (
          <span key={i}>
            <WordSpan
              word={word}
              active={i === activeIdx}
              accent={accent}
              style={{ marginRight: i < words.length - 1 ? "0.25em" : 0 }}
            />
          </span>
        ))}
      </div>
    );
  }

  if (style === "welcome") {
    const bigIdx = activeIdx >= 0 ? activeIdx : Math.max(0, words.length - 1);
    const big = words[bigIdx] || "";
    const lead = words.filter((_, i) => i !== bigIdx).join(" ");

    return (
      <div
        style={{
          position: preview ? "relative" : "absolute",
          bottom: preview ? undefined : 90,
          left: preview ? undefined : "50%",
          transform: preview ? undefined : "translateX(-50%)",
          textAlign: "center",
          maxWidth: preview ? "100%" : "85%",
        }}
      >
        {lead ? (
          <div
            style={{
              fontFamily: "'Pacifico', cursive",
              color: "#fff",
              fontSize: preview ? 14 : 36,
              marginBottom: preview ? 4 : 8,
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
            }}
          >
            {lead}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: "'Anton', Impact, sans-serif",
            color: accent,
            fontSize: preview ? 28 : 96,
            lineHeight: 0.95,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            textShadow: `0 4px 0 #7f1d1d, 0 8px 24px rgba(0,0,0,0.7)`,
          }}
        >
          {big}
        </div>
      </div>
    );
  }

  return null;
}
