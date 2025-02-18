import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {getIcons, getCmdlines} from '../core.ts';

describe('getIcons()', function () {
  it('A semicolon at the beginning of a line must be treated as a comment', () => {
    const lines = ['[group]', ';comment', '[endgroup]', 'this line will be ignored', '[ext]', ';comment', '[endext]'];
    const exp = {errors: [], icons: {}};
    expect(getIcons(lines)).toEqual(exp);
  });

  it('Extensions specified in a group must be assigned a group icon', () => {
    //NOTE: Spaces and tabs are ignored
    const lines = [
      '[group]',
      'test1=A',
      'test2 = B, C',
      'test3	=	D, E , F',
      '[endgroup]',
      '[ext]',
      'test1=1',
      'test2=2',
      'test3=3',
      '[endext]'
    ];
    const exp = {errors: [], icons: {A: '1', B: '2', C: '2', D: '3', E: '3', F: '3'}};
    expect(getIcons(lines)).toEqual(exp);
  });

  it('Hexadecimal number is rounded to decimal number', () => {
    //NOTE: Keys are converted to uppercase
    const lines = [
      '[ext]',
      'hex=x1111',
      '[endext]'
    ];
    const exp = {errors: [], icons: {HEX: 'u4369'}};
    expect(getIcons(lines)).toEqual(exp);
  });

  it('Empty key names are ignored', () => {
    const lines = [
      '[group]',
      'test1=1,,3',
      'test2= 4 , , 6 ',
      '[endgroup]',
      '[ext]',
      'test1=A',
      'test2=B',
      '[endext]'
    ];
    const exp = {errors: [], icons: {'1': 'A', '3': 'A', '4': 'B', '6': 'B'}};
    expect(getIcons(lines)).toEqual(exp);
  });

  it('Error Patterns', () => {
    const lines = [
      '[ext]',
      'noValue1=x',
      'noValue2=u',
      'wrongValue=uABCD',
      '[endext]'
    ];
    const exp = {errors: ['NOVALUE1', 'NOVALUE2', 'WRONGVALUE'], icons: {}};
    expect(getIcons(lines)).toEqual(exp);
  });
});

describe('getCmdlines()', function () {
  const font = 'FontSpec';

  it('Asterisk must be placed at the end of cmdlines', () => {
    const ext = 'TEST';
    const value = 'T';
    const icons = {'*': 'A', [ext]: value};
    const exp = {
      cmdlines: [
        `*setcust X_icnl:${ext}=<f'${font}'${'T'}>`,
        `*setcust X_icnl:*=<f'${font}'c'_AUTO'A>`
      ],
      unset: [
        'X_icnl	= {',
        '-|*	=',
        `-|${ext}	=`,
        '}'
      ]
    };
    expect(getCmdlines(font, icons)).toEqual(exp);
  });
});
