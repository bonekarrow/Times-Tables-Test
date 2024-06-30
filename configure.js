/*
 * Scripts for the 'configure.html' page.
 *
 * $Revision: 99 $; $Date: 2017-06-05 11:19:26 +0100 (Mon, 05 Jun 2017) $
 *
 */

"use strict";

/** 
 * The configuration has changed. Use global variable 'includeNumbers' and controls to update the cookie storing the configuration.
 *
 */
 function configurationChanged()
 {
    // Map the selected numbers to a list of numbers
    var tmp = new Array();
    includeNumbers.forEach(function(state, index) {
        if (state)
            tmp.push(index);
    });

    // The count of questions to include
    var input = document.getElementById('count');
    var count = input.value;

    // Whether to include plain questions
    input = document.getElementById('includePlain');
    var includePlain = input.checked;
 
    // Whether to include squares and square roots
    input = document.getElementById('includeSquares');
    var includeSquares = input.checked;
    
    // Whether to include decimal fractions
    input = document.getElementById('includeDecimals');
    var includeDecimals = input.checked;

    // Whether to include vulgar fractions
    input = document.getElementById('includeVulgars');
    var includeVulgars = input.checked;

    // Only enable decimals in vulgars if vulgars are enabled
    input = document.getElementById('includeHarderInVulgars');
    if (includeVulgars) {
        input.disabled = false;
    } else {
        input.checked = false;
        input.enabled = false;
    }
    var includeHarderInVulgars = input.checked;

    // The columnCount
    input = document.getElementById('columnCount');
    var columnCount = input.value;

    storeConfiguration(tmp, count, includePlain, includeSquares, includeDecimals, includeVulgars, includeHarderInVulgars, columnCount);
 }

/** 
 * The user has selected/unselected a number to be included in the times tables.
 *
 * @param button The button pressed.
 */
function timesTablesSelectionChanged(button)
{
    // Examine the element id to get the corresponding number
    var re = /^include(\d+)$/;
    var matches = re.exec(button.id);
    if (matches === null)
        throw new Error("Unexpected element id for button: '" + button.id);
    var number = parseInt(matches[1], 10);

    // Select or unselect
    var newValue = !includeNumbers[number];
    includeNumbers[number] = newValue;
    if (newValue)
        button.className = 'selected';
    else
        button.className = '';

    configurationChanged();
}

/*
 * Whether to allow cookies has changed.
 *
 */
function cookiesSelectionChanged()
{
    var checkBox = document.getElementById('acceptCookies');

    // Enable the times tables selection buttons
    for (var i = 1; i <= 12; ++i)
    {
        var button = document.getElementById('include' + i);

        if (checkBox.checked)
        {
            // Enable the buttons to be selected
            button.disabled = false;
        }
        else
        {
            // Disable the buttons as they can't be selected
            button.disabled = true;
            button.className = '';
            includeNumbers[i] = false;
        }
    }

    // Enable the count input box
    var countInput = document.getElementById('count');
    var includePlainInput = document.getElementById('includePlain');
    var includeSquaresInput = document.getElementById('includeSquares');
    var includeDecimalsInput = document.getElementById('includeDecimals');
    var includeVulgarsInput = document.getElementById('includeVulgars');
    var includeHarderInVulgarsInput = document.getElementById('includeHarderInVulgars');
    var columnCountSelect = document.getElementById('columnCount');
    if (checkBox.checked)
    {
        // Enable the input to be updated
        countInput.disabled = false;
        includePlainInput.disabled = false;
        includeSquaresInput.disabled = false;
        includeDecimalsInput.disabled = false;
        includeVulgarsInput.disabled = false;
        includeHarderInVulgarsInput.disabled = false;
        columnCountSelect.disabled = false;
    }
    else
    {
        // Disable the input and clear it
        countInput.disabled = true;
        countInput.value = '40';
        includePlainInput.disabled = true;
        includePlainInput.checked = true;
        includeSquaresInput.disabled = true;
        includeSquaresInput.checked = false;
        includeDecimalsInput.disabled = true;
        includeDecimalsInput.checked = false;
        includeVulgarsInput.disabled = true;
        includeVulgarsInput.checked = false;
        includeHarderInVulgarsInput.disabled = true;
        includeHarderInVulgarsInput.checked = false;
        columnCountSelect.disabled = true;
        columnCountSelect.value = 4;
    }

    // If cookies are being disallowed then remove the cookies by setting it to already expired. Ensure 
    if (!checkBox.checked)
        deleteConfiguration();
}

// Which numbers are to be included in the times tables quiz. It's an array of Booleans, indicating whether the array index is to be included.
var includeNumbers = new Array(13);
includeNumbers.fill(false);

// Has the cookie been set?
var tmp = getConfiguration();
if (tmp !== null)
{
    // If there's a cookie then they must have accepted their use
    document.getElementById('acceptCookies').checked = true;
    
    // Update the include buttons
    var i;
    for (i = 0; i < tmp.selectedTables.length; ++i)
    {
        var includeIndex = tmp.selectedTables[i];
        includeNumbers[includeIndex] = true;
        document.getElementById('include' + includeIndex).className = 'selected';
    }

    // Update the count on the form
    document.getElementById('count').value = tmp.count;

    // Update whether to include plain questions
    document.getElementById('includePlain').checked = tmp.includePlain;

    // Update whether to include squares and square roots on the form
    document.getElementById('includeSquares').checked = tmp.includeSquares;

    // Update whether to include decimals fractions on the form
    document.getElementById('includeDecimals').checked = tmp.includeDecimals; 

    // Update whether to include vulgar fractions
    document.getElementById('includeVulgars').checked = tmp.includeVulgars;

    // Update whether to include decimals in vulgar fractions
    document.getElementById('includeHarderInVulgars').checked = tmp.includeHarderInVulgars;

    // Update the number of columns to use
    document.getElementById('columnCount').value = tmp.columnCount;

    // Enable all the buttons for selecting times tables
    cookiesSelectionChanged();
}

// Ensure cached information and form are in sync
cookiesSelectionChanged();


