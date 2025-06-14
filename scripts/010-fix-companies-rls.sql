-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Org members can access org-specific data in discovered_companies" ON discovered_companies;

-- Create new, more permissive policy for org members to access their companies
CREATE POLICY "Org members can access their companies" ON discovered_companies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.organization_id = discovered_companies.organization_id 
      AND tm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.organization_id = discovered_companies.organization_id 
      AND tm.user_id = auth.uid()
    )
  );
