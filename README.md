# Enterprise CI/CD Architecture  
### Multi-Environment Promotion Model (DEV → UAT → PROD)

---

## DIA-Datalake DevOps Process  
Releasing to UAT and PROD with the same release  

**Pro:** No re-deployment and low operational complexity  
**Con:** Non-production-ready code can exist in `main`, but is not triggered without release tags  

## System Architecture

<p align="center">
  <img src="assets/CICD_Basic.png" width="1000"/>
</p>

## Promotion Lifecycle

The pipeline follows a **branch‑driven promotion model** with three long‑lived branches: `dev`, `uat` and `main`.  Each branch maps directly to an environment and triggers the appropriate deployment on every push.

### 1. Feature Development

* Developers create `feature/*` branches.  
* Pull Requests trigger CI validation (unit tests, linting, and security scanning).  
* After approval, changes merge into the corresponding environment branch (`dev`, `uat` or `main`).  

### 2. Continuous DEV Deployment

* Every merge into the `dev` branch automatically deploys to **DEV**.  
* DEV acts as the continuous integration playground where all merged work is immediately available for testing.  

### 3. UAT Deployment

* Once DEV testing is complete, a feature branch is promoted to the `uat` branch via a pull request.  
* A push to the `uat` branch triggers deployment of the same built artifact to **UAT**.  
* Business stakeholders validate the changes and provide sign‑off.  

### 4. Production Deployment

* After UAT sign‑off, the same commit is promoted to the `main` branch.  
* A push to the `main` branch triggers deployment of the previously built artifact to **PROD**.  
* There is **no rebuild** between environments — the binary produced by the build pipeline is immutable and promoted through DEV → UAT → PROD.  

---

## Developer Interaction Flow

<table>
<tr>
<td width="55%" valign="top">

### Release Model Overview

* Developers create `feature/*` branches.  
* Pull Requests trigger CI validation.  
* Approved changes merge into the **environment branches** (`dev`, `uat`, `main`).  
* **DEV** auto‑deploys from the `dev` branch on every push.  
* **UAT** deployments occur on pushes to the `uat` branch.  
* **PROD** deployments occur on pushes to the `main` branch.  
* Business sign‑off on the UAT environment is required before promoting to PROD.  

This branch‑based model maintains a single source of truth while avoiding environment drift.  Artifacts are built once and promoted, not rebuilt, ensuring consistency across environments.

</td>

<td width="45%" align="center">

<img src="assets/CICD-Developer_Interaction_Flow.png" width="100%"/>

</td>
</tr>
</table>

---

## Data Engineer Interaction Flow

<table>
<tr>
<td width="55%" valign="top">

### Release Progression Model

* Multiple features may coexist in the **DEV** environment simultaneously.  
* All merged features automatically deploy to **DEV** when pushed to the `dev` branch.  
* A subset of completed features is selected for **UAT** and merged into the `uat` branch.  
* UAT represents a curated release candidate.  
* Only approved features progress to **PROD** via a merge into `main`.  
* Features that are not selected remain in `dev` until they are ready for promotion.  

This reflects a **progressive funnel**:

DEV (all merged work)  
→ UAT (validated subset)  
→ PROD (approved subset)

Progression is controlled through branch promotion and release ownership; there is no environment drift because the same artifact is promoted through each stage.

</td>

<td width="45%" align="center">

<img src="assets/CICD-DE_Interaction_Flow.png" width="100%"/>

</td>
</tr>
</table>

---

## GitHub Actions Workflow Architecture

The CI/CD process is codified through a set of reusable GitHub Actions workflows under `.github/workflows/`.  Each workflow has a distinct responsibility — versioning, building, deploying or preparing the container environment — and they work together to promote an immutable artifact across DEV, UAT and PROD.

| Workflow file | Purpose |
|---------------|---------|
| `dbr.yml` | **Orchestrator.** Runs on pushes to the `dev`, `uat` and `main` branches. It delegates to the version, build and deploy workflows to execute the appropriate steps for the target environment. |
| `version-create.yml` | **Version generator.** Computes a semantic version based on the current date or a supplied input and exposes it as an output for downstream jobs. |
| `dbr-build.yml` | **Build pipeline.** Uses a containerised Databricks CLI environment to package notebooks and jobs into a versioned ZIP file, then uploads the bundle to the artifact repository. Outputs the generated package name. |
| `dbr-deploy.yml` | **Deployment pipeline.** Retrieves a published bundle from the artifact repository and deploys it to the Databricks workspace corresponding to the specified environment using the Databricks CLI. |
| `docker-build.yml` | **Tooling image build.** Builds and pushes the Databricks CLI Docker image used by the build workflow, ensuring a consistent runtime across CI jobs. |

### Orchestration Flow

1. **Push event** – When code is pushed to `dev`, `uat` or `main`, the `dbr.yml` workflow is triggered automatically.
2. **Version generation** – The orchestrator calls `version-create.yml` to compute a unique version identifier.
3. **Artifact build** – It then invokes `dbr-build.yml`, passing the version and environment.  This job packages the Databricks notebooks/jobs and uploads the bundle to the artifact repository.
4. **Environment deployment** – Finally, `dbr.yml` calls `dbr-deploy.yml` to download the exact bundle and deploy it to the appropriate Databricks workspace (DEV, UAT or PROD).  No rebuild occurs during deployment.
5. **Container preparation** – The `docker-build.yml` workflow can be run as needed to update the Databricks CLI container image used in the build step.

The combination of these workflows enforces the core DevOps principles highlighted earlier: **build once, promote the same artifact**, and **isolate environments via controlled branch promotion**.

You can explore the workflow definitions directly in this repository:

- [`dbr.yml`](./.github/workflows/dbr.yml)
- [`version-create.yml`](./.github/workflows/version_create.yml)
- [`dbr-build.yml`](./.github/workflows/dbr-build.yml)
- [`dbr-deploy.yml`](./.github/workflows/dbr-deploy.yml)
- [`docker-build.yml`](./.github/workflows/docker-build.yml)
