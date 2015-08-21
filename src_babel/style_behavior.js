(function() {
    let StyleBehavior = {
        createdHandler: function() {
            this.removeAttribute('unresolved');
        }
    };

    Nova.StyleBehavior = StyleBehavior;
})();
