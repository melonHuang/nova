(function() {
    var markdownEle = document.querySelector('nova-markdown');
    $.get('docs/get_started.md', function(response) {
        markdownEle.content = response;
    });
})();
