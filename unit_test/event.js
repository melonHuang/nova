(function() {
    var TestEleEvent = Nova({
        is: 'test-ele-event'
    });

    describe('Event', function() {

        it('callback should be executed when the custom event is triggered', function() {
            var ele = document.createElement('test-ele-event');
            var callback = sinon.spy();
            ele.on('custom', callback);
            ele.trigger('custom');
            ele.trigger('custom');
            expect(callback.callCount).to.equal(2);
        });
        it('listeners cannot be repeatedly added', function() {
            var ele = document.createElement('test-ele-event');
            var callback = sinon.spy();
            ele.on('custom', callback);
            ele.on('custom', callback);
            ele.on('custom', callback);
            ele.trigger('custom');
            expect(callback.callCount).to.equal(1);
        });
        it('callback should be executed in the order its bound', function() {
            var a;
            var cb1 = function() {
                a = 1;
            };
            var cb2 = function() {
                a = 2;
            };
            var ins = document.createElement('test-ele-event');
            ins.on('activate', cb1);
            ins.on('activate', cb2);
            ins.trigger('activate');
            expect(a).to.equal(2);
        });
        it('off(evenType, fun) should unbind the specific handlers', function() {
            var callback = sinon.spy();
            var callback2 = sinon.spy();
            var ins = document.createElement('test-ele-event');
            ins.on('activate', callback);
            ins.on('reset', callback2);
            ins.off('activate', callback);
            ins.trigger('activate reset');
            expect(callback.callCount).to.equal(0);
            expect(callback2.callCount).to.equal(1);
            ins.on('reset', callback);
            ins.off('reset', callback2);
            ins.trigger('reset');
            expect(callback.callCount).to.equal(1);
            expect(callback2.callCount).to.equal(1);
        });
        it('event type witten in this format [\'activate\', \'reset\'] should work correctly', function() {
            var callback = sinon.spy();
            var ins = document.createElement('test-ele-event');;
            ins.on('activate reset', callback);
            ins.trigger('activate reset');
            expect(callback.callCount).to.equal(2);
            ins.off('activate reset', callback);
            ins.trigger('activate reset');
            expect(callback.callCount).to.equal(2);
        });
        it('an event should generate a public event object for its handlers', function() {
            var tempEv;
            var ins = document.createElement('test-ele-event');;

            ins.on('test', function(ev) {
                tempEv = ev;
            });
            ins.on('test', function(ev) {
                expect(ev).to.equal(tempEv);
            });
        });
        it('should pass detail params to listeners', function() {
            var cb = sinon.spy(function(ev, a, b) {
                expect(a).to.equal('a');
                expect(b).to.equal('b');
            });
            var ins = document.createElement('test-ele-event');;
            ins.on('hehe', cb);
            ins.trigger('hehe', ['a', 'b']);
        });
        it('crazy try', function() {
            var cb = sinon.spy();
            var cb2 = sinon.spy();
            var ins = document.createElement('test-ele-event');;
            ins.on('hehe', cb);
            ins.on('hehe', cb);
            ins.on('hehe', cb);
            ins.on('hehe', cb);
            expect(ins._eventListeners.hehe.size).to.equal(1);
            ins.trigger('hehe', ['a', 'b']);
            expect(cb.callCount).to.equal(1);
            ins.off('hehe', cb);
            ins.off('hehe', cb);
            ins.off('hehe', cb);
            ins.off('hehe', cb);
            expect(ins._eventListeners.hehe.size).to.equal(0);
            expect(cb.callCount).to.equal(1);
            ins.on('hehe', cb);
            ins.on('hehe', cb2);
            ins.on('hehe', function() {});
            expect(ins._eventListeners.hehe.size).to.equal(3);
            ins.off('hehe', cb);
            ins.off('hehe', cb);
            ins.off('hehe', cb);
            ins.off('hehe', cb2);
            ins.off('hehe', cb2);
            ins.off('hehe', cb2);
            expect(ins._eventListeners.hehe.size).to.equal(1);
            ins.on('hehe', cb);
            ins.trigger('hehe', ['a', 'b']);
            expect(cb.callCount).to.equal(2);
        });
    });
})();
