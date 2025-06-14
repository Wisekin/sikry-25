## 🤖 Agent Rules
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

## 🏗️ Code Quality Rules
IMPORTANT: These rules must be followed for all development work and must never be deleted:

1. **Detailed Planning**
   - Document architecture decisions
   - Define clear interfaces and types
   - Plan for error handling and edge cases
   - Consider performance implications

2. **Consistent Application of Design Patterns**
   - Follow established patterns in the codebase
   - Use appropriate design patterns (e.g., Repository, Factory, Strategy)
   - Maintain consistent code organization
   - Follow SOLID principles

3. **Structured Code Generation**
   - Even mock implementations should follow production-quality patterns
   - Use TypeScript types/interfaces for all data structures
   - Include JSDoc comments for complex logic
   - Follow consistent naming conventions

4. **Context-Aware Development**
   - Thoroughly understand existing codebase before making changes
   - Respect established patterns and conventions
   - Consider impact on other components/systems
   - Document integration points

5. **Iterative Refinement**
   - Implement in small, testable increments
   - Get feedback early and often
   - Refactor based on feedback and testing
   - Update documentation with changes

6. **Testing Strategy**
   - Write tests for new features
   - Include edge cases in test coverage
   - Document test scenarios
   - Maintain test data quality

# Modular Natural Language Search Feature Progress

This file tracks all progress, decisions, and implementation notes for the new modular search feature, until it is completed and summarized in `progress.md`.

---

## High-Level Plan
1. Integrate modular query parser (OpenAI or local, easily swappable)
2. Always check Supabase cache/database first
3. If not enough results, query at least one public/free registry (Companies House, Wikidata, OpenCorporates, etc.)
4. Add modular adapters for each data source
5. Merge results from all sources
6. Cache successful results in Supabase
7. Provide Google search fallback if no results
8. Handle all third-party failures gracefully
9. Add automated tests for external data integrations
10. Add analytics for search usage and user behavior
11. Implement granular quota system (per feature, per plan)
12. Document modular architecture for easy swapping of parser or data sources

---

## Progress Tracking

### In Progress 🚧
- [ ] Implement additional data source adapters (Wikidata, OpenCorporates)
- [ ] Enhance result deduplication and ranking
- [ ] Add Google search fallback
- [ ] Implement granular quota system
- [ ] Write comprehensive tests
- [ ] Document architecture and usage

### Completed ✅
- [x] Integrated modular query parser with OpenAI and fallback to local parser
- [x] Implemented Supabase cache/database check
- [x] Created Companies House adapter
- [x] Set up result merging from multiple sources
- [x] Connected frontend to real API endpoint
- [x] Added loading states and error handling
- [x] Basic search analytics tracking
- [x] Fixed UI issues in search results display

---

## Notes
- OpenAI API key is required for OpenAI integration, but the parser is modular and can be swapped for another provider or local parser if needed.
- All progress and implementation notes should be added here until the feature is complete.
