/**
 * Any modified function's `around` handler (or callback) which enables
 * the interception of such a modified function's control flow.
 *
 * Every `around` callback gets passed 3 arguments, `proceed` which is the
 * original/unmodified function, `handler` which is the very callback's own
 * reference and `argumentsList`, an `Array` type which holds all the passed arguments.
 *
 * @callback aroundHandler
 *  @param {Function} proceed - The original/unmodified function/method.
 *  @param {Function} handler - The callback's own reference.
 *  @param {Array} argumentsList - An `Array` type which holds all the passed arguments.
 */