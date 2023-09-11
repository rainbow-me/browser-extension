import { useEffect, useRef } from 'react';

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
    if (ref.current) {
      return makeElementCool(ref.current, disabled, imageUrl, emojis);
    }
  }, [imageUrl, disabled, emojis]);

  return ref as React.Ref<HTMLDivElement>;
};

const getContainer = () => {
  const id = '_rk_site_coolMode';
  const existingContainer = document.getElementById(id);

  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement('div');
  container.setAttribute('id', id);
  container.setAttribute(
    'style',
    [
      'overflow:hidden',
      'position:fixed',
      'height:100%',
      'top:0',
      'left:0',
      'right:0',
      'bottom:0',
      'pointer-events:none',
      'z-index:10000',
    ].join(';'),
  );

  document.body.appendChild(container);

  return container;
};

let instanceCounter = 0;

function makeElementCool(
  element: HTMLElement,
  disabled?: boolean,
  imageUrl?: string,
  emojis: string[] = ['🌈'],
): () => void {
  instanceCounter += 1;

  const sizeFactor = 0.75;
  const sizes = [15, 20, 25, 35, 45];
  const limit = 35;
  let particles: Particle[] = [];
  let autoAddParticle = false;
  let mouseX = 0;
  let mouseY = 0;
  const container = getContainer();

  function createParticle() {
    const size = sizes[Math.floor(Math.random() * sizes.length)] * sizeFactor;
    const speedHorz = Math.random() * 10;
    const speedUp = Math.random() * 25;
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

    particle.setAttribute(
      'style',
      [
        'position:absolute',
        'will-change:transform',
        `top:${top}px`,
        `left:${left}px`,
        `transform:rotate(${spinVal}deg)`,
        `font-size:${size}px`,
      ].join(';'),
    );

    container.appendChild(particle);

    particles.push({
      direction,
      element: particle,
      left,
      size,
      speedHorz,
      speedUp,
      spinSpeed,
      spinVal,
      top,
    });
  }

  function updateParticles() {
    particles.forEach((p) => {
      p.left = p.left - p.speedHorz * p.direction;
      p.top = p.top - p.speedUp;
      p.speedUp = Math.min(p.size, p.speedUp - 1);
      p.spinVal = p.spinVal + p.spinSpeed;

      if (
        p.top >=
        Math.max(window.innerHeight, document.body.clientHeight) + p.size
      ) {
        particles = particles.filter((o) => o !== p);
        p.element.remove();
      }

      p.element.setAttribute(
        'style',
        [
          'position:absolute',
          'will-change:transform',
          `top:${p.top}px`,
          `left:${p.left}px`,
          `transform:rotate(${p.spinVal}deg)`,
          `font-size:${p.size}px`,
        ].join(';'),
      );
    });
  }

  let animationFrame: number | undefined;

  function loop() {
    if (autoAddParticle && particles.length < limit) {
      createParticle();
    }

    updateParticles();
    animationFrame = requestAnimationFrame(loop);
  }

  loop();

  const isTouchInteraction =
    'ontouchstart' in window ||
    // @ts-expect-error - property does not exist on type
    navigator.msMaxTouchPoints;

  const tap = isTouchInteraction ? 'touchstart' : 'mousedown';
  const tapEnd = isTouchInteraction ? 'touchend' : 'mouseup';
  const move = isTouchInteraction ? 'touchmove' : 'mousemove';

  const updateMousePosition = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      mouseX = e.touches?.[0].clientX;
      mouseY = e.touches?.[0].clientY;
    } else {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  };

  const tapHandler = (e: MouseEvent | TouchEvent) => {
    if (disabled) return;
    updateMousePosition(e);
    autoAddParticle = true;
  };

  const disableAutoAddParticle = () => {
    autoAddParticle = false;
  };

  const handleRightClick = (e: MouseEvent) => {
    tapHandler(e);
    setTimeout(() => {
      disableAutoAddParticle();
    }, 60);
  };

  element.addEventListener(move, updateMousePosition, { passive: true });
  element.addEventListener(tap, tapHandler, { passive: true });
  element.addEventListener(tapEnd, disableAutoAddParticle, { passive: true });
  element.addEventListener('mouseleave', disableAutoAddParticle, {
    passive: true,
  });
  element.addEventListener('contextmenu', handleRightClick, { passive: true });

  return () => {
    element.removeEventListener(move, updateMousePosition);
    element.removeEventListener(tap, tapHandler);
    element.removeEventListener(tapEnd, disableAutoAddParticle);
    element.removeEventListener('mouseleave', disableAutoAddParticle);
    element.removeEventListener('contextmenu', handleRightClick);

    // Cancel animation loop once animations are done
    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame);
        clearInterval(interval);

        // Clean up container if this is the last instance
        if (instanceCounter - 1 === 0) {
          container.remove();
        }
      }
    }, 500);
  };
}
