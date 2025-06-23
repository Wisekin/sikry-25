-- Test RLS policies for discovered_companies
DO $$
DECLARE
  test_org_id uuid;
  test_user_id uuid;
  test_company_id uuid;
BEGIN
  -- Create test data
  INSERT INTO organizations (name, domain) 
  VALUES ('Test Org', 'test.com') 
  RETURNING id INTO test_org_id;

  INSERT INTO users (id, email) 
  VALUES (auth.uid(), 'test@test.com') 
  RETURNING id INTO test_user_id;

  INSERT INTO team_members (user_id, organization_id, role) 
  VALUES (test_user_id, test_org_id, 'member');

  INSERT INTO discovered_companies (
    organization_id,
    name,
    domain,
    location,
    industry,
    confidence_score
  ) VALUES (
    test_org_id,
    'Test Company',
    'testcompany.com',
    'Test Location',
    'Technology',
    95
  ) RETURNING id INTO test_company_id;

  -- Test SELECT
  ASSERT (
    SELECT COUNT(*) 
    FROM discovered_companies 
    WHERE id = test_company_id
  ) = 1, 'Should be able to read company data';

  -- Test INSERT
  INSERT INTO discovered_companies (
    organization_id,
    name,
    domain,
    location,
    industry,
    confidence_score
  ) VALUES (
    test_org_id,
    'Another Test Company',
    'another.com',
    'Another Location',
    'Technology',
    90
  );

  -- Clean up test data
  DELETE FROM discovered_companies WHERE organization_id = test_org_id;
  DELETE FROM team_members WHERE organization_id = test_org_id;
  DELETE FROM organizations WHERE id = test_org_id;

  RAISE NOTICE 'All RLS tests passed successfully';
END;
$$ LANGUAGE plpgsql;
