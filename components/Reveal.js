'use client';
import { useEffect, useRef, useState } from 'react';

export default function Reveal({ className = '', style, children }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`${className} reveal${on ? ' in' : ''}`} style={style}>{children}</div>;
}
