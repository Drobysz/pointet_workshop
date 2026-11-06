"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

type CurvedCardProps = {
  index: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
};

export function CurvedCard({
  index,
  progress,
  children,
  className,
}: CurvedCardProps) {
  const relativePosition = useTransform(
    progress,
    (value) => index - value
  );

  const rotateY = useTransform(
    relativePosition,
    (value) => {
      const angle = Math.max(-64, Math.min(64, value * 18));

      return -angle;
    }
  );

  const z = useTransform(
    relativePosition,
    (value) => {
      const angle = Math.max(-64, Math.min(64, value * 18));
      const radians = (angle * Math.PI) / 180;

      return 320 * (Math.cos(radians) - 1);
    }
  );

  return (
    <motion.div
      style={{
        rotateY,
        z,
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
        flexShrink: 0,
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
