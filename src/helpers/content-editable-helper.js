var $ = require('jquery');

function getRange() {
    return window.getSelection().getRangeAt(0);
}

function insertElementAtRange(range, elem) {
    var frag = document.createDocumentFragment();

    frag.appendChild(elem);

    range.insertNode(frag);
}

function normaliseNewLine(elem) {
    $(elem).on('keydown', function(event) {
        // if enter key is pressed
        if (event.keyCode === 13) {
            var docFragment = document.createDocumentFragment();

            // add a new line
            docFragment.appendChild(document.createTextNode('\n'));

            // add the br
            var newEl = document.createElement('br');

            docFragment.appendChild(newEl);

            // make the br replace selection
            var range = getRange();
            range.deleteContents();
            range.insertNode(docFragment);

            // create a new range
            range = document.createRange();
            range.setStartAfter(newEl);
            range.collapse(true);

            // place the cursor at the end
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

            // prevents default browser behaviour
            return false;
        }
    });
}

function splitContentAtCaret(elem, cb) {
    // var sel = window.getSelection();

    var firstParagraph = '';
    var secondParagraph = '';

    // @todo reimplement
    //
    // sel.removeAllRanges();

    // range.setStart(block.getTextBlock().get(0), 0);

    // sel.addRange(range);

    // if (sel.rangeCount) {

    //     var container = document.createElement('div');

    //     for (var i = 0, len = sel.rangeCount; i < len; ++i) {
    //         container.appendChild(sel.getRangeAt(i).cloneContents());
    //     }

    //     html = container.innerHTML;

    //     return html;
    // }

    cb(firstParagraph, secondParagraph);
}

module.exports = {
    getRange: getRange,
    insertElementAtRange: insertElementAtRange,
    normaliseNewLine: normaliseNewLine,
    splitContentAtCaret: splitContentAtCaret
};
