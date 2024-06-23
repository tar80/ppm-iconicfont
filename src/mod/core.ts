import '@ppmdev/polyfills/objectKeys.ts';
import {properties} from '@ppmdev/parsers/table.ts';
import {hexToNum} from '@ppmdev/modules/util.ts';
import {isBottom, isEmptyStr} from '@ppmdev/modules/guard.ts';
import debug from '@ppmdev/modules/debug.ts';

type Group = {[K in string]: string[]};
type Prop = {[K in string]: string};

const [GROUP, END_GROUP] = ['[group]', '[endgroup]'];
const [EXT, END_EXT] = ['[ext]', '[endext]'];

export const getIcons = (lines: string[]): {icons: Prop; errors: string[]} => {
  const group: Group = {};
  const icons: Prop = {};
  const errors: string[] = [];
  const rgx = /^(\S+)[\s=]+(.+)$/;

  for (let i = 0, k = lines.length; i < k; i++) {
    const line = lines[i];

    if (line.indexOf(GROUP) === 0) {
      for (; i < k; i++) {
        const groupLine = lines[i];

        if (groupLine.indexOf(';') === 0 || groupLine.indexOf(END_GROUP) === 0) {
          break;
        }

        groupLine.replace(rgx, (_, p1, p2) => (group[p1.toUpperCase()] = p2.split(',')));
      }

      continue;
    }

    if (line.indexOf(EXT) === 0) {
      for (; i < k; i++) {
        const extLine = lines[i];

        if (extLine.indexOf(END_EXT) === 0) {
          break;
        }

        if (extLine.indexOf(';') === 0) {
          continue;
        }

        extLine.replace(rgx, (_, p1, p2) => {
          let char = p2.indexOf('x') === 0 ? `u${hexToNum(p2.substring(1))}` : p2;
          let ret = p1.toUpperCase();

          if (!isBottom(char)) {
            icons[ret] = char;
          } else {
            errors.push(ret);
          }

          return '';
        });
      }
    }
  }

  for (const item of Object.keys(group)) {
    for (const name of group[item]) {
      const icon = icons[item];

      if (!!icon) {
        icons[name.toUpperCase()] = icon;
      }
    }
  }

  return {icons, errors};
};

export const getCmdlines = (font: string, icons: Prop): {cmdlines: string[]; unset: string[]} => {
  const colors = properties('C_ext');
  const unset: string[] = ['X_icnl	= {'];
  const cmdlines: string[] = [];
  let asterisk = '';

  for (const ext of Object.keys(icons)) {
    const color = colors[ext] ? `c'${colors[ext].value}'` : '';

    if (ext === '*') {
      asterisk = `*setcust X_icnl:${ext}=<f'${font}'${color}${icons[ext]}>`;
    } else {
      cmdlines.push(`*setcust X_icnl:${ext}=<f'${font}'${color}${icons[ext]}>`);
    }

    unset.push(`-|${ext} =`);
  }

  unset.push('}');

  if (!isEmptyStr(asterisk)) {
    cmdlines.push(asterisk);
  }

  return {cmdlines, unset};
};
