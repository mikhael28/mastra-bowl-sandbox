# Attio | Journeybee Help Center
- URL: https://support.journeybee.io/article/attio
- Query: Independent technical reviews and engineer writeups of Attio (2024–2026): API capabilities, webhook examples, custom objects, automation/workflow limits, and email sync behavior
## Summary

Summary tailored to the user query

- Topic: Attio integration capabilities with Journeybee
- What it is: A two-way integration between Journeybee and Attio that synchronizes partners, leads, people, companies, and deals, with real-time updates via webhooks and automatic relationship linking.
- Key capabilities:
  - Two-way data synchronization between Attio and Journeybee
  - Optional mapping to Attio objects: Partners can map to Attio Companies or custom objects; supports People, Companies, and Deals
  - Flexible field and object mapping: Map Journeybee partner fields to Attio attributes (e.g., company name, partner type, stage, custom fields); lead/deal field mappings (Deal Name, Value, Stage, Close Date, custom fields)
  - Unique field matching to prevent duplicates (configurable identifier like email, domain, or company name)
  - Automatic relationship linking: People linked to their Companies; auto-maintained distributor-reseller relationships
  - Hierarchy support: Multi-tier partner structures preserved across platforms
  - Real-time updates: Webhooks for instant data synchronization
  - Lead and deal synchronization: Lead objects map to Person/Company in Attio; Deal fields map to Attio Deal attributes; deal stages synced
  - Custom field support and duplicate prevention features
- Configuration essentials:
  - Prerequisites: Active Journeybee admin account and Attio workspace with appropriate permissions
  - Connection flow: OAuth-based connection from Journeybee Settings → Integrations → Attio
  - Field and object mapping: Define how Journeybee fields map to Attio People, Companies, and Deals; set up unique field matching and association rules
  - Lead/Deal mapping: Align Journeybee leads and deals with Attio objects and fields; establish partner associations for originating leads
- Practical notes for engineers:
  - Supports custom objects in Attio for partner data; ensure correct field types (text, select/status, currency, date) align with Attio schemas
  - Webhook support enables near real-time synch, but plan for eventual consistency in edge cases
  - Offers hierarchical relationship maintenance to reflect distributor-reseller networks
  - Duplicate prevention relies on configurable unique identifiers; consider using emails or domain-based matching for partners
- Limitations to verify (potential areas to explore in tech reviews):
  - Rate limits and webhook retry behavior
  - Depth/limits of hierarchical synchronization for large partner networks
  - Extent of automation/workflow triggers beyond basic sync (e.g., conditional field updates)
  - Handling of conflicts when fields are updated concurrently in Journeybee and Attio
- Overall value proposition: Enables seamless cross-platform partner relationship management by keeping partners, leads, people, companies, and deals in sync, with robust deduplication, flexible mapping, and automatic relationship maintenance.
