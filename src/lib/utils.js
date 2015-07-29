'use strict';
(function () {

    var Utils = {
        mix: function mix(des, src, override) {
            if (src && src.constructor == Array) {
                for (var i = 0, len = src.length; i < len; i++) {
                    this.mix(des, src[i], override);
                }
                return des;
            }
            if (typeof override == 'function') {
                for (i in src) {
                    des[i] = override(des[i], src[i], i);
                }
            } else {
                for (i in src) {
                    if (override || !(des[i] || i in des)) {
                        des[i] = src[i];
                    }
                }
            }
            return des;
        },
        /*
        * 使object的原型链尾端指向inherited, 拥有inherited的属性和方法
        */
        chainObject: function chainObject(object, inherited) {
            if (object && inherited && object !== inherited) {
                if (!Object.__proto__) {
                    object = this.mix(Object.create(inherited), object, true);
                } else {
                    // 首先找到object原型链末端
                    var lastPrototype = object;
                    while (lastPrototype.__proto__ && lastPrototype.__proto__.__proto__) {
                        lastPrototype = lastPrototype.__proto__;
                    }
                    lastPrototype.__proto__ = inherited;
                }
            }
            return object;
        },
        tmpl: function tmpl(str, data, format) {
            str = str.replace(/\{\{([^\{\}]*)\}\}/g, function (sub, expr) {
                if (!expr) return '';
                try {
                    var r = new Function('data', 'with(data){return (' + expr + ');}')(data);
                    return format ? format(r, expr) : r;
                } catch (ex) {
                    return sub;
                }
            });

            return str;
        },
        tmpl2: (function () {

            var tmplFuns = {};
            /*
            sArrName 拼接字符串的变量名。
            */
            var sArrName = 'sArrCMX',
                sLeft = sArrName + '.push("';
            /*
                tag:模板标签,各属性含义：
                tagG: tag系列
                isBgn: 是开始类型的标签
                isEnd: 是结束类型的标签
                cond: 标签条件
                rlt: 标签结果
                sBgn: 开始字符串
                sEnd: 结束字符串
            */
            var tags = {
                '=': {
                    tagG: '=',
                    isBgn: 1,
                    isEnd: 1,
                    sBgn: '",QW.StringH.encode4HtmlValue(',
                    sEnd: '),"'
                },
                'js': {
                    tagG: 'js',
                    isBgn: 1,
                    isEnd: 1,
                    sBgn: '");',
                    sEnd: ';' + sLeft
                },
                //任意js语句, 里面如果需要输出到模板，用print("aaa");
                'if': {
                    tagG: 'if',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");if',
                    sEnd: '{' + sLeft
                },
                //if语句，写法为{if($a>1)},需要自带括号
                'elseif': {
                    tagG: 'if',
                    cond: 1,
                    rlt: 1,
                    sBgn: '");} else if',
                    sEnd: '{' + sLeft
                },
                //if语句，写法为{elseif($a>1)},需要自带括号
                'else': {
                    tagG: 'if',
                    cond: 1,
                    rlt: 2,
                    sEnd: '");}else{' + sLeft
                },
                //else语句，写法为{else}
                '/if': {
                    tagG: 'if',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                },
                //endif语句，写法为{/if}
                'for': {
                    tagG: 'for',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");for',
                    sEnd: '{' + sLeft
                },
                //for语句，写法为{for(var i=0;i<1;i++)},需要自带括号
                '/for': {
                    tagG: 'for',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                },
                //endfor语句，写法为{/for}
                'while': {
                    tagG: 'while',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");while',
                    sEnd: '{' + sLeft
                },
                //while语句,写法为{while(i-->0)},需要自带括号
                '/while': {
                    tagG: 'while',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                } //endwhile语句, 写法为{/while}
            };

            return function (sTmpl, noJoin) {
                noJoin = noJoin ? 1 : 0;

                var fun = tmplFuns[sTmpl];
                if (!fun) {
                    var N = -1,
                        NStat = []; //语句堆栈;
                    var ss = [[/\{strip\}([\s\S]*?)\{\/strip\}/g, function (a, b) {
                        return b.replace(/[\r\n]\s*\}/g, ' }').replace(/[\r\n]\s*/g, '');
                    }], [/\\/g, '\\\\'], [/"/g, '\\"'], [/\r/g, '\\r'], [/\n/g, '\\n'], //为js作转码.
                    [/\{[\s\S]*?\S\}/g, //js里使用}时，前面要加空格。
                    function (a) {
                        a = a.substr(1, a.length - 2);
                        for (var i = 0; i < ss2.length; i++) {
                            a = a.replace(ss2[i][0], ss2[i][1]);
                        }
                        var tagName = a;
                        if (/^(=|.\w+)/.test(tagName)) {
                            tagName = RegExp.$1;
                        }
                        var tag = tags[tagName];
                        if (tag) {
                            if (tag.isBgn) {
                                var stat = NStat[++N] = {
                                    tagG: tag.tagG,
                                    rlt: tag.rlt
                                };
                            }
                            if (tag.isEnd) {
                                if (N < 0) {
                                    throw new Error('Unexpected Tag: ' + a);
                                }
                                stat = NStat[N--];
                                if (stat.tagG != tag.tagG) {
                                    throw new Error('Unmatch Tags: ' + stat.tagG + '--' + tagName);
                                }
                            } else if (!tag.isBgn) {
                                if (N < 0) {
                                    throw new Error('Unexpected Tag:' + a);
                                }
                                stat = NStat[N];
                                if (stat.tagG != tag.tagG) {
                                    throw new Error('Unmatch Tags: ' + stat.tagG + '--' + tagName);
                                }
                                if (tag.cond && !(tag.cond & stat.rlt)) {
                                    throw new Error('Unexpected Tag: ' + tagName);
                                }
                                stat.rlt = tag.rlt;
                            }
                            return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
                        } else {
                            return '",(' + a + '),"';
                        }
                    }]];
                    var ss2 = [[/\\n/g, '\n'], [/\\r/g, '\r'], [/\\"/g, '"'], [/\\\\/g, '\\'], [/\$(\w+)/g, 'opts["$1"]'], [/print\(/g, sArrName + '.push(']];
                    for (var i = 0; i < ss.length; i++) {
                        sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
                    }
                    if (N >= 0) {
                        throw new Error('Lose end Tag: ' + NStat[N].tagG);
                    }

                    sTmpl = sTmpl.replace(/##7b/g, '{').replace(/##7d/g, '}').replace(/##23/g, '#'); //替换特殊符号{}#
                    sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");if(' + noJoin + ') { return ' + sArrName + ';};return ' + sArrName + '.join("");';

                    //alert('转化结果\n'+sTmpl);
                    tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
                }

                return fun;
            };
        })()

    };

    Nova.Utils = Utils;
})();