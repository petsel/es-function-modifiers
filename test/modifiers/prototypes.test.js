import isFunction from '../../src/utils/type-detection';
import {
  enablePrototypes as enableModifierPrototypes,
  restoreDefault as restorePrototypeDefault,
} from '../../src/modifiers/prototypes';

const fctPrototype = Function.prototype;
const fctPrototypeDescriptorStringDefault = JSON.stringify(
  Object.getOwnPropertyDescriptors(fctPrototype),
);

const modifierNameList = ['around'];

describe('## Running the Test-Suite for method-modifier prototypes ...', () => {
  describe(
    '### ... there is the possibility of enabling prototypal implementations' +
      'and restoring again the `Function.prototype` to its standardized default.',
    () => {
      test('One expects that `enablePrototypes` exists and is itself a `Function` type.', () => {
        expect(enableModifierPrototypes).not.toBeNull();
        expect(enableModifierPrototypes).not.toBeUndefined();

        expect(isFunction(enableModifierPrototypes)).toBe(true);
      });
      test('One expects that `restoreDefault` exists and is itself a `Function` type.', () => {
        expect(restorePrototypeDefault).not.toBeNull();
        expect(restorePrototypeDefault).not.toBeUndefined();

        expect(isFunction(restorePrototypeDefault)).toBe(true);
      });

      describe('### Enabling all method-modifier prototypes one expects that ...', () => {
        test('... each implementation is accessible.', () => {
          enableModifierPrototypes();
          expect(
            modifierNameList.every(modifierName =>
              isFunction(fctPrototype[modifierName]),
            ),
          ).toBe(true);
        });
        test('... the property descriptor of `Function.prototype` is non standard.', () => {
          const descriptorStringWithModifiers = JSON.stringify(
            Object.getOwnPropertyDescriptors(fctPrototype),
          );

          expect(descriptorStringWithModifiers).not.toBe(
            fctPrototypeDescriptorStringDefault,
          );
        });
      });

      describe('### Restoring the `Function.prototype` to its standardized default one expects that ...', () => {
        test('... not a single prototypal method modifier is present.', () => {
          enableModifierPrototypes();
          restorePrototypeDefault();
          expect(
            modifierNameList.every(
              modifierName => !isFunction(fctPrototype[modifierName]),
            ),
          ).toBe(true);
        });
        test('... the property descriptor of `Function.prototype` meets the standardized default.', () => {
          restorePrototypeDefault();
          const restoredDescriptorString = JSON.stringify(
            Object.getOwnPropertyDescriptors(fctPrototype),
          );

          expect(restoredDescriptorString).toBe(
            fctPrototypeDescriptorStringDefault,
          );
        });
      });
    },
  );
});
