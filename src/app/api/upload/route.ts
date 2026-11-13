import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = '';

    if (fileName.toLowerCase().endsWith('.pdf') || fileType === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text;
    } else {
      // Treat as plain text (txt, py, js, ts, md, json, csv, etc.)
      extractedText = buffer.toString('utf-8');
    }

    return NextResponse.json({
      name: fileName,
      type: fileType || 'text/plain',
      size: file.size,
      text: extractedText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Gagal membaca file: ${error?.message || 'Format tidak didukung'}` },
      { status: 500 }
    );
  }
}
