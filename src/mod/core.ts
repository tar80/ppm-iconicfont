import '@ppmdev/polyfills/stringTrim.ts';
import '@ppmdev/polyfills/objectKeys.ts';
import {properties} from '@ppmdev/parsers/table.ts';
import {hexToNum} from '@ppmdev/modules/util.ts';
import {isBottom, isEmptyStr} from '@ppmdev/modules/guard.ts';
import debug from '@ppmdev/modules/debug.ts';

type Group = {[K in string]: string[]};
type Prop = {[K in string]: string};

const [GROUP, END_GROUP] = ['[group]', '[endgroup]'];
const [EXT, END_EXT] = ['[ext]', '[endext]'];

const roundCharCode = (code: string): string | undefined => {
  if (code.indexOf('x') === 0) {
    const n = hexToNum(code.substring(1));

    if (isBottom(n)) {
      return;
    }

    code = `u${n}`;
  } else if (code.indexOf('u') === 0) {
    if (!/^u[0-9]+$/.test(code)) {
      return;
    }
  }

  return code;
};
export const getIcons = (lines: string[]): {icons: Prop; errors: string[]} => {
  const group: Group = {};
  const icons: Prop = {};
  const errors: string[] = [];
  const rgx = /^([^\s=]+)[\s=]+(.+)$/;

  for (let i = 0, k = lines.length; i < k; i++) {
    const line = lines[i];

    if (line.indexOf(GROUP) === 0) {
      for (; i < k; i++) {
        const groupLine = lines[i];

        if (groupLine.indexOf(END_GROUP) === 0) {
          break;
        }

        if (groupLine.indexOf(';') === 0) {
          continue;
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
          let char = roundCharCode(p2);
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
    for (let name of group[item]) {
      name = name.trim();

      if (isEmptyStr(name)) {
        continue;
      }

      const icon = icons[item];
      // console.log(name, item, icon)

      if (!!icon) {
        icons[name.toUpperCase()] = icon;
      }
    }

    delete icons[item];
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

    unset.push(`-|${ext}	=`);
  }

  unset.push('}');

  if (!isEmptyStr(asterisk)) {
    cmdlines.push(asterisk);
  }

  return {cmdlines, unset};
};
