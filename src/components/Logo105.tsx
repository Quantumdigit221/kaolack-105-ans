import React from "react";
import { cn } from "@/lib/utils";
import logo105ans from "@/assets/logo-105-ans.jpeg";

interface Logo105Props {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "default" | "white-bg" | "rounded" | "shadow";
  animate?: boolean; // Ajout pour l'animation
}

const Logo105: React.FC<Logo105Props> = ({ 
  className, 
  size = "md", 
  showText = false, 
  variant = "default",
  animate = false
}) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto", 
    lg: "h-16 w-auto",
    xl: "h-20 w-auto"
  };

  const variantClasses = {
    default: "",
    "white-bg": "bg-white p-1",
    rounded: "rounded-lg",
    shadow: "shadow-md"
  };

  const logoClasses = cn(
    "object-contain transition-transform hover:scale-105",
    sizeClasses[size],
    variantClasses[variant],
    animate && "animate-spin-slow",
    className
  );

  return (
    <div className="flex items-center gap-2">
      <img 
        src={logo105ans} 
        alt="Logo 105 ans de Kaolack" 
        className={logoClasses}
      />
      {showText && (
        <div className="text-sm font-semibold text-primary">
          <div>105 ans</div>
          <div>de Kaolack</div>
        </div>
      )}
    </div>
  );
};

export default Logo105;