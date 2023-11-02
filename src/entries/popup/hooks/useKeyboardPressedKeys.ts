import { useEffect, useState } from 'react';

const setKeys = (key: string, value: boolean) => {
  console.log(key);
  if (['metaKey', 'ctrlKey', 'Meta'].includes(key))
    return {
      metaKey: value,
      ctrlKey: value,
      command: value,
    };
  return {
    [key]: value,
  };
};

export const useKeyboardPressedKeys = () => {
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) =>
      setPressed((p) => ({ ...p, ...setKeys(e.key, true) }));

    const onKeyup = (e: KeyboardEvent) =>
      setPressed((p) => ({ ...p, ...setKeys(e.key, false) }));

    document.addEventListener('keydown', onKeydown);
    document.addEventListener('keyup', onKeyup);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('keyup', onKeyup);
    };
  }, []);

  return pressed;
};
