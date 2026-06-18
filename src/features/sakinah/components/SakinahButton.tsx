import React, { type ButtonHTMLAttributes } from 'react';

export interface SakinahButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SakinahButton: React.FC<SakinahButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = true,
  size = 'md',
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles = "sk-btn";
  
  const sizeStyles = {
    sm: "sk-btn-sm",
    md: "",
    lg: "text-[16px] py-[18px]", // reference mostly uses default and sm
  };

  // Map our generic variants to the specific reference UI classes
  const variantStyles = {
    primary: "sk-btn-gold",
    secondary: "sk-btn-ghost border-[var(--sk-gold)] text-[var(--sk-gold)]", 
    danger: "sk-btn-ghost border-[rgba(201,138,138,0.3)] text-[#C98A8A] hover:bg-[rgba(201,138,138,0.1)]",
    ghost: "sk-btn-ghost",
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto px-8";

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
