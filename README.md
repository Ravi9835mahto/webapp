# Web Application

A full-stack web application that allows users to upload and showcase their favorite memories.

## Features

 User Authentication (SignUp & Login)
 Image Upload and Storage
 Mosaic Image Display
 User Profile with Uploaded Images
 Public Profile Page for Each User

## Project Structure

```
webapp/
├── client/           # Frontend files
│   ├── login.html   # Login page
│   ├── signup.html  # Signup page
│   ├── profile.html # User profile page
│   └── public.html  # Public page
├── server/          # Backend files
│   ├── db.js       # Database configuration
│   ├── routes/     # API Routes
│   ├── models/     # Database Models
│   ├── server.js   # Server entry point
│   └── .env        # Environment variables
└── package.json    # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)
- MongoDB (for database)

### Installation

#### Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a .env file and add the following:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm start
```

#### Frontend Setup

Navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/signup | POST | User Registration |
| /api/auth/login | POST | User Login |
| /api/images/upload | POST | Upload an image |
| /api/images/:username | GET | Get user images |

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
