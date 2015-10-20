"use strict";

(function () {
  (function () {
    function o() {
      var e = { "&": "&#38;", "<": "&#60;", ">": "&#62;", "\"": "&#34;", "'": "&#39;", "/": "&#47;" },
          t = /&(?!#?\w+;)|<|>|"|'|\//g;return function () {
        return this ? this.replace(t, function (t) {
          return e[t] || t;
        }) : this;
      };
    }function p(e, t, n) {
      return (typeof t == "string" ? t : t.toString()).replace(e.define || i, function (t, r, i, s) {
        return (r.indexOf("def.") === 0 && (r = r.substring(4)), r in n || (i === ":" ? (e.defineParams && s.replace(e.defineParams, function (e, t, i) {
          n[r] = { arg: t, text: i };
        }), r in n || (n[r] = s)) : new Function("def", "def['" + r + "']=" + s)(n)), "");
      }).replace(e.use || i, function (t, r) {
        e.useParams && (r = r.replace(e.useParams, function (e, t, r, i) {
          if (n[r] && n[r].arg && i) return (e = (r + ":" + i).replace(/'|\\/g, "_"), n.__exp = n.__exp || {}, n.__exp[e] = n[r].text.replace(RegExp("(^|[^\\w$])" + n[r].arg + "([^\\w$])", "g"), "$1" + i + "$2"), t + "def.__exp['" + e + "']");
        }));var i = new Function("def", "return " + r)(n);return i ? p(e, i, n) : i;
      });
    }function m(e) {
      return e.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
    }var j = { version: "1.0.1", templateSettings: { evaluate: /\{\{([\s\S]+?(\}?)+)\}\}/g, interpolate: /\{\{=([\s\S]+?)\}\}/g, encode: /\{\{!([\s\S]+?)\}\}/g, use: /\{\{#([\s\S]+?)\}\}/g, useParams: /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g, define: /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g, defineParams: /^\s*([\w$]+):([\s\S]+)/, conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g, iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g, varname: "it", strip: !0, append: !0, selfcontained: !1 }, template: undefined, compile: undefined },
        q;typeof module != "undefined" && module.exports ? module.exports = j : typeof define == "function" && define.amd ? define("components/nova-doT/doT", [], function () {
      return j;
    }) : (q = (function () {
      return this || (0, eval)("this");
    })(), q.doT = j), String.prototype.encodeHTML = o();var r = { append: { start: "'+(", end: ")+'", endencode: "||'').toString().encodeHTML()+'" }, split: { start: "';out+=(", end: ");out+='", endencode: "||'').toString().encodeHTML();out+='" } },
        i = /$^/;j.template = function (e, t, n) {
      t = t || j.templateSettings;var s = t.append ? r.append : r.split,
          u,
          a = 0,
          f;e = t.use || t.define ? p(t, e, n || {}) : e, e = ("var out='" + (t.strip ? e.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "") : e).replace(/'|\\/g, "\\$&").replace(t.interpolate || i, function (e, t) {
        return s.start + m(t) + s.end;
      }).replace(t.encode || i, function (e, t) {
        return (u = !0, s.start + m(t) + s.endencode);
      }).replace(t.conditional || i, function (e, t, n) {
        return t ? n ? "';}else if(" + m(n) + "){out+='" : "';}else{out+='" : n ? "';if(" + m(n) + "){out+='" : "';}out+='";
      }).replace(t.iterate || i, function (e, t, n, r) {
        return t ? (a += 1, f = r || "i" + a, t = m(t), "';var arr" + a + "=" + t + ";if(arr" + a + "){var " + n + "," + f + "=-1,l" + a + "=arr" + a + ".length-1;while(" + f + "<l" + a + "){" + n + "=arr" + a + "[" + f + "+=1];out+='") : "';} } out+='";
      }).replace(t.evaluate || i, function (e, t) {
        return "';" + m(t) + "out+='";
      }) + "';return out;").replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").replace(/(\s|;|\}|^|\{)out\+='';/g, "$1").replace(/\+''/g, "").replace(/(\s|;|\}|^|\{)out\+=''\+/g, "$1out+="), u && t.selfcontained && (e = "String.prototype.encodeHTML=(" + o.toString() + "());" + e);try {
        return new Function(t.varname, e);
      } catch (l) {
        throw (typeof console != "undefined" && console.log("Could not create a template function: " + e), l);
      }
    }, j.compile = function (e, t) {
      return j.template(e, null, t);
    };
  })(), (function () {
    (function (e, t) {
      if (typeof exports == "object") module.exports = t(require("components/nova-doT/doT"));else if (typeof define == "function" && define.amd) define("components/nova-doT/main", ["components/nova-doT/doT"], t);else {
        var n = "NovaDoT",
            r = n.split("."),
            i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t(e._1);
      }
    })(this, function (e) {
      function t(t) {
        return ({ "components/nova-doT/doT": e })[t];
      }var n = NovaExports.__fixedUglify = "script>";return (NovaExports.exports = { stylesheet: ":host{display:block}", template: "\n        <content></content>\n    " }, NovaExports({ is: "nova-doT", props: { data: { type: Object } }, createdHandler: function createdHandler() {
          var e = this.querySelector("script").innerHTML;this.tmplFun = doT.template(e), this.on("_dataChanged", this.dataObserver);var t = this.tmplFun(this.data);this.refreshHTML(t);
        }, dataObserver: function dataObserver(e, t, n) {
          var r = this.tmplFun(n);this.refreshHTML(r);
        }, refreshHTML: function refreshHTML(e) {
          this.innerHTML = e;
        } }), n);
    });
  }).call(window);
})();