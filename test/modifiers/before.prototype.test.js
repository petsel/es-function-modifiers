import isFunction from '../../src/utils/type-detection';
import {
  restoreDefault,
  enablePrototypes,
} from '../../src/modifiers/prototypes';

const { prototype: fctPrototype } = Function;

const beforeToStringValue = 'before() { [native code] }';

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

describe('## Running the Test-Suite for the prototypal *before* modifier implementations ...', () => {
  test('... one expects that `before` exists as method of `Function.prototype`.', () => {
    expect(fctPrototype.before).not.toBeNull();
    expect(fctPrototype.before).not.toBeUndefined();

    expect(isFunction(fctPrototype.before)).toBe(true);
  });
  test('... one expects that `before` exists as method of a `Function` instance.', () => {
    // eslint-disable-next-line no-new-func
    expect(isFunction(new Function().before)).toBe(true);

    /* eslint-disable func-names, no-empty-function */
    function fctStatement() {}
    const fctExpression = function () {};
    /* eslint-enable func-names, no-empty-function */

    expect(isFunction(fctStatement.before)).toBe(true);
    expect(isFunction(fctExpression.before)).toBe(true);
  });
  test(
    '... one expects that a `toString` operation executed at `before` does' +
      ' return a custom string and not the stringified implementation itself.',
    () => {
      // eslint-disable-next-line prefer-template
      expect(fctPrototype.before + '').toBe(beforeToStringValue);

      expect(fctPrototype.before.toString()).toBe(beforeToStringValue);
      expect(String(fctPrototype.before)).toBe(beforeToStringValue);
    },
  );

  describe(
    '### Making use of the prototypal *before*, one can modify the operated function type' +
      " and, as for this scenario, has to access this original function's arguments by rest syntax" +
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
        'The method, before being modified by a prototypal `before`, works as expected.' +
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
          // modify `setABC` via a prototypal `before`.
          sampleType.setABC = sampleType.setABC.before(
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

      test(
        'The `thisArgs` context of a modified method can/should be set at the' +
          " initial modifier/modification time as the `before` method's second" +
          ' argument. Nevertheless invoking a modified method via `call`/`apply`' +
          " and passing a valid `thisArgs` does overrule a modified method's" +
          ' initially bound context at exactly this current `call`/`apply` time.',
        () => {
          function exposeContext() {
            return this;
          }
          function beforeContextHandler(/* ...args */) {
            // eslint-disable-next-line no-use-before-define
            callTimeLogList.push(this);
          }
          const callTimeLogList = [];

          const initialContext = { context: 'initial' };
          const callTimeContext = { context: 'calltime' };

          const exposeModifiedContext = exposeContext.before(
            beforeContextHandler,
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

      function sum(a, b, c) {
        return a + b + c;
      }
      function beforeSumTest(...args) {
        // try manipulating the accessible argument array towards the original function.

        /* eslint-disable operator-assignment */
        args[0] = args[0] * 10;
        args[1] = args[1] * 10;
        args[2] = args[2] * 10;
        /* eslint-enable operator-assignment */

        return sum(...args);
      }
      const invalidHandler = { invalid: 'handler' };

      test(
        'A modified function/method has a return value which is never' +
          ' different from the return value of the original function/method' +
          ' as long as both functions/methods get passed the same argument(s).',
        () => {
          const modifiedType = sum.before(beforeSumTest, invalidHandler);

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
            '`before`, in case of any failure, returns the context it was invoked at' +
              ' (which too, but not necessarily, is expected to be a `Function` type).',
            () => {
              const unmodifiedType = sum.before(invalidHandler);

              expect(isFunction(unmodifiedType)).toBe(true);
              expect(unmodifiedType).toStrictEqual(sum);

              const unmodifiedOddity = sum.before.call(
                invalidHandler,
                beforeSumTest,
              );

              expect(isFunction(unmodifiedOddity)).toBe(false);
              expect(unmodifiedOddity).toStrictEqual(invalidHandler);
            },
          );
          test('`before`, in case of success, returns a modified function/method.', () => {
            const modifiedType = sum.before(beforeSumTest, invalidHandler);

            expect(modifiedType).not.toBe(invalidHandler);
            expect(modifiedType).not.toBe(sum);

            expect(isFunction(modifiedType)).toBe(true);
          });
        },
      );
    },
  );
});
