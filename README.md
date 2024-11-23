# Social Media App

A basic social media application built with Node.js, Express, MongoDB, and EJS for user authentication, profile management, and post creation.

## Features

- **User Registration & Authentication**: Secure registration and login using hashed passwords (bcrypt) and JWT tokens.
- **User Profiles**: Profile pages with the ability to upload a profile picture.
- **Post Creation & Editing**: Logged-in users can create, edit, and view posts.
- **Likes**: Users can like/unlike posts.
- **Session Management**: Authentication sessions handled using cookies with JWT.
- **Responsive Design**: Frontend rendered with EJS templates and styled using TailwindCSS.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web application framework for handling routes and middleware.
- **MongoDB**: NoSQL database for storing user and post data.
- **EJS**: Embedded JavaScript templates for rendering dynamic HTML pages.
- **JWT (jsonwebtoken)**: For secure token-based authentication.
- **bcrypt**: For hashing passwords.
- **Multer**: Middleware for handling multipart/form-data (image uploads).
- **Cookie-Parser**: Middleware to parse cookies.

## Set up environment variables:

- Create a .env file in the root directory with the following:

```bash

   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key

```
 
## Folder Structure

```bash
.
├── config
│   └── multer.js           # Configuration for file uploads using multer
├── models
│   ├── user.js             # Mongoose schema and model for User
│   └── post.js             # Mongoose schema and model for Post
├── public
│   ├── css                 # Static assets (CSS, images, JS)
├── views
│   ├── index.ejs           # Home page template
│   ├── login.ejs           # Login page template
│   ├── profile.ejs         # Profile page template
│   ├── edit.ejs            # Post edit page template
│   └── profileupload.ejs   # Profile picture upload template
├── app.js                  # Main application file
└── README.md


```
## API Endpoints

### User Routes

- **`POST /register`**: Register a new user.
- **`POST /login`**: Login and receive a JWT token.
- **`GET /logout`**: Logout and clear the JWT token.

### Profile and Post Routes

- **`GET /profile`**: View user profile and their posts.
- **`GET /profile/upload`**: Upload profile picture page.
- **`POST /upload`**: Upload profile picture (protected).
- **`POST /post`**: Create a new post (protected).
- **`GET /edit/:id`**: Edit post page (protected).
- **`POST /update/:id`**: Update an existing post (protected).
- **`GET /like/:id`**: Like or unlike a post (protected).

## Middleware

- **`isLoggedin`**: Middleware to verify JWT and authenticate user access to protected routes.
