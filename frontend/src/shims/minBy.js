export default function minBy(arr, fn) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  const getKey = typeof fn === 'function' ? fn : (item) => item[fn];
  let minItem = arr[0];
  let minValue = getKey(minItem);
  for (let i = 1; i < arr.length; i++) {
    const val = getKey(arr[i]);
    if (val < minValue) {
      minValue = val;
      minItem = arr[i];
    }
  }
  return minItem;
}
