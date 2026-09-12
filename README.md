# IAM Access Console — DRDO Internship Project

A unified **Identity and Access Management (IAM) Suite** with Single Sign-On (SSO), built as part of a DRDO (Defence Research and Development Organisation) internship at DESIDOC, Delhi.

## Overview

This project implements a multi-application IAM system where users log in once and gain seamless access across multiple independent sub-applications, secured centrally through Keycloak.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js / Express
- **Identity Provider:** Keycloak (Dockerized)
- **Database:** SQLite (per sub-application)
- **Auth Flow:** Direct Access Grants with SSO token handoff

## Key Features

- **Single Sign-On (SSO)** across all sub-applications via a shared `auth.js` utility
- **Two-Factor Authentication** using email OTP (dedicated `otp-service`, powered by Nodemailer)
- **Role-Based Access Control (RBAC)** enforced per module
- **Google Social Login** via Keycloak identity brokering
- **Audit Logging** — every sub-app logs actions to its own SQLite store via a shared `audit.js` module
- **Offline Resilience** — JWKS disk caching (`jwk-to-pem`) plus a live `OfflineBanner` component with periodic Keycloak health checks
- **Government-portal styled dashboard UI**, inspired by official Indian government websites

## Architecture

| Layer | Apps | Ports |
|---|---|---|
| Frontends (React) | 6 sub-app frontends | 3000–3005 |
| Backends (Node/Express) | 5 sub-app backends | 4001–4005 |
| OTP Microservice | `otp-service` | 4999 |
| Identity Provider | Keycloak (`drdo-internship` realm, 6 clients) | — |

## Security Notes

- All secrets (Keycloak admin credentials, OTP mail credentials, JWT signing config) are kept in `.env` files and are **not** committed to this repository.
- SSO uses Direct Access Grants rather than redirect-based flows to avoid redirect URI mismatches across multiple local apps.

## Author

- **Divyanshi Chaudhary** — B.Tech CSE-AI, MIET Meerut


Submitted under Dr. A.P.J. Abdul Kalam Technical University, guided by **Mr. Raj Kumar (Scientist 'E')**, DRDO, Delhi.

## Future Directions

- Multi-Factor Authentication (beyond email OTP)
- Centralized audit logging across all sub-applications
