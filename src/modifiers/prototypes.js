import { around } from './around';

const { prototype: fctPrototype } = Function;

/**
 * A function which restores `Function.prototype`
 * to its specification standard.
 *
 * @returns {void} No return value.
 */
export function restoreDefault() {
  ['around'].forEach(methodName => delete fctPrototype[methodName]);
}

/**
 * A function which makes *modifier* functionality available as
 * prototypal methods of the built-in `Function` object/type.
 *
 * @returns {void} No return value.
 */
export function enablePrototypes() {
  Object.defineProperty(fctPrototype, 'around', {
    configurable: true,
    writable: true,
    value: around,
  });
}
