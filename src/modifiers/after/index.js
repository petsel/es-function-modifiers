import isFunction from '../../utils/type-detection';
import getSanitizedTarget from '../../utils/sanitizing';

// provide *"prototype ready"* implementation.

/**
 * A prototypal implementation of any `Function` type's `after` modifier/behavior.
 *
 * Note: `afterReturning` would be a valid alias for `after`.
 *
 * Once available/enabled as `Function.prototype.after`, any `Function` type can be
 * directly invoked via e.g. `[target.]myFunctionOrMethod.after(handler[, target])`.
 *
 * @param {afterReturningHandler} handler - The callback/hook provided as `after` (returning) handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {(afterReturningType|*)}
 *  Returns either the modified function/method or, in case of any failure, does
 *  return the context it was invoked at (which too is expected to be a `Function` type).
 */
export function after(handler, target) {
  target = getSanitizedTarget(target);

  const proceed = this;
  // prettier-ignore
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function afterReturningType(...argumentArray) {
      // the target/context of the initial modifier/modification time
      // still can be overruled by a handler's apply/call time context.
      const context = getSanitizedTarget(this) ?? target;
      /**
       *  This is a design choice in order to ensure the consistent handling
       *  of (intercepted) arguments in how any handler/callback gets passed
       *  such arguments regardless of the concrete modifier implementation.
       *
       *  Never `apply` the arguments, but always provide
       *  them within/as a single array of arguments.
       *
       *  nope ... --`handler.apply(context, [result, ...argumentArray]);`--
       *  nope ... --`handler.call(context, result, ...argumentArray);`--
       *
       *  yep ... **`handler.call(context, result, argumentArray);`**
       */
      const result = proceed.apply(context, argumentArray);

      // `apply` already did decouple the `argumentArray` reference passed/applied
      // to the original `proceed` function  from the one getting passed to `handler`.

      handler.call(context, result, argumentArray);

      // ensure the original method's/function's return value.
      return result;
    }
  ) || proceed;
}
after.toString = () => 'after() { [native code] }';

// provide static implementation as well.

/**
 * Kind of a static utility implementation of any `Function` type's `after` modifier/behavior.
 *
 * Two `Function` types need to be passed to `afterModifier` like ...
 * `afterModifier(proceed, handler[, target])`.
 *
 * Note: `afterReturningModifier` would be a valid alias for `afterModifier`.
 *
 * @param proceed - The original/unmodified function/method.
 * @param {afterReturningHandler} handler - The callback/hook provided as `after` (returning) handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {(afterReturningType|*)}
 *  Returns either the modified function/method or, in case of any failure,
 *  does return whatever was passed as this function's 1st argument.
 */
export function afterModifier(proceed, handler, target) {
  return after.call(proceed, handler, target);
}
