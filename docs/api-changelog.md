# API Changelog

All notable changes to this API will be documented in this file.

## [Unreleased] - YYYY-MM-DD

### Added
- **Redis Caching for Company Endpoints**:
  - `GET /api/companies`: Implemented Redis caching for list of companies.
  - `GET /api/companies/{id}`: Implemented Redis caching for individual company details.
- **Cache Invalidation for Company Endpoints**:
  - `POST /api/companies`: Added cache invalidation for company lists.
  - `PATCH /api/companies/{id}`: Added cache invalidation for individual company and company lists.
  - `DELETE /api/companies/{id}`: Added cache invalidation for individual company and company lists.
- **Comprehensive Rate Limiting**:
  - Applied rate limiting to most API endpoints via middleware (`middleware.ts`).
  - Specific rate limiters for `/api/auth`, `/api/scrapers`, and general API routes.
  - `/api/search` continues to use its dedicated `DbRateLimiter`.
  - `/api/docs` is excluded from rate limiting.
- **Request Validation for Company Endpoints**:
  - `POST /api/companies`: Added Zod-based request body validation.
  - `PATCH /api/companies/{id}`: Added Zod-based request body validation.
- **API Documentation Enhancements for Company Endpoints**:
  - Updated OpenAPI specification (`lib/docs/swagger.ts`) for `GET, POST /api/companies` and `GET, PATCH, DELETE /api/companies/{id}`.
  - Included detailed request/response schemas, parameters, and error codes.
  - Added reusable response components for standard errors.

### Changed
- **Cache Key Generation**:
  - Updated `lib/redis.ts` with a more generic `generateCacheKey(prefix, params)` function.
  - Company-specific cache keys now include `organizationId` for better namespacing.
- **Middleware Configuration**:
  - Modified `middleware.ts` matcher to include `/api` routes for processing by rate limiters and auth.
- **API Documentation Schemas**:
  - Refined `CompanyOutput`, `CreateCompanyInput`, `UpdateCompanyInput`, `DiscoveredCompanyOutput`, `Pagination` schemas in `lib/docs/swagger.ts`.

### Security
- **Authentication & Authorization Audit for Company Endpoints**:
  - `GET, PATCH, DELETE /api/companies/{id}`: Added mandatory authentication checks and organization-based data scoping.
  - Ensured 401/403 responses for unauthorized/forbidden access.

### Fixed
- Corrected potential for unauthenticated access to `/api/companies/{id}` endpoints.

---

*Older changes to be documented here as the API evolves.*
