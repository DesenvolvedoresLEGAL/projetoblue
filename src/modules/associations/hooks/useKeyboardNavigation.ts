
import { useEffect, RefObject } from 'react';

interface UseKeyboardNavigationProps {
  onEscape?: () => void;
  onEnter?: () => void;
  containerRef?: RefObject<HTMLElement>;
  isEnabled?: boolean;
}

export const useKeyboardNavigation = ({
  onEscape,
  onEnter,
  containerRef,
  isEnabled = true
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInContainer = containerRef?.current?.contains(target) ?? true;
      
      if (!isInContainer) return;

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          if (onEnter && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            onEnter();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter, containerRef, isEnabled]);
};
