-- Migration: Add metadata column to api_cache table
-- Description: Adds a JSONB column for storing additional metadata related to cached items.
-- Date: 2025-06-07

ALTER TABLE api_cache
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
