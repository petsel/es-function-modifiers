import isFunction from '../../utils/type-detection';

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
 *  It will be sanitized/cast to either an applicable type or to the `null` value.
 *
 * @returns {(afterReturningType|*)}
 *  Returns either the modified function/method or, in case of any failure, does
 *  return the context it was invoked at (which too is expected to be a `Function` type).
 */
export function after(handler, target) {
  target = target ?? null;

  const proceed = this;
  // prettier-ignore
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function afterReturningType(...args) {
      // the target/context of the initial modifier/modification time
      // still can be overruled by a handler's apply/call time context.
      const context = (this ?? null) ?? target;

      const result = proceed.apply(context, args);
      /**
       *  This is a design choice in order to ensure the consistent handling
       *  of (intercepted) arguments in how any handler/callback gets passed
       *  such arguments regardless of the concrete modifier implementation.
       *
       *  Never provide arguments within/as a single array, but always
       *  pass arguments in the most spread way to the handler function.
       *
       *  yep ... **`handler.apply(context, [result, ...args]);`**
       *  yep ... **`handler.call(context, result, ...args);`**
       *
       *  nope ... --`handler.call(context, result, args);`--
       */
      handler.call(context, result, ...args);

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
 *  It will be sanitized/cast to either an applicable type or to the `null` value.
 *
 * @returns {(afterReturningType|*)}
 *  Returns either the modified function/method or, in case of any failure,
 *  does return whatever was passed as this function's 1st argument.
 */
export function afterModifier(proceed, handler, target) {
  return after.call(proceed, handler, target);
}
