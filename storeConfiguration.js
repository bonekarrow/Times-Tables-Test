/*
 * This file contains functions for storing and retrieving the selected times tables from a cookie.
 *
 * $Revision: 98 $; $Date: 2017-06-04 22:22:16 +0100 (Sun, 04 Jun 2017) $
 *
 */

"use strict";

/**
 * Store the configuration in the cookie.
 *
 * @param numbers                An array of numbers defining the times tables to use in the quiz.
 * @param count                  The number of questions to include.
 * @param includePlain           Whether to include plain questions.
 * @param includeSquares         Whether to include squares and square roots.
 * @param includeDecimals        Whether to include decimal fractions.
 * @param includeVulgars         Whether to include vulgar fractions.
 * @param includeHarderInVulgars Whether to include harder questions in vulgar fractions.
 * @param columnCount            The number of columns to use when displaying.
 *
 */
function storeConfiguration(numbers, count, includePlain, includeSquares, includeDecimals, includeVulgars, includeHarderInVulgars, columnCount)
{
    // Get the expiry date for the cookie
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 31);

    document.cookie = 'selectedTables={' + numbers.join(',') + '}; expires=' + expiryDate.toUTCString();
    document.cookie = 'count=' + count + '; expires=' + expiryDate.toUTCString();
    document.cookie = 'includePlain=' + includePlain + '; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeSquares=' + includeSquares + '; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeDecimals=' + includeDecimals + '; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeVulgars=' + includeVulgars + '; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeHarderInVulgars=' + includeHarderInVulgars + '; expires=' + expiryDate.toUTCString();
    document.cookie = 'columnCount=' + columnCount + '; expires=' + expiryDate.toUTCString();
}

/**
 * Get a Boolean setting from the cookie.
 *
 * @param cookieValue  The value of the cookie.
 * @param re           Regular expression used to search for setting.
 * @param defaultValue The value to use if the cookie is missing.
 * @return             The value for the setting.
 */
function getBooleanFromCookie(cookieValue, re, defaultValue)
{
    var setting = defaultValue;
    var matches = re.exec(cookieValue);
    if (matches != null)
    {
        // Extract whether to include plain
        if (matches[1].toLowerCase() == 'true')
            setting = true;
        else
            setting = false;
    }
    return setting;
}

/**
 * Get the configuration from the cookie. 
 *
 * @return An object containing the selected tables, count of questions and whether to include squares. 
 *         Null if there is no configuration.
 *
 */
function getConfiguration()
{
    // Does the cookie exist?
    var cookieValue = document.cookie;
    if (cookieValue == '')
        return null;

    // Test we can find the 'selectedTables' part of the cookie
    var re = /selectedTables\s*=\s*\{((?:\d+,)*\d+)\}/i;
    var matches = re.exec(cookieValue);
    if (matches == null)
    {
        // The string wasn't in the format we were expecting
        return null;
    }

    // Extract the numbers from the 'selectedTables' property
    var numbersStr = matches[1];

    // Convert the numbers string into an array
    var numbers = new Array();
    var pos = 0;
    do
    {
        pos = numbersStr.search(',');
        if (pos < 0)
        {
            pos = undefined;
        }

        // Get the next number
        var tmp = numbersStr.slice(0, pos);
        numbers.push(parseInt(tmp, 10));

        // Skip this number if it's not the last one
        if (pos >= 0)
        {
            numbersStr = numbersStr.slice(pos + 1);
        }
    } while (pos >= 0);

    // Test we can find the 'count' part of the cookie
    var count = 40;
    re = /count\s*=\s*(\d+)/i;
    matches = re.exec(cookieValue);
    if (matches != null)
    {
        // Extract the count
        count = parseInt(matches[1], 10);
    }

    // May or may not have whether to include plain questions. If unspecified then we will include for backwards compatibility.
    var includePlain = getBooleanFromCookie(cookieValue, /includePlain=(false|true)/i, true);
    
    // All other default to false if not specified
    var includeSquares = getBooleanFromCookie(cookieValue, /includeSquares=(false|true)/i, false);
    var includeDecimals = getBooleanFromCookie(cookieValue, /includeDecimals=(false|true)/i, false);
    var includeVulgars = getBooleanFromCookie(cookieValue, /includeVulgars=(false|true)/i, false);
    var includeHarderInVulgars = false;
    if (includeVulgars)
        includeHarderInVulgars = getBooleanFromCookie(cookieValue, /includeHarderInVulgars=(false|true)/i, false);

    // If they haven't chosen anything then we can't do the quiz
    if (!(includePlain || includeSquares || includeDecimals || includeVulgars))
        return null;

    // Test we can find the 'columnCount' part of the cookie
    var columnCount = 4;
    re = /columnCount\s*=\s*(\d+)/i;
    matches = re.exec(cookieValue);
    if (matches != null)
    {
        // Extract the count
        columnCount = parseInt(matches[1], 10);
    }

    // Store selected tables, count and whether to include squares
    var configuration = Object.freeze({
        selectedTables : numbers,
        count : count,
        includePlain : includePlain,
        includeSquares : includeSquares,
        includeDecimals : includeDecimals,
        includeVulgars : includeVulgars,
        includeHarderInVulgars : includeHarderInVulgars,
        columnCount : columnCount
    });
    return configuration;
}

/*
 * Delete the cookies for the times table quiz.
 *
 */
function deleteConfiguration()
{
    // Get the expiry date for the cookie
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - 1);

    document.cookie = 'selectedTables={}; expires=' + expiryDate.toUTCString();
    document.cookie = 'count=; expires=' + expiryDate.toUTCString();
    document.cookie = 'includePlain=; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeSquares=; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeDecimals=; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeVulgars=; expires=' + expiryDate.toUTCString();
    document.cookie = 'includeHarderInVulgars=; expires=' + expiryDate.toUTCString();
    document.cookie = 'columnCount=; expires=' + expiryDate.toUTCString();
}

