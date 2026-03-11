'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Shield, Bell, Palette } from 'lucide-react';
import { useAuthContext } from '../layout';

// const settingsNavigation = [
//   {
//     name: 'Organization',
//     href: '/dashboard/settings/organization',
//     icon: Building2,
//     description: 'Manage organization profile and details',
//     roles: ['admin', 'super_admin']
//   },
//   {
//     name: 'Team Members',
//     href: '/dashboard/settings/members',
//     icon: Users,
//     description: 'Manage team member roles and permissions',
//     roles: ['super_admin']
//   },
//   {
//     name: 'Security',
//     href: '/dashboard/settings/security',
//     icon: Shield,
//     description: 'Security settings and access controls',
//     roles: ['super_admin']
//   },
//   {
//     name: 'Notifications',
//     href: '/dashboard/settings/notifications',
//     icon: Bell,
//     description: 'Configure email and system notifications',
//     roles: ['admin', 'super_admin']
//   },
//   {
//     name: 'Appearance',
//     href: '/dashboard/settings/appearance',
//     icon: Palette,
//     description: 'Customize the look and feel',
//     roles: ['admin', 'super_admin']
//   }
// ];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuthContext();

  // const availableNavigation = settingsNavigation.filter(item => 
  //   user && item.roles.includes(user.role)
  // );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your organization and account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="flex-shrink-0">
          {/* <nav className="space-y-2">
            {availableNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-start p-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {item.name}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav> */}
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}