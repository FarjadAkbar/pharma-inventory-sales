# Ziauddin Hospital Pharma System - Frontend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Backend API running on `http://localhost:3000`
- Database configured with user accounts

### Environment Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables
```env
# .env.local
NEXT_JWT_SECRET=pharma-inventory-sales-jwt-secret-key-2024
NEXT_PUBLIC_API=http://localhost:3000/api
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   ├── tables/                  # Table components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
├── services/                    # API services
├── types/                       # TypeScript types
├── contexts/                    # React contexts
├── hooks/                       # Custom hooks
└── plan/                        # Development phases
    ├── guidelines.md
    ├── phase-1.md
    ├── phase-2.md
    ...
    └── phase-16.md
```

## 🎯 Development Phases

See the `plan/` folder for detailed implementation phases:

- **Phase 1**: Authentication Foundation ✅
- **Phase 2**: Core UI Components 🔄
- **Phase 3**: Master Data Management 🔄
- **Phase 4**: Procurement Module 🔄
- **Phase 5**: Quality Control Module 🔄
- **Phase 6**: Quality Assurance Module 🔄
- **Phase 7**: Manufacturing Module 🔄
- **Phase 8**: Warehouse Operations 🔄
- **Phase 9**: Distribution & Sales 🔄
- **Phase 10**: User Management 🔄
- **Phase 11**: Reporting & Analytics 🔄
- **Phase 12**: Bug Fixes & Form Actions 🔄
- **Phase 13**: Missing Pages Implementation 🔄
- **Phase 14**: Permission-Based Visibility 🔄
- **Phase 15**: End-to-End Integration 🔄
- **Phase 16**: API Integration 🔄

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: Shadcn/ui + Tailwind CSS
- **Authentication**: JWT with automatic token management
- **State Management**: React Context + Custom Hooks
- **API Client**: Fetch with automatic auth headers
- **Type Safety**: TypeScript throughout

## 🎨 Design System

- **Primary Color**: Orange (#FF6B35)
- **Background**: White (#FFFFFF)
- **Text**: Black (#000000)
- **Typography**: Inter (headings), Roboto (body)

## 🔐 Authentication

- JWT token-based authentication
- Automatic `Authorization: Bearer <token>` headers
- Route protection with middleware
- Permission-based UI rendering

## 📝 Getting Started

1. **Setup Environment**: Configure `.env.local` with API URL and JWT secret
2. **Start Backend**: Ensure backend API is running on port 3000
3. **Start Frontend**: Run `npm run dev` to start development server
4. **Follow Phases**: Implement features following the phase-by-phase plan in `plan/` folder

## 📚 Documentation

- **Implementation Plan**: See `plan/` folder for detailed phase documentation
- **API Integration**: Phase 16 covers comprehensive API service architecture
- **Component Library**: Shadcn/ui components with custom pharmaceutical theme
- **Authentication Flow**: JWT-based auth with automatic token management

---

This frontend provides a comprehensive pharmaceutical management system with proper authentication, role-based access, and systematic module development following the phase-by-phase implementation plan.