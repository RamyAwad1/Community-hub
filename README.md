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