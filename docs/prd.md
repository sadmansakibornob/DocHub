# DocHub - Product Requirements Document (PRD)

## Product Vision

DocHub is a simple internal knowledge base that allows users to create, manage, review, and read technical documentation in one centralized web application with secure role-based access.

## Problem Statement

Technical documentation can become difficult to manage when it is stored across separate files or communication platforms. DocHub provides a centralized place where users can create documentation, organize it using categories and tags, and control who can create, edit, review, and publish content.

## Product Goals

| Goal ID | Goal                                    | KPI                                                                     |
| ------- | --------------------------------------- | ----------------------------------------------------------------------- |
| PG-01   | Centralize technical documentation      | Users can create and access documentation from one application          |
| PG-02   | Provide simple documentation management | Users can create, view, edit, and delete articles through REST APIs     |
| PG-03   | Improve documentation discovery         | Users can search and filter articles by title, category, and tags       |
| PG-04   | Provide secure access control           | Protected operations require authentication and appropriate permissions |
| PG-05   | Demonstrate course technologies         | The application integrates React + TypeScript with FastAPI REST APIs    |

## SMART Requirement Writing Standard

All requirements in DocHub are written using SMART quality criteria.

| SMART Element | How It Is Applied in DocHub                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Specific      | Each requirement defines a clear user action and expected system behavior.                                            |
| Measurable    | Requirements can be verified through API responses, frontend behavior, permissions, and test cases.                   |
| Achievable    | The project is intentionally limited to a small set of core features suitable for the course timeline.                |
| Relevant      | Each requirement directly supports documentation management, authentication, authorization, RBAC, or API integration. |
| Timely        | Features are divided between the MVP and Beta releases.                                                               |

## MoSCoW Prioritization

The product backlog uses MoSCoW prioritization to keep the project scope small and manageable.

| Category                  | Definition                               | DocHub Usage                                                                               |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Must Have                 | Required for the core application        | Article CRUD, REST APIs, React frontend, MongoDB, categories, tags                         |
| Should Have               | Required for the complete course project | Authentication, RBAC, security scopes, user profile, draft/review/publish workflow         |
| Could Have                | Optional improvements if time permits    | Article archiving                                                                          |
| Won't Have (this release) | Explicitly outside the project scope     | AI, real-time collaboration, mobile application, advanced analytics, external integrations |

## Target Users

DocHub is designed for small development or technical teams that need a simple internal documentation system.

The system supports three main user types:

* **Reader / Intern** — reads and searches published documentation.
* **Contributor / Developer** — creates and manages their own documentation drafts.
* **Editor / Admin** — reviews documentation, controls publishing, and manages user roles.

## User Personas

| Persona                 | Description                                          | Main Actions                                    |
| ----------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Reader / Intern         | A team member who primarily consumes documentation   | View, search, and filter published articles     |
| Contributor / Developer | A team member responsible for writing documentation  | Create, edit, and submit articles               |
| Editor / Admin          | A team member responsible for managing documentation | Review, publish articles, and manage user roles |

## User Journey

1. A user logs into DocHub.
2. The user accesses documentation according to their assigned role.
3. A Contributor creates a new documentation article.
4. The Contributor saves the article as a draft.
5. The Contributor submits the article for review.
6. An Editor reviews the submitted article.
7. The Editor publishes the article.
8. Readers can search, filter, and read the published article.
9. An authenticated user can access and update their basic profile information.

## Feature List

| Feature Group   | Core Features                                     | Release |
| --------------- | ------------------------------------------------- | ------- |
| Frontend        | React + TypeScript interface                      | MVP     |
| Backend         | FastAPI + Python REST backend                     | MVP     |
| Database        | MongoDB persistence                               | MVP     |
| Documentation   | Create, view, edit, and delete articles           | MVP     |
| Markdown        | Write documentation using Markdown and preview it | MVP     |
| Organization    | Categories and tags                               | MVP     |
| Search          | Search and filter documentation                   | MVP     |
| REST API        | Documentation REST API endpoints                  | MVP     |
| Authentication  | User registration and login                       | Beta    |
| JWT             | JWT-based authentication                          | Beta    |
| User Profile    | View and update basic profile information         | Beta    |
| RBAC            | Reader, Contributor, and Editor roles             | Beta    |
| Security Scopes | Permission-based access to protected operations   | Beta    |
| Workflow        | Draft, submit, review, and publish                | Beta    |
| User Management | Manage user roles                                 | Beta    |
| Deployment      | Deploy the completed application                  | Beta    |

## Functional Requirements

| Requirement ID | Requirement                                                                                         | Release |
| -------------- | --------------------------------------------------------------------------------------------------- | ------- |
| FR-001         | The system shall allow users to view published documentation articles.                              | MVP     |
| FR-002         | The system shall allow users to search for articles by title or content.                            | MVP     |
| FR-003         | The system shall allow users to filter articles by category and tags.                               | MVP     |
| FR-004         | The system shall allow authorized users to create documentation articles.                           | MVP     |
| FR-005         | The system shall allow authorized users to view an individual article.                              | MVP     |
| FR-006         | The system shall allow authorized users to edit documentation articles.                             | MVP     |
| FR-007         | The system shall allow authorized users to delete documentation articles.                           | MVP     |
| FR-008         | The system shall support Markdown content for documentation articles.                               | MVP     |
| FR-009         | The system shall provide a Markdown preview before saving an article.                               | MVP     |
| FR-010         | The system shall allow articles to be assigned categories.                                          | MVP     |
| FR-011         | The system shall allow articles to have tags.                                                       | MVP     |
| FR-012         | The system shall expose documentation functionality through REST APIs.                              | MVP     |
| FR-013         | The frontend shall communicate with the FastAPI backend through REST APIs.                          | MVP     |
| FR-014         | The system shall allow users to register an account.                                                | Beta    |
| FR-015         | The system shall allow registered users to authenticate using their credentials.                    | Beta    |
| FR-016         | The system shall issue a JWT access token after successful authentication.                          | Beta    |
| FR-017         | The system shall restrict protected endpoints to authenticated users.                               | Beta    |
| FR-018         | The system shall support Reader, Contributor, and Editor roles.                                     | Beta    |
| FR-019         | The system shall enforce different permissions based on the user's role.                            | Beta    |
| FR-020         | The system shall support security scopes for protected operations.                                  | Beta    |
| FR-021         | Contributors shall be able to create and manage their own drafts.                                   | Beta    |
| FR-022         | Contributors shall be able to submit drafts for review.                                             | Beta    |
| FR-023         | Editors shall be able to review submitted articles.                                                 | Beta    |
| FR-024         | Editors shall be able to publish approved articles.                                                 | Beta    |
| FR-025         | Editors shall be able to manage user roles.                                                         | Beta    |
| FR-026         | The system shall allow authenticated users to view and update their basic profile information.      | Beta    |
| FR-027         | The system shall reject requests when the authenticated user does not have the required permission. | Beta    |

## Role-Based Access Control

| Role                    | Permissions                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Reader / Intern         | Read published articles, search, and filter documentation                                          |
| Contributor / Developer | Reader permissions + create articles, edit own drafts, delete own drafts, submit drafts for review |
| Editor / Admin          | Contributor permissions + review articles, publish articles, and manage user roles                 |

## Security Scopes / Permissions

The application will use security scopes to provide more granular control over protected operations.

| Scope              | Purpose                   |
| ------------------ | ------------------------- |
| `articles:read`    | Read documentation        |
| `articles:create`  | Create articles           |
| `articles:update`  | Edit articles             |
| `articles:delete`  | Delete articles           |
| `articles:review`  | Review submitted articles |
| `articles:publish` | Publish articles          |
| `users:manage`     | Manage user roles         |

## Non-Functional Requirements

| Requirement ID | Requirement                                                                                       | Release |
| -------------- | ------------------------------------------------------------------------------------------------- | ------- |
| NFR-001        | The frontend shall use React.js with TypeScript.                                                  | MVP     |
| NFR-002        | The backend shall use FastAPI with Python.                                                        | MVP     |
| NFR-003        | Frontend and backend communication shall use REST APIs.                                           | MVP     |
| NFR-004        | The backend shall validate incoming request data.                                                 | MVP     |
| NFR-005        | Protected API endpoints shall require authentication.                                             | Beta    |
| NFR-006        | Authorization shall be enforced on the backend rather than relying only on frontend restrictions. | Beta    |
| NFR-007        | User passwords shall be securely hashed before storage.                                           | Beta    |
| NFR-008        | JWT tokens shall be used for authenticated API requests.                                          | Beta    |
| NFR-009        | Unauthorized requests shall return appropriate HTTP status codes.                                 | Beta    |
| NFR-010        | The frontend shall display appropriate error states when API requests fail.                       | MVP     |

## Success Metrics

| Metric               | Target                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| Core Article CRUD    | Create, read, update, and delete operations work successfully              |
| REST API Integration | All core documentation operations are accessible through FastAPI endpoints |
| Authentication       | Users can register and log in successfully                                 |
| User Profile         | Authenticated users can view and update their basic profile information    |
| RBAC                 | All three user roles have distinct permissions                             |
| Security Scopes      | Protected operations enforce the required scopes                           |
| Workflow             | Draft → Review → Publish workflow works successfully                       |
| Frontend Integration | React frontend successfully consumes the FastAPI REST API                  |
| Security             | Users cannot access operations outside their assigned permissions          |

## Release Strategy

### MVP - Phase 1

The MVP focuses on the basic documentation platform and demonstrates the core React, TypeScript, FastAPI, MongoDB, and REST API integration.

The MVP will include:

* React + TypeScript frontend
* FastAPI backend
* REST API
* MongoDB database
* Documentation article CRUD
* Markdown editor and preview
* Categories
* Tags
* Search
* Filtering
* Basic frontend-backend integration
* Basic data persistence
* Local running environment

### Beta - Phase 2

The Beta release adds the security, user management, and deployment functionality required by the course.

The Beta will include:

* User registration
* User login
* JWT authentication
* Authentication-protected endpoints
* User profile dashboard
* Reader / Contributor / Editor roles
* RBAC
* Security scopes / permissions
* Draft and submission workflow
* Article review
* Article publishing
* User role management
* Deployment

## Roadmap Alignment

| Phase | Main Focus                      | Features                                                                                                  |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| MVP   | Core application                | React, TypeScript, FastAPI, MongoDB, articles, Markdown, categories, tags, search, filtering, REST APIs   |
| Beta  | Security, users, and deployment | Authentication, JWT, user profile dashboard, RBAC, security scopes, workflow, user management, deployment |

The project will prioritize completing the MVP and Beta requirements before considering optional features.

## Dependencies

| Dependency                   | Type             | Risk   |
| ---------------------------- | ---------------- | ------ |
| React + TypeScript           | Frontend         | Low    |
| FastAPI + Python             | Backend          | Low    |
| MongoDB                      | Data persistence | Low    |
| REST API                     | Architecture     | Low    |
| JWT Authentication           | Security         | Medium |
| RBAC and Security Scopes     | Security         | Medium |
| Frontend-Backend Integration | Integration      | Medium |

## Technical Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| Frontend         | React.js + TypeScript      |
| Build Tool       | Vite                       |
| Backend          | FastAPI + Python           |
| API Architecture | REST                       |
| Authentication   | OAuth2 Password Flow + JWT |
| Authorization    | RBAC + Security Scopes     |
| Documentation    | Markdown                   |
| Database         | MongoDB (NoSQL)            |
| Version Control  | Git + GitHub               |

## Out of Scope

To keep the project simple and achievable within the course timeline, the following are explicitly excluded:

* Machine Learning
* Artificial Intelligence
* LLMs
* RAG
* AI-generated documentation
* AI chatbot
* Real-time collaborative editing
* Native mobile application
* External calendar integrations
* Complex enterprise SSO
* Advanced analytics
* Recommendation systems
* Real-time notifications
* Multi-organization support

## Acceptance Baseline

DocHub will be considered complete when the following requirements are demonstrated:

1. The React + TypeScript frontend communicates successfully with the FastAPI backend.
2. Core documentation operations are exposed through REST APIs.
3. MongoDB provides persistent application data storage.
4. Users can create, view, edit, and delete documentation according to their permissions.
5. Users can search and filter documentation.
6. Users can register and authenticate using the application.
7. Authenticated users can view and update their basic profile information.
8. The system implements Reader, Contributor, and Editor roles.
9. RBAC restricts functionality according to the user's role.
10. Security scopes provide granular permission control.
11. Contributors can submit documentation for review.
12. Editors can review and publish documentation.
13. Unauthorized users cannot access protected operations.
14. The completed Beta application can be deployed.

## Traceability

Each major feature will be traceable through the following structure:

**Product Goal → Feature → Functional Requirement → REST API → Frontend Component → Test Case → Release**

This ensures that the project requirements remain directly connected to the implemented application and can be verified during development and assessment.
