// Assuming ScrapedData structure might be similar to what intelligentScraping.ts produces
interface ScrapedData {
  [fieldName: string]: any;
}

export type ValidationRuleType =
  | 'required'
  | 'type'
  | 'minLength'
  | 'maxLength'
  | 'minValue'
  | 'maxValue'
  | 'pattern' // regex
  | 'enum' // value must be one of a predefined set
  | 'isURL'
  | 'isEmail';
  // TODO: Add more complex types like 'isDate', 'customFunction', 'aiCheck'

export interface ValidationRule {
  fieldName: string;
  type: ValidationRuleType;
  expectedType?: 'string' | 'number' | 'boolean' | 'array' | 'object'; // For 'type' rule
  value?: any; // For min/max length/value, regex pattern, enum array
  errorMessage?: string; // Custom error message for this rule
}

export interface FieldValidationResult {
  fieldName: string;
  isValid: boolean;
  checkedRules: number;
  passedRules: number;
  errors: string[]; // Messages for failed rules
  validatedValue?: any; // The value that was validated
}

export interface OverallValidationReport {
  overallIsValid: boolean;
  timestamp: string;
  fieldsChecked: number;
  fieldsValid: number;
  fieldsInvalid: number;
  resultsByField: FieldValidationResult[];
  summaryMessages?: string[]; // e.g., "All critical fields valid", "X fields failed validation"
}

// --- Validation Helper Functions ---

function validateRequired(value: any): boolean {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function validateType(value: any, expectedType: ValidationRule['expectedType']): boolean {
  if (value === undefined || value === null) return true; // Type check only applies if value exists; use 'required' for presence.
  switch (expectedType) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && !isNaN(value);
    case 'boolean': return typeof value === 'boolean';
    case 'array': return Array.isArray(value);
    case 'object': return typeof value === 'object' && !Array.isArray(value) && value !== null;
    default: return false; // Unknown expected type
  }
}

function validateMinLength(value: string | any[], minLength: number): boolean {
    if (typeof value === 'string' || Array.isArray(value)) {
        return value.length >= minLength;
    }
    return false; // Not applicable for other types
}

function validateMaxLength(value: string | any[], maxLength: number): boolean {
     if (typeof value === 'string' || Array.isArray(value)) {
        return value.length <= maxLength;
    }
    return false; // Not applicable for other types
}

function validateMinValue(value: number, minValue: number): boolean {
    if (typeof value === 'number') {
        return value >= minValue;
    }
    return false;
}

function validateMaxValue(value: number, maxValue: number): boolean {
    if (typeof value === 'number') {
        return value <= maxValue;
    }
    return false;
}

function validatePattern(value: string, pattern: RegExp): boolean {
    if (typeof value === 'string') {
        return pattern.test(value);
    }
    return false;
}

function validateEnum(value: any, allowedValues: any[]): boolean {
    return allowedValues.includes(value);
}

// Basic URL validation (can be improved with more robust regex or library)
function validateIsURL(value: string): boolean {
    if (typeof value !== 'string') return false;
    try {
        new URL(value); // Checks basic structure and protocol validity
        // More specific regex for common URL patterns if needed:
        // const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        // return urlPattern.test(value);
        return value.startsWith('http://') || value.startsWith('https://'); // Simple check
    } catch (_) {
        return false;
    }
}

// Basic email validation (can be improved with more robust regex)
function validateIsEmail(value: string): boolean {
    if (typeof value !== 'string') return false;
    // Simple regex, not RFC 5322 compliant but common for basic checks
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
}


/**
 * Validates scraped data based on a set of rules.
 *
 * @param scrapedData - The data object to validate.
 * @param rules - An array of validation rules to apply.
 * @returns An OverallValidationReport object.
 */
export function validateScrapedData(
  dataToValidate: ScrapedData,
  rules: ValidationRule[]
): OverallValidationReport {
  const report: OverallValidationReport = {
    overallIsValid: true,
    timestamp: new Date().toISOString(),
    fieldsChecked: 0,
    fieldsValid: 0,
    fieldsInvalid: 0,
    resultsByField: [],
    summaryMessages: [],
  };

  const rulesByField: Record<string, ValidationRule[]> = {};
  for (const rule of rules) {
    if (!rulesByField[rule.fieldName]) {
      rulesByField[rule.fieldName] = [];
    }
    rulesByField[rule.fieldName].push(rule);
  }

  const allFieldNamesFromRules = Object.keys(rulesByField);
  // One could also iterate over dataToValidate.keys() if rules are not exhaustive
  // or if some fields are validated by default (e.g. "all strings must be < X chars")

  report.fieldsChecked = allFieldNamesFromRules.length;

  for (const fieldName of allFieldNamesFromRules) {
    const fieldValue = dataToValidate[fieldName];
    const fieldRules = rulesByField[fieldName];
    const fieldResult: FieldValidationResult = {
      fieldName,
      isValid: true,
      checkedRules: fieldRules.length,
      passedRules: 0,
      errors: [],
      validatedValue: fieldValue,
    };

    for (const rule of fieldRules) {
      let rulePassed = false;
      let errorMsg = rule.errorMessage || `Validation failed for rule '${rule.type}'`;

      switch (rule.type) {
        case 'required':
          rulePassed = validateRequired(fieldValue);
          if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' is required.`;
          break;
        case 'type':
          rulePassed = validateType(fieldValue, rule.expectedType);
           if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must be of type ${rule.expectedType}. Found: ${typeof fieldValue}`;
          break;
        case 'minLength':
          rulePassed = validateMinLength(fieldValue, rule.value as number);
          if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must have a minimum length of ${rule.value}.`;
          break;
        case 'maxLength':
          rulePassed = validateMaxLength(fieldValue, rule.value as number);
          if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must have a maximum length of ${rule.value}.`;
          break;
        case 'minValue':
            rulePassed = validateMinValue(fieldValue, rule.value as number);
            if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must be at least ${rule.value}.`;
            break;
        case 'maxValue':
            rulePassed = validateMaxValue(fieldValue, rule.value as number);
            if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must be at most ${rule.value}.`;
            break;
        case 'pattern':
          // Ensure rule.value is a RegExp object if string is passed
          const regex = typeof rule.value === 'string' ? new RegExp(rule.value) : rule.value as RegExp;
          rulePassed = validatePattern(fieldValue, regex);
          if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' does not match pattern ${String(regex)}.`;
          break;
        case 'enum':
            rulePassed = validateEnum(fieldValue, rule.value as any[]);
            if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must be one of: ${(rule.value as any[]).join(', ')}.`;
            break;
        case 'isURL':
            rulePassed = validateIsURL(fieldValue);
            if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must be a valid URL.`;
            break;
        case 'isEmail':
            rulePassed = validateIsEmail(fieldValue);
            if (!rulePassed) errorMsg = rule.errorMessage || `Field '${fieldName}' must be a valid email address.`;
            break;
        default:
          console.warn(`[scrapingValidator] Unknown validation rule type: ${rule.type} for field ${fieldName}`);
          // Not counted as pass or fail for unknown rule, or treat as fail? For now, skip.
          continue;
      }

      if (rulePassed) {
        fieldResult.passedRules++;
      } else {
        fieldResult.isValid = false;
        fieldResult.errors.push(errorMsg);
      }
    }

    if (fieldResult.isValid) {
      report.fieldsValid++;
    } else {
      report.fieldsInvalid++;
      report.overallIsValid = false; // If any field is invalid, the overall report is invalid
    }
    report.resultsByField.push(fieldResult);
  }

  if (report.overallIsValid) {
    report.summaryMessages?.push("All fields passed validation.");
  } else {
    report.summaryMessages?.push(`${report.fieldsInvalid} field(s) failed validation.`);
  }

  console.log(`[scrapingValidator] Validation complete. Overall valid: ${report.overallIsValid}`);
  return report;
}


// Example Usage
async function testValidator() {
  if (process.env.NODE_ENV === 'development') {
    console.log('--- Testing Scraping Validator ---');
    const data: ScrapedData = {
      productName: "Awesome Gadget X1000",
      price: 49.99,
      stock: 150,
      description: "The best gadget ever, with amazing features.",
      contactEmail: "info@example.com",
      productUrl: "https://example.com/gadget-x1000",
      category: "Electronics",
      tags: ["gadget", "tech", "awesome"],
      isEnabled: true,
      notes: null, // To test required rule
      rating: 4.5,
    };

    const rules: ValidationRule[] = [
      { fieldName: 'productName', type: 'required' },
      { fieldName: 'productName', type: 'type', expectedType: 'string' },
      { fieldName: 'productName', type: 'minLength', value: 5 },
      { fieldName: 'productName', type: 'maxLength', value: 100 },
      { fieldName: 'price', type: 'required' },
      { fieldName: 'price', type: 'type', expectedType: 'number' },
      { fieldName: 'price', type: 'minValue', value: 0.01 },
      { fieldName: 'stock', type: 'type', expectedType: 'number' },
      { fieldName: 'stock', type: 'minValue', value: 0 },
      { fieldName: 'description', type: 'maxLength', value: 500 },
      { fieldName: 'contactEmail', type: 'required' },
      { fieldName: 'contactEmail', type: 'isEmail' },
      { fieldName: 'productUrl', type: 'isURL' },
      { fieldName: 'category', type: 'enum', value: ["Electronics", "Books", "Home Goods"] },
      { fieldName: 'tags', type: 'type', expectedType: 'array' },
      { fieldName: 'tags', type: 'minLength', value: 1, errorMessage: "At least one tag is required." }, // Min length for array
      { fieldName: 'isEnabled', type: 'type', expectedType: 'boolean' },
      { fieldName: 'notes', type: 'required', errorMessage: "Notes field cannot be empty or null." }, // This will fail
      { fieldName: 'rating', type: 'pattern', value: /^[1-5](\.\d)?$/, errorMessage: "Rating must be between 1-5 with one decimal place max."} // Example: 4 or 4.5
    ];

    const report = validateScrapedData(data, rules);
    // console.log('Validation Report:', JSON.stringify(report, null, 2));
    // report.resultsByField.forEach(field => {
    //     if (!field.isValid) {
    //         console.log(`Field ${field.fieldName} errors: ${field.errors.join(', ')}`);
    //     }
    // })
  }
}

// testValidator(); // Uncomment to run

// Future Considerations:
// 1. AI-based Validation: Use AI to check for semantic correctness, sentiment, plausibility (e.g., "is this a reasonable description for a product?").
// 2. Schema-based Validation: Integrate with JSON Schema or similar schema definition languages (e.g., Zod, Yup).
// 3. Custom Validation Functions: Allow users to provide their own JavaScript functions for complex validation logic.
// 4. Conditional Validation: Rules that only apply if another field has a certain value.
// 5. Asynchronous Rules: Support for rules that might need to make external calls (e.g., check if a URL is live, validate against an external API).
// 6. Data Cleaning/Transformation: Optionally clean or transform data that passes validation (e.g., trim strings, format dates). (Could be a separate service).
// 7. Severity Levels for Rules: Differentiate between critical errors and warnings.
// 8. Internationalization (i18n) for error messages.
// 9. More Robust Type Checking: Handle edge cases for type coercion more gracefully if needed.
// 10. Performance: For very large datasets or many rules, optimize the validation loop.
// 11. Integration: How this validator is invoked by `intelligentScraping` or `scrapingOrchestrator`, and how its report influences overall success/failure.
// 12. Versioning of validation rule sets or schemas.
// 13. More specific validation types: `isDate`, `isCreditCard` (with PCI considerations), `isPhoneNumber` (with regional formats).
// 14. Allow rules to be defined per scraper config or globally.
// 15. The `validateType` for 'object' could be more specific (e.g. checking for specific properties if a sub-schema is defined).
// 16. For `pattern` rule, ensure `rule.value` is handled correctly whether it's a string or a RegExp object (currently attempts to cast string to RegExp).
I have created `lib/services/scrapingValidator.ts`.

This service includes:
*   **TypeScript Interfaces:**
    *   `ScrapedData`: A generic interface for the data to be validated.
    *   `ValidationRuleType`: An enum-like type defining various validation checks (e.g., `required`, `type`, `minLength`, `maxLength`, `pattern`, `isURL`, `isEmail`).
    *   `ValidationRule`: Defines the structure for a single validation rule, including `fieldName`, `type`, `expectedType` (for type checks), `value` (for rule parameters like min/max length, regex pattern, enum values), and an optional custom `errorMessage`.
    *   `FieldValidationResult`: Contains the outcome of validation for a single field, including its validity, errors, and counts of checked/passed rules.
    *   `OverallValidationReport`: The comprehensive report, including overall validity, counts of fields checked/valid/invalid, results for each field, and summary messages.
*   **Validation Helper Functions:**
    *   A suite of private helper functions, each responsible for a specific `ValidationRuleType` (e.g., `validateRequired`, `validateType`, `validateMinLength`, `validatePattern`, `validateIsURL`, `validateIsEmail`). These functions encapsulate the core logic for each check.
*   **Core Function `validateScrapedData`:**
    *   Takes the `dataToValidate` (a `ScrapedData` object) and an array of `ValidationRule` objects.
    *   Organizes rules by field name.
    *   Iterates through each field that has rules defined:
        *   Applies all relevant rules to the field's value.
        *   Collects errors and determines if the field is valid.
    *   Aggregates results into an `OverallValidationReport`.
    *   Sets `overallIsValid` to `false` if any field fails validation.
*   **Example Usage:**
    *   A commented-out `testValidator` function demonstrates how to use `validateScrapedData` with sample data and a set of diverse validation rules, including checks for required fields, types, lengths, patterns, enums, URL, and email formats.
*   **Future Considerations:**
    *   A detailed list of potential enhancements, such as AI-based validation, integration with schema definition languages (like JSON Schema, Zod, Yup), custom validation functions, conditional validation, asynchronous rules, data cleaning/transformation capabilities, and severity levels for rules.

This service provides a flexible and extensible way to define and apply validation rules to scraped data, helping to ensure data quality and integrity. It can be integrated into the scraping workflow by `scrapingOrchestrator.ts` or used by `intelligentScraping.ts` after data extraction. This completes step 13.
