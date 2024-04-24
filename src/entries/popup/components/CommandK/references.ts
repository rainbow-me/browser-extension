import { i18n } from '~/core/languages';

export const actionLabels = {
  activateCommand: i18n.t('command_k.action_labels.activate_command'),
  open: i18n.t('command_k.action_labels.open'),
  openInNewTab: i18n.t('command_k.action_labels.open_in_new_tab'),
  switchToWallet: i18n.t('command_k.action_labels.switch_to_wallet'),
  sendToWallet: i18n.t('command_k.action_labels.send_to_wallet'),
  view: i18n.t('command_k.action_labels.view'),
};

export const springConfig = {
  type: 'spring',
  stiffness: 1111,
  damping: 50,
  mass: 1,
};

export const timingConfig = (duration?: number) => {
  return {
    duration: duration ?? 0.125,
    ease: [0.2, 0, 0, 1],
  };
};
