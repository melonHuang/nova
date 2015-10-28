/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

"use strict";

(function () {
  (function () {
    (function () {
      function e(e) {
        this.tokens = [], this.tokens.links = {}, this.options = e || f.defaults, this.rules = l.normal, this.options.gfm && (this.options.tables ? this.rules = l.tables : this.rules = l.gfm);
      }function t(e, t) {
        this.options = t || f.defaults, this.links = e, this.rules = c.normal, this.renderer = this.options.renderer || new n(), this.renderer.options = this.options;if (!this.links) throw new Error("Tokens array requires a `links` property.");this.options.gfm ? this.options.breaks ? this.rules = c.breaks : this.rules = c.gfm : this.options.pedantic && (this.rules = c.pedantic);
      }function n(e) {
        this.options = e || {};
      }function r(e) {
        this.tokens = [], this.token = null, this.options = e || f.defaults, this.options.renderer = this.options.renderer || new n(), this.renderer = this.options.renderer, this.renderer.options = this.options;
      }function i(e, t) {
        return e.replace(t ? /&/g : /&(?!#?\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      }function s(e) {
        return e.replace(/&([#\w]+);/g, function (e, t) {
          return (t = t.toLowerCase(), t === "colon" ? ":" : t.charAt(0) === "#" ? t.charAt(1) === "x" ? String.fromCharCode(parseInt(t.substring(2), 16)) : String.fromCharCode(+t.substring(1)) : "");
        });
      }function o(e, t) {
        return (e = e.source, t = t || "", function n(r, i) {
          return r ? (i = i.source || i, i = i.replace(/(^|[^\[])\^/g, "$1"), e = e.replace(r, i), n) : new RegExp(e, t);
        });
      }function u() {}function a(e) {
        var t = 1,
            n,
            r;for (; t < arguments.length; t++) {
          n = arguments[t];for (r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
        }return e;
      }function f(t, n, s) {
        if (s || typeof n == "function") {
          s || (s = n, n = null), n = a({}, f.defaults, n || {});var o = n.highlight,
              u,
              l,
              c = 0;try {
            u = e.lex(t, n);
          } catch (h) {
            return s(h);
          }l = u.length;var p = function p(t) {
            if (t) return (n.highlight = o, s(t));var i;try {
              i = r.parse(u, n);
            } catch (a) {
              t = a;
            }return (n.highlight = o, t ? s(t) : s(null, i));
          };if (!o || o.length < 3) return p();delete n.highlight;if (!l) return p();for (; c < u.length; c++) (function (e) {
            return e.type !== "code" ? --l || p() : o(e.text, e.lang, function (t, n) {
              if (t) return p(t);if (n == null || n === e.text) return --l || p();e.text = n, e.escaped = !0, --l || p();
            });
          })(u[c]);return;
        }try {
          return (n && (n = a({}, f.defaults, n)), r.parse(e.lex(t, n), n));
        } catch (h) {
          h.message += "\nPlease report this to https://github.com/chjj/marked.";if ((n || f.defaults).silent) return "<p>An error occured:</p><pre>" + i(h.message + "", !0) + "</pre>";throw h;
        }
      }var l = { newline: /^\n+/, code: /^( {4}[^\n]+\n*)+/, fences: u, hr: /^( *[-*_]){3,} *(?:\n+|$)/, heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/, nptable: u, lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/, blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/, list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/, html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/, def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/, table: u, paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/, text: /^[^\n]+/ };l.bullet = /(?:[*+-]|\d+\.)/, l.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/, l.item = o(l.item, "gm")(/bull/g, l.bullet)(), l.list = o(l.list)(/bull/g, l.bullet)("hr", "\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def", "\\n+(?=" + l.def.source + ")")(), l.blockquote = o(l.blockquote)("def", l.def)(), l._tag = "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b", l.html = o(l.html)("comment", /<!--[\s\S]*?-->/)("closed", /<(tag)[\s\S]+?<\/\1>/)("closing", /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g, l._tag)(), l.paragraph = o(l.paragraph)("hr", l.hr)("heading", l.heading)("lheading", l.lheading)("blockquote", l.blockquote)("tag", "<" + l._tag)("def", l.def)(), l.normal = a({}, l), l.gfm = a({}, l.normal, { fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/, paragraph: /^/, heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/ }), l.gfm.paragraph = o(l.paragraph)("(?!", "(?!" + l.gfm.fences.source.replace("\\1", "\\2") + "|" + l.list.source.replace("\\1", "\\3") + "|")(), l.tables = a({}, l.gfm, { nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/, table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/ }), e.rules = l, e.lex = function (t, n) {
        var r = new e(n);return r.lex(t);
      }, e.prototype.lex = function (e) {
        return (e = e.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    ").replace(/\u00a0/g, " ").replace(/\u2424/g, "\n"), this.token(e, !0));
      }, e.prototype.token = function (e, t, n) {
        var e = e.replace(/^ +$/gm, ""),
            r,
            i,
            s,
            o,
            u,
            a,
            f,
            c,
            h;while (e) {
          if (s = this.rules.newline.exec(e)) e = e.substring(s[0].length), s[0].length > 1 && this.tokens.push({ type: "space" });if (s = this.rules.code.exec(e)) {
            e = e.substring(s[0].length), s = s[0].replace(/^ {4}/gm, ""), this.tokens.push({ type: "code", text: this.options.pedantic ? s : s.replace(/\n+$/, "") });continue;
          }if (s = this.rules.fences.exec(e)) {
            e = e.substring(s[0].length), this.tokens.push({ type: "code", lang: s[2], text: s[3] || "" });continue;
          }if (s = this.rules.heading.exec(e)) {
            e = e.substring(s[0].length), this.tokens.push({ type: "heading", depth: s[1].length, text: s[2] });continue;
          }if (t && (s = this.rules.nptable.exec(e))) {
            e = e.substring(s[0].length), a = { type: "table", header: s[1].replace(/^ *| *\| *$/g, "").split(/ *\| */), align: s[2].replace(/^ *|\| *$/g, "").split(/ *\| */), cells: s[3].replace(/\n$/, "").split("\n") };for (c = 0; c < a.align.length; c++) /^ *-+: *$/.test(a.align[c]) ? a.align[c] = "right" : /^ *:-+: *$/.test(a.align[c]) ? a.align[c] = "center" : /^ *:-+ *$/.test(a.align[c]) ? a.align[c] = "left" : a.align[c] = null;for (c = 0; c < a.cells.length; c++) a.cells[c] = a.cells[c].split(/ *\| */);this.tokens.push(a);continue;
          }if (s = this.rules.lheading.exec(e)) {
            e = e.substring(s[0].length), this.tokens.push({ type: "heading", depth: s[2] === "=" ? 1 : 2, text: s[1] });continue;
          }if (s = this.rules.hr.exec(e)) {
            e = e.substring(s[0].length), this.tokens.push({ type: "hr" });continue;
          }if (s = this.rules.blockquote.exec(e)) {
            e = e.substring(s[0].length), this.tokens.push({ type: "blockquote_start" }), s = s[0].replace(/^ *> ?/gm, ""), this.token(s, t, !0), this.tokens.push({ type: "blockquote_end" });continue;
          }if (s = this.rules.list.exec(e)) {
            e = e.substring(s[0].length), o = s[2], this.tokens.push({ type: "list_start", ordered: o.length > 1 }), s = s[0].match(this.rules.item), r = !1, h = s.length, c = 0;for (; c < h; c++) a = s[c], f = a.length, a = a.replace(/^ *([*+-]|\d+\.) +/, ""), ~a.indexOf("\n ") && (f -= a.length, a = this.options.pedantic ? a.replace(/^ {1,4}/gm, "") : a.replace(new RegExp("^ {1," + f + "}", "gm"), "")), this.options.smartLists && c !== h - 1 && (u = l.bullet.exec(s[c + 1])[0], o !== u && !(o.length > 1 && u.length > 1) && (e = s.slice(c + 1).join("\n") + e, c = h - 1)), i = r || /\n\n(?!\s*$)/.test(a), c !== h - 1 && (r = a.charAt(a.length - 1) === "\n", i || (i = r)), this.tokens.push({ type: i ? "loose_item_start" : "list_item_start" }), this.token(a, !1, n), this.tokens.push({ type: "list_item_end" });this.tokens.push({ type: "list_end" });continue;
          }if (s = this.rules.html.exec(e)) {
            e = e.substring(s[0].length), this.tokens.push({ type: this.options.sanitize ? "paragraph" : "html", pre: !this.options.sanitizer && (s[1] === "pre" || s[1] === "script" || s[1] === "style"), text: s[0] });continue;
          }if (!n && t && (s = this.rules.def.exec(e))) {
            e = e.substring(s[0].length), this.tokens.links[s[1].toLowerCase()] = { href: s[2], title: s[3] };continue;
          }if (t && (s = this.rules.table.exec(e))) {
            e = e.substring(s[0].length), a = { type: "table", header: s[1].replace(/^ *| *\| *$/g, "").split(/ *\| */), align: s[2].replace(/^ *|\| *$/g, "").split(/ *\| */), cells: s[3].replace(/(?: *\| *)?\n$/, "").split("\n") };for (c = 0; c < a.align.length; c++) /^ *-+: *$/.test(a.align[c]) ? a.align[c] = "right" : /^ *:-+: *$/.test(a.align[c]) ? a.align[c] = "center" : /^ *:-+ *$/.test(a.align[c]) ? a.align[c] = "left" : a.align[c] = null;for (c = 0; c < a.cells.length; c++) a.cells[c] = a.cells[c].replace(/^ *\| *| *\| *$/g, "").split(/ *\| */);this.tokens.push(a);continue;
          }if (t && (s = this.rules.paragraph.exec(e))) {
            e = e.substring(s[0].length), this.tokens.push({ type: "paragraph", text: s[1].charAt(s[1].length - 1) === "\n" ? s[1].slice(0, -1) : s[1] });continue;
          }if (s = this.rules.text.exec(e)) {
            e = e.substring(s[0].length), this.tokens.push({ type: "text", text: s[0] });continue;
          }if (e) throw new Error("Infinite loop on byte: " + e.charCodeAt(0));
        }return this.tokens;
      };var c = { escape: /^\\([\\`*{}\[\]()#+\-.!_>])/, autolink: /^<([^ >]+(@|:\/)[^ >]+)>/, url: u, tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/, link: /^!?\[(inside)\]\(href\)/, reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/, nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/, strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/, em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/, code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/, br: /^ {2,}\n(?!\s*$)/, del: u, text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/ };c._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/, c._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/, c.link = o(c.link)("inside", c._inside)("href", c._href)(), c.reflink = o(c.reflink)("inside", c._inside)(), c.normal = a({}, c), c.pedantic = a({}, c.normal, { strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/, em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/ }), c.gfm = a({}, c.normal, { escape: o(c.escape)("])", "~|])")(), url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/, del: /^~~(?=\S)([\s\S]*?\S)~~/, text: o(c.text)("]|", "~]|")("|", "|https?://|")() }), c.breaks = a({}, c.gfm, { br: o(c.br)("{2,}", "*")(), text: o(c.gfm.text)("{2,}", "*")() }), t.rules = c, t.output = function (e, n, r) {
        var i = new t(n, r);return i.output(e);
      }, t.prototype.output = function (e) {
        var t = "",
            n,
            r,
            s,
            o;while (e) {
          if (o = this.rules.escape.exec(e)) {
            e = e.substring(o[0].length), t += o[1];continue;
          }if (o = this.rules.autolink.exec(e)) {
            e = e.substring(o[0].length), o[2] === "@" ? (r = o[1].charAt(6) === ":" ? this.mangle(o[1].substring(7)) : this.mangle(o[1]), s = this.mangle("mailto:") + r) : (r = i(o[1]), s = r), t += this.renderer.link(s, null, r);continue;
          }if (!this.inLink && (o = this.rules.url.exec(e))) {
            e = e.substring(o[0].length), r = i(o[1]), s = r, t += this.renderer.link(s, null, r);continue;
          }if (o = this.rules.tag.exec(e)) {
            !this.inLink && /^<a /i.test(o[0]) ? this.inLink = !0 : this.inLink && /^<\/a>/i.test(o[0]) && (this.inLink = !1), e = e.substring(o[0].length), t += this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(o[0]) : i(o[0]) : o[0];continue;
          }if (o = this.rules.link.exec(e)) {
            e = e.substring(o[0].length), this.inLink = !0, t += this.outputLink(o, { href: o[2], title: o[3] }), this.inLink = !1;continue;
          }if ((o = this.rules.reflink.exec(e)) || (o = this.rules.nolink.exec(e))) {
            e = e.substring(o[0].length), n = (o[2] || o[1]).replace(/\s+/g, " "), n = this.links[n.toLowerCase()];if (!n || !n.href) {
              t += o[0].charAt(0), e = o[0].substring(1) + e;continue;
            }this.inLink = !0, t += this.outputLink(o, n), this.inLink = !1;continue;
          }if (o = this.rules.strong.exec(e)) {
            e = e.substring(o[0].length), t += this.renderer.strong(this.output(o[2] || o[1]));continue;
          }if (o = this.rules.em.exec(e)) {
            e = e.substring(o[0].length), t += this.renderer.em(this.output(o[2] || o[1]));continue;
          }if (o = this.rules.code.exec(e)) {
            e = e.substring(o[0].length), t += this.renderer.codespan(i(o[2], !0));continue;
          }if (o = this.rules.br.exec(e)) {
            e = e.substring(o[0].length), t += this.renderer.br();continue;
          }if (o = this.rules.del.exec(e)) {
            e = e.substring(o[0].length), t += this.renderer.del(this.output(o[1]));continue;
          }if (o = this.rules.text.exec(e)) {
            e = e.substring(o[0].length), t += this.renderer.text(i(this.smartypants(o[0])));continue;
          }if (e) throw new Error("Infinite loop on byte: " + e.charCodeAt(0));
        }return t;
      }, t.prototype.outputLink = function (e, t) {
        var n = i(t.href),
            r = t.title ? i(t.title) : null;return e[0].charAt(0) !== "!" ? this.renderer.link(n, r, this.output(e[1])) : this.renderer.image(n, r, i(e[1]));
      }, t.prototype.smartypants = function (e) {
        return this.options.smartypants ? e.replace(/---/g, "—").replace(/--/g, "–").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1‘").replace(/'/g, "’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1“").replace(/"/g, "”").replace(/\.{3}/g, "…") : e;
      }, t.prototype.mangle = function (e) {
        if (!this.options.mangle) return e;var t = "",
            n = e.length,
            r = 0,
            i;for (; r < n; r++) i = e.charCodeAt(r), Math.random() > .5 && (i = "x" + i.toString(16)), t += "&#" + i + ";";return t;
      }, n.prototype.code = function (e, t, n) {
        if (this.options.highlight) {
          var r = this.options.highlight(e, t);r != null && r !== e && (n = !0, e = r);
        }return t ? "<pre><code class=\"" + this.options.langPrefix + i(t, !0) + "\">" + (n ? e : i(e, !0)) + "\n</code></pre>\n" : "<pre><code>" + (n ? e : i(e, !0)) + "\n</code></pre>";
      }, n.prototype.blockquote = function (e) {
        return "<blockquote>\n" + e + "</blockquote>\n";
      }, n.prototype.html = function (e) {
        return e;
      }, n.prototype.heading = function (e, t, n) {
        return "<h" + t + " id=\"" + this.options.headerPrefix + n.toLowerCase().replace(/[^\w]+/g, "-") + "\">" + e + "</h" + t + ">\n";
      }, n.prototype.hr = function () {
        return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
      }, n.prototype.list = function (e, t) {
        var n = t ? "ol" : "ul";return "<" + n + ">\n" + e + "</" + n + ">\n";
      }, n.prototype.listitem = function (e) {
        return "<li>" + e + "</li>\n";
      }, n.prototype.paragraph = function (e) {
        return "<p>" + e + "</p>\n";
      }, n.prototype.table = function (e, t) {
        return "<table>\n<thead>\n" + e + "</thead>\n" + "<tbody>\n" + t + "</tbody>\n" + "</table>\n";
      }, n.prototype.tablerow = function (e) {
        return "<tr>\n" + e + "</tr>\n";
      }, n.prototype.tablecell = function (e, t) {
        var n = t.header ? "th" : "td",
            r = t.align ? "<" + n + " style=\"text-align:" + t.align + "\">" : "<" + n + ">";return r + e + "</" + n + ">\n";
      }, n.prototype.strong = function (e) {
        return "<strong>" + e + "</strong>";
      }, n.prototype.em = function (e) {
        return "<em>" + e + "</em>";
      }, n.prototype.codespan = function (e) {
        return "<code>" + e + "</code>";
      }, n.prototype.br = function () {
        return this.options.xhtml ? "<br/>" : "<br>";
      }, n.prototype.del = function (e) {
        return "<del>" + e + "</del>";
      }, n.prototype.link = function (e, t, n) {
        if (this.options.sanitize) {
          try {
            var r = decodeURIComponent(s(e)).replace(/[^\w:]/g, "").toLowerCase();
          } catch (i) {
            return "";
          }if (r.indexOf("javascript:") === 0 || r.indexOf("vbscript:") === 0) return "";
        }var o = "<a href=\"" + e + "\"";return (t && (o += " title=\"" + t + "\""), o += ">" + n + "</a>", o);
      }, n.prototype.image = function (e, t, n) {
        var r = "<img src=\"" + e + "\" alt=\"" + n + "\"";return (t && (r += " title=\"" + t + "\""), r += this.options.xhtml ? "/>" : ">", r);
      }, n.prototype.text = function (e) {
        return e;
      }, r.parse = function (e, t, n) {
        var i = new r(t, n);return i.parse(e);
      }, r.prototype.parse = function (e) {
        this.inline = new t(e.links, this.options, this.renderer), this.tokens = e.reverse();var n = "";while (this.next()) n += this.tok();return n;
      }, r.prototype.next = function () {
        return this.token = this.tokens.pop();
      }, r.prototype.peek = function () {
        return this.tokens[this.tokens.length - 1] || 0;
      }, r.prototype.parseText = function () {
        var e = this.token.text;while (this.peek().type === "text") e += "\n" + this.next().text;return this.inline.output(e);
      }, r.prototype.tok = function () {
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
      }, u.exec = u, f.options = f.setOptions = function (e) {
        return (a(f.defaults, e), f);
      }, f.defaults = { gfm: !0, tables: !0, breaks: !1, pedantic: !1, sanitize: !1, sanitizer: null, mangle: !0, smartLists: !1, silent: !1, highlight: null, langPrefix: "lang-", smartypants: !1, headerPrefix: "", renderer: new n(), xhtml: !1 }, f.Parser = r, f.parser = r.parse, f.Renderer = n, f.Lexer = e, f.lexer = e.lex, f.InlineLexer = t, f.inlineLexer = t.output, f.parse = f, typeof module != "undefined" && typeof exports == "object" ? module.exports = f : typeof define == "function" && define.amd ? define("components/nova-markdown/marked", [], function () {
        return f;
      }) : this.marked = f;
    }).call((function () {
      return this || (typeof window != "undefined" ? window : global);
    })()), (function () {
      (function (e, t) {
        if (typeof exports == "object") module.exports = t(components_nova_markdown_marked);else if (typeof define == "function" && define.amd) define("components/nova-markdown/main", ["components/nova-markdown/marked"], t);else {
          var n = "Nova.Components.NovaMarkdown",
              r = n.split("."),
              i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t(e._2);
        }
      })(this, function (e) {
        function t(t) {
          return ({ "components/nova-markdown/marked": e })[t];
        }var n = undefined;NovaExports.__fixedUglify = "script>", NovaExports.exports = { stylesheet: "", template: "" };var r = NovaExports({ is: "nova-markdown", props: { content: String }, createdHandler: function createdHandler() {
            this.on("_contentChanged", this.contentChanged), this.content = this.innerHTML;
          }, contentChanged: function contentChanged() {
            this.innerHTML = marked(this.content);
          } });return r;
      });
    }).call(window);
  })(), (function () {
    (function (e, t) {
      if (typeof exports == "object") module.exports = t(require("components/nova-markdown/main"));else if (typeof define == "function" && define.amd) define("components/nova-markdown-editor/main", ["components/nova-markdown/main"], t);else {
        var n = "Nova.Components.NovaMarkdownEditor",
            r = n.split("."),
            i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t(e._3);
      }
    })(this, function (e) {
      function t(t) {
        return ({ "components/nova-markdown/main": e })[t];
      }var n = undefined;NovaExports.__fixedUglify = "script>", NovaExports.exports = { stylesheet: "textarea{width:100%;height:100px}", template: "\n        <textarea>#Welcome</textarea>\n        <nova-markdown></nova-markdown>\n    " };var r = NovaExports({ is: "nova-markdown-editor", createdHandler: function createdHandler() {
          var e = this.querySelector("textarea"),
              t = this.querySelector("nova-markdown");e.addEventListener("input", function () {
            t.content = e.value;
          }), Nova.ready(t, function () {
            t.content = e.value.trim();
          });
        } });return r;
    });
  }).call(window);
})();