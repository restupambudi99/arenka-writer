const encoder = new TextEncoder();

function escapePdf(value: string): string {
  const winAnsi = new Map<number, number>([
    [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
    [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a],
    [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
    [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
    [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c],
    [0x017e, 0x9e], [0x0178, 0x9f],
  ]);
  let result = "";
  for (const char of value) {
    const point = char.codePointAt(0) ?? 0x3f;
    const byte = point <= 0xff ? point : winAnsi.get(point) ?? 0x3f;
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) result += `\\${String.fromCharCode(byte)}`;
    else if (byte < 0x20 || byte > 0x7e) result += `\\${byte.toString(8).padStart(3, "0")}`;
    else result += String.fromCharCode(byte);
  }
  return result;
}

function wrap(text: string, limit = 88): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) { lines.push(""); continue; }
    let line = "";
    for (let word of paragraph.split(/\s+/)) {
      while (word.length > limit) {
        if (line) { lines.push(line); line = ""; }
        lines.push(word.slice(0, limit));
        word = word.slice(limit);
      }
      if (line && `${line} ${word}`.length > limit) { lines.push(line); line = word; }
      else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  }
  return lines;
}

function byteLength(value: string): number { return encoder.encode(value).length; }

export function createBookPdf(input: {
  title: string; subtitle: string; author: string; summary: string;
  chapters: Array<{ title: string; content: string }>; pageSize: string;
  orientation: string; fontSize: number; pageNumbers: string;
  customWidthMm?: number; customHeightMm?: number;
}): Uint8Array {
  const sizes: Record<string, [number, number]> = { A4: [595, 842], A5: [420, 595], B5: [499, 709], B6: [354, 499] };
  let [width, height] = sizes[input.pageSize] ?? sizes.A5!;
  if (input.pageSize === "custom") {
    width = (input.customWidthMm ?? 148) / 25.4 * 72;
    height = (input.customHeightMm ?? 210) / 25.4 * 72;
  }
  if (input.orientation === "landscape") [width, height] = [height, width];
  const margin = 56;
  const fontSize = Math.max(8, Math.min(24, input.fontSize));
  const lineHeight = fontSize * 1.55;
  const lineWidth = Math.max(28, Math.floor((width - margin * 2) / (fontSize * 0.53)));
  const bodyLines: Array<{ text: string; size: number; font: string }> = [];
  bodyLines.push({ text: input.title, size: 26, font: "F2" });
  if (input.subtitle) bodyLines.push({ text: input.subtitle, size: 14, font: "F1" });
  bodyLines.push({ text: input.author, size: 14, font: "F1" }, { text: "", size: 12, font: "F1" });
  if (input.summary) {
    bodyLines.push({ text: "Ringkasan", size: 18, font: "F2" });
    for (const line of wrap(input.summary, lineWidth)) bodyLines.push({ text: line, size: fontSize, font: "F1" });
    bodyLines.push({ text: "", size: 12, font: "F1" });
  }
  bodyLines.push({ text: "Daftar Isi", size: 18, font: "F2" });
  input.chapters.forEach((chapter, index) => {
    for (const line of wrap(`${index + 1}. ${chapter.title}`, lineWidth)) bodyLines.push({ text: line, size: fontSize, font: "F1" });
  });
  input.chapters.forEach((chapter, index) => {
    bodyLines.push({ text: "", size: 12, font: "F1" });
    for (const line of wrap(`${index + 1}. ${chapter.title}`, lineWidth)) bodyLines.push({ text: line, size: 20, font: "F2" });
    for (const line of wrap(chapter.content, lineWidth)) bodyLines.push({ text: line, size: fontSize, font: "F1" });
  });
  const pages: string[][] = [];
  let page: string[] = [];
  let y = height - margin;
  for (const line of bodyLines) {
    const step = Math.max(lineHeight, line.size * 1.35);
    if (y - step < margin) { pages.push(page); page = []; y = height - margin; }
    page.push(`BT /${line.font} ${line.size} Tf ${margin} ${y} Td (${escapePdf(line.text)}) Tj ET`);
    y -= step;
  }
  if (page.length || !pages.length) pages.push(page);
  const objects: string[] = [];
  const add = (value: string) => { objects.push(value); return objects.length; };
  const catalogId = add("");
  const pagesId = add("");
  const font1Id = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const font2Id = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds: number[] = [];
  pages.forEach((commands, pageIndex) => {
    const pageCommands = [...commands];
    if (input.pageNumbers !== "none") {
      const number = input.pageNumbers === "roman_front_matter" && pageIndex < 2
        ? ["i", "ii"][pageIndex]!
        : String(pageIndex + 1);
      pageCommands.push(`BT /F1 9 Tf ${width / 2 - 3} 28 Td (${number}) Tj ET`);
    }
    const stream = pageCommands.join("\n");
    const contentId = add(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  let offset = byteLength(chunks[0]!);
  objects.forEach((object, index) => {
    offsets.push(offset);
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`;
    chunks.push(chunk); offset += byteLength(chunk);
  });
  const xrefOffset = offset;
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((entry) => chunks.push(`${String(entry).padStart(10, "0")} 00000 n \n`));
  chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return encoder.encode(chunks.join(""));
}

