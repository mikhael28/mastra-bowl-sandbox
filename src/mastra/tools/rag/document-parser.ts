import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

export type ParsedDocument = {
  text: string;
  pageCount?: number;
  format: string;
};

export async function parseDocument(filePath: string): Promise<ParsedDocument> {
  const ext = extname(filePath).toLowerCase();

  switch (ext) {
    case '.pdf':
      return parsePdf(filePath);
    case '.docx':
      return parseDocx(filePath);
    case '.xlsx':
    case '.xls':
      return parseExcel(filePath);
    case '.csv':
      return parseCsv(filePath);
    case '.md':
    case '.markdown':
      return parseText(filePath, 'markdown');
    case '.txt':
      return parseText(filePath, 'text');
    case '.jpg':
    case '.jpeg':
    case '.png':
      return parseImage(filePath);
    default:
      throw new Error(
        `Unsupported file format: ${ext}. Supported: .pdf, .docx, .xlsx, .xls, .csv, .md, .txt, .jpg, .png`,
      );
  }
}

async function parsePdf(filePath: string): Promise<ParsedDocument> {
  const buffer = await readFile(filePath);
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  const info = await parser.getInfo();
  const pageCount = (info as any).pages ?? result.pages?.length ?? undefined;
  await parser.destroy();
  return {
    text: result.text,
    pageCount,
    format: 'pdf',
  };
}

async function parseDocx(filePath: string): Promise<ParsedDocument> {
  const buffer = await readFile(filePath);
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    format: 'docx',
  };
}

async function parseExcel(filePath: string): Promise<ParsedDocument> {
  const buffer = await readFile(filePath);
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const sheets: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]!;
    const csv = XLSX.utils.sheet_to_csv(sheet);
    sheets.push(`## Sheet: ${sheetName}\n\n${csv}`);
  }

  return {
    text: sheets.join('\n\n'),
    format: 'excel',
  };
}

async function parseCsv(filePath: string): Promise<ParsedDocument> {
  const text = await readFile(filePath, 'utf8');
  return { text, format: 'csv' };
}

async function parseText(filePath: string, format: string): Promise<ParsedDocument> {
  const text = await readFile(filePath, 'utf8');
  return { text, format };
}

async function parseImage(filePath: string): Promise<ParsedDocument> {
  const buffer = await readFile(filePath);
  const ext = extname(filePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is required for image text extraction. Set it in your .env file.',
    );
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text visible in this image. If it is a scanned document, transcribe every word faithfully. If it contains tables, preserve the structure using markdown table format. If it contains handwriting, do your best to transcribe it. Return ONLY the extracted text, no commentary.',
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI vision API error (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const text = data.choices[0]?.message?.content ?? '';

  return { text, format: 'image', pageCount: 1 };
}

export async function parseRawText(text: string, format = 'text'): Promise<ParsedDocument> {
  return { text, format };
}
