"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GreenGlowProps {
  children?: ReactNode;
  /** 发光颜色，默认 #10b981 (emerald-500) */
  glowColor?: string;
  className?: string;
}

/**
 * 绿色中心发光背景组件
 * 白色底 + 全幅 radial-gradient 绿色光晕，自适应分辨率
 *
 * 用法：
 * <GreenGlow>
 *   <YourContent />
 * </GreenGlow>
 */
export const GreenGlow = ({
  children,
  glowColor = "#10b981",
  className,
}: GreenGlowProps) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-white",
        className
      )}
    >
      {/* 发光层 — 居中 radial-gradient，100% 覆盖 */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${glowColor}, transparent)`,
          backgroundSize: "100% 100%",
        }}
        aria-hidden="true"
      />

      {/* 内容层 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GreenGlow;
