/**
 * Function that create a debouncer : it will only fire once every T of a time instead of as quickly as it's triggered; an incredible performance boost in some cases.
 * @function
 * @see debounce
 * @param {callback} func - Function that must be debounced
 * @param {number} waiting - time to wait
 * @param {boolean} [imediate = 'false'] - run at first
 * @returns {function} - Function
 * @example
 * import {debounce} from "Utils/debounce";
 * window.addEventListener('scroll', debounce(()=>{console.log('bla')}, 2000, false));
 */

export function debounce (func, waiting, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, waiting);
        if (callNow) func.apply(context, args);
    };
};