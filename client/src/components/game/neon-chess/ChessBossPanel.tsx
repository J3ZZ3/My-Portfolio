import { useEffect, useState } from "react";
import { Skull } from "lucide-react";

interface ChessBossPanelProps {
  line: string;
  thinking?: boolean;
  showRematch?: boolean;
  onRematch?: () => void;
}

export function ChessBossPanel({
  line,
  thinking,
  showRematch,
  onRematch,
}: ChessBossPanelProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!line) {
      setDisplayed("");
      return;
    }

    setDisplayed("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setDisplayed(line.slice(0, index));
      if (index >= line.length) clearInterval(timer);
    }, 25);

    return () => clearInterval(timer);
  }, [line]);

  return (
    <div className="w-full md:w-64 lg:w-72 shrink-0 border-2 border-pink-500/50 bg-black/80 p-4 shadow-[0_0_16px_rgba(255,20,147,0.25)]">
      <div className="flex items-center gap-2 mb-3">
        <Skull className="w-5 h-5 text-pink-500 drop-shadow-[0_0_6px_#ff1493]" />
        <span className="font-pixel text-xs text-pink-500">NULLSPAWN // BOSS</span>
      </div>
      <div className="font-terminal text-sm text-pink-200/90 min-h-[4.5rem] leading-relaxed">
        {displayed ? (
          <>
            <span className="text-pink-500/70">&gt; </span>
            {displayed}
            {thinking && displayed === line ? (
              <span className="animate-pulse text-pink-500"> _</span>
            ) : null}
          </>
        ) : (
          <span className="text-muted-foreground">&gt; NULLSPAWN awaits...</span>
        )}
      </div>
      {showRematch && onRematch ? (
        <button
          type="button"
          onClick={onRematch}
          className="mt-4 w-full py-2 font-pixel text-sm border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 transition-colors"
        >
          REMATCH
        </button>
      ) : null}
    </div>
  );
}
