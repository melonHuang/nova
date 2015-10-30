(function() {
    var markdownEle = document.querySelector('nova-markdown');
    var docName = $.queryHash('doc');
    var $category = $('.directory-list[data-level="1"]');

    // 获取文档
    renderDoc(docName);

    // 为目录链接绑定事件
    $category.on('click', 'a', function(e) {
        e.preventDefault();
        var $li = $(this).closest('li');
        var doc = $li.attr('data-doc');
        location.href = 'doc.html#doc=' + doc;
    });

    // 监听hash
    window.addEventListener('hashchange', function() {
        var doc = $.queryHash('doc');
        renderDoc(doc);
    });


    function selectCategory(docName) {
        var $item = $category.find('[data-doc]').removeClass('selected');;
        var $item = $category.find('[data-doc="' + docName + '"]');
        $item.addClass('selected');
    }

    function renderDoc(docName) {
        $.get('docs/' + docName + '.md', function(response) {
            markdownEle.content = response;
            $.setHash('doc', docName);
            selectCategory(docName);
        });
    }
})();
