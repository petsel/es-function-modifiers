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
      const initialArgsList = [9, 8, 7];
      const updatingArgsList = [1, 2, 3];

      const sampleType = createSampleType(...initialArgsList);
      const unmodifiedSetter = sampleType.setABC;

      // *hooked-in* `after` handler.
      function afterHandler(result, argsList) {
        const target = this;

        // eslint-disable-next-line no-use-before-define
        Object.assign(handlerLog, {
          target,
          argsList,
          isHandledAfter: true,
        });
      }
      const expectedHandlerLog = {
        target: sampleType,
        argsList: updatingArgsList,
        isHandledAfter: true,
      };
      const initialHandlerLog = {
        target: null,
        argsList: null,
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
            initialArgsList,
          );

          // references ... twice ... as expected.
          expect(expectedHandlerLog.target).toBe(sampleType);
          expect(expectedHandlerLog.argsList).toBe(updatingArgsList);

          expect(handlerLog).toStrictEqual(initialHandlerLog);

          // `[...argumentArray]` will decouple the `argumentArray` passed to `handler`
          // from the one getting passed/applied to the original `proceed` function.
        },
      );
      test(
        'Invoking the modified method allows the `afterHandler` to access' +
          ' from the before executed original function both its return value' +
          ' (`result`) and its arguments as a shallow-copied single `Array` type.',
        () => {
          // modify `setABC` via the non prototypal `afterModifier`.
          sampleType.setABC = afterModifier(
            sampleType.setABC,
            afterHandler,
            sampleType,
          );

          expect(sampleType.setABC).not.toBe(unmodifiedSetter);
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            initialArgsList,
          );

          // invoke the modified method,
          // provide new values for the `sampleType`'s local variables `a`, `b` and `c`.
          sampleType.setABC(...updatingArgsList);

          // a `sampleType`'s `valueOf` will equally reflect the
          // most recent changes of its locally scoped variables.
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            updatingArgsList,
          );

          // remained a references ... as expected.
          expect(handlerLog.target).toBe(sampleType);

          // not anymore a reference ... which had to be proved ...
          expect(handlerLog.argsList).not.toBe(updatingArgsList);
          // ... therefore countercheck with the set-up from before ...
          expect(expectedHandlerLog.argsList).toBe(updatingArgsList);

          // strict equality finally proves the correct `after` handling.
          expect(handlerLog).toStrictEqual(expectedHandlerLog);
        },
      );
    },
  );
});
