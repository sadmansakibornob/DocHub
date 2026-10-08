# DocHub - Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for DocHub, a lightweight internal knowledge base and technical documentation management system.

The purpose of DocHub is to provide a centralized platform where users can create, manage, organize, review, publish, search, and read technical documentation.

The system is designed to demonstrate the use of React.js with TypeScript, FastAPI with Python, REST APIs, MongoDB, authentication, authorization, Role-Based Access Control (RBAC), and security scopes.

### 1.2 Scope

DocHub will provide a web-based documentation platform consisting of:

* A React + TypeScript frontend.
* A FastAPI + Python backend.
* REST APIs for frontend-backend communication.
* MongoDB for persistent data storage.
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
| MongoDB  | NoSQL document-oriented database                                  |

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

   * MongoDB

The overall architecture is:

**React + TypeScript → FastAPI REST API → MongoDB**

The frontend is responsible for user interaction and presentation, while the backend handles business logic, authentication, authorization, validation, and database operations.

## 2.2 Product Functions

The system shall provide the following major functions:

### MVP Functions

* View documentation articles.
* Create documentation articles.
* Edit documentation articles.
* Delete documentation articles.
* Store documentation in MongoDB.
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

* MongoDB.

### Development Environment

* Linux, Windows, or macOS.
* Git.
* GitHub.
* Local development server.

## 2.5 Constraints

* The application must use React.js with TypeScript.
* The backend must use FastAPI with Python.
* Frontend-backend communication must use REST APIs.
* MongoDB must be used for persistent data storage.
* Authentication must use OAuth2 Password Flow with JWT.
* Authorization must use RBAC and security scopes.
* The project must remain small enough to complete within the course timeline.
* The system must not depend on AI, ML, LLM, or RAG functionality.

## 2.6 Assumptions

* Users have access to a modern web browser.
* MongoDB is available during development and deployment.
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
| FR-006 | The system shall store documentation articles in MongoDB.               | MVP     |

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

DocHub shall use MongoDB as its database.

The database shall contain collections for the primary application entities.

### Users Collection

Stores:

* User ID
* Name
* Email / username
* Password hash
* Assigned role
* Profile information
* Account metadata

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
* MongoDB database.
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
3. MongoDB successfully stores application data.
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

Each requirement shall be considered verified when the expected system behavior can be demonstrated and the corresponding test case passes.
