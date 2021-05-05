import getSanitizedTarget from '../../src/utils/sanitizing';

describe('## Running the Sanitizing Test-Suite with ...', () => {
  describe('### the type cast for a valid/sanitized applicable target/context type ...', () => {
    const mySymbol = Symbol('mySymbol');
    const myObject = {};
    const myArray = {};

    test('... one expects that `getSanitizedTarget` exists and is itself a `Function` type.', () => {
      expect(getSanitizedTarget).not.toBeNull();
      expect(getSanitizedTarget).not.toBeUndefined();

      expect(typeof getSanitizedTarget).toBe('function');
    });

    test(
      '...`getSanitizedTarget` has to return an applicable target/context,' +
        'thus either an object type or a primitive value or the null value.',
      () => {
        /* eslint-disable no-void */
        expect(getSanitizedTarget(void 0)).not.toBeUndefined();
        expect(getSanitizedTarget(void 0)).toBeNull();
        /* eslint-enable no-void */

        expect(getSanitizedTarget()).toBeNull();
        expect(getSanitizedTarget(null)).toBeNull();

        expect(getSanitizedTarget(0)).toBe(0);
        expect(getSanitizedTarget('')).toBe('');
        expect(getSanitizedTarget(true)).toBe(true);

        expect(getSanitizedTarget(mySymbol)).toBe(mySymbol);

        expect(getSanitizedTarget(myObject)).toBe(myObject);
        expect(getSanitizedTarget(myArray)).toBe(myArray);
      },
    );
  });
});
