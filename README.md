# Enterprise CI/CD Architecture  
### Multi-Environment Promotion Model (DEV → UAT → PROD)

---

## System Architecture

<p align="center">
  <img src="assets/CICD_Basic.png" width="1000"/>
</p>

---

## Architecture Summary

This repository documents an enterprise-grade CI/CD promotion pipeline implemented using:

- **GitHub Actions** for CI orchestration  
- **Self-hosted and COE runners** for environment isolation  
- **JFrog Artifactory** for artifact management  
- **HashiCorp Vault** for centralized secret retrieval  
- **ServiceNow** for formal change approval governance  

The model follows a structured promotion lifecycle across **Development (DEV), User Acceptance Testing (UAT), and Production (PROD)** environments.

---

## Promotion Lifecycle

