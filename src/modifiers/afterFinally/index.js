import isFunction from '../../utils/type-detection';

// provide *"prototype ready"* implementation.

/**
 * A prototypal implementation of any `Function` type's `afterFinally` modifier/behavior.
 *
 * Once available/enabled as `Function.prototype.afterFinally`, any `Function` type can be
 * directly invoked via e.g. `[target.]myFunctionOrMethod.afterFinally(handler[, target])`.
 *
 * @this {CallableFunction}
 *  The to be modified function.
 * @param {afterFinallyHandler} handler
 *  The callback/hook provided as `afterFinally` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/cast to either an applicable type or to the `null` value.
 *
 * @returns {(afterFinallyType|*)}
 *  Returns either the modified function/method or, in case of any failure, does
 *  return the context it was invoked at (which too is expected to be a `Function` type).
 */
export function afterFinally(handler, target) {
  target = target ?? null;

  const proceed = this;
  // prettier-ignore
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function afterFinallyType(...args) {
      // the target/context of the initial modifier/modification time
      // still can be overruled by a handler's apply/call time context.
      const context = (this ?? null) ?? target;

      let result;
      let error;
      try {
        // try the invocation of the original function.

        result = proceed.apply(context, args);

      } catch (exception) {

        error = exception;

      } // finally { ... }
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
      result = (error || result);

      handler.call(context, result, ...args);

      // always ensure a return value, ...
      // ... either the original method's/function's return value or an error type.
      return result;
    }
  ) || proceed;
}
afterFinally.toString = () => 'afterFinally() { [native code] }';

// provide static implementation as well.

/**
 * Kind of a static utility implementation of any `Function` type's `afterFinally` modifier/behavior.
 *
 * Two `Function` types need to be passed to `afterFinallyModifier` like ...
 * `afterFinallyModifier(proceed, handler[, target])`.
 *
 * @param proceed - The original/unmodified function/method.
 * @param {afterFinallyHandler} handler - The callback/hook provided as `afterFinally` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/cast to either an applicable type or to the `null` value.
 *
 * @returns {(afterFinallyType|*)}
 *  Returns either the modified function/method or, in case of any failure,
 *  does return whatever was passed as this function's 1st argument.
 */
export function afterFinallyModifier(proceed, handler, target) {
  return afterFinally.call(proceed, handler, target);
}
