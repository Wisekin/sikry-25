# Comprehensive UI Test Plan - Phase 1

This document outlines the test cases for Phase 1 of the application testing, focusing on core functional testing and CRUD operations via the UI. The tests cover User & Organization Management, Key Business Entity Management, Cross-Entity Interactions, and System Logging.

# Test Cases for User & Organization Management

## 1. Onboarding/Signup Flow
*   **Test Case ID:** UOM_SF_001
    *   **Description:** Verify successful user and organization creation with all valid and required data.
    *   **Steps:**
        1.  Navigate to the signup page.
        2.  Enter a unique, valid email address.
        3.  Enter a strong password meeting defined criteria.
        4.  Enter a unique organization name.
        5.  (If applicable) Select a default plan.
        6.  Submit the form.
    *   **Expected Result:** User is successfully created. Organization is successfully created. User is associated with the organization. Default `platform_role` (e.g., 'admin' or 'owner' for the first user) and `plan` are correctly assigned to the new user/organization. User is redirected to the appropriate post-signup page (e.g., dashboard).
*   **Test Case ID:** UOM_SF_002
    *   **Description:** Verify system behavior when attempting to sign up with an existing email address.
    *   **Steps:**
        1.  Navigate to the signup page.
        2.  Enter an email address already registered in the system.
        3.  Fill in other fields with valid data.
        4.  Submit the form.
    *   **Expected Result:** User receives a clear error message indicating the email address is already in use. No new user or organization is created.
*   **Test Case ID:** UOM_SF_003
    *   **Description:** Verify system behavior with invalid email formats.
    *   **Steps:**
        1.  Navigate to the signup page.
        2.  Attempt to sign up with various invalid email formats (e.g., "test@domain", "test.com", "test@.com", "@domain.com").
        3.  Fill in other fields with valid data.
        4.  Submit the form for each invalid email.
    *   **Expected Result:** User receives a clear error message for each invalid email format. No new user or organization is created.
*   **Test Case ID:** UOM_SF_004
    *   **Description:** Verify password requirements are enforced (e.g., minimum length, complexity - uppercase, lowercase, number, special character).
    *   **Steps:**
        1.  Navigate to the signup page.
        2.  Attempt to sign up with passwords that do not meet the defined criteria (too short, missing required character types).
        3.  Fill in other fields with valid data.
        4.  Submit the form for each invalid password.
    *   **Expected Result:** User receives a clear error message indicating the password does not meet requirements. No new user or organization is created.
*   **Test Case ID:** UOM_SF_005
    *   **Description:** Verify behavior when required fields are left blank during signup.
    *   **Steps:**
        1. Navigate to the signup page.
        2. Attempt to submit the form with one or more required fields (e.g., email, password, organization name) left empty.
    *   **Expected Result:** Clear error messages are displayed for each missing required field. Signup is prevented.

## 2. User Profile & Preferences
*   **Test Case ID:** UOM_UP_001
    *   **Description:** Verify a logged-in user can view their profile details.
    *   **Steps:**
        1.  Log in as an existing user.
        2.  Navigate to the user profile page.
    *   **Expected Result:** User's current profile details (e.g., first_name, last_name, email, preferences if applicable) are displayed correctly.
*   **Test Case ID:** UOM_UP_002
    *   **Description:** Verify a logged-in user can successfully update their profile details (e.g., first_name, last_name).
    *   **Steps:**
        1.  Log in as an existing user.
        2.  Navigate to the user profile/edit profile page.
        3.  Modify editable fields (e.g., first_name, last_name).
        4.  Save the changes.
    *   **Expected Result:** Profile details are updated successfully. A success message is displayed. The UI reflects the updated information. The `updated_at` timestamp for the user record is updated (verify via UI if displayed, or backend logs/DB if accessible).
*   **Test Case ID:** UOM_UP_003
    *   **Description:** Verify a logged-in user can update their preferences (JSONB field).
    *   **Steps:**
        1.  Log in as an existing user.
        2.  Navigate to the user preferences section.
        3.  Modify preference settings (e.g., theme, notification settings stored in JSONB).
        4.  Save the changes.
    *   **Expected Result:** Preferences are updated successfully. A success message is displayed. The UI/application behavior reflects the new preference settings. The `updated_at` timestamp for the user record is updated.
*   **Test Case ID:** UOM_UP_004
    *   **Description:** Verify validation on profile update fields (e.g., invalid data types, exceeding length limits if any).
    *   **Steps:**
        1. Log in.
        2. Navigate to the edit profile page.
        3. Attempt to save with invalid data in fields (e.g., numbers in name fields if disallowed).
    *   **Expected Result:** Appropriate error messages are displayed. Profile is not updated with invalid data.

## 3. Organization Settings
*   **Test Case ID:** UOM_OS_001
    *   **Description:** Verify an organization owner/admin can view current organization details.
    *   **Steps:**
        1.  Log in as an organization owner or admin.
        2.  Navigate to the organization settings page.
    *   **Expected Result:** Current organization details (name, slug, timezone, contact_email) are displayed correctly.
*   **Test Case ID:** UOM_OS_002
    *   **Description:** Verify an organization owner/admin can successfully update organization details.
    *   **Steps:**
        1.  Log in as an organization owner or admin.
        2.  Navigate to the organization settings page.
        3.  Modify editable fields (e.g., name, timezone, contact_email).
        4.  Save the changes.
    *   **Expected Result:** Organization details are updated successfully. A success message is displayed. The UI reflects the updated information. The `updated_at` timestamp for the organization record is updated.
*   **Test Case ID:** UOM_OS_003
    *   **Description:** Verify organization slug updates are handled correctly and uniqueness is enforced.
    *   **Steps:**
        1.  Log in as an organization owner or admin.
        2.  Navigate to the organization settings page.
        3.  Attempt to update the slug to a new, unique value.
        4.  Save the changes.
        5.  Attempt to update the slug to a value already used by another organization.
    *   **Expected Result:** For step 4, the slug is updated successfully. For step 5, an error message is displayed indicating the slug is already taken, and the update is prevented.
*   **Test Case ID:** UOM_OS_004
    *   **Description:** Verify a user with a 'member' role (non-admin/owner) cannot access or modify organization settings.
    *   **Steps:**
        1.  Log in as a user with a 'member' role.
        2.  Attempt to navigate to the organization settings page (e.g., via direct URL if known, or check if UI elements for access are hidden/disabled).
    *   **Expected Result:** Access to organization settings is denied. If navigation is attempted, an appropriate "access denied" message is shown, or user is redirected. UI elements for accessing/modifying organization settings are not visible or are disabled.
*   **Test Case ID:** UOM_OS_005
    *   **Description:** Verify validation on organization setting fields (e.g., invalid email format for `contact_email`, invalid timezone format if specific format is expected).
    *   **Steps:**
        1. Log in as an organization owner/admin.
        2. Navigate to organization settings.
        3. Attempt to save with invalid data in fields (e.g., an invalid contact email).
    *   **Expected Result:** Appropriate error messages are displayed. Settings are not updated with invalid data.

## 4. Team Member Management
*   **Test Case ID:** UOM_TM_001
    *   **Description:** Verify an organization owner/admin can successfully invite a new team member with a valid email and assign a role.
    *   **Steps:**
        1.  Log in as an organization owner or admin.
        2.  Navigate to the team member management section.
        3.  Initiate the "invite new member" flow.
        4.  Enter a valid, unique email address for the new member.
        5.  Assign a role (e.g., 'member', 'admin').
        6.  Send the invitation.
    *   **Expected Result:** Invitation is sent successfully. The invited user appears in the team list with a 'pending' or 'invited' status. An email invitation is dispatched to the provided email address (verify if possible/applicable).
*   **Test Case ID:** UOM_TM_002
    *   **Description:** Verify system behavior when inviting a team member with an email that already exists within the organization.
    *   **Steps:**
        1.  Log in as an organization owner or admin.
        2.  Navigate to team member management.
        3.  Attempt to invite a new member using an email address of an existing member (or an already invited member).
    *   **Expected Result:** A clear error message is displayed indicating the user is already part of the organization or has a pending invite. No new invitation is sent.
*   **Test Case ID:** UOM_TM_003
    *   **Description:** Verify an organization owner/admin can change the role of an existing team member.
    *   **Steps:**
        1.  Log in as an organization owner or admin.
        2.  Navigate to team member management.
        3.  Select an existing team member.
        4.  Change their role (e.g., from 'member' to 'admin', or 'admin' to 'owner' - if allowed by business logic).
        5.  Save the changes.
    *   **Expected Result:** The team member's role is updated successfully. The UI reflects the new role. The user's permissions are updated according to the new role (verify through subsequent actions or UI indicators).
*   **Test Case ID:** UOM_TM_004
    *   **Description:** Verify an organization owner/admin can remove a team member from the organization.
    *   **Steps:**
        1.  Log in as an organization owner or admin.
        2.  Navigate to team member management.
        3.  Select an existing team member to remove.
        4.  Confirm the removal action.
    *   **Expected Result:** The team member is removed from the organization. They no longer appear in the team list. The removed user can no longer access the organization's resources.
*   **Test Case ID:** UOM_TM_005
    *   **Description:** Verify a user with a 'member' role cannot invite new team members.
    *   **Steps:**
        1.  Log in as a user with a 'member' role.
        2.  Attempt to access the "invite new member" functionality (e.g., check if UI elements are hidden/disabled, attempt direct navigation if URL is known).
    *   **Expected Result:** Access to invite new members is denied. UI elements for inviting are not visible or are disabled.
*   **Test Case ID:** UOM_TM_006
    *   **Description:** Verify a user with a 'member' role cannot change roles of other members or remove members.
    *   **Steps:**
        1.  Log in as a user with a 'member' role.
        2.  Navigate to the team member list (if viewable).
        3.  Attempt to find UI elements for changing roles or removing other members.
    *   **Expected Result:** UI elements for changing roles or removing members are not available/disabled for a 'member' role. Actions are prevented.
*   **Test Case ID:** UOM_TM_007
    *   **Description:** Verify behavior when inviting a team member with an invalid email format.
    *   **Steps:**
        1. Log in as an organization owner/admin.
        2. Navigate to team member management.
        3. Attempt to invite a new member using an invalid email address.
    *   **Expected Result:** A clear error message is displayed regarding the invalid email format. No invitation is sent.
*   **Test Case ID:** UOM_TM_008
    *   **Description:** (If applicable) Verify acceptance of a team member invitation.
    *   **Steps:**
        1. Owner/admin invites a new user (UOM_TM_001).
        2. Invited user receives email, clicks acceptance link/follows instructions.
        3. Invited user completes any required setup (e.g., setting a password if they are new to the platform).
    *   **Expected Result:** Invited user successfully joins the organization. Their status in the team member list changes from 'pending' to 'active' (or similar). The user can now access the organization according to their assigned role.

# Test Cases for Key Business Entity Management (CRUD)

## 1. Scrapers & Scraper Configurations
*   **Test Case ID:** KBE_SC_001
    *   **Description:** Verify successful creation of a new scraper with valid data.
    *   **Steps:**
        1.  Navigate to the scrapers section.
        2.  Initiate the "create new scraper" flow.
        3.  Enter all required information for the scraper (e.g., name, type).
        4.  Set `is_active` status (e.g., to true).
        5.  Save the scraper.
    *   **Expected Result:** Scraper is created successfully and appears in the list of scrapers. Its details, including `is_active` status, are displayed correctly.
*   **Test Case ID:** KBE_SC_002
    *   **Description:** Verify successful viewing of an existing scraper's details.
    *   **Steps:**
        1.  Navigate to the scrapers section.
        2.  Select an existing scraper from the list.
    *   **Expected Result:** All details of the selected scraper are displayed accurately.
*   **Test Case ID:** KBE_SC_003
    *   **Description:** Verify successful editing of an existing scraper (including `is_active` status).
    *   **Steps:**
        1.  Navigate to the scrapers section.
        2.  Select an existing scraper to edit.
        3.  Modify some of its details (e.g., name, description).
        4.  Change the `is_active` status (e.g., from true to false or vice-versa).
        5.  Save the changes.
    *   **Expected Result:** Scraper details are updated successfully. The UI reflects the changes. If `is_active` status change has an immediate observable effect on the UI (e.g., scraper stops appearing in an "active scrapers" list), verify this.
*   **Test Case ID:** KBE_SC_004
    *   **Description:** Verify successful deletion of a scraper.
    *   **Steps:**
        1.  Navigate to the scrapers section.
        2.  Select an existing scraper to delete.
        3.  Confirm the deletion.
    *   **Expected Result:** Scraper is removed from the system and no longer appears in the list. Associated scraper_configs might also be deleted or orphaned based on system design (note expected behavior).
*   **Test Case ID:** KBE_SC_005
    *   **Description:** Verify successful creation of a new scraper_config associated with a scraper, including a complex `config` JSONB field.
    *   **Steps:**
        1.  Navigate to a specific scraper's detail page or scraper configuration section.
        2.  Initiate "create new scraper_config" flow.
        3.  Enter valid data for the configuration, including a well-structured JSON for the `config` field (e.g., with nested objects, arrays, different data types).
        4.  Associate it with the parent scraper.
        5.  Save the configuration.
    *   **Expected Result:** Scraper_config is created successfully and associated with the correct scraper. The `config` JSONB data is stored and displayed correctly (if viewable in UI).
*   **Test Case ID:** KBE_SC_006
    *   **Description:** Verify successful viewing of an existing scraper_config, ensuring the `config` JSONB field is displayed accurately.
    *   **Steps:**
        1.  Navigate to an existing scraper_config.
    *   **Expected Result:** All details, including the complex `config` JSONB, are displayed correctly (e.g., formatted, or raw view).
*   **Test Case ID:** KBE_SC_007
    *   **Description:** Verify successful editing of an existing scraper_config (including the `config` JSONB field).
    *   **Steps:**
        1.  Select an existing scraper_config to edit.
        2.  Modify its details, including making changes to the `config` JSONB field (e.g., add/remove keys, change values).
        3.  Save the changes.
    *   **Expected Result:** Scraper_config is updated successfully. The `config` JSONB field reflects the modifications.
*   **Test Case ID:** KBE_SC_008
    *   **Description:** Verify successful deletion of a scraper_config.
    *   **Steps:**
        1.  Select an existing scraper_config to delete.
        2.  Confirm the deletion.
    *   **Expected Result:** Scraper_config is removed from the system.
*   **Test Case ID:** KBE_SC_009
    *   **Description:** Verify validation when creating/editing scraper or scraper_config with invalid data (e.g., missing required fields, malformed JSON in `config`).
    *   **Steps:**
        1. Attempt to create/edit a scraper or scraper_config.
        2. Provide invalid data (e.g., leave required name blank, enter invalid JSON string for `config`).
        3. Attempt to save.
    *   **Expected Result:** Appropriate error messages are displayed. Entity is not created/updated.

## 2. Campaigns & Templates
*   **Campaigns:**
    *   **Test Case ID:** KBE_CP_001
        *   **Description:** Verify successful creation of a new campaign with all valid data, including `target_filters` JSONB and initial `status`.
        *   **Steps:**
            1.  Navigate to the campaigns section.
            2.  Initiate "create new campaign" flow.
            3.  Enter required details (name, description, etc.).
            4.  Provide valid JSON for `target_filters` (e.g., `{"country": "USA", "industry": "Tech"}`).
            5.  Set initial `status` (e.g., 'draft', 'active').
            6.  Save the campaign.
        *   **Expected Result:** Campaign is created successfully. All details, including `target_filters` and `status`, are stored and displayed correctly.
    *   **Test Case ID:** KBE_CP_002
        *   **Description:** Verify viewing an existing campaign's details.
        *   **Steps:** Select an existing campaign.
        *   **Expected Result:** All campaign details are displayed accurately.
    *   **Test Case ID:** KBE_CP_003
        *   **Description:** Verify editing an existing campaign (including `target_filters` and `status`).
        *   **Steps:** Select a campaign, modify details (e.g., name, `target_filters`), save.
        *   **Expected Result:** Campaign is updated. Changes are reflected in the UI.
    *   **Test Case ID:** KBE_CP_004
        *   **Description:** Verify pausing an active campaign.
        *   **Steps:** Select an active campaign, use the "pause" action.
        *   **Expected Result:** Campaign `status` changes to 'paused'. Any associated actions (e.g., sending communications) are halted (verify if possible through UI or logs).
    *   **Test Case ID:** KBE_CP_005
        *   **Description:** Verify resuming a paused campaign.
        *   **Steps:** Select a paused campaign, use the "resume" action.
        *   **Expected Result:** Campaign `status` changes (e.g., to 'active' or its previous active state). Associated actions resume.
    *   **Test Case ID:** KBE_CP_006
        *   **Description:** Verify archiving a campaign.
        *   **Steps:** Select a campaign, use the "archive" action.
        *   **Expected Result:** Campaign `status` changes to 'archived'. It might be hidden from the main list or moved to an archive section.
    *   **Test Case ID:** KBE_CP_007
        *   **Description:** Verify validation when creating/editing a campaign with invalid `target_filters` JSON.
        *   **Steps:** Attempt to create/edit a campaign with malformed JSON in `target_filters`.
        *   **Expected Result:** Error message is displayed. Campaign not created/updated.
*   **Templates:**
    *   **Test Case ID:** KBE_TP_001
        *   **Description:** Verify successful creation of a new template (email/SMS) including `name`, `subject`, `content`, `template_tags` (TEXT[]), and `spam_score`.
        *   **Steps:**
            1.  Navigate to templates section.
            2.  Initiate "create new template."
            3.  Enter name, subject, body/content.
            4.  Add multiple `template_tags` (e.g., `{{firstName}}`, `{{companyName}}`).
            5.  (If `spam_score` is manually input or calculated on save and displayed) Enter/verify `spam_score`.
            6.  Save template.
        *   **Expected Result:** Template is created successfully. All fields, including tags as an array and spam_score, are stored and displayed correctly.
    *   **Test Case ID:** KBE_TP_002
        *   **Description:** Verify viewing an existing template.
        *   **Steps:** Select an existing template.
        *   **Expected Result:** Template details, including content and tags, are rendered accurately.
    *   **Test Case ID:** KBE_TP_003
        *   **Description:** Verify editing an existing template.
        *   **Steps:** Select a template, modify its content, subject, or tags. Save.
        *   **Expected Result:** Template is updated. Changes are reflected.
    *   **Test Case ID:** KBE_TP_004
        *   **Description:** Verify deleting a template.
        *   **Steps:** Select a template, confirm deletion.
        *   **Expected Result:** Template is removed.
    *   **Test Case ID:** KBE_TP_005
        *   **Description:** Verify UI accurately renders templates and allows dynamic content based on tags (visual check, or if there's a preview feature).
        *   **Steps:** View a template with tags. If a preview with sample data is available, use it.
        *   **Expected Result:** Tags are displayed as placeholders. Preview (if available) correctly substitutes sample data for tags.
    *   **Test Case ID:** KBE_TP_006
        *   **Description:** Verify validation for template fields (e.g., missing name, content).
        *   **Steps:** Attempt to create/edit a template with missing required fields.
        *   **Expected Result:** Error messages displayed. Template not created/saved.

## 3. Contacts & Discovered Companies
*   **Contacts:**
    *   **Test Case ID:** KBE_CN_001
        *   **Description:** Verify successful creation/importing of a new contact with all specified fields.
        *   **Steps:**
            1.  Navigate to contacts section.
            2.  Initiate "create contact" or "import contact" flow.
            3.  Enter data for email, phone, name, `location_structured` (valid JSON, e.g., `{"city": "New York", "country": "USA"}`), `technologies_list` (TEXT[], e.g., `{"React", "Node.js"}`), and `confidence_score`.
            4.  Save contact.
        *   **Expected Result:** Contact is created/imported successfully. All data fields are stored and displayed correctly, including proper rendering of JSON and text arrays.
    *   **Test Case ID:** KBE_CN_002
        *   **Description:** Verify viewing an existing contact's details.
        *   **Steps:** Select an existing contact.
        *   **Expected Result:** All contact details are displayed accurately.
    *   **Test Case ID:** KBE_CN_003
        *   **Description:** Verify editing an existing contact.
        *   **Steps:** Select a contact, modify its details (including JSON or array fields), save.
        *   **Expected Result:** Contact is updated. Changes are reflected.
    *   **Test Case ID:** KBE_CN_004
        *   **Description:** Verify deleting a contact.
        *   **Steps:** Select a contact, confirm deletion.
        *   **Expected Result:** Contact is removed.
    *   **Test Case ID:** KBE_CN_005
        *   **Description:** Verify validation for contact fields (e.g., invalid email, malformed JSON for `location_structured`).
        *   **Steps:** Attempt to create/edit a contact with invalid data.
        *   **Expected Result:** Error messages displayed. Contact not created/updated.
*   **Discovered Companies:**
    *   **Test Case ID:** KBE_DC_001
        *   **Description:** Verify successful creation/importing of a new discovered_company.
        *   **Steps:** (Similar to KBE_CN_001, but for discovered_companies and their specific fields).
        *   **Expected Result:** Discovered_company is created/imported successfully.
    *   **Test Case ID:** KBE_DC_002
        *   **Description:** Verify viewing an existing discovered_company's details.
        *   **Expected Result:** Details are displayed accurately.
    *   **Test Case ID:** KBE_DC_003
        *   **Description:** Verify editing an existing discovered_company.
        *   **Expected Result:** Company details updated and reflected.
    *   **Test Case ID:** KBE_DC_004
        *   **Description:** Verify deleting a discovered_company.
        *   **Expected Result:** Company is removed.
*   **Search & Filtering:**
    *   **Test Case ID:** KBE_SF_001
        *   **Description:** Verify search functionality for contacts using various fields (name, email, etc.).
        *   **Steps:** Enter search terms in the contact search bar/filter.
        *   **Expected Result:** Only contacts matching the criteria are displayed.
    *   **Test Case ID:** KBE_SF_002
        *   **Description:** Verify filtering functionality for contacts using various criteria (e.g., based on fields in `location_structured`, `technologies_list`).
        *   **Steps:** Apply filters.
        *   **Expected Result:** Contact list is filtered correctly.
    *   **Test Case ID:** KBE_SF_003
        *   **Description:** Verify search and filtering for discovered_companies.
        *   **Steps:** (Similar to KBE_SF_001 & KBE_SF_002 but for companies).
        *   **Expected Result:** Company list is searched/filtered correctly.

## 4. Communications
*   **Test Case ID:** KBE_CM_001
    *   **Description:** Test the process of sending communications (emails/SMS) from campaigns.
    *   **Steps:**
        1.  Ensure a campaign exists with assigned recipients and a template.
        2.  Initiate the "send communication" action for the campaign (or ensure it's scheduled and runs).
    *   **Expected Result:** The communication sending process is triggered.
*   **Test Case ID:** KBE_CM_002
    *   **Description:** Verify that `communications` records are created correctly with initial `status`, `subject`, `body`.
    *   **Steps:** After triggering KBE_CM_001, check the `communications` records (via UI if available, or backend).
    *   **Expected Result:** New `communications` records are created for the targeted recipients. Records have the correct initial `status` (e.g., 'pending', 'sent'), `subject` (from template/campaign), and `body` (rendered from template).
*   **Test Case ID:** KBE_CM_003
    *   **Description:** Verify `communication_attachments` are handled correctly if applicable and testable via UI during communication creation/sending.
    *   **Steps:** If UI allows adding attachments when sending communications, add one.
    *   **Expected Result:** The `communications` record reflects the attachment (e.g., attachment filename, link, or status). (Actual sending and attachment delivery is often an integration test, focus on record creation here).

# Test Cases for Cross-Entity Interactions & System Logs

## 1. Campaign Recipient Assignment
*   **Test Case ID:** CEI_CRA_001
    *   **Description:** Verify assigning contacts to a campaign successfully.
    *   **Steps:**
        1.  Ensure at least one campaign and several contacts exist.
        2.  Navigate to the campaign details page or a dedicated recipient management section for that campaign.
        3.  Select one or more contacts to assign to the campaign.
        4.  Confirm the assignment.
    *   **Expected Result:** The selected contacts are successfully assigned to the campaign. `campaign_recipients` records are created in the backend for each assigned contact, linking them to the campaign. The initial `status` of these `campaign_recipients` records should be appropriate (e.g., 'pending', 'queued'). The UI should reflect that these contacts are now part of the campaign.
*   **Test Case ID:** CEI_CRA_002
    *   **Description:** Verify the `status` of `campaign_recipients` updates correctly after communications are sent (if observable or testable via UI/test environment).
    *   **Steps:**
        1.  Assign contacts to a campaign (as in CEI_CRA_001).
        2.  Initiate sending communications for that campaign (as in KBE_CM_001).
        3.  After a short period (to allow for processing), check the status of the `campaign_recipients` for that campaign (via UI if available, or backend).
    *   **Expected Result:** The `status` of the `campaign_recipients` should change from 'pending' (or similar) to 'sent' (or similar) once the communication is dispatched for that recipient. (Further statuses like 'opened', 'clicked' might require more complex test setups, focus on 'sent' for this UI-centric test).
*   **Test Case ID:** CEI_CRA_003
    *   **Description:** Verify behavior when attempting to assign a contact that is already a recipient of the campaign.
    *   **Steps:**
        1. Assign a contact to a campaign.
        2. Attempt to assign the same contact to the same campaign again.
    *   **Expected Result:** The system should handle this gracefully. Either the UI prevents re-assigning an already assigned contact, or the backend ignores the duplicate assignment without error, ensuring no duplicate `campaign_recipients` records are created for the same contact within the same campaign. A user-friendly message might be displayed.
*   **Test Case ID:** CEI_CRA_004
    *   **Description:** Verify removing/unassigning a recipient from a campaign.
    *   **Steps:**
        1. Assign contacts to a campaign.
        2. Select one or more recipients from the campaign's list.
        3. Initiate the "remove" or "unassign" action.
        4. Confirm the action.
    *   **Expected Result:** The selected recipients are removed from the campaign. The corresponding `campaign_recipients` records are deleted or marked as inactive. The UI reflects that these contacts are no longer part of the campaign's recipient list. This should ideally only be possible if communications have not yet been sent to them, or the system defines behavior for this scenario (e.g., they won't receive future messages).

## 2. Audit Logging
*   **Test Case ID:** CEI_AL_001
    *   **Description:** Verify audit log generation for user creation and profile updates.
    *   **Steps:**
        1.  Perform a user signup (as in UOM_SF_001).
        2.  Perform a user profile update (as in UOM_UP_002).
        3.  Access audit logs (via UI if available, or backend/database).
    *   **Expected Result:** Audit log entries are created for the user creation event and the profile update event. Logs should contain relevant information such as user ID, action performed (e.g., 'USER_CREATE', 'USER_PROFILE_UPDATE'), timestamp, and ideally, the user who performed the action (system, or admin if applicable).
*   **Test Case ID:** CEI_AL_002
    *   **Description:** Verify audit log generation for organization settings updates.
    *   **Steps:**
        1.  Perform an organization settings update (as in UOM_OS_002).
        2.  Access audit logs.
    *   **Expected Result:** An audit log entry is created for the organization update event, including organization ID, action, timestamp, and performing user.
*   **Test Case ID:** CEI_AL_003
    *   **Description:** Verify audit log generation for team member invitation and removal.
    *   **Steps:**
        1.  Invite a new team member (as in UOM_TM_001).
        2.  Remove a team member (as in UOM_TM_004).
        3.  Access audit logs.
    *   **Expected Result:** Audit log entries are created for both invitation and removal events, detailing the action, affected user, organization, timestamp, and performing user.
*   **Test Case ID:** CEI_AL_004
    *   **Description:** Verify audit log generation for CRUD operations on Scrapers.
    *   **Steps:**
        1.  Create a scraper (KBE_SC_001).
        2.  Edit a scraper (KBE_SC_003).
        3.  Delete a scraper (KBE_SC_004).
        4.  Access audit logs.
    *   **Expected Result:** Audit log entries are generated for each CRUD operation on the scraper, including scraper ID, action type (CREATE, UPDATE, DELETE), timestamp, and user who performed it.
*   **Test Case ID:** CEI_AL_005
    *   **Description:** Verify audit log generation for CRUD operations on Campaigns.
    *   **Steps:**
        1.  Create a campaign (KBE_CP_001).
        2.  Edit a campaign (KBE_CP_003).
        3.  Archive/delete a campaign (KBE_CP_006).
        4.  Access audit logs.
    *   **Expected Result:** Audit log entries are generated for each CRUD operation on the campaign.
*   **Test Case ID:** CEI_AL_006
    *   **Description:** Verify audit log generation for CRUD operations on Contacts.
    *   **Steps:**
        1.  Create a contact (KBE_CN_001).
        2.  Edit a contact (KBE_CN_003).
        3.  Delete a contact (KBE_CN_004).
        4.  Access audit logs.
    *   **Expected Result:** Audit log entries are generated for each CRUD operation on the contact.
*   **Note for Audit Logging:** If a dedicated audit log view is available in the UI, test its filtering and search capabilities as well. Verification will primarily be checking for the existence and correctness of log entries.

## 3. System Logs & Metrics
*   **Test Case ID:** CEI_SL_001
    *   **Description:** Check for error entries in system logs during induced error conditions.
    *   **Steps:**
        1.  Attempt an action known to cause an error (e.g., submitting a form with invalid data that bypasses frontend validation but causes a backend error, or trying to access a resource without permission if it's expected to log an error).
        2.  Access system logs (this usually requires backend access or a log viewing tool like Sentry, Datadog, etc.).
    *   **Expected Result:** Relevant error messages, stack traces, or diagnostic information are recorded in the system logs corresponding to the induced error. The log should provide enough detail to help diagnose the issue.
*   **Test Case ID:** CEI_SL_002
    *   **Description:** Check for critical event logging in system logs (e.g., service startup, major configuration changes if applicable and logged).
    *   **Steps:**
        1.  Perform an action considered a critical event if applicable (e.g., if there's a UI trigger for a background job that's critical).
        2.  Access system logs.
    *   **Expected Result:** Informational logs indicating the occurrence and status (success/failure) of critical events are present.
*   **Test Case ID:** CEI_MT_001
    *   **Description:** Verify metrics are generated for key application activities (e.g., user signups, campaign creations, communications sent).
    *   **Steps:**
        1.  Perform a series of key actions (e.g., multiple user signups, create several campaigns, send communications).
        2.  Access the metrics dashboard or system (e.g., Prometheus, Grafana, or custom metrics UI).
    *   **Expected Result:** Metrics corresponding to these actions (e.g., counters for `user_signups_total`, `campaigns_created_total`, `communications_sent_total`) are incremented. (This test is highly dependent on the specific metrics being collected and the tools used).
*   **Test Case ID:** CEI_MT_002
    *   **Description:** Verify error rate metrics increase when errors occur.
    *   **Steps:**
        1. Induce several errors (as in CEI_SL_001).
        2. Access metrics dashboard.
    *   **Expected Result:** Metrics tracking error rates (e.g., `http_server_requests_errors_total`, specific application error counters) show an increase.

## Step 2: Integration, Data Integrity (UI-driven), and Edge Case Testing

# Test Cases for UI-Driven Constraint Validation

## 1. UI-Driven Constraint Validation

### 1.1 Required Fields (`NOT NULL`)
*   **Test Case ID:** IDV_RF_001
    *   **Description:** Verify UI prevents form submission if required fields in User Signup are empty.
    *   **Applies to:** User Signup Form.
    *   **Fields to Test (Examples):** Email, Password, Organization Name.
    *   **Steps:**
        1.  Navigate to the User Signup page.
        2.  Attempt to submit the form with one or more of the specified required fields left blank.
        3.  Observe UI validation messages.
    *   **Expected Result:** UI displays clear, field-specific error messages indicating the field is required. Form submission is prevented until all required fields are filled with valid data.
*   **Test Case ID:** IDV_RF_002
    *   **Description:** Verify UI prevents form submission if required fields in Organization Creation/Settings are empty.
    *   **Applies to:** Organization Creation/Settings Form.
    *   **Fields to Test (Examples):** Organization Name, Contact Email (if required).
    *   **Steps:**
        1.  Navigate to Organization Creation or Settings page.
        2.  Attempt to save/submit with required fields blank.
    *   **Expected Result:** UI displays field-specific error messages. Submission prevented.
*   **Test Case ID:** IDV_RF_003
    *   **Description:** Verify UI prevents form submission if required fields in Campaign Creation are empty.
    *   **Applies to:** Campaign Creation Form.
    *   **Fields to Test (Examples):** Campaign Name, Status (if required at creation).
    *   **Steps:**
        1.  Navigate to Campaign Creation page.
        2.  Attempt to save/submit with required fields blank.
    *   **Expected Result:** UI displays field-specific error messages. Submission prevented.
*   **Test Case ID:** IDV_RF_004
    *   **Description:** Verify UI prevents form submission if required fields in Template Creation are empty.
    *   **Applies to:** Template Creation Form.
    *   **Fields to Test (Examples):** Template Name, Subject, Content.
    *   **Steps:**
        1.  Navigate to Template Creation page.
        2.  Attempt to save/submit with required fields blank.
    *   **Expected Result:** UI displays field-specific error messages. Submission prevented.
*   **Test Case ID:** IDV_RF_005
    *   **Description:** Verify UI prevents form submission if required fields in Contact Creation are empty.
    *   **Applies to:** Contact Creation Form.
    *   **Fields to Test (Examples):** Contact Email or Phone (assuming one is required).
    *   **Steps:**
        1.  Navigate to Contact Creation page.
        2.  Attempt to save/submit with required fields blank.
    *   **Expected Result:** UI displays field-specific error messages. Submission prevented.
*   **(General Note):** This pattern of testing should be applied to ALL forms and entities where fields are marked as `NOT NULL` in the schema (e.g., Scraper name, ScraperConfig association, etc.). Create specific test cases for each entity and its required fields.

### 1.2 Unique Field Validation
*   **Test Case ID:** IDV_UF_001
    *   **Description:** Attempt to create a new user with an email address that already exists.
    *   **Applies to:** User Signup / User Invitation.
    *   **Steps:**
        1.  Identify an existing user's email address.
        2.  Navigate to the User Signup page (or team member invite page).
        3.  Attempt to create/invite a new user using the identified existing email address.
        4.  Fill all other fields with valid data.
        5.  Submit the form.
    *   **Expected Result:** The UI displays a clear error message (e.g., "Email already exists," "User with this email is already registered"). New user creation/invitation is prevented.
*   **Test Case ID:** IDV_UF_002
    *   **Description:** Attempt to create a new organization with a slug that already exists.
    *   **Applies to:** Organization Creation / Organization Settings.
    *   **Steps:**
        1.  Identify an existing organization's slug.
        2.  Navigate to Organization Creation page or settings page of another org.
        3.  Attempt to create/update an organization using the identified existing slug.
        4.  Fill all other fields with valid data.
        5.  Submit the form.
    *   **Expected Result:** UI displays a clear error message (e.g., "Organization slug is already taken"). Creation/update is prevented.
*   **Test Case ID:** IDV_UF_003
    *   **Description:** Attempt to create a new contact with an email address that already exists within the same organization (if uniqueness is per organization).
    *   **Applies to:** Contact Creation.
    *   **Steps:**
        1.  Identify an existing contact's email in the current organization.
        2.  Attempt to create a new contact with this email.
    *   **Expected Result:** UI displays an error message indicating the contact email must be unique (within the org). Creation prevented.
*   **(General Note):** Apply this to all fields with `UNIQUE` constraints (e.g., `scraper_configs.name` if unique per scraper, `templates.name` if unique per organization).

### 1.3 Foreign Key Integrity (UI-driven)
*   **Test Case ID:** IDV_FK_001
    *   **Description:** Attempt to delete a user who is the sole owner of an organization with other team members or critical data.
    *   **Applies to:** User Management / Organization Management.
    *   **Pre-conditions:** User is an org owner, org has other members or linked entities (campaigns, scrapers).
    *   **Steps:**
        1.  As an admin or the user themselves (if allowed), attempt to delete this user account.
    *   **Expected Result:** Based on schema's `ON DELETE` behavior for `users.id` in related tables:
        *   **Prevent Deletion:** UI displays an error message (e.g., "Cannot delete owner. Please transfer ownership first or delete the organization."). Deletion is blocked. (Most likely scenario for critical links).
        *   **Require Reassignment:** UI prompts to reassign ownership or linked items.
        *   **Cascade (if intended):** If cascade delete is intended and safe, verify associated data is correctly removed and UI updates. This needs careful consideration of business rules.
*   **Test Case ID:** IDV_FK_002
    *   **Description:** Attempt to delete an organization that has associated entities (team_members, scrapers, campaigns, contacts).
    *   **Applies to:** Organization Management.
    *   **Steps:**
        1.  As an organization owner or super admin, attempt to delete an organization with linked data.
    *   **Expected Result:** UI behavior should align with `ON DELETE` rules:
        *   **Prevent Deletion (if `RESTRICT` or no rule implies restriction):** UI shows an error (e.g., "Cannot delete organization with active campaigns/members. Please remove them first.").
        *   **Cascade Deletion (if `CASCADE`):** UI informs about cascading effects. Upon confirmation, organization and all linked entities (team_members, scrapers, campaigns, contacts, etc., as per schema) are deleted. UI should reflect this (e.g., entities no longer appear).
        *   **Set Null (if `SET NULL`):** Foreign keys in associated tables are set to NULL. UI should reflect this (e.g., a campaign might now show "No Owner" or be disassociated). This is less common for primary associations.
*   **Test Case ID:** IDV_FK_003
    *   **Description:** Attempt to delete a Campaign that has associated `campaign_recipients` or `communications`.
    *   **Applies to:** Campaign Management.
    *   **Steps:**
        1. Attempt to delete a Campaign with linked recipients/communications.
    *   **Expected Result:** UI prevents deletion or warns about linked data, according to `ON DELETE` rules for `campaigns.id`. If deletion proceeds, verify UI correctly reflects removal of campaign and potentially linked items if cascaded.
*   **Test Case ID:** IDV_FK_004
    *   **Description:** Attempt to delete a Scraper that has associated `scraper_configs`.
    *   **Applies to:** Scraper Management.
    *   **Steps:**
        1. Attempt to delete a Scraper with linked configurations.
    *   **Expected Result:** UI prevents deletion or warns, according to `ON DELETE` rules for `scrapers.id`. Verify UI reflects changes correctly.
*   **(General Note):** Test scenarios for other parent-child relationships where deletion of the parent might be restricted or might cascade. For example, deleting a `template` that is currently in use by a `campaign`. The UI should provide clear feedback.

### 1.4 Data Type & Format Validation
*   **Test Case ID:** IDV_DT_001
    *   **Description:** Input non-numeric characters into a numeric field (e.g., `templates.spam_score` if numeric, any ID fields if manually entered).
    *   **Applies to:** Any form with numeric input fields.
    *   **Steps:**
        1.  Navigate to a form with a numeric field.
        2.  Enter text (e.g., "abc") or special characters into the numeric field.
        3.  Attempt to save/submit.
    *   **Expected Result:** UI displays a validation error (e.g., "Must be a number," "Invalid format"). Submission prevented.
*   **Test Case ID:** IDV_DT_002
    *   **Description:** Input an invalid date format into a date/timestamp field.
    *   **Applies to:** Any form with date/timestamp fields (e.g., campaign start/end dates if applicable).
    *   **Steps:**
        1.  Navigate to a form with a date field.
        2.  Enter an incorrectly formatted date (e.g., "2023-FEB-30", "13/35/2023", "notadate").
        3.  Attempt to save/submit.
    *   **Expected Result:** UI displays a validation error (e.g., "Invalid date format"). Submission prevented.
*   **Test Case ID:** IDV_DT_003
    *   **Description:** Input a malformed UUID into a UUID field (if any are manually entered, usually they are auto-generated).
    *   **Applies to:** Forms with manual UUID entry (rare).
    *   **Steps:**
        1.  Enter an invalid UUID (e.g., too short, invalid characters).
    *   **Expected Result:** UI validation error. Submission prevented.
*   **Test Case ID:** IDV_DT_004
    *   **Description:** Input text exceeding `VARCHAR(n)` or `TEXT` length limits if UI imposes practical limits or if backend errors are gracefully shown.
    *   **Applies to:** Text input fields.
    *   **Steps:**
        1.  Identify a field with a known length limit (e.g., `users.first_name VARCHAR(255)`).
        2.  Attempt to enter text exceeding this limit via UI.
    *   **Expected Result:** UI might truncate input, prevent further typing, or show a validation message if it has client-side length checks. If only backend enforced, a graceful error from backend should be displayed on UI.
*   **Test Case ID:** IDV_DT_005
    *   **Description:** Input invalid email format into email fields (beyond basic UOM_SF_003, e.g. very long emails, emails with unusual characters if specific rules apply).
    *   **Applies to:** All email input fields (user email, org contact_email, contact email).
    *   **Steps:**
        1.  Enter various non-standard but potentially problematic email formats.
    *   **Expected Result:** UI validation error. Submission prevented.

# Test Cases for Complex Data Handling & Display

## 2. Complex Data Handling & Display

### 2.1 JSONB Data UI Representation
*   **Entity/Field Examples:** `scraper_configs.config`, `discovered_companies.location_structured`, `campaigns.target_filters`, `users.preferences`.

*   **Test Case ID:** CDH_JSON_001
    *   **Description:** Verify UI allows easy input of simple key-value pairs into a JSONB field.
    *   **Applies to:** A form with a JSONB field (e.g., creating/editing a Scraper Configuration `config`).
    *   **Steps:**
        1.  Navigate to the relevant form.
        2.  In the UI element for the JSONB field, input a simple JSON structure (e.g., `{"key1": "value1", "key2": 123, "key3": true}`). This might be via a raw text input, or structured form elements if provided.
        3.  Save the entity.
        4.  Re-open the entity for viewing/editing.
    *   **Expected Result:** The JSONB data is saved correctly. Upon re-opening, the data is displayed accurately in the UI (either raw or parsed into readable format/form fields).
*   **Test Case ID:** CDH_JSON_002
    *   **Description:** Verify UI allows input and editing of nested JSONB data.
    *   **Applies to:** Forms with JSONB fields designed for nested structures (e.g., `scraper_configs.config`).
    *   **Steps:**
        1.  Navigate to the relevant form.
        2.  Input/edit a JSONB field to include nested objects and arrays (e.g., `{"level1_key": "value", "nested_obj": {"n_key1": "n_val1", "n_key2": [1,2,3]}, "level1_key2": false}`).
        3.  Save the entity.
        4.  Re-open for viewing/editing.
    *   **Expected Result:** Nested JSONB data is saved correctly. UI accurately displays and allows modification of the nested structure (e.g., through expandable sections, dedicated inputs for sub-properties, or correct raw text display).
*   **Test Case ID:** CDH_JSON_003
    *   **Description:** Verify UI allows adding new key-value pairs to an existing JSONB structure.
    *   **Applies to:** Editing forms with JSONB fields.
    *   **Steps:**
        1.  Open an existing entity with pre-filled JSONB data.
        2.  Using the UI, add a new key and its value at the root level or within a nested object.
        3.  Save the entity.
        4.  Re-open and verify.
    *   **Expected Result:** The new key-value pair is successfully added to the JSONB data and displayed correctly. Original data remains intact.
*   **Test Case ID:** CDH_JSON_004
    *   **Description:** Verify UI allows removing key-value pairs from an existing JSONB structure (root or nested).
    *   **Applies to:** Editing forms with JSONB fields.
    *   **Steps:**
        1.  Open an existing entity with JSONB data.
        2.  Using the UI, remove an existing key-value pair.
        3.  Save the entity.
        4.  Re-open and verify.
    *   **Expected Result:** The selected key-value pair is removed. Remaining data is intact and displayed correctly.
*   **Test Case ID:** CDH_JSON_005
    *   **Description:** Verify UI allows modifying values of existing keys in a JSONB structure (including changing data types if permissible by UI, e.g., string to number).
    *   **Applies to:** Editing forms with JSONB fields.
    *   **Steps:**
        1.  Open an existing entity with JSONB data.
        2.  Using the UI, change the value of an existing key.
        3.  Save the entity.
        4.  Re-open and verify.
    *   **Expected Result:** The value is updated correctly and displayed accurately.
*   **Test Case ID:** CDH_JSON_006
    *   **Description:** Verify UI handles malformed JSON input gracefully (if raw text input is allowed).
    *   **Applies to:** Forms with raw text input for JSONB.
    *   **Steps:**
        1.  Navigate to the relevant form.
        2.  Enter malformed JSON (e.g., missing quotes, trailing comma, incorrect bracket/brace).
        3.  Attempt to save.
    *   **Expected Result:** UI displays a clear validation error (e.g., "Invalid JSON format"). Submission is prevented, or backend returns a graceful error displayed on UI. Data is not saved.
*   **Test Case ID:** CDH_JSON_007
    *   **Description:** Verify accurate display of complex JSONB data in a read-only/view mode.
    *   **Applies to:** Detail/view pages for entities with JSONB fields.
    *   **Pre-condition:** Entity exists with complex, nested JSONB data.
    *   **Steps:**
        1.  Navigate to the view page of the entity.
    *   **Expected Result:** The JSONB data is displayed in a readable and accurate format (e.g., pretty-printed, tree view, or structured layout). All nested levels are accessible and correctly shown.
*   **Test Case ID:** CDH_JSON_008
    *   **Description:** Verify UI handles empty JSONB object `{}` correctly for input and display.
    *   **Applies to:** Forms with JSONB fields.
    *   **Steps:**
        1. Input `{}` or clear the JSONB field to represent an empty object.
        2. Save and re-open.
    *   **Expected Result:** Empty JSONB object is saved and displayed correctly (e.g., as `{}` or an indication of no properties).

### 2.2 Array (TEXT[]) Data UI Representation
*   **Entity/Field Examples:** `discovered_companies.technologies_list`, `templates.template_tags`.

*   **Test Case ID:** CDH_ARRAY_001
    *   **Description:** Verify UI allows adding multiple items to a TEXT[] field.
    *   **Applies to:** Forms with TEXT[] fields (e.g., creating/editing a Template for `template_tags`).
    *   **Steps:**
        1.  Navigate to the relevant form.
        2.  Using the UI mechanism for TEXT[] fields (e.g., tag input, multi-select, comma-separated input), add several text items.
        3.  Save the entity.
        4.  Re-open the entity for viewing/editing.
    *   **Expected Result:** All added text items are saved correctly as an array. Upon re-opening, all items are displayed accurately (e.g., as individual tags, list items).
*   **Test Case ID:** CDH_ARRAY_002
    *   **Description:** Verify UI allows removing items from a TEXT[] field.
    *   **Applies to:** Editing forms with TEXT[] fields.
    *   **Steps:**
        1.  Open an existing entity with pre-filled TEXT[] data.
        2.  Using the UI, remove one or more items from the array.
        3.  Save the entity.
        4.  Re-open and verify.
    *   **Expected Result:** The selected items are removed from the array. Remaining items are intact and displayed correctly.
*   **Test Case ID:** CDH_ARRAY_003
    *   **Description:** Verify UI allows editing existing items in a TEXT[] field (if the UI supports direct item editing, otherwise this might be a remove & add).
    *   **Applies to:** Editing forms with TEXT[] fields.
    *   **Steps:**
        1.  Open an existing entity with TEXT[] data.
        2.  If UI supports, directly edit an item in the list. If not, simulate by removing an old item and adding the "edited" new one.
        3.  Save and verify.
    *   **Expected Result:** The item in the array is updated.
*   **Test Case ID:** CDH_ARRAY_004
    *   **Description:** Verify UI handles empty TEXT[] array correctly (input and display).
    *   **Applies to:** Forms with TEXT[] fields.
    *   **Steps:**
        1.  Ensure no items are added to a TEXT[] field, or remove all existing items.
        2.  Save the entity.
        3.  Re-open and verify.
    *   **Expected Result:** An empty array is saved correctly. UI displays this appropriately (e.g., no tags shown, an empty list).
*   **Test Case ID:** CDH_ARRAY_005
    *   **Description:** Verify UI handles TEXT[] items with special characters, spaces, and varied lengths.
    *   **Applies to:** Forms with TEXT[] fields.
    *   **Steps:**
        1.  Add items to a TEXT[] field that include:
            *   Spaces (e.g., "tag with spaces")
            *   Special characters (e.g., "tag-!@#")
            *   Long strings
            *   Short strings
        2.  Save and re-open.
    *   **Expected Result:** All items are saved and displayed exactly as entered, without unexpected truncation or character encoding issues.
*   **Test Case ID:** CDH_ARRAY_006
    *   **Description:** Verify UI prevents duplicate entries in TEXT[] if business logic requires unique items (e.g. for tags, often duplicates are merged or prevented).
    *   **Applies to:** Forms with TEXT[] fields where items should be unique.
    *   **Steps:**
        1. Add an item (e.g., "unique_tag").
        2. Attempt to add the same item ("unique_tag") again.
    *   **Expected Result:** The UI either prevents adding the duplicate, or it automatically merges/ignores it, resulting in only one instance of "unique_tag" in the array.
*   **Test Case ID:** CDH_ARRAY_007
    *   **Description:** Verify accurate display of TEXT[] data in a read-only/view mode.
    *   **Applies to:** Detail/view pages for entities with TEXT[] fields.
    *   **Pre-condition:** Entity exists with multiple items in a TEXT[] field.
    *   **Steps:**
        1.  Navigate to the view page of the entity.
    *   **Expected Result:** All items in the TEXT[] field are displayed clearly and accurately (e.g., as a list of tags, comma-separated string).

# Test Cases for Error Handling and User Feedback

## 3. Error Handling and User Feedback

*   **Test Case ID:** EHF_UE_001
    *   **Description:** Verify UI displays a user-friendly message for expected API validation errors (e.g., backend validation fails after client-side passes or for complex rules).
    *   **Trigger:** Submit a form with data that is valid client-side but triggers a known backend validation rule (e.g., business logic constraint not checkable on the client).
    *   **Steps:**
        1.  Identify a scenario where backend validation might fail (e.g., trying to create a campaign with a name that becomes non-unique due to a race condition if not handled by DB, or a complex rule violation).
        2.  Submit the form data that triggers this specific backend validation.
    *   **Expected Result:** The UI displays a clear, user-friendly error message that explains the problem in understandable terms (e.g., "The campaign name you chose was just taken. Please choose another.", "Failed to update settings due to [specific reason from backend if appropriate]."). Avoid showing raw API error codes or stack traces directly to the user. `system_logs` should capture the detailed backend error.
*   **Test Case ID:** EHF_UE_002
    *   **Description:** Verify UI displays a user-friendly message for API connectivity issues (e.g., server down, network error when making a request).
    *   **Trigger:** Simulate an API request failure (e.g., by temporarily blocking network access to the API, or if a test environment allows, briefly stopping the backend server).
    *   **Steps:**
        1.  Perform an action that triggers an API call (e.g., loading a list, submitting a form).
        2.  Ensure the API call will fail due to connectivity.
    *   **Expected Result:** UI displays a generic but clear error message (e.g., "Unable to connect to the server. Please check your internet connection and try again.", "An error occurred while fetching data."). The application should remain stable and not crash. `system_logs` should capture the connectivity error details.
*   **Test Case ID:** EHF_UE_003
    *   **Description:** Verify UI displays a user-friendly message for authorization errors (e.g., user attempts an action they are not permitted to do, and this is caught server-side).
    *   **Trigger:** A user attempts an action for which their role lacks permission, and this check is primarily server-side.
    *   **Steps:**
        1.  Log in as a user with limited permissions (e.g., 'member').
        2.  Attempt to access/perform an admin-only action via a method that might bypass client-side UI restrictions (e.g., crafting a direct API call if possible in test, or if some UI elements for actions are mistakenly shown).
    *   **Expected Result:** UI displays a clear authorization error (e.g., "You do not have permission to perform this action.", "Access Denied."). `system_logs` should capture the authorization attempt.
*   **Test Case ID:** EHF_UE_004
    *   **Description:** Verify UI behavior on unexpected server errors (e.g., HTTP 500 internal server error).
    *   **Trigger:** Force an unhandled exception in a backend API endpoint (requires backend manipulation or a known buggy endpoint in a test environment).
    *   **Steps:**
        1.  Perform a UI action that calls the problematic backend endpoint.
    *   **Expected Result:** The UI displays a generic, user-friendly error message (e.g., "An unexpected error occurred. Please try again later. Our team has been notified."). It should not expose technical details like stack traces. The application should remain usable or guide the user. `system_logs` must capture the full server-side stack trace and error details.
*   **Test Case ID:** EHF_UE_005
    *   **Description:** Verify client-side validation messages are clear and correctly associated with form fields.
    *   **Trigger:** Intentionally input invalid data into various form fields that have client-side validation.
    *   **Steps:**
        1.  For forms tested in IDV (UI-Driven Constraint Validation), re-check that the error messages are user-friendly, not just "invalid input".
        2.  Ensure messages appear near the correct field and are easy to understand.
    *   **Expected Result:** Client-side validation messages are specific (e.g., "Email format is invalid," "Password must be at least 8 characters"), user-friendly, and clearly point to the field in error.
*   **Test Case ID:** EHF_SL_001 (Conceptual)
    *   **Description:** Verify that detailed error information, including stack traces for server errors, is captured in `system_logs`.
    *   **Trigger:** Any server-side error (validation, unexpected, authorization if logged server-side).
    *   **Steps:**
        1.  After triggering any of the above error scenarios (EHF_UE_001 to EHF_UE_004).
        2.  Access the `system_logs` (backend logging system like Sentry, CloudWatch, etc.).
    *   **Expected Result:** `system_logs` contain detailed entries for each error, including timestamp, error type, full stack trace (for code errors), request details (endpoint, parameters if sensitive data is excluded), and user ID if available. This ensures developers have enough information to debug.
*   **Test Case ID:** EHF_SL_002 (Conceptual)
    *   **Description:** Verify that client-side errors/exceptions (if significant and logged) are captured in `system_logs` or a dedicated frontend logging service.
    *   **Trigger:** A significant client-side JavaScript error occurs that doesn't break the app but might degrade experience.
    *   **Steps:**
        1. (If possible to simulate) Cause a non-critical JavaScript error in the Next.js application.
        2. Check browser console for errors.
        3. Check `system_logs` or designated frontend error aggregation service.
    *   **Expected Result:** The error is reported to the logging system, including component information, error message, and browser context if available. This helps in proactively identifying UI bugs.

# Test Cases for Search, Filtering, and Sorting

## 4. Search, Filtering, and Sorting

### 4.1 Comprehensive Search
*   **Entity Examples:** Contacts, Discovered Companies, Campaigns, Templates (any entity with a list view and search capability).
*   **Test Case ID:** SFS_CS_001
    *   **Description:** Verify search by name/title for an entity (e.g., Contact name, Campaign name).
    *   **Applies to:** List views with search bars.
    *   **Steps:**
        1.  Navigate to an entity list view (e.g., Contacts).
        2.  Identify an existing entity's name/title.
        3.  Enter the full name/title into the search bar.
        4.  Execute the search.
    *   **Expected Result:** Only the entity/entities matching the exact name/title are displayed.
*   **Test Case ID:** SFS_CS_002
    *   **Description:** Verify partial search by name/title.
    *   **Applies to:** List views with search bars.
    *   **Steps:**
        1.  Navigate to an entity list view.
        2.  Enter a partial segment of an existing entity's name/title.
    *   **Expected Result:** All entities whose name/title contains the partial segment are displayed.
*   **Test Case ID:** SFS_CS_003
    *   **Description:** Verify case-insensitive search (if intended).
    *   **Applies to:** List views with search bars.
    *   **Steps:**
        1.  Identify an entity name (e.g., "Campaign Alpha").
        2.  Search using different casings (e.g., "campaign alpha", "CAMPAIGN ALPHA").
    *   **Expected Result:** Results are identical regardless of case, showing "Campaign Alpha".
*   **Test Case ID:** SFS_CS_004
    *   **Description:** Verify search with leading/trailing spaces in the search term.
    *   **Applies to:** List views with search bars.
    *   **Steps:**
        1.  Search for an entity name with added leading/trailing spaces (e.g., "  Campaign Alpha  ").
    *   **Expected Result:** Search trims spaces and returns the correct results as if searched without extra spaces.
*   **Test Case ID:** SFS_CS_005
    *   **Description:** Verify search for entities using keywords present in other relevant fields (e.g., email for Contacts, description for Campaigns, technologies for Discovered Companies - especially if `tsvector` is used).
    *   **Applies to:** List views with global/multi-field search.
    *   **Steps:**
        1.  Identify a keyword present in a searchable field other than name (e.g., a specific technology in `discovered_companies.technologies_list`).
        2.  Enter this keyword into the search bar.
    *   **Expected Result:** Entities matching the keyword in any of the indexed/searchable fields (including `tsvector` fields) are displayed. Relevance of results should be sensible.
*   **Test Case ID:** SFS_CS_006
    *   **Description:** Verify search with no results.
    *   **Applies to:** List views with search bars.
    *   **Steps:**
        1.  Enter a search term that is guaranteed not to match any entity.
    *   **Expected Result:** A clear "No results found" or similar message is displayed. The list should be empty.
*   **Test Case ID:** SFS_CS_007
    *   **Description:** Verify search with special characters (if fields might contain them, e.g., company name "Smith & Co.").
    *   **Applies to:** List views with search bars.
    *   **Steps:**
        1.  Search using terms that include special characters present in data.
    *   **Expected Result:** Search correctly handles special characters and returns matching results.
*   **Test Case ID:** SFS_CS_008 (tsvector specific, if applicable)
    *   **Description:** Verify `tsvector` based search for multiple keywords (e.g., "New York" AND "Tech" for Discovered Companies).
    *   **Applies to:** Search fields leveraging `tsvector`.
    *   **Steps:**
        1.  Enter multiple keywords that should refine search based on `tsvector` logic.
    *   **Expected Result:** Results match all (or relevant combinations of) keywords according to the `tsvector` implementation and search query construction.

### 4.2 Advanced Filtering
*   **Entity Examples:** Contacts (filter by status, tags), Campaigns (filter by status, type), Scrapers (by `is_active`).
*   **Test Case ID:** SFS_AF_001
    *   **Description:** Verify filtering by a single criterion (e.g., Contacts with `status` = 'active').
    *   **Applies to:** List views with filter options.
    *   **Steps:**
        1.  Navigate to a list view with filters (e.g., Contacts).
        2.  Apply a single filter (e.g., `status` = 'active').
    *   **Expected Result:** Only entities matching the applied filter criterion are displayed.
*   **Test Case ID:** SFS_AF_002
    *   **Description:** Verify combining multiple filter criteria (e.g., Contacts with `status` = 'active' AND `tag` = 'important_client').
    *   **Applies to:** List views with multiple filter options.
    *   **Steps:**
        1.  Navigate to a list view.
        2.  Apply a filter for one criterion.
        3.  Apply another filter for a different criterion.
    *   **Expected Result:** Only entities matching ALL applied filter criteria are displayed.
*   **Test Case ID:** SFS_AF_003
    *   **Description:** Verify clearing applied filters.
    *   **Applies to:** List views with filter options.
    *   **Steps:**
        1.  Apply one or more filters.
        2.  Use the "clear filters" or "reset filters" functionality.
    *   **Expected Result:** All filters are removed, and the list displays all entities (or the default unfiltered view).
*   **Test Case ID:** SFS_AF_004
    *   **Description:** Verify filtering yields no results when criteria match no entities.
    *   **Applies to:** List views with filter options.
    *   **Steps:**
        1.  Apply filter criteria that are known not to match any existing entities.
    *   **Expected Result:** A "No results found" message is displayed. The list is empty.
*   **Test Case ID:** SFS_AF_005
    *   **Description:** Verify filter persistence (e.g., if user navigates away and returns, are filters maintained, if this is desired behavior?).
    *   **Applies to:** List views with filters.
    *   **Steps:**
        1. Apply filters.
        2. Navigate to another page within the app.
        3. Navigate back to the filtered list view.
    *   **Expected Result:** Filters are either persisted or reset based on defined application behavior. Document the expected outcome.
*   **Test Case ID:** SFS_AF_006
    *   **Description:** Verify filtering on date ranges (if applicable, e.g., Campaigns created_at between X and Y).
    *   **Applies to:** List views with date range filters.
    *   **Steps:**
        1. Select a start and end date for filtering.
    *   **Expected Result:** Only entities within the specified date range are displayed.
*   **Test Case ID:** SFS_AF_007
    *   **Description:** Verify filtering on boolean fields (e.g., Scrapers `is_active` = true/false).
    *   **Applies to:** List views with boolean filters.
    *   **Steps:**
        1. Filter by true. Verify results.
        2. Filter by false. Verify results.
    *   **Expected Result:** List correctly shows active/inactive items as per filter.

### 4.3 Pagination & Sorting
*   **Pre-condition for many tests:** Ensure a large number of entities (e.g., >2-3 pages worth) exist for the tested list view.
*   **Test Case ID:** SFS_PS_001
    *   **Description:** Verify pagination controls (Next, Previous, Page numbers) are present and functional when many items exist.
    *   **Applies to:** List views expected to paginate.
    *   **Steps:**
        1.  Navigate to a list view with enough items to trigger pagination.
    *   **Expected Result:** Pagination controls are visible. "Next" page button is active, "Previous" might be inactive on page 1. Page numbers are shown correctly.
*   **Test Case ID:** SFS_PS_002
    *   **Description:** Verify clicking "Next" page loads the subsequent set of items.
    *   **Applies to:** Paginated list views.
    *   **Steps:**
        1.  On page 1, click "Next".
    *   **Expected Result:** The next page of items is displayed. "Previous" button becomes active. Data is different from page 1.
*   **Test Case ID:** SFS_PS_003
    *   **Description:** Verify clicking "Previous" page loads the preceding set of items.
    *   **Applies to:** Paginated list views.
    *   **Steps:**
        1.  Navigate to page 2 or higher. Click "Previous".
    *   **Expected Result:** The previous page of items is displayed.
*   **Test Case ID:** SFS_PS_004
    *   **Description:** Verify direct navigation to a specific page number (if page number links are available).
    *   **Applies to:** Paginated list views with direct page links.
    *   **Steps:**
        1.  Click on a specific page number link.
    *   **Expected Result:** The corresponding page of items is displayed.
*   **Test Case ID:** SFS_PS_005
    *   **Description:** Verify behavior on the last page (e.g., "Next" button is disabled).
    *   **Applies to:** Paginated list views.
    *   **Steps:**
        1.  Navigate to the last page of items.
    *   **Expected Result:** "Next" page button is disabled or hidden.
*   **Test Case ID:** SFS_PS_006
    *   **Description:** Verify default sort order of a list view.
    *   **Applies to:** All list views.
    *   **Steps:**
        1.  Navigate to a list view without applying any explicit sort.
    *   **Expected Result:** Items are displayed in the defined default sort order (e.g., by `created_at` descending, by name ascending). This should be known.
*   **Test Case ID:** SFS_PS_007
    *   **Description:** Verify sorting by a specific column in ascending order (e.g., sort Contacts by name A-Z).
    *   **Applies to:** List views with sortable columns.
    *   **Steps:**
        1.  Navigate to a list view.
        2.  Click on a column header to sort by that column (typically first click is ascending).
    *   **Expected Result:** Items are sorted correctly in ascending order based on the selected column's data. Pagination should respect the sort order.
*   **Test Case ID:** SFS_PS_008
    *   **Description:** Verify sorting by a specific column in descending order (e.g., sort Contacts by name Z-A).
    *   **Applies to:** List views with sortable columns.
    *   **Steps:**
        1.  Navigate to a list view.
        2.  Click on a column header twice (typically second click is descending).
    *   **Expected Result:** Items are sorted correctly in descending order based on the selected column's data.
*   **Test Case ID:** SFS_PS_009
    *   **Description:** Verify sorting by date fields (e.g., `created_at`, `updated_at`).
    *   **Applies to:** List views with sortable date columns.
    *   **Steps:**
        1.  Sort by a date column, ascending and descending.
    *   **Expected Result:** Items are sorted chronologically (oldest to newest for asc, newest to oldest for desc).
*   **Test Case ID:** SFS_PS_010
    *   **Description:** Verify sorting by numeric fields (e.g., `contacts.confidence_score`).
    *   **Applies to:** List views with sortable numeric columns.
    *   **Steps:**
        1.  Sort by a numeric column, ascending and descending.
    *   **Expected Result:** Items are sorted numerically (lowest to highest for asc, highest to lowest for desc).
*   **Test Case ID:** SFS_PS_011
    *   **Description:** Verify that applied filters are maintained when changing sort order or navigating pages.
    *   **Applies to:** List views with filters, sorting, and pagination.
    *   **Steps:**
        1.  Apply a filter.
        2.  Change the sort order.
        3.  Navigate to another page.
    *   **Expected Result:** The filter remains active, and the sorting and pagination operate on the filtered subset of data.

## Step 3: Performance, Security (UI/API Level), and User Experience Testing

# Test Cases for Performance & Responsiveness

## 1. Performance & Responsiveness

### 1.1 Page Load Times
*   **Test Case ID:** PERF_PLT_001
    *   **Description:** Measure initial page load time for the Dashboard.
    *   **Applies to:** Dashboard page.
    *   **Tools/Method:** Browser developer tools (Network tab), Lighthouse, WebPageTest, or similar performance analysis tools.
    *   **Steps:**
        1.  Perform a hard refresh of the Dashboard page with an empty cache.
        2.  Measure metrics like First Contentful Paint (FCP), Largest Contentful Paint (LCP), Time to Interactive (TTI), and total load time.
        3.  Repeat measurements multiple times to get an average.
        4.  Test under different network conditions (e.g., simulated fast 3G, slow 3G) if tools allow.
    *   **Expected Result:** Page load metrics should be within acceptable industry standards or pre-defined project benchmarks (e.g., LCP < 2.5s). Identify pages/components that contribute most to load time.
*   **Test Case ID:** PERF_PLT_002
    *   **Description:** Measure page load time for list views with substantial data (e.g., Contacts, Companies, Campaigns).
    *   **Applies to:** List views for major entities.
    *   **Pre-condition:** Ensure the list view contains a significant number of items (e.g., 100+ or 1000+ depending on expected scale) to represent realistic load.
    *   **Tools/Method:** As above.
    *   **Steps:**
        1.  Navigate to the list view (e.g., Contacts page).
        2.  Perform measurements as in PERF_PLT_001.
    *   **Expected Result:** Load times should be acceptable even with large datasets. Identify if pagination, infinite scrolling, or virtualization techniques are effective.
*   **Test Case ID:** PERF_PLT_003
    *   **Description:** Measure load time for pages with complex data queries or multiple components (e.g., a detailed Campaign view with associated stats, recipients, and templates).
    *   **Applies to:** Complex view pages.
    *   **Tools/Method:** As above.
    *   **Steps:**
        1.  Navigate to a complex entity detail page.
        2.  Perform measurements.
    *   **Expected Result:** Load times remain within acceptable limits. Identify slow database queries or component rendering bottlenecks via network tab and profiler.
*   **(General Note):** Identify critical user flows and measure page load times at each step of these flows.

### 1.2 UI Responsiveness
*   **Test Case ID:** PERF_RESP_001
    *   **Description:** Verify layout and usability on various desktop screen resolutions.
    *   **Applies to:** Entire application.
    *   **Tools/Method:** Browser developer tools (responsive mode), testing on actual different resolution monitors.
    *   **Screen Resolutions (Examples):** 1920x1080, 1366x768, 2560x1440.
    *   **Steps:**
        1.  Open the application on each target desktop resolution.
        2.  Navigate through all key pages and features.
        3.  Check for layout breaks, overlapping elements, unreadable text, horizontal scrolling (where not intended), and elements being cut off.
        4.  Ensure all interactive elements (buttons, forms, menus) are accessible and usable.
    *   **Expected Result:** Application layout adapts correctly to different desktop resolutions without usability issues.
*   **Test Case ID:** PERF_RESP_002
    *   **Description:** Verify layout and usability on tablet screen sizes (portrait and landscape).
    *   **Applies to:** Entire application.
    *   **Tools/Method:** Browser developer tools (responsive mode for common tablets like iPad, Galaxy Tab), testing on actual tablet devices.
    *   **Screen Sizes (Examples):** 768x1024 (iPad Portrait), 1024x768 (iPad Landscape).
    *   **Steps:** Similar to PERF_RESP_001, but for tablet sizes and orientations. Pay attention to touch target sizes.
    *   **Expected Result:** Application provides a good user experience on tablets. Navigation should be touch-friendly.
*   **Test Case ID:** PERF_RESP_003
    *   **Description:** Verify layout and usability on mobile screen sizes (portrait and landscape).
    *   **Applies to:** Entire application.
    *   **Tools/Method:** Browser developer tools (responsive mode for common phones like iPhone, Pixel, Samsung Galaxy), testing on actual mobile devices.
    *   **Screen Sizes (Examples):** 375x667 (iPhone 8), 390x844 (iPhone 12/13), 412x915 (Pixel 5/6).
    *   **Steps:** Similar to PERF_RESP_001, for mobile sizes. Check for readability, touch target sizes, and ease of navigation (e.g., hamburger menus).
    *   **Expected Result:** Application is fully responsive and usable on mobile devices. Content is readable, and interactions are optimized for touch.
*   **Test Case ID:** PERF_RESP_004
    *   **Description:** Verify application behavior across different modern browsers.
    *   **Applies to:** Entire application.
    *   **Browsers:** Latest stable versions of Chrome, Firefox, Safari, Edge.
    *   **Steps:**
        1.  Execute a smoke test suite or key user flows on each target browser.
        2.  Look for rendering differences, JavaScript errors in the console, and feature malfunctions specific to a browser.
    *   **Expected Result:** Application functions consistently and correctly across all supported browsers. Minor styling differences might be acceptable if functionality isn't impacted.

### 1.3 Concurrent Usage (Conceptual)
*   **Test Case ID:** PERF_CONC_001
    *   **Description:** (Conceptual) Observe system behavior when multiple users perform similar actions simultaneously (e.g., multiple users trying to edit the same campaign or sign up at the same time).
    *   **Applies to:** Key mutable entities, signup process.
    *   **Tools/Method:** This often requires specialized load testing tools (e.g., k6, JMeter, Playwright with parallel execution) or coordinated manual testing. For UI focus, observe for data inconsistencies or unexpected UI states.
    *   **Steps:**
        1.  Coordinate testers or configure a tool to simulate N users concurrently accessing and modifying shared resources or performing high-traffic actions.
        2.  Monitor application logs (`system_logs`, `audit_logs`) for errors.
        3.  Monitor database for deadlocks or performance issues.
        4.  Observe UI for data integrity issues (e.g., if optimistic/pessimistic locking is implemented, how does UI reflect conflicts?).
    *   **Expected Result:** The system handles concurrent requests gracefully without data corruption, deadlocks, or significant performance degradation visible to users. UI should provide appropriate feedback if conflicts occur (e.g., "This record was updated by another user. Please refresh.").
*   **Test Case ID:** PERF_CONC_002
    *   **Description:** (Conceptual) Assess general application responsiveness under moderate simulated load.
    *   **Applies to:** Entire application.
    *   **Tools/Method:** Load testing tools.
    *   **Steps:**
        1.  Simulate a realistic number of virtual users performing common workflows.
        2.  While the load test is running, manually navigate key parts of the application as a single user.
    *   **Expected Result:** Manual navigation should still feel responsive. Page load times (observed manually) should not degrade excessively compared to no-load scenarios.

### 1.4 Data Fetching Optimization
*   **Test Case ID:** PERF_DFO_001
    *   **Description:** Verify efficient data fetching on initial load of data-intensive pages.
    *   **Applies to:** Dashboard, list views, complex detail pages.
    *   **Tools/Method:** Browser developer tools (Network tab).
    *   **Steps:**
        1.  Open the Network tab in browser dev tools.
        2.  Perform a hard refresh of a data-intensive page.
        3.  Analyze the API requests made:
            *   Are there redundant calls for the same data?
            *   Is data being over-fetched (requesting more fields than displayed/needed)?
            *   Is data being under-fetched (leading to waterfalls of subsequent requests)?
            *   Are appropriate Next.js data fetching strategies (Server Components, `getServerSideProps`, client-side with SWR/React Query, etc.) being used for the page type?
    *   **Expected Result:** Data fetching is optimized. Minimal necessary API calls are made. Payloads are appropriately sized. Correct fetching strategy is employed for the page's needs (SSR for SEO/initial data, CSR for dynamic updates).
*   **Test Case ID:** PERF_DFO_002
    *   **Description:** Verify efficient data fetching during client-side interactions (filtering, sorting, pagination).
    *   **Applies to:** List views with client-side updates.
    *   **Tools/Method:** Browser developer tools (Network tab).
    *   **Steps:**
        1.  Navigate to a list view.
        2.  Perform actions like applying filters, changing sort order, or navigating pages (if these trigger API calls).
        3.  Analyze the API requests made for these interactions.
    *   **Expected Result:** API calls fetch only the necessary delta of data or correctly paginated/filtered/sorted data. Avoid re-fetching unchanged data. Client-side caching (SWR/React Query) should be effective if used.
*   **Test Case ID:** PERF_DFO_003
    *   **Description:** Verify image optimization and loading.
    *   **Applies to:** Pages with images.
    *   **Tools/Method:** Browser developer tools (Network tab, Lighthouse).
    *   **Steps:**
        1.  Load pages containing images.
        2.  Check image formats (e.g., WebP preferred), compression levels, and if responsive images (`<picture>` element or `srcset` attribute) are used.
        3.  Verify if Next.js Image component (`next/image`) is used for optimization (lazy loading, resizing).
    *   **Expected Result:** Images are optimized for web delivery. `next/image` is utilized where appropriate. Lazy loading is implemented for off-screen images.

# Test Cases for Security (UI/API Level) & Row Level Security (RLS)

## 2. Security (UI/API Level) & Row Level Security (RLS) Verification

### 2.1 Authentication & Authorization
*   **Test Case ID:** SEC_AA_001
    *   **Description:** Verify 'owner' role can access all features and data within their organization.
    *   **Applies to:** All application features.
    *   **Steps:**
        1.  Log in as a user with the 'owner' role for Organization A.
        2.  Attempt to access/use all administrative functions (e.g., organization settings, team member management, billing if applicable).
        3.  Attempt to perform CRUD operations on all key entities within their organization (Scrapers, Campaigns, Contacts, etc.).
    *   **Expected Result:** User successfully accesses and uses all features permitted for an 'owner'. No access denied errors for intended functionalities within their own organization.
*   **Test Case ID:** SEC_AA_002
    *   **Description:** Verify 'admin' role can access administrative features and data within their organization as defined (e.g., may not have billing or organization deletion rights, if distinct from owner).
    *   **Applies to:** Admin-level features.
    *   **Steps:**
        1.  Log in as a user with the 'admin' role for Organization A.
        2.  Attempt to access features permitted for an 'admin' (e.g., team member management, campaign creation).
        3.  Attempt to access features potentially restricted to 'owner' only (e.g., deleting the organization, changing ownership - define based on actual role differences).
    *   **Expected Result:** User successfully accesses 'admin' features. Access is denied for 'owner-only' features.
*   **Test Case ID:** SEC_AA_003
    *   **Description:** Verify 'member' role has restricted access (e.g., can view/edit assigned items, cannot access organization settings or invite users).
    *   **Applies to:** Member-level features, restricted areas.
    *   **Steps:**
        1.  Log in as a user with the 'member' role for Organization A.
        2.  Attempt to access features they should be able to use (e.g., view campaigns they are part of, manage their own profile).
        3.  Attempt to access organization settings, invite users, or view/edit data they don't have explicit or implicit rights to.
    *   **Expected Result:** User successfully accesses permitted features. Access is denied for unauthorized features/data with a clear message.
*   **Test Case ID:** SEC_AA_004
    *   **Description:** Verify successful user login with valid credentials.
    *   **Applies to:** Login page.
    *   **Steps:**
        1.  Navigate to the login page.
        2.  Enter valid email and password for an existing active user.
        3.  Submit.
    *   **Expected Result:** User is logged in successfully and redirected to the dashboard or appropriate landing page. A session is established.
*   **Test Case ID:** SEC_AA_005
    *   **Description:** Verify failed user login with invalid credentials.
    *   **Applies to:** Login page.
    *   **Steps:**
        1.  Navigate to the login page.
        2.  Enter invalid email/password combinations (wrong email, wrong password, non-existent user).
    *   **Expected Result:** Login fails. A clear error message (e.g., "Invalid email or password") is displayed. No specific information on whether email or password was wrong should be given (to prevent user enumeration).
*   **Test Case ID:** SEC_AA_006
    *   **Description:** Verify "Remember Me" functionality correctly persists session across browser restarts (if implemented).
    *   **Applies to:** Login page.
    *   **Steps:**
        1.  Log in with "Remember Me" checked.
        2.  Close the browser completely.
        3.  Re-open the browser and navigate to the application.
    *   **Expected Result:** User is still logged in or session is easily re-established without needing full credentials.
*   **Test Case ID:** SEC_AA_007
    *   **Description:** Verify session expiry and redirection to login.
    *   **Applies to:** Entire application after login.
    *   **Steps:**
        1.  Log in.
        2.  Allow the session to expire (based on configured timeout, may need to wait or have a way to accelerate this in test).
        3.  Attempt to perform an action or navigate to a protected page.
    *   **Expected Result:** User is automatically redirected to the login page, or their next action prompts for re-login.
*   **Test Case ID:** SEC_AA_008
    *   **Description:** Verify successful logout and session termination.
    *   **Applies to:** Logout functionality.
    *   **Steps:**
        1.  Log in.
        2.  Click the logout button/link.
    *   **Expected Result:** User is logged out. Session is terminated. User is redirected to the login page or public homepage. Accessing protected pages should require re-login.
*   **Test Case ID:** SEC_AA_009
    *   **Description:** Verify API keys grant correct permissions to resources as defined by their associated user/role and `api_keys.permissions`.
    *   **Applies to:** API endpoints requiring API key authentication.
    *   **Tools/Method:** API testing tool (e.g., Postman, curl).
    *   **Steps:**
        1.  Generate an API key for a user with specific permissions (e.g., read-only for campaigns).
        2.  Using an API client, attempt to access permitted resources (e.g., GET /api/campaigns) with the key.
        3.  Attempt to access non-permitted resources (e.g., POST /api/campaigns, or GET /api/users) with the same key.
    *   **Expected Result:** Permitted actions are successful. Non-permitted actions return 403 Forbidden or appropriate authorization error.
*   **Test Case ID:** SEC_AA_010
    *   **Description:** Verify API keys cannot be used to access unauthorized resources even if IDs are known.
    *   **Applies to:** API endpoints.
    *   **Steps:**
        1.  Using a valid API key for Organization A, attempt to access an API endpoint for a resource belonging to Organization B by guessing/knowing its ID (e.g., GET /api/campaigns/[org_B_campaign_id]).
    *   **Expected Result:** API returns 403 Forbidden or 404 Not Found (as if the resource doesn't exist for this user). No data from Organization B is returned.

### 2.2 Data Isolation (RLS Verification via UI) - CRITICAL
*   **Test Case ID:** SEC_RLS_001
    *   **Description:** Verify a user from Organization A cannot view any list data (Contacts, Companies, Campaigns, Scrapers, Templates, etc.) belonging to Organization B.
    *   **Applies to:** All list views.
    *   **Steps:**
        1.  Log in as a user belonging to Organization A.
        2.  Navigate to every list view in the application.
    *   **Expected Result:** Only data associated with Organization A is displayed. No items from Organization B or any other organization are visible in any list.
*   **Test Case ID:** SEC_RLS_002
    *   **Description:** Verify a user from Organization A cannot directly access/view detail pages of entities belonging to Organization B, even if an ID is known/guessed.
    *   **Applies to:** All entity detail/view pages.
    *   **Steps:**
        1.  Log in as a user belonging to Organization A.
        2.  Obtain (e.g., from another test session or database inspection) the ID of an entity belonging to Organization B (e.g., a campaign ID).
        3.  Attempt to construct and navigate to the detail page URL for that Organization B entity (e.g., `/orgA/campaigns/[org_B_campaign_id]` or `/campaigns/[org_B_campaign_id]` if URLs are not org-prefixed but RLS should still apply).
    *   **Expected Result:** User is shown a "Not Found" (404) page or an "Access Denied" (403) page. No data from Organization B's entity is displayed.
*   **Test Case ID:** SEC_RLS_003
    *   **Description:** Verify a user from Organization A cannot edit/update entities belonging to Organization B, even if an ID is known and edit URL is accessed.
    *   **Applies to:** All entity edit pages/forms.
    *   **Steps:**
        1.  Log in as a user from Organization A.
        2.  Obtain ID of an entity from Organization B.
        3.  Attempt to navigate to the edit page URL for that entity.
        4.  If page loads (it shouldn't ideally), attempt to change data and save.
    *   **Expected Result:** Access to edit page is denied (403/404). If page loads due to a flaw, save action must fail with an authorization error. No data in Organization B is altered.
*   **Test Case ID:** SEC_RLS_004
    *   **Description:** Verify a user from Organization A cannot delete entities belonging to Organization B.
    *   **Applies to:** All delete functionalities.
    *   **Steps:**
        1.  Log in as a user from Organization A.
        2.  Obtain ID of an entity from Organization B.
        3.  Attempt to trigger a delete action for that entity (e.g., via a crafted API call if UI path is blocked, or if a UI flaw allows).
    *   **Expected Result:** Deletion fails with an authorization error or 404. No data in Organization B is deleted.
*   **Test Case ID:** SEC_RLS_005
    *   **Description:** Verify search results are strictly scoped to the user's organization.
    *   **Applies to:** All search functionalities.
    *   **Steps:**
        1.  Ensure Data exists in Org A and Org B with similar searchable terms.
        2.  Log in as a user from Organization A.
        3.  Perform searches using terms that would match data in both Org A and Org B.
    *   **Expected Result:** Search results only contain items from Organization A. No items from Organization B appear.
*   **Test Case ID:** SEC_RLS_006
    *   **Description:** Verify filtering results are strictly scoped to the user's organization.
    *   **Applies to:** All list views with filtering.
    *   **Steps:**
        1.  Log in as a user from Organization A.
        2.  Apply various filters on list views.
    *   **Expected Result:** Filtered results only contain items from Organization A that match the criteria.
*   **Test Case ID:** SEC_RLS_007
    *   **Description:** Verify reports or data exports are strictly scoped to the user's organization.
    *   **Applies to:** Reporting/export features.
    *   **Steps:**
        1.  Log in as a user from Organization A.
        2.  Generate any available reports or data exports.
    *   **Expected Result:** The generated report/export only contains data from Organization A.
*   **Test Case ID:** SEC_RLS_008
    *   **Description:** Verify counts, summaries, and dashboard widgets only reflect data from the user's organization.
    *   **Applies to:** Dashboard, any UI element displaying aggregate data.
    *   **Steps:**
        1.  Log in as a user from Organization A.
        2.  Observe counts (e.g., number of contacts, active campaigns) on dashboard and list views.
    *   **Expected Result:** All aggregates accurately reflect data solely from Organization A. Compare against known DB counts for Org A if possible.

### 2.3 Input Sanitization & XSS/Injection
*   **Test Case ID:** SEC_IS_001
    *   **Description:** Attempt Cross-Site Scripting (XSS) by inputting basic script tags into various text fields.
    *   **Applies to:** All user-input text fields (e.g., names, descriptions, template content, campaign details, scraper configs).
    *   **Payload Example:** `<script>alert('XSS')</script>`
    *   **Steps:**
        1.  Navigate to a form with a text input field.
        2.  Enter the XSS payload.
        3.  Save the data.
        4.  View the page where this data is rendered.
    *   **Expected Result:** The script is not executed. The input should be displayed as sanitized text (e.g., `&lt;script&gt;alert('XSS')&lt;/script&gt;`) or the input is rejected. No alert box appears.
*   **Test Case ID:** SEC_IS_002
    *   **Description:** Attempt XSS using HTML event attributes.
    *   **Applies to:** Text fields, especially those that might render HTML (e.g., rich text editors if any).
    *   **Payload Example:** `<img src=x onerror=alert('XSS')>`
    *   **Steps:** Similar to SEC_IS_001.
    *   **Expected Result:** Script within the event attribute does not execute. Input is sanitized or rejected.
*   **Test Case ID:** SEC_IS_003
    *   **Description:** Attempt basic SQL Injection (SQLi) payloads in input fields.
    *   **Applies to:** Search fields, ID fields if manually editable, any field that might be used in a DB query.
    *   **Payload Examples:** `' OR '1'='1`, `'; DROP TABLE users; --`
    *   **Steps:**
        1.  Enter SQLi payload into a susceptible input field.
        2.  Submit/Save/Search.
    *   **Expected Result:** Application does not crash or reveal database errors. Ideally, input is rejected or treated as literal string. No unintended database operations occur (verify by checking data integrity or looking for errors in logs, though successful SQLi might not always error out visibly). Parameterized queries/prepared statements (expected from Prisma) should prevent this.
*   **Test Case ID:** SEC_IS_004
    *   **Description:** Attempt to inject malicious data into JSONB fields (if UI allows raw JSON input).
    *   **Applies to:** UI sections for editing raw JSONB (e.g., `scraper_configs.config`).
    *   **Payload Example:** `{"key": "<script>alert('XSS_JSON')</script>"}`
    *   **Steps:**
        1.  Enter JSON with XSS payload as a value.
        2.  Save and view where this JSON value is rendered.
    *   **Expected Result:** The script within the JSON value is not executed when rendered. It's treated as a string.
*   **Test Case ID:** SEC_IS_005
    *   **Description:** Attempt to inject harmful content into template `content` fields.
    *   **Applies to:** `templates.content`.
    *   **Payload Example:** Email/SMS template with malicious links or scripts (e.g., using template tags to construct them if possible `{{user_input_containing_script}}`).
    *   **Steps:**
        1. Create/edit a template.
        2. Insert XSS payloads or other injection strings into the template body.
        3. Preview or "send" (to a test recipient) the template.
    *   **Expected Result:** Injected scripts are not executed in the preview or the final rendered communication. Output is sanitized.

### 2.4 Sensitive Data Exposure
*   **Test Case ID:** SEC_SDE_001
    *   **Description:** Verify sensitive data (passwords, API keys) is not present in client-side source code (HTML, JS bundles).
    *   **Applies to:** Browser view-source, developer tools (Sources tab).
    *   **Steps:**
        1.  Browse the application.
        2.  View page source and inspect loaded JavaScript files.
        3.  Search for hardcoded passwords, API keys, or other sensitive tokens.
    *   **Expected Result:** No sensitive data is found hardcoded in client-side assets.
*   **Test Case ID:** SEC_SDE_002
    *   **Description:** Verify sensitive data is not unnecessarily exposed in API responses observed in network requests.
    *   **Applies to:** Browser developer tools (Network tab).
    *   **Steps:**
        1.  Perform various actions (login, viewing entities, saving forms).
        2.  Inspect API request/response bodies in the Network tab.
    *   **Expected Result:** API responses do not include plaintext passwords (hashed is fine for user records if needed for some client logic, but ideally not even that), unmasked API keys of other users/systems, or excessive user PII not required for the current view.
*   **Test Case ID:** SEC_SDE_003
    *   **Description:** Verify sensitive data is not exposed in UI error messages.
    *   **Applies to:** All UI error messages.
    *   **Steps:**
        1.  Trigger various errors (validation, server errors, etc., as in EHF test cases).
        2.  Examine the error messages displayed in the UI.
    *   **Expected Result:** Error messages are user-friendly and do not contain stack traces, database dumps, internal paths, or other sensitive system information.
*   **Test Case ID:** SEC_SDE_004
    *   **Description:** Verify user emails or other PII are not exposed in public URLs or easily guessable parameters if not necessary.
    *   **Applies to:** URL structure.
    *   **Steps:**
        1.  Navigate through the application, paying attention to URL parameters for user profiles, etc.
    *   **Expected Result:** URLs use non-guessable IDs (UUIDs) for resources. Avoid using emails or sequential integers as primary identifiers in URLs where possible, especially for user-specific resources accessible by others if not careful.

# Test Cases for User Experience (UX) & Usability

## 3. User Experience (UX) & Usability

### 3.1 Intuitive Navigation
*   **Test Case ID:** UX_NAV_001
    *   **Description:** Assess clarity and predictability of main navigation elements (e.g., side menu, top bar).
    *   **Applies to:** Entire application, primary navigation components.
    *   **Method:** Heuristic evaluation, task-based exploration.
    *   **Steps/Questions for QA Engineer:**
        1.  Can users easily understand where each navigation link will take them?
        2.  Are navigation labels clear, concise, and reflective of the content they lead to?
        3.  Is the current location within the application clearly indicated (e.g., highlighted menu item, breadcrumbs)?
        4.  Is it easy to return to the main dashboard or previous pages?
        5.  Is the navigation structure logical and consistent across different sections of the app?
    *   **Expected Result:** Navigation is intuitive. Users can easily find key features and understand their current position within the app without confusion.
*   **Test Case ID:** UX_NAV_002
    *   **Description:** Evaluate ease of completing common user tasks and workflows.
    *   **Applies to:** Key user flows (e.g., creating a campaign, inviting a team member, generating a report).
    *   **Method:** Task completion analysis.
    *   **Steps/Questions for QA Engineer:**
        1.  Define 3-5 key user tasks.
        2.  Attempt to complete these tasks without prior specific instructions for that flow.
        3.  How many clicks/steps does it take? Is it efficient?
        4.  Are there any points of confusion or dead ends in the workflow?
        5.  Are necessary actions and next steps clearly signposted?
    *   **Expected Result:** Users can complete common tasks efficiently and without frustration. Workflows feel logical and guide the user appropriately.
*   **Test Case ID:** UX_NAV_003
    *   **Description:** Check for consistency in placement and behavior of common UI elements (e.g., save buttons, cancel buttons, search bars, filters).
    *   **Applies to:** Entire application.
    *   **Method:** UI review.
    *   **Steps/Questions for QA Engineer:**
        1.  Are "Save" and "Cancel" buttons consistently placed in forms?
        2.  Do search bars and filter controls look and behave similarly across different list views?
        3.  Is the visual hierarchy clear, guiding the user's attention to primary actions?
    *   **Expected Result:** Consistent placement and behavior of common UI controls reduce cognitive load and improve predictability.

### 3.2 Form Clarity
*   **Test Case ID:** UX_FORM_001
    *   **Description:** Evaluate clarity of form field labels and instructions.
    *   **Applies to:** All forms in the application.
    *   **Method:** Heuristic evaluation.
    *   **Steps/Questions for QA Engineer:**
        1.  Are all form fields clearly labeled?
        2.  Do labels accurately describe the information required?
        3.  Are there placeholder texts or tooltips for fields requiring specific formats or examples? Are they helpful?
        4.  Are required fields clearly marked (e.g., with an asterisk)?
    *   **Expected Result:** Form fields are easy to understand. Users know what information is needed for each field and in what format.
*   **Test Case ID:** UX_FORM_002
    *   **Description:** Assess logical grouping and flow of fields within forms.
    *   **Applies to:** Complex forms with multiple sections.
    *   **Method:** Heuristic evaluation.
    *   **Steps/Questions for QA Engineer:**
        1.  Are related fields grouped together logically (e.g., in sections or fieldsets)?
        2.  Does the tab order through form fields follow a logical sequence?
        3.  For long forms, is there any visual separation or progress indication?
    *   **Expected Result:** Forms are well-organized, making them less daunting and easier to complete.
*   **Test Case ID:** UX_FORM_003
    *   **Description:** Evaluate feedback provided during and after form submission (e.g., inline validation, success/error messages).
    *   **Applies to:** All forms.
    *   **Method:** Review (related to EHF_UE_005 but from a UX perspective).
    *   **Steps/Questions for QA Engineer:**
        1.  Is inline validation feedback provided promptly and clearly as the user types (if applicable)?
        2.  Are success messages clear and reassuring after successful submission?
        3.  Are error messages (from client or server validation) clear, concise, and helpful in guiding the user to fix the problem (as covered in EHF section)?
    *   **Expected Result:** Users receive timely and clear feedback, helping them complete forms successfully and understand any errors.

### 3.3 Accessibility (Basic Checks)
*   **Test Case ID:** UX_A11Y_001
    *   **Description:** Verify keyboard navigability for critical interactive elements.
    *   **Applies to:** Main navigation, forms, buttons, links, list views.
    *   **Method:** Manual keyboard testing.
    *   **Steps/Questions for QA Engineer:**
        1.  Can you navigate through all interactive elements on a page using only the Tab key (and Shift+Tab)?
        2.  Is the focus indicator clearly visible for the currently focused element?
        3.  Can you activate buttons and links using Enter/Spacebar?
        4.  Can you interact with form fields (text input, select, checkbox, radio) using the keyboard?
    *   **Expected Result:** All interactive elements are reachable and operable via keyboard. Focus is always visible.
*   **Test Case ID:** UX_A11Y_002
    *   **Description:** Perform a basic check of screen reader compatibility for critical components.
    *   **Applies to:** Key pages like Dashboard, a sample form, a sample list view.
    *   **Tools/Method:** Use a screen reader (e.g., NVDA for Windows, VoiceOver for macOS, TalkBack for Android).
    *   **Steps/Questions for QA Engineer:**
        1.  Turn on a screen reader.
        2.  Navigate to a critical page.
        3.  Does the screen reader announce page titles, headings, form labels, link text, and button text correctly?
        4.  Are images with important information given appropriate alt text (or marked as decorative if they are)?
    *   **Expected Result:** Screen reader provides a meaningful interpretation of the page content, allowing users with visual impairments to understand and interact with critical components. (Full WCAG compliance is a deeper topic, this is a basic check).
*   **Test Case ID:** UX_A11Y_003
    *   **Description:** Check for sufficient color contrast for text and important UI elements.
    *   **Applies to:** Entire application.
    *   **Tools/Method:** Browser developer tools (contrast checker), online contrast checking tools.
    *   **Steps/Questions for QA Engineer:**
        1.  Inspect text elements, button text, and icons against their backgrounds.
        2.  Use a tool to check if contrast ratios meet WCAG AA guidelines (e.g., 4.5:1 for normal text, 3:1 for large text).
    *   **Expected Result:** Text and important UI elements have sufficient color contrast to be easily readable by users with low vision.

### 3.4 Consistency
*   **Test Case ID:** UX_CONS_001
    *   **Description:** Verify consistency in UI elements (buttons, icons, input fields, dropdowns) across the application.
    *   **Applies to:** Entire application.
    *   **Method:** Visual review across different modules/pages.
    *   **Steps/Questions for QA Engineer:**
        1.  Do primary action buttons look and feel the same everywhere?
        2.  Are icons used consistently and do they clearly represent their actions?
        3.  Is the styling of form elements (text boxes, dropdowns, checkboxes) uniform?
    *   **Expected Result:** Consistent UI elements create a cohesive and predictable user experience.
*   **Test Case ID:** UX_CONS_002
    *   **Description:** Verify consistency in terminology and language used throughout the application.
    *   **Applies to:** All text content (labels, messages, instructions, button text).
    *   **Method:** Content review.
    *   **Steps/Questions for QA Engineer:**
        1.  Is the same term used for the same concept everywhere (e.g., "Campaign" vs "Promotion")?
        2.  Is the tone of language consistent (e.g., formal vs. informal)?
        3.  Are date/time formats, number formats, and capitalization applied consistently?
    *   **Expected Result:** Consistent terminology and language reduce confusion and improve user understanding.

### 3.5 Error Messages & Guidance (UX Focus)
*   **Test Case ID:** UX_EMG_001
    *   **Description:** Evaluate helpfulness and clarity of error messages (beyond just showing them, as covered in EHF).
    *   **Applies to:** All error messages.
    *   **Method:** Review of error messages encountered during testing (especially from IDV and EHF sections).
    *   **Steps/Questions for QA Engineer:**
        1.  Do error messages clearly explain what went wrong in simple language?
        2.  Do they suggest how the user might fix the problem?
        3.  Are they polite and avoid blaming the user?
        4.  Are they visually distinct and easy to spot?
    *   **Expected Result:** Error messages are constructive, guiding the user towards resolving the issue.
*   **Test Case ID:** UX_EMG_002
    *   **Description:** Assess availability and clarity of user guidance (tooltips, help text, empty state messages).
    *   **Applies to:** Areas where users might need assistance or context.
    *   **Method:** Exploratory testing.
    *   **Steps/Questions for QA Engineer:**
        1.  Are there tooltips for complex icons or fields that require explanation? Are they easy to trigger and understand?
        2.  When a list is empty (e.g., no campaigns created yet), does the UI provide helpful "empty state" text guiding the user on what to do next (e.g., "You haven't created any campaigns yet. Click here to start!")?
        3.  Is there any onboarding guidance or contextual help for new users or complex features?
    *   **Expected Result:** Users are provided with appropriate guidance when they might need it, making the application easier to learn and use.

# Test Cases for Natural Language Search Feature

## 1. Cache System
*   **Test Case ID:** NLS_CACHE_001
    *   **Description:** Verify search results are correctly cached in the api_cache table.
    *   **Steps:**
        1. Perform a search query
        2. Verify the result is stored in api_cache table
        3. Perform the same query again
        4. Verify the cached result is returned
    *   **Expected Result:** Second query returns cached result faster than first query.

*   **Test Case ID:** NLS_CACHE_002
    *   **Description:** Verify cache expiration works correctly.
    *   **Steps:**
        1. Perform a search query
        2. Wait for cache to expire (1 hour)
        3. Perform the same query again
    *   **Expected Result:** Second query fetches fresh results after cache expiration.

*   **Test Case ID:** NLS_CACHE_003
    *   **Description:** Verify metadata is correctly stored with cached results.
    *   **Steps:**
        1. Perform a search query
        2. Check api_cache table for metadata column
    *   **Expected Result:** Metadata contains source information and query details.

## 2. Rate Limiting
*   **Test Case ID:** NLS_RATE_001
    *   **Description:** Verify rate limiting works for different organization plans.
    *   **Steps:**
        1. Set up test organizations with different plans
        2. Perform multiple searches within time window
    *   **Expected Result:** Rate limits are enforced according to plan limits.

*   **Test Case ID:** NLS_RATE_002
    *   **Description:** Verify rate limit reset works correctly.
    *   **Steps:**
        1. Hit rate limit
        2. Wait for reset period
        3. Try searching again
    *   **Expected Result:** Searches work again after reset period.

## 3. Search History
*   **Test Case ID:** NLS_HIST_001
    *   **Description:** Verify search history is recorded correctly.
    *   **Steps:**
        1. Perform multiple searches
        2. Check search_history table
    *   **Expected Result:** Each search is recorded with correct metadata and execution time.

*   **Test Case ID:** NLS_HIST_002
    *   **Description:** Verify search history includes source information.
    *   **Steps:**
        1. Perform searches with different sources
        2. Check search_history.sources array
    *   **Expected Result:** Sources array correctly reflects which data sources were used.

## 4. Query Parsing
*   **Test Case ID:** NLS_QUERY_001
    *   **Description:** Verify OpenAI query parsing works correctly.
    *   **Steps:**
        1. Enter natural language query
        2. Check parsed parameters
    *   **Expected Result:** Query is correctly parsed into structured parameters.

*   **Test Case ID:** NLS_QUERY_002
    *   **Description:** Verify handling of complex queries.
    *   **Steps:**
        1. Enter complex query with multiple conditions
        2. Check parsed parameters
    *   **Expected Result:** Complex query is correctly parsed into structured parameters.

## 5. Data Sources
*   **Test Case ID:** NLS_DATA_001
    *   **Description:** Verify integration with public business registries.
    *   **Steps:**
        1. Search for company information
        2. Verify results from business registries
    *   **Expected Result:** Results include data from public registries.

*   **Test Case ID:** NLS_DATA_002
    *   **Description:** Verify integration with Wikidata.
    *   **Steps:**
        1. Search for entity information
        2. Verify results from Wikidata
    *   **Expected Result:** Results include data from Wikidata.

*   **Test Case ID:** NLS_DATA_003
    *   **Description:** Verify fallback to Google search when no results found.
    *   **Steps:**
        1. Search for obscure term
        2. Check response for Google fallback
    *   **Expected Result:** System suggests Google search when no results found.

## 6. Error Handling
*   **Test Case ID:** NLS_ERR_001
    *   **Description:** Verify handling of API failures.
    *   **Steps:**
        1. Simulate API failure
        2. Check error response
    *   **Expected Result:** User receives clear error message.

*   **Test Case ID:** NLS_ERR_002
    *   **Description:** Verify handling of rate limit exceeded.
    *   **Steps:**
        1. Exceed rate limit
        2. Check error response
    *   **Expected Result:** User receives clear rate limit message.
