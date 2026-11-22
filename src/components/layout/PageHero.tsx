import StoneWall from "@/components/masonry/StoneWall";

interface PageHeroProps {
  /** Kept for compatibility. Labels above a heading are not part of this design system, so it is not rendered. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
}

/** Page opener: the page's photograph laid through coursed stone, the title on a navy lintel, a chevron band below. */
export default function PageHero({ title, subtitle, image }: PageHeroProps) {
  const seed = Array.from(title).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  return (
    <section className="granite bg-shadow">
      <div className="relative">
        <StoneWall
          src={image}
          alt=""
          seed={seed}
          position="center 40%"
          phonePosition="55% 40%"
          heights={[18, 22, 17, 23, 20]}
          className="h-[260px] w-full sm:h-[46vh] sm:min-h-[380px]"
        />
        <div className="relative z-10 bg-navy px-5 pb-7 pt-6 text-lit shadow-[0_-18px_40px_-20px_hsl(220_25%_6%/0.7)] sm:absolute sm:bottom-0 sm:left-0 sm:max-w-[34rem] sm:px-8 sm:pb-9 sm:pt-8 lg:max-w-[44rem] lg:px-12 lg:pb-11 lg:pt-10">
          <h1 className="text-4xl font-extrabold leading-[1.05] md:text-5xl lg:text-6xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-xl text-base leading-relaxed text-lit/85 md:text-lg">{subtitle}</p>}
        </div>
      </div>
      <div className="chevron-band chevron-band-lg" aria-hidden="true" />
    </section>
  );
}
