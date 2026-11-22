import StoneOpening from "@/components/masonry/StoneOpening";
import type { Focus } from "@/lib/photoFocus";

interface PageHeroProps {
  /** Kept for compatibility. Labels above a heading are not part of this design system, so it is not rendered. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
  /** Where the faces sit in the photo, so the crop never cuts off heads. */
  focus?: Focus;
}

/** Page opener: the page photograph set into the wall like a window, the title on a navy lintel, a chevron band below. */
export default function PageHero({ title, subtitle, image, focus = { d: "50% 35%" } }: PageHeroProps) {
  const seed = Array.from(title).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  return (
    <section>
      <StoneOpening
        src={image}
        focus={focus}
        seed={seed}
        photoClassName="h-[220px] sm:h-[38vh] sm:min-h-[300px] lg:h-[clamp(300px,40vh,460px)]"
        lintel="h-10 sm:h-14"
        sill="h-3 sm:h-4"
      >
        <div className="relative z-10 mx-auto bg-navy px-5 py-6 text-lit shadow-[0_18px_40px_-18px_hsl(220_25%_6%/0.75)] sm:-mt-10 sm:w-[calc(100%-4rem)] sm:max-w-[1336px] sm:px-8 sm:py-7 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10 lg:px-12 lg:py-8">
          <h1 className={`text-4xl font-extrabold leading-[1.05] md:text-5xl ${subtitle ? "lg:col-span-7" : "lg:col-span-12"} lg:text-6xl`}>{title}</h1>
          {subtitle && <p className="mt-4 max-w-xl text-base leading-relaxed text-lit/85 md:text-lg lg:col-span-5 lg:mt-0">{subtitle}</p>}
        </div>
      </StoneOpening>
      <div className="chevron-band chevron-band-lg" aria-hidden="true" />
    </section>
  );
}
