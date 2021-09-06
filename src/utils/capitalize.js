/**
 * Function that return a text with first letter capitalized after a string checking
 * @function
 * @see capitalize
 * @param {string} content - string content that must be capitalized
 * @returns {string} 
 * @example
 * import {capitalize} from "Utils/capitalize";
 * const upper = capitalize('title'); // -> upper === 'Title'
 */
export function capitalize(content) {
    if (typeof content !== 'string') return ''
    return content.charAt(0).toUpperCase() + content.slice(1)
}