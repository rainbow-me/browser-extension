import { useEffect, useRef } from 'react';

const FRAME_DURATION = 1000 / 60; // 16.67ms, corresponds to 60fps

interface Particle {
  direction: number;
  element: HTMLElement;
  left: number;
  size: number;
  speedHorz: number;
  speedUp: number;
  spinSpeed: number;
  spinVal: number;
  top: number;
}

export const useCoolMode = ({
  imageUrl,
  disabled,
  emojis = ['🌈'],
}: {
  imageUrl?: string;
  disabled?: boolean;
  emojis?: string[];
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let cleanup: VoidFunction | undefined;
    if (!disabled && ref.current) {
      cleanup = makeElementCool(ref.current, imageUrl, emojis);
    }
    return () => {
      cleanup?.();
    };
  }, [imageUrl, disabled, emojis]);

  if (disabled) {
    return;
  }

  return ref as React.Ref<HTMLDivElement>;
};

const getContainer = () => {
  const id = '_rk_site_coolMode';
  const existingContainer = document.getElementById(id);

  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement('div');
  container.id = id;
  container.style.cssText = [
    'overflow:hidden',
    'position:fixed',
    'height:100%',
    'top:0',
    'left:0',
    'right:0',
    'bottom:0',
    'pointer-events:none',
    'z-index:10000',
  ].join(';');

  document.body.appendChild(container);

  return container;
};

const sizes = [15, 20, 25, 35, 45];
const sizeFactor = 0.75;

const createParticle = (
  container: HTMLElement,
  emojis: string[],
  mouseX: number,
  mouseY: number,
  imageUrl?: string,
): Particle => {
  const size = sizes[Math.floor(Math.random() * sizes.length)] * sizeFactor;
  const speedHorz = Math.random() * 10;
  const speedUp = Math.random() * 30;
  const spinVal = Math.random() * 360;
  const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1);
  const top = mouseY - size / 2;
  const left = mouseX - size / 2;
  const direction = Math.random() <= 0.5 ? -1 : 1;

  const particle = document.createElement('div');

  if (imageUrl) {
    particle.innerHTML = `<img src="${imageUrl}" width="${size}" height="${size}" style="border-radius: 25%">`;
  } else {
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  }

  particle.style.cssText = [
    'position:absolute',
    'will-change:transform',
    `top:${top}px`,
    `left:${left}px`,
    `transform:rotate(${spinVal}deg)`,
    `font-size:${size}px`,
  ].join(';');

  container.appendChild(particle);

  return {
    direction,
    element: particle,
    left,
    size,
    speedHorz,
    speedUp,
    spinSpeed,
    spinVal,
    top,
  };
};

const updateParticles = (particles: Particle[], deltaTime: number) => {
  particles.forEach((p) => {
    p.left -= p.speedHorz * p.direction * deltaTime;
    p.top -= p.speedUp * deltaTime;
    p.speedUp = Math.min(p.size, p.speedUp - deltaTime);
    p.spinVal += p.spinSpeed * deltaTime;

    if (
      p.top >=
      Math.max(window.innerHeight, document.body.clientHeight) + p.size
    ) {
      p.element.remove();
      const index = particles.indexOf(p);
      if (index > -1) {
        particles.splice(index, 1);
      }
    } else {
      p.element.style.cssText = [
        'position:absolute',
        'will-change:transform',
        `top:${p.top}px`,
        `left:${p.left}px`,
        `transform:rotate(${p.spinVal}deg)`,
        `font-size:${p.size}px`,
      ].join(';');
    }
  });
};

function makeElementCool(
  element: HTMLElement,
  imageUrl?: string,
  emojis: string[] = ['🌈'],
): () => void {
  const container = getContainer();
  const particles: Particle[] = [];
  let animationFrame: number | undefined;
  let mouseX = 0;
  let mouseY = 0;
  let autoAddParticle = false;

  let lastTime: number = performance.now();
  const loop = () => {
    const now = performance.now();
    const deltaTime = (now - lastTime) / FRAME_DURATION;
    lastTime = now;

    if (autoAddParticle && particles.length < 12) {
      particles.push(
        createParticle(container, emojis, mouseX, mouseY, imageUrl),
      );
    }

    updateParticles(particles, deltaTime);
    animationFrame = requestAnimationFrame(loop);
  };
  loop();

  const isTouchInteraction =
    'ontouchstart' in window || // @ts-expect-error - property does not exist on type
    navigator.msMaxTouchPoints;

  const updateMousePosition = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    } else {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  };

  const tapHandler = (e: MouseEvent | TouchEvent) => {
    updateMousePosition(e);
    autoAddParticle = true;
    e.stopPropagation();
  };

  const rightClickHandler = (e: MouseEvent) => {
    tapHandler(e);
    setTimeout(() => {
      autoAddParticle = false;
    }, 60);
  };

  const stopAddingParticles = () => {
    autoAddParticle = false;
  };

  const tap = isTouchInteraction ? 'touchstart' : 'mousedown';
  const tapEnd = isTouchInteraction ? 'touchend' : 'mouseup';
  const move = isTouchInteraction ? 'touchmove' : 'mousemove';

  element.addEventListener(move, updateMousePosition, { passive: true });
  element.addEventListener(tap, tapHandler, { passive: true });
  element.addEventListener(tapEnd, stopAddingParticles, { passive: true });
  element.addEventListener('mouseleave', stopAddingParticles, {
    passive: true,
  });
  element.addEventListener('contextmenu', rightClickHandler, {
    passive: false,
  });

  return () => {
    stopAddingParticles();
    element.removeEventListener(move, updateMousePosition);
    element.removeEventListener(tap, tapHandler);
    element.removeEventListener(tapEnd, stopAddingParticles);
    element.removeEventListener('mouseleave', stopAddingParticles);
    element.removeEventListener('contextmenu', rightClickHandler);

    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame);
        clearInterval(interval);
      }
    }, 500);
  };
}
