# LOWKEY 💬

**Lowkey** is a real-time chat application built using Node.js and WebSockets. Developed as part of my 2019 final year project, it allows users to engage in live conversations via a responsive and lightweight interface. The application requires a database service running on a separate port for proper data handling.

## Features

- Real-time messaging with WebSockets
- Secure password hashing
- Event-driven communication
- Simple and easy-to-use interface

## Prerequisites

Ensure you have the following installed:

- **[Node.js](https://nodejs.org/en/)** – Core framework for backend development
- **[Nodemon](https://www.npmjs.com/package/nodemon)** – Automatically restarts the server on file changes
- A running **MySQL** database instance

### Node.js Check:

Ensure Node.js is installed by running:

```bash
node -v
```

## Installation

Follow these steps to set up the project locally:

1. **Clone the Repository:**

   ```bash
   git clone <repository-link>
   cd lowkey
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Environment Variables:**

   Copy the `.env.example` file and rename it to `.env`:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration. Here’s an example configuration:

   ```env
   # Database Configuration
   MYSQL_HOST = 'localhost'
   MYSQL_USER = 'root'
   MYSQL_PASSWORD = 'password'
   MYSQL_DATABASE = 'lowkey-db'
   MYSQL_CONNECTION_LIMIT = 100
   MYSQL_MULTISTATEMENTS = true

   # Authentication Keys
   AUTH_SALT = 10
   AUTH_SECRET_KEY = 'abcdefghijklmnopqrstuvwxyz'

   # Mailer Authentication
   MAILER_SERVICE = 'gmail'
   MAILER_AUTH_USER = 'example_email@gmail.com'
   MAILER_AUTH_PASS = 'password'
   ```

   Ensure the **MySQL** database is running and accessible with the credentials you provide.

4. **Start the Database:**

   Make sure your MySQL database is running with the necessary configurations as set in your `.env` file.

5. **Start the Application:**

   Use the following command to start the application:

   ```bash
   npm run dev
   ```

   This will launch the application on `http://localhost:3000` using Nodemon, which automatically restarts the server when file changes are detected.

## Key Technologies

- **[Node.js](https://nodejs.org/)** – Backend server
- **[ExpressJS](https://expressjs.com/)** – Web application framework
- **[BCryptJS](https://github.com/dcodeIO/bcrypt.js)** – Password hashing
- **[Socket.io](https://github.com/socketio/socket.io)** – Real-time communication
- **[Morgan](https://github.com/expressjs/morgan)** – HTTP request logging
- **[DotEnv](https://github.com/motdotla/dotenv)** – Environment variable management

## Usage

Once the application is running, visit `http://localhost:3000` to start interacting with the chat interface. You can open multiple browser windows or devices to simulate multiple users.

## Troubleshooting

- **Database connection issues:** Ensure MySQL is running with the correct host and credentials as specified in the `.env` file.
- **Server errors:** Check logs for detailed error messages and review your environment variable setup.

## Future Enhancements

- Improve the front-end for a more user-friendly experience
- Implement OAuth or JWT-based authentication for more secure user sessions
