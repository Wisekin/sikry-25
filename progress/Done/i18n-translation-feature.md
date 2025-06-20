## 🤖 Agent Rules
- **File System Integrity**: NEVER remove a page or file without explicit permission from the user.
- **Avoid Duplication**: ALWAYS verify that a file or page does not already exist before creating a new one.
IMPORTANT: These rules must never be deleted and must be referenced before any action:
1. Always verify file existence before creation using appropriate tools
2. Update this progress file after EVERY significant change:
   - Move completed items to "Completed ✅" section
   - Add new tasks to "Next Steps 📝" section
   - Update "In Progress 🚧" with current tasks
3. Each update must maintain clear tracking of:
   - What was just completed
   - What is currently being worked on
   - What should be done next
4. Never remove completed items - they serve as implementation history

## i18n Translation Feature Progress

### Completed Tasks ✅
- Created i18n configuration with English and French support
- Set up translation files for comms submodule
- Created translation files for bulk-sender component
- Fixed import paths and directory structure
- Updated SidebarNav component to use i18next
- Created common translation files for navigation items
- Moved components directory to src directory
- Created UI components (Button, Card) in src/components/ui
- Updated LanguageSelector to use react-i18next
- Created dropdown-menu component
- Updated SecondaryMenuBar to use react-i18next
- Created tabs component
- Added translations for secondary menu items
- Created all missing translation files in en-GB locale:
  - common.json
  - companiesPage.json
  - analyticsOverviewPage.json
  - performanceAnalyticsPage.json
  - revenueAnalyticsPage.json
  - conversionAnalyticsPage.json
  - adminUsersPage.json
  - adminBillingPage.json
  - adminSecurityPage.json
  - adminCompliancePage.json
  - adminAntiSpamPage.json
  - adminTeamPage.json
  - leadResponse/queuePage.json
  - leadResponse/analyticsPage.json
- Fixed import paths for mockApiUtils in all API route files
- Aligned client-side and server-side i18n configuration
- Resolved React context errors in analytics page
- Standardized i18n setup across the application
- **Resolved Final Bugs (June 2025)**:
  - Fixed persistent JSON syntax errors in `public/locales/en/common.json` and `public/locales/fr/common.json` that caused API route failures.
  - Patched the dynamic API route at `app/api/locales/add/[...params]/route.ts` to be compatible with Next.js 15, resolving the `params.params` error by updating the function signature to correctly destructure params: `({ params: { params } })`.
- Updated search page with comprehensive i18n support
  - Added searchPage namespace configuration
  - Implemented French translations for search UI
  - Added dynamic content translation support
  - Updated filter system with translations
  - Implemented grid/list view translations
- Added detailed search page translation examples to documentation
- Updated i18n implementation guide with real-world examples
- Added search-specific best practices to documentation

### Review Summary
The i18n translation feature has been successfully implemented with the following components:
1. i18next configuration in `src/i18n/config.ts` and `config.client.js`
2. Translation files in `public/locales/` with proper namespace structure
3. Updated components to use react-i18next with proper hooks
4. Proper directory structure with src-based imports
5. Common translations for navigation items and UI components
6. UI components using shadcn/ui style with i18n support
7. Language switching functionality with persistence
8. Secondary menu bar with translations
9. Complete set of translation files for all major sections
10. Fixed API route imports and configuration
11. Resolved React context issues in analytics pages

### Technical Notes for Next Agent
1. i18n Setup:
   - Configuration is in `src/i18n/config.ts`
   - Translation files are in `public/locales/{lang}/`
   - Using react-i18next for translations
   - Namespaces: 'common', 'commsPage', 'bulkSender', and all page-specific namespaces

### Implementation Details

#### Key Files
- `src/providers/TranslationProvider.tsx`: Main i18n provider component
- `src/i18n/config.ts`: i18n configuration with language settings
- `public/locales/en-GB/`: English translation files
- `public/locales/fr/`: French translation files (in progress)

#### Adding New Translations
1. Add keys to both English and French JSON files
2. Use appropriate namespaces:
   - `common` for shared translations
   - Page-specific namespaces (e.g., `companiesPage`)
   - Module-specific namespaces (e.g., `commsBulkSenderPage`)
3. Follow key naming conventions:
   - Use camelCase
   - Group related keys together
   - Use dot notation for nested structures

#### Best Practices
1. Always use translation keys in components:
   ```tsx
   const { t } = useTranslation('common');
   <div>{t('welcomeMessage')}</div>
   ```

2. For dynamic content:
   ```tsx
   t('user.greeting', { name: userName })
   ```

3. For pluralization:
   ```json
   {
     "itemCount": "{{count}} item",
     "itemCount_plural": "{{count}} items"
   }
   ```

#### Testing Guidelines
1. Verify all pages in both languages
2. Test language switching
3. Check for missing translations
4. Verify dynamic content
5. Test with different screen sizes
6. Check RTL support if applicable

### Common Issues and Solutions

4. **API Route Failures & Next.js 15 `params` Error**:
   - **Symptom**: The app experiences `500 Internal Server Error` on `POST` requests to `/api/locales/add/...`, and the server logs show `JSON.parse` errors and/or `Error: Route ... used \`params.params\``.
   - **Cause 1 (JSON Errors)**: Translation files (`.json`) contain syntax errors like trailing characters or missing commas. The API route fails when it cannot parse these files.
   - **Fix 1**: Manually inspect and clean the JSON files to ensure they are syntactically valid.
   - **Cause 2 (Next.js 15)**: A change in Next.js 15 requires a different syntax for accessing dynamic parameters in API routes.
   - **Fix 2**: Update the `POST` function signature in the dynamic API route (`app/api/locales/add/[...params]/route.ts`) to use nested destructuring: `export async function POST(request: Request, { params: { params } }: { params: { params: [string, string] } })`. This correctly extracts the `params` array.
1. **Missing Translations**:
   - Check that the key exists in both language files
   - Verify the namespace is correctly specified
   - Check for typos in the key names

2. **Translation Not Updating**:
   - Clear browser cache
   - Check for caching headers
   - Verify the translation file is being loaded

3. **Incorrect Language**:
   - Check browser language settings
   - Verify localStorage value for 'i18nextLng'
   - Check the fallback language configuration

### Next Steps 📝
1. **Extend Search Page Translations**:
   - Add translations for company card details
   - Implement translations for advanced filter options
   - Add tooltips and helper text translations

2. **Testing and Verification**:
   - Test search functionality with both languages
   - Verify all dynamic content translations
   - Test filter system in French
   - Validate error messages in both languages

3. **Documentation**:
   - Add search-specific translation patterns
   - Document filter system translation approach
   - Add examples for dynamic content handling

---

# Internationalization (i18n) Guide

This document outlines the process for adding and managing translations in this project using `i18next`.

## 1. Project Structure

- **`src/i18n/config.ts`**: The main configuration file for i18next. It defines supported languages, namespaces, and backend settings.
- **`public/locales/{lng}/{ns}.json`**: The directory containing all translation files. Each language has its own folder (`en`, `fr`, etc.), which contains JSON files for each namespace.
- **`src/app/i18n.ts`**: The server-side setup for i18next, used for server components.

## 2. Namespaces

Namespaces are used to organize translations into logical groups, typically by page or feature. This helps in managing translations and loading them only when needed.

**Current Namespaces:**
- `common`: Shared translations used across the application (e.g., navigation, buttons).
- `reviews`: Translations for the reviews feature.
- `searchPage`: Translations for the search page.
- `statisticsPage`: Translations for the statistics page.
- `analyticsDashboard`: Translations for the main analytics dashboard.
- ...and others as defined in `src/i18n/config.ts`.

When adding translations for a new feature, consider creating a new namespace to keep the files organized.

## 3. Adding New Translations

Follow these steps to add a new translation:

1.  **Identify Hardcoded Text**: Find any text in the UI that needs to be translated.

2.  **Add Keys to Translation Files**:
    -   Add a new key to the appropriate English namespace file (e.g., `public/locales/en/common.json`).
    -   Add the same key with the French translation to the corresponding French file (e.g., `public/locales/fr/common.json`).

    *Example:*
    ```json
    // public/locales/en/common.json
    {
      "buttons": {
        "save": "Save"
      }
    }

    // public/locales/fr/common.json
    {
      "buttons": {
        "save": "Enregistrer"
      }
    }
    ```

3.  **Use the `useTranslation` Hook**: In your component, import and use the `useTranslation` hook, specifying the namespace(s) you need.

    ```javascript
    import { useTranslation } from 'react-i18next';

    const { t } = useTranslation('common');
    ```

4.  **Translate the Text**: Use the `t()` function to access your translation key.

    ```javascript
    <button>{t('buttons.save')}</button>
    ```

## 4. Pluralization

i18next can automatically handle plural forms based on a `count` variable.

-   **`_one`**: For a count of 1.
-   **`_other`**: For all other counts (including 0).

*Example:*
```json
// common.json
"showingResults_one": "Showing 1 result",
"showingResults_other": "Showing {{count}} results"
```

```javascript
// In your component
t('showingResults', { count: filteredCompanies.length });
```

## 5. Interpolation

To include dynamic values in your translations, use double curly braces `{{variable}}`.

*Example:*
```json
// common.json
"welcomeMessage": "Welcome, {{username}}!"
```

```javascript
// In your component
t('welcomeMessage', { username: 'Alex' });
```

## 6. Missing Key Helper

During development (`NODE_ENV=development`), the application is configured to automatically add missing translation keys to your backend via a `POST` request to `/locales/add/{lng}/{ns}`. This is helpful for quickly adding new keys, but you should always verify and commit the changes to the JSON files.

# i18n Translation Implementation Guide

## Recent Updates (June 2025)
- Added comprehensive search page translations
- Implemented namespace-specific translation handling
- Updated translation process documentation
- Added detailed step-by-step implementation guide

## Implementation Process

### 1. Setup Translation Files
1. Create language-specific JSON files in `/public/locales/{lang}/{namespace}.json`
2. Add translations with nested structure for organization
3. Include both languages (English and French) for each key

Example structure:
```json
{
  "companySearch": {
    "title": "Company Search",
    "filters": {
      "allIndustries": "All Industries",
      "location": "Location"
    }
  }
}
```

### 2. Configure i18n
1. Add namespace to `src/i18n/config.ts`:
```typescript
ns: [
  'common',
  'searchPage',
  // other namespaces...
]
```

2. Set up language detection and fallbacks:
```typescript
supportedLngs: ['en', 'fr'],
fallbackLng: 'en',
```

### 3. Implement in Components
1. Import and initialize:
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation(['searchPage', 'common']);
```

2. Use translations with namespace:
```typescript
{t('companySearch.title', { ns: 'searchPage' })}
```

3. Handle dynamic content:
```typescript
{loading 
  ? t('searching', { ns: 'searchPage' }) 
  : `${count} ${t('results.found', { ns: 'searchPage' })}`
}
```

### 4. Best Practices
- Use namespace parameter for clarity: `{ ns: 'searchPage' }`
- Group related translations in nested objects
- Provide fallback text: `t('key', 'Fallback text')`
- Use variables for dynamic content: `t('welcome', { name })`

### 5. Testing Process
1. Test language switching
2. Verify all translations appear
3. Check dynamic content
4. Test fallback behavior
5. Verify nested translations

## Implementation Examples

### Search Page Implementation
Here's a real-world example from our search page implementation:

1. **Translation File Structure**
```json
// public/locales/en/searchPage.json
{
  "companySearch": {
    "title": "Company Search",
    "filters": {
      "allIndustries": "All Industries",
      "location": "Location",
      "confidenceScore": "Minimum Confidence"
    }
  },
  "results": {
    "found": "results found",
    "noResults": {
      "title": "No Results Found",
      "suggestion": "Try adjusting your filters or search terms for a better match."
    }
  }
}
```

2. **Component Implementation**
```typescript
function SearchContent() {
  const { t } = useTranslation(['searchPage', 'common']);
  
  return (
    <div>
      <h1>{t('companySearch.title', { ns: 'searchPage' })}</h1>
      {loading 
        ? t('searching', { ns: 'searchPage' }) 
        : `${count} ${t('results.found', { ns: 'searchPage' })}`
      }
    </div>
  );
}
```

3. **Dynamic Content**
```typescript
// Filter states with translations
const [filters, setFilters] = useState({
  industry: t('filters.allIndustries'),
  location: "",
  employeeCount: "All Sizes",
  confidenceScore: 70
});

// Clear filters with translation
const handleClearFilters = () => {
  setFilters({
    industry: t('filters.allIndustries'),
    location: "",
    employeeCount: "All Sizes",
    confidenceScore: 70
  });
};
```

### Best Practices from Search Implementation
1. **Namespace Organization**
   - Keep search-related translations in dedicated namespace
   - Use nested structure for related items (filters, results, etc.)
   - Include fallback text in t() calls

2. **Dynamic Content Handling**
   - Use template literals for combining translations with variables
   - Handle loading states with appropriate translations
   - Provide translations for error states

3. **State Management**
   - Initialize state with translations
   - Update translations when language changes
   - Handle filter resets with proper translations

## Directory Structure
```
public/
  locales/
    en/
      common.json
      searchPage.json
      [other namespaces].json
    fr/
      common.json
      searchPage.json
      [other namespaces].json
src/
  i18n/
    config.ts
    config.client.js
```

## Common Issues & Solutions
1. **Missing Translation**
   - Verify key exists in both language files
   - Check namespace is correctly specified
   - Confirm namespace is included in useTranslation call

2. **Translation Not Updating**
   - Verify language switching is working
   - Check browser localStorage for 'i18nextLng'
   - Clear cache and reload

3. **Dynamic Content Issues**
   - Use proper interpolation syntax: {{variable}}
   - Pass variables in t() call options
   - Check for nested key access

## Notes for Developers
- Always use namespace parameter for clarity
- Keep translation files organized and structured
- Test both languages when adding new features
- Use TypeScript for better type checking of translation keys

### In Progress 🚧
- Creating French translations for new pages
- Testing translation functionality
- Verifying all translation keys

### Blockers 
- None

### Current Status
- ✅ Basic i18n setup complete
- ✅ Directory structure organized
- ✅ Common translations added
- ✅ All English translation files created
- ✅ Components updated to use i18next
- ✅ Fixed all import paths and configuration issues
- ✅ Resolved React context errors
- ✅ Verified translation loading and language switching
- ⏳ French translations in progress
- ⏳ Comprehensive testing of all translations
- ⏳ Documentation updates

# i18n Translation Feature Implementation

## Overview
This document outlines the implementation of internationalization (i18n) in our application, focusing on the translation of various pages and components.

## Translation Files Structure
Translations are organized by feature in the `public/locales` directory:
```
public/locales/
├── en/
│   ├── common.json
│   ├── scrapersPage.json
│   ├── marketIntelPage.json
│   ├── collectionTrendsPage.json
│   ├── geographicDistributionPage.json
│   ├── sectorDistributionPage.json
│   └── sourceComparisonPage.json
└── fr/
    ├── common.json
    ├── scrapersPage.json
    ├── marketIntelPage.json
    ├── collectionTrendsPage.json
    ├── geographicDistributionPage.json
    ├── sectorDistributionPage.json
    └── sourceComparisonPage.json
```

## Translation Process
To add translations for a new page or component, follow these steps:

1. **Create Translation Files**
   - Create JSON files for each supported language in `public/locales/{lang}/`
   - Name the file according to the feature/page (e.g., `scrapersPage.json`)
   - Structure the translations in a logical hierarchy

2. **Update i18n Configuration**
   - Add the new namespace to the i18n configuration in `i18n.ts`
   - Example:
     ```typescript
     {
       defaultNS: 'common',
       ns: ['common', 'scrapersPage', 'marketIntelPage', ...],
     }
     ```

3. **Implement Translations in Components**
   - Import the `useTranslation` hook:
     ```typescript
     import { useTranslation } from 'react-i18next';
     ```
   - Initialize the hook with required namespaces:
     ```typescript
     const { t } = useTranslation(['pageNamespace', 'common']);
     ```
   - Replace hardcoded strings with translation keys:
     ```typescript
     // Before
     <h1>Page Title</h1>
     
     // After
     <h1>{t('title')}</h1>
     ```

4. **Handle Dynamic Content**
   - Use interpolation for dynamic values:
     ```typescript
     t('metrics.value', { count: 42 })
     ```
   - Use pluralization when needed:
     ```typescript
     t('items', { count: 5 }) // Will use the plural form
     ```

5. **Testing Translations**
   - Test the component in both languages
   - Verify all strings are properly translated
   - Check dynamic content and pluralization
   - Ensure proper fallback behavior

## Best Practices
1. **Organization**
   - Keep translations organized by feature/page
   - Use consistent naming conventions
   - Maintain a clear hierarchy in translation files

2. **Keys**
   - Use descriptive, hierarchical keys
   - Follow a consistent pattern (e.g., `section.subsection.key`)
   - Avoid duplicate keys across namespaces

3. **Content**
   - Keep translations concise and clear
   - Consider cultural differences
   - Maintain consistent terminology

4. **Maintenance**
   - Regularly review and update translations
   - Document any special translation requirements
   - Keep translation files in sync with code changes

## Example Translation File Structure
```json
{
  "title": "Page Title",
  "subtitle": "Page description",
  "metrics": {
    "total": {
      "title": "Total Items",
      "value": "{{count}} items"
    }
  },
  "filters": {
    "label": "Filter by",
    "options": {
      "all": "All",
      "active": "Active"
    }
  }
}
```

## Common Issues and Solutions
1. **Missing Translations**
   - Check if the namespace is properly configured
   - Verify the translation key exists in the file
   - Ensure the language file is properly loaded

2. **Dynamic Content Not Updating**
   - Verify interpolation syntax
   - Check if the value is being passed correctly
   - Ensure the translation key supports interpolation

3. **Pluralization Issues**
   - Check if the language supports the required plural forms
   - Verify the pluralization syntax
   - Test with different count values

## Resources
- [i18next Documentation](https://www.i18next.com/)
- [React-i18next Documentation](https://react.i18next.com/)
- [Language Codes Reference](https://www.loc.gov/standards/iso639-2/php/code_list.php)