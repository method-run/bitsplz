# Bitsplz

An online game about being a pixel.

## Prerequisites

- Docker Desktop
- Node.js 18+
- npm

## Quick Start

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Start the development environment:
   ```bash
   docker-compose up -d
   ```
4. Visit http://localhost:8080 in your browser

## Development Setup

### Project Structure

```
bitsplz/
├── backend/          # Express + WebSocket server
├── frontend/         # React + Vite frontend
└── common/           # Shared types and utilities
```

### Development Workflow

1. Start the development environment:

   ```bash
   docker-compose up -d
   ```

2. View logs:

   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f db
   ```

3. Rebuild services after dependencies change:

   ```bash
   docker-compose up -d --build
   ```

4. Stop the development environment:
   ```bash
   docker-compose down
   ```

### Database

The PostgreSQL database is automatically initialized with the required schema when the container starts. Data is persisted in a Docker volume.

#### Migrations

Database migrations are managed through SQL files in `backend/src/migrations/sql/`. To make changes to the DB schema:

1. Create a new SQL migration file in `backend/src/migrations/sql/`
2. Name it with the next available number (e.g., `00004-your-migration-name.sql`)
3. Write your SQL migration
4. Trigger the migration by calling the migrations endpoint:
   ```bash
   curl http://localhost:3000/api/migration
   ```

## Production

WIP

## License

ISC
