# Backup Strategy

This document outlines the backup strategy for the application.

## Database

- **Automated backups:** The database is backed up automatically every 24 hours.
- **Point-in-time recovery:** Point-in-time recovery is enabled to allow for recovery to any point in the last 7 days.
- **Manual backups:** Manual backups can be taken before major changes.

## Application Code

- **Version control:** The application code is stored in a Git repository.
- **Off-site backups:** The Git repository is backed up to an off-site location.

## Verifying Backups

### Database (Supabase)
- **Automated Backups & PITR:** Supabase handles automated daily backups and Point-in-Time Recovery for its hosted databases. This can typically be verified in your Supabase project dashboard under "Database" -> "Backups".
  - Check the list of available backups.
  - Confirm the PITR window (e.g., last 7 days).
- **Manual Backups:** Before significant schema changes or data migrations, consider performing a manual backup via the Supabase dashboard or using `pg_dump` if you have direct database access and need a local copy.
  ```bash
  # Example pg_dump command (replace with your actual connection details)
  # pg_dump -h YOUR_SUPABASE_HOST -U postgres -d postgres -F c -f backup_YYYYMMDD.dump
  ```

### Application Code (Git Repository)
- **Primary Backup:** The primary off-site backup is the remote Git repository itself (e.g., on GitHub, GitLab).
- **Verification:**
  - Ensure regular pushes to the remote repository from all development environments.
  - Periodically clone the repository to a fresh location to ensure its integrity.
  - If using a third-party service for additional off-site backups of the Git provider, check its status dashboard or logs.

## Local Configuration Files

Sensitive configuration files like `.env.local` (containing API keys, database credentials, etc.) are typically not committed to the Git repository for security reasons.

- **Strategy:**
  - Store a template (e.g., `.env.example` or `.env.template`) in the Git repository with placeholder values.
  - Securely store actual `.env.local` files for different environments (development, staging, production) using a password manager, a secure vault (like HashiCorp Vault, AWS Secrets Manager), or encrypted storage.
  - Ensure that the process for restoring these environment-specific configuration files is documented as part of disaster recovery procedures.

## Backup Restoration Testing
It is recommended to periodically test the restoration process for both the database and application code to ensure backups are viable and the restoration procedure is well-understood. This could involve:
- Restoring a database backup to a staging or temporary environment.
- Re-deploying the application from a cloned Git repository.