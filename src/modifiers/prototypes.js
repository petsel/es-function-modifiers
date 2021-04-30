import { around } from "./around";

const { prototype: fctPrototype } = Function;

export default function enablePrototypes() {
  Object.defineProperty(fctPrototype, "around", {
    configurable: true,
    writable: true,
    value: around,
  });
}
