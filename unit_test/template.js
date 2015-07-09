(function() {

    var ins;
    describe('Template', function() {
        it('init', function() {
            window.TestEleTemplate = Nova({
                is: 'test-ele-template',
                template: '<span class="name-wrap" data-isgay="{{isGay}}" data-name="{{name}}">{{name}}</span>\
                        <div class="page-wrap">\
                            <content select=".page"></content>\
                        </div>\
                        <div class="other-wrap">\
                            <content></content>\
                        </div>\
                    ',
                props: {
                    name: String,
                    isGay: Boolean
                }
            });
            ins = document.createElement('test-ele-template');
            ins.name = 'guagua';
        });
        it('content insertion', function() {
            var wrap = document.createElement('div');
            wrap.innerHTML = '<test-ele-template><div class="other">other</div><div class="page">page</div></test-ele-template>';
            var ele = wrap.querySelector('test-ele-template');
            expect(ele.querySelector('.page-wrap').querySelectorAll('.page').length).to.equal(1);
            expect(ele.querySelector('.other-wrap').querySelectorAll('.other').length).to.equal(1);
        });
        it('attribute annotation', function() {
            expect(ins.querySelector('.name-wrap').getAttribute('data-name')).to.equal('guagua');
            ins.isGay = false;
            expect(ins.querySelector('.name-wrap').hasAttribute('data-isgay')).to.equal(false);
            ins.isGay = true;
            expect(ins.querySelector('.name-wrap').hasAttribute('data-isgay')).to.equal(true);
        });
        it('html annotation', function() {
            expect(ins.querySelector('.name-wrap').innerHTML).to.equal('guagua');
        });
    });
})();
