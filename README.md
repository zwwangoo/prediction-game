# Betting Game Monorepo

This repository contains both the client and server components of the Betting Game application.

## Project Structure

- `client/`: Frontend React application
- `server/`: Backend Node.js server

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Install dependencies for both client and server:

```bash
npm run install:all
```

Or install them separately:

```bash
# Install client dependencies
npm run client:install

# Install server dependencies
npm run server:install
```

### Running the Application

Start both client and server concurrently:

```bash
npm start
```

Or run them separately:

```bash
# Start the client
npm run client:start

# Start the server
npm run server:start
```

## Client

The client is a React application located in the `client/` directory.

## Server

The server is a Node.js application located in the `server/` directory.

## Database

The application uses a database as configured in the server. See `server/init.sql` for the database schema. 