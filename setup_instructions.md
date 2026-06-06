# VendorBridge Setup Instructions

Follow these step-by-step instructions to configure **Supabase** (Database) and **Firebase** (Authentication) for the VendorBridge B2B Procurement platform.

---

## 💾 1. Supabase Configuration (Database & Tables)

Supabase serves as the relational PostgreSQL database for storing profile metadata, vendors, RFQs, quotations, approvals, purchase orders, invoices, and activity logs.

### Steps:
1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com) and sign in.
   - Click **New Project** and select/create an organization.
   - Give the project a name (e.g., `VendorBridge`), set a strong database password, select your region, and click **Create New Project**.

2. **Run the Database Schema**:
   - Wait for the project database to spin up (takes about 1-2 minutes).
   - In the left sidebar, click on **SQL Editor**.
   - Click **New Query**.
   - Open the file [supabase_schema.sql](file:///d:/Vendor/supabase_schema.sql) in this repository.
   - Copy the entire SQL contents of `supabase_schema.sql` and paste it into the Supabase SQL editor.
   - Click **Run** in the top right.
   - Verify that it outputs "Success. No rows returned." or shows the seeded vendors. This script:
     - Enables the UUID extension.
     - Creates all 10 tables with primary/foreign keys.
     - Enables Row-Level Security (RLS) on the `profiles` table.
     - Adds a database trigger to auto-create user profiles upon signup.
     - Seeds initial test vendors.

3. **Get API Keys & URLs**:
   - In the left sidebar, click on **Project Settings** (gear icon) > **API**.
   - Copy the **Project URL**.
   - Copy the `anon` (public) key.
   - Copy the `service_role` (secret) key (keep this secret and only use it on the backend).

4. **Update Environment Variables**:
   - Open `backend/.env` and insert:
     ```env
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```
   - Open `frontend/.env` and insert:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

---

## 🔥 2. Firebase Configuration (Authentication)

Firebase is used for client-side user authentication (Login, Sign-up, Google Sign-in) for procurement officers and managers.

### Steps:
1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com).
   - Click **Add Project**, enter a project name (e.g., `VendorBridge`), and click **Continue**.
   - (Optional) Disable Google Analytics for this hackathon sprint, then click **Create Project**.

2. **Enable Authentication Providers**:
   - In the left menu of the Firebase Console, go to **Build** > **Authentication**.
   - Click **Get Started**.
   - In the **Sign-in method** tab, enable the following providers:
     - **Email/Password**: Click it, enable it, and click **Save**.
     - **Google**: Click it, enable it, select a project support email, and click **Save**.

3. **Register a Web App**:
   - Go to **Project Settings** (gear icon in top left next to Project Overview).
   - Under **Your apps**, click the web icon (`</>`) to register a new web app.
   - Name it `VendorBridge Frontend` and click **Register App**.
   - Firebase will show you a configuration object looking like this:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "1234567890",
       appId: "1:1234:web:abcd"
     };
     ```

4. **Add Keys to Frontend `.env`**:
   - Open `frontend/.env` and add these environment variables using the details from your `firebaseConfig` object:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```
   *(Note: The frontend code in `src/lib/firebase.js` is programmed to fall back to a mock login flow if these keys are missing or contain placeholder values, ensuring the application remains testable out-of-the-box!)*

---

## ⚡ 3. How User Sync Works Under the Hood

To combine the strength of Firebase Auth and Supabase database:
1. The user registers or signs in on the **Frontend** using Firebase Auth.
2. Once Firebase validates the credentials, it returns the user's `uid` (Firebase unique identifier) and `email`.
3. The frontend immediately makes a request to our Express backend `/api/auth/firebase-sync` passing the user details.
4. The backend checks if a profile with that `uid` exists in the Supabase database. If it doesn't, it automatically inserts a new profile row mapping the Firebase `uid` directly to the `profiles` table ID.
5. The backend generates a secure JWT token, signs it, and returns the profile details to the frontend.
6. The frontend stores the JWT in `localStorage` and appends it to all subsequent requests for authorization.
