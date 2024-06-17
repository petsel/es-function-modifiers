/**
 * Any modified function type's `around` handler (or callback) which enables the
 * interception and generic manipulation of the original function's control flow.
 *
 * Every `around` handler gets passed at least 2 arguments, with proceed` being
 * the first one which is the original function and `handler` being the second
 * which is the `around` handler's own reference.
 *
 * All following parameters are the spread values/items of the invoked
 * modified function's arguments array. Therefore, any concrete handler
 * either has to know each parameter by its name/purpose or has to retrieve
 * all of them as array by rest syntax like via e.g. `...args`.
 *
 * @callback aroundHandler
 *  @param {Function} proceed
 *   The original/unmodified function/method.
 *  @param {aroundHandler} handler
 *   The `around` handler's own reference.
 *  @param {...*[]} args
 *   An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. The return value of any modified function
 * of this type depends on the implementation of its own (injected) `aroundHandler`.
 *
 * @callback aroundType
 *  @returns {*}
 *   Custom return value which depends on any `aroundHandler`'s specific implementation.
 */

/**
 * Any modified function type's `before` handler (or callback)
 * which will be invoked before the original function was called.
 *
 * Every `before` handler gets passed the arguments exactly as they were
 * passed to the modified function. Therefore, any concrete handler either
 * has to know each parameter by its name/purpose or has to retrieve all
 * of them as array by rest syntax like via e.g. `...args`.
 *
 * @callback beforeHandler
 *  @param {...*[]} args
 *   An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type returns
 * the original function's return value.
 *
 * @callback beforeType
 *  @returns {*}
 *   The original function's return value.
 */

/**
 * Any modified function type's `after` handler (or callback) which is going
 * to be invoked after the original function has been successfully called.
 *
 * Every `after` handler gets passed at least one argument, with `result`
 * being the first one, representing the return value of the before invoked
 * original function.
 *
 * All following parameters are the spread values/items of the invoked
 * modified function's arguments array. Therefore, any concrete handler
 * either has to know each parameter by its name/purpose or has to retrieve
 * all of them as array by rest syntax like via e.g. `...args`.
 *
 * @callback afterReturningHandler
 *  @param {*} result
 *   The return value of the before invoked original function.
 *  @param {...*[]} args
 *   An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type returns
 * the original function's return value.
 *
 * @callback afterReturningType
 *  @returns {*}
 *   The original function's return value.
 */

/**
 * Any modified function type's `afterThrowing` handler (or callback) which
 * will be invoked only in case of an original function's call failure.
 *
 * Every `afterThrowing` handler gets passed at least one argument, with
 * `exception` being the first one, representing the caught error type,
 * which got raised by having `try`-ed calling the original function.
 *
 * All following parameters are the spread values/items of the invoked
 * modified function's arguments array. Therefore, any concrete handler
 * either has to know each parameter by its name/purpose or has to retrieve
 * all of them as array by rest syntax like via e.g. `...args`.
 *
 * @callback afterThrowingHandler
 *  @param {Error} exception
 *   The caught error type, raised by having `try`-ed calling the original function.
 *  @param {...*[]} args
 *   An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type
 * returns either the original function's return value or, in case of the
 * former's call failure, a custom return value which depends on any
 * `afterThrowingHandler`'s specific implementation.
 *
 * @callback afterThrowingType
 *  @returns {*}
 *   Either the original function's return value or, in case of the
 *   former's call failure, a custom return value which depends on
 *   any `afterThrowingHandler`'s specific implementation.
 */

/**
 * Any modified function type's `afterFinally` handler (or callback) which
 * will be invoked after the original function was called, regardless of
 * either a successful or a failing invocation of the latter.
 *
 * Every `afterFinally` handler gets passed at least one argument, with
 * `result` being the first one, representing either the caught exception,
 * raised by having called the original function or the latter's return value.
 *
 * All following parameters are the spread values/items of the invoked
 * modified function's arguments array. Therefore, any concrete handler
 * either has to know each parameter by its name/purpose or has to retrieve
 * all of them as array by rest syntax like via e.g. `...args`.
 *
 * @callback afterFinallyHandler
 *  @param {(Error|*)} result
 *   Either the caught exception, raised by having called the original function,
 *   or the return value of the latter.
 *  @param {...*[]} args
 *   An `Array` type which holds any passed argument.
 */

/**
 * The modified function type itself. Every modified function of this type returns
 * either the caught exception, raised by having called the original function,
 * or the return value of the latter.
 *
 * @callback afterFinallyType
 *  @returns {(Error|*)}
 *   Either the caught exception, raised by having called the original function,
 *   or the return value of the latter.
 */
