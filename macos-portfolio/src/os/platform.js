// Browsers own Ctrl+W / Ctrl+M on Windows and Linux, so window shortcuts use Alt there and the Command key on a Mac.
export const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);
export const MOD = IS_MAC ? '⌘' : 'Alt';
