/**************************** Helper *******************************/
(function() {
    /**************************** 閲嶅啓zepto on鏂规硶閬垮厤浜嬩欢绌块€� *******************************/
    (function() {
        var INTERVAL_MIN = 500;
        var context;
        var lastCalledTime = (new Date()).getTime();
        function throttle(handler) {
            return function() {
                var curTime = (new Date()).getTime();
                if((curTime - lastCalledTime < INTERVAL_MIN) && this != context) {
                    return;
                }
                context = this;
                //console.log('called', curTime - lastCalledTime);
                lastCalledTime = curTime;
                handler.apply(this, arguments);
            }
        }

        var oldOn = $.fn.on;
        $.fn.on = function( evt ){
            if(evt === 'tap'){
                var args = Array.prototype.slice.call(arguments);
                var handlerIndex;
                for(var i = 0; i < args.length; i++) {
                    if(typeof args[i] === 'function') {
                        handlerIndex = i;
                        break;
                    }
                }
                args[handlerIndex] = throttle(args[handlerIndex]);
                this.on('click', function(e) {
                    e.preventDefault();
                });
                return oldOn.apply( this, args );
            }
            return oldOn.apply( this, arguments );
        };

    })();
    /**************************** broadcast **************************/
    $.broadcast = $({});

    /**************************** form *******************************/
    $.fn.toJSON = function() {
      var form = $(this);
      var reqArr = form.serializeArray();
      var jsonObj = {};
      for(var i = 0, len = reqArr.length; i < len; i++) {
        var param = reqArr[i];
        jsonObj[param.name] = param.value;
      }

      return jsonObj;
    };


    $.fn.fillFromJSON = function(obj) {
        el = $(this);
        if (!obj || typeof obj != 'object') {
            return;
        }
        var field, tagName, type, value;
        var isChecked = function(option, value) {
            if (Object.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (option.prop('value') == value[i]) {
                        return true;
                    }
                }
                return false;
            } else {
                return option.prop('value') == value;
            }
        };
        el = $(el);
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            field = el.find('[name=' + key + ']');
            if (!field.length) {
                continue;
            }
            tagName = field.prop('tagName').toLowerCase();
            type = field.prop('type').toLowerCase();
            value = obj[key];
            if (tagName == 'input' && (type == 'radio' || type == 'checkbox')) { //单选和复选框特殊处理
                for(var i = 0; i < field.length; i++) {
                    var option = $(field[i]);
                    if (isChecked(option, value)) {
                        option.prop('checked', true);
                    } else {
                        option.prop('checked', false);
                    }
                    option.trigger('change');
                }
            } else {
                field.val(value);
            }
        }
    }

    /**************************** history *******************************/
    $.history = {
        pushState: function(stateObj) {
            $.setHash(stateObj); 
        },

        statechange: function(cb) {
            $(window).on('hashchange', function(e) {
                var hashObj = $.queryHash();
                cb(hashObj);
            });
        },
    };

    /**************************** url *******************************/
    $.querySearch = function(key, url) {
        if(!url) {
            url = window.location.search;
        }
        url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; 
        return decodeURI(url, key);
    }

    $.setSearch = function(key, value) {
        var state = {};
        var data = $.querySearch();

        if(arguments.length === 2) {
            state[key] = value;
        } else {
            state = key;
        }

        for(var attr in state) {
            if(state.hasOwnProperty(attr)) {
                data[attr] = state[attr];
            }
        }
        window.location.search = $.param(data);
    }

    $.queryHash = function(key) {
        var url = window.location.hash;
        url = url.replace(/^[^=]*#/ig, '');
        return decodeURI(url, key);
    }

    $.setHash = function(key, value) {
        var state = {};
        var data = $.queryHash();

        if(arguments.length === 2) {
            state[key] = value;
        } else {
            state = key;
        }

        for(var attr in state) {
            if(state.hasOwnProperty(attr)) {
                data[attr] = state[attr];
            }
        }
        window.location.hash = $.param(data);
    }

    /**************************** encode *******************************/
    $.encode4HtmlValue = function(s) {
        var el = document.createElement('pre'); //杩欓噷瑕佺敤pre锛岀敤div鏈夋椂浼氫涪澶辨崲琛岋紝渚嬪锛�'a\r\n\r\nb'
        var text = document.createTextNode(s);
        el.appendChild(text);
        return el.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }


    $.encode_xor = function xor_str(value) {
        var to_enc = value;
        var xor_key="9"
        var the_res="";
        for(i=0;i<to_enc.length;++i)
        {
            the_res+=String.fromCharCode(xor_key^to_enc.charCodeAt(i));
        }

        return $.base64.encode(the_res);
    }


    // a=1&b=2 to {a:1,b:2}
    function decodeURI(url, key) {
        var json = {};
        url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
            try {
                key = decodeURIComponent(decodeURIComponent(key));
            } catch(e) {}

            try {
                value = decodeURIComponent(decodeURIComponent(value));
            } catch(e) {}

            if (!(key in json)) {
                json[key] = /\[\]$/.test(key) ? [value] : value; //婵″倹鐏夐崣鍌涙殶閸氬秳浜抂]缂佹挸鐔敍灞藉灟瑜版挷缍旈弫鎵矋
            }
            else if (json[key] instanceof Array) {
                json[key].push(value);
            }
            else {
                json[key] = [json[key], value];
            }
        });
        return key ? json[key] : json;
    }

})();

