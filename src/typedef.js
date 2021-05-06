/**
 * Any modified function type's `around` handler (or callback) which enables the
 * interception and generic manipulation of the original function's control flow.
 *
 * Every `around` handler gets passed 3 arguments, 1st `proceed` which is the
 * original function, 2nd `handler` which is the `around` handler's own reference.
 * And 3rd `argumentArray`, an `Array` type which holds any passed argument.
 *
 * @callback aroundHandler
 *  @param {Function} proceed - The original/unmodified function/method.
 *  @param {Function} handler - The `around` handler's own reference.
 *  @param {Array} argumentArray - An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. The return value of any modified function
 * of this type depends on the implementation of its own (injected) `aroundHandler`.
 *
 * Thus only a prototypal `around` or `aroundModifier` enable the interception and
 * generic manipulation of the original function's control flow.
 *
 * @callback aroundType
 *  @returns {*}
 *   Custom return value which depends on any `aroundHandler`'s specific implementation.
 */

/**
 * Any modified function type's `before` handler (or callback)
 * which will be invoked before the original function was called.
 *
 * Every `before` handler gets passed exactly one argument.
 * The `argumentArray`, an `Array` type which holds any passed argument.
 *
 * @callback beforeHandler
 *  @param {Array} argumentArray - An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type returns
 * the original function's return value.
 *
 * @callback beforeType
 *  @returns {*} - The original function's return value.
 */

/**
 * Any modified function type's `after` handler (or callback)
 * which will be invoked after the original function was called.
 *
 * Every `after` handler gets passed 2 arguments. 1st `result` which is the
 * return value of the before invoked original function.
 * And 2nd `argumentArray`, an `Array` type which holds any passed argument.
 *
 * @callback afterReturningHandler
 *  @param {*} result - The return value of the before invoked original function.
 *  @param {Array} argumentArray - An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type returns
 * the original function's return value.
 *
 * @callback afterReturningType
 *  @returns {*} - The original function's return value.
 */

/**
 * Any modified function type's `afterThrowing` handler (or callback) which will
 * be invoked only in case of a original function's call failure.
 *
 * Every `afterThrowing` handler gets passed 2 arguments. 1st `exception` which is
 * the catched error type, raised by having `try`-ed calling the original function.
 * And 2nd `argumentArray`, an `Array` type which holds any passed argument.
 *
 * @callback afterThrowingHandler
 *  @param {Error} exception
 *   The catched error type, raised by having `try`-ed calling the original function.
 *  @param {Array} argumentArray
 *   An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type returns
 * either the original function's return value or, in case of the former's call failure,
 * a custom return value which depends on any `afterThrowingHandler`'s specific implementation.
 *
 * @callback afterThrowingType
 *  @returns {*}
 *   Either the original function's return value or, in case of the former's call failure,
 *   a custom return value which depends on any `afterThrowingHandler`'s specific implementation.
 */

/**
 * Any modified function type's `afterFinally` handler (or callback) which
 * will be invoked after the original function was called, regardless of
 * either a successful or a failing invocation of the latter.
 *
 * Every `afterFinally` handler gets passed 2 arguments. 1st `result` which is
 * either the catched exception, raised by having called the original function
 * or the return value of the latter.
 * And 2nd `argumentArray`, an `Array` type which holds any passed argument.
 *
 * @callback afterFinallyHandler
 *  @param {(Error|*)} result
 *   Either the catched exception, raised by having called the original function
 *   or the return value of the latter.
 *  @param {Array} argumentArray
 *   An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type returns
 * either the catched exception, raised by having called the original function
 * or the return value of the latter.
 *
 * @callback afterFinallyType
 *  @returns {(Error|*)}
 *   Either the catched exception, raised by having called the original function
 *   or the return value of the latter.
 */
