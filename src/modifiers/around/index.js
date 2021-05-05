import isFunction from '../../utils/type-detection';
import getSanitizedTarget from '../../utils/sanitizing';

// provide "prototype ready" implementation.

/**
 * A prototypal implementation of any `Function` type's `around` modifier/behavior.
 *
 * Once available/enabled as `Function.prototype.around`, any `Function` type can be
 * directly invoked via e.g. `[target.]myFunctionOrMethod.around(handler[, target])`.
 *
 * @param {aroundHandler} handler - The *intercepting* `around` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  Will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {Function}
 *  Returns either the modified function/method or, in case of any failure, does return
 *  the context it was invoked at (which too is expected to be a `Function` type).
 */
export function around(handler, target) {
  target = getSanitizedTarget(target);

  const proceed = this;
  // prettier-ignore
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function aroundHandler(...argumentArray) {
      return handler.call(
        target || getSanitizedTarget(this),
        proceed,
        handler,
        argumentArray,
      );
    }
  ) || proceed;
}
around.toString = () => 'around() { [native code] }';

// provide static implementation as well.

/**
 * Kind of a static utility implementation of any `Function` type's `around` modifier/behavior.
 *
 * Two `Function` types need to be passed to `aroundModifier` like ...
 * `aroundModifier(proceed, handler[, target])`.
 *
 * @param proceed - The original/unmodified function/method.
 * @param {aroundHandler} handler - The *intercepting* `around` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  Will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {Function|*}
 *  Returns either the modified function/method or, in case of any failure,
 *  does return whatever was passed as this function's 1st argument.
 */
export function aroundModifier(proceed, handler, target) {
  return around.call(proceed, handler, target);
}
aroundModifier.toString = () => 'aroundModifier() { [native code] }';
