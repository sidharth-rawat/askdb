# askdb

**Talk to Your Database in Natural Language**

askdb is a self-hosted, AI-powered database query assistant that transforms natural language questions into database queries. Simply ask questions about your database in plain English, and it will execute the queries and return the results - no database query knowledge required!

> **Safe & Read-Only**: askdb only executes SELECT queries for data retrieval. It never performs destructive operations (DELETE, UPDATE, DROP) or data manipulation, keeping your database safe.


## What is askdb?

askdb bridges the gap between you and your database by leveraging AI to understand natural language queries and convert them into executable database queries. Whether you're a business analyst, developer, or anyone who needs to query databases, askdb makes it simple and intuitive.

**Currently supports PostgreSQL databases** with plans to add support for other databases in the future.

### Example Queries:
- "What are all the rows in the users table?"
- "Show me the top 10 customers by revenue"
- "How many orders were placed last month?"
- "List all products with price greater than $100"

The backend intelligently processes your natural language input, generates appropriate read-only queries, executes them against your connected database, and returns the results in a user-friendly format.

## Architecture


The project follows a modern full-stack architecture:

- **Frontend**: Next.js 16 with TypeScript
- **Backend**: Fastify with TypeScript
- **Database**: PostgreSQL for application data storage
- **Cache**: Redis for DB caching
- **AI**: Google Gemini AI for natural language processing and query generation
- **ORM**: Drizzle ORM for type-safe database operations

## Quick Start

Get askdb up and running on your machine in seconds!

### Prerequisites

- Docker and Docker Compose installed
- Google Gemini AI API key ([Get one here](https://aistudio.google.com/app/api-keys))

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` and update the required values:
   - `AI_API_KEY`: Your Gemini API key (required)
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`: PostgreSQL credentials
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Application admin credentials
   - `JWT_SECRET`, `REDIS_ENCRYPTION_SECRET`: Security secrets

### One-Command Setup

```bash
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Services

The Docker Compose configuration provisions the following services:

- `askdb-postgres`: PostgreSQL 16 database (port 5432)
- `askdb-redis`: Redis 7 cache (port 6379)
- `askdb-backend`: Backend API service (port 3001)
- `askdb-frontend`: Frontend web application (port 3000)

### Manual Smoke Test

After starting the services:

1. Access the frontend at http://localhost:3000
2. Log in with credentials from your `.env` file:
   - Email: `ADMIN_EMAIL` value
   - Password: `ADMIN_PASSWORD` value
3. Connect your database using the connection form
4. Ask a natural language question (e.g., "Show me all users")
5. Verify the results are displayed correctly

## Local Development

### Run Backend
```bash
cd backend
pnpm install
pnpm dev
```

### Run Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Database Migrations
```bash
cd backend
pnpm drizzle-kit migrate --config src/drizzle.config.ts
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

ISC

---
