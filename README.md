# Enterprise CI/CD Architecture  
### Multi-Environment Promotion Model (DEV → UAT → PROD)

---

## System Architecture

<p align="center">
  <img src="assets/CICD_Basic.png" width="1000"/>
</p>

---

## Promotion Lifecycle

This pipeline enforces a structured promotion model across **DEV → UAT → PROD**.

- Developers work in `feature/*` branches with CI validation  
- Changes merge into `dev` for integration testing  
- Selected releases are cherry-picked and tagged into `uat`  
- Self-hosted runners build immutable artifacts  
- Artifacts are stored in **JFrog Artifactory**  
- Deployment requires **ServiceNow approval**  
- COE runners execute controlled releases to UAT and PROD  

The architecture separates build from deployment, enforces approval gates, and ensures traceable artifact promotion across environments.

---

## Promotion Lifecycle

