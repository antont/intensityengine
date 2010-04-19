//in naali: jsload(runtests_standalone.js

function printload(n) {
    print(n);
    load(n);
}

printload('../test.js');
printload('Platform.js');
printload('../MochiKit.js');
printload('../jsUnit.js');
printload('../SimpleInheritance.js');
printload('../MockLogging.js'); //REX for standalone running test
printload('../LoggingExtras.js');

printload('Actions.js');

printload('__Testing.js');

print(print);
print(assert);

//copy-pasted from LoggingExtras.js. why didn't this work from there?
function assert(expression) {
    return "if (!(" + expression + ")) { log(ERROR, '<<SCRIPT>> Assertion error on: " + expression + "'); log(ERROR, 'stack:'); log(ERROR, (new Error).stack); throw new AssertionError('" + expression + "'); };"; // stackTrace can cause infinite looping sometimes // log(ERROR, stackTrace());
};

print(assert);

printload('Actions__test.js');

print("done in runtests_standalone.");