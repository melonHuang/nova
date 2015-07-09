(function() {
    describe('Aspect', function() {
        it('init', function() {
            var TestEleAspect = Nova({
                is: 'test-ele-aspect'
            });
        });
        it('before', function() {
            var ele = document.createElement('test-ele-aspect');
            var callback = sinon.spy();
            var primaryFun = sinon.spy();
            ele.primaryFun = primaryFun;
            ele.before('primaryFun', callback);
            ele.primaryFun();
            expect(primaryFun.callCount).to.equal(1);
            expect(callback.callCount).to.equal(1);
        });
        it('after', function() {
            var ele = document.createElement('test-ele-aspect');
            var callback = sinon.spy();
            var primaryFun = sinon.spy();
            ele.primaryFun = primaryFun;
            ele.after('primaryFun', callback);
            ele.primaryFun();
            expect(primaryFun.callCount).to.equal(1);
            expect(callback.callCount).to.equal(1);
        });
    });
})();
