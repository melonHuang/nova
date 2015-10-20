"use strict";

(function () {
  var e;!(function (e) {
    function t() {
      return "Markdown.mk_block( " + uneval(this.toString()) + ", " + uneval(this.trailing) + ", " + uneval(this.lineNumber) + " )";
    }function n() {
      var e = util;return "Markdown.mk_block( " + e.inspect(this.toString()) + ", " + e.inspect(this.trailing) + ", " + e.inspect(this.lineNumber) + " )";
    }function r(e) {
      for (var t = 0, n = -1; -1 !== (n = e.indexOf("\n", n + 1));) t++;return t;
    }function i(e) {
      return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }function s(e) {
      if ("string" == typeof e) return i(e);var t = e.shift(),
          n = {},
          r = [];for (!e.length || "object" != typeof e[0] || e[0] instanceof Array || (n = e.shift()); e.length;) r.push(s(e.shift()));var o = "";for (var u in n) o += " " + u + "=\"" + i(n[u]) + "\"";return "img" === t || "br" === t || "hr" === t ? "<" + t + o + "/>" : "<" + t + o + ">" + r.join("") + "</" + t + ">";
    }function o(e, t, n) {
      var r;n = n || {};var i = e.slice(0);"function" == typeof n.preprocessTreeNode && (i = n.preprocessTreeNode(i, t));var s = d(i);if (s) {
        i[1] = {};for (r in s) i[1][r] = s[r];s = i[1];
      }if ("string" == typeof i) return i;switch (i[0]) {case "header":
          i[0] = "h" + i[1].level, delete i[1].level;break;case "bulletlist":
          i[0] = "ul";break;case "numberlist":
          i[0] = "ol";break;case "listitem":
          i[0] = "li";break;case "para":
          i[0] = "p";break;case "markdown":
          i[0] = "html", s && delete s.references;break;case "code_block":
          i[0] = "pre", r = s ? 2 : 1;var u = ["code"];u.push.apply(u, i.splice(r, i.length - r)), i[r] = u;break;case "inlinecode":
          i[0] = "code";break;case "img":
          i[1].src = i[1].href, delete i[1].href;break;case "linebreak":
          i[0] = "br";break;case "link":
          i[0] = "a";break;case "link_ref":
          i[0] = "a";var a = t[s.ref];if (!a) return s.original;delete s.ref, s.href = a.href, a.title && (s.title = a.title), delete s.original;break;case "img_ref":
          i[0] = "img";var a = t[s.ref];if (!a) return s.original;delete s.ref, s.src = a.href, a.title && (s.title = a.title), delete s.original;}if ((r = 1, s)) {
        for (var f in i[1]) {
          r = 2;break;
        }1 === r && i.splice(r, 1);
      }for (; r < i.length; ++r) i[r] = o(i[r], t, n);return i;
    }function u(e) {
      for (var t = d(e) ? 2 : 1; t < e.length;) "string" == typeof e[t] ? t + 1 < e.length && "string" == typeof e[t + 1] ? e[t] += e.splice(t + 1, 1)[0] : ++t : (u(e[t]), ++t);
    }function a(e, t) {
      function n(e) {
        this.len_after = e, this.name = "close_" + t;
      }var r = e + "_state",
          i = "strong" === e ? "em_state" : "strong_state";return function (s) {
        if (this[r][0] === t) return (this[r].shift(), [s.length, new n(s.length - t.length)]);var o = this[i].slice(),
            u = this[r].slice();this[r].unshift(t);var a = this.processInline(s.substr(t.length)),
            f = a[a.length - 1];if ((this[r].shift(), f instanceof n)) {
          a.pop();var l = s.length - f.len_after;return [l, [e].concat(a)];
        }return (this[i] = o, this[r] = u, [t.length, t]);
      };
    }function f(e) {
      for (var t = e.split(""), n = [""], r = !1; t.length;) {
        var i = t.shift();switch (i) {case " ":
            r ? n[n.length - 1] += i : n.push("");break;case "'":case "\"":
            r = !r;break;case "\\":
            i = t.shift();default:
            n[n.length - 1] += i;}
      }return n;
    }var l = {};l.mk_block = function (e, r, i) {
      1 === arguments.length && (r = "\n\n");var s = new String(e);return (s.trailing = r, s.inspect = n, s.toSource = t, void 0 !== i && (s.lineNumber = i), s);
    };var c = l.isArray = Array.isArray || function (e) {
      return "[object Array]" === Object.prototype.toString.call(e);
    };l.forEach = Array.prototype.forEach ? function (e, t, n) {
      return e.forEach(t, n);
    } : function (e, t, n) {
      for (var r = 0; r < e.length; r++) t.call(n || e, e[r], r, e);
    }, l.isEmpty = function (e) {
      for (var t in e) if (hasOwnProperty.call(e, t)) return !1;return !0;
    }, l.extract_attr = function (e) {
      return c(e) && e.length > 1 && "object" == typeof e[1] && !c(e[1]) ? e[1] : void 0;
    };var h = function h(e) {
      switch (typeof e) {case "undefined":
          this.dialect = h.dialects.Gruber;break;case "object":
          this.dialect = e;break;default:
          if (!(e in h.dialects)) throw new Error("Unknown Markdown dialect '" + String(e) + "'");this.dialect = h.dialects[e];}this.em_state = [], this.strong_state = [], this.debug_indent = "";
    };h.dialects = {};var p = h.mk_block = l.mk_block,
        c = l.isArray;h.parse = function (e, t) {
      var n = new h(t);return n.toTree(e);
    }, h.prototype.split_blocks = function (e) {
      e = e.replace(/(\r\n|\n|\r)/g, "\n");var t,
          n = /([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g,
          i = [],
          s = 1;for (null !== (t = /^(\s*\n)/.exec(e)) && (s += r(t[0]), n.lastIndex = t[0].length); null !== (t = n.exec(e));) "\n#" === t[2] && (t[2] = "\n", n.lastIndex--), i.push(p(t[1], t[2], s)), s += r(t[0]);return i;
    }, h.prototype.processBlock = function (e, t) {
      var n = this.dialect.block,
          r = n.__order__;if ("__call__" in n) return n.__call__.call(this, e, t);for (var i = 0; i < r.length; i++) {
        var s = n[r[i]].call(this, e, t);if (s) return ((!c(s) || s.length > 0 && !c(s[0])) && this.debug(r[i], "didn't return a proper array"), s);
      }return [];
    }, h.prototype.processInline = function (e) {
      return this.dialect.inline.__call__.call(this, String(e));
    }, h.prototype.toTree = function (e, t) {
      var n = e instanceof Array ? e : this.split_blocks(e),
          r = this.tree;try {
        for (this.tree = t || this.tree || ["markdown"]; n.length;) {
          var i = this.processBlock(n.shift(), n);i.length && this.tree.push.apply(this.tree, i);
        }return this.tree;
      } finally {
        t && (this.tree = r);
      }
    }, h.prototype.debug = function () {
      var e = Array.prototype.slice.call(arguments);e.unshift(this.debug_indent), "undefined" != typeof print && print.apply(print, e), "undefined" != typeof console && "undefined" != typeof console.log && console.log.apply(null, e);
    }, h.prototype.loop_re_over_block = function (e, t, n) {
      for (var r, i = t.valueOf(); i.length && null !== (r = e.exec(i));) i = i.substr(r[0].length), n.call(this, r);return i;
    }, h.buildBlockOrder = function (e) {
      var t = [];for (var n in e) "__order__" !== n && "__call__" !== n && t.push(n);e.__order__ = t;
    }, h.buildInlinePatterns = function (e) {
      var t = [];for (var n in e) if (!n.match(/^__.*__$/)) {
        var r = n.replace(/([\\.*+?|()\[\]{}])/g, "\\$1").replace(/\n/, "\\n");t.push(1 === n.length ? r : "(?:" + r + ")");
      }t = t.join("|"), e.__patterns__ = t;var i = e.__call__;e.__call__ = function (e, n) {
        return void 0 !== n ? i.call(this, e, n) : i.call(this, e, t);
      };
    };var d = l.extract_attr;h.renderJsonML = function (e, t) {
      t = t || {}, t.root = t.root || !1;var n = [];if (t.root) n.push(s(e));else for (e.shift(), !e.length || "object" != typeof e[0] || e[0] instanceof Array || e.shift(); e.length;) n.push(s(e.shift()));return n.join("\n\n");
    }, h.toHTMLTree = function (e, t, n) {
      "string" == typeof e && (e = this.parse(e, t));var r = d(e),
          i = {};r && r.references && (i = r.references);var s = o(e, i, n);return (u(s), s);
    }, h.toHTML = function (e, t, n) {
      var r = this.toHTMLTree(e, t, n);return this.renderJsonML(r);
    };var v = {};v.inline_until_char = function (e, t) {
      for (var n = 0, r = [];;) {
        if (e.charAt(n) === t) return (n++, [n, r]);if (n >= e.length) return null;var i = this.dialect.inline.__oneElement__.call(this, e.substr(n));n += i[0], r.push.apply(r, i.slice(1));
      }
    }, v.subclassDialect = function (e) {
      function t() {}function n() {}return (t.prototype = e.block, n.prototype = e.inline, { block: new t(), inline: new n() });
    };var m = l.forEach,
        d = l.extract_attr,
        p = l.mk_block,
        g = l.isEmpty,
        y = v.inline_until_char,
        b = { block: { atxHeader: function atxHeader(e, t) {
          var n = e.match(/^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/);if (!n) return void 0;var r = ["header", { level: n[1].length }];return (Array.prototype.push.apply(r, this.processInline(n[2])), n[0].length < e.length && t.unshift(p(e.substr(n[0].length), e.trailing, e.lineNumber + 2)), [r]);
        }, setextHeader: function setextHeader(e, t) {
          var n = e.match(/^(.*)\n([-=])\2\2+(?:\n|$)/);if (!n) return void 0;var r = "=" === n[2] ? 1 : 2,
              i = ["header", { level: r }, n[1]];return (n[0].length < e.length && t.unshift(p(e.substr(n[0].length), e.trailing, e.lineNumber + 2)), [i]);
        }, code: function code(e, t) {
          var n = [],
              r = /^(?: {0,3}\t| {4})(.*)\n?/;if (!e.match(r)) return void 0;e: for (;;) {
            var i = this.loop_re_over_block(r, e.valueOf(), function (e) {
              n.push(e[1]);
            });if (i.length) {
              t.unshift(p(i, e.trailing));break e;
            }if (!t.length) break e;if (!t[0].match(r)) break e;n.push(e.trailing.replace(/[^\n]/g, "").substring(2)), e = t.shift();
          }return [["code_block", n.join("\n")]];
        }, horizRule: function horizRule(e, t) {
          var n = e.match(/^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/);if (!n) return void 0;var r = [["hr"]];if (n[1]) {
            var i = p(n[1], "", e.lineNumber);r.unshift.apply(r, this.toTree(i, []));
          }return (n[3] && t.unshift(p(n[3], e.trailing, e.lineNumber + 1)), r);
        }, lists: (function () {
          function e(e) {
            return new RegExp("(?:^(" + a + "{0," + e + "} {0,3})(" + s + ")\\s+)|" + "(^" + a + "{0," + (e - 1) + "}[ ]{0,4})");
          }function t(e) {
            return e.replace(/ {0,3}\t/g, "    ");
          }function n(e, t, n, r) {
            if (t) return (e.push(["para"].concat(n)), void 0);var i = e[e.length - 1] instanceof Array && "para" === e[e.length - 1][0] ? e[e.length - 1] : e;r && e.length > 1 && n.unshift(r);for (var s = 0; s < n.length; s++) {
              var o = n[s],
                  u = "string" == typeof o;u && i.length > 1 && "string" == typeof i[i.length - 1] ? i[i.length - 1] += o : i.push(o);
            }
          }function r(e, t) {
            for (var n = new RegExp("^(" + a + "{" + e + "}.*?\\n?)*$"), r = new RegExp("^" + a + "{" + e + "}", "gm"), i = []; t.length > 0 && n.exec(t[0]);) {
              var s = t.shift(),
                  o = s.replace(r, "");i.push(p(o, s.trailing, s.lineNumber));
            }return i;
          }function i(e, t, n) {
            var r = e.list,
                i = r[r.length - 1];if (!(i[1] instanceof Array && "para" === i[1][0])) if (t + 1 === n.length) i.push(["para"].concat(i.splice(1, i.length - 1)));else {
              var s = i.pop();i.push(["para"].concat(i.splice(1, i.length - 1)), s);
            }
          }var s = "[*+-]|\\d+\\.",
              o = /[*+-]/,
              u = new RegExp("^( {0,3})(" + s + ")[  ]+"),
              a = "(?: {0,3}\\t| {4})";return function (s, a) {
            function f(e) {
              var t = o.exec(e[2]) ? ["bulletlist"] : ["numberlist"];return (p.push({ list: t, indent: e[1] }), t);
            }var l = s.match(u);if (!l) return void 0;for (var c, h, p = [], d = f(l), v = !1, g = [p[0].list];;) {
              for (var y = s.split(/(?=\n)/), b = "", w = "", E = 0; E < y.length; E++) {
                w = "";var S = y[E].replace(/^\n/, function (e) {
                  return (w = e, "");
                }),
                    x = e(p.length);if ((l = S.match(x), void 0 !== l[1])) {
                  b.length && (n(c, v, this.processInline(b), w), v = !1, b = ""), l[1] = t(l[1]);var T = Math.floor(l[1].length / 4) + 1;if (T > p.length) d = f(l), c.push(d), c = d[1] = ["listitem"];else {
                    var N = !1;for (h = 0; h < p.length; h++) if (p[h].indent === l[1]) {
                      d = p[h].list, p.splice(h + 1, p.length - (h + 1)), N = !0;break;
                    }N || (T++, T <= p.length ? (p.splice(T, p.length - T), d = p[T - 1].list) : (d = f(l), c.push(d))), c = ["listitem"], d.push(c);
                  }w = "";
                }S.length > l[0].length && (b += w + S.substr(l[0].length));
              }b.length && (n(c, v, this.processInline(b), w), v = !1, b = "");var C = r(p.length, a);C.length > 0 && (m(p, i, this), c.push.apply(c, this.toTree(C, [])));var k = a[0] && a[0].valueOf() || "";if (!k.match(u) && !k.match(/^ /)) break;s = a.shift();var L = this.dialect.block.horizRule(s, a);if (L) {
                g.push.apply(g, L);break;
              }m(p, i, this), v = !0;
            }return g;
          };
        })(), blockquote: function blockquote(e, t) {
          if (!e.match(/^>/m)) return void 0;var n = [];if (">" !== e[0]) {
            for (var r = e.split(/\n/), i = [], s = e.lineNumber; r.length && ">" !== r[0][0];) i.push(r.shift()), s++;var o = p(i.join("\n"), "\n", e.lineNumber);n.push.apply(n, this.processBlock(o, [])), e = p(r.join("\n"), e.trailing, s);
          }for (; t.length && ">" === t[0][0];) {
            var u = t.shift();e = p(e + e.trailing + u, u.trailing, e.lineNumber);
          }var a = e.replace(/^> ?/gm, ""),
              f = (this.tree, this.toTree(a, ["blockquote"])),
              l = d(f);return (l && l.references && (delete l.references, g(l) && f.splice(1, 1)), n.push(f), n);
        }, referenceDefn: function referenceDefn(e, t) {
          var n = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/;if (!e.match(n)) return void 0;d(this.tree) || this.tree.splice(1, 0, {});var r = d(this.tree);void 0 === r.references && (r.references = {});var i = this.loop_re_over_block(n, e, function (e) {
            e[2] && "<" === e[2][0] && ">" === e[2][e[2].length - 1] && (e[2] = e[2].substring(1, e[2].length - 1));var t = r.references[e[1].toLowerCase()] = { href: e[2] };void 0 !== e[4] ? t.title = e[4] : void 0 !== e[5] && (t.title = e[5]);
          });return (i.length && t.unshift(p(i, e.trailing)), []);
        }, para: function para(e) {
          return [["para"].concat(this.processInline(e))];
        } }, inline: { __oneElement__: function __oneElement__(e, t, n) {
          var r, i;t = t || this.dialect.inline.__patterns__;var s = new RegExp("([\\s\\S]*?)(" + (t.source || t) + ")");if ((r = s.exec(e), !r)) return [e.length, e];if (r[1]) return [r[1].length, r[1]];var i;return (r[2] in this.dialect.inline && (i = this.dialect.inline[r[2]].call(this, e.substr(r.index), r, n || [])), i = i || [r[2].length, r[2]]);
        }, __call__: function __call__(e, t) {
          function n(e) {
            "string" == typeof e && "string" == typeof i[i.length - 1] ? i[i.length - 1] += e : i.push(e);
          }for (var r, i = []; e.length > 0;) r = this.dialect.inline.__oneElement__.call(this, e, t, i), e = e.substr(r.shift()), m(r, n);return i;
        }, "]": function _() {}, "}": function _() {}, __escape__: /^\\[\\`\*_{}\[\]()#\+.!\-]/, "\\": function _(e) {
          return this.dialect.inline.__escape__.exec(e) ? [2, e.charAt(1)] : [1, "\\"];
        }, "![": function _(e) {
          var t = e.match(/^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/);if (t) {
            t[2] && "<" === t[2][0] && ">" === t[2][t[2].length - 1] && (t[2] = t[2].substring(1, t[2].length - 1)), t[2] = this.dialect.inline.__call__.call(this, t[2], /\\/)[0];var n = { alt: t[1], href: t[2] || "" };return (void 0 !== t[4] && (n.title = t[4]), [t[0].length, ["img", n]]);
          }return (t = e.match(/^!\[(.*?)\][ \t]*\[(.*?)\]/), t ? [t[0].length, ["img_ref", { alt: t[1], ref: t[2].toLowerCase(), original: t[0] }]] : [2, "!["]);
        }, "[": function E(e) {
          var t = String(e),
              n = y.call(this, e.substr(1), "]");if (!n) return [1, "["];var E,
              r,
              i = 1 + n[0],
              s = n[1];e = e.substr(i);var o = e.match(/^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/);if (o) {
            var u = o[1];if ((i += o[0].length, u && "<" === u[0] && ">" === u[u.length - 1] && (u = u.substring(1, u.length - 1)), !o[3])) for (var a = 1, f = 0; f < u.length; f++) switch (u[f]) {case "(":
                a++;break;case ")":
                0 === --a && (i -= u.length - f, u = u.substring(0, f));}return (u = this.dialect.inline.__call__.call(this, u, /\\/)[0], r = { href: u || "" }, void 0 !== o[3] && (r.title = o[3]), E = ["link", r].concat(s), [i, E]);
          }return (o = e.match(/^\s*\[(.*?)\]/), o ? (i += o[0].length, r = { ref: (o[1] || String(s)).toLowerCase(), original: t.substr(0, i) }, E = ["link_ref", r].concat(s), [i, E]) : 1 === s.length && "string" == typeof s[0] ? (r = { ref: s[0].toLowerCase(), original: t.substr(0, i) }, E = ["link_ref", r, s[0]], [i, E]) : [1, "["]);
        }, "<": function _(e) {
          var t;return null !== (t = e.match(/^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/)) ? t[3] ? [t[0].length, ["link", { href: "mailto:" + t[3] }, t[3]]] : "mailto" === t[2] ? [t[0].length, ["link", { href: t[1] }, t[1].substr("mailto:".length)]] : [t[0].length, ["link", { href: t[1] }, t[1]]] : [1, "<"];
        }, "`": function _(e) {
          var t = e.match(/(`+)(([\s\S]*?)\1)/);return t && t[2] ? [t[1].length + t[2].length, ["inlinecode", t[3]]] : [1, "`"];
        }, "  \n": function _() {
          return [3, ["linebreak"]];
        } } };b.inline["**"] = a("strong", "**"), b.inline.__ = a("strong", "__"), b.inline["*"] = a("em", "*"), b.inline._ = a("em", "_"), h.dialects.Gruber = b, h.buildBlockOrder(h.dialects.Gruber.block), h.buildInlinePatterns(h.dialects.Gruber.inline);var w = v.subclassDialect(b),
        d = l.extract_attr,
        m = l.forEach;w.processMetaHash = function (e) {
      for (var t = f(e), n = {}, r = 0; r < t.length; ++r) if (/^#/.test(t[r])) n.id = t[r].substring(1);else if (/^\./.test(t[r])) n["class"] = n["class"] ? n["class"] + t[r].replace(/./, " ") : t[r].substring(1);else if (/\=/.test(t[r])) {
        var i = t[r].split(/\=/);n[i[0]] = i[1];
      }return n;
    }, w.block.document_meta = function (e) {
      if (e.lineNumber > 1) return void 0;if (!e.match(/^(?:\w+:.*\n)*\w+:.*$/)) return void 0;d(this.tree) || this.tree.splice(1, 0, {});var t = e.split(/\n/);for (var n in t) {
        var r = t[n].match(/(\w+):\s*(.*)$/),
            i = r[1].toLowerCase(),
            s = r[2];this.tree[1][i] = s;
      }return [];
    }, w.block.block_meta = function (e) {
      var t = e.match(/(^|\n) {0,3}\{:\s*((?:\\\}|[^\}])*)\s*\}$/);if (!t) return void 0;var n,
          r = this.dialect.processMetaHash(t[2]);if ("" === t[1]) {
        var i = this.tree[this.tree.length - 1];if ((n = d(i), "string" == typeof i)) return void 0;n || (n = {}, i.splice(1, 0, n));for (var s in r) n[s] = r[s];return [];
      }var o = e.replace(/\n.*$/, ""),
          u = this.processBlock(o, []);n = d(u[0]), n || (n = {}, u[0].splice(1, 0, n));for (var s in r) n[s] = r[s];return u;
    }, w.block.definition_list = function (e, t) {
      var n,
          r,
          i = /^((?:[^\s:].*\n)+):\s+([\s\S]+)$/,
          s = ["dl"];if (!(r = e.match(i))) return void 0;for (var o = [e]; t.length && i.exec(t[0]);) o.push(t.shift());for (var u = 0; u < o.length; ++u) {
        var r = o[u].match(i),
            a = r[1].replace(/\n$/, "").split(/\n/),
            f = r[2].split(/\n:\s+/);for (n = 0; n < a.length; ++n) s.push(["dt", a[n]]);for (n = 0; n < f.length; ++n) s.push(["dd"].concat(this.processInline(f[n].replace(/(\n)\s+/, "$1"))));
      }return [s];
    }, w.block.table = function S(e) {
      var t,
          n,
          r = function r(e, t) {
        t = t || "\\s", t.match(/^[\\|\[\]{}?*.+^$]$/) && (t = "\\" + t);for (var n, r = [], i = new RegExp("^((?:\\\\.|[^\\\\" + t + "])*)" + t + "(.*)"); n = e.match(i);) r.push(n[1]), e = n[2];return (r.push(e), r);
      },
          i = /^ {0,3}\|(.+)\n {0,3}\|\s*([\-:]+[\-| :]*)\n((?:\s*\|.*(?:\n|$))*)(?=\n|$)/,
          s = /^ {0,3}(\S(?:\\.|[^\\|])*\|.*)\n {0,3}([\-:]+\s*\|[\-| :]*)\n((?:(?:\\.|[^\\|])*\|.*(?:\n|$))*)(?=\n|$)/;if (n = e.match(i)) n[3] = n[3].replace(/^\s*\|/gm, "");else if (!(n = e.match(s))) return void 0;var S = ["table", ["thead", ["tr"]], ["tbody"]];n[2] = n[2].replace(/\|\s*$/, "").split("|");var o = [];for (m(n[2], function (e) {
        e.match(/^\s*-+:\s*$/) ? o.push({ align: "right" }) : e.match(/^\s*:-+\s*$/) ? o.push({ align: "left" }) : e.match(/^\s*:-+:\s*$/) ? o.push({ align: "center" }) : o.push({});
      }), n[1] = r(n[1].replace(/\|\s*$/, ""), "|"), t = 0; t < n[1].length; t++) S[1][1].push(["th", o[t] || {}].concat(this.processInline(n[1][t].trim())));return (m(n[3].replace(/\|\s*$/gm, "").split("\n"), function (e) {
        var n = ["tr"];for (e = r(e, "|"), t = 0; t < e.length; t++) n.push(["td", o[t] || {}].concat(this.processInline(e[t].trim())));S[2].push(n);
      }, this), [S]);
    }, w.inline["{:"] = function (e, t, n) {
      if (!n.length) return [2, "{:"];var r = n[n.length - 1];if ("string" == typeof r) return [2, "{:"];var i = e.match(/^\{:\s*((?:\\\}|[^\}])*)\s*\}/);if (!i) return [2, "{:"];var s = this.dialect.processMetaHash(i[1]),
          o = d(r);o || (o = {}, r.splice(1, 0, o));for (var u in s) o[u] = s[u];return [i[0].length, ""];
    }, h.dialects.Maruku = w, h.dialects.Maruku.inline.__escape__ = /^\\[\\`\*_{}\[\]()#\+.!\-|:]/, h.buildBlockOrder(h.dialects.Maruku.block), h.buildInlinePatterns(h.dialects.Maruku.inline), e.Markdown = h, e.parse = h.parse, e.toHTML = h.toHTML, e.toHTMLTree = h.toHTMLTree, e.renderJsonML = h.renderJsonML;
  })((function () {
    return (window.markdown = {}, window.markdown);
  })()), e = undefined, (function () {
    (function (t, n) {
      if (typeof exports == "object") module.exports = n(e);else if (typeof define == "function" && define.amd) define("components/nova-markdown/main", ["components/nova-markdown/markdown.min"], n);else {
        var r = "NovaMarkdown",
            i = r.split("."),
            s = t;for (var o = 0; o < i.length - 1; o++) s[i[o]] === undefined && (s[i[o]] = {}), s = s[i[o]];s[i[i.length - 1]] = n(t._2);
      }
    })(this, function (e) {
      function t(t) {
        return ({ "components/nova-markdown/markdown.min": e })[t];
      }var n = NovaExports.__fixedUglify = "script>";NovaExports.exports = { stylesheet: "", template: "" };var r = NovaExports({ is: "nova-markdown", props: { content: String }, createdHandler: function createdHandler() {
          this.on("_contentChanged", this.contentChanged), this.content = this.innerHTML;
        }, contentChanged: function contentChanged() {
          this.innerHTML = markdown.toHTML(this.content);
        } });return n;
    });
  }).call(window);
})();