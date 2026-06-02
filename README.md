# Store Rating & Reviews Portal

A modern, full-stack, role-based store rating and reviews web application built with **Express.js**, **React.js**, and **Sequelize (PostgreSQL / SQLite)**. 

This platform implements a single login portal that dynamically routes users to customized dashboards based on their roles: **System Administrator**, **Normal User (Customer)**, and **Store Owner**.

---

## 🚀 Tech Stack

- **Backend:** Express.js (Node.js)
- **Database:** SQLite (configured for local zero-config runs) / PostgreSQL & MySQL ready.
- **ORM:** Sequelize (manages schemas, relationships, and automatic tables synchronization).
- **Frontend:** React.js (Scaffolded using Vite, styled with responsive glassmorphic Vanilla CSS).
- **Icons:** Lucide React

---

## 🔑 Pre-Seeded Test Credentials

On the first start, the backend automatically seeds default accounts to make testing immediate and seamless:

| Role | Email Address | Password | Functionality |
| :--- | :--- | :--- | :--- |
| 🛡️ **System Admin** | `admin@ratingportal.com` | `AdminPassword123!` | Manages stores, users, and admin accounts. Dashboard metrics overview. |
| 🏬 **Store Owner** | `owner@groceryhub.com` | `OwnerPassword123!` | Tracks their store's average ratings and views reviewer logs. |
| 👤 **Normal User** | `customer1@gmail.com` | `UserPassword123!` | Customers can view stores, search by location/name, and submit reviews. |
| 👤 **Normal User** | `customer2@gmail.com` | `UserPassword123!` | Additional customer account for testing multiple reviews. |

---

## 📝 Key Features

### 🛡️ 1. System Administrator
- **Dashboard Metrics:** Real-time counters showing Total Users, Total Registered Stores, and Total Submitted Ratings.
- **Account Creation Modals:** Add new Normal Users, Admin Users, and Stores (creating stores automatically sets up a linked Owner account).
- **Advanced Lists & Filters:** Search and filter users or stores by Name, Email, Address, and Role.
- **Interactive Details Modals:** Instantly view user metadata (includes store rating parameters if the user is a Store Owner).

### 👤 2. Normal User (Customer)
- **Register & Log In:** Signup page verifying Name, Email, Address, and Password credentials.
- **Store Explorer:** Live search grid enabling customers to find business outlets by Name and Address.
- **Reviews & Star Selector:** 1-5 star interactive visual component to instantly submit or modify their rating for any individual store.
- **Security panel:** Section to change their login password.

### 🏬 3. Store Owner
- **Average Rating Display:** Large dashboard gauge showing the store's overall rating score.
- **Feedback Table:** A sortable list showing the names, emails, addresses, and ratings of all users who have reviewed their store.
- **Security panel:** Section to change their login password.

---

## 🔒 Strict Form Validations
Both Frontend and Backend APIs strictly enforce:
- **Name (User/Store):** Between `20` and `60` characters.
- **Address:** Maximum `400` characters.
- **Password:** Between `8` and `16` characters, requiring at least one uppercase letter and one special character (e.g. `@`, `$`, `!`).
- **Email:** Standard syntax format checker.

---

## ⚙️ Installation & Local Run Guide

### Prerequisities
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Database Configuration
By default, the project runs on **SQLite** for instant execution without database setup (it creates a local `database.sqlite` file in the backend directory). 

If you prefer to run on **PostgreSQL** or **MySQL**:
1. Open the configuration file: `backend/.env`
2. Update `DB_DIALECT=postgres` (or `mysql`) and populate database connection variables.
3. If using MySQL, run `npm install mysql2` in the `backend/` folder.

### 2. Startup Backend
```bash
cd backend
npm install
npm start
```
The server will run on **http://localhost:5000**. On startup, tables will sync and seed.

### 3. Startup Frontend
```bash
cd frontend
npm install
npm run dev
```
The developer page will load at **http://localhost:5173/**. Open this address in your web browser.

---

## 📊 Database Schema Layout

```
[User] (1) ─── owns ─── (0..1) [Store]
  │                              │
(submits)                     (receives)
  │                              │
  └── (1) ─── [Rating] ─── (N) ──┘
```

- **User Table:** Contains id (UUID), name, email, password_hash, address, and role.
- **Store Table:** Contains id (UUID), name, email, address, and owner_id (linking to User).
- **Rating Table:** Contains id, user_id, store_id, and rating (1 to 5). *Enforces composite unique constraint on (user_id, store_id).*
