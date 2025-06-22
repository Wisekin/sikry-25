-- Indexes for discovery tables

CREATE INDEX idx_discovery_requests_status ON discovery_requests(status);
CREATE INDEX idx_scraped_data_company_id ON scraped_data(company_id);