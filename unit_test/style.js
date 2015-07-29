(function() {

    var ins;
    describe('Styles', function() {
        it('init', function() {
            window.TestEleEvent = Nova({
                is: 'test-ele-style',
                stylesheet: '\
                    :host {background:blue;display:none;}\
                    * {background:black;}\
                    h1 { color: red; }\
                    .text {color:red;}\
                    #text {color:red;}\
                    div[text=red] {color:red;}\
                    div+.follower {color:red;}\
                    :host>.parent {color:red;}\
                    :host .ancestor {color:red;}\
                    :host ::content .page {color:red;}\
                    :host:first-child {color:red;}\
                    .comma,.comma2 {color:red}\
                    :host test-ele-style-inner::shadow span {color:red;}\
                ',
                template: '\
                    <div class="first-child">Test pseudo selector</div>\
                    <h1>Test element selector</h1>\
                    <div class="text">Test Class Selector</div>\
                    <div id="text">Test Id Selector</div>\
                    <div text="red">Test Attribute Selector</div>\
                    <div class="follower">Test sibling selector</div>\
                    <div class="parent">Test parent selector</div>\
                    <div class="ancestor">Test ancestor selector</div>\
                    <content selector=".page"></content>\
                    <div class="comma"></div>\
                    <div class="comma2"></div>\
                    <test-ele-style-inner></test-ele-style-inner>\
                ',
                props: {
                }
            });

            window.TestEleEventInner = Nova({
                is: 'test-ele-style-inner',
                template: '<span></span>'
            });

            var wrap = document.createElement('div');
            wrap.innerHTML = '<test-ele-style><div class="page">Page</div></test-ele-style>';
            ins = wrap.querySelector('test-ele-style');
            document.body.appendChild(wrap);
        });
        it(':host selector', function() {
            expect(window.getComputedStyle(ins).backgroundColor).to.equal('rgb(0, 0, 255)');;
        });
        it('::content selector', function() {
            expect(window.getComputedStyle(ins.querySelector('.page')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('element selector', function() {
            expect(window.getComputedStyle(ins.querySelector('h1')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('class selector', function() {
            expect(window.getComputedStyle(ins.querySelector('.text')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('id selector', function() {
            expect(window.getComputedStyle(ins.querySelector('#text')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('pseudo selector', function() {
            expect(window.getComputedStyle(ins.querySelector('.first-child')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('sibling selector', function() {
            expect(window.getComputedStyle(ins.querySelector('.follower')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('attribute selector', function() {
            expect(window.getComputedStyle(ins.querySelector('div[text=red]')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('parent selector', function() {
            expect(window.getComputedStyle(ins.querySelector('.parent')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('ancestor selector', function() {
            expect(window.getComputedStyle(ins.querySelector('.ancestor')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('comma seperator', function() {
            expect(window.getComputedStyle(ins.querySelector('.comma')).color).to.equal('rgb(255, 0, 0)');;
            expect(window.getComputedStyle(ins.querySelector('.comma2')).color).to.equal('rgb(255, 0, 0)');;
        });
        it('::shadow', function() {
            expect(window.getComputedStyle(ins.querySelector('test-ele-style-inner span')).color).to.equal('rgb(255, 0, 0)');;
        });
    });
})();
