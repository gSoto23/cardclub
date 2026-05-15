import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  const baseStyles = "relative inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-lg transition-all duration-300 focus:outline-none overflow-hidden group";
  
  const variants = {
    primary: "bg-brand-yellow text-brand-blue hover:scale-105 hover:shadow-[0_0_20px_rgba(255,222,0,0.5)] border border-brand-yellow",
    secondary: "bg-transparent text-brand-yellow border-2 border-brand-yellow hover:bg-brand-yellow hover:text-brand-blue hover:shadow-[0_0_15px_rgba(255,222,0,0.4)]",
    outline: "border border-white/20 text-white hover:border-brand-yellow hover:text-brand-yellow",
    ghost: "text-white/70 hover:text-brand-yellow hover:bg-white/5",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
      )}
    </button>
  );
};
