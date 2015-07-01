(function() {
    /***************************** custom event polyfill ******************************/
    if(!window.CustomEvent) {
        let CustomEvent = function( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    /***************************** event behavior ******************************/
    let EVENT_SPLITTER = ' ';
    let EventBehavior = {
        on: function(types, listener, userCapture) {
            types = types.split(EVENT_SPLITTER);
            let type;
            while(type = types.shift()) {
                let self = this;
                this.addEventListener(type, function(e) {
                    let args = [e].concat(e.detail);
                    listener.apply(self, args);
                }, userCapture);
            }
        },

        off: function(types, listener, useCapture) {
            types = types.split(EVENT_SPLITTER);
            let type;
            while(type = types.shift()) {
                this.removeEventListener(type, listener, userCapture);
            }
        },

        trigger: function(types, details) {
            types = types.split(EVENT_SPLITTER);
            let type;
            while(type = types.shift()) {
                let event = new CustomEvent(type, {detail: details});
                this.dispatchEvent(event);
            }
        }
    };

    Nova.EventBehavior = EventBehavior;
})();
