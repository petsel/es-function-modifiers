import isFunction from '../../src/utils/type-detection';
import {
  restoreDefault,
  enablePrototypes,
} from '../../src/modifiers/prototypes';

const { prototype: fctPrototype } = Function;

const afterFinallyToStringValue = 'afterFinally() { [native code] }';

function createSampleType(a, b, c) {
  return {
    valueOf() {
      return { a, b, c };
    },
    setABC(A, B, C) {
      a = A ?? 'no argument provided';
      b = B ?? 'no argument provided';
      c = C ?? 'no argument provided';

      if (arguments.length < 3) {
        throw new ReferenceError(
          'The arguments signature did not match, but arguments were assigned anyhow.',
        );
      }
      return this.valueOf();
    },
  };
}
afterAll(restoreDefault);
beforeEach(enablePrototypes);

describe('## Running the Test-Suite for the prototypal *afterFinally* modifier implementations ...', () => {
  test('... one expects that `afterFinally` exists as method of `Function.prototype`.', () => {
    expect(fctPrototype.afterFinally).not.toBeNull();
    expect(fctPrototype.afterFinally).not.toBeUndefined();

    expect(isFunction(fctPrototype.afterFinally)).toBe(true);
  });
  test('... one expects that `afterFinally` exists as method of a `Function` instance.', () => {
    // eslint-disable-next-line no-new-func
    expect(isFunction(new Function().afterFinally)).toBe(true);

    /* eslint-disable func-names, no-empty-function */
    function fctStatement() {}
    const fctExpression = function () {};
    /* eslint-enable func-names, no-empty-function */

    expect(isFunction(fctStatement.afterFinally)).toBe(true);
    expect(isFunction(fctExpression.afterFinally)).toBe(true);
  });
  test(
    '... one expects that a `toString` operation executed at `afterFinally` does' +
      ' return a custom string and not the stringified implementation itself.',
    () => {
      // eslint-disable-next-line prefer-template
      expect(fctPrototype.afterFinally + '').toBe(afterFinallyToStringValue);

      expect(fctPrototype.afterFinally.toString()).toBe(
        afterFinallyToStringValue,
      );
      expect(String(fctPrototype.afterFinally)).toBe(afterFinallyToStringValue);
    },
  );

  describe(
    '### Making use of the prototypal `afterFinally`, one can modify the operated function type' +
      " and as for just this scenario, can access as 1st argument either the original function's" +
      ' *return value* (result) or the *raised exception* in case the before executed original function failed.' +
      " The original function's arguments get passed 2nd as a shallow-copied single `Array` type.",
    () => {
      const initialArgs = [9, 8, 7];

      const successfullyUpdatingArgs = [1, 2, 3];
      const failingUpdatingArgs = [1, 2];

      const sampleType = createSampleType(...initialArgs);
      const unmodifiedSetter = sampleType.setABC;

      // *hooked-in* `afterFinally` handler.
      function afterFinallyHandler(resultOrException, ...args) {
        const target = this;

        // eslint-disable-next-line no-use-before-define
        Object.assign(handlerLog, {
          target,
          args,
        });

        if (resultOrException instanceof Error) {
          // eslint-disable-next-line no-use-before-define
          Object.assign(handlerLog, {
            errorMessage: resultOrException.message,
            errorType: resultOrException.name,
            errorString: resultOrException.toString(),

            isHandledAfterThrowing: true,
          });
        } else {
          // eslint-disable-next-line no-use-before-define
          handlerLog.isHandledAfterReturning = true;
        }
      }
      const expectedSuccessHandlerLog = {
        target: sampleType,
        errorMessage: '',
        errorType: '',
        errorString: '',
        args: successfullyUpdatingArgs,
        isHandledAfterReturning: true,
        isHandledAfterThrowing: false,
      };
      const expectedExceptionHandlerLog = {
        target: sampleType,
        errorMessage:
          'The arguments signature did not match, but arguments were assigned anyhow.',
        errorType: 'ReferenceError',
        errorString:
          'ReferenceError: The arguments signature did not match, but arguments were assigned anyhow.',
        args: failingUpdatingArgs,
        isHandledAfterReturning: false,
        isHandledAfterThrowing: true,
      };
      const initialHandlerLog = {
        target: null,
        errorMessage: '',
        errorType: '',
        errorString: '',
        args: null,
        isHandledAfterReturning: false,
        isHandledAfterThrowing: false,
      };
      const handlerLog = { ...initialHandlerLog };

      test(
        'The method, before being modified by a prototypal `afterFinally`, works as expected.' +
          ' The settings which prove this test are initialized as expected.',
        () => {
          // a `sampleType`'s `valueOf` does always reflect
          // the current state of its locally scoped variables.
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            initialArgs,
          );

          // references ... twice ... as expected.
          expect(expectedSuccessHandlerLog.target).toBe(sampleType);
          expect(expectedSuccessHandlerLog.args).toBe(successfullyUpdatingArgs);
          // references ... twice ... as expected.
          expect(expectedExceptionHandlerLog.target).toBe(sampleType);
          expect(expectedExceptionHandlerLog.args).toBe(failingUpdatingArgs);

          expect(handlerLog).toStrictEqual(initialHandlerLog);
        },
      );

      describe('#### Invoking the modified method without raising an exception ...', () => {
        test(
          '... the modified method allows the `afterFinallyHandler` to access' +
            ' from the before executed original function both its return value' +
            ' (result) and its arguments as a shallow-copied single `Array` type.',
          () => {
            // modify `setABC` via a prototypal `afterFinally`.
            sampleType.setABC = sampleType.setABC.afterFinally(
              afterFinallyHandler,
              sampleType,
            );
            expect(sampleType.setABC).not.toBe(unmodifiedSetter);

            // invoke the modified method,
            // provide new values for the `sampleType`'s local variables `a`, `b` and `c`.
            sampleType.setABC(...successfullyUpdatingArgs);

            // a `sampleType`'s `valueOf` will equally reflect the
            // most recent changes of its locally scoped variables.
            expect(Object.values(sampleType.valueOf())).toStrictEqual(
              successfullyUpdatingArgs,
            );

            // remained a reference ... as expected.
            expect(handlerLog.target).toBe(sampleType);

            // not anymore a reference ... which had to be proved ...
            expect(handlerLog.args).not.toBe(successfullyUpdatingArgs);
            // ... therefore countercheck with the set-up from before ...
            expect(expectedSuccessHandlerLog.args).toBe(
              successfullyUpdatingArgs,
            );

            // strict equality finally proves the correct `after` handling.
            expect(handlerLog).toStrictEqual(expectedSuccessHandlerLog);
          },
        );
        test(
          'The return value of a modified function which does not fail at call time' +
            ' is the very return value of the unmodified (original) function.',
          () => {
            const result = sampleType.setABC(6, 4, 5);

            expect(result).toStrictEqual(sampleType.valueOf());
            expect(result).toStrictEqual({ a: 6, b: 4, c: 5 });
          },
        );
      });

      describe('#### Invoking the modified method and raising an exception ...', () => {
        test(
          '... the modified method allows the `afterFinallyHandler` to access' +
            ' from the before executed original function both the raised exception' +
            ' and its arguments as a shallow-copied single `Array` type.',
          () => {
            // restore the `sampleType`s state to its initial value.
            sampleType.setABC(...initialArgs);
            // restore the `handlerLog` to its default value.
            Object.assign(handlerLog, initialHandlerLog);

            // proof of not having already run into an
            // `afterFinally` specific failure handling.
            expect(Object.values(sampleType.valueOf())).toStrictEqual(
              initialArgs,
            );
            expect(handlerLog).toStrictEqual(initialHandlerLog);

            // provide new values for the `sampleType`'s local variables `a`, `b` and `c`.
            // - invoke the modified method
            // - and raise an error hereby.
            sampleType.setABC(...failingUpdatingArgs);

            // since all arguments were set despite the raised exception,
            // a `sampleType`'s `valueOf` will equally reflect the
            // most recent changes of its locally scoped variables.
            expect(Object.values(sampleType.valueOf())).toStrictEqual(
              failingUpdatingArgs.concat('no argument provided'),
            );

            // remained a reference ... as expected.
            expect(handlerLog.target).toBe(sampleType);

            // not anymore a reference ... which had to be proved ...
            expect(handlerLog.args).not.toBe(failingUpdatingArgs);
            // ... therefore countercheck with the set-up from before ...
            expect(expectedExceptionHandlerLog.args).toBe(failingUpdatingArgs);

            // strict equality finally proves the correct `afterFinally` handling.
            expect(handlerLog).toStrictEqual(expectedExceptionHandlerLog);
          },
        );
        test('... this raised `exception` becomes the return value of the modified function.', () => {
          const exception = sampleType.setABC(1, 2);

          expect(exception.name).toBe(expectedExceptionHandlerLog.errorType);
          expect(exception.message).toBe(
            expectedExceptionHandlerLog.errorMessage,
          );
        });
      });

      test(
        'The `thisArgs` context of a modified method can/should be set at the' +
          " initial modifier/modification time as the `afterFinally` method's second" +
          ' argument. Nevertheless invoking a modified method via `call`/`apply`' +
          " and passing a valid `thisArgs` does overrule a modified method's" +
          ' initially bound context at exactly this current `call`/`apply` time.',
        () => {
          function exposeContext() {
            return this;
          }
          function afterContextHandler(/* resultOrException, ...args */) {
            // eslint-disable-next-line no-use-before-define
            callTimeLogList.push(this);
          }
          const callTimeLogList = [];

          const initialContext = { context: 'initial' };
          const callTimeContext = { context: 'calltime' };

          const exposeModifiedContext = exposeContext.after(
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

      function createObjectType(a, b, c) {
        return { a, b, c };
      }
      function manipulateObjectTypeAfterFinally(result, ...args) {
        // do manipulate an object type `result` reference.
        result.isManipulatedByAfterFinallyHandler = true;

        // a totally unexpected return value will not show any effect.
        return args;
      }

      test(
        "If an original function's return value is not a primitive or nullish value" +
          ' it can be manipulated by any `afterFinallyType`s `afterFinallyHandler` since' +
          " the latter's `result` argument is a reference of the original function's return value.",
        () => {
          const modifiedType = createObjectType.afterFinally(
            manipulateObjectTypeAfterFinally,
          );

          expect(modifiedType('foo', 'bar', 'baz')).not.toStrictEqual({
            a: 'foo',
            b: 'bar',
            c: 'baz',
          });
          expect(modifiedType('foo', 'bar', 'baz')).toStrictEqual({
            a: 'foo',
            b: 'bar',
            c: 'baz',
            isManipulatedByAfterFinallyHandler: true,
          });
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
          const modifiedType = sum.afterFinally(afterSumTest, invalidHandler);

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
            '`afterFinally`, in case of any failure, returns the context it was invoked at' +
              ' (which too, but not necessarily, is expected to be a `Function` type).',
            () => {
              const unmodifiedType = sum.afterFinally(invalidHandler);

              expect(isFunction(unmodifiedType)).toBe(true);
              expect(unmodifiedType).toStrictEqual(sum);

              const unmodifiedOddity = sum.afterFinally.call(
                invalidHandler,
                afterSumTest,
              );

              expect(isFunction(unmodifiedOddity)).toBe(false);
              expect(unmodifiedOddity).toStrictEqual(invalidHandler);
            },
          );
          test('`afterFinally`, in case of success, returns a modified function/method.', () => {
            const modifiedType = sum.afterFinally(afterSumTest, invalidHandler);

            expect(modifiedType).not.toBe(invalidHandler);
            expect(modifiedType).not.toBe(sum);

            expect(isFunction(modifiedType)).toBe(true);
          });
        },
      );
    },
  );
});
