import { NbJSThemeOptions, DEFAULT_THEME as baseTheme } from '@nebular/theme';

const palette = {
  primary: '#0060ff',
  success: '#00c013',
  info: '#0060ff',
  warning: '#fe8623',
  danger: '#ce3800',
};

export const DEFAULT_THEME = {
  name: 'default',
  base: 'default',
  variables: {
    fontMain: 'Koerber, Arial, sans-serif',
    fontSecondary: 'Koerber, Arial, sans-serif',
    bg: '#ffffff',
    bg2: '#f5f3f1',
    bg3: '#e6e2dc',
    bg4: '#bfb8af',

    border: '#ffffff',
    border2: '#f5f3f1',
    border3: '#e6e2dc',
    border4: '#bfb8af',
    border5: '#90887d',
    
    fg: '#756f65',
    fgHeading: '#262523',
    fgText: '#262523',
    fgHighlight: palette.primary,
    layoutBg: '#e6e2dc',
    separator: '#e6e2dc',

    primary: palette.primary,
    success: palette.success,
    info: palette.info,
    warning: palette.warning,
    danger: palette.danger,

    primaryLight: '#3381ff',
    successLight: '#00e617',
    infoLight: '#3381ff',
    warningLight: '#fe9d4d',
    dangerLight: '#ff4400'
  }
  
} as NbJSThemeOptions;
