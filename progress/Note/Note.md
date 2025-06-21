Public Sources Queried: The search queries three sources:
Your internal Supabase database (discovered_companies).
Companies House: An official UK government registry of companies.
Wikidata: A free and open knowledge base.



No Wikipedia: I can confirm that Wikipedia is not currently one of the data sources, so you don't need to worry about a missing API key for it.
Result Limitation: The API has a limit parameter that defaults to 10 results per page, which is why you are likely seeing a small number of results. This is expected behavior for pagination. The frontend controls how many results to request per page.