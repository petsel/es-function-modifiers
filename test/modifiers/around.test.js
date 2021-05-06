import isFunction from '../../src/utils/type-detection';
import { aroundModifier } from '../../src/modifiers/around';
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
    '### Making use of the prototypal *around*, one can modify an' +
      " object's method and intercept this modified method's control flow.",
    () => {
      const initialArgsList = [5, 6, 7];
      const interceptorArgsList = [9, 1, 5];

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
        'The method, before  being modified by a prototypal `around`, works as expected.' +
          'The settings which proof this test are initialized as expected.',
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
          " to intercept this modified method's control flow in the expected way.",
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
    },
  );
});

describe('## Running the Test-Suite for the *around* modifier implementations ...', () => {
  test('... one expects that `aroundModifier` exists and is itself a `Function` type.', () => {
    expect(aroundModifier).not.toBeNull();
    expect(aroundModifier).not.toBeUndefined();

    expect(isFunction(aroundModifier)).toBe(true);
  });

  describe(
    '### Making use of the `aroundModifier`, one can modify any passed' +
      " function type and, for this test case, intercept a method's control flow.",
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
        'The method, before  being modified by `aroundModifier`, works as expected.' +
          'The settings which proof this test are initialized as expected.',
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
          " to intercept this modified method's control flow in the expected way.",
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
