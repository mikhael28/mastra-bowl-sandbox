# Service Level Agreement (SLA) – Maestra
- URL: https://maestra.io/documents/sla/
- Query: Mastra enterprise service-level agreement (SLA) details: uptime, response times, SLAs in contract/managed platform and data residency terms
## Summary

Summary:

- Document: Service Level Agreement (SLA) for Maestra (Version 7.0, Jan 25, 2024) linked to the Master Service Agreement.
- Scope and parties: Defines SLA between the Contractor (Maestra) and the Customer, with terms referencing the MSA. “Customer” means the end users of the Customer’s database; “Client” means the subscribing company.
- Key terms defined: Monitoring System, Critical Data, Data Processing Center (DPC), RPM (requests per minute), RPS (requests per second), and several categories of Maestra API methods (pricing, orders, client interfaces, recommendations, etc.).
- Service interfaces and APIs: Specifies which API methods are included under different categories (pricing, order processing, saving orders, client interfaces, and recommendations) and the steps that qualify an API method for each category.
- Guaranteed sending speed: Establishes performance commitments for sending messages (Email channel, Mobile Push, and other channels) and ties them to database size.
  - Guaranteed messages in 30 minutes by database size:
    - <100,000 customers: 105,000 messages
    - 100,000–3,000,000: 250,000 messages
    - 3,000,000–10,000,000: 600,000 messages
    - 10,000,000–15,000,000: 750,000 messages
    - >15,000,000: 750,000 messages
  - Variables with guaranteed sending speed include CustomParameters, Message, Ticket, and various Recipient fields (e.g., Recipient.Email, Recipient.FirstAndLastName, etc.).
- Data residency and security: The SLA references DPCs (data processing centers) responsible for data transmission, power, and physical security, implying data residency terms are tied to where DPCs are located and governed by the MSA.
- Measurements and monitoring: The SLA uses a Monitoring System to track performance, but exact uptime percentages, response-time targets, and remediation/credit schemes are not explicitly enumerated in the provided text excerpt.
- Missing/implicit details: The specific uptime/availability targets (e.g., 99.9% uptime), response times by service category, maintenance windows, incident definitions, service credits, data locality options, and dispute resolution are not included in the excerpt.

What to use for your query:
- If you need uptime and response-time specifics, this page does not show explicit percentage targets or response-time metrics beyond “Guaranteed sending speed” for messaging, so you’ll want to locate the sections of the SLA or MSA that state explicit uptime (e.g., 99.9% or similar) and response-time SLAs per API category.
- For data residency terms: the SLA references DPCs and data handling but does not specify countries/regions or data localization commitments; check the MSA or a data residency addendum for precise locations and transfer mechanisms.
- For contract scope: this SLA is Version 7.0 and tied to the MSA;
ighlight the exact API methods and their guaranteed performance metrics most relevant to your integration.
