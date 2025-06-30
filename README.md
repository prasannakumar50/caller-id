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

---



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

## 🧑‍💻 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a pull request





