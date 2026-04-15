'use client';

import { useEffect, useRef } from 'react';

export function SportsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sports = [
    { name: 'Football' },
    { name: 'Basketball' },
    { name: 'Baseball' },
    { name: 'Softball' },
    { name: 'Soccer' },
    { name: 'Track & Field' },
    { name: 'Swimming' },
    { name: 'Tennis' },
    { name: 'Volleyball' },
    { name: 'Lacrosse' },
    { name: 'Wrestling' },
    { name: 'Golf' },
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let position = 0;
    const speed = 0.20; // pixels per frame (50% slower)
    
    const animate = () => {
      position -= speed;
      
      // Get the width of one set of items
      const firstSet = scrollContainer.firstElementChild as HTMLElement;
      if (firstSet) {
        const setWidth = firstSet.offsetWidth + 24; // 24px is the gap
        
        // Reset position when first set is completely off screen
        if (Math.abs(position) >= setWidth) {
          position = 0;
        }
        
        scrollContainer.style.transform = `translateX(${position}px)`;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Sports. One Platform.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Supporting athletes across all major sports
          </p>
        </div>
        
        {/* Scrolling Container */}
        <div className="relative w-full overflow-hidden">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-linear-to-r from-gray-50 dark:from-gray-900/50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-linear-to-l from-gray-50 dark:from-gray-900/50 to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling Track */}
          <div 
            ref={scrollRef}
            className="flex gap-6 will-change-transform"
            style={{ width: 'max-content' }}
          >
            {/* First Set */}
            <div className="flex gap-4 sm:gap-6">
              {sports.map((sport, index) => (
                <div
                  key={`first-${index}`}
                  className="flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white dark:bg-gray-800 rounded-lg border border-[#01ae79]/20 dark:border-[#01ae79]/30 shadow-sm"
                >
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide whitespace-nowrap">
                    {sport.name}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Duplicate Set for Seamless Loop */}
            <div className="flex gap-4 sm:gap-6">
              {sports.map((sport, index) => (
                <div
                  key={`second-${index}`}
                  className="flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white dark:bg-gray-800 rounded-lg border border-[#01ae79]/20 dark:border-[#01ae79]/30 shadow-sm"
                >
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide whitespace-nowrap">
                    {sport.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
