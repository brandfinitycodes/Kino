export default function maxBy(arr, fn) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  const getKey = typeof fn === 'function' ? fn : (item) => item[fn];
  let maxItem = arr[0];
  let maxValue = getKey(maxItem);
  for (let i = 1; i < arr.length; i++) {
    const val = getKey(arr[i]);
    if (val > maxValue) {
      maxValue = val;
      maxItem = arr[i];
    }
  }
  return maxItem;
}
