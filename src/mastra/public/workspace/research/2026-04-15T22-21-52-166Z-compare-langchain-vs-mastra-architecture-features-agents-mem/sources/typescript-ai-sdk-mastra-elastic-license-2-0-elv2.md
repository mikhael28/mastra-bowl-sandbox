# Typescript製AIエージェントSDKであるmastraのライセンス「Elastic License 2.0 (ELv2)」について
- URL: https://zenn.dev/hiroto_fp/scraps/1b7c1ee7f679df
- Query: Third-party coverage of Mastra licensing and governance — analyst articles, tech press, legal or audit writeups
- Published: 2025-10-20T11:25:08.000Z
## Summary

- Central finding: Mastra uses Elastic License 2.0 (ELv2), not MIT/Apache. ELv2 restricts hosting/managed services that provide users with substantial access to Mastra’s features. 
- Practical implication for SaaS:
  - It is not prohibited to build and offer services that use Mastra. 
  - It is prohibited to offer third-party services that host or operate Mastra for others or provide hosting/operational support for Mastra (e.g., hosting, persistence, or managed-operational tooling).
- Concrete examples cited:
  - Using Mastra to deliver AI-assisted products is allowed.
  - Providing services that help operate or host Mastra (hosting platforms, persistence/operational layers) for third parties is not allowed.
- Context/notes:
  - References point to Mastra GitHub issues #1956 and #2833 for clarifications.
- Bottom line for governance/duediligence:
  - If you are evaluating Mastra for a SaaS product, you can proceed with deployment as the end product; but if your business model involves offering a hosted/managed Mastra service or operational support to others, that would violate ELv2.
- Timeframe: Discussion and resolution documented as of 2025-03-13.
