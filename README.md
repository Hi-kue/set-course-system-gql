# Student Course Registration System

A full-stack web application that provides a robust solution for academic course registration, enabling students to register for courses, update their profiles, and allows administrators to manage course information and student enrollments.

## Overview

This system is built using modern web technologies including the MERN stack (MongoDB, Express, React, Node.js) with GraphQL API integration, providing a seamless and efficient user experience for both students and administrators.

## Key Features

### Student Features

- **Account Management**
  - Self-registration with full profile information
  - Secure authentication using JWT tokens
  - Profile management to update personal details

- **Course Management**
  - Browse available courses with detailed information
  - Register for courses with real-time enrollment updates
  - View enrolled courses with course details
  - Drop courses with automatic system updates

### Administrator Features

- **User Management**
  - Create and manage student accounts
  - Create and manage admin accounts
  - View detailed student information

- **Course Administration**
  - Create new course offerings
  - Update course details (name, section, semester)
  - Manage student enrollments
  - Delete courses from the system

- **System Overview**
  - Dashboard with key statistics
  - Comprehensive listing of all courses and students
  - Detailed views for individual records

## Technical Architecture

### Backend Architecture

The backend is built with Node.js and Express, implementing a GraphQL API using Apollo Server for efficient data querying and manipulation. The system uses MongoDB for data persistence with Mongoose as the ODM (Object Document Mapper).

- **Authentication System**
  - JWT (JSON Web Tokens) for secure authentication
  - Role-based access control (Student vs Administrator)
  - Password encryption for secure storage

- **GraphQL API**
  - Strongly typed schema definitions
  - Efficient resolvers for data operations
  - Separate type definitions for courses, students, and administrators

- **Data Models**
  - Course model with relevant academic information
  - Student model with profile and enrollment data
  - Admin model with administrative privileges
  - Relationship management between models

### Frontend Architecture

The frontend is built with React, providing a modern, responsive user interface that communicates with the GraphQL backend. The application uses a component-based architecture with hooks for state management and side effects.

- **Component Architecture**
  - Reusable UI components for consistency
  - Page components for different application views
  - Layout components for consistent page structure

- **State Management**
  - React Context API for global state (auth, etc.)
  - Custom hooks for reusable logic
  - Apollo Client for GraphQL state management

- **Routing & Navigation**
  - React Router for declarative routing
  - Protected routes based on authentication state
  - Role-based route access control

- **UI Framework**
  - React Bootstrap for responsive layouts
  - Custom styling for enhanced user experience
  - Form validation and error handling

## GraphQL API

The GraphQL API provides a flexible interface for data operations, with the following key queries and mutations:

### Queries

- **Student Data**
  - `students`: Retrieve all students
  - `student(id)`: Get student by ID

- **Course Data**
  - `courses`: Retrieve all courses
  - `course(id)`: Get course by ID

- **Relationship Data**
  - `coursesByStudent`: Get courses for a specific student
  - `studentsByCourse`: Get students enrolled in a specific course

### Mutations

- **User Account Operations**
  - `createStudent`: Register a new student
  - `createAdmin`: Create a new administrator account
  - `login`: Student authentication
  - `adminLogin`: Administrator authentication
  - `updateStudent`: Update student information

- **Course Operations**
  - `createCourse`: Create a new course
  - `updateCourse`: Update course information
  - `deleteCourse`: Remove a course from the system

- **Enrollment Operations**
  - `addCourseToStudent`: Register a student for a course
  - `removeCourseFromStudent`: Drop a course for a student

## Getting Started

### Prerequisites

- Node.js (v14+) and npm
- MongoDB (local or Atlas cloud database)

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

### Configuration

1. Create a `.env` file in the server directory with the following variables:

   ```bash
   PORT=4000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:

   ```bash
   cd client
   npm run dev
   ```

## Code Quality

This project uses Biome.js for code formatting and linting to ensure consistent code style and quality. Run the following commands from the client directory:

```bash
npm run biome:format  # Format code
npm run biome:lint    # Lint code
npm run biome:check   # Check for issues
```

## Technologies Used

### Backend

- **Node.js & Express**: Server framework
- **GraphQL & Apollo Server**: API layer
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Frontend

- **React**: UI library with hooks and functional components
- **Apollo Client**: GraphQL client
- **React Router**: Navigation and routing
- **React Bootstrap**: UI component library
- **Biome.js**: Code formatting and linting

## Future Enhancements

- Email notifications for enrollment events
- Advanced search and filtering capabilities
- Student grade tracking
- Course prerequisites and validation
- Calendar integration for class schedules
