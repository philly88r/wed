import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center",
          className || ""
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            aurora-background
            pointer-events-none
            absolute -inset-[10px] opacity-50`,
              showRadialGradient &&
                `radial-mask`
            )}
          />
        </div>
        {children}
      </div>
    </main>
  );
};

export default AuroraBackground;
