//!*script
/**
 * Assign a iconic-font to extensions
 *
 */

'use strict';

const script_name = PPx.ScriptName.replace(/^.*\\/, '');

const errorMsg = function (msg) {
  PPx.SetPopLineMessage(script_name + ': ' + msg);
  PPx.Quit(-1);
};

const st = PPx.CreateObject('ADODB.stream');
const cache_dir = PPx.Extract('%*getcust(S_ppm#global:cache)');

const linefeed = (data) => {
  const data_ = data.slice(0, 120);
  const codes = ['\r\n', '\n', '\r'];
  let chr = '';

  for (let i = 0, l = codes.length; i < l; i++) {
    chr = codes[i];
    if (~data_.indexOf(chr)) {
      break;
    }
  }

  return chr;
};

const split_lines = (data) => data.split(linefeed(data));

const lines = (filepath) => {
  let data;

  st.Open;
  st.Type = 2;
  st.Charset = 'UTF-8';

  try {
    st.LoadFromFile(filepath);
    data = st.ReadText(-1);
  } catch (_err) {
    return [];
  } finally {
    st.Close;
  }

  const result = split_lines(data);

  if (result[result.length - 1] === '') {
    result.pop();
  }

  return result;
};

const icons = (() => {
  const line_ = lines(PPx.Extract(cache_dir + '\\list\\_iconlist'));
  const len = line_.length;

  if (len === 0) {
    errorMsg('Not found format of the icons');
  }

  let thisLine;
  const group = {};
  const exts = {};
  const reg = /^(\S+)[\s=]+(.+)/;

  for (let i = 0, l = len; i < l; i++) {
    thisLine = line_[i];

    if (thisLine.indexOf('[group]') === 0) {
      for (; i < l; i++) {
        thisLine = line_[i];

        if (thisLine.indexOf('[endgroup]') === 0) {
          break;
        }

        thisLine.replace(reg, (_match, p1, p2) => (group[p1.toUpperCase()] = p2.split(',')));
      }

      continue;
    }

    if (thisLine.indexOf('[ext]') === 0) {
      for (; i < l; i++) {
        thisLine = line_[i];

        if (thisLine.indexOf('[endext]') === 0) {
          break;
        }

        thisLine.replace(reg, (_match, p1, p2) => (exts[p1.toUpperCase()] = p2));
      }
    }
  }

  return {group: group, exts: exts};
})();

const unset = ((group, exts) => {
  const result = ['X_icnl = {'];
  const reg = /^(\S+)[\s=]+(\S+)/;
  const cmdline = [];
  const colors = {};
  const font = PPx.Extract('%*getcust(S_ppm#user:iconicfont)');
  const line_ = split_lines(PPx.Extract('%*getcust(C_ext)'));

  const format = (ext, unicode, color) => {
    const color_ = color !== undefined ? `c'${color}'` : '';
    return `*setcust X_icnl:${ext}=<f${font}'${color_}${unicode}>`;
  };

  for (let i = 0, l = line_.length; i < l; i++) {
    line_[i].replace(reg, (_match, p1, p2) => (colors[p1] = p2));
  }

  for (const ext of Object.keys(exts)) {
    if (group[ext] !== undefined) {
      group[ext].map((v) => {
        cmdline.push(format(v, exts[ext], colors[v.toUpperCase()]));
        result.push('-|' + v + ' =');
      });
      continue;
    }

    cmdline.push(format(ext, exts[ext], colors[ext]));
    result.push('-|' + ext + ' =');
  }

  PPx.Execute(cmdline.join('%:'));
  result.push('}');
  return result;
})(icons.group, icons.exts);

{
  const filepath = cache_dir + '\\ppm\\unset\\ppm-iconicfont.cfg';
  st.open;
  st.Type = 2;
  st.Charset = 'UTF-8';
  try {
    st.LoadFromFile(filepath);
  } catch (_err) {
    errorMsg('Failed to registration of deletion icons setting');
  }

  const data = st.ReadText(-1);
  const newline = linefeed(data);

  st.Position = st.Size;
  st.SetEOS;
  st.WriteText(newline + unset.join(newline), 1);
  st.SaveToFile(filepath, 2);
  st.Close;
}
