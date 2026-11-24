/** '15/05/2002' -> '2002-05-15', or null if it isn't a real calendar date. */
export function parseDdMmYyyy(input: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Date.UTC(+yyyy, +mm - 1, +dd));
  if (
    d.getUTCFullYear() !== +yyyy ||
    d.getUTCMonth() !== +mm - 1 ||
    d.getUTCDate() !== +dd
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}
