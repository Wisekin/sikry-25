#!/bin/zsh

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed. Please install PostgreSQL command line tools."
    exit 1
fi

# Database URL from environment variable
DB_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
if [ -z "$DB_URL" ]; then
    echo "Error: Could not find NEXT_PUBLIC_SUPABASE_URL in .env.local"
    exit 1
fi

# Convert http(s):// URL to PostgreSQL connection string
DB_URL=$(echo $DB_URL | sed 's/https:\/\//postgresql:\/\/postgres:/g')

# Get service role key
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d '=' -f2)
if [ -z "$SERVICE_KEY" ]; then
    echo "Error: Could not find SUPABASE_SERVICE_ROLE_KEY in .env.local"
    exit 1
fi

echo "Applying schema to database..."
PGPASSWORD=$SERVICE_KEY psql -h $(echo $DB_URL | cut -d '@' -f2) -U postgres -d postgres -f schema.sql

if [ $? -eq 0 ]; then
    echo "Schema applied successfully!"
else
    echo "Error applying schema. Please check your credentials and try again."
fi
