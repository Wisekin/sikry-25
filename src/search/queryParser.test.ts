import { parseQuery, __test_only__ as testExports } from '@/src/search/queryParser';

describe('parseQuery', () => {
  const mockGoogleParser = jest.fn();
  const mockOpenAIParser = jest.fn();
  const mockLocalParser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // IMPORTANT: We must modify the original array in-place for the mock to work,
    // as the parseQuery function holds a reference to the original array.
    // Re-assigning testExports.parsers would not affect the function under test.
    testExports.parsers.length = 0; // Clear the array
    testExports.parsers.push(
      { name: 'GoogleAI', parser: mockGoogleParser },
      { name: 'OpenAI', parser: mockOpenAIParser },
      { name: 'LocalFallback', parser: mockLocalParser }
    );
  });

  test('should return result from the first successful parser (Google)', async () => {
    const googleResult = { keywords: ['google'], exactPhrases: [], excludedKeywords: [], filters: {} };
    mockGoogleParser.mockResolvedValue(googleResult);

    const result = await parseQuery('test');

    expect(result).toEqual(googleResult);
    expect(mockGoogleParser).toHaveBeenCalledTimes(1);
    expect(mockOpenAIParser).not.toHaveBeenCalled();
    expect(mockLocalParser).not.toHaveBeenCalled();
  });

  test('should fall back to the second parser (OpenAI) if the first fails', async () => {
    const openaiResult = { keywords: ['openai'], exactPhrases: [], excludedKeywords: [], filters: {} };
    mockGoogleParser.mockRejectedValue(new Error('Google failed'));
    mockOpenAIParser.mockResolvedValue(openaiResult);

    const result = await parseQuery('test');

    expect(result).toEqual(openaiResult);
    expect(mockGoogleParser).toHaveBeenCalledTimes(1);
    expect(mockOpenAIParser).toHaveBeenCalledTimes(1);
    expect(mockLocalParser).not.toHaveBeenCalled();
  });

  test('should fall back to the third parser (Local) if the first two fail', async () => {
    const localResult = { keywords: ['local'], exactPhrases: [], excludedKeywords: [], filters: {} };
    mockGoogleParser.mockRejectedValue(new Error('Google failed'));
    mockOpenAIParser.mockRejectedValue(new Error('OpenAI failed'));
    mockLocalParser.mockResolvedValue(localResult);

    const result = await parseQuery('test');

    expect(result).toEqual(localResult);
    expect(mockGoogleParser).toHaveBeenCalledTimes(1);
    expect(mockOpenAIParser).toHaveBeenCalledTimes(1);
    expect(mockLocalParser).toHaveBeenCalledTimes(1);
  });

  test('should return null if all parsers fail', async () => {
    mockGoogleParser.mockRejectedValue(new Error('Google failed'));
    mockOpenAIParser.mockRejectedValue(new Error('OpenAI failed'));
    mockLocalParser.mockRejectedValue(new Error('Local failed'));

    const result = await parseQuery('test');

    expect(result).toBeNull();
    expect(mockGoogleParser).toHaveBeenCalledTimes(1);
    expect(mockOpenAIParser).toHaveBeenCalledTimes(1);
    expect(mockLocalParser).toHaveBeenCalledTimes(1);
  });
});

