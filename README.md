Community Hub Frontend Application
This repository contains the frontend application for the Community Hub, a platform designed to connect event organizers with attendees. Users can discover, create, and manage local events, with distinct roles for general users, organizers, and administrators.

🚀 Features
Public Event Browsing: View all approved public events without logging in.

Event Details: Access full details for individual events.

User Registration & Login: Create new accounts and log in securely using custom email/password authentication.

Custom Role-Based Access Control (RBAC): Dynamic navigation and access based on user, organizer, or admin roles.

User Dashboard: Personalized dashboard for general users to view their registered events (future implementation).

User Profile Management: View and update personal profile information.

Organizer Dashboard: Organizers can create, view, edit, and delete their own events.

Admin Dashboard: Administrators have comprehensive control over users and events (approval/rejection, user role management).

Location Search Demo: A dedicated page demonstrating integration with the OpenStreetMap Nominatim API for location search (independent from event creation for now).

Responsive Design: Optimized for various device sizes using React-Bootstrap.

🛠️ Technologies Used
React.js: Frontend JavaScript library for building user interfaces.

React Router DOM: For client-side routing and navigation.

React-Bootstrap: UI framework for responsive and consistent design.

Bootstrap CSS: Core CSS framework.

Lucide React: For vector icons.

Vite: Fast frontend build tool.

Custom Authentication Context: Manages user authentication state, including login, registration, logout, and JWT handling.

js-cookie: For simple client-side cookie management for JWTs.

Fetch API: For making HTTP requests to the backend.

📦 Installation & Setup
Follow these steps to get the frontend application up and running on your local machine.

Prerequisites
Node.js (LTS version recommended)

npm or Yarn (package manager)

1. Clone the Repository
(Assuming you have the repository cloned, if not, replace with your actual clone command)

git clone <your-frontend-repo-url>
cd community-hub/frontend # Navigate into your frontend directory

2. Install Dependencies
npm install
# OR
yarn install

3. Environment Configuration
Create a .env file in the frontend/ directory with the following content:

# .env file

# API Base URL for your backend
VITE_API_BASE_URL=http://localhost:5000/api

4. Running the Application
npm run dev
# OR
yarn dev

The application should now be running at http://localhost:5173 (or another port if 5173 is in use).

📄 Key Frontend Files & Components
src/main.jsx: The entry point of the React application, where BrowserRouter, AuthProvider, and Bootstrap CSS are initialized.

src/App.jsx: Defines all the application's routes using react-router-dom and wraps pages with the Layout component. It also contains the main authentication redirection logic.

src/context/AuthContext.jsx: Implements the custom authentication logic, handling login, registration, logout, and maintaining user state (including JWT and user role).

src/components/Layout.jsx: Provides the consistent page structure, including the Navbar and Footer.

src/components/Navbar.jsx: The main navigation bar, now implemented using React-Bootstrap components, Link from react-router-dom, and your custom color scheme.

src/components/NavbarCustom.css: (Optional) For any fine-tuning or custom CSS overrides specific to the Navbar beyond Bootstrap's capabilities.

src/components/ProtectedRoute.jsx: A utility component that protects routes based on user authentication status and assigned roles.

src/utils/api.js: Contains utility functions for making API calls to the backend, including handling authentication tokens.

src/pages/LoginPage.jsx: The user login interface, interacting with the custom authentication context.

src/pages/RegisterPage.jsx: The user registration interface, interacting with the custom authentication context.

src/pages/NominatimSearchPage.jsx: A new standalone page demonstrating integration with the OpenStreetMap Nominatim API.

src/pages/*.jsx: Various other page components for different sections of the application (e.g., EventsPage, UserDashboardPage, OrganizerDashboardPage, AdminDashboardPage).

🎨 Styling
The frontend primarily uses React-Bootstrap for its UI components and responsiveness. Some custom CSS (e.g., in NavbarCustom.css) is used for specific stylistic adjustments to match the desired color scheme and gradient backgrounds, overriding Bootstrap defaults where necessary.

💡 Usage
Register a new account from the /register page.

Login with your registered credentials.

Explore the "Location Search" page to see the Nominatim API in action.

Navigate through various dashboards based on your assigned role (roles are currently determined by email during registration/login in the backend: admin@example.com, organizer@example.com get special roles, others default to user).



Community Hub Backend API
This repository contains the backend API for the Community Hub application. It provides RESTful endpoints for user management, event creation, event approval, and other core functionalities, serving data to the frontend application.

🚀 Features
Custom User Authentication: Secure registration and login using JWTs, bcrypt for password hashing.

Role-Based Authorization: Middleware to protect routes based on user roles (user, organizer, admin).

User Management: Endpoints for creating/updating user profiles and fetching current user data.

Event Management:

Publicly accessible endpoints to browse all approved events and view individual event details.

Protected endpoints for organizers/admins to create new events.

Protected endpoints for admins to approve pending events.

PostgreSQL Database: Persistent storage for user, event, and registration data.

CORS Enabled: Configured to allow requests from your frontend application.

🛠️ Technologies Used
Node.js: JavaScript runtime environment.

Express.js: Web application framework for building RESTful APIs.

PostgreSQL: Relational database management system.

pg (node-postgres): PostgreSQL client for Node.js.

dotenv: For loading environment variables from a .env file.

cors: Express middleware for Cross-Origin Resource Sharing.

bcryptjs: For hashing and comparing passwords securely.

jsonwebtoken: For creating and verifying JSON Web Tokens (JWTs) for authentication.

📦 Installation & Setup
Follow these steps to get the backend API up and running on your local machine.

Prerequisites
Node.js (LTS version recommended)

npm or Yarn (package manager)

PostgreSQL database server installed and running.

1. Clone the Repository
(Assuming you have the repository cloned, if not, replace with your actual clone command)

git clone <your-backend-repo-url>
cd community-hub/backend # Navigate into your backend directory

2. Install Dependencies
npm install
# OR
yarn install

3. Database Setup
Ensure you have a PostgreSQL server running.

Create a Database
Open your PostgreSQL client (e.g., psql, pgAdmin, or your preferred tool) and create a new database.

CREATE DATABASE community_hub_db;

Configure Environment Variables
Create a .env file in the root of your backend/ directory with the following content. Replace the placeholder values with your actual PostgreSQL credentials and a strong JWT secret.

# .env file

# PostgreSQL Database Configuration
DB_USER=your_pg_username   # e.g., postgres
DB_HOST=localhost          # or your PostgreSQL host IP if it's on a different machine
DB_DATABASE=community_hub_db # The name of the database you created
DB_PASSWORD=your_pg_password # Your PostgreSQL user's password
DB_PORT=5432               # Default PostgreSQL port

# Custom JWT Authentication Configuration
JWT_SECRET=YOUR_VERY_STRONG_RANDOM_SECRET_KEY # CHANGE THIS! Use a long, random string.
JWT_EXPIRES_IN=1d # Token expiry time (e.g., 1h, 1d, 7d)

Important: The JWT_SECRET should be a long, complex, and random string. Do NOT use easily guessable phrases. You can generate one using an online tool or a command like node -e "console.log(require('crypto').randomBytes(32).toString('hex'))".

Apply Database Schema
Execute the SQL statements from your schema file to create the necessary tables in your community_hub_db database.

File: community-hub-postgresql-schema (from our previous discussion)

-- Table: users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- Stores the hashed password
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users (email);

-- Table: events
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    organizer_id INT NOT NULL,
    capacity INT,
    status TEXT NOT NULL DEFAULT 'pending',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES users (user_id) ON DELETE CASCADE
);
CREATE INDEX idx_events_date ON events (date);
CREATE INDEX idx_events_organizer_id ON events (organizer_id);
CREATE INDEX idx_events_status ON events (status);

-- Table: registrations
CREATE TABLE registrations (
    registration_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'registered',
    UNIQUE (user_id, event_id),
    CONSTRAINT fk_registration_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_registration_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE CASCADE
);
CREATE INDEX idx_registrations_user_id ON registrations (user_id);
CREATE INDEX idx_registrations_event_id ON registrations (event_id);

4. Running the API
node server.js
# OR (if you have nodemon installed for development)
nodemon server.js

The backend API should now be running at http://localhost:5000.

💻 API Endpoints
All API endpoints are prefixed with /api.

Authentication (/api/auth)
POST /api/auth/register

Description: Registers a new user.

Body: { "email": "string", "name": "string", "password": "string", "role": "user" | "organizer" | "admin" (optional, defaults to 'user') }

Response: { "message": "User registered.", "user": {}, "token": "jwt_token" }

Notes: For initial testing, you can register admin@example.com and organizer@example.com to get those roles.

POST /api/auth/login

Description: Logs in a user and returns a JWT.

Body: { "email": "string", "password": "string" }

Response: { "message": "Login successful.", "user": {}, "token": "jwt_token" }

Users (/api/users) - Protected Routes (Requires JWT in Authorization: Bearer <token> header)
GET /api/users/profile

Description: Retrieves the profile of the currently authenticated user.

Access: Authenticated Users, Organizers, Admins.

Response: { "user_id": int, "email": "string", "name": "string", "role": "string", ... }

PUT /api/users/profile

Description: Updates the profile of the currently authenticated user.

Body: { "name": "string" (optional), "email": "string" (optional) }

Access: Authenticated Users, Organizers, Admins.

Response: { "user_id": int, "email": "string", "name": "string", "role": "string" }

Events (/api/events)
GET /api/events

Description: Retrieves a list of all approved public events.

Access: Public.

Response: [{ event_object_1 }, { event_object_2 }, ...]

GET /api/events/:id

Description: Retrieves details for a single event by ID.

Access: Public.

Response: { event_object }

POST /api/events

Description: Creates a new event. The event will initially have a 'pending' status.

Body: { "title": "string", "description": "string", "date": "YYYY-MM-DD", "time": "HH:MM", "location": "string", "capacity": int (optional), "image_url": "string" (optional) }

Access: Authenticated Organizers, Admins.

Response: { new_event_object }

PUT /api/events/:id/approve

Description: Approves a pending event, changing its status to 'approved'.

Access: Authenticated Admins.

Response: { "message": "Event approved!", "event": { approved_event_object } }

Admin-Only Test (/api/admin-only)
GET /api/admin-only

Description: A test endpoint to verify admin role access.

Access: Authenticated Admins.

Response: { "message": "Welcome, admin! DB ID: <user_id>." }

Health Check (/health)
GET /health

Description: Simple endpoint to check if the backend is running.

Access: Public.

Response: Backend is healthy!

📄 Key Backend Files & Structure
server.js: The main entry point of the Express.js application, sets up middleware, connects to the database, and integrates all API routes.

.env: Environment configuration file (crucial for database credentials and JWT secret).

db.js: Centralized PostgreSQL connection pool setup.

middleware/auth.middleware.js: Contains custom JWT authentication and role-based authorization middleware (authenticateToken, authorizeRole).

routes/auth.routes.js: Handles user registration and login functionalities.

routes/users.routes.js: Manages user profile fetching and updating.

routes/events.routes.js: Handles event-related CRUD operations (public read, protected create/approve).
