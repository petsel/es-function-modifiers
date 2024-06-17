import isFunction from '../../src/utils/type-detection';
import { afterThrowingModifier } from '../../src/modifiers/afterThrowing';

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

describe('## Running the Test-Suite for the *afterThrowing* modifier implementations ...', () => {
  test('... one expects that `afterThrowingModifier` exists and is itself a `Function` type.', () => {
    expect(afterThrowingModifier).not.toBeNull();
    expect(afterThrowingModifier).not.toBeUndefined();

    expect(isFunction(afterThrowingModifier)).toBe(true);
  });

  describe(
    '### Making use of the `afterThrowingModifier`, one can modify any passed function type and,' +
      ' as for this scenario, can, and only in case the before executed original function fails,' +
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
        'The method, before being modified by `afterThrowingModifier`, works as expected.' +
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
      const modifiedTotal = afterThrowingModifier(
        finiteTotal,
        handleTotalFailure,
      );

      describe(
        '#### Invoking the modified method and raising an exception' +
          ' triggers the `afterThrowingHandler` based exception handling.',
        () => {
          test(
            'Being invoked by the exception handling, `afterThrowingHandler`' +
              ' can access following arguments, the raised `exception`' +
              ' (the reason/cause of the invocation failure) and all the modified' +
              " method's arguments by rest syntax via e.g. `...args`..",
            () => {
              // modify `valueOf` via the non-prototypal `afterThrowingModifier`.
              sampleType.valueOf = afterThrowingModifier(
                sampleType.valueOf,
                afterThrowingHandler,
                sampleType,
              );
              // modify `setABC` via the non-prototypal `afterThrowingModifier`.
              sampleType.setABC = afterThrowingModifier(
                sampleType.setABC,
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
          expect(modifiedTotal(1, 2, 3)).toBe(finiteTotal(1, 2, 3));
          expect(modifiedTotal(1, 2, 3)).toBe(6);
        },
      );
    },
  );
});
