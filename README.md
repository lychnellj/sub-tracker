# sub-tracker

a to-be fullstack subscription tracker project (MVP phase), currently focused on authentication only as a part of a course examination

At this stage, the app includes:

- User registration with username + password
- User login with backend authentication
- JWT-based session handling
- Protected welcome page after successful auth

Subscription-tracking features will be added in a later phase.

## Live Website

[Link to website](https://comfortable-motivation-production-7c9e.up.railway.app/login)

## Tech Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL (Supabase)
- Auth: JWT + bcrypt
- Containerization: Docker
- CI: GitHub Actions
- Hosting: Railway

## Deployment Overview

Deployment is currently set up as:

1. Code is pushed/merged to `dev` from feature branches
2. GitHub Actions runs CI checks (tests + Docker build validation)
3. After actions are ran and tests pass, the feature merged to dev gets merged to main via a PR
4. Railway is connected to the GitHub repo and deploys from the configured branch after the CI pipeline finishes successfully
5. Railway runs the containerized app and uses environment variables configured in Railway

Runtime secrets are stored in Railway Variables, including:

- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

## CI Pipeline

The CI workflow is in:

`.github/workflows/deploy.yml`

Current jobs:

- `test`: installs backend dependencies and runs backend tests
- `build`: builds the Docker image to verify deployment readiness

## Local Development

### Backend

```bash
cd backend
npm install
npm test
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose (local stack)

```bash
docker compose up --build
```

## Environment Variables

Example backend env file:

- `PORT=8080`
- `DATABASE_URL=...`
- `JWT_SECRET=...`
- `NODE_ENV=development`

See `backend/.env.example` for the template.
