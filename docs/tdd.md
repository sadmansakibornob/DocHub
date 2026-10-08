# DocHub - Technical Design Document (TDD)

## Technical Stack

| Layer         | Technology             |
| ------------- | ---------------------- |
| Frontend      | React + TypeScript     |
| Backend       | Python FastAPI         |
| Database      | MongoDB (NoSQL)        |
| Auth          | OAuth2 + JWT           |
| Authorization | RBAC + Security Scopes |
| API           | REST                   |

## Backend Design by Layer

### 1. Controller Layer

* FastAPI routers per application domain:

  * `/auth`
  * `/articles`
  * `/categories`
  * `/tags`
  * `/users`
* Responsibilities: request parsing, validation, response mapping, status codes.

### 2. Service Layer

* Encapsulates business rules:

  * Article CRUD operations
  * Draft and publishing workflow
  * Role and permission validation
  * Article ownership validation
  * Search and filtering logic

### 3. Repository Layer

* Uses MongoDB data-access repositories.
* Responsibilities:

  * CRUD operations
  * Database queries
  * User and role persistence
  * Article, category, and tag data management

### 4. Authentication Layer

* OAuth2 password flow with JWT access tokens.
* Password hashing with bcrypt/argon2.
* Dependency-based authentication guards for protected routes.

### 5. Authorization Layer

* Role-Based Access Control for:

  * Reader / Intern
  * Contributor / Developer
  * Editor / Admin
* Security scopes:

  * `articles:read`
  * `articles:create`
  * `articles:update`
  * `articles:delete`
  * `articles:review`
  * `articles:publish`
  * `users:manage`

### 6. Error Handling

* Standard HTTP status codes and JSON error responses.
* Central exception handlers for validation, authentication, authorization, and database errors.

### 7. Logging

* Application logs for important system events.
* Key events: authentication failures, article updates, article submissions, publishing actions, unauthorized access attempts, and server errors.

### 8. Article Workflow

* Documentation lifecycle:

  * Draft
  * Submitted
  * Published
* Contributors manage their own drafts.
* Editors review and publish submitted articles.

### 9. Security

* Secure password hashing.
* JWT-based authentication.
* Backend-enforced RBAC.
* Security scope validation for protected operations.
* Authorization checks for article ownership and user management.

### 10. Integration Strategy

1. React frontend communicates with FastAPI through REST APIs.
2. FastAPI validates requests and authentication.
3. Service layer applies business rules.
4. Repository layer communicates with MongoDB.
5. FastAPI returns JSON responses to the frontend.

## Frontend Design Highlights

* Type-safe React components and API types.
* Centralized API client for FastAPI communication.
* Authentication state management.
* Article list, search, filtering, editor, and preview interfaces.
* Role-based UI visibility.
* API error handling and loading states.

## Design-to-Requirement Mapping

| Design Area              | Requirement IDs           |
| ------------------------ | ------------------------- |
| Article module           | FR-001..FR-011            |
| REST API and integration | FR-012..FR-013            |
| Authentication module    | FR-014..FR-017            |
| RBAC and security scopes | FR-018..FR-020, FR-026    |
| Article workflow         | FR-021..FR-024            |
| User management          | FR-025                    |
| Frontend architecture    | NFR-001, NFR-003, NFR-010 |
| Backend architecture     | NFR-002, NFR-004          |
| Security architecture    | NFR-005..NFR-008          |
| Error handling           | NFR-009..NFR-010          |
| Database architecture    | MongoDB                   |
