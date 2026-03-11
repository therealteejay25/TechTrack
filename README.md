# TechTrack - Device Assignment & Tracking System

A full-stack application for managing device inventory, assignments, and team members with OTP-based device verification.

## 🏗️ Project Structure

```
techtrack/
├── techtrack/                 # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/           # Authentication pages (login, register)
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── devices/      # Device management
│   │   │   ├── assignments/  # Assignment management
│   │   │   ├── members/      # Team member management
│   │   │   └── audit/        # Audit log
│   │   ├── portal/           # Public OTP verification portal
│   │   └── accept-invite/    # Invite acceptance page
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities and API client
│   └── middleware.ts         # Route protection
│
└── techtrack-api/            # Node.js + Express Backend
    ├── src/
    │   ├── models/           # Mongoose schemas
    │   ├── routes/           # API route handlers
    │   ├── middleware/       # Auth & role middleware
    │   └── lib/              # Database & auth utilities
    └── .env                  # Environment variables

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd techtrack-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/laptoptracker
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

4. Start the development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd techtrack
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## 📱 OTP Assignment Flow

The device assignment process uses a secure OTP-based verification system:

### 1. Admin Initiates Assignment
- Admin navigates to a device detail page
- Clicks "Assign Device" button
- Selects a staff member from the dropdown
- Clicks "Generate OTP"

### 2. OTP Generation
- Backend generates a 6-digit OTP
- OTP is hashed with bcrypt and stored in database
- OTP expires in 15 minutes
- Admin sees the OTP and portal URL

### 3. Staff Verification
- Staff member receives OTP from admin (via email, chat, etc.)
- Opens the portal URL on the device being assigned
- Enters the 6-digit OTP code
- Portal automatically collects system information:
  - Operating system and version
  - RAM (if available)
  - Screen resolution
  - Hostname

### 4. Assignment Creation
- Backend verifies OTP and creates assignment with status `pending_admin`
- Device status remains `available`
- Auto-detected specs are stored with the assignment

### 5. Admin Confirmation
- Admin sees pending assignment notification
- Reviews auto-detected information
- Adds accessories, condition notes, and admin notes
- Confirms assignment
- Device status changes to `assigned`
- Assignment status changes to `confirmed`

### 6. Device Return
- Admin clicks "Return Device" on assignment
- Assignment is marked as inactive with return date
- Device status changes back to `available`

## 🔐 User Roles

### Super Admin
- Full system access
- Can manage all devices, assignments, and members
- Can change user roles
- Can deactivate users
- Can view audit logs

### Admin
- Can manage devices and assignments
- Can invite new members
- Can view audit logs
- Cannot change user roles or deactivate users

### Staff
- Can view devices
- Can view their own assignments
- Cannot manage devices or members
- Cannot view audit logs

## 🗄️ Database Models

### Organization
- Organization details and branding
- Unique slug for identification

### User
- Team members with roles
- Email/password authentication
- Invite token system for onboarding

### Device
- Hardware inventory tracking
- Specifications and purchase information
- Status tracking (available, assigned, maintenance, retired)

### Assignment
- Links devices to users
- Tracks assignment lifecycle
- Stores auto-detected device information
- Status: pending_admin, confirmed, returned

### OTP
- One-time passwords for device verification
- 15-minute expiration
- Linked to specific device and user

### AuditLog
- Comprehensive activity tracking
- All system changes logged
- Actor, action, target, and details

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **lucide-react** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nanoid** - ID generation

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create organization and super admin
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear cookie
- `GET /api/auth/me` - Get current user
- `POST /api/auth/accept-invite` - Accept team invitation

### Devices
- `GET /api/devices` - List devices (paginated, filterable)
- `POST /api/devices` - Create device (admin+)
- `GET /api/devices/:id` - Get device details
- `PATCH /api/devices/:id` - Update device (admin+)
- `DELETE /api/devices/:id` - Retire device (super admin)
- `GET /api/devices/:id/history` - Get assignment history
- `POST /api/devices/:id/generate-otp` - Generate OTP (admin+)

### Portal (Public)
- `POST /api/portal/verify-otp` - Verify OTP code
- `POST /api/portal/submit` - Submit device information

### Assignments
- `GET /api/assignments` - List assignments (paginated)
- `GET /api/assignments/pending` - Get pending confirmations
- `GET /api/assignments/:id` - Get assignment details
- `PATCH /api/assignments/:id/confirm` - Confirm assignment (admin+)
- `POST /api/assignments/:id/return` - Return device (admin+)

### Members
- `GET /api/members` - List team members
- `POST /api/members/invite` - Invite new member (admin+)
- `GET /api/members/:id` - Get member details
- `PATCH /api/members/:id/role` - Change role (super admin)
- `DELETE /api/members/:id` - Deactivate member (super admin)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Audit
- `GET /api/audit` - List audit logs (admin+, paginated)

## 🔒 Security Features

- JWT-based authentication with httpOnly cookies
- Password hashing with bcrypt (10 rounds)
- OTP hashing for secure verification
- Role-based access control
- Rate limiting on public portal (20 requests per IP per 15 minutes)
- CORS configuration
- Input validation and sanitization

## 📄 License

MIT

## 👥 Support

For issues or questions, please open an issue on the repository.
"# TechTrack" 
