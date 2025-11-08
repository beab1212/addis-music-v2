# Addis-Music-v2









# Backend API Service Setup Instructions

This guide sets up **Redis**, **PostgreSQL**, and **pgvector** for the music streaming platform.

---

## 1. Install and Start Redis

```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
redis-cli ping
# Should return: PONG
```

# 2. Install and Start PostgresSQL

```bash
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
psql --version
```

# 3. Install pgvector Extension
```bash
sudo apt install postgresql-17-pgvector     # replace 17 with your version
```

# 4. Set Up PostgresSQl Database and User
```bash
sudo -i -u postgres psql
```
Inside psql
```bash
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a new user for the app
CREATE USER addismusic WITH PASSWORD 'dbpassword';

-- Create a database owned by the new user
CREATE DATABASE addisdb OWNER addismusic;

-- Optional: list all users
\du

-- Optional: list all databases
\l

-- Exit psql
\q
```

# 5. Connect to Your Database
```bash
psql -h localhost -U addismusic -d addisdb
```




npx @better-auth/cli migrate --config ./src/libs/auth.ts


npx prisma migrate dev --name init --schema ./src/prisma/prisma.schema

