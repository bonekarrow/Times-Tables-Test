/**
 * Unit tests for question object.
 *
 * $Rev: 99 $; $Date: 2017-06-05 11:19:26 +0100 (Mon, 05 Jun 2017) $
 *
 */

"use strict";

QUnit.module("questions");

QUnit.test("CorrectAnswer", function(assert) {
    var numerators = createNumerators();

    var qc1 = createQuestionConfiguration(6, 7, OperationType.DIVIDE, false);
    var q1 = createQuestion(qc1, numerators);

    assert.equal(q1.isAnswered(7), 1, 'Question should be 42 / 6 = 7');
    assert.equal(q1.isAnswered(6), -1, 'Question should be 42 / 6 = 7');
    assert.equal(q1.isAnswered(8), -1, 'Question should be 42 / 6 = 7');

    var qc2 = createQuestionConfiguration(6, 7, OperationType.DIVIDE, true);
    var q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(6), 1, 'Question should be 42 / 7 = 6');
    assert.equal(q2.isAnswered(5), -1, 'Question should be 42 / 7 = 6');
    assert.equal(q2.isAnswered(7), -1, 'Question should be 42 / 7 = 6');

    qc2 = qc1.mutate(MutateType.SWAP_ARGUMENTS);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(6), 1, 'Question should be 42 / 7 = 6');
    assert.equal(q2.isAnswered(5), -1, 'Question should be 42 / 7 = 6');
    assert.equal(q2.isAnswered(7), -1, 'Question should be 42 / 7 = 6');

    qc2 = qc1.mutate(MutateType.DECIMAL_X);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(7), 1, 'Question should be 4.2 / 0.6 = 7');
    assert.equal(q2.isAnswered(6), -1, 'Question should be 4.2 / 0.6 = 7');
    assert.equal(q2.isAnswered(8), -1, 'Question should be 4.2 / 0.6 = 7');

    qc2 = qc1.mutate(MutateType.DECIMAL_X, MutateType.DECIMAL_10);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(70), 1, 'Question should be 42 / 0.6 = 70');
    assert.equal(q2.isAnswered(69), -1, 'Question should be 42 / 0.6 = 70');
    assert.equal(q2.isAnswered(71), -1, 'Question should be 42 / 0.6 = 70');

    qc2 = qc1.mutate(MutateType.DECIMAL_Y);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(0.7), 1, 'Question should be 4.2 / 6 = 0.7');
    assert.equal(q2.isAnswered(0.69), -1, 'Question should be 4.2 / 6 = 0.7');
    assert.equal(q2.isAnswered(0.71), -1, 'Question should be 4.2 / 6 = 0.7');

    qc2 = qc1.mutate(MutateType.DECIMAL_Y, MutateType.DECIMAL_10);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(0.7), 1, 'Question should be 42 / 60 = 0.7');
    assert.equal(q2.isAnswered(0.69), -1, 'Question should be 42 / 60 = 0.7');
    assert.equal(q2.isAnswered(0.71), -1, 'Question should be 42 / 60 = 0.7');

    qc2 = qc1.mutate(MutateType.SWAP_OPERATION, MutateType.DECIMAL_X);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(4.2), 1, 'Question should be 0.6 x 7 = 4.2');
    assert.equal(q2.isAnswered(4.1), -1, 'Question should be 0.6 x 7 = 4.2');
    assert.equal(q2.isAnswered(4.3), -1, 'Question should be 0.6 x 7 = 4.2');

    qc2 = qc1.mutate(MutateType.SWAP_OPERATION, MutateType.DECIMAL_Y);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(4.2), 1, 'Question should be 6 x 0.7 = 4.2');
    assert.equal(q2.isAnswered(4.1), -1, 'Question should be 6 x 0.7 = 4.2');
    assert.equal(q2.isAnswered(4.3), -1, 'Question should be 6 x 0.7 = 4.2');

    // Squares and square roots
    qc1 = createQuestionConfiguration(4, 4, OperationType.MULTIPLY, false);
    qc2 = qc1.mutate(MutateType.SQUARE);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(16), 1, 'Question should be 4^2 = 16');
    assert.equal(q2.isAnswered(15), -1, 'Question should be 4^2 = 16');
    assert.equal(q2.isAnswered(17), -1, 'Question should be 4^2 = 16');

    qc2 = qc1.mutate(MutateType.SWAP_OPERATION, MutateType.SQUARE);
    q2 = createQuestion(qc2, numerators);

    assert.equal(q2.isAnswered(4), 1, 'Question should be 16^-2 = 4');
    assert.equal(q2.isAnswered(3), -1, 'Question should be 16^-2 = 4');
    assert.equal(q2.isAnswered(5), -1, 'Question should be 16^-2 = 4');

    // Vulgar fractions
    qc1 = createQuestionConfiguration(6, 7, OperationType.DIVIDE, false);
    qc2 = qc1.mutate(MutateType.VULGAR);
    q2 = createQuestion(qc2, numerators);
    q2.numerator = 5; // Override the numerator so it is predictable

    assert.equal(q2.isAnswered(35), 1, 'Question should be 5/6 of 42 = 35');
    assert.equal(q2.isAnswered(34), -1, 'Question should be 5/6 of 42 = 35');
    assert.equal(q2.isAnswered(36), -1, 'Question should be 5/6 of 42 = 35');
    
    qc2 = qc1.mutate(MutateType.VULGAR, MutateType.VULGAR_OF_DECIMAL);
    q2 = createQuestion(qc2, numerators);
    q2.numerator = 5; // Override the numerator so it is predictable

    assert.equal(q2.isAnswered(3.5), 1, 'Question should be 5/6 of 4.2 = 3.5');
    assert.equal(q2.isAnswered(3.4), -1, 'Question should be 5/6 of 4.2 = 3.5');
    assert.equal(q2.isAnswered(3.6), -1, 'Question should be 5/6 of 4.2 = 3.5');

    qc2 = qc1.mutate(MutateType.VULGAR, MutateType.VULGAR_OF_10);
    q2 = createQuestion(qc2, numerators);
    q2.numerator = 5; // Override the numerator so it is predictable

    assert.equal(q2.isAnswered(350), 1, 'Question should be 5/6 of 420 = 350');
    assert.equal(q2.isAnswered(349), -1, 'Question should be 5/6 of 420 = 350');
    assert.equal(q2.isAnswered(351), -1, 'Question should be 5/6 of 420 = 350');
});

QUnit.test("isSame", function (assert) {
    var numerators = createNumerators();

    // Test that two questions are the same
    var qc1 = createQuestionConfiguration(5, 6, OperationType.DIVIDE, false);
    var qc2 = createQuestionConfiguration(6, 5, OperationType.MULTIPLY, true);
    var q1 = createQuestion(qc1, numerators);
    var q2 = createQuestion(qc2, numerators);
    assert.notOk(q1.isSame(q2), 'Different operation types so not the same');

    qc2 = qc2.mutate(MutateType.SWAP_OPERATION);
    q2 = createQuestion(qc2, numerators);
    assert.ok(q1.isSame(q2), 'Should now be the same');

    // Index does not affect being the same
    q1.index = 42;
    assert.ok(q1.isSame(q2), 'Different index does not matter');
    
    // Let's try decimals
    qc1 = createQuestionConfiguration(5, 6, OperationType.DIVIDE, false);
    qc2 = createQuestionConfiguration(6, 5, OperationType.MULTIPLY, false);
    var qc3 = qc1.mutate(MutateType.SWAP_ARGUMENTS, MutateType.DECIMAL_X);
    var qc4 = qc2.mutate(MutateType.SWAP_OPERATION, MutateType.DECIMAL_X);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    q2.index = 42;
    assert.ok(q1.isSame(q2), 'Decimal question should be the same even though arrived at in different order');

    qc3 = qc1.mutate(MutateType.SWAP_OPERATION, MutateType.DECIMAL_Y);
    qc4 = qc2.mutate(MutateType.SWAP_ARGUMENTS, MutateType.DECIMAL_Y);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    q2.index = 42;
    assert.ok(q1.isSame(q2), 'Decimal question should be the same even though arrived at in different order');

    qc1 = createQuestionConfiguration(5, 6, OperationType.DIVIDE, false);
    qc3 = qc1.mutate(MutateType.DECIMAL_X);
    qc4 = qc1.mutate(MutateType.DECIMAL_Y);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    assert.notOk(q1.isSame(q2), 'Decimal questions should be different');

    qc1 = createQuestionConfiguration(5, 6, OperationType.DIVIDE, false);
    qc3 = qc1.mutate(MutateType.DECIMAL_X);
    qc4 = qc3.mutate(MutateType.DECIMAL_10);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    assert.notOk(q1.isSame(q2), 'Decimal questions should be different');
    qc3 = qc3.mutate(MutateType.DECIMAL_10);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    assert.ok(q1.isSame(q2), 'Decimal questions should be different');
    
    // Squares and square roots
    qc1 = createQuestionConfiguration(5, 5, OperationType.DIVIDE, false);
    qc2 = createQuestionConfiguration(5, 5, OperationType.MULTIPLY, true);
    qc3 = qc1.mutate(MutateType.SWAP_ARGUMENTS, MutateType.SQUARE);
    qc4 = qc2.mutate(MutateType.SWAP_OPERATION, MutateType.SQUARE);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    assert.ok(q1.isSame(q2), 'Square questions should be the same');
    
    qc3 = qc1.mutate(MutateType.SQUARE);
    qc4 = qc2.mutate(MutateType.SQUARE);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    assert.notOk(q1.isSame(q2), 'Different operation implies square vs square root');

    // Vulgar fractions
    qc1 = createQuestionConfiguration(5, 6, OperationType.MULTIPLY, false);
    qc2 = createQuestionConfiguration(5, 6, OperationType.DIVIDE, true);
    qc3 = qc1.mutate(MutateType.SWAP_OPERATION, MutateType.VULGAR);
    qc4 = qc2.mutate(MutateType.SWAP_ARGUMENTS, MutateType.VULGAR);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    assert.ok(qc3.isSame(qc4), 'Question configurations are the same');
    assert.notOk(q1.isSame(q2), 'Numerators are different although configurations are the same');
    q2.numerator = q1.numerator;
    assert.ok(q1.isSame(q2), 'Questions are now the same');

    qc4 = qc4.mutate(MutateType.SWAP_OPERATION);
    q1 = createQuestion(qc3, numerators);
    q2 = createQuestion(qc4, numerators);
    q2.numerator = q1.numerator;
    assert.ok(q1.isSame(q2), 'Questions are still the same as operation is not significant');
 
    qc3 = qc1.mutate(MutateType.VULGAR);
    qc4 = qc3.mutate(MutateType.VULGAR_OF_DECIMAL);       
    q1 = createQuestion(qc3, numerators);
    q1.numerator = 1;
    q2 = createQuestion(qc4, numerators);
    q2.numerator = 2;
    assert.notOk(q1.isSame(q2), 'Simple vulgar fraction questions and harder vulgar fraction questions are not the same');
    
    qc4 = qc3.mutate(MutateType.VULGAR_OF_10);       
    q1 = createQuestion(qc3, numerators);
    q1.numerator = 1;
    q2 = createQuestion(qc4, numerators);
    q2.numerator = 2;
    assert.notOk(q1.isSame(q2), 'Simple vulgar fraction questions and harder vulgar fraction questions are not the same');
});
