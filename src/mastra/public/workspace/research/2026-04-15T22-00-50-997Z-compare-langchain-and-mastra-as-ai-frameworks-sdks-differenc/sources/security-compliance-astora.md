# Security & Compliance | Astora
- URL: https://www.astora.app/en/security
- Query: Mastra SOC 2 HIPAA GDPR compliance attestations, security whitepapers, and official statements on data residency
## Summary

Here’s a concise, user-focused summary for the query “Mastra SOC 2 HIPAA GDPR compliance attestations, security whitepapers, and official statements on data residency” based on the Astora Security & Compliance page:

- Compliance and certifications timeline: Astora targets GDPR, ISO 27001, and SOC 2 attestations with planned dates in April 2026. This indicates a roadmap toward formal privacy, security, and controls certifications.
- Data residency and deployment options: 
  - SaaS deployments: hosted in the client’s region (Europe, North America, Asia) with real-time access/logs and automatic updates.
  - Private cloud: cloud-provider-agnostic with no vendor lock-in; customer manages encryption keys; Astora handles maintenance.
  - On-premise air-gapped: local AI pipeline on client GPUs, no external network, secure, verifiable updates, source code audit available on request.
- Access control and data processing:
  - All sources, users, and access are auditable; inherits source access rights, with explicit per-user/source visibility.
  - Role-based access (owner, administrator, user) and dedicated permission management interface.
  - Processing scope is explicitly configured by the organization; Astora only processes structured operational facts and retains a provenance link; no autonomous discovery of sources.
- Data protection and confidentiality:
  - Multi-level confidentiality classification; non-operational personal data (e.g., bank/health data) excluded from structuring.
  - Sensitive finds flagged; extracted operational facts restricted by organization’s access rights and retention policies.
- Retention, deletion, portability:
  - Retention aligned with the organization’s policy; contractual end triggers full deletion of data (including metadata and provenance).
  - supports targeted deletion (by source/project/time period/individual) and GDPR erasure requests (Art. 17) with bulk deletion of linked structured data.
- Security architecture and controls:
  - End-to-end encryption (TLS 1.3) in transit and at rest; encrypted admin access; no plaintext data across components.
  - Network protections against DDoS/bots; API keys; token-based inter-service authentication; no exposure of internal services.
  - Separate cryptographic storage for operational data vs. administration; automated key/token rotation; no hardcoded credentials.
  - Full isolation of production, admin, and monitoring flows; option to enforce complete isolation per customer.
- AI governance:
  - Explicit note that no data leaves the user-defined perimeter; implies controlled AI data handling within client boundaries.

If you’re specifically looking for Mastra’s SOC 2, HIPAA, GDPR attestations, security whitepapers, and official data residency statements, this page confirms:
- A plan for ISO 27001 and SOC 2 attestations in 2026 and GDPR alignment, plus a GDPR erasure/compliance framework.
- Clearly defined data residency options (region-based SaaS, private cloud, and on-premise air-gapped deployments).
- Comprehensive security controls, access auditing, data processing limitations, and data deletion/portability capabilities.


