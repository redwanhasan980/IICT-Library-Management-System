import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import heroImage1 from '../../assets/1.jpeg';
import heroImage2 from '../../assets/2.jpeg';
import heroImage3 from '../../assets/3.jpeg';
import heroImage4 from '../../assets/4.jpeg';
import heroImage5 from '../../assets/5.jpeg';
export interface HeroAction {
  to: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroCarouselProps {
  title: string;
  subtitle: string;
  actions: HeroAction[];
}

const slides: HeroSlide[] = [
  {
    src: heroImage1,
    alt: 'IICT library reading area',
  },
  {
    src: heroImage2,
    alt: 'IICT library book shelves',
  },
  {
    src: heroImage3,
    alt: 'Students studying in IICT library',
  },
  {
    src: heroImage4,
    alt: 'IICT library study rooms',
  },
  {
    src: heroImage5,
    alt: 'IICT library computer lab',
  }
];

const HeroCarousel = ({ title, subtitle, actions }: HeroCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const showPrevious = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section
      className="relative min-h-[520px] overflow-hidden border-b-2 border-library-ink bg-library-ink"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="IICT library highlights"
    >
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,28,26,0.94),rgba(26,28,26,0.72),rgba(26,28,26,0.32))]" />

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-library-gold">
            IICT Library
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-pale-cream sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-pale-cream/85">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={`${action.to}-${action.label}`}
                to={action.to}
                className={
                  action.variant === 'secondary'
                    ? 'inline-flex border-2 border-pale-cream bg-transparent px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-pale-cream shadow-[4px_4px_0_#ecddae] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pale-cream hover:text-library-ink active:translate-x-1 active:translate-y-1 active:shadow-none'
                    : 'inline-flex border-2 border-library-ink bg-library-gold px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-library-ink shadow-[4px_4px_0_#1a1c1a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pale-cream active:translate-x-1 active:translate-y-1 active:shadow-none'
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            className={`h-3 transition-all ${
              index === activeIndex ? 'w-8 bg-pale-cream' : 'w-3 bg-pale-cream/50 hover:bg-pale-cream/80'
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <div className="absolute bottom-5 right-4 z-20 flex gap-2 sm:right-8">
        <button
          type="button"
          className="border-2 border-pale-cream bg-library-ink/70 px-3 py-2 text-xs font-extrabold uppercase text-pale-cream transition hover:bg-library-ink"
          onClick={showPrevious}
        >
          Prev
        </button>

        <button
          type="button"
          className="border-2 border-pale-cream bg-library-ink/70 px-3 py-2 text-xs font-extrabold uppercase text-pale-cream transition hover:bg-library-ink"
          onClick={showNext}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;