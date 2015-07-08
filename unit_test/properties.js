(function() {
    var TestEleEvent = Nova({
        is: 'test-ele-properties',
        props: {
            'name': {
                type: String,
                observer: '_nameChangedHandler'
            },
            'age': {
                type: Number,
                value: 3
            },
            'birthday': {
                type: Date
            },
            'families': {
                type: Object
            },
            'hobbies': {
                type: Array
            },
            'isGay': {
                type: Boolean
            },
            'isLace': {
                type: Boolean
            }
        },
        _nameChangedHandler: function() {
            if(!this._count) {
                this._count= 0;
            }
            this._count++;
        }
    });

    describe('Properties', function() {
        it('attributes transfer', function() {
            var wrap = document.createElement('div');
            wrap.innerHTML = '<test-ele-properties name="gua" age="10" birthday="Tue Jul 07 2015 17:11:55 GMT+0800 (CST)" hobbies=\'["basketball"]\' families=\'{"father":"Mike"}\' is-gay></test-ele-properties>';
            var ins = wrap.querySelector('test-ele-properties');
            expect(ins.name).to.equal('gua');
            expect(ins.age).to.equal(10);
            expect(ins.birthday.getTime()).to.equal(new Date('Tue Jul 07 2015 17:11:55 GMT+0800 (CST)').getTime());
            expect(ins.families.father).to.equal('Mike');
            expect(ins.hobbies[0]).to.equal('basketball');
            expect(!!ins.isGay).to.equal(true);
            expect(!!ins.isLace).to.equal(false);
        });
        it('prop changed event fired', function() {
            var ins = document.createElement('test-ele-properties');
            var cb = sinon.spy();
            ins.on('_nameChanged', cb);
            ins.name = 'guagua';
            ins.name = 'guagua2';
            expect(cb.callCount).to.equal(2);
        });
        it('observer called', function() {
            var ins = document.createElement('test-ele-properties');
            ins.name = 'guagua';
            ins.name = 'guagua2';
            expect(ins._count).to.equal(2);
        });
        it('attribute changed fires prop changed', function() {
            var ins = document.createElement('test-ele-properties');
            ins.setAttribute('name', 'guagua');
            expect(ins._count).to.equal(1);
        });
    });
})();
