(function() {
    var markdownEle = document.querySelector('nova-markdown');
    $.get('../docs/test.md', function(response) {
        markdownEle.content = response;
    });
})();
