import type React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  shape?: "rect" | "circle";
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = "100%",
  height = "1rem", // Default height similar to a line of text
  shape = "rect",
  className,
  ...props
}) => {
  const styles = {
    width,
    height,
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700", // Adjusted to a slightly lighter gray for better visibility against bg-muted if used
        shape === "circle" ? "rounded-full" : "rounded-md",
        className
      )}
      style={styles}
      {...props}
    />
  );
};

export { LoadingSkeleton };
