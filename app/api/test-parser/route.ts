import { type NextRequest, NextResponse } from 'next/server';
import { parseQuery, __test_only__ as parserInternals } from '@/src/search/queryParser';

/**
 * A test-only API route to validate the modular query parser's logic,
 * especially its fallback mechanism.
 *
 * Query Params:
 *  - q: The search query string to parse.
 *  - failGoogle: 'true' to simulate a failure in the Google AI parser.
 *  - failOpenAI: 'true' to simulate a failure in the OpenAI parser.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const failGoogle = searchParams.get('failGoogle') === 'true';
  const failOpenAI = searchParams.get('failOpenAI') === 'true';

  // --- Monkey-patch parsers for testing purposes ---
  const originalParsers = [...parserInternals.parsers];
  
  if (failGoogle) {
    const googleParserIndex = parserInternals.parsers.findIndex(p => p.name === 'GoogleAI');
    if (googleParserIndex !== -1) {
      parserInternals.parsers[googleParserIndex] = {
        name: 'GoogleAI_mock_fail',
        parser: async () => { throw new Error('Simulated Google AI failure'); },
      };
    }
  }

  if (failOpenAI) {
    const openAIParserIndex = parserInternals.parsers.findIndex(p => p.name === 'OpenAI');
    if (openAIParserIndex !== -1) {
      parserInternals.parsers[openAIParserIndex] = {
        name: 'OpenAI_mock_fail',
        parser: async () => { throw new Error('Simulated OpenAI failure'); },
      };
    }
  }

  try {
    const result = await parseQuery(query);
    // Restore original parsers after the call to avoid side effects
    parserInternals.parsers = originalParsers;
    return NextResponse.json({ success: true, result });
  } catch (error) {
    parserInternals.parsers = originalParsers;
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
