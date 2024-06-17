import isFunction from '../../src/utils/type-detection';
import { afterModifier } from '../../src/modifiers/after';

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

describe('## Running the Test-Suite for the *after* modifier implementations ...', () => {
  test('... one expects that `afterModifier` exists and is itself a `Function` type.', () => {
    expect(afterModifier).not.toBeNull();
    expect(afterModifier).not.toBeUndefined();

    expect(isFunction(afterModifier)).toBe(true);
  });

  describe(
    '### Making use of the `afterModifier`, one can modify any passed function type and,' +
      ' as for this scenario, can access from the before executed original function both' +
      ' its return value (`result`) and its arguments as a shallow-copied single `Array` type.',
    () => {
      const initialArgs = [9, 8, 7];
      const updatingArgs = [1, 2, 3];

      const sampleType = createSampleType(...initialArgs);
      const unmodifiedSetter = sampleType.setABC;

      // *hooked-in* `after` handler.
      function afterHandler(result, ...args) {
        const target = this;

        // eslint-disable-next-line no-use-before-define
        Object.assign(handlerLog, {
          target,
          args,
          isHandledAfter: true,
        });
      }
      const expectedHandlerLog = {
        target: sampleType,
        args: updatingArgs,
        isHandledAfter: true,
      };
      const initialHandlerLog = {
        target: null,
        args: null,
        isHandledAfter: false,
      };
      const handlerLog = { ...initialHandlerLog };

      test(
        'The method, before being modified by `afterModifier`, works as expected.' +
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
      test(
        'Invoking the modified method allows the `afterHandler` to access' +
          ' from the before executed original function both its return value' +
          ' (`result`) and its arguments as a shallow-copied single `Array` type.',
        () => {
          // modify `setABC` via the non-prototypal `afterModifier`.
          sampleType.setABC = afterModifier(
            sampleType.setABC,
            afterHandler,
            sampleType,
          );

          expect(sampleType.setABC).not.toBe(unmodifiedSetter);
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            initialArgs,
          );

          // invoke the modified method,
          // provide new values for the `sampleType`'s local variables `a`, `b` and `c`.
          sampleType.setABC(...updatingArgs);

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

          // strict equality finally proves the correct `after` handling.
          expect(handlerLog).toStrictEqual(expectedHandlerLog);
        },
      );
    },
  );
});
