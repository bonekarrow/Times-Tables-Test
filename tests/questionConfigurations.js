/**
 * Unit tests for question configuration object.
 *
 * $Rev: 99 $; $Date: 2017-06-05 11:19:26 +0100 (Mon, 05 Jun 2017) $
 *
 */

"use strict";

QUnit.module("questionConfigurations");

QUnit.test("QuestionType", function(assert) {
    assert.notOk(QuestionType.contains(QuestionType.PLAIN, QuestionType.SQUARE));
    assert.ok(QuestionType.contains(QuestionType.SQUARE, QuestionType.SQUARE));
    assert.notOk(QuestionType.contains(QuestionType.DECIMAL_X, QuestionType.SQUARE));
    assert.notOk(QuestionType.contains(QuestionType.DECIMAL_X | QuestionType.DECIMAL_10, QuestionType.SQUARE));
    assert.notOk(QuestionType.contains(QuestionType.DECIMAL_Y, QuestionType.SQUARE));
    assert.notOk(QuestionType.contains(QuestionType.DECIMAL_Y | QuestionType.DECIMAL_10, QuestionType.SQUARE));

    assert.ok(QuestionType.contains(QuestionType.PLAIN, QuestionType.PLAIN));
    assert.ok(QuestionType.contains(QuestionType.SQUARE, QuestionType.SQUARE));
    assert.ok(QuestionType.contains(QuestionType.DECIMAL_X, QuestionType.DECIMAL_X));
    assert.ok(QuestionType.contains(QuestionType.DECIMAL_X | QuestionType.DECIMAL_10, QuestionType.DECIMAL_X));
    assert.ok(QuestionType.contains(QuestionType.DECIMAL_Y, QuestionType.DECIMAL_Y));
    assert.ok(QuestionType.contains(QuestionType.DECIMAL_Y | QuestionType.DECIMAL_10, QuestionType.DECIMAL_Y));

    assert.notOk(QuestionType.containsSquare(QuestionType.PLAIN));
    assert.ok(QuestionType.containsSquare(QuestionType.SQUARE));
    assert.notOk(QuestionType.containsSquare(QuestionType.DECIMAL_X));
    assert.notOk(QuestionType.containsSquare(QuestionType.DECIMAL_X | QuestionType.DECIMAL_10));
    assert.notOk(QuestionType.containsSquare(QuestionType.DECIMAL_Y));
    assert.notOk(QuestionType.containsSquare(QuestionType.DECIMAL_Y | QuestionType.DECIMAL_10));

    assert.ok(QuestionType.containsPlain(QuestionType.PLAIN));
    assert.ok(QuestionType.containsSquare(QuestionType.SQUARE));
    assert.ok(QuestionType.containsDecimalX(QuestionType.DECIMAL_X));
    assert.ok(QuestionType.containsDecimalX(QuestionType.DECIMAL_X | QuestionType.DECIMAL_10));
    assert.ok(QuestionType.containsDecimalY(QuestionType.DECIMAL_Y));
    assert.ok(QuestionType.containsDecimalY(QuestionType.DECIMAL_Y | QuestionType.DECIMAL_10));

    assert.notOk(QuestionType.isDecimal10(QuestionType.PLAIN));
    assert.notOk(QuestionType.isDecimal10(QuestionType.SQUARE));
    assert.notOk(QuestionType.isDecimal10(QuestionType.DECIMAL_X));
    assert.ok(QuestionType.isDecimal10(QuestionType.DECIMAL_X | QuestionType.DECIMAL_10));
    assert.notOk(QuestionType.isDecimal10(QuestionType.DECIMAL_Y));
    assert.ok(QuestionType.isDecimal10(QuestionType.DECIMAL_Y | QuestionType.DECIMAL_10));
});

QUnit.test("creation", function(assert) {
    var qc1 = createQuestionConfiguration(3, 4, OperationType.MULTIPLY, false);
    assert.equal(qc1.x, 3, 'qc1 not as expected');
    assert.equal(qc1.y, 4, 'qc1 not as expected');
    assert.equal(qc1.z(), 12, 'qc1 not as expected');
    assert.equal(qc1.operation, OperationType.MULTIPLY, 'qc1 not as expected');
    assert.equal(qc1.type, QuestionType.PLAIN, 'qc1 not as expected');

    var qc2 = createQuestionConfiguration(3, 4, OperationType.DIVIDE, true);
    assert.equal(qc2.x, 4, 'qc2 not as expected');
    assert.equal(qc2.y, 3, 'qc2 not as expected');
    assert.equal(qc2.z(), 12, 'qc2 not as expected');
    assert.equal(qc2.operation, OperationType.DIVIDE, 'qc2 not as expected');
    assert.equal(qc2.type, QuestionType.PLAIN, 'qc2 not as expected');

});

QUnit.test("mutation", function(assert) {
    var decimal10RE = /^Using 'DECIMAL_10' prior/i;
    var vulgarOfDecimalRE = /^Using 'VULGAR_OF_DECIMAL' prior/i;
    var vulgarOf10RE = /^Using 'VULGAR_OF_10' prior/i;

    var qc1 = createQuestionConfiguration(3, 4, OperationType.MULTIPLY, false);
    assert.notEqual(qc1, null, 'should not be a null instance');

    assert['throws'](function() { qc1.mutate(MutateType.DECIMAL_10); }, decimal10RE,
        'DECIMAL10 cannot be used before DECIMAL_X or DECIMAL_Y');
    assert['throws'](function() { qc1.mutate(MutateType.VULGAR_OF_DECIMAL); }, vulgarOfDecimalRE,
        'VULGAR_OF_DECIMAL cannot be used before VULGAR');
    assert['throws'](function() { qc1.mutate(MutateType.VULGAR_OF_10); }, vulgarOf10RE,
        'VULGAR_OF_10 cannot be used before VULGAR');

    var qc2 = qc1.mutate(MutateType.SWAP_ARGUMENTS);
    assert.notEqual(qc2, null, 'mutation should succeed');
    assert.notOk(qc1.isSame(qc2), 'should be different questions');
    assert.equal(qc1.x, qc2.y, 'arguments should have swapped');
    assert.equal(qc1.y, qc2.x, 'arguments should have swapped');
    assert.equal(qc1.operation, qc2.operation, 'operation should be the same');
    assert.equal(qc1.type, qc2.type, 'question type should be the same');

    assert['throws'](function() { qc2.mutate(MutateType.DECIMAL_10); }, decimal10RE,
        'DECIMAL10 cannot be used before DECIMAL_X or DECIMAL_Y');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_DECIMAL); }, vulgarOfDecimalRE,
        'VULGAR_OF_DECIMAL cannot be used before VULGAR');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_10); }, vulgarOf10RE,
        'VULGAR_OF_10 cannot be used before VULGAR');
    
    qc2 = qc1.mutate(MutateType.SWAP_OPERATION);
    assert.notEqual(qc2, null, 'mutation should succeed');
    assert.notOk(qc1.isSame(qc2), 'should be different questions');
    assert.equal(qc1.x, qc2.x, 'arguments should be the same');
    assert.equal(qc1.y, qc2.y, 'arguments should be the same');
    assert.notEqual(qc1.operation, qc2.operation, 'operation should have swapped');
    assert.equal(OperationType.DIVIDE, qc2.operation, 'operation should be divide');
    assert.equal(qc1.type, qc2.type, 'question type should be the same');
    
    assert['throws'](function() { qc2.mutate(MutateType.DECIMAL_10); }, decimal10RE,
        'DECIMAL10 cannot be used before DECIMAL_X or DECIMAL_Y');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_DECIMAL); }, vulgarOfDecimalRE,
        'VULGAR_OF_DECIMAL cannot be used before VULGAR');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_10); }, vulgarOf10RE,
        'VULGAR_OF_10 cannot be used before VULGAR');
    
    qc2 = qc1.mutate(MutateType.SQUARE);
    assert.equal(qc2, null, "mutation should fail as arguments aren't the same");
    
    qc2 = qc1.mutate(MutateType.DECIMAL_X);
    assert.notEqual(qc2, null, 'mutation should succeed');
    assert.notOk(qc1.isSame(qc2), 'should be different questions');
    assert.equal(qc1.x, qc2.x, 'arguments should be the same');
    assert.equal(qc1.y, qc2.y, 'arguments should be the same');
    assert.equal(qc1.operation, qc2.operation, 'operation should be the same');
    assert.notEqual(qc1.type, qc2.type, 'question type should have changed');
    assert.equal(QuestionType.DECIMAL_X, qc2.type, 'question should now be decimal');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_DECIMAL); }, vulgarOfDecimalRE,
        'VULGAR_OF_DECIMAL cannot be used before VULGAR');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_10); }, vulgarOf10RE,
        'VULGAR_OF_10 cannot be used before VULGAR');

    var qc3 = qc2.mutate(MutateType.DECIMAL_10);
    assert.notEqual(qc3, null, 'mutation should succeed');
    assert.notOk(qc2.isSame(qc3), 'should be different questions');
    assert.equal(qc2.x, qc3.x, 'arguments should be the same');
    assert.equal(qc2.y, qc3.y, 'arguments should be the same');
    assert.equal(qc2.operation, qc3.operation, 'operation should be the same');
    assert.notEqual(qc2.type, qc3.type, 'question type should have changed');
    assert.equal(QuestionType.DECIMAL_X | QuestionType.DECIMAL_10, qc3.type, 'question should now be decimal');
    
    qc2 = qc1.mutate(MutateType.DECIMAL_Y);
    assert.notEqual(qc2, null, 'mutation should succeed');
    assert.notOk(qc1.isSame(qc2), 'should be different questions');
    assert.equal(qc1.x, qc2.x, 'arguments should be the same');
    assert.equal(qc1.y, qc2.y, 'arguments should be the same');
    assert.equal(qc1.operation, qc2.operation, 'operation should be the same');
    assert.notEqual(qc1.type, qc2.type, 'question type should have changed');
    assert.equal(QuestionType.DECIMAL_Y, qc2.type, 'question should now be decimal');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_DECIMAL); }, vulgarOfDecimalRE,
        'VULGAR_OF_DECIMAL cannot be used before VULGAR');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_10); }, vulgarOf10RE,
        'VULGAR_OF_10 cannot be used before VULGAR');
  
    qc3 = qc2.mutate(MutateType.DECIMAL_10);
    assert.notEqual(qc3, null, 'mutation should succeed');
    assert.notOk(qc2.isSame(qc3), 'should be different questions');
    assert.equal(qc2.x, qc3.x, 'arguments should be the same');
    assert.equal(qc2.y, qc3.y, 'arguments should be the same');
    assert.equal(qc2.operation, qc3.operation, 'operation should be the same');
    assert.notEqual(qc2.type, qc3.type, 'question type should have changed');
    assert.equal(QuestionType.DECIMAL_Y | QuestionType.DECIMAL_10, qc3.type, 'question should now be decimal');

    // Square and square root
    qc1 = createQuestionConfiguration(5, 5, OperationType.MULTIPLY, false);
    assert.notEqual(qc1, null, 'should not be a null instance');

    qc2 = qc1.mutate(MutateType.SQUARE);
    assert.notEqual(qc2, null, 'mutation should succeed');
    assert.notOk(qc1.isSame(qc2), 'should be different questions');
    assert.equal(qc1.x, qc2.x, 'arguments should be the same');
    assert.equal(qc1.y, qc2.y, 'arguments should be the same');
    assert.equal(qc1.operation, qc2.operation, 'operation should be the same');
    assert.notEqual(qc1.type, qc2.type, 'question type should have changed');
    assert.equal(QuestionType.SQUARE, qc2.type, 'question should now be decimal');

    assert['throws'](function() { qc2.mutate(MutateType.DECIMAL_10); }, decimal10RE,
        'DECIMAL10 cannot be used before DECIMAL_X or DECIMAL_Y');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_DECIMAL); }, vulgarOfDecimalRE,
        'VULGAR_OF_DECIMAL cannot be used before VULGAR');
    assert['throws'](function() { qc2.mutate(MutateType.VULGAR_OF_10); }, vulgarOf10RE,
        'VULGAR_OF_10 cannot be used before VULGAR');
});

QUnit.test("mutationUnsuitable", function(assert) {
    var qc1 = createQuestionConfiguration(11, 12, OperationType.MULTIPLY, false);
    assert.notEqual(qc1, null, 'Should successfully create initial configuration');
    var qc2 = qc1.mutate(MutateType.VULGAR, MutateType.VULGAR_OF_10);
    assert.equal(qc2, null, 'Cannot mutate as z would be unfairly big');

    qc2 = qc1.mutate(MutateType.SQUARE);
    assert.equal(qc2, null, 'Cannot have a square unless the arguments are the same');
    qc1 = createQuestionConfiguration(8, 8, OperationType.DIVIDE, false);
    qc2 = qc1.mutate(MutateType.SQUARE);
    assert.notEqual(qc2, null, 'Can have a square root as the arguments are the same');

    qc1 = createQuestionConfiguration(10, 7, OperationType.DIVIDE, false);
    assert.notEqual(qc1, null, 'Should successfully create initial configuration'); 
    qc2 = qc1.mutate(MutateType.DECIMAL_X);
    assert.equal(qc2, null, 'Cannnot mutate as dividing 10 by 10 is nonsensical');
    qc1 = createQuestionConfiguration(10, 7, OperationType.DIVIDE, true);
    assert.notEqual(qc1, null, 'Should successfully create initial configuration'); 
    qc2 = qc1.mutate(MutateType.DECIMAL_Y);
    assert.equal(qc2, null, 'Cannnot mutate as dividing 10 by 10 is nonsensical');
});
