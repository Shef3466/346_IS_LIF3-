// Editorial navigation taxonomy: meaning first, optional number last.
// Stable IDs remain separate from labels; numbers are never inferred from IDs.
const text = value => typeof value === 'string' && value.trim() ? value.trim() : null;

export function conceptIdentity(entry) {
  const subject = text(entry?.subject) ?? 'Unclassified subject';
  const category = text(entry?.category) ?? 'Unclassified category';
  const word = text(entry?.word) ?? text(entry?.title) ?? 'Untitled';
  const number = text(entry?.number);
  return {
    subject, category, word, number,
    path: [subject, category, word, ...(number ? [number] : [])]
  };
}

export function globeLabel(entry, maxLength = 16) {
  const word = conceptIdentity(entry).word;
  if (!Number.isInteger(maxLength) || maxLength < 2) throw new RangeError('Invalid label length');
  return word.length <= maxLength ? word : word.slice(0, maxLength - 1) + '…';
}
