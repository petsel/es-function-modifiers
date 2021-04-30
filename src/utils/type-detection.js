function isFunction(value) {
  return (
    typeof value === "function" &&
    typeof value.call === "function" &&
    typeof value.apply === "function"
  );
}
export default isFunction;
