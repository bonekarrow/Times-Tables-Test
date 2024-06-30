/*
 * The questions used in the Times Tables Quiz. Includes their generation.
 *
 * $Revision: 99 $; $Date: 2017-06-05 11:19:26 +0100 (Mon, 05 Jun 2017) $
 *
 */

"use strict";

/**
 * The mathematical operation in the question.
 *
 */
var OperationType = Object.freeze({
    // Multiplication question
    MULTIPLY : 1,
    // Divide question
    DIVIDE : 2
});

/**
 * The type of question.
 *
 */
var QuestionType = Object.freeze({
    // It's a plain question
    PLAIN : 1,
    // It's a square or square root
    SQUARE : 2,
    // X is a decimal fraction
    DECIMAL_X : 3,
    // Y is a decimal fraction
    DECIMAL_Y : 4,
    // Vulgar fraction calculation; is now ignored
    VULGAR : 5,
    // Increase other argument by 10 so answer is not a decimal
    DECIMAL_10 : 16,
    // This is a vulgar fraction of a decimal
    VULGAR_OF_DECIMAL : 32,
    // This is a vulgar fraction of a 10x number
    VULGAR_OF_10 : 64,
    
    /**
     * Does the enumerated value contain a base type.
     * 
     * @param e The current value of the enum.
     * @param l The base enumerated value being looked for.
     * @return True if 'e' contains 'l'.
     */
    contains : function(e, l) {
        return (e & 0xF) == l;
    },
    
    containsPlain : function(e) { return this.contains(e, this.PLAIN); },
    containsSquare : function(e) { return this.contains(e, this.SQUARE); },
    containsDecimalX : function(e) { return this.contains(e, this.DECIMAL_X); },
    containsDecimalY : function(e) { return this.contains(e, this.DECIMAL_Y); },
    containsVulgar : function(e) { return this.contains(e, this.VULGAR); },
    
    /**
     * Has the DECIMAL_10 bitmask been used.
     *
     * @param e The current value of the enum.
     * @return  Whether DECIMAL_10 flag is in use.
     */
    isDecimal10 : function(e) {
        return (e & this.DECIMAL_10) !== 0;
    },

    /**
     * Has the VULGAR_OF_DECIMAL bitmask been used.
     *
     * @param e The current value of the enum.
     * @return  Whether VULGAR_OF_DECIMAL flag is in use.
     */
    isVulgarOfDecimal : function(e) {
        return (e & this.VULGAR_OF_DECIMAL) !== 0;
    },

    /**
     * Has the VULGAR_OF_10 bitmask been used.
     *
     * @param e The current value of the enum.
     * @return  Whether VULGAR_OF_10 flag is in use.
     */
    isVulgarOf10 : function(e) {
        return (e & this.VULGAR_OF_10) !== 0;
    }
});

/**
 * The types of mutation possible on an existing question.
 *
 */
var MutateType = Object.freeze({
    // Swap the arguments
    SWAP_ARGUMENTS : 1,
    // Swap operation i.e. OperationType.MULTIPLY vs OperationType.DIVIDE
    SWAP_OPERATION : 2,
    // Become a square's question
    SQUARE : 3,
    // Become a decimal fraction question where 'X' is the decimal
    DECIMAL_X : 4,
    // Become a decimal fraction question where 'Y' is the decimal
    DECIMAL_Y : 5,
    // Increase the other parameter by factor 10 so answer is not a decimal
    DECIMAL_10 : 6,
    // Become a vulgar fraction question
    VULGAR : 7,
    // Become a vulgar fraction question where the number the fraction is being applied to is a decimal
    VULGAR_OF_DECIMAL : 8,
    // Become a vulgar fraction question where the number the fraction is being applied to is 10x bigger
    VULGAR_OF_10 : 9
});

/*
 * Create the configuration of a question.
 * 
 * @param x         The first argument
 * @param y         The second argument
 * @param operation The operation to perform
 * @param swap      Whether to swap the order of the arguments
 * @return          The question configuration.
 * 
 */
function createQuestionConfiguration(x, y, operation, swap)
{
    if (swap)
    {
        return createQuestionConfiguration(y, x, operation, false);
    }

    var configuration = {
        // The two main arguments of the question i.e. x * y = z
        x : x,
        y : y,
        z : function () { 
            return this.x * this.y; 
        },
        // The mathematical operation; OperationType
        operation : operation,
        // The type of the question; always 'PLAIN' initially but could be mutated later
        type : QuestionType.PLAIN,

        /*
         * Clone this question apart from the index.
         *
         */
        clone : function() {
            var clone = createQuestionConfiguration(this.x, this.y, this.operation, false);
            clone.type = this.type;
            return clone;
        },

        /**
         * Create a mutated clone of this question configuration.
         *
         * @return     The mutated clone; or null if it can't be mutated.
         *
         */
        mutate : function() {
            var newConfiguration = this.clone();
        
            for (var i = 0; i < arguments.length; ++i)
            {
                switch (arguments[i])
                {
                case MutateType.SWAP_ARGUMENTS:
                    var tmp = newConfiguration.x;
                    newConfiguration.x = newConfiguration.y;
                    newConfiguration.y = tmp;
                    break;
                
                case MutateType.SWAP_OPERATION:
                    if (newConfiguration.operation == OperationType.MULTIPLY)
                        newConfiguration.operation = OperationType.DIVIDE;
                    else
                        newConfiguration.operation = OperationType.MULTIPLY;
                    break;
                
                case MutateType.SQUARE:
                    newConfiguration.type = QuestionType.SQUARE;
                    break;

                case MutateType.DECIMAL_X:
                    newConfiguration.type = QuestionType.DECIMAL_X;
                    break;
                    
                case MutateType.DECIMAL_Y:
                    newConfiguration.type = QuestionType.DECIMAL_Y;
                    break;
                    
                case MutateType.DECIMAL_10:
                    if (!(QuestionType.containsDecimalX(newConfiguration.type) || 
                          QuestionType.containsDecimalY(newConfiguration.type)))
                        throw "Using 'DECIMAL_10' prior to 'DECIMAL_X' or 'DECIMAL_Y'";
                    newConfiguration.type |= QuestionType.DECIMAL_10;
                    break;
                
                case MutateType.VULGAR:
                    newConfiguration.type = QuestionType.VULGAR;
                    break;

                case MutateType.VULGAR_OF_DECIMAL:
                    if (!QuestionType.containsVulgar(newConfiguration.type))
                        throw "Using 'VULGAR_OF_DECIMAL' prior to 'VULGAR'";
                    newConfiguration.type |= QuestionType.VULGAR_OF_DECIMAL;
                    break;
                    
                case MutateType.VULGAR_OF_10:
                    if (!QuestionType.containsVulgar(newConfiguration.type))
                        throw "Using 'VULGAR_OF_10' prior to 'VULGAR'";
                    newConfiguration.type |= QuestionType.VULGAR_OF_10;
                    break;

                default:
                    throw "Encountered unexpected 'MutateType' in 'questionConfiguration.mutate'";
                }
            }

            // Can only do square (root) question when 'x' and 'y' are the same.
            if (QuestionType.containsSquare(newConfiguration.type) && (newConfiguration.x != newConfiguration.y))
                return null;

            // Non-sensical to do decimal fraction on an argument that is 10
            if (QuestionType.containsDecimalX(newConfiguration.type) && (newConfiguration.x == 10) ||
                QuestionType.containsDecimalY(newConfiguration.type) && (newConfiguration.y == 10))
                return null;
                
            // Avoid vulgar fractions where z is above 1000 as it becomes too confusing
            if ((newConfiguration.type == (QuestionType.VULGAR | QuestionType.VULGAR_OF_10)) && 
                (newConfiguration.z() >= 100))
                return null;
                
            return newConfiguration;
        },

        /*
         * Test if two question configurations are the same? 
         *
         * @param rhs The question configuration to compare against.
         * @return    True if the question configurations match.
         */
        isSame : function(rhs) {
            if ((this.x != rhs.x) || (this.y != rhs.y) || (this.type != rhs.type))
                return false;

            // Operation is not pertinent for vulgar fraction questions
            if (QuestionType.containsVulgar(this.type))
                return true;

            return this.operation == rhs.operation;
        }
    };

    return configuration;
}

/*
 * Create a question object.
 *
 * @param configuration The configuration of the question.
 * @param numerators    An object to create sequences of numerators.
 * @return              The question.
 *
 */
function createQuestion(configuration, numerators)
{ 
    // Create the basic question
    var question = {
        // The index of this question
        index : -1,
        // The configuration of this question
        configuration : configuration,
        // The unique id for this question
        id : function(prefix) { 
            return prefix + '_' + this.index; 
        },

        /**
         * Clone this question by copying its properties. We can share the configuration as that's immutable.
         * Really all we care about is the index.
         * 
         * @return A clone of this question.
         */
        clone : function() {
            var copy = {};
            for (var attr in this) {
                if (this.hasOwnProperty(attr)) 
                    copy[attr] = this[attr];
            }
            return copy;
        },
        
        /**
         * Divide number by 10 and return as string.
         *
         * @param x The non-negative integer to divide by 10.
         * @return  Result as string.
         */
        divideBy10 : function(x) {
            var n = Math.floor(x / 10);
            var r = x % 10;
            var result = n.toString();
            if (r != 0)
                result += '.' + r.toString();
            return result;
        },

        /*
        * Format an argument as HTML.
        *
        */
        argAsHTML : function(argumentName) {
            var text;
            switch (argumentName)
            {
                case 'x':
                    if (QuestionType.containsDecimalX(this.configuration.type))
                        text = this.divideBy10(this.configuration.x);
                    else if (this.configuration.type == (QuestionType.DECIMAL_Y | QuestionType.DECIMAL_10))
                        text = this.configuration.x * 10;                        
                    else
                        text = this.configuration.x;
                    break;
                case 'y':
                    if (QuestionType.containsDecimalY(this.configuration.type))
                        text = this.divideBy10(this.configuration.y);
                    else if (this.configuration.type == (QuestionType.DECIMAL_X | QuestionType.DECIMAL_10))
                        text = this.configuration.y * 10;                        
                    else
                        text = this.configuration.y;
                    break;
                case 'z':
                    // Next test deliberately won't pass if 'QuestionType.DECIMAL_10' is in effect
                    if ((this.configuration.type == QuestionType.DECIMAL_X) || 
                        (this.configuration.type == QuestionType.DECIMAL_Y) ||
                        (this.configuration.type == (QuestionType.VULGAR | QuestionType.VULGAR_OF_DECIMAL)))
                        text = this.divideBy10(this.configuration.z());
                    else if (this.configuration.type == (QuestionType.VULGAR | QuestionType.VULGAR_OF_10))
                        text = this.configuration.z() * 10;
                    else
                        text = this.configuration.z();
                    break;
                default:
                    throw 'unexpected argument name:' + argumentName;
            }

            var textNode = document.createTextNode(text);            
            var tdElement = document.createElement('td');
            tdElement.appendChild(textNode);
            return tdElement;
        },

        /*
         * Add the final part of the HTML for a quesion. This is the equals sign onwards. This portion is 
         * common to all questions.
         * 
         * tdElements - The TD elements that make up a question. It is appended to by this function.
         */
        addFinalHTML : function(tdElements) {
            // The equals symbol
            var tdElement = document.createElement('td');
            tdElement.innerHTML = '&equals;';
            tdElements.push(tdElement);

            // The answer box
            tdElement = document.createElement('td');
            var inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.id = this.id('Q');
            inputElement.tabIndex = String(this.index + 1);
            var self = this;
            inputElement.oninput = function() {
                checkIfAllQuestionsAnswered(self.index);
            };
            inputElement.onkeydown = function() {
                moveToNextInput(self.index);
            };
            tdElement.appendChild(inputElement);
            tdElements.push(tdElement);

            // The correct/incorrect image
            tdElement = document.createElement('td');
            var imgElement = document.createElement('img');
            imgElement.id = this.id('M');
            imgElement.src = 'blank.png';
            tdElement.appendChild(imgElement);
            tdElements.push(tdElement);
        },

        /**
         * Check if the question has been answered and correct. Uses 'isAnswerCorrect()'.
         *
         * @param testAnswer An optional value for the answer to allow testing.
         * @return -1 if wrong; 0 if unanswered; 1 if correct
         * 
         */
        isAnswered : function (testAnswer) {
            var answerNumber;
            if (testAnswer === undefined)
            {
                // Get the input containing the user's answer
                var answer = document.getElementById(this.id('Q')).value;
                answerNumber = parseFloat(answer);
            }
            else
            {
                // A test value has been supplied
                answerNumber = testAnswer;
            }

            // If it's not-a-number then count it as unanswered
            if (isNaN(answerNumber)) 
                return 0;

            return this.isAnswerCorrect(answerNumber) ? 1 : -1;
        }
    };

    if (QuestionType.containsPlain(configuration.type) ||
        QuestionType.containsDecimalX(configuration.type) ||
        QuestionType.containsDecimalY(configuration.type)) {
        // If the configurations are the same then it's the same question
        question.isSame = function(rhs) {
            return this.configuration.isSame(rhs.configuration);
        };

        /*
         * Format the question using HTML.
         *
         */
        question.asHTML = function () {
            // The series of table data elements that make up this question
            var tdElements = new Array();
        
            // The index of the question
            var tdElement = document.createElement('td');
            tdElement.className = 'index';
            tdElement.appendChild(document.createTextNode((this.index + 1) + ')'));
            tdElements.push(tdElement);

            // A plain or decimal fraction question     
            if (this.configuration.operation == OperationType.DIVIDE)
            {
                tdElements.push(this.argAsHTML('z'));
                tdElement = document.createElement('td');
                tdElement.innerHTML = '&divide;';
                tdElements.push(tdElement);
                tdElements.push(this.argAsHTML('x'));
            }
            else
            {
                tdElements.push(this.argAsHTML('x'));
                tdElement = document.createElement('td');
                tdElement.innerHTML = '&times;';
                tdElements.push(tdElement);
                tdElements.push(this.argAsHTML('y'));
            }

            this.addFinalHTML(tdElements);
            return tdElements;
        };

        /*
         * Check the user's answer.
         *
         * @param answer The answer to test.
         * @return True if correct.
         */
        question.isAnswerCorrect = function (answer) {
            switch (this.configuration.operation)
            {
                case OperationType.DIVIDE: 
                    // Doesn't matter if increasing 'x' and 'z' by a factor of ten
                    if (QuestionType.containsDecimalY(this.configuration.type))
                        answer *= 10.0;
                    else if (this.configuration.type == (QuestionType.DECIMAL_X | QuestionType.DECIMAL_10))
                    {
                        // The user will supply an answer that has been increased by a factor of 10
                        answer /= 10.0;
                    }
                    return (Math.abs(this.configuration.x * answer - this.configuration.z()) <= 1.0e-6);

                case OperationType.MULTIPLY:
                    // Need to scale up answer if either 'x' or 'y' is a decimal and the other parameter has
                    // not been increased by a factor of 10.
                    if ((this.configuration.type == QuestionType.DECIMAL_X) || 
                        (this.configuration.type == QuestionType.DECIMAL_Y))
                        answer *= 10.0;
                    return (Math.abs(this.configuration.x * this.configuration.y - answer) <= 1.0e-6);

                default:
                    throw "Encountered unexpected 'OperationType' in 'question.isAnswered'";
            }
        };
    } else if (QuestionType.containsSquare(configuration.type)) {
        question.isSame = function(rhs) {
            return this.configuration.isSame(rhs.configuration);
        };

        /*
         * Format the question using HTML.
         *
         */
        question.asHTML = function () {
            // The series of table data elements that make up this question
            var tdElements = new Array();
        
            // The index of the question
            var tdElement = document.createElement('td');
            tdElement.className = 'index';
            tdElement.appendChild(document.createTextNode((this.index + 1) + ')'));
            tdElements.push(tdElement);

            // There's only one argument to the question so it spans three columns            
            tdElement = document.createElement('td');
            tdElement.colSpan = '3';
            tdElement.className = 'square';
            if (this.configuration.operation == OperationType.DIVIDE)
                tdElement.innerHTML = "&radic;<span class='squareRoot'>" + this.configuration.z() + "</span>";
            else
                tdElement.innerHTML = this.configuration.x + '<sup>2</sup>';
            tdElements.push(tdElement);

            this.addFinalHTML(tdElements);
            return tdElements;
        };

        /**
         * Check the user's answer.
         *
         * @param answer The answer to test.
         * @return True if correct.
         */
        question.isAnswerCorrect = function (answer) {
            switch (this.configuration.operation)
            {
                case OperationType.DIVIDE: 
                    return Math.abs(this.configuration.x * answer - this.configuration.z()) <= 1.0e-6;

                case OperationType.MULTIPLY:
                    return Math.abs(this.configuration.x * this.configuration.x - answer) <= 1.0e-6;

                default:
                    throw "Encountered unexpected 'OperationType' in 'question.isAnswerCorrect'";
            }
        };
    } else if (QuestionType.containsVulgar(configuration.type)) {
        // These questions need a numerator as well
        question.numerator = numerators.extractRandomEntryFor(configuration.x);

        /*
         * The configuration and the numerator must be the same.
         * 
         * @param rhs The question to compare against.
         * @return True if the same.
         */
        question.isSame = function(rhs) {
            return this.configuration.isSame(rhs.configuration) && (question.numerator == rhs.numerator);
        };

        /*
         * Format the question using HTML.
         *
         * @return An array of TD elements.
         */
        question.asHTML = function () {
            // The series of table data elements that make up this question
            var tdElements = new Array();
        
            // The index of the question
            var tdElement = document.createElement('td');
            tdElement.className = 'index';
            tdElement.appendChild(document.createTextNode((this.index + 1) + ')'));
            tdElements.push(tdElement);
            
            // Use a table to display the vulgar fraction
            tdElement = document.createElement('td');
            tdElement.appendChild(document.createTextNode(this.numerator));
            var trElement = document.createElement('tr');
            trElement.appendChild(tdElement);
            var tbodyElement = document.createElement('tbody');
            tbodyElement.appendChild(trElement);            
            tdElement = document.createElement('td');
            tdElement.appendChild(document.createTextNode(this.configuration.x));
            trElement = document.createElement('tr');
            trElement.appendChild(tdElement);
            tbodyElement.appendChild(trElement);            
            var tableElement = document.createElement('table');
            tableElement.appendChild(tbodyElement);
            tableElement.className = 'vulgarFraction';
 
            tdElement = document.createElement('td');
            tdElement.appendChild(tableElement);
            tdElements.push(tdElement);
            
            tdElement = document.createElement('td');
            tdElement.appendChild(document.createTextNode('of'));
            tdElements.push(tdElement);
            
            tdElements.push(this.argAsHTML('z'));

            this.addFinalHTML(tdElements);
            return tdElements;
        };

        /*
         * Check the user's answer.
         *
         * @param answer The answer to test.
         * @return True if correct.
         */
        question.isAnswerCorrect = function (answer) {
            var correctNumber = this.numerator * this.configuration.y;
            if (QuestionType.isVulgarOfDecimal(this.configuration.type))
                correctNumber /= 10.0;
            else if (QuestionType.isVulgarOf10(this.configuration.type))
                correctNumber *= 10;
            return Math.abs(correctNumber - answer) <= 1.0e-6;
        };
    } else {
        throw "Encountered unexpected 'QuestionType' in 'createQuestion'";
    }

    return question;
}

/*
 * Extract a random entry or entries from an array.
 *
 * @param entries The entries to choose from; might be singles, pairs, triples etc.
 * @param count   The number of items in an entry; 1, 2, 3 etc.
 * @return        The entry; either a value or array of 'count' values.
 *
 */
function extractRandomEntry(entries, count)
{
    var i = Math.floor(Math.random() * Math.floor(entries.length / count)) * count;
    var entry;
    if (count == 1)
        entry = entries[i];
    else
        entry = entries.slice(i, i + count);
    entries.splice(i, count);
    return entry;
}

/*
 * Test if a question is new.
 *
 * @param question          The proposed new question.
 * @param baseQuestions     The base questions.
 * @param variantsQuestions Variants of the base questions.
 * @return                  Whether the question is new.
 *
 */
function isNewQuestion(question, baseQuestions, variantQuestions)
{
    var i;
    for (i = 0; i < baseQuestions.length; ++i)
    {
        if (question.isSame(baseQuestions[i]))
        {
            return false;
        }
    }
    for (i = 0; i < variantQuestions.length; ++i)
    {
        if (question.isSame(variantQuestions[i]))
        {
            return false;
        }
    }

    return true;
}

/**
 * Create the question from the configuration. If it's not in the base or variant questions then add it to the destination array
 * of questions.
 * 
 * @param  questionConfiguration The configuration of the questions; may be null.
 * @param  numerators            An object to generate numerators.
 * @param  baseQuestions         The base questions so far.
 * @param  variantQuestions      The variant questions so far.
 * @param  destination           Either 'baseQuestions' or 'variantQuestions'.
 */
function createAndAddIfNew(questionConfiguration, numerators, baseQuestions, variantQuestions, destination) 
{
    if (questionConfiguration == null)
        return;
    var question = createQuestion(questionConfiguration, numerators);
    if (isNewQuestion(question, baseQuestions, variantQuestions))
        destination.push(question);
}

/*
 * Generate the questions that will be asked. The 'questions' array is updated.
 *
 * @param configuration The configuration of the quiz.
 *
 */
function generateQuestions(configuration)
{
    var i;

    // The first set of number pairs 
    var baseQuestionsCount = 0;
    var numberPairs = [];
    for (var x = 2; x <= 12; ++x)
    {
        for (i = 0; i < configuration.selectedTables.length; ++i)
        {
            numberPairs.push(x);
            numberPairs.push(configuration.selectedTables[i]);

            ++baseQuestionsCount;
        }
    }

    // Generate a complimentary set of 'operations' and argument 'swaps'
    var operations = [];
    var swaps = [];
    var decimals = [];
    var harderVulgars = [];
    for (i = 0; i < baseQuestionsCount / 2; ++i)
    {
        operations[i] = OperationType.MULTIPLY;
        swaps[i] = true;
        decimals[i] = MutateType.DECIMAL_X;
        harderVulgars[i] = MutateType.VULGAR_OF_DECIMAL;
    }
    for (; i < baseQuestionsCount; ++i)
    {
        operations[i] = OperationType.DIVIDE;
        swaps[i] = false;
        decimals[i] = MutateType.DECIMAL_Y;
        harderVulgars[i] = MutateType.VULGAR_OF_10;
    }

    // Get the numerators for any vulgar fraction questions
    var numerators = createNumerators();

    // Create the base and extra questions to ask
    var baseQuestions = [];
    var variantQuestions = [];
    for (i = 0; i < baseQuestionsCount; ++i)
    {
        // Get the numbers / operations / argument swaps / decimal arguments / harder vulgar for this question
        var numbers = extractRandomEntry(numberPairs, 2);
        var operation = extractRandomEntry(operations, 1);
        var swap = extractRandomEntry(swaps, 1);
        var decimalStyle = extractRandomEntry(decimals, 1);
        var harderVulgar = extractRandomEntry(harderVulgars, 1);

        // Set up the base question configuration
        var originalQC = createQuestionConfiguration(numbers[0], numbers[1], operation, swap);
        if (configuration.includePlain)
        {
            createAndAddIfNew(originalQC, numerators, baseQuestions, variantQuestions, baseQuestions);

            // Set up the variant questions of the base one
            var mutatedQC = originalQC.mutate(MutateType.SWAP_ARGUMENTS);
            createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
        }

        // Are we adding squares and square roots as well?
        if (configuration.includeSquares)
        {
            // There's no point in swapping the 'x' and 'y'
            mutatedQC = originalQC.mutate(MutateType.SQUARE);
            createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, baseQuestions);
        }
        
        // Are we adding decimal fractions as well?
        if (configuration.includeDecimals)
        {
            mutatedQC = originalQC.mutate(decimalStyle);
            if (mutatedQC != null) 
            {
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, baseQuestions);

                mutatedQC = mutatedQC.mutate(MutateType.DECIMAL_10);
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
            }

            mutatedQC = originalQC.mutate(MutateType.SWAP_ARGUMENTS, decimalStyle);
            if (mutatedQC !== null)
            {
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);

                mutatedQC = mutatedQC.mutate(MutateType.DECIMAL_10);
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
            }
        }
        
        // Are we adding vulgar fractions as well?
        if (configuration.includeVulgars)
        {
            mutatedQC = originalQC.mutate(MutateType.VULGAR);
            if (mutatedQC != null)
            {
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, baseQuestions);
    
                if (configuration.includeHarderInVulgars)
                {
                    // Deliberately swapping arguments as I want to distinguish this question from the one above
                    mutatedQC = originalQC.mutate(MutateType.SWAP_ARGUMENTS, MutateType.VULGAR, harderVulgar);
                    createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, baseQuestions);
                }
            }

            mutatedQC = originalQC.mutate(MutateType.SWAP_ARGUMENTS, MutateType.VULGAR);
            if (mutatedQC != null)
            {
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
    
                if (configuration.includeHarderInVulgars)
                {
                    // Deliberately not swapping arguments as I want to distinguish this question from the one above
                    mutatedQC = originalQC.mutate(MutateType.VULGAR, harderVulgar);
                    createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
                }
            }
        }

        // Reverse the operation
        originalQC = originalQC.mutate(MutateType.SWAP_OPERATION);
        if (originalQC !== null)
        {
            if (configuration.includePlain)
            {
                createAndAddIfNew(originalQC, numerators, baseQuestions, variantQuestions, variantQuestions);

                mutatedQC = originalQC.mutate(MutateType.SWAP_ARGUMENTS);
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
            }

            // Are we adding squares and square roots as well?
            if (configuration.includeSquares)
            {
                // There's no point in swapping the 'x' and 'y'
                mutatedQC = originalQC.mutate(MutateType.SQUARE);
                createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
            }

            // Are we adding decimal fractions as well?
            if (configuration.includeDecimals)
            {
                mutatedQC = originalQC.mutate(decimalStyle);
                if (mutatedQC !== null)
                {
                    createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);

                    mutatedQC = mutatedQC.mutate(MutateType.DECIMAL_10);
                    createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
                }
                
                mutatedQC = originalQC.mutate(MutateType.SWAP_ARGUMENTS, decimalStyle);
                if (mutatedQC !== null)
                {
                    createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);

                    mutatedQC = mutatedQC.mutate(MutateType.DECIMAL_10);
                    createAndAddIfNew(mutatedQC, numerators, baseQuestions, variantQuestions, variantQuestions);
                }
            }
        }
    }
    numberPairs = null;
    operations = null;
    swaps = null;
    decimals = null;
    numerators = null;

    // Use base questions first and then extra questions
    questions = [];
    var availableQuestions = baseQuestions;
    for (i = 0; i < configuration.count; ++i)
    {
        if (availableQuestions.length <= 0)
        {
            // Run out of base questions? Use the variants of the base questions.
            availableQuestions = [];
            for (var j = 0; j < variantQuestions.length; ++j)
            {
                availableQuestions.push(variantQuestions[j].clone());
            }
        }

        var nextQuestion = extractRandomEntry(availableQuestions, 1);
        nextQuestion.index = i;
        questions.push(nextQuestion);
    }
    availableQuestions = null;
    baseQuestions = null;
    variantQuestions = null;
}

/*
 * Generate the contents of the questions table element. Uses the 'questions' array.
 *
 * @param columnCount  The number of columns to use.
 * @param tableElement The table elgenerateement to generate the quiz into.
 *
 */
function generateTableContents(columnCount, tableElement)
{
    var rows = Math.ceil(questions.length / columnCount);
    var row, col;

    // Create the table rows
    var trElements = new Array();
    for (row = 0; row < rows; ++row)
        trElements.push(document.createElement('tr'));

    // Put the questions down the rows
    var i = 0;
    for (col = 0; col < columnCount; ++col)
    {
        for (row = 0; (row < rows) && (i < questions.length); ++row)
        {
            var trElement = trElements[row];

            if (col > 0)
            {
                var tdElement = document.createElement('td');
                tdElement.className = 'spacer';
                trElement.appendChild(tdElement);
            }
            questions[i].asHTML().forEach(function(x) { trElement.appendChild(x); }); 
            ++i;
        }
    }

    // Append table records into the table
    trElements.forEach(function(x) { tableElement.appendChild(x); });
}

/*
 * Check if all the questions have been answered. If they have then enable the "Mark" button.
 *
 */
function checkIfAllQuestionsAnswered(questionIndex)
{
    // Get the image element containing tick/cross for this question. If the answer has changed then blank the tick/cross.
    var imgElement = document.getElementById(questions[questionIndex].id('M'));
    imgElement.src = 'blank.png';
    imgElement = null;

    // Blank the results message
    document.getElementById("message").innerHTML = '';

    // Only enable the mark button if all questions have an answer
    for (var i = 0; i < questions.length; ++i)
    {
        if (questions[i].isAnswered() === 0)
        {
            document.getElementById("markButton").disabled = true;
            return;
        }
    }

    document.getElementById("markButton").disabled = false;
}

/*
 * An event handler for the input boxes. If the return key is pressed then move onto the next question.
 *
 */
function moveToNextInput(questionIndex)
{
    if (event.keyCode == 13)
    {
        if (questionIndex < questions.length - 1)
            document.getElementById(questions[questionIndex + 1].id('Q')).focus();
        else
            document.getElementById(questions[0].id('Q')).focus();
    }
}

/*
 * Mark the quiz putting a tick or cross next to each question.
 *
 */
function markQuestions()
{
    var countCorrect = 0;
    for (var i = 0; i < questions.length; ++i)
    {
        var imgElement = document.getElementById(questions[i].id('M'));

        if (questions[i].isAnswered() > 0)
        {
            ++countCorrect;
            imgElement.src = 'tick.png';
        }
        else
            imgElement.src = 'cross.png';
        imgElement = null;
    }

    document.getElementById('message').innerHTML = 'You got ' + countCorrect + ' out of ' + questions.length + ' questions right.';
}

// The questions being asked
var questions = [];

/**
 * Attempt to populate the table 'quiz' in the document
 *
 */
function populateQuizTable()
{
    // Has the user selected times tables to test on?
    var configuration = getConfiguration();
    if (configuration == null)
    {
        // Display the configuration link
        document.getElementById('configure').style.display = 'inline';
    }
    else
    {
        // Store the configuration, this has the effect of avoiding the cookie expiring
        storeConfiguration(configuration.selectedTables, configuration.count, configuration.includePlain,
            configuration.includeSquares, configuration.includeDecimals, configuration.includeVulgars,
            configuration.includeHarderInVulgars, configuration.columnCount);
    
        // Generate the questions; populates the 'questions' array
        generateQuestions(configuration);

        // Populate the quiz contents
        var tableElement = document.getElementById('questionsTable');
        generateTableContents(configuration.columnCount, tableElement);

        // Display the quiz
        document.getElementById('quiz').style.display = 'inline';

        // Update the times table being tested
        var timesTablesSelected = '';
        for (var i = 0; i < configuration.selectedTables.length; ++i)
        {
            if (i < configuration.selectedTables.length - 2)
                timesTablesSelected += configuration.selectedTables[i] + ', ';
            else if (i == configuration.selectedTables.length - 2)
                timesTablesSelected += configuration.selectedTables[i] + ' and ';
            else
                timesTablesSelected += configuration.selectedTables[i];
        }
        document.getElementById('timesTablesSelected').innerHTML = timesTablesSelected;

        // Go to first input
        document.getElementById(questions[0].id('Q')).focus();
    }
}

