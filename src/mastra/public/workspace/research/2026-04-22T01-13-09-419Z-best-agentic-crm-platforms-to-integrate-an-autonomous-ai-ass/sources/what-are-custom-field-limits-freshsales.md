# What are custom field limits? : Freshsales
- URL: https://crmsupport.freshworks.com/support/solutions/articles/50000002390-what-are-custom-field-limits-
- Query: Freshsales (Freshworks CRM) API limits, custom object and module support, workflow action limits, email sync implementation, and pricing — vendor docs and independent benchmarks
## Summary

Summary:
The page explains custom field limits in Freshsales (Freshworks CRM), detailing how many fields you can create per entity and per plan, plus how limits interact with downgrades and specific field types. Key points include:

- Per-entity field caps by plan (Free, Growth, Pro, Enterprise) across field types (text, dropdown/radio, text area, multi-select, number, checkbox, date picker, lookup, formula).
- Example caps (Growth): up to 150 fields each for contacts, accounts, deals, and custom modules.
- Maximum field limits by type (illustrative values; check latest doc for exact numbers):
  - Text field: up to 70 (Enterprise), 30 (Pro), 20 (Growth)
  - Dropdown/Radio: up to 250 (Enterprise), 40 (Pro), 30 (Growth)
  - Text area: up to 20 (Enterprise), 10 (Pro), 5 (Growth)
  - Multi-select: up to 30 (Enterprise), 10 (Pro), 5 (Growth)
  - Number: up to 70 (Enterprise), 50 (Pro), 30 (Growth)
  - Checkbox: up to 70 (Enterprise), 50 (Pro), 30 (Growth)
  - Date Picker: up to 70 (Enterprise), 50 (Pro), 30 (Growth)
  - Lookup fields: up to 50 (Enterprise), 10 (Pro), 0 (Growth)
  - Formula fields: up to 40 (Pro/Enterprise), with unique constraints
  - Total across all fields: up to 630 (Enterprise), 250 (Pro), 150 (Growth)
- Special notes:
  - Custom field limits are per entity and affected when using formula fields (quota deductions apply based on other field usage).
  - On downgrade, you must delete excess fields beyond the new plan’s quota.
  - Each field type has specific text/character limits (e.g., text field 256 chars; text area 10,000 chars; number: 11 digits before decimal, 4 after).
  - Up to 300 options allowed for dropdown, multi-select, and radio fields.
- Custom fields for Sales Activities have stricter per-field-type caps (5 per type for Text, Text Area, Number, Dropdown/Radio, Checkbox, Date Picker, Multiselect, Lookup).

If you need vendor docs and independent benchmarks on API limits, custom objects/modules, workflow action limits, email sync, and pricing, this page only covers custom field limits and downgrade behavior for Freshsales; it does not provide API rate limits, object/module support details, workflow/action quotas, email sync specs, or external benchmarking. For those, you’d want Freshsales API docs and third-party CRM benchmarks. Would you like me to pull a concise list of those topics with current API limits and pricing from Freshworks’ docs and reputable benchmarks?
