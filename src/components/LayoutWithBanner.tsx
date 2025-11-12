import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";

interface LayoutWithBannerProps {
  children: ReactNode;
  showBanner?: boolean;
  bannerTitle?: string;
  bannerMessage?: string;
  bannerType?: "info" | "warning" | "success" | "announcement";
}

export default function LayoutWithBanner({
  children,
  showBanner = true,
  bannerTitle = "🎉 Célébration des 105 ans de Kaolack",
  bannerMessage = "Rejoignez-nous pour célébrer 105 ans d'histoire, de fierté et d'avenir !",
  bannerType = "announcement",
}: LayoutWithBannerProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {showBanner && (
        <AnnouncementBanner
          title={bannerTitle}
          message={bannerMessage}
          type={bannerType}
          action={{
            label: "Découvrir",
            href: "/kaolack-105",
          }}
        />
      )}
      {children}
    </div>
  );
}
