import isFunction from '../../src/utils/type-detection';
import {
  restoreDefault,
  enablePrototypes,
} from '../../src/modifiers/prototypes';

const { prototype: fctPrototype } = Function;

const afterToStringValue = 'after() { [native code] }';

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

describe('## Running the Test-Suite for the prototypal *after* modifier implementations ...', () => {
  test('... one expects that `after` exists as method of `Function.prototype`.', () => {
    expect(fctPrototype.after).not.toBeNull();
    expect(fctPrototype.after).not.toBeUndefined();

    expect(isFunction(fctPrototype.after)).toBe(true);
  });
  test('... one expects that `after` exists as method of a `Function` instance.', () => {
    // eslint-disable-next-line no-new-func
    expect(isFunction(new Function().after)).toBe(true);

    /* eslint-disable func-names, no-empty-function */
    function fctStatement() {}
    const fctExpression = function () {};
    /* eslint-enable func-names, no-empty-function */

    expect(isFunction(fctStatement.after)).toBe(true);
    expect(isFunction(fctExpression.after)).toBe(true);
  });
  test(
    '... one expects that a `toString` operation executed at `after` does' +
      ' return a custom string and not the stringified implementation itself.',
    () => {
      // eslint-disable-next-line prefer-template
      expect(fctPrototype.after + '').toBe(afterToStringValue);

      expect(fctPrototype.after.toString()).toBe(afterToStringValue);
      expect(String(fctPrototype.after)).toBe(afterToStringValue);
    },
  );

  describe(
    '### Making use of the prototypal *after*, one can modify the operated function type' +
      ' and, as for this scenario, can access from the before executed original function both,' +
      ' its return value as e.g. `result` and its arguments by rest syntax via e.g. `...args`.',
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
        'The method, before being modified by a prototypal `after`, works as expected.' +
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
          ' from the before executed original function both, its return value as' +
          " e.g. `result` and all the modified method's arguments by rest syntax" +
          ' via e.g. `...args`.',
        () => {
          // modify `setABC` via a prototypal `after`.
          sampleType.setABC = sampleType.setABC.after(afterHandler, sampleType);

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

      test(
        'The `thisArgs` context of a modified method can/should be set at the' +
          " initial modifier/modification time as the `after` method's second" +
          ' argument. Nevertheless invoking a modified method via `call`/`apply`' +
          " and passing a valid `thisArgs` does overrule a modified method's" +
          ' initially bound context at exactly this current `call`/`apply` time.',
        () => {
          function exposeContext() {
            return this;
          }
          function afterContextHandler(/* ...args */) {
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
      function manipulateObjectTypeAfter(result, ...args) {
        // do manipulate an object type `result` reference.
        result.isManipulatedByAfterHandler = true;

        // a totally unexpected return value will not show any effect.
        return args;
      }

      test(
        "If an original function's return value is not a primitive or nullish value" +
          " it can be manipulated by any `afterType`s `afterHandler` since the latter's" +
          " `result` argument is a reference of the original function's return value.",
        () => {
          const modifiedType = createObjectType.after(
            manipulateObjectTypeAfter,
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
            isManipulatedByAfterHandler: true,
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
          const modifiedType = sum.after(afterSumTest, invalidHandler);

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
            '`after`, in case of any failure, returns the context it was invoked at' +
              ' (which too, but not necessarily, is expected to be a `Function` type).',
            () => {
              const unmodifiedType = sum.after(invalidHandler);

              expect(isFunction(unmodifiedType)).toBe(true);
              expect(unmodifiedType).toStrictEqual(sum);

              const unmodifiedOddity = sum.after.call(
                invalidHandler,
                afterSumTest,
              );

              expect(isFunction(unmodifiedOddity)).toBe(false);
              expect(unmodifiedOddity).toStrictEqual(invalidHandler);
            },
          );
          test('`after`, in case of success, returns a modified function/method.', () => {
            const modifiedType = sum.after(afterSumTest, invalidHandler);

            expect(modifiedType).not.toBe(invalidHandler);
            expect(modifiedType).not.toBe(sum);

            expect(isFunction(modifiedType)).toBe(true);
          });
        },
      );
    },
  );
});
