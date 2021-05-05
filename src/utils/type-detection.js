/**
 * A function which checks whether its passed single argument
 * is considered to be a `Function` type.
 *
 * @param  {*} value - The type/value which will be checked.
 *
 * @returns {boolean}
 *  Returns whether the passed single argument is a `Function` type.
 */
function isFunction(value) {
  return (
    typeof value === 'function' &&
    typeof value.call === 'function' &&
    typeof value.apply === 'function'
  );
}
export default isFunction;
