# CONTRIBUTING.md at main · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/blob/main/CONTRIBUTING.md
- Query: Mastra official license statement and terms of use — is Mastra open source or proprietary (license page, legal docs)
## Summary

Mastra is largely open source under the Apache-2.0 license, with some enterprise-licensed (EE) code. Key points from the contributor guidance and license notes:

- Core code outside ee/ directories is Apache-2.0 licensed.
- EE (Mastra Enterprise) code lives in directories named ee/ within packages (e.g., packages/core/src/auth/ee/).
- Contributions to EE code are welcome but fall under the Mastra Enterprise License.
- EE code is identified by the presence of ee/ directories and their contents.
- The repository provides licensing mapping in LICENSE.md for full details.
- For open-source contributions, typical process: read Development Guide, run tests locally, and open a PR with a clear description.
- If you encounter a bug, follow the minimal reproduction guidance and reference relevant issues; for new features, use feature requests and PRs as usual.

Bottom line: Mastra is primarily open source (Apache-2.0) with separate Enterprise-licensed components in EE paths. Check LICENSE.md and look for ee/ paths to determine license terms for specific files.
