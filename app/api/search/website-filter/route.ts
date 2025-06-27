import { NextRequest, NextResponse } from 'next/server';

// Define the structure for a company object that this route expects
interface CompanyInput {
  id: string | number;
  name: string;
  website?: string | null; // Website URL can be optional or null
  // Add other company properties as needed
  [key: string]: any; // Allow other properties
}

// Define the structure for the request body
interface RequestBody {
  companies?: CompanyInput[];
}

// Define the structure for the response body
interface ResponseBody {
  filteredCompanies?: CompanyInput[];
  error?: string;
  message?: string;
}

// Function to validate if a URL is a valid HTTPS URL
function isValidHttpsUrl(url?: string | null): boolean {
  if (!url) {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { companies } = body;

    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json({ error: 'Invalid request: "companies" array is required.' }, { status: 400 });
    }

    if (companies.length === 0) {
      return NextResponse.json({ message: 'No companies provided to filter.', filteredCompanies: [] }, { status: 200 });
    }

    const filteredCompanies = companies.filter(company => isValidHttpsUrl(company.website));

    return NextResponse.json({ filteredCompanies }, { status: 200 });

  } catch (error) {
    console.error('Error in website-filter route:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'This endpoint expects a POST request with a list of companies to filter.' }, { status: 405 });
}

// Future considerations:
// 1. More sophisticated URL validation (e.g., checking for valid domain names, although HTTPS check is primary here).
// 2. Handling of common variations (e.g., if a URL is missing "www." but is otherwise valid).
// 3. Batching or pagination if the list of companies can be very large.
// 4. Logging of filtering activity.
// 5. Allow customization of filtering criteria (e.g., include HTTP if specifically allowed).
