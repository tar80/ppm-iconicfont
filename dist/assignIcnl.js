﻿var e,t,r,n,hasArg=function(e){return 0!==PPx.Arguments.length&&PPx.Argument(0)===e},i={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},useLanguage=function(){var e=PPx.Extract("%*getcust(S_ppm#global:lang)");return"en"===e||"ja"===e?e:i.language},o=PPx.CreateObject("Scripting.FileSystemObject"),expandNlCode=function(e){var t="\n",r=e.indexOf("\r");return~r&&(t="\r\n"==e.substring(r,r+2)?"\r\n":"\r"),t},isCV8=function(){return"ClearScriptV8"===PPx.ScriptEngineName},hexToNum=function(e){var t=parseInt(e,16);return isNaN(t)?undefined:t},isEmptyStr=function(e){return""===e},isBottom=function(e){return null==e},a={TypeToCode:{crlf:"\r\n",cr:"\r",lf:"\n"},CodeToType:{"\r\n":"crlf","\r":"cr","\n":"lf"},Ppx:{lf:"%%bl",cr:"%%br",crlf:"%%bn",unix:"%%bl",mac:"%%br",dos:"%%bn","\n":"%%bl","\r":"%%br","\r\n":"%%bn"},Ascii:{lf:"10",cr:"13",crlf:"-1",unix:"10",mac:"13",dos:"-1","\n":"10","\r":"13","\r\n":"-1"}},exec=function(e,t){try{var r;return[!1,null!=(r=t())?r:""]}catch(n){return[!0,""]}finally{e.Close()}},read=function(e){var t=e.path,r=e.enc,n=void 0===r?"utf8":r;if(!o.FileExists(t))return[!0,t+" not found"];var i=o.GetFile(t);if(0===i.Size)return[!0,t+" has no data"];var a=!1,u="";if("utf8"===n){var l=PPx.CreateObject("ADODB.Stream"),c=exec(l,(function(){return l.Open(),l.Charset="UTF-8",l.LoadFromFile(t),l.ReadText(-1)}));a=c[0],u=c[1]}else{var s="utf16le"===n?-1:0,f=i.OpenAsTextStream(1,s),p=exec(f,(function(){return f.ReadAll()}));a=p[0],u=p[1]}return a?[!0,"Unable to read "+t]:[!1,u]},readLines=function(e){var t,r=e.path,n=e.enc,i=void 0===n?"utf8":n,o=e.linefeed,a=read({path:r,enc:i}),u=a[0],l=a[1];if(u)return[!0,l];o=null!=(t=o)?t:expandNlCode(l.slice(0,1e3));var c=l.split(o);return isEmptyStr(c[c.length-1])&&c.pop(),[!1,{lines:c,nl:o}]},writeLines=function(e){var t=e.path,r=e.data,n=e.enc,u=void 0===n?"utf8":n,l=e.append,c=void 0!==l&&l,s=e.overwrite,f=void 0!==s&&s,p=e.linefeed,d=void 0===p?i.nlcode:p;if(!f&&!c&&o.FileExists(t))return[!0,t+" already exists"];var x,v=o.GetParentFolderName(t);if(o.FolderExists(v)||PPx.Execute("*makedir "+v),"utf8"===u){if(isCV8()){var g=r.join(d),P=c?"AppendAllText":"WriteAllText";return[!1,NETAPI.System.IO.File[P](t,g)]}var h=f||c?2:1,m=PPx.CreateObject("ADODB.Stream");x=exec(m,(function(){m.Open(),m.Charset="UTF-8",m.LineSeparator=Number(a.Ascii[d]),c?(m.LoadFromFile(t),m.Position=m.Size,m.SetEOS):m.Position=0,m.WriteText(r.join(d),1),m.SaveToFile(t,h)}))[0]}else{var O=c?8:f?2:1;o.FileExists(t)||PPx.Execute("%Osq *makefile "+t);var b="utf16le"===u?-1:0,F=o.GetFile(t).OpenAsTextStream(O,b);x=exec(F,(function(){F.Write(r.join(d)+d)}))[0]}return x?[!0,"Could not write to "+t]:[!1,""]},u={en:{couldNotRead:"Could not read _iconlist",failedRegisters:"Failed"},ja:{couldNotRead:"_iconlistを読み込めませんでした",failedRegisters:"登録失敗"}};String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}),Object.keys||(Object.keys=(e=Object.prototype.hasOwnProperty,t=!{toString:null}.propertyIsEnumerable("toString"),n=(r=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"]).length,function(i){if("function"!=typeof i&&("object"!=typeof i||null==i))throw new TypeError("Object.keys: called on non-object");var o,a,u=[];for(o in i)e.call(i,o)&&u.push(o);if(t)for(a=0;a<n;a++)e.call(i,r[a])&&u.push(r[a]);return u}));var properties=function(e){for(var t=PPx.Extract("%*getcust("+e+")").split(i.nlcode),r={},n=/^([^,=]+)([,=])\s*(.*)/,o="",a=1,u=t.length-2;a<u;a++){""!==t[a].replace(n,(function(e,t,n,i){return o=t.replace(/[\s\uFEFF\xA0]+$/,""),r[o]={sep:n,value:[i]},""}))&&r[o].value.push(t[a].replace(/^\s*/,""))}return r},l="[group]",c="[endgroup]",s="[ext]",f="[endext]",roundCharCode=function(e){if(0===e.indexOf("x")){var t=hexToNum(e.substring(1));if(isBottom(t))return;e="u"+t}else if(0===e.indexOf("u")&&!/^u[0-9]+$/.test(e))return;return e},getIcons=function(e){for(var t={},r={},n=[],i=/^([^\s=]+)[\s=]+(.+)$/,o=0,a=e.length;o<a;o++){var u=e[o];if(0!==u.indexOf(l)){if(0===u.indexOf(s))for(;o<a;o++){var p=e[o];if(0===p.indexOf(f))break;0!==p.indexOf(";")&&p.replace(i,(function(e,t,i){var o=roundCharCode(i),a=t.toUpperCase();return isBottom(o)?n.push(a):r[a]=o,""}))}}else for(;o<a;o++){var d=e[o];if(0===d.indexOf(c))break;0!==d.indexOf(";")&&d.replace(i,(function(e,r,n){return t[r.toUpperCase()]=n.split(",")}))}}for(var x=0,v=Object.keys(t);x<v.length;x++){for(var g=v[x],P=0,h=t[g];P<h.length;P++){var m=h[P];if(m=m.trim(),!isEmptyStr(m)){var O=r[g];O&&(r[m.toUpperCase()]=O)}}delete r[g]}return{icons:r,errors:n}},getCmdlines=function(e,t){for(var r=properties("C_ext"),n=["X_icnl\t= {"],i=[],o="",a=0,u=Object.keys(t);a<u.length;a++){var l=u[a],c=r[l]?"c'"+r[l].value+"'":"";"*"===l?o="*setcust X_icnl:"+l+"=<f'"+e+"'"+c+t[l]+">":i.push("*setcust X_icnl:"+l+"=<f'"+e+"'"+c+t[l]+">"),n.push("-|"+l+"\t=")}return n.push("}"),isEmptyStr(o)||i.push(o),{cmdlines:i,unset:n}},p=u[useLanguage()];(function(){var e="\r\n",t=hasArg("1"),r=PPx.Extract("%sgu'ppmcache'"),n=r+"\\ppm\\unset\\ppm-iconicfont.cfg",i=readLines({path:r+"\\list\\_iconlist",enc:"utf8",linefeed:"\n"}),o=i[0],a=i[1];o&&(PPx.Echo(p.couldNotRead),PPx.Quit(-1));var u=PPx.Extract("%*getcust(S_ppm#user:iconicfont)"),l=getIcons(a.lines),c=l.icons,s=l.errors,f=getCmdlines(u,c),d=f.cmdlines,x=f.unset,v=s.length>0?[""+e+p.failedRegisters+": "+s.join(",")]:[];if(d.length>0){PPx.Execute(d.join("%:"));var g=writeLines({path:n,data:x,enc:"utf8",overwrite:!0,linefeed:"\n"}),P=g[0],h=g[1];P&&v.push(e,h)}t&&PPx.report(v.join(e))})();
