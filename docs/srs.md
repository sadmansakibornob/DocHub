# DocHub - Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for DocHub, a lightweight internal knowledge base and technical documentation management system.

The purpose of DocHub is to provide a centralized platform where users can create, manage, organize, review, publish, search, and read technical documentation.

The system is designed to demonstrate the use of React.js with TypeScript, FastAPI with Python, REST APIs, Supabase, authentication, authorization, Role-Based Access Control (RBAC), and security scopes.

### 1.2 Scope

DocHub will provide a web-based documentation platform consisting of:

* A React + TypeScript frontend.
* A FastAPI + Python backend.
* REST APIs for frontend-backend communication.
* Supabase for persistent data storage.
* Documentation article CRUD operations.
* Markdown editing and preview.
* Categories and tags.
* Search and filtering.
* User registration and authentication.
* JWT-based authentication.
* Role-Based Access Control.
* Security scopes and permissions.
* User profile dashboard.
* Draft, review, and publish workflow.
* User role management.
* Deployment of the completed Beta application.

The system will be developed in two releases.

**MVP** will focus on the core documentation platform and REST API integration.

**Beta** will add authentication, authorization, user management, workflow, profile functionality, and deployment.

### 1.3 Definitions and Acronyms

| Term     | Definition                                                        |
| -------- | ----------------------------------------------------------------- |
| API      | Application Programming Interface                                 |
| REST     | Representational State Transfer                                   |
| JWT      | JSON Web Token                                                    |
| RBAC     | Role-Based Access Control                                         |
| CRUD     | Create, Read, Update, Delete                                      |
| OAuth2   | Authorization framework used for authentication                   |
| Scope    | Permission defining access to a specific operation                |
| MVP      | Minimum Viable Product                                            |
| Beta     | Extended release containing security and user-management features |
| Markdown | Lightweight markup language used for documentation                |
| Supabase  | NoSQL document-oriented database                                  |

### 1.4 References

The following project documents are related to this SRS:

* Product Requirements Document (PRD)
* Technical Design Document (TDD)
* Project README
* API documentation

---

# 2. Overall Description

## 2.1 Product Perspective

DocHub is a three-tier web application.

The system consists of:

1. **Frontend**

   * React.js
   * TypeScript
   * Vite

2. **Backend**

   * FastAPI
   * Python
   * REST APIs

3. **Database**

   * Supabase

The overall architecture is:

**React + TypeScript → FastAPI REST API → Supabase**

The frontend is responsible for user interaction and presentation, while the backend handles business logic, authentication, authorization, validation, and database operations.

## 2.2 Product Functions

The system shall provide the following major functions:

### MVP Functions

* View documentation articles.
* Create documentation articles.
* Edit documentation articles.
* Delete documentation articles.
* Store documentation in Supabase.
* Write documentation using Markdown.
* Preview Markdown content.
* Assign categories to articles.
* Assign tags to articles.
* Search documentation.
* Filter documentation.
* Provide REST APIs.
* Integrate the React frontend with the FastAPI backend.

### Beta Functions

* User registration.
* User login.
* JWT-based authentication.
* Protected API endpoints.
* User profile dashboard.
* Profile information update.
* Reader / Contributor / Editor roles.
* Role-Based Access Control.
* Security scopes.
* Draft management.
* Article submission for review.
* Article review.
* Article publishing.
* User role management.
* Deployment.

## 2.3 User Classes

### Reader / Intern

Readers primarily consume documentation.

Permissions:

* View published articles.
* Search articles.
* Filter articles.
* View categories and tags.
* Access their own profile in the Beta release.

### Contributor / Developer

Contributors create and maintain documentation.

Permissions:

* All Reader permissions.
* Create articles.
* Edit their own drafts.
* Delete their own drafts.
* Submit articles for review.
* Access and update their own profile.

### Editor / Admin

Editors are responsible for managing and publishing documentation.

Permissions:

* All Contributor permissions.
* Review submitted articles.
* Publish approved articles.
* Manage user roles.
* Manage documentation according to assigned security scopes.

## 2.4 Operating Environment

### Frontend

* Modern web browser.
* React.js.
* TypeScript.
* Vite.

### Backend

* Python.
* FastAPI.
* REST API server.

### Database

* Supabase.

### Development Environment

* Linux, Windows, or macOS.
* Git.
* GitHub.
* Local development server.

## 2.5 Constraints

* The application must use React.js with TypeScript.
* The backend must use FastAPI with Python.
* Frontend-backend communication must use REST APIs.
* Supabase must be used for persistent data storage.
* Authentication must use OAuth2 Password Flow with JWT.
* Authorization must use RBAC and security scopes.
* The project must remain small enough to complete within the course timeline.
* The system must not depend on AI, ML, LLM, or RAG functionality.

## 2.6 Assumptions

* Users have access to a modern web browser.
* Supabase is available during development and deployment.
* Users have valid credentials when authentication is enabled.
* The application will initially target a small internal team.
* Internet access is available for the deployed Beta application.
* Users understand basic documentation and Markdown concepts.

---

# 3. Functional Requirements

## 3.1 Documentation Management

| ID     | Requirement                                                             | Release |
| ------ | ----------------------------------------------------------------------- | ------- |
| FR-001 | The system shall allow users to view published documentation articles.  | MVP     |
| FR-002 | The system shall allow users to create documentation articles.          | MVP     |
| FR-003 | The system shall allow users to view individual documentation articles. | MVP     |
| FR-004 | The system shall allow users to edit documentation articles.            | MVP     |
| FR-005 | The system shall allow users to delete documentation articles.          | MVP     |
| FR-006 | The system shall store documentation articles in Supabase.               | MVP     |

## 3.2 Markdown

| ID     | Requirement                                                                | Release |
| ------ | -------------------------------------------------------------------------- | ------- |
| FR-007 | The system shall allow documentation content to be written using Markdown. | MVP     |
| FR-008 | The system shall provide a Markdown preview before saving an article.      | MVP     |

## 3.3 Categories and Tags

| ID     | Requirement                                                  | Release |
| ------ | ------------------------------------------------------------ | ------- |
| FR-009 | The system shall allow articles to be assigned categories.   | MVP     |
| FR-010 | The system shall allow articles to have tags.                | MVP     |
| FR-011 | The system shall allow users to filter articles by category. | MVP     |
| FR-012 | The system shall allow users to filter articles by tags.     | MVP     |

## 3.4 Search

| ID     | Requirement                                                      | Release |
| ------ | ---------------------------------------------------------------- | ------- |
| FR-013 | The system shall allow users to search documentation by title.   | MVP     |
| FR-014 | The system shall allow users to search documentation by content. | MVP     |

## 3.5 REST API

| ID     | Requirement                                                                            | Release |
| ------ | -------------------------------------------------------------------------------------- | ------- |
| FR-015 | The backend shall expose documentation functionality through REST APIs.                | MVP     |
| FR-016 | The frontend shall communicate with the backend through REST APIs.                     | MVP     |
| FR-017 | The API shall return appropriate HTTP status codes for successful and failed requests. | MVP     |

## 3.6 Authentication

| ID     | Requirement                                                                | Release |
| ------ | -------------------------------------------------------------------------- | ------- |
| FR-018 | The system shall allow users to register an account.                       | Beta    |
| FR-019 | The system shall allow users to log in using their credentials.            | Beta    |
| FR-020 | The system shall issue a JWT access token after successful authentication. | Beta    |
| FR-021 | The system shall require authentication for protected API endpoints.       | Beta    |
| FR-022 | The system shall securely hash user passwords before storing them.         | Beta    |

## 3.7 User Profile

| ID     | Requirement                                                                         | Release |
| ------ | ----------------------------------------------------------------------------------- | ------- |
| FR-023 | The system shall provide an authenticated user profile dashboard.                   | Beta    |
| FR-024 | The profile dashboard shall display basic user information.                         | Beta    |
| FR-025 | The system shall allow authenticated users to update permitted profile information. | Beta    |
| FR-026 | The system shall display the user's assigned role on the profile dashboard.         | Beta    |

## 3.8 Role-Based Access Control

| ID     | Requirement                                                             | Release |
| ------ | ----------------------------------------------------------------------- | ------- |
| FR-027 | The system shall support Reader, Contributor, and Editor roles.         | Beta    |
| FR-028 | The system shall enforce permissions based on the user's assigned role. | Beta    |
| FR-029 | Contributors shall be able to manage their own documentation drafts.    | Beta    |
| FR-030 | Editors shall be able to review submitted documentation.                | Beta    |
| FR-031 | Editors shall be able to publish approved documentation.                | Beta    |
| FR-032 | Editors shall be able to manage user roles.                             | Beta    |

## 3.9 Security Scopes

The system shall support the following security scopes:

| Scope              | Description               | Release |
| ------------------ | ------------------------- | ------- |
| `articles:read`    | Read documentation        | Beta    |
| `articles:create`  | Create articles           | Beta    |
| `articles:update`  | Update articles           | Beta    |
| `articles:delete`  | Delete articles           | Beta    |
| `articles:review`  | Review submitted articles | Beta    |
| `articles:publish` | Publish articles          | Beta    |
| `users:manage`     | Manage user roles         | Beta    |

The backend shall verify the required scope before allowing a protected operation.

## 3.10 Documentation Workflow

| ID     | Requirement                                                 | Release |
| ------ | ----------------------------------------------------------- | ------- |
| FR-033 | Contributors shall be able to save documentation as drafts. | Beta    |
| FR-034 | Contributors shall be able to submit drafts for review.     | Beta    |
| FR-035 | Editors shall be able to review submitted drafts.           | Beta    |
| FR-036 | Editors shall be able to publish approved documentation.    | Beta    |

The documentation workflow shall follow:

**Draft → Submitted → Published**

---

# 4. Non-Functional Requirements

## 4.1 Performance

| ID      | Requirement                                                                                             | Release |
| ------- | ------------------------------------------------------------------------------------------------------- | ------- |
| NFR-001 | Normal API requests should return within an acceptable response time under normal course-project usage. | MVP     |
| NFR-002 | Search and filtering should provide results without unnecessary page reloads.                           | MVP     |

## 4.2 Security

| ID      | Requirement                                                       | Release |
| ------- | ----------------------------------------------------------------- | ------- |
| NFR-003 | Passwords shall not be stored as plaintext.                       | Beta    |
| NFR-004 | JWT shall be used for authenticated API requests.                 | Beta    |
| NFR-005 | Protected API endpoints shall require authentication.             | Beta    |
| NFR-006 | Authorization shall be enforced by the backend.                   | Beta    |
| NFR-007 | Security scopes shall be checked before protected operations.     | Beta    |
| NFR-008 | Unauthorized requests shall return appropriate HTTP status codes. | Beta    |

## 4.3 Usability

| ID      | Requirement                                                                        | Release |
| ------- | ---------------------------------------------------------------------------------- | ------- |
| NFR-009 | The application shall provide a clear and simple web interface.                    | MVP     |
| NFR-010 | The application shall provide clear feedback for successful and failed operations. | MVP     |
| NFR-011 | The profile dashboard shall clearly display the user's basic account information.  | Beta    |

## 4.4 Maintainability

| ID      | Requirement                                                                     | Release |
| ------- | ------------------------------------------------------------------------------- | ------- |
| NFR-012 | Backend functionality shall be separated into appropriate architectural layers. | MVP     |
| NFR-013 | API endpoints shall follow a consistent REST structure.                         | MVP     |
| NFR-014 | The source code shall be maintained using Git and GitHub.                       | MVP     |

## 4.5 Reliability

| ID      | Requirement                                                                      | Release |
| ------- | -------------------------------------------------------------------------------- | ------- |
| NFR-015 | The backend shall validate incoming API data.                                    | MVP     |
| NFR-016 | The system shall handle invalid API requests without crashing.                   | MVP     |
| NFR-017 | The application shall provide appropriate error responses for failed operations. | MVP     |

---

# 5. Database Requirements

DocHub shall use Supabase as its database.

The database shall contain collections for the primary application entities.

### Users Collection

Stores:

* User ID
* Name
* Email / username
* Password hash
* Assigned role

### Articles Collection

Stores:

* Article ID
* Title
* Markdown content
* Category
* Tags
* Author
* Status
* Created date
* Updated date

### Categories Collection

Stores:

* Category ID
* Category name
* Description

### Tags Collection

Stores:

* Tag ID
* Tag name

The database design shall support the relationships required between users, articles, categories, and tags.

---

# 6. External Interface Requirements

## 6.1 User Interface

The frontend shall provide interfaces for:

* Home / documentation listing.
* Article search and filtering.
* Article viewing.
* Article creation.
* Article editing.
* Markdown preview.
* Login.
* Registration.
* User profile dashboard.
* Draft management.
* Review and publishing.
* User role management.

## 6.2 REST API Interface

The backend shall expose REST endpoints for:

* Authentication.
* Users.
* User profiles.
* Articles.
* Categories.
* Tags.

Example API areas:

```text
/auth
/users
/articles
/categories
/tags
```

The API shall use standard HTTP methods including:

* `GET`
* `POST`
* `PUT` / `PATCH`
* `DELETE`

## 6.3 API Error Handling

The API shall return appropriate HTTP status codes.

Examples include:

| Status Code | Meaning                            |
| ----------- | ---------------------------------- |
| 200         | Successful request                 |
| 201         | Resource successfully created      |
| 400         | Invalid request                    |
| 401         | Authentication required or invalid |
| 403         | Insufficient permissions           |
| 404         | Resource not found                 |
| 422         | Validation error                   |
| 500         | Internal server error              |

---

# 7. Authentication and Authorization

## 7.1 Authentication

DocHub shall use OAuth2 Password Flow with JWT-based authentication.

The authentication process shall be:

1. User submits login credentials.
2. FastAPI validates the credentials.
3. The backend verifies the stored password hash.
4. A JWT access token is generated.
5. The frontend stores and uses the token for authenticated API requests.
6. Protected endpoints validate the token before processing the request.

## 7.2 Authorization

Authorization shall be handled on the backend.

The system shall use two levels of authorization:

**Role-Based Access Control**

Determines what functionality a user role can access.

**Security Scopes**

Provides granular permission control for individual operations.

The frontend may hide unavailable actions for usability, but the backend shall always enforce the actual authorization rules.

---

# 8. Release Requirements

## 8.1 MVP

The MVP shall demonstrate:

* React + TypeScript frontend.
* FastAPI backend.
* Supabase database.
* REST APIs.
* Documentation CRUD.
* Markdown editor and preview.
* Categories.
* Tags.
* Search.
* Filtering.
* Frontend-backend integration.
* Local application execution.

Authentication and advanced authorization are intentionally deferred to the Beta release.

## 8.2 Beta

The Beta shall extend the MVP with:

* User registration.
* User login.
* JWT authentication.
* Protected endpoints.
* User profile dashboard.
* Reader / Contributor / Editor roles.
* RBAC.
* Security scopes.
* Draft management.
* Review workflow.
* Publishing.
* User role management.
* Deployment.

---

# 9. Acceptance Criteria

The system shall be considered acceptable when:

1. The React + TypeScript frontend successfully communicates with FastAPI.
2. Core documentation operations work through REST APIs.
3. Supabase successfully stores application data.
4. Users can create, view, edit, and delete documentation in the MVP.
5. Markdown content can be created and previewed.
6. Categories and tags can be assigned to articles.
7. Users can search and filter documentation.
8. Users can register and log in in the Beta.
9. JWT authentication protects required endpoints.
10. Authenticated users can access their profile dashboard.
11. Users can update permitted profile information.
12. Reader, Contributor, and Editor roles are enforced.
13. Security scopes restrict protected operations.
14. Contributors can submit drafts for review.
15. Editors can review and publish documentation.
16. Editors can manage user roles.
17. Unauthorized users cannot perform restricted operations.
18. The Beta application can be deployed successfully.

---

# 10. Requirements Traceability

The project shall maintain traceability between requirements and implementation.

The traceability structure is:

**PRD Goal → SRS Requirement → REST API → Backend Component → Frontend Component → Test Case → Release**

Each major requirement should be identifiable by its requirement ID and mapped to its corresponding implementation and verification method.

---

# Appendix A - Roles and Permissions

| Permission         | Reader | Contributor | Editor |
| ------------------ | -----: | ----------: | -----: |
| Read articles      |      ✓ |           ✓ |      ✓ |
| Search articles    |      ✓ |           ✓ |      ✓ |
| Filter articles    |      ✓ |           ✓ |      ✓ |
| Create articles    |      — |           ✓ |      ✓ |
| Edit own drafts    |      — |           ✓ |      ✓ |
| Delete own drafts  |      — |           ✓ |      ✓ |
| Submit for review  |      — |           ✓ |      ✓ |
| Review articles    |      — |           — |      ✓ |
| Publish articles   |      — |           — |      ✓ |
| Manage user roles  |      — |           — |      ✓ |
| View own profile   |      ✓ |           ✓ |      ✓ |
| Update own profile |      ✓ |           ✓ |      ✓ |

# Appendix B - Security Scopes

| Scope              | Operation              |
| ------------------ | ---------------------- |
| `articles:read`    | Read articles          |
| `articles:create`  | Create articles        |
| `articles:update`  | Update articles        |
| `articles:delete`  | Delete articles        |
| `articles:review`  | Review articles        |
| `articles:publish` | Publish articles       |
| `users:manage`     | Manage users and roles |

# Appendix C - API Areas

| API Area      | Main Purpose                    | Release |
| ------------- | ------------------------------- | ------- |
| `/articles`   | Documentation CRUD              | MVP     |
| `/categories` | Category management             | MVP     |
| `/tags`       | Tag management                  | MVP     |
| `/auth`       | Registration and authentication | Beta    |
| `/users`      | User and profile management     | Beta    |

# Appendix D - Verification

Requirements shall be verified using:

* Manual frontend testing.
* REST API testing.
* Authentication testing.
* Authorization and RBAC testing.
* Security scope testing.
* Database verification.
* Integration testing.
* Acceptance testing.

# 11. Use Cases

This section describes the main interactions between DocHub users and the system. The use cases are organized according to the MVP and Beta releases defined in this SRS.

## UC-01 Register

| **Field** | **Details** |
|---|---|
| Actor | Guest User |
| Preconditions | User is not authenticated; email is not already registered. |
| Primary Flow | 1) User opens registration page 2) Enters name, email, and password 3) Submits form 4) System validates information and hashes password 5) Account is created in Supabase 6) Success response returned. |
| Alternative Flow | A1: Email already exists → return conflict error. A2: Invalid registration data → return validation error. |
| Post Conditions | User account persisted; user can log in. |
| Related FR | FR-018, FR-022 |

## UC-02 Login

| **Field** | **Details** |
|---|---|
| Actor | Registered User |
| Preconditions | User has an existing account. |
| Primary Flow | 1) User opens login page 2) Enters email and password 3) System verifies credentials 4) JWT access token is generated 5) Token is returned to frontend 6) User accesses authenticated features. |
| Alternative Flow | A1: Invalid credentials → return `401 Unauthorized`. A2: Invalid or expired JWT → deny access to protected endpoints. |
| Post Conditions | User is authenticated and can access authorized features. |
| Related FR | FR-019, FR-020, FR-021, FR-022 |

## UC-03 View Article

| **Field** | **Details** |
|---|---|
| Actor | Reader / Intern |
| Preconditions | DocHub application is accessible; published articles exist. |
| Primary Flow | 1) User opens documentation page 2) System requests published articles 3) Backend retrieves articles from Supabase 4) Articles are returned 5) User selects an article 6) Full documentation is displayed. |
| Alternative Flow | A1: No articles available → display empty-state message. A2: Article not found → return `404 Not Found`. |
| Post Conditions | Selected documentation is displayed to the user. |
| Related FR | FR-001, FR-003 |

## UC-04 Create Article

| **Field** | **Details** |
|---|---|
| Actor | Contributor / Developer |
| Preconditions | User has permission to create articles. |
| Primary Flow | 1) User clicks Create Article 2) Enters title and Markdown content 3) Assigns category and tags 4) Previews article 5) Submits form 6) Backend validates information 7) Article is stored in Supabase 8) Success response returned. |
| Alternative Flow | A1: Missing required fields → validation error. A2: Invalid category or tag reference → validation error. A3: Database failure → return appropriate server error. |
| Post Conditions | New article stored in Supabase. |
| Related FR | FR-002, FR-006, FR-007, FR-008, FR-009, FR-010 |

## UC-05 Edit Article

| **Field** | **Details** |
|---|---|
| Actor | Contributor / Developer |
| Preconditions | Article exists; in Beta, user owns the draft or has the required permission. |
| Primary Flow | 1) User opens an article 2) Selects Edit 3) Updates title, content, category, or tags 4) Saves changes 5) Backend validates request and permissions 6) Supabase article is updated 7) Updated article is returned. |
| Alternative Flow | A1: Article not found → return `404 Not Found`. A2: Unauthorized modification → return `403 Forbidden`. A3: Invalid data → return validation error. |
| Post Conditions | Article updated with the latest information. |
| Related FR | FR-004 |

## UC-06 Delete Article

| **Field** | **Details** |
|---|---|
| Actor | Contributor / Developer |
| Preconditions | Article exists; in Beta, user owns the draft or has the required permission. |
| Primary Flow | 1) User selects an article 2) Clicks Delete 3) Confirms deletion 4) Frontend sends DELETE request 5) Backend validates permission 6) Article is deleted from Supabase 7) Success response returned. |
| Alternative Flow | A1: User cancels deletion → no changes occur. A2: Article not found → return `404 Not Found`. A3: Unauthorized deletion → return `403 Forbidden`. |
| Post Conditions | Article removed from the database. |
| Related FR | FR-005 |

## UC-07 Search Article

| **Field** | **Details** |
|---|---|
| Actor | Reader / Intern |
| Preconditions | Documentation articles exist. |
| Primary Flow | 1) User enters a keyword 2) Frontend sends search request 3) Backend searches article titles and content 4) Matching articles are returned 5) Frontend displays search results. |
| Alternative Flow | A1: Empty query → display default article list. A2: No matching articles → display no-results message. |
| Post Conditions | Matching documentation articles are displayed. |
| Related FR | FR-013, FR-014 |

## UC-08 Filter Article

| **Field** | **Details** |
|---|---|
| Actor | Reader / Intern |
| Preconditions | Documentation articles and category or tag information exist. |
| Primary Flow | 1) User opens documentation listing 2) Selects a category or tag 3) Frontend sends filtering parameters 4) Backend queries Supabase 5) Matching articles are returned 6) Filtered results are displayed. |
| Alternative Flow | A1: Invalid filter value → return `400 Bad Request`. A2: No matching articles → display empty-state message. |
| Post Conditions | User sees documentation matching the selected filters. |
| Related FR | FR-011, FR-012 |

## UC-09 Manage User Profile

| **Field** | **Details** |
|---|---|
| Actor | Authenticated User |
| Preconditions | User is logged in with a valid JWT. |
| Primary Flow | 1) User opens profile dashboard 2) System validates JWT 3) Backend retrieves profile information 4) Frontend displays name, email, and assigned role 5) User updates permitted information 6) Backend validates and saves changes 7) Updated profile is displayed. |
| Alternative Flow | A1: Invalid or expired token → return `401 Unauthorized`. A2: Invalid profile information → return validation error. |
| Post Conditions | User profile displayed or updated successfully. |
| Related FR | FR-023, FR-024, FR-025, FR-026 |

## UC-10 Submit Article for Review

| **Field** | **Details** |
|---|---|
| Actor | Contributor / Developer |
| Preconditions | User is authenticated; an article draft exists. |
| Primary Flow | 1) Contributor opens a draft 2) Reviews article content 3) Selects Submit for Review 4) Backend validates permissions 5) Article status changes from Draft to Submitted 6) Updated status is stored in Supabase 7) Success response returned. |
| Alternative Flow | A1: Article not found → return `404 Not Found`. A2: Insufficient permissions → return `403 Forbidden`. |
| Post Conditions | Article is marked as Submitted and available for editorial review. |
| Related FR | FR-029, FR-033, FR-034 |

## UC-11 Review and Publish Article

| **Field** | **Details** |
|---|---|
| Actor | Editor / Admin |
| Preconditions | Editor is authenticated; submitted articles exist; required security scopes are available. |
| Primary Flow | 1) Editor opens review dashboard 2) System retrieves submitted articles 3) Editor selects an article 4) Reviews its content 5) Approves article for publication 6) Backend validates Editor role and `articles:publish` scope 7) Article status changes to Published 8) Updated article is stored in Supabase 9) Article becomes available to Readers. |
| Alternative Flow | A1: Article not found → return `404 Not Found`. A2: Insufficient permissions → return `403 Forbidden`. A3: Publishing operation fails → article remains unchanged. |
| Post Conditions | Article is published and available to Readers. |
| Related FR | FR-030, FR-031, FR-035, FR-036 |

## UC-12 Manage User Roles

| **Field** | **Details** |
|---|---|
| Actor | Editor / Admin |
| Preconditions | Editor is authenticated and has the `users:manage` security scope. |
| Primary Flow | 1) Editor opens user management 2) System retrieves registered users 3) Editor selects a user 4) Assigns or changes the user's role 5) Backend validates permission and requested role 6) User role is updated in Supabase 7) Success response returned. |
| Alternative Flow | A1: User not found → return `404 Not Found`. A2: Insufficient permissions → return `403 Forbidden`. A3: Invalid role → return validation error. |
| Post Conditions | User's assigned role is updated and future authorization checks use the updated role. |
| Related FR | FR-027, FR-028, FR-032 |

Each requirement shall be considered verified when the expected system behavior can be demonstrated and the corresponding test case passes.
