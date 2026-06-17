import React, { type HTMLAttributes } from 'react';

export interface SakinahCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const SakinahCard: React.FC<SakinahCardProps> = ({
  children,
  className = '',
  padding = 'md',
  glow = false,
  ...props
}) => {
  const baseStyles = "bg-[#111826] border border-[rgba(255,255,255,0.06)] rounded-[22px]";
  const glowStyles = glow ? "shadow-[0_0_15px_rgba(212,168,83,0.15)] border-[rgba(212,168,83,0.2)]" : "";
  
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
