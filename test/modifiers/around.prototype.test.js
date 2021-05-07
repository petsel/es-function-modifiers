import isFunction from '../../src/utils/type-detection';
import {
  restoreDefault,
  enablePrototypes,
} from '../../src/modifiers/prototypes';

const { prototype: fctPrototype } = Function;

const aroundToStringValue = 'around() { [native code] }';

function createSampleType(a, b, c) {
  return {
    valueOf() {
      return { a, b, c };
    },
    setABC(A, B, C) {
      a = A;
      b = B;
      c = C;
      return this.valueOf();
    },
  };
}
afterAll(restoreDefault);
beforeEach(enablePrototypes);

describe('## Running the Test-Suite for the prototypal *around* modifier implementations ...', () => {
  test('... one expects that `around` exists as method of `Function.prototype`.', () => {
    expect(fctPrototype.around).not.toBeNull();
    expect(fctPrototype.around).not.toBeUndefined();

    expect(isFunction(fctPrototype.around)).toBe(true);
  });
  test('... one expects that `around` exists as method of a `Function` instance.', () => {
    // eslint-disable-next-line no-new-func
    expect(isFunction(new Function().around)).toBe(true);

    /* eslint-disable func-names, no-empty-function */
    function fctStatement() {}
    const fctExpression = function () {};
    /* eslint-enable func-names, no-empty-function */

    expect(isFunction(fctStatement.around)).toBe(true);
    expect(isFunction(fctExpression.around)).toBe(true);
  });
  test(
    '... one expects that a `toString` operation executed at `around` does' +
      ' return a custom string and not the stringified implementation itself.',
    () => {
      // eslint-disable-next-line prefer-template
      expect(fctPrototype.around + '').toBe(aroundToStringValue);

      expect(fctPrototype.around.toString()).toBe(aroundToStringValue);
      expect(String(fctPrototype.around)).toBe(aroundToStringValue);
    },
  );

  describe(
    '### Making use of the prototypal *around*, one can modify the operated function type and,' +
      " as for this scenario, can intercept this original function's control flow entirely.",
    () => {
      const initialArgsList = [9, 8, 7];
      const interceptorArgsList = [1, 2, 3];

      const sampleType = createSampleType(...initialArgsList);
      const unmodifiedSetter = sampleType.setABC;

      // interceptor / intercepting `around` handler.
      function aroundHandler(proceed, handler, argsList) {
        const target = this;
        // eslint-disable-next-line no-use-before-define
        Object.assign(interceptorLog, {
          target,
          proceed,
          handler,
          argsList,
        });
        proceed.apply(target, interceptorArgsList);
      }
      const expectedInterceptorLog = {
        target: sampleType,
        proceed: unmodifiedSetter,
        handler: aroundHandler,
        argsList: interceptorArgsList,
      };
      const nullifiedInterceptorLog = {
        target: null,
        proceed: null,
        handler: null,
        argsList: null,
      };
      const interceptorLog = { ...nullifiedInterceptorLog };

      test(
        'The method, before being modified by a prototypal `around`, works as expected.' +
          ' The settings which prove this test are initialized as expected.',
        () => {
          // a `sampleType`'s `valueOf` does always reflect
          // the current state of its locally scoped variables.
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            initialArgsList,
          );

          expect(expectedInterceptorLog.target).toBe(sampleType);
          expect(expectedInterceptorLog.proceed).toBe(sampleType.setABC);
          expect(expectedInterceptorLog.proceed).toBe(unmodifiedSetter);
          expect(expectedInterceptorLog.handler).toBe(aroundHandler);
          expect(expectedInterceptorLog.argsList).toStrictEqual(
            interceptorArgsList,
          );

          expect(interceptorLog).toStrictEqual(nullifiedInterceptorLog);
        },
      );
      test(
        'Invoking the modified method allows the `aroundHandler`' +
          " to intercept this modified method's control flow in the expected way.\n\n" +
          ' Every `around` handler gets passed 3 arguments, 1st `proceed` which is the' +
          " original function, 2nd `handler` which is the `around` handler's own reference." +
          ' And 3rd `argumentArray`, an `Array` type which holds any passed argument.',
        () => {
          // modify `setABC` via a prototypal `around`.
          sampleType.setABC = sampleType.setABC.around(
            aroundHandler,
            sampleType,
          );

          expect(sampleType.setABC).not.toBe(unmodifiedSetter);
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            initialArgsList,
          );

          // invoke the modified method,
          // provide new values for the `sampleType`'s local variables `a`, `b` and `c`.
          sampleType.setABC(...interceptorArgsList);

          // a `sampleType`'s `valueOf` will equally reflect the
          // most recent changes of its locally scoped variables.
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            interceptorArgsList,
          );

          expect(interceptorLog).toStrictEqual(expectedInterceptorLog);
        },
      );

      test(
        'The `thisArgs` context of a modified method can/should be set at the' +
          " initial modifier/modification time as the `around` method's second" +
          ' argument. Nevertheless invoking a modified method via `call`/`apply`' +
          " and passing a valid `thisArgs` does overrule a modified method's" +
          ' initially bound context at exactly this current `call`/`apply` time.',
        () => {
          function exposeContext() {
            return this;
          }
          function aroundContextHandler(
            proceed /* , handler, argumentArray */,
          ) {
            return proceed.call(this);
          }
          const initialContext = { context: 'initial' };
          const callTimeContext = { context: 'calltime' };

          const exposeModifiedContext = exposeContext.around(
            aroundContextHandler,
            initialContext,
          );

          // initial
          expect(exposeModifiedContext()).toBe(initialContext);
          // calltime
          expect(exposeModifiedContext.call(callTimeContext)).toBe(
            callTimeContext,
          );

          // back to initial
          expect(exposeModifiedContext()).toBe(initialContext);

          // misc positive initial tests
          // eslint-disable-next-line no-void
          expect(exposeModifiedContext.call(void 0)).toBe(initialContext);
          expect(exposeModifiedContext.call(null)).toBe(initialContext);

          // misc negated initial tests
          expect(exposeModifiedContext.call(0)).not.toBe(initialContext);
          expect(exposeModifiedContext.call(0)).toBe(0);

          expect(exposeModifiedContext.call('')).not.toBe(initialContext);
          expect(exposeModifiedContext.call('')).toBe('');

          expect(exposeModifiedContext.call(false)).not.toBe(initialContext);
          expect(exposeModifiedContext.call(false)).toBe(false);
        },
      );

      function sum(a, b, c) {
        return a + b + c;
      }
      function aroundSumTest(proceed, handler, argumentArray) {
        const checkProceed = () => proceed === sum;
        const checkHandler = () => handler === aroundSumTest;
        const checkArgument = () =>
          Array.isArray(argumentArray) &&
          argumentArray.length >= 1 &&
          argumentArray.every(value => Number.isFinite(value));

        const isValidArguments = [
          checkProceed,
          checkHandler,
          checkArgument,
        ].every(fct => fct());

        return isValidArguments
          ? proceed(...argumentArray)
          : proceed(9, 10, 11);
      }
      const invalidHandler = { invalid: 'handler' };

      test('A modified function/method has a custom return value which depends on any `aroundHandler`s specific implementation.', () => {
        const modifiedType = sum.around(aroundSumTest, invalidHandler);

        // summing it up, ...
        // ... but with intercepted and checked arguments ...
        // ... and a custom return value which depends on any `aroundHandler`s specific implementation.

        // ... just passing it through ... and returning the expected summed-up result.
        expect(modifiedType(1, 2, 3)).toBe(6);
        expect(modifiedType(11, 12, 13)).toBe(36);

        // ... intercepted with invalid arguments ... and a manipulated and fixated return value.
        expect(modifiedType()).toBe(30);
        expect(modifiedType('1', 2, 3)).toBe(30);
      });

      describe(
        '#### Creating a modifier either can be successful or can fail,' +
          " but for the latter it follows some predefined/documented path's.",
        () => {
          test(
            '`around`, in case of any failure, returns the context it was invoked at' +
              ' (which too, but not necessarily, is expected to be a `Function` type).',
            () => {
              const unmodifiedType = sum.around(invalidHandler);

              expect(isFunction(unmodifiedType)).toBe(true);
              expect(unmodifiedType).toStrictEqual(sum);

              const unmodifiedOddity = sum.around.call(
                invalidHandler,
                aroundSumTest,
              );

              expect(isFunction(unmodifiedOddity)).toBe(false);
              expect(unmodifiedOddity).toStrictEqual(invalidHandler);
            },
          );
          test('`around`, in case of success, returns a modified function/method.', () => {
            const modifiedType = sum.around(aroundSumTest, invalidHandler);

            expect(modifiedType).not.toBe(invalidHandler);
            expect(modifiedType).not.toBe(sum);

            expect(isFunction(modifiedType)).toBe(true);
          });
        },
      );
    },
  );
});
