import isFunction from '../../src/utils/type-detection';
import {
  restoreDefault,
  enablePrototypes,
} from '../../src/modifiers/prototypes';

const { prototype: fctPrototype } = Function;

const afterThrowingToStringValue = 'afterThrowing() { [native code] }';

function createSampleType(a, b, c) {
  return {
    valueOf() {
      return { a, b, c };
    },
    setABC(A, B, C) {
      a = A;
      b = B;
      c = C;
      throw new TypeError(
        'The argument types did not match, but were assigned anyhow.',
      );
    },
  };
}
afterAll(restoreDefault);
beforeEach(enablePrototypes);

describe('## Running the Test-Suite for the prototypal *afterThrowing* modifier implementations ...', () => {
  test('... one expects that `afterThrowing` exists as method of `Function.prototype`.', () => {
    expect(fctPrototype.afterThrowing).not.toBeNull();
    expect(fctPrototype.afterThrowing).not.toBeUndefined();

    expect(isFunction(fctPrototype.afterThrowing)).toBe(true);
  });
  test('... one expects that `afterThrowing` exists as method of a `Function` instance.', () => {
    // eslint-disable-next-line no-new-func
    expect(isFunction(new Function().afterThrowing)).toBe(true);

    /* eslint-disable func-names, no-empty-function */
    function fctStatement() {}
    const fctExpression = function () {};
    /* eslint-enable func-names, no-empty-function */

    expect(isFunction(fctStatement.afterThrowing)).toBe(true);
    expect(isFunction(fctExpression.afterThrowing)).toBe(true);
  });
  test(
    '... one expects that a `toString` operation executed at `afterThrowing` does' +
      ' return a custom string and not the stringified implementation itself.',
    () => {
      // eslint-disable-next-line prefer-template
      expect(fctPrototype.afterThrowing + '').toBe(afterThrowingToStringValue);

      expect(fctPrototype.afterThrowing.toString()).toBe(
        afterThrowingToStringValue,
      );
      expect(String(fctPrototype.afterThrowing)).toBe(
        afterThrowingToStringValue,
      );
    },
  );

  describe(
    '### Making use of the prototypal *afterThrowing*, one can modify the operated function type' +
      ' and as for this scenario, can, and only in case the before executed original function fails,' +
      ' access 1st the raised `exception` (the reason/cause of the invocation failure)' +
      ' and 2nd the arguments as a shallow-copied single `Array` type.',
    () => {
      const initialArgs = [9, 8, 7];
      const updatingArgs = [1, 2, 3];

      const sampleType = createSampleType(...initialArgs);
      const unmodifiedGetter = sampleType.valueOf;
      const unmodifiedSetter = sampleType.setABC;

      // *hooked-in* `afterThrowing` handler.
      function afterThrowingHandler(exception, ...args) {
        const target = this;

        // eslint-disable-next-line no-use-before-define
        Object.assign(handlerLog, {
          target,
          errorMessage: exception.message,
          errorType: exception.name,
          errorString: exception.toString(),
          args,
          isHandledAfterThrowing: true,
        });

        return exception;
      }
      const expectedHandlerLog = {
        target: sampleType,
        errorMessage:
          'The argument types did not match, but were assigned anyhow.',
        errorType: 'TypeError',
        errorString:
          'TypeError: The argument types did not match, but were assigned anyhow.',
        args: updatingArgs,
        isHandledAfterThrowing: true,
      };
      const initialHandlerLog = {
        target: null,
        errorMessage: '',
        errorType: '',
        errorString: '',
        args: null,
        isHandledAfterThrowing: false,
      };
      const handlerLog = { ...initialHandlerLog };

      test(
        'The method, before being modified by a prototypal `afterThrowing`, works as expected.' +
          ' The settings which prove this test are initialized as expected.',
        () => {
          // a `sampleType`'s `valueOf` does always reflect
          // the current state of its locally scoped variables.
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            initialArgs,
          );

          // references ... twice ... as expected.
          expect(expectedHandlerLog.target).toBe(sampleType);
          expect(expectedHandlerLog.args).toBe(updatingArgs);

          expect(handlerLog).toStrictEqual(initialHandlerLog);
        },
      );

      const finiteTotal = (a, b, c) => {
        const value = a + b + c;
        if (!Number.isFinite(value)) {
          throw new TypeError('+++ wrong argument types +++');
        }
        return value;
      };
      const handleTotalFailure = (exception, ...args) => ({
        exception,
        argumentArray: args,
      });

      describe(
        '#### Invoking the modified method and raising an exception' +
          ' triggers the `afterThrowingHandler` based exception handling.',
        () => {
          test(
            'Being invoked by the exception handling `afterThrowingHandler` can' +
              ' access 1st the raised `exception` (the reason/cause of the invocation failure)' +
              ' and 2nd the arguments as a shallow-copied single `Array` type.',
            () => {
              // modify `valueOf` via a prototypal `afterThrowing`.
              sampleType.valueOf = sampleType.valueOf.afterThrowing(
                afterThrowingHandler,
                sampleType,
              );

              // modify `setABC` via a prototypal `afterThrowing`.
              sampleType.setABC = sampleType.setABC.afterThrowing(
                afterThrowingHandler,
                sampleType,
              );

              // proof of both methods are being modified.
              expect(sampleType.valueOf).not.toBe(unmodifiedGetter);
              expect(sampleType.setABC).not.toBe(unmodifiedSetter);

              // proof of not having already run
              // into an `afterThrowing` failure handling.
              expect(Object.values(sampleType.valueOf())).toStrictEqual(
                initialArgs,
              );
              expect(handlerLog).toStrictEqual(initialHandlerLog);

              // provide new values for the `sampleType`'s local variables `a`, `b` and `c`.
              // - invoke the modified method
              // - and raise an error hereby.
              sampleType.setABC(...updatingArgs);

              // since all arguments were set despite the raised exception,
              // a `sampleType`'s `valueOf` will equally reflect the
              // most recent changes of its locally scoped variables.
              expect(Object.values(sampleType.valueOf())).toStrictEqual(
                updatingArgs,
              );

              // remained a reference ... as expected.
              expect(handlerLog.target).toBe(sampleType);

              // not anymore a reference ... which had to be proved ...
              expect(handlerLog.args).not.toBe(updatingArgs);
              // ... therefore countercheck with the set-up from before ...
              expect(expectedHandlerLog.args).toBe(updatingArgs);

              // strict equality finally proves the correct `afterThrowing` handling.
              expect(handlerLog).toStrictEqual(expectedHandlerLog);
            },
          );
          test(
            'Being invoked by the exception handling the `afterThrowingHandler`s' +
              ' return value becomes the the return value of the modified function.',
            () => {
              const args = [1, 2, '3'];
              const modifiedTotal = finiteTotal.afterThrowing(
                handleTotalFailure,
              );
              const result = modifiedTotal(...args);

              const { name, message } = result.exception;
              const { argumentArray } = result;

              expect(name).toBe('TypeError');
              expect(message).toBe('+++ wrong argument types +++');

              expect(Array.isArray(argumentArray)).toBe(true);

              // never a reference ...
              expect(argumentArray).not.toBe(args);
              // ... but always with structural equality.
              expect(argumentArray).toStrictEqual(args);
            },
          );
        },
      );
      test(
        'The return value of a modified function which does not fail at call time' +
          ' is the very return value of the unmodified (original) function.',
        () => {
          const modifiedTotal = finiteTotal.afterThrowing(handleTotalFailure);

          expect(modifiedTotal(1, 2, 3)).toBe(finiteTotal(1, 2, 3));
          expect(modifiedTotal(1, 2, 3)).toBe(6);
        },
      );

      test(
        'The `thisArgs` context of a modified method can/should be set at the' +
          " initial modifier/modification time as the `afterThrowing` method's second" +
          ' argument. Nevertheless invoking a modified method via `call`/`apply`' +
          " and passing a valid `thisArgs` does overrule a modified method's" +
          ' initially bound context at exactly this current `call`/`apply` time.',
        () => {
          function raiseException() {
            throw new Error('`thisArgs` test exception');
          }
          function afterContextHandler(/* exception, ...args */) {
            // eslint-disable-next-line no-use-before-define
            callTimeLogList.push(this);
          }
          const callTimeLogList = [];

          const initialContext = { context: 'initial' };
          const callTimeContext = { context: 'calltime' };

          const exposeModifiedContext = raiseException.afterThrowing(
            afterContextHandler,
            initialContext,
          );

          // initial
          expect(callTimeLogList.length).toBe(0);

          // calltime
          exposeModifiedContext.call(callTimeContext);
          expect(callTimeLogList.length).toBe(1);
          expect(callTimeLogList[0]).toBe(callTimeContext);

          // back to initial
          exposeModifiedContext();
          expect(callTimeLogList.length).toBe(2);
          expect(callTimeLogList[1]).toBe(initialContext);

          // misc positive initial tests
          // eslint-disable-next-line no-void
          exposeModifiedContext.call(void 0);
          expect(callTimeLogList.length).toBe(3);
          expect(callTimeLogList[2]).toBe(initialContext);

          exposeModifiedContext.call(null);
          expect(callTimeLogList.length).toBe(4);
          expect(callTimeLogList[3]).toBe(initialContext);

          // misc negated initial tests

          exposeModifiedContext.call(0);
          expect(callTimeLogList.length).toBe(5);
          expect(callTimeLogList[4]).not.toBe(initialContext);
          expect(callTimeLogList[4]).toBe(0);

          exposeModifiedContext.call('');
          expect(callTimeLogList.length).toBe(6);
          expect(callTimeLogList[5]).not.toBe(initialContext);
          expect(callTimeLogList[5]).toBe('');

          exposeModifiedContext.call(false);
          expect(callTimeLogList.length).toBe(7);
          expect(callTimeLogList[6]).not.toBe(initialContext);
          expect(callTimeLogList[6]).toBe(false);
        },
      );

      function sum(a, b, c) {
        return a + b + c;
      }
      function afterSumTest(result, ...args) {
        // return an own, manipulated, summed-up result which will not show any effect.

        result = sum(...args.map(value => value * 10));
        return result;
      }
      const invalidHandler = { invalid: 'handler' };

      test(
        'A modified function/method has a return value which is never' +
          ' different from the return value of the original function/method' +
          ' as long as both functions/methods get passed the same argument(s)' +
          " and as long as the original function's/method's return value is" +
          ' exclusively either a primitive or a nullish value.',
        () => {
          const modifiedType = sum.afterThrowing(afterSumTest, invalidHandler);

          // summing it up, ...
          expect(modifiedType(1, 2, 3)).toBe(sum(1, 2, 3));
          expect(modifiedType(1, 2, 3)).not.toBe(60);
          expect(modifiedType(1, 2, 3)).toBe(6);

          expect(modifiedType(9, 8, 7)).toBe(sum(9, 8, 7));
          expect(modifiedType(9, 8, 7)).not.toBe(240);
          expect(modifiedType(9, 8, 7)).toBe(24);
        },
      );

      describe(
        '#### Creating a modifier either can be successful or can fail,' +
          " but for the latter it follows some predefined/documented path's.",
        () => {
          test(
            '`afterThrowing`, in case of any failure, returns the context it was invoked at' +
              ' (which too, but not necessarily, is expected to be a `Function` type).',
            () => {
              const unmodifiedType = sum.afterThrowing(invalidHandler);

              expect(isFunction(unmodifiedType)).toBe(true);
              expect(unmodifiedType).toStrictEqual(sum);

              const unmodifiedOddity = sum.afterThrowing.call(
                invalidHandler,
                afterSumTest,
              );

              expect(isFunction(unmodifiedOddity)).toBe(false);
              expect(unmodifiedOddity).toStrictEqual(invalidHandler);
            },
          );
          test('`afterThrowing`, in case of success, returns a modified function/method.', () => {
            const modifiedType = sum.afterThrowing(
              afterSumTest,
              invalidHandler,
            );
            expect(modifiedType).not.toBe(invalidHandler);
            expect(modifiedType).not.toBe(sum);

            expect(isFunction(modifiedType)).toBe(true);
          });
        },
      );
    },
  );
});
