'use strict';

function RunFormat() {
    this.output_ = document.createElement('div');
    this.delayed_ = [];
}

RunFormat.prototype.title = function(title) {
    var elem = document.createElement('h4');
    elem.appendChild(document.createTextNode(title));
    this.output_.appendChild(elem);
};

RunFormat.prototype.code = function(codeText) {
    var elem, codeWrap, resultNode, env, args;

    elem = document.createElement('div');
    codeWrap = document.createElement('code');
    codeWrap.appendChild(document.createTextNode(codeText));
    elem.appendChild(codeWrap);
    // append arrow
    elem.appendChild(document.createTextNode(' \u2192 '));
    resultNode = document.createElement('code');
    env = null; // Not implemented for now
    args = [env];
    args.push.apply(args, arguments);
    this.delayed_.push({ args: args, node: resultNode });
    elem.appendChild(resultNode)
    this.output_.appendChild(elem);
};

RunFormat.prototype.finish = function(domId, evaluator) {
    var delayed, cursor;

    document.getElementById(domId).appendChild(this.output_);   
    this.output_ = null;
    delayed = this.delayed_;
    this.delayed_ = null;

    cursor = 0;
    (function process_delayed() {
        var x, result;

        if (cursor === delayed.length) {
            delayed = null;
        } else {
            x = delayed[cursor++];
            result = evaluator.apply(null, x.args);
            x.node.appendChild(document.createTextNode(result));
            setTimeout(process_delayed, 5);
        }
    }());
};
