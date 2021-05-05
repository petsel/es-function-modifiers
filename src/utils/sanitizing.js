/**
 * A sanitizer function which either does return a valid
 * applicable `target` type or does return the `null` value.
 *
 * @param value {*} - The type/value which will be sanitized.
 *
 * @returns {?(Object|boolean|number|string|symbol)}
 *  Returns either a valid applicable `target` type or returns the `null` value.
 */
function getSanitizedTarget(value) {
  return value ?? null;
}
export default getSanitizedTarget;
