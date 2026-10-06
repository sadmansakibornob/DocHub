# DocHub — Internal Knowledge Base & Tech Wiki

**DocHub** is a lightweight, secure internal documentation and wiki web application built with **React**, **TypeScript**, and **FastAPI**. It allows teams to create, review, and publish technical documentation with strict **Role-Based Access Control (RBAC)** and granular security scopes.

---

## 🎯 Project Overview

DocHub addresses the challenge of internal knowledge management by providing a streamlined, security-first publishing workflow for technical teams.

### Core Features
- 📝 **Markdown Editor & Preview:** Easily write and render Markdown articles.
- 🔐 **OAuth2 & JWT Authentication:** Secure login using OAuth2 password flow with JWT access tokens.
- 🛡️ **Role-Based Access Control (RBAC):** Strict permissions dividing Readers, Contributors, and Editors.
- 🏷️ **Category & Tag Filtering:** Organize documentation by technical domains and tags.
- ⏱️ **Draft & Approval Workflow:** Submissions require review and approval before publishing.

---

## 👥 User Roles & RBAC Matrix

| Role | Description |
|---|---|
| **Reader / Intern** | Can search, filter, and read published documentation articles. |
| **Contributor / Developer** | Can create, draft, edit their own drafts, and submit articles for review. |
| **Editor / Admin** | Can review pending drafts, publish/archive articles, and manage user roles. |



