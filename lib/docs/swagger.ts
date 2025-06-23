export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "SIKRY Intelligence Platform API",
    version: "1.0.0",
    description: "Complete API documentation for the SIKRY platform",
    contact: {
      name: "SIKRY Support",
      email: "support@sikry.com",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/api/companies": {
      get: {
        summary: "List companies (discovered_companies)",
        tags: ["Companies"],
        description: "Retrieves a paginated list of discovered companies for the authenticated user's organization, with filtering and sorting options.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number for pagination." },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Number of items per page." },
          { name: "sort", in: "query", schema: { type: "string", default: "name" }, description: "Field to sort by (e.g., name, created_at)." },
          { name: "order", in: "query", schema: { type: "string", default: "asc", enum: ["asc", "desc"] }, description: "Sort order." },
          { name: "industry", in: "query", required: false, schema: { type: "string" }, description: "Filter by industry." },
          { name: "location", in: "query", required: false, schema: { type: "string" }, description: "Filter by location (text search)." },
          { name: "search", in: "query", required: false, schema: { type: "string" }, description: "Search term for company name, domain, or description." },
          { name: "size", in: "query", required: false, schema: { type: "string" }, description: "Filter by company size." },
        ],
        responses: {
          "200": {
            description: "A list of discovered companies.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/DiscoveredCompanyOutput" } },
                    success: { type: "boolean", example: true },
                    meta: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
        security: [{ bearerAuth: [] }],
      },
      post: {
        summary: "Create a new company (in discovered_companies)",
        tags: ["Companies"],
        description: "Creates a new company record in the 'discovered_companies' table for the authenticated user's organization.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCompanyInput" } } },
        },
        responses: {
          "201": {
            description: "Company created successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/DiscoveredCompanyOutput" }, // This returns the created discovered_company
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Company created successfully" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    "/api/companies/{id}": {
      get: {
        summary: "Get a company by ID (from 'companies' table)",
        tags: ["Companies"],
        description: "Retrieves details for a specific company by its ID, if it belongs to the authenticated user's organization.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "ID of the company to retrieve." }],
        responses: {
          "200": {
            description: "Details of the company.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/CompanyOutput" },
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" },
          "404": { $ref: "#/components/responses/NotFoundError" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
        security: [{ bearerAuth: [] }],
      },
      patch: {
        summary: "Update a company by ID (in 'companies' table)",
        tags: ["Companies"],
        description: "Updates details for a specific company by its ID, if it belongs to the authenticated user's organization.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "ID of the company to update." }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCompanyInput" } } },
        },
        responses: {
          "200": {
            description: "Company updated successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/CompanyOutput" },
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Company updated successfully" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" },
          "404": { $ref: "#/components/responses/NotFoundError" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
        security: [{ bearerAuth: [] }],
      },
      delete: {
        summary: "Delete a company by ID (from 'companies' table)",
        tags: ["Companies"],
        description: "Deletes a specific company by its ID, if it belongs to the authenticated user's organization.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "ID of the company to delete." }],
        responses: {
          "200": {
            description: "Company deleted successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Company deleted successfully" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" },
          "404": { $ref: "#/components/responses/NotFoundError" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    "/api/scrapers": {
      get: {
        summary: "List scrapers",
        tags: ["Scrapers"],
        responses: {
          "200": {
            description: "List of scrapers",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Scraper" },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      // Generic Error Response
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: { type: "object" }, // Zod's error.flatten().fieldErrors structure
        },
      },

      // Company Schemas
      CompanyOutput: { // What the API returns for a single company
        type: "object",
        // Based on src/types/company.d.ts and observed usage
        // This schema should represent the 'companies' table structure primarily for GET /api/companies/{id}
        // and the items in the array for GET /api/companies (which uses 'discovered_companies')
        // For simplicity, we'll define a comprehensive one.
        // Actual fields might differ slightly between 'companies' and 'discovered_companies'.
        properties: {
          id: { type: "string", format: "uuid" },
          organization_id: { type: "string", format: "uuid", description: "Identifier for the organization this company belongs to"},
          name: { type: "string" },
          domain: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
          industry: { type: "string", nullable: true },
          location_text: { type: "string", nullable: true, description: "Primary textual representation of location" },
          founded_year: { type: "integer", format: "int32", nullable: true },
          employee_count: { type: "integer", format: "int32", nullable: true },
          revenue_range: { type: "string", nullable: true },
          technologies_list: { type: "array", items: { type: "string" }, nullable: true },
          source_url: { type: "string", format: "url", nullable: true },
          confidence_score: { type: "number", format: "float", minimum: 0, maximum: 1, nullable: true },
          company_size: { type: "string", nullable: true, description: "e.g., startup, small, medium, large, enterprise or specific ranges like 1-10" }, // Could be enum if values are fixed
          location_structured: { type: "object", nullable: true, description: "Structured location data (e.g., city, country)"}, // Define further if structure is known
          financials_data: { type: "object", nullable: true, description: "Financial data"}, // Define further
          technology_profile: { type: "object", nullable: true, description: "Technology profile"}, // Define further
          social_media_profiles: { type: "object", nullable: true, description: "Social media links"}, // Define further
          company_status: { type: "string", nullable: true, example: "active" }, // Could be enum
          tags_list: { type: "array", items: { type: "string" }, nullable: true },
          internal_notes: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          // Fields from src/types/company.d.ts that might be part of 'companies' table
          size: { type: "string", enum: ["startup", "small", "medium", "large", "enterprise"], nullable: true },
          contacts: { type: "array", items: { type: "object" }, description: "Contact details (simplified for now)", nullable: true }, // Define Contact schema if needed
          insights: { type: "array", items: { type: "object" }, description: "Company insights (simplified for now)", nullable: true }, // Define Insight schema
          competitor_analysis: { type: "array", items: { type: "object" }, description: "Competitor analysis (simplified for now)", nullable: true }, // Define
        },
      },
      CreateCompanyInput: { // For POST /api/companies
        type: "object",
        required: ["name"],
        // Based on createCompanySchema in app/api/companies/route.ts
        properties: {
          name: { type: "string", minLength: 1, description: "Name of the company" },
          domain: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
          industry: { type: "string", nullable: true },
          location: { type: "string", nullable: true, description: "Corresponds to location_text" },
          founded_year: { type: "integer", format: "int32", minimum: 1, nullable: true },
          employee_count: { type: "integer", format: "int32", minimum: 1, nullable: true },
          revenue_range: { type: "string", nullable: true },
          technologies: { type: "array", items: { type: "string" }, nullable: true, description: "Corresponds to technologies_list" },
          source_url: { type: "string", format: "url", nullable: true },
          confidence_score: { type: "number", format: "float", minimum: 0, maximum: 1, nullable: true },
          company_size: { type: "string", nullable: true },
          location_structured: { type: "object", passthrough: true, nullable: true },
          financials: { type: "object", passthrough: true, nullable: true },
          technology_profile: { type: "object", passthrough: true, nullable: true },
          social: { type: "object", passthrough: true, nullable: true },
          tags: { type: "array", items: { type: "string" }, nullable: true, description: "Corresponds to tags_list" },
          notes: { type: "string", nullable: true, description: "Corresponds to internal_notes" },
        },
      },
      UpdateCompanyInput: { // For PATCH /api/companies/{id}
        type: "object",
        // Based on updateCompanySchema in app/api/companies/[id]/route.ts
        // All fields are optional
        properties: {
          name: { type: "string", minLength: 1, nullable: true },
          domain: { type: "string", nullable: true },
          industry: { type: "string", nullable: true },
          size: { type: "string", enum: ["startup", "small", "medium", "large", "enterprise"], nullable: true },
          location_text: { type: "string", nullable: true },
          financials: { type: "object", passthrough: true, nullable: true, properties: { revenue: { type: "number", nullable: true }, /* etc */ } },
          technology: { type: "object", passthrough: true, nullable: true, properties: { stack: { type: "array", items: {type: "string"}}, /* etc */ } },
          social: { type: "object", passthrough: true, nullable: true, properties: { linkedin: { type: "string", format: "url", nullable: true}, /* etc */ } },
          confidence: { type: "number", format: "float", minimum: 0, maximum: 1, nullable: true },
          tags: { type: "array", items: { type: "string" }, nullable: true },
          notes: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive", "prospect", "customer"], nullable: true },
          description: { type: "string", nullable: true },
          founded_year: { type: "integer", format: "int32", minimum: 1, nullable: true },
          employee_count: { type: "integer", format: "int32", minimum: 1, nullable: true },
          revenue_range: { type: "string", nullable: true },
          technologies_list: { type: "array", items: { type: "string" }, nullable: true },
          source_url: { type: "string", format: "url", nullable: true },
          company_size: { type: "string", nullable: true }, // from discovered_companies, maps to 'size'?
          location_structured: { type: "object", passthrough: true, nullable: true },
          financials_data: { type: "object", passthrough: true, nullable: true }, // from discovered_companies, maps to 'financials'?
          technology_profile: { type: "object", passthrough: true, nullable: true }, // from discovered_companies, maps to 'technology'?
          social_media_profiles: { type: "object", passthrough: true, nullable: true }, // from discovered_companies, maps to 'social'?
          internal_notes: { type: "string", nullable: true }, // from discovered_companies, maps to 'notes'?
        },
        // Note: .passthrough() from Zod means it could include other fields not defined,
        // OpenAPI spec should ideally list all possible fields or use additionalProperties: true/object
        additionalProperties: { type: "object" } // Or true, if any other field is allowed
      },
      DiscoveredCompanyOutput: { // For GET /api/companies, which returns discovered_companies
        allOf: [{ $ref: "#/components/schemas/CompanyOutput" }]
      },
      Scraper: { // Existing Scraper schema, ensure it's accurate
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          url: { type: "string" },
          config: { type: "object" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 100 },
          pages: { type: "integer", example: 10 },
          // The 'meta' object in GET /api/companies also includes 'hasMore'
          hasMore: { type: "boolean", example: true }
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Authentication information is missing or invalid.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Unauthorized", errors: [{code: "UNAUTHORIZED", message: "Authentication required"}] } } }
      },
      ForbiddenError: {
        description: "User is authenticated but does not have permission to perform this action.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Forbidden", errors: [{code: "FORBIDDEN", message: "You do not have permission to access this resource."}] } } }
      },
      NotFoundError: {
        description: "The requested resource was not found.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Resource not found", errors: [{code: "NOT_FOUND", message: "The requested resource could not be found."}] } } }
      },
      ValidationError: {
        description: "The request payload or parameters are invalid.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationErrorResponse" } } }
      },
      RateLimitError: {
        description: "Too many requests.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Too many requests", errors:[{code: "RATE_LIMIT_EXCEEDED", message: "You have exceeded the rate limit."}]} } },
        headers: {
          "X-RateLimit-Remaining": { schema: { type: "integer" }, description: "Requests remaining in the current window." },
          "X-RateLimit-Reset": { schema: { type: "string", format: "date-time" }, description: "Time when the rate limit window resets." }
        }
      },
      InternalServerError: {
        description: "An unexpected error occurred on the server.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { success: false, message: "Internal Server Error", errors:[{code: "INTERNAL_ERROR", message: "An unexpected error occurred."}]} } }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
}
