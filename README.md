# 📞 CodeSoar Caller ID & Spam Detection

A full-stack application for caller identification, contact management, and spam detection.  
Built with **React** (frontend) and **Node.js/Express** (backend), using **Sequelize** ORM and SQLite/PostgreSQL.

---

## 🚀 Features

- User registration and authentication (JWT)
- Add, update, and delete contacts
- Search for people by name or phone number
- Spam number reporting and statistics
- Modern React UI with Material-UI
- RESTful API with secure endpoints


## 🛠️ Getting Started

### 1. **Clone the repository**
```bash
git clone https://github.com/prasannakumar50/caller-id.git
cd caller-id
```

### 2. **Install dependencies**
```bash
npm install
cd client && npm install
cd ..
```

### 3. **Environment Variables**

- Copy `.env.example` to `.env` and fill in your secrets (JWT, DB, etc).

### 4. **Database Setup**

- For SQLite (default): No setup needed.
- For PostgreSQL: Update your `.env` and run:
  ```bash
  npm run db:migrate
  npm run db:seed
  ```

### 5. **Run Locally**

- **Backend:**  
  ```bash
  npm run server
  ```
- **Frontend:**  
  ```bash
  cd client
  npm start
  ```

- Or run both with:
  ```bash
  npm run dev
  ```

### Main UI Sections
### Navbar:
-Persistent at the top, with navigation links for Dashboard, Search, Contacts, Spam Report, and user profile/logout.
-Shows login/register buttons for unauthenticated users.
### Dashboard:
-Personalized welcome for the logged-in user.
-Quick action buttons for searching numbers, managing contacts, reporting spam, and viewing your profile.
### Search:
-Search for people by name or phone number.
-Results show name, phone number, email (if available), spam likelihood, and registration status.
-Tabs allow switching between name and phone search.
### Contacts:
-View, add, and delete contacts.
-Each contact displays name, phone, email, spam likelihood, and registration status.
-Add contacts via a dialog form; delete with a single click.
### Spam Report:
-Report spam numbers with reason and optional description.
-View trending spam numbers, including report count, spam likelihood, and risk level.
### Profile:
-View and update your user profile.
-Change password and manage account details.
### Authentication:
-Register and login with phone number and password.
-JWT-based authentication; protected routes for logged-in users.
### Tech Stack
-React  with functional components and hooks
-Material-UI (MUI) for a modern, accessible UI
-Axios for API requests
-React Router for client-side routing
-Context API for authentication state
### User Flow
-Register or Login to access the app.
-Use the Dashboard for quick navigation.
-Search for people or numbers to check spam status or find contacts.
-Add contacts to your personal list.
-Report spam numbers and help the community.
-View and update your profile at any time.

---

## 🌐 Deployment (Vercel)

### **Frontend Only (Recommended for Vercel)**

1. **Delete `vercel.json`** from the root (already done).
2. In the Vercel dashboard:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. Redeploy.

### **Backend**
- Deploy separately (e.g., Render, Railway, or as a Vercel API project).
- Update frontend API URLs to point to the backend deployment.

---

## 📚 API Endpoints

### **Auth**
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user profile

### **Contacts**
- `GET /api/contacts` — List all contacts
- `POST /api/contacts` — Add a new contact
- `GET /api/contacts/:id` — Get a specific contact
- `PUT /api/contacts/:id` — Update a contact
- `DELETE /api/contacts/:id` — Delete a contact

### **Search**
- `GET /api/search?q=query&type=name|phone` — Search by name or phone
- `GET /api/search/details/:phoneNumber` — Get detailed info about a phone number

### **Spam**
- `POST /api/spam/report` — Report a spam number
- `GET /api/spam/stats/:phoneNumber` — Get spam statistics
- `GET /api/spam/check/:phoneNumber` — Check if a number is spam
- `GET /api/spam/trending` — Get trending spam numbers

---






