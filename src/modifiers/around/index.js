import isFunction from '../../utils/type-detection';
import getSanitizedTarget from '../../utils/sanitizing';

// provide "prototype ready" implementation.

export function around(handler, target) {
  target = getSanitizedTarget(target);

  const proceed = this;
  return (

    isFunction(handler) &&
    isFunction(proceed) &&

    function aroundHandler (...argumentsList) {
      return handler.call((target || getSanitizedTarget(this)), proceed, handler, argumentsList);
    }

  ) || proceed;
}
around.toString = () => 'around() { [native code] }';

// provide static implementation as well.

export function aroundModifier(proceed, handler, target) {
  return around.call(proceed, handler, target);
}
aroundModifier.toString = () => 'aroundModifier() { [native code] }';
