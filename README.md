🎮 A prediction game system built entirely through AI pair programming using Cursor IDE - demonstrating the potential of AI-assisted development in creating a full-stack TypeScript/React application with zero manual coding. 🤖✨

# Prediction Game System

A simple prediction game system that allows users to create and participate in prediction challenges. Users can make predictions about event outcomes and determine winners after events are completed.

## Features

- User Management
  - Create new users
  - View user list
  - User statistics (total participations, win/loss records, financial statistics)

- Prediction Management
  - Create prediction challenges
  - Set prediction amounts and deadlines
  - View prediction list
  - Complete predictions and determine winners

- Data Statistics
  - User win/loss statistics
  - Financial return statistics
  - Participation frequency statistics

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- date-fns

### Backend
- Node.js
- Express
- PostgreSQL

### Deployment
- Docker
- Docker Compose
- Nginx

## Deployment Guide

1. Requirements
   - Docker
   - Docker Compose

2. Environment Configuration
   ```bash
   # Copy environment variable example file
   cp .env.example .env
   
   # Edit .env file and set the following variables:
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password_here
   POSTGRES_DB=prediction_game
   JWT_SECRET=your_jwt_secret_here
   ```

3. Start Services
   ```bash
   # Build and start all services
   docker-compose up -d
   ```

4. Access Application
   - Application runs at http://localhost
   - API services are accessed via `/api` path

## Directory Structure

```
.
├── client/                 # Frontend code
│   ├── src/               # Source code
│   ├── public/            # Static resources
│   └── Dockerfile         # Frontend Docker config
├── server/                # Backend code
│   ├── index.js          # Entry file
│   ├── init.sql          # Database init script
│   └── Dockerfile        # Backend Docker config
├── docker-compose.yml     # Docker compose config
├── .env.example          # Environment variables example
└── README.md             # Project documentation
```

## Development Guide

1. Frontend Development
   ```bash
   cd client
   npm install
   npm start
   ```

2. Backend Development
   ```bash
   cd server
   npm install
   npm start
   ```

## Database Schema

### users table
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) UNIQUE NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE

### predictions table
- id: SERIAL PRIMARY KEY
- title: VARCHAR(255) NOT NULL
- description: TEXT
- amount: DECIMAL(10, 2) NOT NULL
- creator_id: INTEGER REFERENCES users(id)
- opponent_id: INTEGER REFERENCES users(id)
- creator_prediction: TEXT NOT NULL
- opponent_prediction: TEXT NOT NULL
- status: VARCHAR(50) DEFAULT 'pending'
- winner_id: INTEGER REFERENCES users(id)
- due_date: TIMESTAMP WITH TIME ZONE
- created_at: TIMESTAMP WITH TIME ZONE

## Installation and Setup

### Requirements
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL 14+

### Development Environment Setup

1. Clone Project
```bash
git clone <repository-url>
cd prediction-game
```

2. Install Dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Environment Setup
```bash
# Create .env file in project root
cp .env.example .env
# Edit .env file and set required environment variables
```

4. Start Development Environment
```bash
# Start database
docker-compose up -d

# Start backend server (in server directory)
npm start

# Start frontend dev server (in client directory)
npm start
```

### Production Deployment

1. Build Frontend
```bash
cd client
npm run build
```

2. Start All Services Using Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## API Documentation

### User Related APIs
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Prediction Related APIs
- `GET /api/predictions` - Get all prediction records
- `POST /api/predictions` - Create new prediction
- `PUT /api/predictions/:id/complete` - Complete prediction and set result

## Development Standards

1. Code Style
   - Use ESLint and Prettier for consistent code style
   - Follow TypeScript type definition standards

2. Git Commit Standards
   - Use clear commit messages
   - Use separate branches for each feature or fix

## License

MIT License

---

# 中文文档

[点击展开中文版本](./README.zh.md) 