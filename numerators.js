/*
 * An object to generate numerators for vulgar fraction questions.
 *
 * $Revision: 92 $ $Date: 2017-05-22 15:31:41 +0100 (Mon, 22 May 2017) $
 *
 */

"use strict";

/*
 * Create a 'numerators' object.
 * 
 * @return A numerators object.
 */
function createNumerators() {
    var obj = {
        // The numerators stored by denominator e.g. 2 => index 1
        byDenominator : [],

        /*
         * Get a random numerator for a particular denominator.
         * 
         * @param denominator The denominator.
         * @return A random numerator.
         */
        extractRandomEntryFor : function(denominator) {
            var numerator;
            
            if ((denominator < 2) || (denominator > 12))
                throw "Attempt to use out-of-range denominator (=" + denominator + ") in 'numerators.getRandomEntryFor'";
            var index = denominator - 1;

            // Do we have any numerators for this denominator
            if ((!Array.isArray(this.byDenominator[index])) || (this.byDenominator[index].length == 0)) {
                var newNumerators = [];
                for (numerator = 1; numerator < denominator; ++numerator)
                    newNumerators.push(numerator);
                this.byDenominator[index] = newNumerators;
            }

            // Get a numerator randomly
            var remainingNumerators = this.byDenominator[index];
            var i = Math.floor(Math.random() * remainingNumerators.length);
            numerator = remainingNumerators[i];
            remainingNumerators.splice(i, 1);
            return numerator;
        }
    };

    return obj;
}
