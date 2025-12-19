import React from 'react';
import styled from 'styled-components';

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: #7c3aed;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 9999;
  transition: top 0.3s;

  &:focus {
    top: 6px;
  }
`;

const ScreenReaderText = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

export const SkipToContent = () => (
  <SkipLink href="#main-content">Skip to main content</SkipLink>
);

export const VisuallyHidden = ({ children }) => (
  <ScreenReaderText>{children}</ScreenReaderText>
);

export const A11yButton = ({ children, ariaLabel, ...props }) => (
  <button aria-label={ariaLabel} {...props}>
    {children}
  </button>
);

export const A11yImage = ({ src, alt, ...props }) => (
  <img src={src} alt={alt} {...props} />
);

// Hook for keyboard navigation
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
};

// Hook for focus management
export const useFocusManagement = () => {
  const focusableElements = React.useRef([]);
  const firstFocusableElement = React.useRef(null);
  const lastFocusableElement = React.useRef(null);

  const getFocusableElements = (container) => {
    const elements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    return Array.from(elements).filter(el => !el.hasAttribute('disabled'));
  };

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement.current) {
        lastFocusableElement.current.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement.current) {
        firstFocusableElement.current.focus();
        e.preventDefault();
      }
    }
  };

  return {
    getFocusableElements,
    handleTabKey,
    focusableElements,
    firstFocusableElement,
    lastFocusableElement
  };
};

// ARIA live region for announcements
export const AriaLiveRegion = ({ message, politeness = 'polite' }) => (
  <div 
    aria-live={politeness} 
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);