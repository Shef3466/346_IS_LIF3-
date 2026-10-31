// Small, dependency-free navigation helpers shared by the browser and Node tests.
export function nextEntryIndex(current, total, direction) {
  if (!Number.isInteger(total) || total < 0) throw new RangeError('Invalid entry count');
  if (direction !== 1 && direction !== -1) throw new RangeError('Direction must be +1 or -1');
  if (total === 0) return null;
  if (current === null) return direction === 1 ? 0 : total - 1;
  if (!Number.isInteger(current) || current < 0 || current >= total)
    throw new RangeError('Invalid current index');
  return (current + direction + total) % total;
}

export function initialAutoRotate(prefersReducedMotion) {
  return !Boolean(prefersReducedMotion);
}
