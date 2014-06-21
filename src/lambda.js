/*jslint node: true, unparam: true */

'use strict';

// Booleans

function tru(x) {
    return function (y) {
        return x;
    };
}

function fls(x) {
    return function (y) {
        return y;
    };
}

function test(condition) {
    return function (a) {
        return function (b) {
            return condition(a)(b);
        };
    };
}

function and(a) {
    return function (b) {
        return a(b)(fls);
    };
}

function or(a) {
    return function (b) {
        return a(tru)(b);
    };
}

function not(a) {
    return a(fls)(tru);
}

// Boxes and pairs

function id(x) {
    return x;
}

function mkpair(a) {
    return function (b) {
        return function (extractor) {
            return extractor(a)(b);
        };
    };
}

function fst(pair) {
    return pair(tru);
}

function snd(pair) {
    return pair(fls);
}

function mkbox(v) {
    return function (f) {
        return f(v);
    };
}

function unbox(box) {
    return box(id);
}

// Church numbers

var c0 = fls;

function c1(s) {
    return function (z) {
        return s(z);
    };
}

function c2(s) {
    return function (z) {
        return s(s(z));
    };
}

function c3(s) {
    return function (z) {
        return s(s(s(z)));
    };
}

function c4(s) {
    return function (z) {
        return s(s(s(s(z))));
    };
}


function succ(number) {
    return function (s) {
        return function (z) {
            return number(s)(s(z));
        };
    };
}

function plus(m) {
    return function (n) {
        return function (s) {
            return function (z) {
                return m(s)(n(s)(z));
            };
        };
    };
}

function times(m) {
    return function (n) {
        return function (s) {
            return m(n(s));
            //return function (z) {
                //return m(n(s))(z);
            //};
        };
    };
}

function power(m) {
    return function (n) {
        return n(times(m))(c1);
    };
}

function iszero(a) {
    return a(function (x) { return fls; })(tru);
}

function pred(n) {
    // See http://en.wikipedia.org/wiki/Church_encoding#Derivation_of_predecessor_function

    return function (s) {
        function step(box) {
            return mkbox(box(s));
        }

        return function (z) {
            function pseudo_box(f) {
                return z;
            }

            return unbox(n(step)(pseudo_box));
        };
    };
}


function minus(m) {
    return function (n) {
        return n(pred)(m);
    };
}

function numeq(m) {
    return function (n) {
        return and(iszero(minus(m)(n)))(iszero(minus(n)(m)));
    };
}

// Lists

var nil = fls;

function list1(x) {
    return function (c) {
        return function (n) {
            return c(x)(n);
        };
    };
}

function list2(x) {
    return function (y) {
        return function (c) {
            return function (n) {
                return c(x)(c(y)(n));
            };
        };
    };
}

function list3(x) {
    return function (y) {
        return function (z) {
            return function (c) {
                return function (n) {
                    return c(x)(c(y)(c(z)(n)));
                };
            };
        };
    };
}

function cons(h) {
    return function (list) {
        return function (c) {
            return function (n) {
                return c(h)(list(c)(n));
            };
        };
    };
}

function isnil(list) {
    // step(elem)(prev) always returns false

    function step(elem) {
        return function (acum) {
            return fls;
        };
    }

    return list(step)(tru);
}

function head(list) {
    function step(elem) {
        return function (acum) {
            return elem;
        };
    }

    return list(step)(nil);
}

function tail(list) {
    // This is similar to prev. Use indirection in the step function
    // to delegate calling c to the argument. Normally it is a pair a
    // of the list element and the previous result of calling c so
    // pair(c) is just c(elem)(prev). However, the first pair is a
    // function that always return the initial value n ignoring its
    // argument. Thus the first pair(c) is just n allowing to skip one
    // c invocation.
    return function (c) {
        function step(elem) {
            return function (pair) {
                return mkpair(elem)(pair(c));
            };
        }

        return function (n) {
            function pseudo_pair(extractor) {
                return n;
            }
            var end_pair = list(step)(pseudo_pair);
            return snd(end_pair);
        };
    };
}

// Recursion. The key idea is an expression like (\f.f f) f that allows to pass f as the argument to itself, like for 2-arg f we have (\f.arg.f f arg) f arg
// 

function call_with_self(f) {
    return f(f);
}


// Universal combinator that allows to replace f(f)(arg) where f is
// passed as the first arg to a recursive function with just f(arg).

function y_combinator(f) {
    return call_with_self(function (self) {
        // here self(self) cannot be moved outside the closure. With
        // call-by-value that leads to infinite recursion so doing
        // that call inside the closure that is called after we return is
        // essential.
        return f(function (n) {
            return self(self)(n);
        });
    });
}

// Recurssion is based call_with_self with explicit self(self) calls.
function factorial1(self) {
    return function (n) {
        // Extra indirection to avoid calling times under call-by-value
        return test(iszero(n))(function () { return c1; })(function () {
            return times(n)(self(self)(pred(n)));
        })();
    };
}

// Recurssion is based on y_combinator()
function factorial2(recursion) {
    return function (n) {
        // Extra indirection to avoid calling times() etc.  under
        // eager evaluation.
        return test(iszero(n))(function () { return c1; })(function () {
            return times(n)(recursion(pred(n)));
        })();
    };
}

// Helper to show the results as string assuming the result is a
// lambda of a particular kind.

function lambda_to_str(kind, lambda) {
    function inc(x) {
        return x + 1;
    }

    function list_step(elem) {
        return function (str) {
            var result = String(lambda_to_str(kind, elem));
            return str ? result + ' ' + str : result;
        };
    }

    switch (kind) {
    case 'num':
        return String(lambda(inc)(0));
    case 'bool':
        return String(lambda(true)(false));
    default:
        if (/^list\./.test(kind)) {
            kind = kind.substring(5);
            return '[' + lambda(list_step)('') + ']';
        }
        return 'Unsuported elem kind - "' + kind + '"';
    }
}


function timed(f, arg) {
    var t, r;

    t = Date.now();
    r = f(arg);
    t = Date.now() - t;
    console.log('time=' + t);
    return r;
}
