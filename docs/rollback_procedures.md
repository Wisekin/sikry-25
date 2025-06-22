# Rollback Procedures

This document outlines procedures for rolling back application deployments and database migrations. Rollbacks are critical for recovering from failed deployments or unintended consequences of changes.

## 1. Principles for Rollback

- **Preparation is Key:** Before any significant deployment, ensure you have a tested rollback plan.
- **Communication:** Inform stakeholders about any rollback decision and its progress.
- **Monitoring:** After a rollback, closely monitor system stability and functionality.
- **Post-Mortem:** After a successful rollback (and resolution of the issue), conduct a post-mortem to understand the cause of failure and improve processes.

## 2. Application Code Rollback

Application code rollbacks typically involve redeploying a previous, stable version of the application. The exact steps depend on your deployment platform (e.g., Vercel, Docker, traditional servers).

### 2.1. Using Git and Deployment Platform (e.g., Vercel, Netlify, AWS Amplify)

Most modern deployment platforms integrated with Git offer straightforward rollback capabilities:

- **Identify Stable Commit:** Determine the Git commit hash of the last known stable version. This can be found in your Git history (`git log`) or deployment platform's dashboard.
- **Platform-Specific Rollback:**
    - **Vercel:** In the Vercel dashboard, navigate to your project's "Deployments" tab. You can typically find previous deployments and instantly "Promote to Production" an older, stable deployment.
    - **Netlify:** Similar to Vercel, Netlify's "Deploys" section allows you to select a previous successful deploy and "Publish deploy."
    - **AWS Amplify/Azure DevOps/Google Cloud Build:** These platforms usually have a history of builds/releases. You can often redeploy a specific older build version.
- **Manual Git Revert and Redeploy (If direct platform rollback isn't feasible/desired):**
    1. **Revert Commit (Optional but Recommended for history):**
       ```bash
       # Create a new commit that undoes the changes from the problematic commit(s)
       git revert <problematic-commit-hash>
       git push origin <your-branch>
       ```
       This creates a new commit that reverses the changes, keeping the history clean.
    2. **Reset to Stable Commit (Use with caution, rewrites history):**
       ```bash
       # Or, to go back to a specific commit and discard subsequent ones on this branch
       git reset --hard <stable-commit-hash>
       git push origin <your-branch> --force # Force push is required
       ```
       **Caution:** Force pushing can be disruptive if others are working on the same branch.
    3. **Trigger Deployment:** The push to the relevant branch should trigger an automated deployment via your CI/CD pipeline.

### 2.2. Dockerized Deployments (e.g., Kubernetes, ECS)

- **Image Tagging:** Ensure your Docker images are tagged with versions (e.g., Git commit hash or semantic version).
- **Rollback:**
    - Update your deployment configuration (e.g., Kubernetes Deployment YAML, ECS Task Definition) to use the image tag of the last known stable version.
    - Apply the updated configuration: `kubectl apply -f deployment.yaml` or update the ECS service.
    - Kubernetes also offers native rollback commands: `kubectl rollout undo deployment/<deployment-name>`

## 3. Database Migration Rollback

Rolling back database migrations is often more complex and riskier than code rollbacks, especially if data has been modified or new data depends on the migrated schema.

### 3.1. Strategy

- **Preventative Measures:**
    - **Backup Before Migrating:** Always back up the database before applying significant migrations, especially in production (`docs/backup.md`).
    - **Test Migrations Thoroughly:** Test migrations in staging environments.
    - **Write Reversible Migrations:** Whenever possible, write "down" migrations that can undo the changes made by an "up" migration. Supabase CLI (`supabase migration new --name your_migration`) and other tools support this.
- **Rollback Options (Order of Preference):**
    1. **Apply "Down" Migration:** If your migration tool supports down migrations and you have one for the problematic migration:
       ```bash
       # Example for Supabase CLI (if it were managing these migrations)
       # supabase migration down --version <migration-version-to-revert>
       # Or if npm scripts are set up for a tool like node-pg-migrate:
       # npm run migrate:down
       ```
       Consult your specific migration tool's documentation. The current project structure (`database/migrations/`) suggests a tool like Supabase CLI or a compatible one is intended.
    2. **Restore from Backup:** This is the safest option if a down migration is not possible or too risky, or if data corruption has occurred.
        - This will result in data loss since the last backup.
        - Follow procedures in `docs/backup.md` for restoring (e.g., using Supabase dashboard PITR or `pg_restore`).
    3. **Manual Reversal (High Risk):**
        - Manually write and apply SQL scripts to reverse the schema changes (e.g., `DROP TABLE`, `ALTER TABLE DROP COLUMN`).
        - This is highly risky, error-prone, and should only be done by experienced personnel with a deep understanding of the changes and potential data impact.
        - **Example:** If a migration added a column, a manual reversal might be `ALTER TABLE your_table DROP COLUMN your_column;`.

### 3.2. Current Project (`database/migrations/`)

- The scripts `001_...sql`, `002_...sql`, `003_...sql` are "up" migrations.
- **To enable robust rollback for these, corresponding "down" migrations should be created.** These are typically managed by the migration tool (e.g., Supabase CLI would create a new migration file for the down part, or some tools expect `up` and `down` SQL in the same file or separate `up`/`down` folders).
- **Example "Down" Migration Content for `001_add_discovery_tables.sql`:**
  ```sql
  -- Down migration for 001_add_discovery_tables.sql
  DROP TABLE IF EXISTS discovery_requests;
  ```
- **Example "Down" Migration Content for `003_add_cache_rate_limit_history_tables.sql`:**
  ```sql
  -- Down migration for 003_add_cache_rate_limit_history_tables.sql
  DROP TABLE IF EXISTS api_cache; -- Assumes no critical data that needs preserving before drop
  DROP TABLE IF EXISTS rate_limits; -- Assumes no critical data that needs preserving before drop

  -- Reverting changes to search_history
  ALTER TABLE search_history
  DROP COLUMN IF EXISTS sources,
  DROP COLUMN IF EXISTS metadata;
  -- Note: execution_time_ms was also part of this logical change in the original 013 script.
  -- If schema.sql didn't have it prior to 013's logic, it should be dropped too.
  -- ALTER TABLE search_history DROP COLUMN IF EXISTS execution_time_ms;

  DROP FUNCTION IF EXISTS clean_expired_cache();
  DROP FUNCTION IF EXISTS increment_rate_limit(TEXT, INTEGER, INTEGER);
  ```
- **Process with Down Migrations:**
    1. Identify the migration(s) to roll back.
    2. Execute the `down` script for each migration in reverse order of application using your migration tool.
    3. If using Supabase CLI, this might involve `supabase db reset --linked` to reset to a specific point or manually managing `supabase migration down`. The exact commands would depend on how Supabase migrations are being locally managed and applied to remote environments. The `scripts/deploy.md` needs clarification on the exact migration commands used.

## 4. Post-Rollback Actions
- **Verify System:** Thoroughly test the application to ensure it's functioning as expected.
- **Analyze Root Cause:** Investigate why the rollback was necessary.
- **Update Documentation/Processes:** Improve deployment and testing processes to prevent future issues.
```
