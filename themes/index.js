import institucionalTheme from './institucionalTheme';
import kawaiiTheme from './kawaiiTheme';
import kuromiTheme from './kuromiTheme';
import spidermanTheme from './spidermanTheme';
import darkTheme from './darkTheme';

const THEMES = {
  institucional: institucionalTheme,
  kawaii: kawaiiTheme,
  kuromi: kuromiTheme,
  spiderman: spidermanTheme,
  dark: darkTheme,
};

export const getTheme = (themeId) => {
  const theme = THEMES[themeId];
  if (!theme) return THEMES.institucional;
  return theme;
};

export const getAllThemes = () => Object.values(THEMES);

export default THEMES;