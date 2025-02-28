# Student Course Registration System

A complete web application using MERN stack and GraphQL, allowing students to register for courses, update course information, and manage their profiles.

## Project Structure

### Backend (GraphQL API)

The backend is built with Express, GraphQL, and MongoDB, with the following structure:

```
server/
├── config/             # Configuration files
│   ├── config.js       # Environment variables and constants
│   └── db.js           # MongoDB connection setup
├── middleware/         # Express and GraphQL middleware
│   └── auth.js         # JWT authentication middleware
├── models/             # MongoDB models
│   ├── course.model.js # Course schema and model
│   └── student.model.js# Student schema and model
├── resolvers/          # GraphQL resolvers
│   ├── course.resolver.js # Course-related resolvers
│   ├── index.js        # Combine all resolvers
│   └── student.resolver.js # Student-related resolvers
├── typedefs/           # GraphQL type definitions
│   ├── course.typedef.js # Course-related type definitions
│   ├── index.js        # Combine all type definitions
│   └── student.typedef.js # Student-related type definitions
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── server.js           # Main entry point
```

### Frontend (React)

The frontend will be built with React, using functional components and hooks:

```
client/
├── src/
│   ├── components/     # React components
│   ├── context/        # React context (auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── App.js          # Main App component
│   ├── index.js        # React entry point
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Features

- **Student Management**:
  - Registration and Login
  - Profile management
  - Course registration

- **Course Management**:
  - Add, update, and delete courses
  - View course details
  - List students in a course

- **Authentication**:
  - JWT-based authentication
  - Protected routes

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. Start the MongoDB server
2. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
3. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

## API Documentation

The GraphQL API provides the following operations:

### Queries

- `students`: Get all students
- `student`: Get student by ID
- `courses`: Get all courses
- `course`: Get course by ID
- `coursesByStudent`: Get courses for a specific student
- `studentsByCourse`: Get students for a specific course

### Mutations

- `createStudent`: Register a new student
- `login`: Student login
- `updateStudent`: Update student information
- `createCourse`: Create a new course
- `updateCourse`: Update course information
- `addCourseToStudent`: Register a student for a course
- `removeCourseFromStudent`: Drop a course for a student

## Technologies Used

- **Backend**:
  - Node.js and Express
  - GraphQL with Apollo Server
  - MongoDB with Mongoose
  - JWT for authentication

- **Frontend**:
  - React with hooks and functional components
  - Apollo Client for GraphQL
  - React Router for navigation
  - React Bootstrap for UI components
