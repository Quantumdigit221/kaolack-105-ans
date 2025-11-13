import { useState } from "react";
import { X } from "lucide-react";
import eventBannerSvg from "@/assets/event-105-banner-kaolack-brand.svg";

interface EventBannerProps {
  dismissible?: boolean;
  onDismiss?: () => void;
  href?: string;
  onClick?: () => void;
}

const EventBanner = ({
  dismissible = true,
  onDismiss,
  href = "/kaolack-105",
  onClick,
}: EventBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 py-1 shadow-lg">
      <div className="relative cursor-pointer group" onClick={handleClick}>
        {/* Infographic Banner */}
        <div className="max-w-7xl mx-auto px-4">
          <img
            src={eventBannerSvg}
            alt="Célébration des 105 ans de Kaolack"
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            style={{ maxHeight: "300px", objectFit: "cover" }}
          />
        </div>

        {/* Close Button */}
        {dismissible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Fermer la bannière"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        )}

        {/* Hover overlay indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded pointer-events-none" />
      </div>
    </div>
  );
};

export default EventBanner;
