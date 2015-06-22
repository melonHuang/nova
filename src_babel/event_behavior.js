'use strict';
//define(function() {
(function() {

    let EVENT_SPLITTER = ' ';

    class CustomEvent {
        constructor(target, type, eventArgs) {
            Nova.Base.mix(this, [{
                target,
                type,
                timeStamp: new Date() - 1
            }, eventArgs], true);
        }

        preventDefault() {
            this._defaultPrevented = true;
        }
    }


    let EventBehavior = {
        on: function(events, callback, context) {
                let cache, event;

                if(!callback) return this;

                cache = (this.__events = this.__events || {});
                events = events.split(EVENT_SPLITTER);
                while(event = events.shift()) {
                    cache[event] = cache[event] || [];
                    cache[event].push(callback, context);
                }
                return this;
            },

        // this.off() 清除全部
        // this.off('switch') 清除全部switch事件的处理函数
        // this.off('switch', 'fun1'); 清除switch事件的fun1处理函数
        off: function(events, callback) {
                 let cache = this.__events, event;

                 // 全部为空，则清除全部handler
                 if(!(events || callback)) {
                     delete this.__events;
                     return this;
                 }
                 events = events.split(EVENT_SPLITTER);
                 while(event = events.shift()) {
                     let handlers = cache[event];
                     // 若callback为空，则去除所有event的handler
                     if(!callback) {
                         delete cache[event];
                     }
                     // 否则遍历event的handler，去除指定callback
                     else if(handlers){
                         for(let i = 0, len = handlers.length; i < len - 1; i += 2) {
                             if(handlers[i] == callback) {
                                 handlers.splice(i, 2);
                             }
                         }
                     }
                 }
                 return this; 
             },

        // this.trigger('switch', [args1, args2]);
        // this.trigger('switch change', [args1, args2]);
        // @return true/false
        trigger: function(events) {
                     let cache = this.__events, event, 
                     me = this, 
                     returnValue = true;

                     if(!cache) return me;

                     events = events.split(EVENT_SPLITTER);
                     while(event = events.shift()) {
                         let handlers = cache[event];
                         let ev = new CustomEvent(me, event);
                         if(handlers) {
                             for(let i = 0, len = handlers.length; i < len; i += 2) {
                                 let ctx = handlers[i + 1] || me;
                                 let args = arguments[1] ? arguments[1].slice() : [];
                                 args.unshift(ev);

                                 let ret = handlers[i].apply(ctx, args); 

                                 // 当callback返回false时，阻止事件继续触发
                                 if(ret === false) {
                                     ev.preventDefault();
                                 }

                                 if(ev._defaultPrevented) {
                                     returnValue = false;
                                     break;
                                 }

                             }
                         }
                     }
                     return returnValue;
                 },
    }

    Nova.EventBehavior = EventBehavior;
})();
