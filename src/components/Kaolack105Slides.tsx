import React from "react";
import Logo105 from "@/components/Logo105";
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { normalizeImageUrl, handleImageError } from '@/utils/imageUtils';


export default function Kaolack105Slides() {
  const [current, setCurrent] = React.useState(0);
  const { data: slides = [], isLoading, error } = useQuery({
    queryKey: ['public-slides'],
    queryFn: () => apiService.getSlides(),
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return <div className="text-center py-8">Chargement des slides...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur lors du chargement des slides</div>;
  }

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-lg">
      {slides.map((slide: any, idx: number) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-700 ${slide.bg} ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Affichage image d'arrière-plan si présente */}
          {slide.image && (
            <img
              src={normalizeImageUrl(slide.image) || ''}
              alt="bannière"
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ borderRadius: 'inherit' }}
              onError={(e) => handleImageError(e, slide.image)}
            />
          )}
          <div className="relative z-10 w-full flex flex-col items-center">
            {slide.logo && (
              <div className="mb-6 flex justify-center">
                <Logo105 size="xl" variant="white-bg" className="drop-shadow-lg" animate={true} />
              </div>
            )}
            <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2" style={{ textShadow: '0 2px 8px #000' }}>{slide.title}</h2>
            <p className="text-lg md:text-2xl text-white/90 drop-shadow mb-4" style={{ textShadow: '0 2px 8px #000' }}>{slide.subtitle}</p>
          </div>
        </div>
      ))}
      {/* Dots navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_: any, idx: number) => (
          <button
            key={slides[idx]?.id || idx}
            className={`w-3 h-3 rounded-full border-2 ${idx === current ? 'bg-white border-kaolack-gold' : 'bg-white/40 border-white/60'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
