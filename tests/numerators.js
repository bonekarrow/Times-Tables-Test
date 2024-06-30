/**
 * Unit tests for numerators object.
 *
 * $Rev: 89 $; $Date: 2017-05-22 15:28:48 +0100 (Mon, 22 May 2017) $
 *
 */

"use strict";

QUnit.module("numerators");

QUnit.test("Basic", function(assert) {
    var ns = createNumerators();


    var errorRE = /out-of-range\s+denominator/i;
    assert['throws'](function() { ns.extractRandomEntryFor(1);}, errorRE, "Can't have numerator for zero denominator");
    assert['throws'](function() { ns.extractRandomEntryFor(13);}, errorRE, "Can't have numerator for 13 or higher denominator");

    for (var i = 0; i < 8; ++i)
    {
        var n = ns.extractRandomEntryFor(4);
        assert.ok((n > 0) && (n < 4), "Numerator for denominator 4 is in range");
    }
});
