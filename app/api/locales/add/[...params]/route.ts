import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { lock } from 'proper-lockfile';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: { params: [string, string] } }
) {
  const [lng, ns] = context.params.params;
  const filePath = path.join(
    process.cwd(),
    'public',
    'locales',
    lng,
    `${ns}.json`
  );

  let release;
  try {
    const body = await request.json();

    if (!lng || !ns || !body) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });

    release = await lock(filePath, { retries: 5, realpath: false });

    let translations = {};
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      if (fileContent) {
        translations = JSON.parse(fileContent);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error('Error reading translation file:', error);
        return NextResponse.json(
          { error: 'Error reading translation file' },
          { status: 500 }
        );
      }
    }

    const updatedTranslations = { ...translations, ...body };

    await fs.writeFile(
      filePath,
      JSON.stringify(updatedTranslations, null, 2),
      'utf8'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in translation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (release) {
      await release();
    }
  }
}
