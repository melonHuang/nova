/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

"use strict";

(function () {
  var e, t;(function () {
    function n(e) {
      this.tokens = [], this.tokens.links = {}, this.options = e || h.defaults, this.rules = t.normal, this.options.gfm && (this.options.tables ? this.rules = t.tables : this.rules = t.gfm);
    }function i(e, t) {
      this.options = t || h.defaults, this.links = e, this.rules = r.normal, this.renderer = this.options.renderer || new s(), this.renderer.options = this.options;if (!this.links) throw new Error("Tokens array requires a `links` property.");this.options.gfm ? this.options.breaks ? this.rules = r.breaks : this.rules = r.gfm : this.options.pedantic && (this.rules = r.pedantic);
    }function s(e) {
      this.options = e || {};
    }function o(e) {
      this.tokens = [], this.token = null, this.options = e || h.defaults, this.options.renderer = this.options.renderer || new s(), this.renderer = this.options.renderer, this.renderer.options = this.options;
    }function u(e, t) {
      return e.replace(t ? /&/g : /&(?!#?\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }function a(e) {
      return e.replace(/&([#\w]+);/g, function (e, t) {
        return (t = t.toLowerCase(), t === "colon" ? ":" : t.charAt(0) === "#" ? t.charAt(1) === "x" ? String.fromCharCode(parseInt(t.substring(2), 16)) : String.fromCharCode(+t.substring(1)) : "");
      });
    }function f(e, t) {
      return (e = e.source, t = t || "", function n(r, i) {
        return r ? (i = i.source || i, i = i.replace(/(^|[^\[])\^/g, "$1"), e = e.replace(r, i), n) : new RegExp(e, t);
      });
    }function l() {}function c(e) {
      var t = 1,
          n,
          r;for (; t < arguments.length; t++) {
        n = arguments[t];for (r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
      }return e;
    }function h(e, t, r) {
      if (r || typeof t == "function") {
        r || (r = t, t = null), t = c({}, h.defaults, t || {});var i = t.highlight,
            s,
            a,
            f = 0;try {
          s = n.lex(e, t);
        } catch (l) {
          return r(l);
        }a = s.length;var p = function p(e) {
          if (e) return (t.highlight = i, r(e));var n;try {
            n = o.parse(s, t);
          } catch (u) {
            e = u;
          }return (t.highlight = i, e ? r(e) : r(null, n));
        };if (!i || i.length < 3) return p();delete t.highlight;if (!a) return p();for (; f < s.length; f++) (function (e) {
          return e.type !== "code" ? --a || p() : i(e.text, e.lang, function (t, n) {
            if (t) return p(t);if (n == null || n === e.text) return --a || p();e.text = n, e.escaped = !0, --a || p();
          });
        })(s[f]);return;
      }try {
        return (t && (t = c({}, h.defaults, t)), o.parse(n.lex(e, t), t));
      } catch (l) {
        l.message += "\nPlease report this to https://github.com/chjj/marked.";if ((t || h.defaults).silent) return "<p>An error occured:</p><pre>" + u(l.message + "", !0) + "</pre>";throw l;
      }
    }var t = { newline: /^\n+/, code: /^( {4}[^\n]+\n*)+/, fences: l, hr: /^( *[-*_]){3,} *(?:\n+|$)/, heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/, nptable: l, lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/, blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/, list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/, html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/, def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/, table: l, paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/, text: /^[^\n]+/ };t.bullet = /(?:[*+-]|\d+\.)/, t.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/, t.item = f(t.item, "gm")(/bull/g, t.bullet)(), t.list = f(t.list)(/bull/g, t.bullet)("hr", "\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def", "\\n+(?=" + t.def.source + ")")(), t.blockquote = f(t.blockquote)("def", t.def)(), t._tag = "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b", t.html = f(t.html)("comment", /<!--[\s\S]*?-->/)("closed", /<(tag)[\s\S]+?<\/\1>/)("closing", /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g, t._tag)(), t.paragraph = f(t.paragraph)("hr", t.hr)("heading", t.heading)("lheading", t.lheading)("blockquote", t.blockquote)("tag", "<" + t._tag)("def", t.def)(), t.normal = c({}, t), t.gfm = c({}, t.normal, { fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/, paragraph: /^/, heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/ }), t.gfm.paragraph = f(t.paragraph)("(?!", "(?!" + t.gfm.fences.source.replace("\\1", "\\2") + "|" + t.list.source.replace("\\1", "\\3") + "|")(), t.tables = c({}, t.gfm, { nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/, table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/ }), n.rules = t, n.lex = function (e, t) {
      var r = new n(t);return r.lex(e);
    }, n.prototype.lex = function (e) {
      return (e = e.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    ").replace(/\u00a0/g, " ").replace(/\u2424/g, "\n"), this.token(e, !0));
    }, n.prototype.token = function (e, n, r) {
      var e = e.replace(/^ +$/gm, ""),
          i,
          s,
          o,
          u,
          a,
          f,
          l,
          c,
          h;while (e) {
        if (o = this.rules.newline.exec(e)) e = e.substring(o[0].length), o[0].length > 1 && this.tokens.push({ type: "space" });if (o = this.rules.code.exec(e)) {
          e = e.substring(o[0].length), o = o[0].replace(/^ {4}/gm, ""), this.tokens.push({ type: "code", text: this.options.pedantic ? o : o.replace(/\n+$/, "") });continue;
        }if (o = this.rules.fences.exec(e)) {
          e = e.substring(o[0].length), this.tokens.push({ type: "code", lang: o[2], text: o[3] || "" });continue;
        }if (o = this.rules.heading.exec(e)) {
          e = e.substring(o[0].length), this.tokens.push({ type: "heading", depth: o[1].length, text: o[2] });continue;
        }if (n && (o = this.rules.nptable.exec(e))) {
          e = e.substring(o[0].length), f = { type: "table", header: o[1].replace(/^ *| *\| *$/g, "").split(/ *\| */), align: o[2].replace(/^ *|\| *$/g, "").split(/ *\| */), cells: o[3].replace(/\n$/, "").split("\n") };for (c = 0; c < f.align.length; c++) /^ *-+: *$/.test(f.align[c]) ? f.align[c] = "right" : /^ *:-+: *$/.test(f.align[c]) ? f.align[c] = "center" : /^ *:-+ *$/.test(f.align[c]) ? f.align[c] = "left" : f.align[c] = null;for (c = 0; c < f.cells.length; c++) f.cells[c] = f.cells[c].split(/ *\| */);this.tokens.push(f);continue;
        }if (o = this.rules.lheading.exec(e)) {
          e = e.substring(o[0].length), this.tokens.push({ type: "heading", depth: o[2] === "=" ? 1 : 2, text: o[1] });continue;
        }if (o = this.rules.hr.exec(e)) {
          e = e.substring(o[0].length), this.tokens.push({ type: "hr" });continue;
        }if (o = this.rules.blockquote.exec(e)) {
          e = e.substring(o[0].length), this.tokens.push({ type: "blockquote_start" }), o = o[0].replace(/^ *> ?/gm, ""), this.token(o, n, !0), this.tokens.push({ type: "blockquote_end" });continue;
        }if (o = this.rules.list.exec(e)) {
          e = e.substring(o[0].length), u = o[2], this.tokens.push({ type: "list_start", ordered: u.length > 1 }), o = o[0].match(this.rules.item), i = !1, h = o.length, c = 0;for (; c < h; c++) f = o[c], l = f.length, f = f.replace(/^ *([*+-]|\d+\.) +/, ""), ~f.indexOf("\n ") && (l -= f.length, f = this.options.pedantic ? f.replace(/^ {1,4}/gm, "") : f.replace(new RegExp("^ {1," + l + "}", "gm"), "")), this.options.smartLists && c !== h - 1 && (a = t.bullet.exec(o[c + 1])[0], u !== a && !(u.length > 1 && a.length > 1) && (e = o.slice(c + 1).join("\n") + e, c = h - 1)), s = i || /\n\n(?!\s*$)/.test(f), c !== h - 1 && (i = f.charAt(f.length - 1) === "\n", s || (s = i)), this.tokens.push({ type: s ? "loose_item_start" : "list_item_start" }), this.token(f, !1, r), this.tokens.push({ type: "list_item_end" });this.tokens.push({ type: "list_end" });continue;
        }if (o = this.rules.html.exec(e)) {
          e = e.substring(o[0].length), this.tokens.push({ type: this.options.sanitize ? "paragraph" : "html", pre: !this.options.sanitizer && (o[1] === "pre" || o[1] === "script" || o[1] === "style"), text: o[0] });continue;
        }if (!r && n && (o = this.rules.def.exec(e))) {
          e = e.substring(o[0].length), this.tokens.links[o[1].toLowerCase()] = { href: o[2], title: o[3] };continue;
        }if (n && (o = this.rules.table.exec(e))) {
          e = e.substring(o[0].length), f = { type: "table", header: o[1].replace(/^ *| *\| *$/g, "").split(/ *\| */), align: o[2].replace(/^ *|\| *$/g, "").split(/ *\| */), cells: o[3].replace(/(?: *\| *)?\n$/, "").split("\n") };for (c = 0; c < f.align.length; c++) /^ *-+: *$/.test(f.align[c]) ? f.align[c] = "right" : /^ *:-+: *$/.test(f.align[c]) ? f.align[c] = "center" : /^ *:-+ *$/.test(f.align[c]) ? f.align[c] = "left" : f.align[c] = null;for (c = 0; c < f.cells.length; c++) f.cells[c] = f.cells[c].replace(/^ *\| *| *\| *$/g, "").split(/ *\| */);this.tokens.push(f);continue;
        }if (n && (o = this.rules.paragraph.exec(e))) {
          e = e.substring(o[0].length), this.tokens.push({ type: "paragraph", text: o[1].charAt(o[1].length - 1) === "\n" ? o[1].slice(0, -1) : o[1] });continue;
        }if (o = this.rules.text.exec(e)) {
          e = e.substring(o[0].length), this.tokens.push({ type: "text", text: o[0] });continue;
        }if (e) throw new Error("Infinite loop on byte: " + e.charCodeAt(0));
      }return this.tokens;
    };var r = { escape: /^\\([\\`*{}\[\]()#+\-.!_>])/, autolink: /^<([^ >]+(@|:\/)[^ >]+)>/, url: l, tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/, link: /^!?\[(inside)\]\(href\)/, reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/, nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/, strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/, em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/, code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/, br: /^ {2,}\n(?!\s*$)/, del: l, text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/ };r._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/, r._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/, r.link = f(r.link)("inside", r._inside)("href", r._href)(), r.reflink = f(r.reflink)("inside", r._inside)(), r.normal = c({}, r), r.pedantic = c({}, r.normal, { strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/, em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/ }), r.gfm = c({}, r.normal, { escape: f(r.escape)("])", "~|])")(), url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/, del: /^~~(?=\S)([\s\S]*?\S)~~/, text: f(r.text)("]|", "~]|")("|", "|https?://|")() }), r.breaks = c({}, r.gfm, { br: f(r.br)("{2,}", "*")(), text: f(r.gfm.text)("{2,}", "*")() }), i.rules = r, i.output = function (e, t, n) {
      var r = new i(t, n);return r.output(e);
    }, i.prototype.output = function (e) {
      var t = "",
          n,
          r,
          i,
          s;while (e) {
        if (s = this.rules.escape.exec(e)) {
          e = e.substring(s[0].length), t += s[1];continue;
        }if (s = this.rules.autolink.exec(e)) {
          e = e.substring(s[0].length), s[2] === "@" ? (r = s[1].charAt(6) === ":" ? this.mangle(s[1].substring(7)) : this.mangle(s[1]), i = this.mangle("mailto:") + r) : (r = u(s[1]), i = r), t += this.renderer.link(i, null, r);continue;
        }if (!this.inLink && (s = this.rules.url.exec(e))) {
          e = e.substring(s[0].length), r = u(s[1]), i = r, t += this.renderer.link(i, null, r);continue;
        }if (s = this.rules.tag.exec(e)) {
          !this.inLink && /^<a /i.test(s[0]) ? this.inLink = !0 : this.inLink && /^<\/a>/i.test(s[0]) && (this.inLink = !1), e = e.substring(s[0].length), t += this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(s[0]) : u(s[0]) : s[0];continue;
        }if (s = this.rules.link.exec(e)) {
          e = e.substring(s[0].length), this.inLink = !0, t += this.outputLink(s, { href: s[2], title: s[3] }), this.inLink = !1;continue;
        }if ((s = this.rules.reflink.exec(e)) || (s = this.rules.nolink.exec(e))) {
          e = e.substring(s[0].length), n = (s[2] || s[1]).replace(/\s+/g, " "), n = this.links[n.toLowerCase()];if (!n || !n.href) {
            t += s[0].charAt(0), e = s[0].substring(1) + e;continue;
          }this.inLink = !0, t += this.outputLink(s, n), this.inLink = !1;continue;
        }if (s = this.rules.strong.exec(e)) {
          e = e.substring(s[0].length), t += this.renderer.strong(this.output(s[2] || s[1]));continue;
        }if (s = this.rules.em.exec(e)) {
          e = e.substring(s[0].length), t += this.renderer.em(this.output(s[2] || s[1]));continue;
        }if (s = this.rules.code.exec(e)) {
          e = e.substring(s[0].length), t += this.renderer.codespan(u(s[2], !0));continue;
        }if (s = this.rules.br.exec(e)) {
          e = e.substring(s[0].length), t += this.renderer.br();continue;
        }if (s = this.rules.del.exec(e)) {
          e = e.substring(s[0].length), t += this.renderer.del(this.output(s[1]));continue;
        }if (s = this.rules.text.exec(e)) {
          e = e.substring(s[0].length), t += this.renderer.text(u(this.smartypants(s[0])));continue;
        }if (e) throw new Error("Infinite loop on byte: " + e.charCodeAt(0));
      }return t;
    }, i.prototype.outputLink = function (e, t) {
      var n = u(t.href),
          r = t.title ? u(t.title) : null;return e[0].charAt(0) !== "!" ? this.renderer.link(n, r, this.output(e[1])) : this.renderer.image(n, r, u(e[1]));
    }, i.prototype.smartypants = function (e) {
      return this.options.smartypants ? e.replace(/---/g, "—").replace(/--/g, "–").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1‘").replace(/'/g, "’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1“").replace(/"/g, "”").replace(/\.{3}/g, "…") : e;
    }, i.prototype.mangle = function (e) {
      if (!this.options.mangle) return e;var t = "",
          n = e.length,
          r = 0,
          i;for (; r < n; r++) i = e.charCodeAt(r), Math.random() > .5 && (i = "x" + i.toString(16)), t += "&#" + i + ";";return t;
    }, s.prototype.code = function (e, t, n) {
      if (this.options.highlight) {
        var r = this.options.highlight(e, t);r != null && r !== e && (n = !0, e = r);
      }return t ? "<pre><code class=\"" + this.options.langPrefix + u(t, !0) + "\">" + (n ? e : u(e, !0)) + "\n</code></pre>\n" : "<pre><code>" + (n ? e : u(e, !0)) + "\n</code></pre>";
    }, s.prototype.blockquote = function (e) {
      return "<blockquote>\n" + e + "</blockquote>\n";
    }, s.prototype.html = function (e) {
      return e;
    }, s.prototype.heading = function (e, t, n) {
      return "<h" + t + " id=\"" + this.options.headerPrefix + n.toLowerCase().replace(/[^\w]+/g, "-") + "\">" + e + "</h" + t + ">\n";
    }, s.prototype.hr = function () {
      return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
    }, s.prototype.list = function (e, t) {
      var n = t ? "ol" : "ul";return "<" + n + ">\n" + e + "</" + n + ">\n";
    }, s.prototype.listitem = function (e) {
      return "<li>" + e + "</li>\n";
    }, s.prototype.paragraph = function (e) {
      return "<p>" + e + "</p>\n";
    }, s.prototype.table = function (e, t) {
      return "<table>\n<thead>\n" + e + "</thead>\n" + "<tbody>\n" + t + "</tbody>\n" + "</table>\n";
    }, s.prototype.tablerow = function (e) {
      return "<tr>\n" + e + "</tr>\n";
    }, s.prototype.tablecell = function (e, t) {
      var n = t.header ? "th" : "td",
          r = t.align ? "<" + n + " style=\"text-align:" + t.align + "\">" : "<" + n + ">";return r + e + "</" + n + ">\n";
    }, s.prototype.strong = function (e) {
      return "<strong>" + e + "</strong>";
    }, s.prototype.em = function (e) {
      return "<em>" + e + "</em>";
    }, s.prototype.codespan = function (e) {
      return "<code>" + e + "</code>";
    }, s.prototype.br = function () {
      return this.options.xhtml ? "<br/>" : "<br>";
    }, s.prototype.del = function (e) {
      return "<del>" + e + "</del>";
    }, s.prototype.link = function (e, t, n) {
      if (this.options.sanitize) {
        try {
          var r = decodeURIComponent(a(e)).replace(/[^\w:]/g, "").toLowerCase();
        } catch (i) {
          return "";
        }if (r.indexOf("javascript:") === 0 || r.indexOf("vbscript:") === 0) return "";
      }var s = "<a href=\"" + e + "\"";return (t && (s += " title=\"" + t + "\""), s += ">" + n + "</a>", s);
    }, s.prototype.image = function (e, t, n) {
      var r = "<img src=\"" + e + "\" alt=\"" + n + "\"";return (t && (r += " title=\"" + t + "\""), r += this.options.xhtml ? "/>" : ">", r);
    }, s.prototype.text = function (e) {
      return e;
    }, o.parse = function (e, t, n) {
      var r = new o(t, n);return r.parse(e);
    }, o.prototype.parse = function (e) {
      this.inline = new i(e.links, this.options, this.renderer), this.tokens = e.reverse();var t = "";while (this.next()) t += this.tok();return t;
    }, o.prototype.next = function () {
      return this.token = this.tokens.pop();
    }, o.prototype.peek = function () {
      return this.tokens[this.tokens.length - 1] || 0;
    }, o.prototype.parseText = function () {
      var e = this.token.text;while (this.peek().type === "text") e += "\n" + this.next().text;return this.inline.output(e);
    }, o.prototype.tok = function () {
      switch (this.token.type) {case "space":
          return "";case "hr":
          return this.renderer.hr();case "heading":
          return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, this.token.text);case "code":
          return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);case "table":
          var e = "",
              t = "",
              n,
              r,
              i,
              s,
              o;i = "";for (n = 0; n < this.token.header.length; n++) s = { header: !0, align: this.token.align[n] }, i += this.renderer.tablecell(this.inline.output(this.token.header[n]), { header: !0, align: this.token.align[n] });e += this.renderer.tablerow(i);for (n = 0; n < this.token.cells.length; n++) {
            r = this.token.cells[n], i = "";for (o = 0; o < r.length; o++) i += this.renderer.tablecell(this.inline.output(r[o]), { header: !1, align: this.token.align[o] });t += this.renderer.tablerow(i);
          }return this.renderer.table(e, t);case "blockquote_start":
          var t = "";while (this.next().type !== "blockquote_end") t += this.tok();return this.renderer.blockquote(t);case "list_start":
          var t = "",
              u = this.token.ordered;while (this.next().type !== "list_end") t += this.tok();return this.renderer.list(t, u);case "list_item_start":
          var t = "";while (this.next().type !== "list_item_end") t += this.token.type === "text" ? this.parseText() : this.tok();return this.renderer.listitem(t);case "loose_item_start":
          var t = "";while (this.next().type !== "list_item_end") t += this.tok();return this.renderer.listitem(t);case "html":
          var a = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;return this.renderer.html(a);case "paragraph":
          return this.renderer.paragraph(this.inline.output(this.token.text));case "text":
          return this.renderer.paragraph(this.parseText());}
    }, l.exec = l, h.options = h.setOptions = function (e) {
      return (c(h.defaults, e), h);
    }, h.defaults = { gfm: !0, tables: !0, breaks: !1, pedantic: !1, sanitize: !1, sanitizer: null, mangle: !0, smartLists: !1, silent: !1, highlight: null, langPrefix: "lang-", smartypants: !1, headerPrefix: "", renderer: new s(), xhtml: !1 }, h.Parser = o, h.parser = o.parse, h.Renderer = s, h.Lexer = n, h.lexer = n.lex, h.InlineLexer = i, h.inlineLexer = i.output, h.parse = h, typeof module != "undefined" && typeof exports == "object" ? module.exports = h : e = (function () {
      return h;
    })();
  }).call((function () {
    return this || (typeof window != "undefined" ? window : global);
  })()), (function () {
    (function (n, r) {
      typeof exports == "object" ? module.exports = r(e) : t = (function (e) {
        return typeof r == "function" ? r(e) : r;
      })(e);
    })(this, function (e) {
      function t(t) {
        return ({ "components/nova-markdown/marked": e })[t];
      }var n = undefined;return (NovaExports.__fixedUglify = "script>", NovaExports.exports = { stylesheet: ":host{display:block;padding:15px 20px;border:1px solid rgba(16,16,16,.1);background:#fff}textarea{width:100%;height:100px;resize:none;padding:5px}", template: "\n        <h3>Markdown Editor</h3>\n        <textarea value=\"{{content::input}}\"></textarea>\n        <p></p>\n    " }, NovaExports({ is: "markdown-editor", props: { content: { type: String, value: "# Hello\nType some markdown here." } }, createdHandler: function createdHandler() {
          this.on("_contentChanged", this.contentObserver), this.render();
        }, attachedHandler: function attachedHandler() {
          alert("attached");
        }, detachedHandler: function detachedHandler() {
          alert("detached");
        }, contentObserver: function contentObserver(e, t, n) {
          this.render();
        }, render: function render() {
          this.querySelector("p").innerHTML = marked(this.content);
        } }), n);
    });
  }).call(window);
})();