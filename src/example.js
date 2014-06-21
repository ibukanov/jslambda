function Example() {
    this.output_ = document.createElement('div');
    this.delayed_ = [];
}

Example.prototype.title = function(title) {
    var elem = document.createElement('h4');
    elem.appendChild(document.createTextNode(title));
    this.output_.appendChild(elem);
};

Example.prototype.code = function(codeKind, codeText) {
    var elem = document.createElement('div');
    var codeWrap = document.createElement('code');
    codeWrap.appendChild(document.createTextNode(codeText));
    elem.appendChild(codeWrap);
    // append arrow
    elem.appendChild(document.createTextNode(' \u2192 '));
    var resultNode = document.createElement('code');
    this.delayed_.push({ kind: codeKind, code: codeText, node: resultNode });
    elem.appendChild(resultNode)
    this.output_.appendChild(elem);
};

Example.prototype.finish = function(domId) {
    document.getElementById(domId).appendChild(this.output_);   
    this.output_ = null;
    var delayed = this.delayed_;
    this.delayed_ = null;

    var cursor = 0;
    (function process_delayed() {
        if (cursor === delayed.length) {
            delayed = null;
                return;
        }
        var x = delayed[cursor++];
        var result = Function('return '+x.code)();
        result = lambda_to_str(x.kind, result);
        x.node.appendChild(document.createTextNode(result));
        setTimeout(process_delayed, 5);
    }());
};


