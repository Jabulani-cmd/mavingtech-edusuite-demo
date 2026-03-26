// @ts-nocheck
import { useState, useEffect, forwardRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type CarouselImage = {
  id: string;
  image_url: string;
  display_order: number;
};

const HeroCarousel = forwardRef<HTMLElement>(function HeroCarousel(_props, ref) {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("carousel_images")
      .select("id, image_url, display_order")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setImages(data);
        }
      });
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  const goTo = (index: number) => setCurrent(index);

  return (
    <section ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: "16/7", minHeight: 260 }}>
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.image_url}
          alt="Gifford High School"
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? "bg-accent w-6" : "bg-primary-foreground/50 w-2.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
});

export default HeroCarousel;
