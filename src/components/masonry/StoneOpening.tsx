import type { CSSProperties, ReactNode } from "react";
import { StoneCourse } from "@/components/masonry/StoneWall";
import type { Focus } from "@/lib/photoFocus";

/**
 * A photograph set into a dry-stone wall like a window: a lintel course above, a sill below, and the
 * picture itself uncut by joints. Faces stay clear because the photo has a measured focal point.
 */
export default function StoneOpening({
  src,
  alt = "",
  focus,
  seed = 11,
  className = "",
  photoClassName = "h-[300px] sm:h-[46vh]",
  lintel = "h-12 sm:h-20",
  sill = "h-4 sm:h-7",
  children,
}: {
  src: string;
  alt?: string;
  focus: Focus;
  seed?: number;
  className?: string;
  /** Sets the height of the window. */
  photoClassName?: string;
  lintel?: string;
  sill?: string;
  children?: ReactNode;
}) {
  const vars = { "--pos-d": focus.d, "--pos-m": focus.m ?? focus.d } as CSSProperties;
  return (
    <div className={`granite flex flex-col bg-shadow ${className}`} style={vars}>
      <StoneCourse heights={[58, 42]} seed={seed} lay={0} className={`shrink-0 ${lintel}`} />
      <div className="relative flex-1">
        <div className={`photo-rise relative ${photoClassName}`}>
          <img
            src={src}
            alt={alt}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover [object-position:var(--pos-m)] md:[object-position:var(--pos-d)]"
          />
        </div>
        {children}
      </div>
      <StoneCourse heights={[100]} seed={seed + 5} lay={1} className={`shrink-0 ${sill}`} />
    </div>
  );
}
