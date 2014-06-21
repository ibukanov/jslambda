'use strict';

function demo() {
    function evaluator(env, code, kind) {
        var parsed, evaluated, result_as_string;

        parsed = Function('return '+code);
        evaluated = parsed();
        result_as_string = lambda_to_str(kind, evaluated);
        return result_as_string;
    } 

    var rf = new RunFormat();

    rf.title('Logic');
    rf.code('test(tru)(tru)(fls)', 'bool');
    rf.code('and(tru)(or(fls)(not(tru)))', 'bool');

    rf.title('Arithmetic - increasing');
    rf.code('c4', 'num');
    rf.code('plus(plus(c3)(c2))(c1)', 'num');
    rf.code('iszero(times(c0)(c2))', 'bool');
    rf.code('power(c3)(times(c2)(c3))', 'num');

    rf.title('Arithmetic - decreasing');
    rf.code('pred(c4)', 'num');
    rf.code('minus(power(c3)(c3))(c1)', 'num');
    rf.code('numeq(c0)(c2)', 'bool');
    rf.code('numeq(c1)(minus(c3)(c2))', 'bool');


    rf.title('List processing');
    rf.code('cons(c2)(cons(c1)(nil))', 'list.num');
    rf.code('isnil(cons(tru)(nil))', 'bool');
    rf.code('list3(c3)(c2)(c1)(plus)(c0)', 'num');
    rf.code('head(cons(list2(tru)(fls))(nil))', 'list.bool');
    rf.code('tail(list3(c1)(c2)(c3))', 'list.num');
    rf.code('tail(list3(c1)(c2)(c3))', 'list.num');
    rf.code('tail(nil)', 'list.num');

    rf.title('Recursion');
    rf.code('call_with_self(factorial1)(times(c3)(c2))', 'num');
    rf.code('y_combinator(factorial2)(c4)', 'num');

    rf.finish('outputPlace', evaluator);
}

window.onload = demo;
