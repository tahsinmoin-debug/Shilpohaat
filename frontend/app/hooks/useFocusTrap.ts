import { useEffect, RefObject } from 'react';

/**
 * Custom hook to trap focus within a container (useful for modals)
 * @param isActive - Whether the focus trap should be active
 * @param containerRef - Reference to the container element
 */
export function useFocusTrap(
  isActive: boolean,
  containerRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements within the container
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Handle Tab key navigation
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Add event listener
    container.addEventListener('keydown', handleTab);

    // Focus the first element when trap activates
    firstElement?.focus();

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isActive, containerRef]);
}
