import isFunction from '../../utils/type-detection';
import getSanitizedTarget from '../../utils/sanitizing';

// provide *"prototype ready"* implementation.

/**
 * A prototypal implementation of any `Function` type's `afterThrowing` modifier/behavior.
 *
 * Once available/enabled as `Function.prototype.afterThrowing`, any `Function` type can be
 * directly invoked via e.g. `[target.]myFunctionOrMethod.afterThrowing(handler[, target])`.
 *
 * @param {afterThrowingHandler} handler - The callback/hook provided as `afterThrowing` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {(afterThrowingType|*)}
 *  Returns either the modified function/method or, in case of any failure, does
 *  return the context it was invoked at (which too is expected to be a `Function` type).
 */
export function afterThrowing(handler, target) {
  target = getSanitizedTarget(target);

  const proceed = this;
  // prettier-ignore
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function afterThrowingType(...argumentArray) {
      // the target/context of the initial modifier/modification time
      // still can be overruled by a handler's apply/call time context.
      const context = getSanitizedTarget(this) ?? target;

      let result;
      try {
        // try the invocation of the original function.

        result = proceed.apply(context, argumentArray);

      } catch (exception) {
        /**
         *  This is a design choice in order to ensure the consistent handling
         *  of (intercepted) arguments in how any handler/callback gets passed
         *  such arguments regardless of the concrete modifier implementation.
         *
         *  Never `apply` the arguments, but always provide
         *  them within/as a single array of arguments.
         *
         *  nope ... --`handler.apply(context, [exception, ...argumentArray]);`--
         *  nope ... --`handler.call(context, exception, ...argumentArray);`--
         *
         *  yep ... **`handler.call(context, exception, argumentArray);`**
         */
        result = handler.call(context, exception, argumentArray);
      }

      // always ensure a return value, ...
      // ... either the original method's/function's return value or an error type.
      return result;
    }
  ) || proceed;
}
afterThrowing.toString = () => 'afterThrowing() { [native code] }';

// provide static implementation as well.

/**
 * Kind of a static utility implementation of any `Function` type's `afterThrowing` modifier/behavior.
 *
 * Two `Function` types need to be passed to `afterThrowingModifier` like ...
 * `afterThrowingModifier(proceed, handler[, target])`.
 *
 * @param proceed - The original/unmodified function/method.
 * @param {afterThrowingHandler} handler - The callback/hook provided as `afterThrowing` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {(afterThrowingType|*)}
 *  Returns either the modified function/method or, in case of any failure,
 *  does return whatever was passed as this function's 1st argument.
 */
export function afterThrowingModifier(proceed, handler, target) {
  return afterThrowing.call(proceed, handler, target);
}
