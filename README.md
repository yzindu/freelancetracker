# Freelancer Project & Income Tracker (FreelancePulse)

A modern full-stack web application designed for freelancers to effortlessly manage clients, track project deliverables and deadlines, monitor payment inflows, and visualize earnings via interactive telemetry and charts.

Built as an **Individual Software Engineering Assignment**.

---

## 🌟 Key Features

### 1. Authentication & Security
- **JWT (JSON Web Tokens):** Secure cookie/Bearer token authentication with automatic expiration handling.
- **Password Encryption:** Salted password hashing with `bcryptjs` (10 rounds).
- **Protected Routes:** Private client-side routing guard (`ProtectedRoute.jsx`) preventing unauthorized access.
- **User Isolation:** All database queries are strictly scoped to the authenticated user (`user: req.user._id`).

### 2. Interactive Analytics Dashboard
- **Executive Stat Cards:**
  - **Active Projects:** Real-time count of active deliverables.
  - **Total Income:** Cumulative sum of verified paid client payments.
  - **Pending Receivables:** Real-time sum of unpaid balances across active projects.
  - **Total Clients:** Total client relationships managed.
- **Visual Data Telemetry:**
  - **Monthly Revenue Bar Chart (Recharts):** 12-month rolling revenue trajectory with gradient cyber-styling.
  - **Project Status Distribution Donut Chart (Recharts):** Breakdown of project lifecycle allocation (`Active`, `Completed`, `Pending`, `On Hold`, `Cancelled`).
- **Recent Activity Feed:** Latest payments received and quick-access project deliverables.

### 3. Client Management
- Create, Read, Update, and Delete (CRUD) client profiles.
- Fields: Name, Company, Email, Phone, and Relationship notes.
- Instant search across client names, companies, and emails.
- Deletion safety guard: prevents deleting clients with active attached projects.

### 4. Projects Management
- Track deliverables with milestones, start dates, and deadlines.
- Real-time progress bars calculating the percentage of fee collected vs. remaining unpaid balance.
- Multi-filtering: filter simultaneously by **Status**, **Client**, and **Project Name**.
- Overdue warning badges for missed deadlines.
- Cascade deletion: deleting a project automatically cleans up linked payment transactions.

### 5. Income & Payment Tracking
- Log payments linked to specific projects with automatic client inheritance.
- Payment methods: Bank Transfer, PayPal, Credit Card, Cash, and Other.
- Financial overview metrics: Total Received, Pending Invoices, and Filtered Volume.
- Multi-filter toolbar: filter by Payment Status (`Paid` vs `Pending`), Client, Project, and Date ranges (`From` and `To`).

---

## 📸 Screenshots

### 1. Dashboard & Telemetry
![Dashboard Overview](screenshots/dashboard.png)

### 2. Login & Authentication
![Login Page](screenshots/login.png)

### 3. Clients Management
![Clients Directory](screenshots/clients.png)

### 4. Projects & Progress Tracking
![Projects Management](screenshots/projects.png)

### 5. Income & Payments Tracking
![Payments Tracking](screenshots/payments.png)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 (Vite), React Router DOM, Recharts, React Icons, React Hot Toast, Vanilla CSS (Design Tokens) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose ODM (MongoDB Atlas Cloud Cluster) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Validation** | `express-validator` (backend), Custom Validator Utilities (frontend) |
| **Logging & CORS** | `morgan`, `cors`, `dotenv` |

---

## 🚀 Getting Started & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- A MongoDB database (MongoDB Atlas connection URI or local MongoDB instance)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/yzindu/freelancetracker.git
cd freelancetracker
```

---

### Step 2: Configure the Backend (`server`)

1. Open a terminal in the `server` directory:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in `server/` (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Update `server/.env` with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/freelancetracker?retryWrites=true&w=majority
   JWT_SECRET=supersecret_jwt_key_freelancer_tracker_2026_change_in_production
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

---

### Step 3: Populate Database with Seed Data (Recommended)
To immediately populate your MongoDB database with demo users, clients, projects, and 12 months of payments:
```bash
npm run seed
```
> **Default Demo Login:**  
> - **Email:** `alex@freelancer.io`  
> - **Password:** `password123`  
> *(You can also click the "Fill Demo Credentials" button on the login screen).*

---

### Step 4: Configure the Frontend (`client`)

1. Open a second terminal in the `client` directory:
   ```bash
   cd ../client
   npm install
   ```

2. Ensure `client/.env` has the backend URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

### Step 5: Run the Full Application

#### Start Backend:
In `server/`:
```bash
npm run dev
```
*(Server runs on `http://localhost:5000`)*

#### Start Frontend:
In `client/`:
```bash
npm run dev
```
*(Client runs on `http://localhost:5173`)*

Open your browser and navigate to **`http://localhost:5173`**.

---

## 📡 Backend API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |

### Clients (`/api/clients`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/clients` | Private | List clients (supports `?search=`, `?page=`, `?all=`) |
| `GET` | `/api/clients/:id` | Private | Retrieve single client by ID |
| `POST` | `/api/clients` | Private | Create new client |
| `PUT` | `/api/clients/:id` | Private | Update client information |
| `DELETE` | `/api/clients/:id` | Private | Delete client (blocked if active projects exist) |

### Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Private | List projects with filters (`?status=`, `?client=`, `?search=`) |
| `GET` | `/api/projects/:id` | Private | Retrieve single project with payment calculation |
| `POST` | `/api/projects` | Private | Create new project |
| `PUT` | `/api/projects/:id` | Private | Update project details |
| `DELETE` | `/api/projects/:id` | Private | Delete project and cascade-delete linked payments |

### Payments & Income (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/payments` | Private | List payments with filters (`?status=`, `?client=`, `?from=`, `?to=`) |
| `GET` | `/api/payments/:id` | Private | Retrieve single payment record |
| `POST` | `/api/payments` | Private | Log new payment / invoice |
| `PUT` | `/api/payments/:id` | Private | Update payment record |
| `DELETE` | `/api/payments/:id` | Private | Delete payment record |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Private | Aggregated stats, 12-month income, & status breakdown |

---

## 📁 Repository Directory Structure

```text
freelancetracker/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios instance & token interceptors
│   │   ├── components/         # Reusable UI library (Modal, Table, StatCard, etc.)
│   │   ├── context/            # Authentication State Context
│   │   ├── pages/              # Application views (Dashboard, Clients, Projects, Payments, Auth)
│   │   ├── utils/              # Formatting & validation helper functions
│   │   ├── App.jsx             # Main routing configuration
│   │   ├── index.css           # Design tokens & responsive styles
│   │   └── main.jsx            # Application root
│   ├── .env                    # Frontend environment variables
│   └── package.json
│
├── server/                     # Backend Node.js / Express REST API
│   ├── config/                 # MongoDB Mongoose database connection
│   ├── controllers/            # Route business logic (auth, clients, projects, payments, dashboard)
│   ├── middleware/             # JWT auth guard, error handler, validation
│   ├── models/                 # Mongoose schemas (User, Client, Project, Payment)
│   ├── routes/                 # Express route definitions
│   ├── utils/                  # ApiError & asyncHandler helpers
│   ├── .env                    # Backend environment secrets
│   ├── package.json
│   ├── seed.js                 # Database seeder script
│   └── server.js               # Express entry point
│
├── screenshots/                # Application feature demonstration images
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation & instructions
```

---

## 👤 Author
- **Name:** Yasindu Rivipiyum
- **Repository:** [https://github.com/yzindu/freelancetracker](https://github.com/yzindu/freelancetracker)
