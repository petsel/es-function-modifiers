import isFunction from '../../src/utils/type-detection';
import { afterFinallyModifier } from '../../src/modifiers/afterFinally';

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

describe('## Running the Test-Suite for the *afterFinally* modifier implementations ...', () => {
  test('... one expects that `afterFinallyModifier` exists and is itself a `Function` type.', () => {
    expect(afterFinallyModifier).not.toBeNull();
    expect(afterFinallyModifier).not.toBeUndefined();

    expect(isFunction(afterFinallyModifier)).toBe(true);
  });

  describe(
    '### Making use of the `afterFinallyModifier`, one can modify any passed function type and,' +
      " as for just this scenario, can access as 1st argument either the original function's" +
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

      // modify `setABC` via the non-prototypal `afterFinallyModifier`.
      sampleType.setABC = afterFinallyModifier(
        sampleType.setABC,
        afterFinallyHandler,
        sampleType,
      );

      test(
        'The method, before being modified by `afterFinallyModifier`, works as expected.' +
          ' The settings which prove this test are initialized as expected.',
        () => {
          expect(sampleType.setABC).not.toBe(unmodifiedSetter);

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
    },
  );
});
