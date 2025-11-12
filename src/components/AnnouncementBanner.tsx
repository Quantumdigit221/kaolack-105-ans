import { useState } from "react";
import { X, AlertCircle, Info, CheckCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnouncementBannerProps {
  title?: string;
  message: string;
  type?: "info" | "warning" | "success" | "announcement";
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const AnnouncementBanner = ({
  title = "Annonce Importante",
  message,
  type = "announcement",
  dismissible = true,
  onDismiss,
  action,
}: AnnouncementBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getBgColor = () => {
    switch (type) {
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "announcement":
        return "bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "warning":
        return "text-orange-800";
      case "success":
        return "text-green-800";
      case "info":
        return "text-blue-800";
      case "announcement":
        return "text-foreground";
      default:
        return "text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "announcement":
        return <Bell className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className={`sticky top-0 z-40 border-b ${getBgColor()}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getIcon()}
            <div className="flex-1">
              <h3 className={`font-semibold ${getTextColor()}`}>{title}</h3>
              <p className={`text-sm ${getTextColor()} mt-1`}>{message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {action && (
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                {...(action.href ? { asChild: true } : {})}
                className="whitespace-nowrap"
              >
                {action.href ? (
                  <a href={action.href}>{action.label}</a>
                ) : (
                  action.label
                )}
              </Button>
            )}

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-black/10 rounded transition-colors"
                aria-label="Fermer l'annonce"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
