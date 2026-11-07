// Keep word labels readable on a rotating globe, particularly on narrow screens.
// Canvas coordinates are centered on (0, 0); only labels are culled, never nodes.
export function placeGlobeLabels(points, selected, measureWidth, width, height) {
  const minX = -width / 2 + 8, maxX = width / 2 - 8;
  const minY = -height / 2 + 8, maxY = height / 2 - 8;
  const occupied = [], placed = new Map();
  const candidates = points.filter(p => p.depth >= -.15 || p.i === selected)
    .sort((a, b) => Number(b.i === selected) - Number(a.i === selected) || b.depth - a.depth);
  for (const p of candidates) {
    const active = p.i === selected;
    const textWidth = measureWidth(p.i, active);
    if (!Number.isFinite(textWidth) || textWidth <= 0) continue;
    let x = p.x + 11, y = p.y + 4;
    if (x + textWidth > maxX) x = p.x - 11 - textWidth;
    if (active) {
      x = Math.max(minX, Math.min(x, maxX - textWidth));
      y = Math.max(minY + 13, Math.min(y, maxY - 5));
    }
    const box = { left: x - 3, right: x + textWidth + 3, top: y - 13, bottom: y + 5 };
    if (!active && (box.left < minX || box.right > maxX || box.top < minY || box.bottom > maxY)) continue;
    if (!active && occupied.some(other => box.left < other.right && box.right > other.left &&
      box.top < other.bottom && box.bottom > other.top)) continue;
    occupied.push(box);
    placed.set(p.i, { x, y });
  }
  return placed;
}
