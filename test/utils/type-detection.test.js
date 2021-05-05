import isFunction from '../../src/utils/type-detection';

describe('## Running the Type-Detection Test-Suite with ...', () => {
  describe('### Checking for `Function` types ...', () => {
    /* eslint-disable func-names, no-empty-function */
    const fctArrow = x => x;
    const fctGenerator = function* () {};
    const fctConstructor = class {};
    const fctAsync = async function () {};
    const fctAsyncArrow = async x => x;
    /* eslint-enable func-names, no-empty-function */

    test('... one expects that `isFunction` exists and is itself a `Function` type.', () => {
      expect(isFunction).not.toBeNull();
      expect(isFunction).not.toBeUndefined();

      expect(typeof isFunction).toBe('function');
    });

    test('...`isFunction` has to approve any valid `Function` type.', () => {
      expect(isFunction(fctArrow)).toBe(true);
      expect(isFunction(fctGenerator)).toBe(true);

      expect(isFunction(fctConstructor)).toBe(true);

      expect(isFunction(fctAsync)).toBe(true);
      expect(isFunction(fctAsyncArrow)).toBe(true);
    });
    test('...`isFunction` has to disapprove any type other than `Function`.', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction([])).toBe(false);

      expect(isFunction(RegExp())).toBe(false);
      expect(isFunction(new Date())).toBe(false);
    });
  });
});
