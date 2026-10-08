# DocHub - Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This SRS defines functional and non-functional requirements for DocHub, a web application for creating, organizing, reviewing, and accessing technical documentation.

### 1.2 Scope

The system supports secure user access, documentation lifecycle management, search and filtering, role-based access control, security scopes, and document review and publishing using React (TypeScript), Python FastAPI, MongoDB (NoSQL), JWT, and REST APIs.

### 1.3 Definitions and Acronyms

| **Term** | **Meaning**                         |
| -------- | ----------------------------------- |
| FR       | Functional Requirement              |
| NFR      | Non-Functional Requirement          |
| JWT      | JSON Web Token                      |
| RBAC     | Role-Based Access Control           |
| API      | Application Programming Interface   |
| REST     | Representational State Transfer     |
| SRS      | Software Requirements Specification |
| PRD      | Product Requirements Document       |

### 1.4 References

* PRD: [PRD.md](../docs/PRD.md)
* TDD: [TDD.md](../docs/TDD.md)

## 2. Overall Description

### 2.1 Product Perspective

DocHub is a three-tier web system:

1. React (TypeScript) frontend for user interaction.
2. Python FastAPI backend for REST APIs and business logic.
3. MongoDB (NoSQL) for persistent storage.

### 2.2 Product Functions

* User registration and login
* JWT-based authentication
* Role-based access control
* Security scope-based permissions
* Technical documentation CRUD
* Markdown editing and preview
* Categories and tags
* Search and filtering
* Draft, review, and publishing workflow
* User role management

### 2.3 User Classes

Readers/Interns, Contributors/Developers, Editors/Admins.

### 2.4 Operating Environment

* Modern browsers (Chrome, Firefox, Edge, Safari)
* React (TypeScript) frontend
* Python FastAPI backend
* MongoDB (NoSQL)

### 2.5 Constraints

* JWT-based authentication is mandatory for protected operations.
* RBAC and security scopes must be enforced by the backend.
* MVP schedule is constrained to the academic timeline.
* The project intentionally excludes AI, ML, LLM, RAG, and other unnecessary features.

### 2.6 Assumptions and Dependencies

* MongoDB availability for persistent storage.
* Reliable frontend-backend communication through REST APIs.
* Valid user credentials for authenticated operations.
* Backend availability for API requests.

## 3. Functional Requirements

The complete functional requirements are defined in the DocHub PRD.

### 3.1 Summary by Domain

| **Domain**               | **FR Range**           |
| ------------------------ | ---------------------- |
| Documentation Management | FR-001..FR-011         |
| REST API & Integration   | FR-012..FR-013         |
| Authentication           | FR-014..FR-017         |
| RBAC & Security Scopes   | FR-018..FR-020, FR-026 |
| Documentation Workflow   | FR-021..FR-024         |
| User Management          | FR-025                 |

## 4. Non-Functional Requirements

The complete functional requirements are defined in the DocHub PRD.

### 4.1 Quality Attribute Summary

| **Attribute**                | **NFR IDs**      |
| ---------------------------- | ---------------- |
| Technology & Architecture    | NFR-001..NFR-003 |
| Security                     | NFR-004..NFR-008 |
| Reliability & Error Handling | NFR-009..NFR-010 |
| Usability                    | NFR-010          |
| Maintainability              | NFR-001..NFR-003 |

## 5. External Interface Requirements

### 5.1 User Interfaces

Web UI for authentication, documentation browsing, search/filtering, Markdown editing, article review, publishing, and user role management.

### 5.2 Software Interfaces

* REST APIs over HTTPS
* JSON request and response payloads
* JWT authentication
* MongoDB database

### 5.3 Hardware Interfaces

No special hardware dependencies.

### 5.4 Communication Interfaces

HTTPS/TLS for deployed communication, JSON payloads, and Bearer JWT authentication.

## 6. Assumptions and Constraints

1. The application is designed as a simple internal documentation platform.
2. Advanced features such as AI, real-time collaboration, native mobile applications, and complex enterprise integrations are outside the project scope.
3. Backend authorization is mandatory and cannot rely only on frontend role checks.
4. MongoDB is used as the persistent NoSQL database.
5. MVP focuses on documentation management and REST API integration; Beta adds authentication, RBAC, security scopes, and the review/publishing workflow.

## 7. Appendices

### Appendix A - Roles and Permissions

| **Role**                | **Permissions**                                 |
| ----------------------- | ----------------------------------------------- |
| Reader / Intern         | Read, search, and filter published articles     |
| Contributor / Developer | Create, edit, delete, and submit own drafts     |
| Editor / Admin          | Review, publish articles, and manage user roles |

### Appendix B - Security Scopes

* `articles:read`
* `articles:create`
* `articles:update`
* `articles:delete`
* `articles:review`
* `articles:publish`
* `users:manage`

### Appendix C - Core API Areas

* `/api/auth`
* `/api/articles`
* `/api/categories`
* `/api/tags`
* `/api/users`

### Appendix D - Verification

Requirements are verified through REST API testing, frontend integration testing, authentication testing, RBAC and security scope testing, and documentation workflow testing.
