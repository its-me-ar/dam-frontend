# DAM - Digital Asset Management System

A modern, full-featured Digital Asset Management system built with React, TypeScript, and Vite. This application provides comprehensive asset management, sharing capabilities, and user collaboration features.

## 🚀 Features

### Core Functionality
- **Asset Management**: Upload, organize, and manage digital assets
- **Multi-format Support**: Images, videos, documents, and more
- **Preview System**: Built-in preview for images and videos with quality selection
- **Download Management**: Secure download with multiple quality variants
- **User Management**: Role-based access control (Admin, Manager, User)
- **Sharing System**: Public and restricted asset sharing
- **Search & Filter**: Advanced asset discovery and filtering

### Sharing & Collaboration
- **Public Sharing**: Share assets publicly with shareable links
- **Restricted Sharing**: Share assets with specific users
- **Shared with Me**: View all assets shared with you
- **Share Management**: Track and manage shared assets
- **Secure Access**: Token-based secure sharing system

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Multiple Views**: Grid (small/large) and list view options
- **Real-time Updates**: Live updates using React Query
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Smooth loading experiences
- **Error Handling**: Comprehensive error management

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient data fetching and caching
- **React Router**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful, consistent iconography
- **SEO Optimized**: Dynamic page titles and meta tags

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios
- **Authentication**: JWT-based auth

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Card, Modal, Toast)
│   ├── dashboard/       # Dashboard-specific components
│   └── ...              # Feature-specific components
├── context/             # React context providers
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── useAssets.ts     # Asset management hooks
│   ├── useSharedWithMe.ts # Shared assets hooks
│   ├── usePageTitle.ts  # Dynamic page titles
│   └── ...              # Other custom hooks
├── layouts/             # Page layouts
│   └── DashboardLayout.tsx
├── lib/                 # API and utilities
│   └── api.ts          # API client and endpoints
├── pages/               # Page components
│   ├── Assets.tsx      # Main assets page
│   ├── SharedWithMe.tsx # Shared assets page
│   ├── SharedAsset.tsx # Individual shared asset page
│   ├── Overview.tsx    # Dashboard overview
│   ├── Users.tsx       # User management
│   ├── Settings.tsx    # System settings
│   ├── Login.tsx       # Authentication
│   └── RegisterInvite.tsx # User registration
├── routes/              # Routing configuration
│   ├── AppRouter.tsx   # Main router setup
│   └── ProtectedRoute.tsx # Route protection
└── utils/               # Utility functions
    └── helper.ts       # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dam-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:4000/api
   VITE_STORAGE_BE_URL=http://localhost:9000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` |
| `VITE_STORAGE_BE_URL` | Storage service URL | Same as API URL |

### API Endpoints

The application expects the following API endpoints:

- `GET /assets` - Fetch user's assets
- `GET /assets/shared` - Fetch shared assets
- `GET /assets/public/:id` - Fetch public asset details
- `GET /assets/restricted/:id` - Fetch restricted asset details
- `POST /assets/share` - Share an asset
- `GET /assets/share/visibility/:id` - Check asset visibility
- `GET /users` - Fetch users list
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /invitations` - Fetch invitations
- `POST /invitations` - Send invitation

## 🎨 UI Components

### Core Components
- **Card**: Flexible container component
- **Modal**: Overlay dialogs and forms
- **Toast**: Notification system
- **StatCard**: Dashboard metrics display

### Feature Components
- **AssetPreviewModal**: Full-screen asset preview
- **ShareModal**: Asset sharing interface
- **ShareInfoModal**: Share information display
- **AssetPreviewCard**: Asset preview with interactions

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, user management
- **Manager**: Asset management, user invitations
- **User**: Asset upload, sharing, basic features

### Protected Routes
- All dashboard routes require authentication
- User management requires Admin/Manager role
- Shared asset pages are publicly accessible

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: Lazy loading and responsive images
- **Caching**: React Query for efficient data caching
- **Bundle Optimization**: Vite's built-in optimizations

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using React, TypeScript, and Vite**