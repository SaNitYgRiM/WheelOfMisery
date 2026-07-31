# Wheel Of Misery - Task Management Application

A full-stack task management application with authentication, persistent task storage, and an interactive spinning wheel interface for randomized task selection. Built using Node.js, Express.js, PostgreSQL, Prisma ORM, and Docker.

## Live Demo

https://wheelofmisery.onrender.com/

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Create, update, delete, and manage tasks
- User-specific task storage
- Interactive HTML5 Canvas spinning wheel
- Randomized task selection
- Task completion tracking
- Task history management
- Analytics dashboard with Chart.js
- PostgreSQL database persistence
- Prisma ORM database management
- Dockerized deployment

## Tech Stack

- **Frontend**
 : HTML5, CSS, JavaScript, Chart.js

- **Backend**
 : Node.js, Express.js, JWT Authentication, bcrypt

- **Database & Tools**
 : PostgreSQL, Prisma ORM, Docker


## Installation

Clone the repository:

```bash
git clone https://github.com/SaNitYgRiM/WheelOfMisery.git

cd WheelOfMisery
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Database Setup

Generate Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5000
```

## Docker Setup

Build and run using Docker Compose:

```bash
docker compose up --build
```

## API Functionality

The backend provides REST APIs for:

- User authentication
- User registration and login
- Task creation
- Task retrieval
- Task updates
- Task deletion
- Task completion tracking



