// Small, testable projection and interaction helpers for the 2D Genesis globe.
// These are visualization coordinates, not geographical or astronomical claims.
export function projectConcepts(count, angle, tilt, radius) {
  if (!Number.isInteger(count) || count < 0 || ![angle, tilt, radius].every(Number.isFinite) || radius < 0)
    throw new RangeError('Invalid globe projection inputs');
  return Array.from({ length: count }, (_, i) => {
    const z = 1 - 2 * (i + .5) / count;
    const ring = Math.sqrt(Math.max(0, 1 - z * z));
    const azimuth = i * 2.399963229728653 + angle;
    const x = ring * Math.cos(azimuth), y = ring * Math.sin(azimuth);
    return {
      i,
      x: x * radius,
      y: (y * Math.cos(tilt) - z * Math.sin(tilt)) * radius,
      depth: y * Math.sin(tilt) + z * Math.cos(tilt)
    };
  });
}

export function hitTestConcept(points, x, y, maxDistance = 18) {
  if (![x, y, maxDistance].every(Number.isFinite) || maxDistance <= 0)
    throw new RangeError('Invalid hit-test coordinates');
  let best = null, bestDistance = maxDistance;
  for (const point of points) {
    // Do not select an obscured point on the far side of the sphere.
    if (point.depth < -0.15) continue;
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < bestDistance) { best = point.i; bestDistance = distance; }
  }
  return best;
}

export function advanceAngle(angle, elapsedMs, rotating) {
  if (!Number.isFinite(angle)) throw new RangeError('Invalid angle');
  if (!rotating) return angle;
  // Time-based rotation stays consistent across refresh rates; clamp long pauses.
  const dt = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(50, elapsedMs)) : 0;
  return angle + dt * 0.00015;
}

// Match backing pixels to the displayed canvas without overwhelming mobile GPUs.
// A 2x density ceiling and 1.5 MP budget keep the prototype lightweight.
export function canvasPixelSize(cssWidth, cssHeight, devicePixelRatio = 1, maxPixels = 1_500_000) {
  if (![cssWidth, cssHeight, devicePixelRatio, maxPixels].every(Number.isFinite) ||
      cssWidth <= 0 || cssHeight <= 0 || devicePixelRatio <= 0 || maxPixels < 1)
    throw new RangeError('Invalid canvas resolution inputs');
  const density = Math.min(2, Math.max(1, devicePixelRatio));
  const scale = Math.min(density, Math.sqrt(maxPixels / (cssWidth * cssHeight)));
  return {
    width: Math.max(1, Math.floor(cssWidth * scale)),
    height: Math.max(1, Math.floor(cssHeight * scale))
  };
}
