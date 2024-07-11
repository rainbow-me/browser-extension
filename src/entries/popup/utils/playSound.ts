import CorrectSeedQuiz from 'static/assets/audio/correct_seed_quiz.mp3';
import IncorrectSeedQuiz from 'static/assets/audio/incorrect_seed_quiz.mp3';
import LockSound from 'static/assets/audio/ui_lock.mp3';
import UnlockSound from 'static/assets/audio/ui_unlock.mp3';
import SendSound from 'static/assets/audio/woosh.mp3';
import { soundStore } from '~/core/state/sound';
import { logger } from '~/logger';

const SOUNDS = {
  CorrectSeedQuiz,
  IncorrectSeedQuiz,
  LockSound,
  SendSound,
  UnlockSound,
};

export default function playSound(sound: keyof typeof SOUNDS) {
  const { soundsEnabled } = soundStore.getState();
  if (soundsEnabled) {
    new Audio(SOUNDS[sound]).play().catch((e) => {
      logger.warn(`Failed to play sound ${sound}`, e);
    });
  }
}
