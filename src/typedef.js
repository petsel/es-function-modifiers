/**
 * Any modified function's `around` handler (or callback) which enables
 * the interception of such a modified function's control flow.
 *
 * Every `around` callback gets passed 3 arguments, `proceed` which is the
 * original/unmodified function, `handler` which is the very callback's own
 * reference and `argumentArray`, an `Array` type which holds any passed argument.
 *
 * @callback aroundHandler
 *  @param {Function} proceed - The original/unmodified function/method.
 *  @param {Function} handler - The callback's own reference.
 *  @param {Array} argumentArray - An `Array` type which holds any passed argument.
 */

/**
 * Any modified function's `before` handler (or callback) which enables to hook
 * into such a modified function's control flow before the original function
 * is going to be invoked.
 *
 * Every `before` callback gets passed exactly one argument, the `argumentArray`,
 * an `Array` type which holds any passed argument.
 *
 * @callback beforeHandler
 *  @param {Array} argumentArray - An `Array` type which holds any passed argument.
 */
