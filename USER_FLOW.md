# E-Movers System — User Flow & Objectives Achievement Guide

> **Deployed application:** https://emovers.vercel.app/
> **API backend:** https://e-movers-backend.onrender.com/api/v1/
> **Academic project presentation guide — covers all specific objectives**

---

## General Objective

> *To design and develop a secure, efficient, web-based system to automate core operations for a mover's company.*

E-Movers replaces manual, paper-based coordination with a centralised digital platform. Every phase of a moving job — from booking and staff scheduling to billing and performance review — is handled through a single web application, accessible from any browser with no software installation required.

---

## How Each Specific Objective Is Achieved

### 1. Role-Based Authentication for Secure Access

The system implements **JWT (JSON Web Token)** authentication with two distinct roles:

| Role | Access Level |
|---|---|
| `mover-admin` | Full system access — creates jobs, approves staff, generates invoices, views all reports |
| `mover-staff` | Restricted access — applies for jobs, starts/completes assigned jobs, submits reviews |

**How it works technically:**
- On login, the backend issues a short-lived **access token (60 min)** and a **refresh token (7 days)**
- Every API request carries the token in the `Authorization: Bearer <token>` header
- The frontend automatically refreshes the access token on expiry — the user never gets logged out mid-session
- Any endpoint the user's role cannot access returns `403 Forbidden` — the UI hides those actions entirely

**Evidence in the app:**
- An admin logging in lands on the **Dashboard** with KPI cards and management tools
- A staff member logging in lands on the **Jobs** list with only their own actions visible
- Sidebar navigation differs completely between roles — admins see Reports, Billing, Staff Management; staff only see Jobs, My Reviews, Notifications

---

### 2. Module for Online Bookings and Service Requests

The **Job Application Flow** is the booking/service-request module:

**From the staff side (service request):**
- Staff browse open jobs at `/available-jobs` (no login required — public listing)
- They submit their availability with just their email address
- The system enforces business rules: application deadline, maximum applicant cap, one application per job

**From the admin side (booking management):**
- Admin creates a job with full details: customer, pickup/dropoff addresses, scheduled date, move size, truck count, staff count
- Applicants are ranked automatically by **recommendation score** (derived from past reviews) — the best performers surface first
- Admin selects the team and designates a Team Lead with a single approval action

**Evidence in the app:**
- `/available-jobs` — public job board
- `/dashboard/jobs/new` — admin job creation form
- `/dashboard/jobs/[id]` → **Applications tab** — ranked applicant list with approve modal

---

### 3. Management Module for Truck Allocation and Staff Scheduling

**Auto-allocation** is the flagship scheduling feature:

- Admin clicks **Auto-Allocate** on a job
- The system ranks all currently available staff by `recommendation_score` (a weighted average of all past ratings)
- The top-scoring candidate is automatically designated **Team Lead (Supervisor)**
- The next N candidates become **Movers**
- Available trucks are selected by capacity
- All assignments are locked in one action — no manual list-building needed

**Manual assignment is also supported:**
- Admin can hand-pick specific staff IDs and truck IDs for jobs that need it
- Staff availability is automatically toggled — once assigned, a staff member's `is_available` flag is set to `false` so they cannot be double-booked

**Attendance management:**
- On the day of the move, admin opens the **Attendance tab** on the job detail page
- Any no-shows are marked absent with a note — no PIN or app required from the staff side
- Attendance records feed into the reporting module

**Evidence in the app:**
- `/dashboard/jobs/[id]` → **Team tab** — shows the full roster with Team Lead highlighted (crown icon)
- `/dashboard/jobs/[id]` → **Attendance tab** — mark-absent table
- `/dashboard/fleet` — full truck registry with status (available / on-job / maintenance)

---

### 4. Automated Invoice Generation and Billing Processes

Invoice amounts are **calculated automatically** using a formula driven by the job's actual assignments:

```
Base charge      =  KES 2,000
Distance charge  =  KES 100  × distance (km)
Staff charge     =  KES 500  × number of assigned staff
Truck charge     =  KES 1,500 × number of assigned trucks
─────────────────────────────────────────────────────────
Subtotal         =  sum of above
VAT (16%)        =  subtotal × 0.16
─────────────────────────────────────────────────────────
Total            =  subtotal + VAT
```

No manual calculation is needed. The admin clicks **Generate Invoice** and the system computes everything.

**Payment recording:**
- Partial payments are supported — the system tracks `amount_paid` and `balance_due` across multiple payment entries
- Payment methods: Cash, M-Pesa, Bank Transfer, Card
- Each payment generates a simulated transaction reference

**Staff disbursement:**
- Once an invoice is fully paid, admin triggers disbursement in one click
- The `amount_paid` is split **equally** among all assigned staff
- Each staff member receives an in-app notification (and email) with their share

**Evidence in the app:**
- `/dashboard/jobs/[id]` → **Billing tab** — cost breakdown table, record payment button, disburse button
- `/dashboard/billing` — full invoice and payment history

---

### 5. Administrative Dashboard for Real-Time Operational Monitoring

The admin dashboard at `/dashboard/admin` provides a **live operational overview**:

| Widget | What it shows |
|---|---|
| Staff KPIs | Total active staff, how many are available vs. on a job right now |
| Fleet KPIs | Total trucks, how many are available vs. on a job vs. in maintenance |
| Jobs KPIs | Counts by status (pending, assigned, in progress, completed, cancelled) |
| Billing KPIs | Total invoiced, total collected, total outstanding, number of unpaid invoices |
| Attention flag | Jobs that are pending but have no staff or trucks assigned yet |

**Deeper reports are available at `/dashboard/reports`:**
- Job completion trends (daily completions over the selected window)
- Revenue breakdown by payment method
- Staff performance ranking by recommendation score
- Fleet utilisation rates
- Attendance no-show rates per job and per staff member
- Application volume and approval rate statistics

All report endpoints accept a `?days=N` parameter (1–365) so the admin can narrow or widen the analysis window.

---

## Complete User Flows

---

### Flow A — Administrator

#### Step 1: Login
1. Navigate to **https://emovers.vercel.app/auth/login**
2. Enter credentials: `admin@emovers.co.ke` / `Admin1234!`
3. System verifies credentials, issues JWT tokens, redirects to **Dashboard**

#### Step 2: Monitor Operations
- The **Dashboard** card row shows live counts for staff, fleet, jobs, and billing
- Jobs flagged as *needing attention* (pending with no assignments) appear immediately
- Admin can identify what needs action without navigating anywhere

#### Step 3: Create a New Job
1. Go to **Jobs → New Job** (or `/dashboard/jobs/new`)
2. Fill in:
   - Customer name (select from existing customers or create new)
   - Pickup address, drop-off address
   - Move size (Studio / 1-Bed / 2-Bed / 3-Bed / Office)
   - Scheduled date and time
   - Estimated distance (km)
   - Requested staff count and truck count
   - Optional: application deadline, max applicants, special instructions
3. Click **Create Job** → job is created with status `pending`

#### Step 4: Allocate Staff and Trucks (two options)

**Option A — Auto-Allocate:**
1. Open the job detail page → click **Auto-Allocate**
2. Set number of movers and trucks → click **Allocate**
3. System selects the highest-scoring available staff and trucks
4. The top-scoring staff member is automatically made Team Lead

**Option B — Approve from Applicants:**
1. Staff will have submitted availability (see Staff Flow below)
2. Open job → **Applications tab**
3. Applicants are ranked by recommendation score (best first)
4. Click **Approve Applications** → check the staff to approve → select one as **Team Lead** → click **Approve & Assign**
5. Approved staff are notified by in-app notification and email
6. Rejected applicants receive a polite notification

Job status automatically moves to `assigned`.

#### Step 5: Morning of the Move — Mark No-shows
1. Open the job → **Attendance tab**
2. The full team roster is shown
3. For any staff member who did not show up, click **Mark Absent** and add a note
4. Absent records are saved; the staff member is flagged in the report

#### Step 6: Start the Job
- Click **Start Job** on the job detail page (Team Lead can also do this from their view)
- Job status moves to `in_progress`

#### Step 7: Generate Invoice
1. While the job is in progress (or immediately after completion), go to the **Billing tab**
2. Click **Generate Invoice**
3. System calculates cost automatically from the job's assignments and distance
4. Review the cost breakdown: base, distance, staff, truck charges, VAT
5. Invoice is created with status `unpaid`

#### Step 8: Complete the Job
- Team Lead clicks **Complete Job** on their job detail view, or admin does it
- Job status moves to `completed`
- All staff are released (available for the next job)
- All trucks are released
- Team Lead receives a `review_pending` notification automatically

#### Step 9: Record Payment
1. Go to **Billing tab** → click **Record Payment**
2. Enter amount, select method (M-Pesa, Cash, Bank Transfer, Card), add reference note
3. Partial payments are allowed — repeat until balance is zero
4. Invoice status moves to `paid` when fully settled

#### Step 10: Disburse Staff Pay
1. Once invoice is `paid`, click **Disburse**
2. Confirm the action
3. Total collected amount is split equally among all assigned staff
4. Each staff member receives an in-app notification and email with their amount

#### Step 11: Monitor Reports
- Navigate to **Reports** for a full breakdown:
  - Revenue trends, job completion rates, top-performing staff
  - Fleet utilisation, attendance rates, application statistics

---

### Flow B — Staff Member (Mover)

#### Step 1: Browse Available Jobs (No Login Required)
1. Go to **https://emovers.vercel.app/available-jobs**
2. Browse open jobs: location, move size, date, number of movers needed
3. Submit availability by entering your staff email address → click Apply
4. System confirms: *"Availability confirmed. The admin will review your application."*

#### Step 2: Login and Check Status
1. Login at `/auth/login` with staff credentials (e.g. `staff01@emovers.co.ke` / `Staff1234!`)
2. Go to **Jobs** → own applications are visible with current status
3. Wait for admin to process applications

#### Step 3: Get Notified of Approval
- In-app notification arrives: *"You're in! — [Job Title]"*
- Notification includes the scheduled date, addresses, and full team list
- An email is also sent to the staff member's address

#### Step 4: Start the Job (Supervisor / Team Lead Only)
1. Open the assigned job from the **Jobs** list
2. Click **Start Job**
3. Job status moves to `in_progress` — the team begins the move

#### Step 5: Complete the Job (Supervisor / Team Lead Only)
1. Once the move is done, click **Complete Job**
2. System records completion timestamp
3. All team members are released back to available status

#### Step 6: Review the Team (Supervisor / Team Lead Only)
1. A `review_pending` notification arrives automatically after job completion
2. Open the job → go to the **Reviews tab**
3. A banner prompts: *"Review Your Team — The job is complete. Rate each team member…"*
4. Click **Start Reviews**
5. For each mover on the team, rate across 6 categories:
   - Overall performance
   - Punctuality
   - Teamwork
   - Care of goods
   - Physical fitness
   - Communication
6. Star ratings 1–5, optional comment per category
7. Click **Submit All Reviews**
8. Each mover receives a `review_received` notification
9. Recommendation scores update immediately — high-performing staff will surface first in future auto-allocations

#### Step 7: View Own Reviews and Payments
- **My Reviews** (sidebar) — see all reviews received about yourself, category breakdown, average rating
- **Notifications** — payment disbursement notifications with amount and transaction reference

---

## System Architecture Supporting the Objectives

```
┌─────────────────────────────────────────────────────┐
│              Frontend — Next.js (Vercel)             │
│                                                     │
│  Admin Role              Staff Role                 │
│  ├─ Dashboard            ├─ Jobs list               │
│  ├─ Jobs management      ├─ My applications         │
│  ├─ Fleet management     ├─ Notifications           │
│  ├─ Customer registry    └─ My reviews              │
│  ├─ Billing & invoices                              │
│  ├─ Reports                                         │
│  └─ Staff management                                │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / JWT
┌────────────────────────▼────────────────────────────┐
│          Backend — Django REST Framework (Render)    │
│                                                     │
│  accounts   jobs      billing    reviews             │
│  fleet      attendance notifications  reports       │
└─────────────────────────────────────────────────────┘
```

### Key Technical Achievements

| Feature | Technology |
|---|---|
| Secure authentication | JWT (access + refresh tokens, auto-rotation, blacklisting on logout) |
| Role enforcement | DRF permission classes — every endpoint checked server-side |
| Recommendation scoring | Weighted formula recalculated via Django signal on every review save |
| Auto-allocation | Staff ranked by score, top candidate becomes Team Lead automatically |
| Invoice automation | Cost formula runs server-side from real assignment data — no manual input |
| Real-time notifications | In-app inbox + SMTP email dispatch on key events |
| PDF export | ReportLab generates a team roster PDF on demand |
| Public job board | Unauthenticated endpoint — staff apply by email only |

---

## Test Credentials (Live System)

| Account | Email | Password | Role |
|---|---|---|---|
| System Admin | `admin@emovers.co.ke` | `Admin1234!` | Full admin access |
| Staff member | `staff01@emovers.co.ke` | `Staff1234!` | Mover staff |
| Staff member | `staff02@emovers.co.ke` | `Staff1234!` | Mover staff |
| (any staff) | `staff01` – `staff20` | `Staff1234!` | Mover staff |

> Use the admin account to demonstrate the full management flow. Use a staff account in a second browser window to demonstrate the staff-side experience simultaneously.

---

## Demonstration Checklist for Supervisor Presentation

- [ ] **Login as admin** — show role-based redirect to dashboard
- [ ] **Dashboard KPIs** — point out live staff, fleet, and billing numbers
- [ ] **Create a job** — fill form, show it appears as `pending`
- [ ] **Auto-allocate** — show how the system picks the best staff by score
- [ ] **Open Applications tab** — show applicants ranked by recommendation score
- [ ] **Approve applications** — designate Team Lead, show notifications fire
- [ ] **Login as staff in another tab** — show the approval notification and team list
- [ ] **Start job** as Team Lead — show status change to `in_progress`
- [ ] **Complete job** as Team Lead — show status change to `completed`
- [ ] **Generate invoice** as admin — show the cost breakdown calculated automatically
- [ ] **Record payment** — show partial payment support and balance tracking
- [ ] **Disburse** — show equal split and disbursement notification
- [ ] **Review tab** — as Team Lead, show the "Review Your Team" banner and submit ratings
- [ ] **Reports** — show admin-only dashboard analytics
- [ ] **Download Team PDF** — show the roster PDF from the Team tab

---

*Generated: 2026-05-18 | E-Movers Academic Project*
