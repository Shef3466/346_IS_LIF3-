export const relationTypes = ["relates-to","explains","supports","extends","questions"];
export function validate(book) {
  if (book.schema !== "lov3.v1" || !Array.isArray(book.entries)) throw Error("Invalid book");
  const ids = new Set(book.entries.map(e => e.id));
  if (ids.size !== book.entries.length) throw Error("Duplicate IDs");
  for (const entry of book.entries) {
    if (!entry.id || !entry.title || !Array.isArray(entry.links)) throw Error("Invalid entry");
    for (const link of entry.links) {
      if (!ids.has(link.to) || !relationTypes.includes(link.type)) throw Error("Invalid link");
    }
  }
  return true;
}
export function connect(book, from, to, type="relates-to") {
  validate(book);
  if (!relationTypes.includes(type) || !book.entries.some(e => e.id === to)) throw Error("Invalid target");
  const next = structuredClone(book);
  const item = next.entries.find(e => e.id === from);
  if (!item) throw Error("Invalid source");
  if (!item.links.some(l => l.to === to && l.type === type)) item.links.push({to,type});
  validate(next);
  return next;
}
export function related(book, id) {
  validate(book);
  return book.entries.filter(e=>e.id===id || e.links.some(l=>l.to===id) || book.entries.find(x=>x.id===id)?.links.some(l=>l.to===e.id));
}
