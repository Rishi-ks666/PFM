# FinDash — Setup & Running Guide

## Prerequisites

### 1. Install MongoDB Community Server
MongoDB is required for the backend. Choose one option:

#### Option A: Local MongoDB (Recommended for dev)
Download and install from: https://www.mongodb.com/try/download/community

After installing, MongoDB runs automatically as a Windows Service. Verify with:
```powershell
Get-Service -Name "MongoDB"
```

Or start manually:
```powershell
& "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "e:\intern\PFM-main\server\data\db"
```
*(Create the `data\db` folder first)*

#### Option B: MongoDB Atlas (Cloud — no local install needed)
1. Sign up free at https://cloud.mongodb.com
2. Create a free M0 cluster
3. Get your connection string: `mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/findash`
4. Update `server/.env`:
   ```
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/findash
   ```

---

## Running the App

### Terminal 1 — Backend (Port 3000)
```powershell
cd e:\intern\PFM-main\server
npm start
```

Expected output:
```
FinDash server running on port 3000
✅ MongoDB connected: localhost
```

### Terminal 2 — Frontend (Port 5173)
```powershell
cd e:\intern\PFM-main
npm run dev
```

Then open: **http://localhost:5173**

---

## First-time Usage

1. Go to **http://localhost:5173/register**
2. Create an account (name, email, password ≥ 6 chars)
3. You'll be redirected to the dashboard
4. Add accounts, transactions, and budgets — all saved to MongoDB

---

## Environment Variables (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/findash` |
| `JWT_SECRET` | Secret for signing tokens | *(change in production!)* |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `ENCRYPTION_KEY` | 64-char hex key for Plaid token encryption | *(change in production!)* |
| `PLAID_CLIENT_ID` | From https://dashboard.plaid.com | *(required for bank linking)* |
| `PLAID_SECRET` | From Plaid dashboard | *(required for bank linking)* |
| `PLAID_ENV` | `sandbox` / `development` / `production` | `sandbox` |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get current user |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/accounts` | ✅ | List accounts |
| POST | `/api/accounts` | ✅ | Create account |
| PUT | `/api/accounts/:id` | ✅ | Update account |
| DELETE | `/api/accounts/:id` | ✅ | Delete account |
| GET | `/api/transactions` | ✅ | List (filtered, paginated) |
| POST | `/api/transactions` | ✅ | Create transaction |
| PUT | `/api/transactions/:id` | ✅ | Update transaction |
| DELETE | `/api/transactions/:id` | ✅ | Delete transaction |
| GET | `/api/budgets` | ✅ | List budgets with spent |
| GET | `/api/budgets/overview` | ✅ | Budget summary |
| POST | `/api/budgets` | ✅ | Create budget |
| PUT | `/api/budgets/:id` | ✅ | Update budget |
| DELETE | `/api/budgets/:id` | ✅ | Delete budget |
| POST | `/api/plaid/create-link-token` | ✅ | Start Plaid Link flow |
| POST | `/api/plaid/exchange-token` | ✅ | Connect bank account |
| POST | `/api/plaid/sync-transactions` | ✅ | Sync bank transactions |
| GET | `/api/plaid/institutions` | ✅ | List linked banks |
| DELETE | `/api/plaid/institution/:itemId` | ✅ | Unlink bank |
| GET | `/api/health` | ❌ | Health check |
