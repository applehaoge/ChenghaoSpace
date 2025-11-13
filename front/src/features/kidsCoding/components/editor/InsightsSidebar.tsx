import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Maximize2, ChevronUp, ChevronDown, MonitorPlay } from "lucide-react";
import clsx from "clsx";
import {
  INSIGHTS_PANEL_COLLAPSED_WIDTH,
  INSIGHTS_PANEL_WIDTH,
} from "@/features/kidsCoding/constants/editorLayout";
import { AssistantChatPanel } from "./AssistantChatPanel";
import { VisualizationViewer } from "@/features/kidsCoding/components/visualization/VisualizationViewer";
import type { VisualizationFrame } from "@/features/kidsCoding/types/visualization";

interface InsightsSidebarProps {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  visualizationFrame?: VisualizationFrame;
}

const CARD_BASE =
  "flex flex-1 min-h-0 flex-col overflow-hidden rounded-3xl backdrop-blur-md transition-colors px-4 py-3";

export function InsightsSidebar({ isDark, isCollapsed, onToggle, visualizationFrame }: InsightsSidebarProps) {
  const [showVisualization, setShowVisualization] = useState(true);

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isCollapsed ? 0.85 : 1,
        scale: isCollapsed ? 0.98 : 1,
      }}
      transition={{ duration: 0.4 }}
      className={clsx(
        "relative flex min-h-0 shrink-0 flex-col overflow-hidden rounded-3xl border shadow-xl backdrop-blur-md transition-colors duration-300",
        isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-blue-200",
      )}
      style={{ width: isCollapsed ? INSIGHTS_PANEL_COLLAPSED_WIDTH : INSIGHTS_PANEL_WIDTH }}
    >
      <CollapseHandle isDark={isDark} isCollapsed={isCollapsed} onToggle={onToggle} />

      <motion.section
        aria-hidden={isCollapsed}
        initial={false}
        animate={{ opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{
          pointerEvents: isCollapsed ? "none" : "auto",
          visibility: isCollapsed ? "hidden" : "visible",
        }}
        className={clsx(
          CARD_BASE,
          isDark
            ? "bg-gradient-to-b from-blue-900/60 via-blue-900/30 to-gray-900/70 border-blue-700/40 text-gray-100"
            : "bg-gradient-to-b from-blue-50/90 via-indigo-50/70 to-white border-blue-100 text-slate-800",
        )}
      >
        <header className="flex items-center justify-between text-sm font-semibold">
          <span
            className={clsx(
              "inline-flex items-center gap-2 transition-opacity",
              showVisualization ? "opacity-100" : "opacity-40",
              )}
            >
              <MonitorPlay size={14} />
              可视化演示
            </span>
            <div className="flex items-center gap-3 text-xs font-medium">
              <button
                type="button"
                onClick={() => setShowVisualization(prev => !prev)}
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors",
                  isDark ? "bg-blue-900/60 text-blue-100 hover:bg-blue-800/70" : "bg-blue-100 text-blue-700 hover:bg-blue-200",
                )}
              >
                {showVisualization ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showVisualization ? "收起" : "展开"}
              </button>
              <button
                type="button"
                className={clsx(
                  "flex items-center gap-1 rounded-full px-3 py-1 transition-colors",
                  isDark ? "bg-blue-900/60 text-blue-100 hover:bg-blue-800/70" : "bg-blue-100 text-blue-700 hover:bg-blue-200",
                )}
              >
                <Maximize2 size={14} />
                全屏
              </button>
            </div>
          </header>

          <div className="mt-4 flex flex-1 flex-col gap-4 overflow-hidden">
            <motion.div
              initial={false}
              animate={{
                opacity: showVisualization ? 1 : 0,
                filter: showVisualization ? "blur(0px)" : "blur(2px)",
              }}
              transition={{ duration: 0.4 }}
              style={{
                maxHeight: showVisualization ? 260 : 0,
                pointerEvents: showVisualization ? "auto" : "none",
              }}
              className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            >
              <VisualizationViewer frame={visualizationFrame} isDark={isDark} />
            </motion.div>

            <AssistantChatPanel isDark={isDark} />
          </div>
        </motion.section>
    </motion.div>
  );
}

function CollapseHandle({
  isDark,
  isCollapsed,
  onToggle,
}: {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const buttonColors = isDark
    ? "bg-gray-900/85 text-blue-200 border-blue-500/30 hover:bg-gray-800"
    : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50";

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? "展开洞察面板" : "收起洞察面板"}
        aria-expanded={!isCollapsed}
        className={clsx(
          "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition-colors",
          isCollapsed ? "-left-3" : "-left-5",
          buttonColors,
        )}
      >
        <span
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-full",
            isDark ? "bg-blue-800/40" : "bg-blue-100",
          )}
        >
          {isCollapsed ? <ArrowLeft size={15} strokeWidth={2.4} /> : <ArrowRight size={15} strokeWidth={2.4} />}
        </span>
      </button>
      <div
        className={clsx(
          "absolute inset-y-4 -left-0.5 w-px rounded-full transition-opacity duration-200",
          isDark ? "bg-blue-400/60" : "bg-blue-500/60",
          isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
    </>
  );
}

