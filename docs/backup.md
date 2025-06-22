# Backup Strategy

This document outlines the backup strategy for the application.

## Database

- **Automated backups:** The database is backed up automatically every 24 hours.
- **Point-in-time recovery:** Point-in-time recovery is enabled to allow for recovery to any point in the last 7 days.
- **Manual backups:** Manual backups can be taken before major changes.

## Application Code

- **Version control:** The application code is stored in a Git repository.
- **Off-site backups:** The Git repository is backed up to an off-site location.