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
      " as for this scenario, can access this original function's arguments just as" +
      ' a shallow-copied single `Array` type.',
    () => {
      const initialArgsList = [9, 8, 7];

      const updatingArgsList = [1, 2, 3];
      const manipulatedArgsList = updatingArgsList.map(String);

      const sampleType = createSampleType(...initialArgsList);
      const unmodifiedSetter = sampleType.setABC;

      // *hooked-in* `before` handler.
      function beforeHandler(argsList) {
        const target = this;

        // try manipulating the accessible argument array towards the original function.
        argsList[0] = String(argsList[0]);
        argsList[1] = String(argsList[1]);
        argsList[2] = String(argsList[2]);

        // eslint-disable-next-line no-use-before-define
        Object.assign(handlerLog, {
          target,
          argsList,
          isHandledBefore: true,
        });
      }
      const expectedHandlerLog = {
        target: sampleType,
        argsList: manipulatedArgsList,
        isHandledBefore: true,
      };
      const initialHandlerLog = {
        target: null,
        argsList: null,
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
            initialArgsList,
          );

          // references ... twice ... as expected.
          expect(expectedHandlerLog.target).toBe(sampleType);
          expect(expectedHandlerLog.argsList).toBe(manipulatedArgsList);

          expect(handlerLog).toStrictEqual(initialHandlerLog);
        },
      );
      test(
        'Invoking the modified method allows the `beforeHandler` to access the' +
          " original function's arguments just as a shallow-copied single `Array` type.",
        () => {
          // modify `setABC` via the non prototypal `beforeModifier`.
          sampleType.setABC = beforeModifier(
            sampleType.setABC,
            beforeHandler,
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

          // remained a reference ... as expected.
          expect(handlerLog.target).toBe(sampleType);

          // not anymore a reference ... which had to be proved ...
          expect(handlerLog.argsList).not.toBe(manipulatedArgsList);
          // ... therefore countercheck with the set-up from before ...
          expect(expectedHandlerLog.argsList).toBe(manipulatedArgsList);

          // strict equality finally proves the correct `before` handling.
          expect(handlerLog).toStrictEqual(expectedHandlerLog);
        },
      );
    },
  );
});
