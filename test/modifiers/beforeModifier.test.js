import isFunction from '../../src/utils/type-detection';
import { beforeModifier } from '../../src/modifiers/before';

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

describe('## Running the Test-Suite for the *before* modifier implementations ...', () => {
  test('... one expects that `beforeModifier` exists and is itself a `Function` type.', () => {
    expect(beforeModifier).not.toBeNull();
    expect(beforeModifier).not.toBeUndefined();

    expect(isFunction(beforeModifier)).toBe(true);
  });

  describe(
    '### Making use of the `beforeModifier`, one can modify any passed function type and,' +
      " as for this scenario, has to access this original function's arguments by rest syntax" +
      ' via e.g. `...args`.',
    () => {
      const initialArgs = [9, 8, 7];

      const updatingArgs = [1, 2, 3];
      const manipulatedArgs = updatingArgs.map(String);

      const sampleType = createSampleType(...initialArgs);
      const unmodifiedSetter = sampleType.setABC;

      // *hooked-in* `before` handler.
      function beforeHandler(...args) {
        const target = this;

        // try manipulating the accessible argument array towards the original function.
        args[0] = String(args[0]);
        args[1] = String(args[1]);
        args[2] = String(args[2]);

        // eslint-disable-next-line no-use-before-define
        Object.assign(handlerLog, {
          target,
          args,
          isHandledBefore: true,
        });
      }
      const expectedHandlerLog = {
        target: sampleType,
        args: manipulatedArgs,
        isHandledBefore: true,
      };
      const initialHandlerLog = {
        target: null,
        args: null,
        isHandledBefore: false,
      };
      const handlerLog = { ...initialHandlerLog };

      test(
        'The method, before being modified by `beforeModifier`, works as expected.' +
          ' The settings which prove this test are initialized as expected.',
        () => {
          // a `sampleType`'s `valueOf` does always reflect
          // the current state of its locally scoped variables.
          expect(Object.values(sampleType.valueOf())).toStrictEqual(
            initialArgs,
          );

          // references ... twice ... as expected.
          expect(expectedHandlerLog.target).toBe(sampleType);
          expect(expectedHandlerLog.args).toBe(manipulatedArgs);

          expect(handlerLog).toStrictEqual(initialHandlerLog);
        },
      );
      test(
        'Invoking the modified method allows the `beforeHandler` to access' +
          ' all the arguments passed to the before executed original function by' +
          ' rest syntax via e.g. `...args`.',
        () => {
          // modify `setABC` via the non-prototypal `beforeModifier`.
          sampleType.setABC = beforeModifier(
            sampleType.setABC,
            beforeHandler,
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
          expect(handlerLog.args).not.toBe(manipulatedArgs);
          // ... therefore countercheck with the set-up from before ...
          expect(expectedHandlerLog.args).toBe(manipulatedArgs);

          // strict equality finally proves the correct `before` handling.
          expect(handlerLog).toStrictEqual(expectedHandlerLog);
        },
      );
    },
  );
});
