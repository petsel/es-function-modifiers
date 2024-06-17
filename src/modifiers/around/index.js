import isFunction from '../../utils/type-detection';

// provide *"prototype ready"* implementation.

/**
 * A prototypal implementation of any `Function` type's `around` modifier/behavior.
 *
 * Once available/enabled as `Function.prototype.around`, any `Function` type can be
 * directly invoked via e.g. `[target.]myFunctionOrMethod.around(handler[, target])`.
 *
 * @param {aroundHandler} handler - The *intercepting* callback provided as `around` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/cast to either an applicable type or to the `null` value.
 *
 * @returns {(aroundType|*)}
 *  Returns either the modified function/method or, in case of any failure, does
 *  return the context it was invoked at (which too is expected to be a `Function` type).
 */
export function around(handler, target) {
  target = target ?? null;

  const proceed = this;
  // prettier-ignore
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function aroundType(...args) {
      // the target/context of the initial modifier/modification time
      // still can be overruled by a handler's apply/call time context.
      const context = (this ?? null) ?? target;

      /**
       *  This is a design choice in order to ensure the consistent handling
       *  of (intercepted) arguments in how any handler/callback gets passed
       *  such arguments regardless of the concrete modifier implementation.
       *
       *  Never provide arguments within/as a single array, but always
       *  pass arguments in the most spread way to the handler function.
       *
       *  yep ... **`handler.apply(context, [proceed, handler, ...args]);`**
       *  yep ... **`handler.call(context, proceed, handler, ...args);`**
       *
       *  nope ... --`handler.call(context, proceed, handler, args);`--
       */
      return handler.call(context, proceed, handler, ...args);
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
 * @param {aroundHandler} handler - The *intercepting* callback provided as `around` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/cast to either an applicable type or to the `null` value.
 *
 * @returns {(aroundType|*)}
 *  Returns either the modified function/method or, in case of any failure,
 *  does return whatever was passed as this function's 1st argument.
 */
export function aroundModifier(proceed, handler, target) {
  return around.call(proceed, handler, target);
}
