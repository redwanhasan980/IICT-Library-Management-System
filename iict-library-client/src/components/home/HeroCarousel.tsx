import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
    src: '/images/library-hero-reading.svg',
    alt: 'Students reading in the IICT library',
  },
  {
    src: '/images/library-hero-catalog.svg',
    alt: 'Digital catalog search desk',
  },
  {
    src: '/images/library-hero-study.svg',
    alt: 'Quiet study space with open books',
  },
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
      className="relative min-h-[520px] overflow-hidden bg-library-ink"
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
      <div className="absolute inset-0 bg-gradient-to-r from-library-ink/90 via-library-ink/60 to-library-ink/20" />

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-library-gold">IICT Library</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={`${action.to}-${action.label}`}
                to={action.to}
                className={
                  action.variant === 'secondary'
                    ? 'rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20'
                    : 'rounded-full bg-library-gold px-5 py-3 text-sm font-semibold text-library-ink shadow-lg transition hover:bg-white'
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
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <div className="absolute bottom-5 right-4 z-20 flex gap-2 sm:right-8">
        <button
          type="button"
          className="rounded-full border border-white/40 bg-library-ink/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-library-ink/70"
          onClick={showPrevious}
        >
          Prev
        </button>
        <button
          type="button"
          className="rounded-full border border-white/40 bg-library-ink/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-library-ink/70"
          onClick={showNext}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;
