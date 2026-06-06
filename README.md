<p align="center">
  <img src="https://img.icons8.com/fluency/96/shield.png" width="90" alt="VendorBridge Logo" />
</p>

<h1 align="center">VendorBridge ERP</h1>
<p align="center"><strong>AI-Powered B2B Vendor Management & Procurement ERP Platform</strong></p>

<p align="center">
  
  <img src="https://img.shields.io/badge/HACKATHON_2026-3B82F6?style=for-the-badge&logo=github&logoColor=white" alt="ODOO Hackathon"/>
  <img src="https://img.shields.io/badge/SUPABASE-22C55E?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Live Demo"/>
  <img src="https://img.shields.io/badge/FIREBASE-EAB308?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/NODE.JS-18%2B-22C55E?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/REACT%20%2F%20VITE-18%20%2F%205-0F172A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Vite"/>
</p>

---

## 📖 Overview

**VendorBridge** is an enterprise-grade, B2B Procurement and Vendor Management ERP platform. It streamlines corporate workflows from initial Request for Quotation (RFQ) generation to purchase orders, multi-level management approvals, and invoice settlement.

Designed with high-end glassmorphic visuals, the platform is integrated with **AI Strategic Insights** for procurement officers, **Firebase Auth** for secure client login, **Supabase** for robust relational storage, and a production-ready **Nodemailer SMTP** service that triggers real invoice/PO emails containing dynamically-generated PDF attachments.

---

## 🚀 Key Features

* **📊 AI-Powered Executive Dashboard**: Track KPIs (active vendors, open RFQs, approvals, and quotations) and receive strategic procurement recommendations from the AI assistant.
* **📝 Automated RFQ Lifecycle**: Create, edit, and send RFQs to assigned vendors. View, download, and email RFQ specifications in clean, system-generated PDFs.
* **⚡ Multi-Level Approvals**: Procurement managers can review submitted quotations, compare pricing, and approve or reject requests with audit remarks.
* **🛒 Purchase Order & Invoice Automation**: Auto-generate purchase orders and invoices upon approval. Click to download offline PDFs/Excel spreadsheets, or email them directly to vendor/procurement accounts.
* **🔒 Secure Hybrid Authentication**: High-security authentication utilizing Firebase client-side Auth synchronized with backend Supabase database profile triggers.
* **📬 Real-Time Sent-Mail Notifications**: Real SMTP email configuration utilizing secure App Passwords. Emails are automatically logged and appear in the user's Gmail "Sent" folder.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite 5, Tailwind CSS, Recharts, Framer Motion, Lucide Icons
* **Backend**: Node.js, Express, Nodemailer, PDFKit (PDF generation), XLSX (Excel sheets)
* **Database**: PostgreSQL (Supabase)
* **Authentication**: Firebase Authentication & JWT Sync

---

## 📁 Project Structure

```text
vendor-erp/
├── backend/
│   ├── routes/          # Express route controllers (invoices, POs, RFQs, etc.)
│   ├── services/        # AI service, email transporter configurations
│   ├── supabase/        # Database clients
│   ├── server.js        # Server entrypoint
│   └── .env             # Database & Gmail credentials (ignored)
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI elements (Layout, Topbar, Sidebar)
│   │   ├── pages/       # Dashboard, RFQs, Purchase Orders, Login
│   │   ├── services/    # Client API service wrapper
│   │   └── store/       # Auth state store
│   └── .env             # Public Supabase & Firebase credentials (ignored)
└── supabase_schema.sql  # Relational schema script
```

---

## ⚙️ Quick Setup

### 1. Database Setup (Supabase)
1. Create a Supabase project.
2. Open the **SQL Editor**, paste the contents of `supabase_schema.sql`, and click **Run**.
3. Retrieve project keys from Settings > API.

### 2. Authentication Setup (Firebase)
1. Create a Firebase project.
2. Enable **Email/Password** and **Google** sign-in methods in Build > Authentication.
3. Register a Web App and copy the `firebaseConfig` keys.

### 3. Configuration & Startup
Create `.env` files inside `backend/` and `frontend/` using the instructions provided in `setup_instructions.md`.

#### Start the Backend Server:
```bash
cd backend
npm install
npm run dev
```

#### Start the Frontend Server:
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
