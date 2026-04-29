import { MemoryRouter } from 'react-router-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HeroCarousel from './HeroCarousel';

const renderHero = () =>
  render(
    <MemoryRouter>
      <HeroCarousel
        title="Welcome to IICT Library"
        subtitle="Search, borrow, and manage academic resources digitally."
        actions={[{ to: '/catalog', label: 'Search Books' }]}
      />
    </MemoryRouter>
  );

describe('HeroCarousel', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders slides, controls, and advances on the timer', () => {
    vi.useFakeTimers();
    renderHero();

    expect(screen.getByText('Welcome to IICT Library')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show slide 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument();
    expect(screen.getByAltText('Students reading in the IICT library')).toHaveClass('opacity-100');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByAltText('Digital catalog search desk')).toHaveClass('opacity-100');
  });
});
