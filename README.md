CineVault is a full-stack movie discovery and review platform built for film enthusiasts. Users can explore movies, manage their watchlists, track their viewing history, write reviews, and create custom movie collections.
The platform also includes personalized recommendations based on viewing habits and ratings, a Movie DNA page to help users understand their film preferences, and community features for discovering other movie fans and their collections.

Features
1. Movie Discovery
Browse movies by genre, release year, and minimum rating.
Search for movies and sort results by trending, rating, release date, or title.
View movie details, including the synopsis, release year, runtime, director, cast, genres, and community ratings.
Read reviews written by other users.
2. Watchlist and Watch History
Add movies to your watchlist and remove them when needed.
Keep track of movies you have already watched.
Record when a movie was watched.
3. Ratings and Reviews
Rate movies on a five-star scale.
Write reviews and share your thoughts on films.
Browse reviews from other users and visit their profiles.
4. Movie Collections
Create custom collections around your favorite genres, directors, themes, or movies.
Set collections as public or private.
Browse collections created by other users.
Add movies to existing collections through a collection selection modal.
5. Movie DNA and Recommendations
View a breakdown of your movie preferences based on genres, ratings, and watch history.
Explore personalized recommendations based on your viewing activity.
Discover movies that match your interests and rating patterns.
6. Community and Profiles
Browse other users' reviews, public collections, and favorite movies.
View public profiles and their movie activity.
Discover films through the interests and recommendations of other users.
7. Authentication and Admin Dashboard
Register and log in using a JWT-based authentication system.
Secure passwords with bcryptjs.
Maintain user sessions across application requests.
Use role-based access control to restrict administrative features.
Manage movies, reviews, collections, and platform statistics through the admin dashboard.
Tech Stack
Frontend
React 19 – UI development
Vite – Development server and build tool
Bootstrap 5 – Layout and styling
Bootstrap Icons – Interface icons
Axios – API requests
React Context API – Shared application and authentication state
Backend
Node.js – JavaScript runtime
Express.js – REST API
MySQL – Relational database
mysql2 – MySQL connection pooling
jsonwebtoken – JWT authentication
bcryptjs – Password hashing
dotenv – Environment configuration
cors – Cross-origin request handling


Project Structure
CineVault/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── schema.sql
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── collectionController.js
│   │   ├── movieController.js
│   │   ├── ratingController.js
│   │   ├── recommendationController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   ├── watchHistoryController.js
│   │   └── watchlistController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── collectionRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── userRoutes.js
│   │   ├── watchHistoryRoutes.js
│   │   └── watchlistRoutes.js
│   │
│   ├── scripts/
│   │   └── initDb.js
│   │
│   └── services/
│       └── recommendationService.js
│
└── frontend/
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    │
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── index.css
        │
        ├── assets/
        │
        ├── components/
        │   ├── AddToCollectionModal.jsx
        │   ├── ApiStatusBadge.jsx
        │   ├── CollectionCard.jsx
        │   ├── EmptyState.jsx
        │   ├── Footer.jsx
        │   ├── HeroSection.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── MovieCard.jsx
        │   ├── MovieGrid.jsx
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── RatingStars.jsx
        │   ├── ReviewCard.jsx
        │   └── ReviewForm.jsx
        │
        ├── context/
        │   ├── AppContext.jsx
        │   └── AuthContext.jsx
        │
        ├── pages/
        │   ├── AdminDashboardPage.jsx
        │   ├── CollectionDetailsPage.jsx
        │   ├── CommunityPage.jsx
        │   ├── DiscoverPage.jsx
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── MovieDNAPage.jsx
        │   ├── MovieDetailsPage.jsx
        │   ├── MyCollectionsPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── RecommendationsPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── UserProfilePage.jsx
        │   ├── WatchHistoryPage.jsx
        │   └── WatchlistPage.jsx
        │
        └── services/
            └── api.js

Getting Started
Prerequisites
Make sure you have the following installed:

Node.js v18 or later
MySQL
npm (included with Node.js)
1. Set Up the Backend

Open a terminal and navigate to the backend directory:
cd backend
npm install
Create a .env file using the provided example:

Windows:
copy .env.example .env


Linux/macOS:
cp .env.example .env

Update the .env file with your local database credentials and JWT configuration:

PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cinevault
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d


Replace the example values with your actual credentials. Use a strong, private value for JWT_SECRET.
Initialize the database:
npm run db:init

Start the backend server:
npm run dev

The backend should now be available at http://localhost:5000.

2. Set Up the Frontend
Open another terminal and navigate to the frontend directory:

cd frontend
npm install
npm run dev

Vite will display the local development URL in the terminal. By default, it is:
http://localhost:5173

Open the URL in your browser to use CineVault.

License
CineVault is intended for educational and portfolio use. You are welcome to explore the code, use it as a learning resource, and customize it for your own projects.
