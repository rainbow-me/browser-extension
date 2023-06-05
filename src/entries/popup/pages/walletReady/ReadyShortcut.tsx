import { useEffect, useState } from 'react';

import { Box, Separator } from '~/design-system';

import { OpenText } from './ReadyHotkeys/OpenText';
import { OptionAltPress } from './ReadyHotkeys/OptionAltPress';
import { RPress } from './ReadyHotkeys/RPress';
import { ShiftPress } from './ReadyHotkeys/ShiftPress';

export function ReadyShortcut() {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isOptionPressed, setIsOptionPressed] = useState(false);
  const [isRPressed, setIsRPressed] = useState(false);

  const [isHighlighted, setHiglighted] = useState(false);

  useEffect(() => {
    const onFocus = () => {
      setIsOptionPressed(false);
      setIsRPressed(false);
      setIsShiftPressed(false);
      setHiglighted(false);
    };
    const onBlur = () => {
      setIsOptionPressed(false);
      setIsRPressed(false);
      setIsShiftPressed(false);
      setHiglighted(!!chrome.extension.getViews({ type: 'popup' }).length);
    };
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Shift':
          setIsShiftPressed(true);
          break;
        case 'Alt':
          setIsOptionPressed(true);
          break;
        case 'r':
        case '®':
        case 'R':
          setIsRPressed(true);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Shift':
          setIsShiftPressed(false);
          break;
        case 'Alt':
          setIsOptionPressed(false);
          break;
        case 'r':
        case '®':
        case 'R':
          setIsRPressed(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <>
      <Box paddingBottom="50px">
        <Box display="flex" justifyContent="center" paddingBottom="15px">
          <OpenText
            isButtonPressed={
              isShiftPressed || isRPressed || isOptionPressed || isHighlighted
            }
          />
        </Box>
        <Box display="flex" width="full">
          <ShiftPress isShiftPressed={isShiftPressed || isHighlighted} />
          <OptionAltPress isOptionPressed={isOptionPressed || isHighlighted} />
          <RPress isRPressed={isRPressed || isHighlighted} />
        </Box>
      </Box>
      <Box style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
    </>
  );
}
