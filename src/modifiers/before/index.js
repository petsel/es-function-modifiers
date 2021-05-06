import isFunction from '../../utils/type-detection';
import getSanitizedTarget from '../../utils/sanitizing';

// provide *"prototype ready"* implementation.

/**
 * A prototypal implementation of any `Function` type's `before` modifier/behavior.
 *
 * Once available/enabled as `Function.prototype.before`, any `Function` type can be
 * directly invoked via e.g. `[target.]myFunctionOrMethod.before(handler[, target])`.
 *
 * @param {beforeHandler} handler - The callback/hook provided as `before` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {(beforeType|*)}
 *  Returns either the modified function/method or, in case of any failure, does
 *  return the context it was invoked at (which too is expected to be a `Function` type).
 */
export function before(handler, target) {
  target = getSanitizedTarget(target);

  const proceed = this;
  // prettier-ignore
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function beforeType(...argumentArray) {
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
       *  nope ... --`handler.apply(context, argumentArray);`--
       *  yep ... **`handler.call(context, argumentArray);`**
       */
      handler.call(context, argumentArray);

      // ensure the original method's/function's arguments signature and  return value.
      return proceed.apply(context, argumentArray);
    }
  ) || proceed;
}
before.toString = () => 'before() { [native code] }';

// provide static implementation as well.

/**
 * Kind of a static utility implementation of any `Function` type's `before` modifier/behavior.
 *
 * Two `Function` types need to be passed to `beforeModifier` like ...
 * `beforeModifier(proceed, handler[, target])`.
 *
 * @param proceed - The original/unmodified function/method.
 * @param {beforeHandler} handler - The callback/hook provided as `before` handler.
 * @param {*=} target
 *  The optional `target` which should be applicable as a method's *context*.
 *  It will be sanitized/casted to either an applicable type or to the `null` value.
 *
 * @returns {(beforeType|*)}
 *  Returns either the modified function/method or, in case of any failure,
 *  does return whatever was passed as this function's 1st argument.
 */
export function beforeModifier(proceed, handler, target) {
  return before.call(proceed, handler, target);
}
