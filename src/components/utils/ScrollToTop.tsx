import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    // Log for debugging
    console.log(`Scrolled to top for path: ${pathname}`);
  }, [pathname]);

  return null;
}
