"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface BackgroundGlowProps {
  children?: ReactNode;
  /** 发光颜色，默认暖黄 #FFF991 */
  glowColor?: string;
  /** 光晕透明度，默认 0.6 */
  opacity?: number;
  /** 光晕扩散范围，默认 70% */
  spread?: string;
  className?: string;
}

/**
 * 暖黄中心发光背景组件
 * 白色底 + radial-gradient 中心光晕，自适应分辨率
 *
 * 用法：
 * <BackgroundGlow>
 *   <YourContent />
 * </BackgroundGlow>
 */
export const BackgroundGlow = ({
  children,
  glowColor = "#FFF991",
  opacity = 0.6,
  spread = "70%",
  className,
}: BackgroundGlowProps) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-white",
        className
      )}
    >
      {/* 发光层 — 居中 radial-gradient，自动适配任意分辨率 */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${glowColor} 0%, transparent ${spread})`,
          opacity,
        }}
        aria-hidden="true"
      />

      {/* 内容层 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundGlow;
