import isFunction from '../../src/utils/type-detection';
import { aroundModifier } from '../../src/modifiers/around';

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

describe('## Running the Test-Suite for the *around* modifier implementations ...', () => {
  test('... one expects that `aroundModifier` exists and is itself a `Function` type.', () => {
    expect(aroundModifier).not.toBeNull();
    expect(aroundModifier).not.toBeUndefined();

    expect(isFunction(aroundModifier)).toBe(true);
  });

  describe(
    '### Making use of the `aroundModifier`, one can modify any passed function type and,' +
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
        'The method, before being modified by `aroundModifier`, works as expected.' +
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
          sampleType.setABC = aroundModifier(
            sampleType.setABC,
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
    },
  );
});
