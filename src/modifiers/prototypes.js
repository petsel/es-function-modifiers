import { around } from './around';
import { before } from './before';
import { after } from './after';
import { afterThrowing } from './afterThrowing';
import { afterFinally } from './afterFinally';

const { prototype: fctPrototype } = Function;

const methodIndex = {
  around,
  before,
  after,
  afterThrowing,
  afterFinally,
};
const methodNameList = Reflect.ownKeys(methodIndex);

/**
 * A function which restores `Function.prototype`
 * to its specification standard.
 *
 * @returns {void} No return value.
 */
export function restoreDefault() {
  methodNameList.forEach(methodName =>
    Reflect.deleteProperty(fctPrototype, methodName),
  );
}

/**
 * A function which makes *modifier* functionality available as
 * prototypal methods of the built-in `Function` object/type.
 *
 * @returns {void} No return value.
 */
export function enablePrototypes() {
  methodNameList.forEach(methodName =>
    Reflect.defineProperty(fctPrototype, methodName, {
      configurable: true,
      writable: true,
      value: methodIndex[methodName],
    }),
  );
}
