import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bot, Maximize2, ChevronUp, ChevronDown, MonitorPlay } from "lucide-react";
import clsx from "clsx";
import {
  INSIGHTS_PANEL_COLLAPSED_WIDTH,
  INSIGHTS_PANEL_WIDTH,
} from "@/features/kidsCoding/constants/editorLayout";

interface InsightsSidebarProps {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

const CARD_BASE =
  "flex flex-1 min-h-0 flex-col overflow-hidden rounded-3xl backdrop-blur-md transition-colors p-5";

export function InsightsSidebar({ isDark, isCollapsed, onToggle }: InsightsSidebarProps) {
  const [showVisualization, setShowVisualization] = useState(true);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? INSIGHTS_PANEL_COLLAPSED_WIDTH : INSIGHTS_PANEL_WIDTH,
        opacity: isCollapsed ? 0.95 : 1,
      }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={clsx(
        "relative flex min-h-0 shrink-0 flex-col overflow-hidden rounded-3xl border shadow-xl backdrop-blur-md transition-colors duration-300",
        isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-blue-200",
      )}
    >
      <CollapseHandle isDark={isDark} isCollapsed={isCollapsed} onToggle={onToggle} />

      {!isCollapsed && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
            {showVisualization && (
              <div
                className={clsx(
                  "flex h-48 items-center justify-center rounded-2xl border-2 border-dashed text-sm",
                  isDark ? "border-blue-500/40 text-blue-100" : "border-blue-300 text-blue-500",
                )}
              >
                动画演示区域
              </div>
            )}

            <div className="flex flex-1 flex-col gap-3 overflow-hidden min-h-0">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot size={16} />
                AI 编程助手
              </div>
              <div
                className={clsx(
                  "flex-1 space-y-3 overflow-y-auto rounded-2xl px-4 py-3 text-sm shadow-inner",
                  isDark ? "bg-gray-900/60 text-gray-100" : "bg-blue-50 text-slate-700",
                )}
              >
                <ChatBubble isDark={isDark} role="assistant" text="你好，我是小智，随时准备陪伴你完成挑战。" />
                <ChatBubble
                  isDark={isDark}
                  role="assistant"
                  text="收到，我会把可视化演示和 AI 助手整合后的右栏保持与编辑器等高，并让发送栏任何时候都可见。"
                />
                <ChatBubble isDark={isDark} role="user" text="帮我检查循环里有没有越界问题？" />
                <ChatBubble
                  isDark={isDark}
                  role="assistant"
                  text="第 18 行条件请改为 i &lt; items.length，我已为你高亮。"
                />
              </div>
              <form
                className="mt-auto flex items-center gap-2 text-sm"
                onSubmit={event => {
                  event.preventDefault();
                }}
              >
                <input
                  type="text"
                  placeholder="输入你的问题或需求..."
                  className={clsx(
                    "flex-1 rounded-2xl border px-4 py-2 focus:outline-none focus:ring-2",
                    isDark
                      ? "bg-gray-900/50 border-gray-700 text-gray-100 focus:ring-blue-500/80"
                      : "bg-white border-blue-200 text-slate-700 focus:ring-blue-400/80",
                  )}
                />
                <button
                  type="submit"
                  className={clsx(
                    "rounded-2xl px-4 py-2 font-medium shadow transition-colors",
                    isDark ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-500 text-white hover:bg-blue-600",
                  )}
                >
                  发送
                </button>
              </form>
            </div>
          </div>
        </motion.section>
      )}
    </motion.aside>
  );
}

function ChatBubble({ role, text, isDark }: { role: "assistant" | "user"; text: string; isDark: boolean }) {
  const isAssistant = role === "assistant";
  return (
    <div
      className={clsx("rounded-2xl px-3 py-2 text-sm", {
        "self-start bg-blue-500/20 text-blue-100": isAssistant && isDark,
        "self-start bg-blue-100 text-blue-700": isAssistant && !isDark,
        "self-end bg-gray-700 text-gray-100": !isAssistant && isDark,
        "self-end bg-white text-slate-700 shadow": !isAssistant && !isDark,
      })}
    >
      {text}
    </div>
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
