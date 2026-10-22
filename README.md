# CineVault

> **CineVault** is a modern full-stack web application for personalized film discovery, curation, and cinephile community engagement. It allows movie enthusiasts to search and filter films, track watchlists and viewing history, submit star ratings and detailed reviews, curate custom movie collections, analyze their individual "Movie DNA" taste profile, and receive content-based recommendations.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
- [Running the Project](#-running-the-project)
- [Usage & Key Workflows](#-usage--key-workflows)
- [Configuration and Environment Variables](#-configuration-and-environment-variables)
- [Testing & Quality Checks](#-testing--quality-checks)
- [Build and Deployment](#-build-and-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## Features

- **Movie Discovery & Filtering**: Search and filter the movie catalog by title, genre, language, release year, minimum rating, and sort order (rating, release date, title).
- **Film Profiles & Detailed Metadata**: Comprehensive movie details featuring synopsis, runtime, release year, language, director, cast members, user reviews, and aggregate community ratings.
- **Watchlist & Viewing History**: Bookmark films you intend to watch and log watched films with timestamped history records.
- **Ratings & Reviews**: Rate movies on a 1–5 star scale (stored with 0.5 step precision) and write, edit, or delete markdown/text reviews.
- **Custom Curated Collections**: Create public or private movie lists with custom titles and descriptions, and add or remove movies via modal dialogs.
- **Movie DNA Analytical Taste Profile**: Visual breakdown of your viewing habits based on genre distributions, rating patterns, total logged runtime, and average ratings.
- **Intelligent Recommendations**: Algorithmic movie recommendations tailored to your watch history, highest-rated genres, and directors.
- **Community & Social Profiles**: Discover other cinephiles, explore community collections and recent reviews, inspect public user profiles, and follow or unfollow other members.
- **Authentication & Role-Based Access Control**: Secure JSON Web Token (JWT) session management with `bcryptjs` password hashing, registration, login, and protected routes.
- **Admin Management Suite**: Dedicated administrative dashboard to view platform statistics, create, edit, or delete movies, moderate community reviews, and manage user roles.

---

## 🛠️ Tech Stack

### Frontend
- **React (v19.2.8)**: Modern component-based user interface library.
- **Vite (v8.3.0)**: Fast frontend build tool and local development server.
- **Bootstrap (v5.3.8) & Bootstrap Icons (v1.13.1)**: Responsive layout system, modal utilities, and icon set.
- **Axios (v1.20.0)**: HTTP client configured with request interceptors for automatic JWT header injection.
- **React Context API**: Client-side state management for user authentication (`AuthContext`) and global app state (`AppContext`).
- **Oxlint (v1.81.0)**: High-performance JavaScript/JSX linter.

### Backend
- **Node.js**: Server-side JavaScript runtime environment.
- **Express (v4.21.2)**: REST API framework structuring routing and controller middleware.
- **MySQL & mysql2 (v3.12.0)**: Relational database with promise-based connection pooling.
- **jsonwebtoken (v9.0.3)**: Stateless JWT generation and verification middleware.
- **bcryptjs (v3.0.3)**: Salt generation and password hashing.
- **dotenv (v16.4.7)**: Environment variable loader for backend runtime configuration.
- **cors (v2.8.5)**: Cross-Origin Resource Sharing middleware enabling secure frontend-backend communication.

---

## Directory Structure

```plaintext
CineVault/
├── .gitignore                         # Repository-wide Git ignore rules
├── README.md                          # Project documentation
│
├── backend/                           # Express REST API backend
│   ├── .env                           # Local environment configuration (ignored by git)
│   ├── .env.example                   # Template environment configuration file
│   ├── .gitignore                     # Backend-specific ignore rules
│   ├── package.json                   # Backend dependencies and npm scripts
│   ├── package-lock.json              # Backend dependency lockfile
│   ├── server.js                      # Express application entrypoint and route declarations
│   ├── config/
│   │   ├── db.js                      # MySQL connection pool and connection diagnostics
│   │   └── schema.sql                 # Database table definitions and sample seed data
│   ├── controllers/                   # Controller layer handling request logic
│   │   ├── adminController.js         # Administration analytics, movie, user, and review CRUD
│   │   ├── authController.js          # Registration, login, and current user session
│   │   ├── collectionController.js    # Collection creation, updating, and movie item management
│   │   ├── healthController.js        # Health check and database ping response
│   │   ├── movieController.js         # Movie catalog querying, genres, and movie details
│   │   ├── ratingController.js        # Movie rating creation, update, and retrieval
│   │   ├── recommendationController.js# Algorithmic recommendations and Movie DNA data
│   │   ├── reviewController.js        # User review submission, updating, and deletion
│   │   ├── userController.js          # User profile inspection, followers, and community feed
│   │   ├── watchHistoryController.js  # Viewing history logging and removal
│   │   └── watchlistController.js     # User watchlist toggling and retrieval
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT authentication and admin authorization guards
│   │   └── errorHandler.js            # Centralized API error handling middleware
│   ├── routes/                        # Express API route handlers
│   │   ├── adminRoutes.js             # Routes under /api/admin/*
│   │   ├── authRoutes.js              # Routes under /api/auth/*
│   │   ├── collectionRoutes.js        # Routes under /api/collections/*
│   │   ├── healthRoutes.js            # Route for /api/health
│   │   ├── movieRoutes.js             # Routes for /api/movies, /api/genres, /api/languages
│   │   ├── ratingRoutes.js            # Routes for /api/movies/:id/rating
│   │   ├── recommendationRoutes.js    # Routes for /api/recommendations and /api/recommendations/dna
│   │   ├── reviewRoutes.js            # Routes for /api/movies/:id/reviews and /api/reviews/:id
│   │   ├── userRoutes.js              # Routes for /api/users/* and /api/community/*
│   │   ├── watchHistoryRoutes.js      # Routes for /api/watch-history/*
│   │   └── watchlistRoutes.js         # Routes for /api/watchlist/*
│   ├── scripts/
│   │   └── initDb.js                  # CLI script to execute schema.sql against MySQL
│   └── services/
│       └── recommendationService.js   # Taste profiling (Movie DNA) and recommendation heuristics
│
└── frontend/                          # React + Vite client application
    ├── .gitignore                     # Frontend-specific ignore rules
    ├── .oxlintrc.json                 # Oxlint linter configuration
    ├── index.html                     # HTML application host template
    ├── package.json                   # Frontend dependencies and npm scripts
    ├── package-lock.json              # Frontend dependency lockfile
    ├── README.md                      # Default Vite boilerplate README
    ├── vite.config.js                 # Vite bundler and plugin configuration
    ├── public/                        # Static assets served as-is
    │   ├── favicon.svg                # Application browser icon
    │   └── icons.svg                  # Vector SVG sprite definitions
    └── src/
        ├── App.css                    # Component-specific styles and transitions
        ├── App.jsx                    # Root application component with hash router navigation
        ├── index.css                  # Global design tokens, dark theme styles, and utilities
        ├── main.jsx                   # React DOM root render entrypoint
        ├── assets/                    # Graphic assets (hero graphics, badges)
        ├── components/                # Reusable UI presentation and control components
        │   ├── AddToCollectionModal.jsx # Modal to save a film to a custom collection
        │   ├── ApiStatusBadge.jsx     # Live backend connectivity monitor badge
        │   ├── CollectionCard.jsx     # Card rendering curated collection summaries
        │   ├── EmptyState.jsx         # Fallback display for empty data lists
        │   ├── Footer.jsx             # Application footer
        │   ├── HeroSection.jsx        # Landing hero banner with call-to-actions
        │   ├── LoadingSpinner.jsx     # Centered loading animation indicator
        │   ├── MovieCard.jsx          # Movie thumbnail, rating badge, and action triggers
        │   ├── MovieGrid.jsx          # Responsive CSS grid container for movie cards
        │   ├── Navbar.jsx             # Top navigation bar with active route highlighting
        │   ├── ProtectedRoute.jsx     # Auth state guard wrapper for private views
        │   ├── RatingStars.jsx        # Interactive and display star rating component
        │   ├── ReviewCard.jsx         # User review display card with edit/delete triggers
        │   └── ReviewForm.jsx         # Input form to submit or update a review
        ├── context/                   # React Context state providers
        │   ├── AppContext.jsx         # Global context for watchlist state and search terms
        │   └── AuthContext.jsx        # Authentication state, login/logout, and user token
        ├── pages/                     # Full-page route views
        │   ├── AdminDashboardPage.jsx # Platform admin metrics and content moderation
        │   ├── CollectionDetailsPage.jsx # Single collection details and included movies
        │   ├── CommunityPage.jsx      # Social feed, cinephile directory, and collections
        │   ├── DiscoverPage.jsx       # Search, filter, and sortable movie catalog
        │   ├── LandingPage.jsx        # Welcome landing view with featured sections
        │   ├── LoginPage.jsx          # User sign-in form
        │   ├── MovieDNAPage.jsx       # Film taste analytics and genre breakdown graphs
        │   ├── MovieDetailsPage.jsx   # Movie overview, cast, director, and reviews
        │   ├── MyCollectionsPage.jsx  # Personal collection management view
        │   ├── ProfilePage.jsx        # User account details and activity summary
        │   ├── RecommendationsPage.jsx# Personalized film recommendation lists
        │   ├── RegisterPage.jsx       # User registration form
        │   ├── UserProfilePage.jsx    # Public view of another user's activity
        │   ├── WatchHistoryPage.jsx   # List of watched movies with removal controls
        │   └── WatchlistPage.jsx      # Bookmarked movies list with quick actions
        └── services/
            └── api.js                 # Axios API service module for all backend endpoints
```

---

## Prerequisites

Before setting up CineVault locally, ensure you have the following installed:

- **Node.js**: `v18.0.0` or higher (Node.js 20+ recommended for built-in `--watch` support)
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- **MySQL Server**: `v8.0` or higher (running locally or accessible remotely via TLS)
- **Git**: For source version control

---

## Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/manavvala-16/fsdproject.git CineVault
cd CineVault
```

### 2. Configure Backend
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Copy the environment template file:
- **Windows (Command Prompt / PowerShell)**:
  ```powershell
  copy .env.example .env
  ```
- **macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

Open `backend/.env` and configure your local MySQL credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=cinevault
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

Initialize the database schema and load seed data:
```bash
npm run db:init
```
*(This creates the `cinevault` database, runs all table creation scripts, and populates initial sample movies, genres, actors, directors, and users).*

### 3. Configure Frontend
Open a new terminal session, navigate to the `frontend` folder, and install dependencies:
```bash
cd frontend
npm install
```

*(Optional)* If your backend is running on a port other than `5000`, create a `frontend/.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Running the Project

Run both backend and frontend servers concurrently using two terminal windows:

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
- Development command: `npm run dev` (uses Node's native `--watch` flag for hot reloads).
- Production command: `npm start` (runs `node server.js`).
- Default Backend URL: [http://localhost:5000](http://localhost:5000)
- Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Terminal 2: Frontend Client
```bash
cd frontend
npm run dev
```
- Development command: `npm run dev` (starts Vite dev server with HMR).
- Default Frontend URL: [http://localhost:5173](http://localhost:5173)

---

## Usage & Key Workflows

1. **Explore the Catalog**: Navigate to `#/discover` to filter films by genre, year, language, or search query.
2. **Create an Account**: Visit `#/register` to register a new account, or log in via `#/login` using the sample credentials seeded during initialization:
   - **Sample User**: `john@example.com`
   - **Sample Admin**: `admin@cinevault.com`
3. **Track Movies**: Open any movie page (`#/movies/:id`) to add the film to your Watchlist or mark it as watched.
4. **Rate and Review**: Rate films on a 1–5 star scale and write reviews. Your ratings will feed into the recommendations algorithm.
5. **Analyze Movie DNA**: Visit `#/dna` after logging several watched titles to view an analytical breakdown of your preferred genres and viewing statistics.
6. **Curate Collections**: Go to `#/collections` to build themed public or private collections.
7. **Admin Operations**: Log in with an admin account and open `#/admin` to manage catalog entries, monitor user roles, and moderate user reviews.

---

## Configuration and Environment Variables

### Backend Configuration (`backend/.env`)

The backend requires environment variables defined in `backend/.env`. A template is provided in `backend/.env.example`:

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | Port for the Express REST API server |
| `NODE_ENV` | No | `development` | Runtime environment (`development` or `production`) |
| `DB_HOST` | **Yes** | `localhost` | Hostname or IP of the MySQL server |
| `DB_USER` | **Yes** | `root` | MySQL user account |
| `DB_PASSWORD` | **Yes** | `""` | Password for the MySQL user |
| `DB_NAME` | **Yes** | `cinevault` | Name of the database schema |
| `DB_PORT` | No | `3306` | MySQL server port |
| `DB_SSL_CA` | No | *None* | CA certificate PEM string for TLS connection to hosted MySQL |
| `JWT_SECRET` | **Yes** | *None* | Secret key used to sign and verify JSON Web Tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry duration (e.g. `7d`, `24h`) |

### Frontend Configuration (`frontend/.env`, optional)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Base URL pointing to the running backend API |

---

## Testing & Quality Checks

- **Automated Tests**: No unit or integration test suite (e.g. Jest, Vitest, Mocha) is currently implemented in this repository.
- **Frontend Code Linting**: Fast static code analysis is configured using Oxlint.
  ```bash
  cd frontend
  npm run lint
  ```
- **API Health Check**: You can verify backend availability and database connectivity by querying the `/api/health` endpoint:
  ```bash
  curl http://localhost:5000/api/health
  ```
  A successful response returns `{"status":"ok","database":{"connected":true,...}}`.

---

## Build and Deployment

### Frontend Production Build
To create an optimized production build of the React client:
```bash
cd frontend
npm run build
```
This generates production-ready static assets in the `frontend/dist/` directory.

To locally preview the production build:
```bash
cd frontend
npm run preview
```

### Backend Production Execution
Ensure production environment variables are configured in `backend/.env`:
```env
NODE_ENV=production
```
Start the production server:
```bash
cd backend
npm start
```

---

## 🔧 Troubleshooting

- **Database Connection Refused (`ECONNREFUSED 127.0.0.1:3306`)**:
  - Verify that your MySQL server is running (`systemctl status mysql` on Linux or check MySQL service in Windows Services).
  - Verify the credentials in `backend/.env` match your MySQL setup.
  - Run `npm run db:init` in `backend/` to create the schema and verify connectivity.
- **Access Denied for User (`ER_ACCESS_DENIED_ERROR`)**:
  - Double check your `DB_USER` and `DB_PASSWORD` in `backend/.env`.
- **API Status Badge Shows "Disconnected" in Frontend**:
  - Ensure the backend server is running on `http://localhost:5000`.
  - If using a custom port, ensure `VITE_API_BASE_URL` is configured in `frontend/.env` and restart Vite (`npm run dev`).
  - Check browser console and network tab to ensure CORS requests are not blocked.
- **Node Watch Flag Warning**:
  - `npm run dev` in the backend uses `node --watch server.js`, which requires Node.js `v18.11.0` or later. If using an older version, run `npm start` instead or upgrade Node.js.

---

## Contributing

Contributions to CineVault are welcome! To contribute:

1. Fork the repository.
2. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with concise commit messages:
   ```bash
   git commit -m "Add feature description"
   ```
4. Run the linter to ensure code quality:
   ```bash
   cd frontend && npm run lint
   ```
5. Push to your branch and submit a Pull Request.

---

## License

No license has been specified for this project. All rights are reserved by the original author unless otherwise stated.
