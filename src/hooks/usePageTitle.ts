import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageConfig: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Overview - DAM',
    description:
      'Digital Asset Management Dashboard - View metrics, recent uploads, and system overview',
  },
  '/assets': {
    title: 'Assets - DAM',
    description:
      'Manage your digital assets - Upload, organize, and share files with your team',
  },
  '/shared-with-me': {
    title: 'Shared with Me - DAM',
    description:
      'View assets shared with you by other team members - Access shared files and media',
  },
  '/users': {
    title: 'Users - DAM',
    description:
      'User Management - Manage team members, roles, and permissions',
  },
  '/settings': {
    title: 'Settings - DAM',
    description:
      'System Settings - Configure your DAM preferences and account settings',
  },
  '/login': {
    title: 'Login - DAM',
    description: 'Sign in to your Digital Asset Management account',
  },
  '/register/invite': {
    title: 'Register - DAM',
    description: 'Create your Digital Asset Management account',
  },
};

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    // Handle shared asset pages
    if (pathname.startsWith('/shared/')) {
      document.title = 'Shared Asset - DAM';
      updateMetaDescription(
        'View shared digital asset - Access shared files and media through secure sharing'
      );
      return;
    }

    // Handle other routes
    const config = pageConfig[pathname] || {
      title: 'DAM - Digital Asset Management',
      description:
        'Digital Asset Management System - Manage, share, and organize your digital assets efficiently',
    };

    document.title = config.title;
    updateMetaDescription(config.description);
  }, [location.pathname]);
}

function updateMetaDescription(description: string) {
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);
}
