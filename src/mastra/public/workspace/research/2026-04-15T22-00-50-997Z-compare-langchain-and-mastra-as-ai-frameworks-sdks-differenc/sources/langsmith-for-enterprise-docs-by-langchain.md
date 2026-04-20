# LangSmith for Enterprise - Docs by LangChain
- URL: https://langchain-5e9cc07a.mintlify.app/langsmith/enterprise
- Query: LangChain / LangSmith enterprise features, observability and governance pages, SLA and compliance documentation
## Summary

Summary:
- The LangSmith for Enterprise docs describe deployment, access control, data privacy, cost controls, security, and compliance tailored for organizations.
- Deployment options: Cloud (US/EU), Hybrid (control plane in cloud, data plane in your VPC), and Self-hosted (Docker Compose or Kubernetes).
- Identity and access: User management (invites, roles, SCIM), SSO/JIT provisioning (SAML, OIDC), organization/workspace structure, and API-based administration.
- Access control: RBAC (per workspace with built-in or custom roles, enterprise-only) and ABAC (tag-based policies to restrict access, including PII-blocking).
- Observability and governance: Workload isolation, resource tagging, ABAC for data governance, and granular usage reporting (by workspace/project/user/key) to attribute costs.
- Data privacy and PII: Detailed data storage/privacy controls, PII controls with ABAC, data retention/cleanup, and data purging to meet compliance needs; options to opt out of telemetry/tracing.
- Cost controls and usage: Billing controls (monthly usage limits, prepaid burndown), granular tracing spend insights, and retention tiers (base vs extended) with auto-upgrade notes and impact on billing.
- Security and compliance: Security posture, certifications (SOC 2 Type II, HIPAA, GDPR), shared responsibility model, SLA considerations, disaster recovery planning, and resilience practices.
- Pricing and plans: Enterprise-specific features and pricing plans overview (referenced via pricing plans page).
- Practical takeaways for governance: Use ABAC/RBAC to enforce least-privilege, leverage workload isolation and tagging for environment separation, implement SSO/JIT for identity hygiene, and configure retention, purging, and telemetry settings to meet regulatory requirements.

If you want, I can map these to a quick checklist for enterprise governance, or pull out exact SLA statements and certifications from the page.
a privacy and PII, data retention, and cost controls). Also note the page advises submitting targeted feedback when documentation issues are found.
