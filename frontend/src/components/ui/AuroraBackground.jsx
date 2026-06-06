import React from "react";
import { cn } from "../../lib/utils";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col min-h-screen items-center justify-center bg-zinc-950 text-slate-100 transition-colors overflow-hidden w-full",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            `
            [--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.05)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.3)_7%,transparent_10%,transparent_12%,rgba(0,0,0,0.3)_16%)]
            [--aurora:repeating-linear-gradient(100deg,#1e3a8a_10%,#1d4ed8_15%,#3b82f6_20%,#1e40af_25%,#0f172a_30%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[24px] opacity-35
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] 
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            absolute -inset-[10px] will-change-transform`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        />
      </div>
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
