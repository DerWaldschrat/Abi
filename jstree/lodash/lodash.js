/*!
 Lo-Dash 0.7.0 lodash.com/license
 Underscore.js 1.3.3 github.com/documentcloud/underscore/blob/master/LICENSE
 */
;(function(e,t){function s(e){return new o(e)}function o(e){if(e&&e.__wrapped__)return e;this.__wrapped__=e}function u(e,t,n){t||(t=0);var r=e.length,i=r-t>=(n||V),s=i?{}:e;if(i)for(var o=t-1;++o<r;)n=e[o]+"",(lt.call(s,n)?s[n]:s[n]=[]).push(e[o]);return function(e){if(i){var n=e+"";return lt.call(s,n)&&-1<k(s[n],e)}return-1<k(s,e,t)}}function a(){for(var e,t,n,s=-1,o=arguments.length,u={e:"",f:"",j:"",q:"",c:{d:""},m:{d:""}};++s<o;)for(t in e=arguments[s],e)n=(n=e[t])==r?"":n,/d|i/.test(t)?("string"==typeof
    n&&(n={b:n,l:n}),u.c[t]=n.b||"",u.m[t]=n.l||""):u[t]=n;e=u.a,t=/^[^,]+/.exec(e)[0],n=u.s,u.g=t,u.h=Dt,u.k=zt,u.n=Bt,u.p=st,u.r=u.r!==i,u.s=n==r?Wt:n,u.o==r&&(u.o=It),u.f||(u.f="if(!"+t+")return u");if("d"!=t||!u.c.i)u.c=r;t="",u.s&&(t+="'use strict';"),t+="var i,A,j="+u.g+",u",u.j&&(t+="="+u.j),t+=";"+u.f+";"+u.q+";",u.c&&(t+="var l=j.length;i=-1;",u.m&&(t+="if(l>-1&&l===l>>>0){"),u.o&&(t+="if(z.call(j)==x){j=j.split('')}"),t+=u.c.d+";while(++i<l){A=j[i];"+u.c.i+"}",u.m&&(t+="}"));if(u.m){u.c?t+="else{"
    :u.n&&(t+="var l=j.length;i=-1;if(l&&P(j)){while(++i<l){A=j[i+=''];"+u.m.i+"}}else{"),u.h||(t+="var v=typeof j=='function'&&r.call(j,'prototype');");if(u.k&&u.r)t+="var o=-1,p=Y[typeof j]?m(j):[],l=p.length;"+u.m.d+";while(++o<l){i=p[o];",u.h||(t+="if(!(v&&i=='prototype')){"),t+="A=j[i];"+u.m.i+"",u.h||(t+="}");else{t+=u.m.d+";for(i in j){";if(!u.h||u.r)t+="if(",u.h||(t+="!(v&&i=='prototype')"),!u.h&&u.r&&(t+="&&"),u.r&&(t+="g.call(j,i)"),t+="){";t+="A=j[i];"+u.m.i+";";if(!u.h||u.r)t+="}"}t+="}";
    if(u.h){t+="var f=j.constructor;";for(n=0;7>n;n++)t+="i='"+u.p[n]+"';if(","constructor"==u.p[n]&&(t+="!(f&&f.prototype===j)&&"),t+="g.call(j,i)){A=j[i];"+u.m.i+"}"}if(u.c||u.n)t+="}"}return t+=u.e+";return u",Function("D,E,F,I,e,K,g,h,N,P,R,T,U,k,X,Y,m,r,w,x,z","var G=function("+e+"){"+t+"};return G")(Xt,q,_,f,ft,hn,lt,D,k,b,un,w,an,p,Lt,Kt,bt,ht,pt,Ot,dt)}function f(e,n){var r=e.c,i=n.c,e=e.b,n=n.b;if(e!==n){if(e>n||e===t)return 1;if(e<n||n===t)return-1}return r<i?-1:1}function l(e,t){return at[
    t]}function c(e){return"\\"+Qt[e]}function h(e){return $t[e]}function p(e,t){return function(n,r,i){return e.call(t,n,r,i)}}function d(){}function v(e,t){if(e&&J.test(t))return"<e%-"+t+"%>";var n=at.length;return at[n]="'+__e("+t+")+'",ot+n+ut}function m(e,t,n,i){return i?(e=at.length,at[e]="';"+i+";__p+='",ot+e+ut):t?v(r,t):g(r,n)}function g(e,t){if(e&&J.test(t))return"<e%="+t+"%>";var n=at.length;return at[n]="'+((__t=("+t+"))==null?'':__t)+'",ot+n+ut}function y(e){return Jt[e]}function b(e){return dt
    .call(e)==xt}function w(e){return"function"==typeof e}function E(e,t){var n=i;if(!e||"object"!=typeof e||!t&&b(e))return n;var r=e.constructor;return(!qt||"function"==typeof e.toString||"string"!=typeof (e+""))&&(!w(r)||r instanceof r)?Ht?(hn(e,function(e,t,r){return n=!lt.call(r,t),i}),n===i):(hn(e,function(e,t){n=t}),n===i||lt.call(e,n)):n}function S(e,t,s,o){if(e==r)return e;s&&(t=i),o||(o={e:r}),o.t==r&&(o.t=!(!R.clone&&!z.clone&&!W.clone));if(((s=Kt[typeof e])||o.t)&&e.clone&&w(e.clone))return o
    .t=r,e.clone(t);if(s){var u=dt.call(e);if(!Vt[u]||jt&&b(e))return e;var a=u==Tt,s=a||(u==Lt?an(e,n):s)}if(!s||!t)return s?a?pt.call(e):cn({},e):e;s=e.constructor;switch(u){case Nt:return new s(e==n);case Ct:return new s(+e);case kt:case Ot:return new s(e);case At:return s(e.source,Z.exec(e))}for(var f=o.a||(o.a=[]),l=o.d||(o.d=[]),u=f.length;u--;)if(l[u]==e)return f[u];var c=a?s(u=e.length):{};f.push(c),l.push(e);if(a)for(a=-1;++a<u;)c[a]=S(e[a],t,r,o);else pn(e,function(e,n){c[n]=S(e,t,r,o)});return c
}function x(e,t,s){if(e==r||t==r)return e===t;s||(s={e:r}),s.t==r&&(s.t=!(!R.isEqual&&!z.isEqual&&!W.isEqual));if(Kt[typeof e]||Kt[typeof t]||s.t){e=e.__wrapped__||e,t=t.__wrapped__||t;if(e.isEqual&&w(e.isEqual))return s.t=r,e.isEqual(t);if(t.isEqual&&w(t.isEqual))return s.t=r,t.isEqual(e)}if(e===t)return 0!==e||1/e==1/t;var o=dt.call(e);if(o!=dt.call(t))return i;switch(o){case Nt:case Ct:return+e==+t;case kt:return e!=+e?t!=+t:0==e?1/e==1/t:e==+t;case At:case Ot:return e==t+""}var u=Xt[o];if(jt&&!
    u&&(u=b(e))&&!b(t)||!u&&(o!=Lt||qt&&("function"!=typeof e.toString&&"string"==typeof (e+"")||"function"!=typeof t.toString&&"string"==typeof (t+""))))return i;for(var a=s.stackA||(s.stackA=[]),f=s.stackB||(s.stackB=[]),o=a.length;o--;)if(a[o]==e)return f[o]==t;var o=-1,l=n,c=0;a.push(e),f.push(t);if(u){c=e.length;if(l=c==t.length)for(;c--&&(l=x(e[c],t[c],s)););return l}u=e.constructor,a=t.constructor;if(u!=a&&(!w(u)||!(u instanceof u&&w(a)&&a instanceof a)))return i;for(var h in e)if(lt.call(e,h)&&
    (c++,!lt.call(t,h)||!x(e[h],t[h],s)))return i;for(h in t)if(lt.call(t,h)&&!(c--))return i;if(Dt)for(;7>++o;)if(h=st[o],lt.call(e,h)&&(!lt.call(t,h)||!x(e[h],t[h],s)))return i;return n}function T(e,t,n,r){if(!e)return n;var i=e.length,s=3>arguments.length;r&&(t=p(t,r));if(-1<i&&i===i>>>0){var o=It&&dt.call(e)==Ot?e.split(""):e;for(i&&s&&(n=o[--i]);i--;)n=t(n,o[i],i,e);return n}o=gn(e);for((i=o.length)&&s&&(n=e[o[--i]]);i--;)s=o[i],n=t(n,e[s],s,e);return n}function N(e,t,n){if(e)return t==r||n?e[0]
    :pt.call(e,0,t)}function C(e,t){var n=[];if(!e)return n;for(var r,i=-1,s=e.length;++i<s;)r=e[i],un(r)?ct.apply(n,t?r:C(r)):n.push(r);return n}function k(e,t,n){if(!e)return-1;var r=-1,i=e.length;if(n){if("number"!=typeof n)return r=O(e,t),e[r]===t?r:-1;r=(0>n?wt(0,i+n):n)-1}for(;++r<i;)if(e[r]===t)return r;return-1}function L(e,t,n){var r=-Infinity,i=r;if(!e)return i;var s=-1,o=e.length;if(!t){for(;++s<o;)e[s]>i&&(i=e[s]);return i}for(n&&(t=p(t,n));++s<o;)n=t(e[s],s,e),n>r&&(r=n,i=e[s]);return i}
    function A(e,t,n){return e?pt.call(e,t==r||n?1:t):[]}function O(e,t,n,r){if(!e)return 0;var i=0,s=e.length;if(n){r&&(n=_(n,r));for(t=n(t);i<s;)r=i+s>>>1,n(e[r])<t?i=r+1:s=r}else for(;i<s;)r=i+s>>>1,e[r]<t?i=r+1:s=r;return i}function M(e,t,n,r){var s=[];if(!e)return s;var o=-1,u=e.length,a=[];"function"==typeof t&&(r=n,n=t,t=i);for(n?r&&(n=p(n,r)):n=D;++o<u;)if(r=n(e[o],o,e),t?!o||a[a.length-1]!==r:0>k(a,r))a.push(r),s.push(e[o]);return s}function _(e,t){function n(){var o=arguments,u=t;return i||
        (e=t[r]),s.length&&(o=o.length?s.concat(pt.call(o)):s),this instanceof n?(d.prototype=e.prototype,u=new d,(o=e.apply(u,o))&&Kt[typeof o]?o:u):e.apply(u,o)}var r,i=w(e);if(i){if(Ut||vt&&2<arguments.length)return vt.call.apply(vt,arguments)}else r=t,t=e;var s=pt.call(arguments,2);return n}function D(e){return e}function P(e){Ln(dn(e),function(t){var r=s[t]=e[t];o.prototype[t]=function(){var e=[this.__wrapped__];return arguments.length&&ct.apply(e,arguments),e=r.apply(s,e),this.__chain__&&(e=new o(e
    ),e.__chain__=n),e}})}var n=!0,r=null,i=!1,H,B,j,F,I="object"==typeof exports&&exports&&("object"==typeof global&&global&&global==global.global&&(e=global),exports),q=Array.prototype,R=Boolean.prototype,U=Object.prototype,z=Number.prototype,W=String.prototype,X=0,V=30,$=e._,J=/[-?+=!~*%&^<>|{(\/]|\[\D|\b(?:delete|in|instanceof|new|typeof|void)\b/,K=/&(?:amp|lt|gt|quot|#x27);/g,Q=/\b__p\+='';/g,G=/\b(__p\+=)''\+/g,Y=/(__e\(.*?\)|\b__t\))\+'';/g,Z=/\w*$/,et=/(?:__e|__t=)\(\s*(?![\d\s"']|this\.)/g,tt=
        RegExp("^"+(U.valueOf+"").replace(/[.*+?^=!:${}()|[\]\/\\]/g,"\\$&").replace(/valueOf|for [^\]]+/g,".+?")+"$"),nt=/__token(\d+)__/g,rt=/[&<>"']/g,it=/['\n\r\t\u2028\u2029\\]/g,st="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),ot="__token",ut="__",at=[],ft=q.concat,lt=U.hasOwnProperty,ct=q.push,ht=U.propertyIsEnumerable,pt=q.slice,dt=U.toString,vt=tt.test(vt=pt.bind)&&vt,mt=Math.floor,gt=tt.test(gt=Array.isArray)&&gt,yt=e.isFinite,bt=tt.test
        (bt=Object.keys)&&bt,wt=Math.max,Et=Math.min,St=Math.random,xt="[object Arguments]",Tt="[object Array]",Nt="[object Boolean]",Ct="[object Date]",kt="[object Number]",Lt="[object Object]",At="[object RegExp]",Ot="[object String]",Mt=e.clearTimeout,_t=e.setTimeout,Dt,Pt,Ht,Bt=n;(function(){function e(){this.x=1}var t={0:1,length:1},n=[];e.prototype={valueOf:1,y:1};for(var r in new e)n.push(r);for(r in arguments)Bt=!r;Dt=4>(n+"").length,Ht="x"!=n[0],Pt=(n.splice.call(t,0,1),t[0])})(1);var jt=!b(arguments
    ),Ft="x"!=pt.call("x")[0],It="xx"!="x"[0]+Object("x")[0];try{var qt=("[object Object]",dt.call(e.document||0)==Lt)}catch(Rt){}var Ut=vt&&/\n|Opera/.test(vt+dt.call(e.opera)),zt=bt&&/^.+$|true/.test(bt+!!e.attachEvent),Wt=!Ut,Xt={};Xt[Nt]=Xt[Ct]=Xt["[object Function]"]=Xt[kt]=Xt[Lt]=Xt[At]=i,Xt[xt]=Xt[Tt]=Xt[Ot]=n;var Vt={};Vt[xt]=Vt["[object Function]"]=i,Vt[Tt]=Vt[Nt]=Vt[Ct]=Vt[kt]=Vt[Lt]=Vt[At]=Vt[Ot]=n;var $t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"},Jt={"&amp;":"&","&lt;":"<"
        ,"&gt;":">","&quot;":'"',"&#x27;":"'"},Kt={"boolean":i,"function":n,object:n,number:i,string:i,"undefined":i,unknown:n},Qt={"\\":"\\","'":"'","\n":"n","\r":"r","	":"t","\u2028":"u2028","\u2029":"u2029"};s.templateSettings={escape:/<%-([\s\S]+?)%>/g,evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,variable:""};var Gt={a:"d,c,y",j:"d",q:"if(!c)c=h;else if(y)c=k(c,y)",i:"if(c(A,i,d)===false)return u"},Yt={j:"{}",q:"var q;if(typeof c!='function'){var ii=c;c=function(A){return A[ii]}}else if(y)c=k(c,y)"
        ,i:"q=c(A,i,d);(g.call(u,q)?u[q]++:u[q]=1)"},Zt={j:"true",i:"if(!c(A,i,d))return!u"},en={r:i,s:i,a:"n",j:"n",q:"for(var a=1,b=arguments.length;a<b;a++){if(j=arguments[a]){",i:"u[i]=A",e:"}}"},tn={j:"[]",i:"c(A,i,d)&&u.push(A)"},nn={q:"if(y)c=k(c,y)"},rn={i:{l:Gt.i}},sn={j:"",f:"if(!d)return[]",d:{b:"u=Array(l)",l:"u="+(zt?"Array(l)":"[]")},i:{b:"u[i]=c(A,i,d)",l:"u"+(zt?"[o]=":".push")+"(c(A,i,d))"}},on={r:i,a:"n,c,y",j:"{}",q:"var S=typeof c=='function';if(!S){var t=e.apply(E,arguments)}else if(y)c=k(c,y)"
        ,i:"if(S?!c(A,i,n):N(t,i)<0)u[i]=A"};jt&&(b=function(e){return!!e&&!!lt.call(e,"callee")});var un=gt||function(e){return dt.call(e)==Tt};w(/x/)&&(w=function(e){return"[object Function]"==dt.call(e)});var an=Kt.__proto__!=U?E:function(e,t){if(!e)return i;var n=e.valueOf,r="function"==typeof n&&(r=n.__proto__)&&r.__proto__;return r?e==r||e.__proto__==r&&(t||!b(e)):E(e)},fn=a({a:"n",j:"[]",i:"u.push(i)"}),ln=a(en,{i:"if(u[i]==null)"+en.i}),cn=a(en),hn=a(Gt,nn,rn,{r:i}),pn=a(Gt,nn,rn),dn=a({r:i,a:"n"
        ,j:"[]",i:"if(T(A))u.push(i)",e:"u.sort()"}),vn=a({a:"n",j:"{}",i:"u[A]=i"}),mn=a({a:"A",j:"true",q:"var H=z.call(A),l=A.length;if(D[H]"+(jt?"||P(A)":"")+"||(H==X&&l>-1&&l===l>>>0&&T(A.splice)))return!l",i:{l:"return false"}}),gn=bt?function(e){var t=typeof e;return"function"==t&&ht.call(e,"prototype")?fn(e):e&&Kt[t]?bt(e):[]}:fn,yn=a(en,{a:"n,ee,O",q:"var Q,dd=O==U,J=dd?arguments[3]:{g:[],d:[]};for(var a=1,b=dd?2:arguments.length;a<b;a++){if(j=arguments[a]){",i:"if((ee=A)&&((Q=R(ee))||U(ee))){var L=false,jj=J.g,ff=J.d,gg=ff.length;while(gg--)if(L=ff[gg]==ee)break;if(L){u[i]=jj[gg]}else{jj.push(A=(A=u[i])&&Q?(R(A)?A:[]):(U(A)?A:{}));ff.push(ee);u[i]=G(A,ee,U,J)}}else if(ee!=null)u[i]=ee"
    }),bn=a(on),wn=a({a:"n",j:"[]",i:"u"+(zt?"[o]=":".push")+"([i,A])"}),En=a(on,{q:"if(typeof c!='function'){var q,t=e.apply(E,arguments),l=t.length;for(i=1;i<l;i++){q=t[i];if(q in n)u[q]=n[q]}}else{if(y)c=k(c,y)",i:"if(c(A,i,n))u[i]=A",e:"}"}),Sn=a({a:"n",j:"[]",i:"u.push(A)"}),xn=a({a:"d,hh",j:"false",o:i,d:{b:"if(z.call(d)==x)return d.indexOf(hh)>-1"},i:"if(A===hh)return true"}),Tn=a(Gt,Yt),Nn=a(Gt,Zt),Cn=a(Gt,tn),kn=a(Gt,nn,{j:"",i:"if(c(A,i,d))return A"}),Ln=a(Gt,nn),An=a(Gt,Yt,{i:"q=c(A,i,d);(g.call(u,q)?u[q]:u[q]=[]).push(A)"
    }),On=a(sn,{a:"d,V",q:"var C=w.call(arguments,2),S=typeof V=='function'",i:{b:"u[i]=(S?V:A[V]).apply(A,C)",l:"u"+(zt?"[o]=":".push")+"((S?V:A[V]).apply(A,C))"}}),Mn=a(Gt,sn),_n=a(sn,{a:"d,bb",i:{b:"u[i]=A[bb]",l:"u"+(zt?"[o]=":".push")+"(A[bb])"}}),Dn=a({a:"d,c,B,y",j:"B",q:"var W=arguments.length<3;if(y)c=k(c,y)",d:{b:"if(W)u=j[++i]"},i:{b:"u=c(u,A,i,d)",l:"u=W?(W=false,A):c(u,A,i,d)"}}),Pn=a(Gt,tn,{i:"!"+tn.i}),Hn=a(Gt,Zt,{j:"false",i:Zt.i.replace("!","")}),Bn=a(Gt,Yt,sn,{i:{b:"u[i]={b:c(A,i,d),c:i,f:A}"
        ,l:"u"+(zt?"[o]=":".push")+"({b:c(A,i,d),c:i,f:A})"},e:"u.sort(I);l=u.length;while(l--)u[l]=u[l].f"}),jn=a(tn,{a:"d,aa",q:"var t=[];K(aa,function(A,q){t.push(q)});var cc=t.length",i:"for(var q,Z=true,s=0;s<cc;s++){q=t[s];if(!(Z=A[q]===aa[q]))break}Z&&u.push(A)"}),Fn=a({r:i,s:i,a:"n",j:"n",q:"var M=arguments,l=M.length;if(l>1){for(var i=1;i<l;i++)u[M[i]]=F(u[M[i]],u);return u}",i:"if(T(u[i]))u[i]=F(u[i],u)"});s.VERSION="0.7.0",s.after=function(e,t){return 1>e?t():function(){if(1>--e)return t.apply
        (this,arguments)}},s.bind=_,s.bindAll=Fn,s.chain=function(e){return e=new o(e),e.__chain__=n,e},s.clone=S,s.compact=function(e){var t=[];if(!e)return t;for(var n=-1,r=e.length;++n<r;)e[n]&&t.push(e[n]);return t},s.compose=function(){var e=arguments;return function(){for(var t=arguments,n=e.length;n--;)t=[e[n].apply(this,t)];return t[0]}},s.contains=xn,s.countBy=Tn,s.debounce=function(e,t,n){function i(){a=r,n||(o=e.apply(u,s))}var s,o,u,a;return function(){var r=n&&!a;return s=arguments,u=this,Mt
        (a),a=_t(i,t),r&&(o=e.apply(u,s)),o}},s.defaults=ln,s.defer=function(e){var n=pt.call(arguments,1);return _t(function(){return e.apply(t,n)},1)},s.delay=function(e,n){var r=pt.call(arguments,2);return _t(function(){return e.apply(t,r)},n)},s.difference=function(e){var t=[];if(!e)return t;for(var n=-1,r=e.length,i=ft.apply(t,arguments),i=u(i,r);++n<r;)i(e[n])||t.push(e[n]);return t},s.escape=function(e){return e==r?"":(e+"").replace(rt,h)},s.every=Nn,s.extend=cn,s.filter=Cn,s.find=kn,s.first=N,s.flatten=
        C,s.forEach=Ln,s.forIn=hn,s.forOwn=pn,s.functions=dn,s.groupBy=An,s.has=function(e,t){return e?lt.call(e,t):i},s.identity=D,s.indexOf=k,s.initial=function(e,t,n){return e?pt.call(e,0,-(t==r||n?1:t)):[]},s.intersection=function(e){var t=[];if(!e)return t;var n,r=arguments.length,i=[],s=-1,o=e.length;e:for(;++s<o;)if(n=e[s],0>k(t,n)){for(var a=1;a<r;a++)if(!(i[a]||(i[a]=u(arguments[a])))(n))continue e;t.push(n)}return t},s.invert=vn,s.invoke=On,s.isArguments=b,s.isArray=un,s.isBoolean=function(e){return e===
        n||e===i||dt.call(e)==Nt},s.isElement=function(e){return e?1===e.nodeType:i},s.isEmpty=mn,s.isEqual=x,s.isFinite=function(e){return yt(e)&&dt.call(e)==kt},s.isFunction=w,s.isNaN=function(e){return dt.call(e)==kt&&e!=+e},s.isNull=function(e){return e===r},s.isObject=function(e){return e?Kt[typeof e]:i},s.isUndefined=function(e){return e===t},s.keys=gn,s.last=function(e,t,n){if(e){var i=e.length;return t==r||n?e[i-1]:pt.call(e,-t||i)}},s.lastIndexOf=function(e,t,n){if(!e)return-1;var r=e.length;for(
        n&&"number"==typeof n&&(r=(0>n?wt(0,r+n):Et(n,r-1))+1);r--;)if(e[r]===t)return r;return-1},s.map=Mn,s.max=L,s.memoize=function(e,t){var n={};return function(){var r=t?t.apply(this,arguments):arguments[0];return lt.call(n,r)?n[r]:n[r]=e.apply(this,arguments)}},s.merge=yn,s.min=function(e,t,n){var r=Infinity,i=r;if(!e)return i;var s=-1,o=e.length;if(!t){for(;++s<o;)e[s]<i&&(i=e[s]);return i}for(n&&(t=p(t,n));++s<o;)n=t(e[s],s,e),n<r&&(r=n,i=e[s]);return i},s.mixin=P,s.noConflict=function(){return e
        ._=$,this},s.object=function(e,t){if(!e)return{};for(var n=-1,r=e.length,i={};++n<r;)t?i[e[n]]=t[n]:i[e[n][0]]=e[n][1];return i},s.omit=bn,s.once=function(e){var t,s=i;return function(){return s?t:(s=n,t=e.apply(this,arguments),e=r,t)}},s.pairs=wn,s.partial=function(e){var t=pt.call(arguments,1),n=t.length;return function(){var r;return r=arguments,r.length&&(t.length=n,ct.apply(t,r)),r=1==t.length?e.call(this,t[0]):e.apply(this,t),t.length=n,r}},s.pick=En,s.pluck=_n,s.random=function(e,t){return e==
        r&&t==r?St():(e=+e||0,t==r&&(t=e,e=0),e+mt(St()*((+t||0)-e+1)))},s.range=function(e,t,n){e=+e||0,n=+n||1,t==r&&(t=e,e=0);for(var i=-1,t=wt(0,Math.ceil((t-e)/n)),s=Array(t);++i<t;)s[i]=e,e+=n;return s},s.reduce=Dn,s.reduceRight=T,s.reject=Pn,s.rest=A,s.result=function(e,t){if(!e)return r;var n=e[t];return w(n)?e[t]():n},s.shuffle=function(e){if(!e)return[];for(var t,n=-1,r=e.length,i=Array(r);++n<r;)t=mt(St()*(n+1)),i[n]=i[t],i[t]=e[n];return i},s.size=function(e){if(!e)return 0;var t=e.length;return-1<
        t&&t===t>>>0?t:gn(e).length},s.some=Hn,s.sortBy=Bn,s.sortedIndex=O,s.tap=function(e,t){return t(e),e},s.template=function(e,t,n){n||(n={});var e=e+"",o,u;o=n.escape;var a=n.evaluate,f=n.interpolate,h=s.templateSettings,p=n=n.variable||h.variable;o==r&&(o=h.escape),a==r&&(a=h.evaluate||i),f==r&&(f=h.interpolate),o&&(e=e.replace(o,v)),f&&(e=e.replace(f,g)),a!=H&&(H=a,F=RegExp("<e%-([\\s\\S]+?)%>|<e%=([\\s\\S]+?)%>"+(a?"|"+a.source:""),"g")),o=at.length,e=e.replace(F,m),o=o!=at.length,e="__p += '"+e
        .replace(it,c).replace(nt,l)+"';",at.length=0,p||(n=B||"obj",o?e="with("+n+"){"+e+"}":(n!=B&&(B=n,j=RegExp("(\\(\\s*)"+n+"\\."+n+"\\b","g")),e=e.replace(et,"$&"+n+".").replace(j,"$1__d"))),e=(o?e.replace(Q,""):e).replace(G,"$1").replace(Y,"$1;"),e="function("+n+"){"+(p?"":n+"||("+n+"={});")+"var __t,__p='',__e=_.escape"+(o?",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}":(p?"":",__d="+n+"."+n+"||"+n)+";")+e+"return __p}";try{u=Function("_","return "+e)(s)}catch(d){throw d
        .source=e,d}return t?u(t):(u.source=e,u)},s.throttle=function(e,t){function n(){a=new Date,u=r,s=e.apply(o,i)}var i,s,o,u,a=0;return function(){var r=new Date,f=t-(r-a);return i=arguments,o=this,0>=f?(a=r,s=e.apply(o,i)):u||(u=_t(n,f)),s}},s.times=function(e,t,n){var r=-1;if(n)for(;++r<e;)t.call(n,r);else for(;++r<e;)t(r)},s.toArray=function(e){if(!e)return[];if(e.toArray&&w(e.toArray))return e.toArray();var t=e.length;return-1<t&&t===t>>>0?(Ft?dt.call(e)==Ot:"string"==typeof e)?e.split(""):pt.call
        (e):Sn(e)},s.unescape=function(e){return e==r?"":(e+"").replace(K,y)},s.union=function(){for(var e=-1,t=[],n=ft.apply(t,arguments),r=n.length;++e<r;)0>k(t,n[e])&&t.push(n[e]);return t},s.uniq=M,s.uniqueId=function(e){var t=X++;return e?e+t:t},s.values=Sn,s.where=jn,s.without=function(e){var t=[];if(!e)return t;for(var n=-1,r=e.length,i=u(arguments,1,20);++n<r;)i(e[n])||t.push(e[n]);return t},s.wrap=function(e,t){return function(){var n=[e];return arguments.length&&ct.apply(n,arguments),t.apply(this
        ,n)}},s.zip=function(e){if(!e)return[];for(var t=-1,n=L(_n(arguments,"length")),r=Array(n);++t<n;)r[t]=_n(arguments,t);return r},s.all=Nn,s.any=Hn,s.collect=Mn,s.detect=kn,s.drop=A,s.each=Ln,s.foldl=Dn,s.foldr=T,s.head=N,s.include=xn,s.inject=Dn,s.methods=dn,s.select=Cn,s.tail=A,s.take=N,s.unique=M,Ln({Date:Ct,Number:kt,RegExp:At,String:Ot},function(e,t){s["is"+t]=function(t){return dt.call(t)==e}}),o.prototype=s.prototype,P(s),o.prototype.chain=function(){return this.__chain__=n,this},o.prototype
        .value=function(){return this.__wrapped__},Ln("pop push reverse shift sort splice unshift".split(" "),function(e){var t=q[e];o.prototype[e]=function(){var e=this.__wrapped__;return t.apply(e,arguments),Pt&&e.length===0&&delete e[0],this.__chain__&&(e=new o(e),e.__chain__=n),e}}),Ln(["concat","join","slice"],function(e){var t=q[e];o.prototype[e]=function(){var e=t.apply(this.__wrapped__,arguments);return this.__chain__&&(e=new o(e),e.__chain__=n),e}}),typeof define=="function"&&typeof define.amd=="object"&&
        define.amd?(e._=s,define(function(){return s})):I?"object"==typeof module&&module&&module.exports==I?(module.exports=s)._=s:I._=s:e._=s})(this);