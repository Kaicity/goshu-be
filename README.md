# EventHub Server

This is the backend server for the EventHub project, built with Node.js, Express, and MongoDB. It provides authentication, user management, and email verification features.

## Features

- User registration and login with JWT authentication
- Email verification and password reset via email
- User management endpoints (get all users, change password, etc.)
- MongoDB integration using Mongoose
- Error handling middleware

## Project Structure

The server project is organized as follows:

```
/servers
├── config/           # Configuration files (e.g., database, environment)
├── controllers/      # Route handler logic for different resources
├── middleware/       # Custom middleware (e.g., authentication, error handling)
├── models/           # Mongoose models for MongoDB collections
├── routes/           # Express route definitions
├── utils/            # Utility functions (e.g., email sending, token generation)
├── app.js            # Main Express app setup
├── server.js         # Entry point to start the server
└── README.md         # Project documentation
```

This structure helps keep the codebase modular and maintainable.
