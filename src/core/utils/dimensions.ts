export const POPUP_DIMENSIONS = {
  width: 360,
  height: 800,
};

export const INJECTED_NOTIFICATION_DIMENSIONS = {
  // 161 (figma width spec) + 48 (radius shadow) since we need space for the shadow to be visible in the iframe
  width: '209px',
  // 40 (figma height spec) + 48 (radius shadow) + 16 (vertical shadow), since we need space for the shadow to be visible in the iframe
  height: '122px',
  // 9 (figma top spec) - 41 (extra iframe height for shadow, 122 - 40 /2 )
  // since we need space for the shadow to be visible in the iframe
  top: '-32px',
  right: '50px',
};
