/* @file Assign characters to icons
 * @arg 0 {number} - If "1" is specified, error messages will de displayed
 */

import {hasArg} from '@ppmdev/modules/argument.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
import {langAssignIcnl} from './mod/language.ts';
import {getIcons, getCmdlines} from './mod/core.ts';

const lang = langAssignIcnl[useLanguage()];

const main = () => {
  const nlcode = '\r\n';
  const isPrint = hasArg('1');
  const cacheDir = PPx.Extract("%sgu'ppmcache'");
  const iconList = `${cacheDir}\\list\\_iconlist`;
  const unsetCfg = `${cacheDir}\\ppm\\unset\\ppm-iconicfont.cfg`;
  const [error, data] = readLines({path: iconList, enc: 'utf8', linefeed: '\n'});

  if (error) {
    PPx.Echo(lang.couldNotRead);
    PPx.Quit(-1);
  }

  const font = PPx.Extract('%*getcust(S_ppm#user:iconicfont)');
  const {icons, errors} = getIcons(data.lines);
  const {cmdlines, unset} = getCmdlines(font, icons);
  const errorMsg = errors.length > 0 ? [`${nlcode}${lang.failedRegisters}: ${errors.join(',')}`] : [];

  if (cmdlines.length > 0) {
    PPx.Execute(cmdlines.join('%:'));
    const [error, msg] = writeLines({path: unsetCfg, data: unset, enc: 'utf8', overwrite: true, linefeed: '\n'});

    if (error) {
      errorMsg.push(nlcode, msg);
    }
  }

  if (isPrint) {
    PPx.report(errorMsg.join(nlcode));
  }
};

main();
