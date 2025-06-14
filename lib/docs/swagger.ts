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
        summary: "List companies",
        tags: ["Companies"],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "industry",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "List of companies",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Company" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create company",
        tags: ["Companies"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCompany" },
            },
          },
        },
        responses: {
          "201": {
            description: "Company created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Company" },
              },
            },
          },
        },
      },
    },
    "/api/companies/{id}": {
      get: {
        summary: "Get company by ID",
        tags: ["Companies"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Company details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Company" },
              },
            },
          },
        },
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
      Company: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          domain: { type: "string" },
          industry: { type: "string" },
          size: { type: "string" },
          location: { type: "object" },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
          status: { type: "string", enum: ["active", "inactive", "pending"] },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      CreateCompany: {
        type: "object",
        required: ["name", "domain"],
        properties: {
          name: { type: "string" },
          domain: { type: "string" },
          industry: { type: "string" },
          size: { type: "string" },
          location: { type: "object" },
        },
      },
      Scraper: {
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
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          pages: { type: "integer" },
        },
      },
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
