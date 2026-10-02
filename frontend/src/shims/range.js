export default function range(start, stop, step = 1) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }
  const result = [];
  if (step > 0) {
    for (let i = start; i < stop; i += step) result.push(i);
  } else if (step < 0) {
    for (let i = start; i > stop; i += step) result.push(i);
  }
  return result;
}
