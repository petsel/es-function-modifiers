import isFunction from '../../src/utils/type-detection';
import { aroundModifier } from '../../src/modifiers/around';
// import { enablePrototypes, restoreDefault } from '../../src/modifiers/prototypes';

describe('## Running the Test-Suite for the *around* modifier implementations ...', () => {
  test('... one expects that `aroundModifier` exists and is itself a `Function` type.', () => {
    expect(aroundModifier).not.toBeNull();
    expect(aroundModifier).not.toBeUndefined();

    expect(isFunction(aroundModifier)).toBe(true);
  });
});
