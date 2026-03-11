'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Monitor, 
  Shield, 
  Users, 
  BarChart3, 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Globe,
  Lock,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Monitor,
      title: 'Device Management',
      description: 'Track and manage all your organization\'s devices from a single dashboard.'
    },
    {
      icon: Shield,
      title: 'Secure Assignment',
      description: 'OTP-based device assignment ensures secure and verified device handovers.'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage team members, roles, and permissions with ease.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Get insights into device usage, assignments, and organizational metrics.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Devices Managed' },
    { number: '500+', label: 'Organizations' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Monitor className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold gradient-text">TechTrack</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-ghost">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Simplify</span> Device
              <br />
              Management
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your organization's device tracking, assignment, and management 
              with our modern, secure platform. From laptops to smartphones, manage it all.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/portal" className="btn-secondary text-lg px-8 py-4">
                Device Portal
              </Link>
            </div>

            {/* Floating Device Icons */}
            <div className="relative">
              <div className="absolute -top-20 left-1/4 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <Laptop className="w-12 h-12 text-blue-500 opacity-60" />
              </div>
              <div className="absolute -top-16 right-1/4 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                <Smartphone className="w-10 h-10 text-purple-500 opacity-60" />
              </div>
              <div className="absolute -top-12 left-1/3 animate-bounce-in" style={{ animationDelay: '0.6s' }}>
                <Tablet className="w-11 h-11 text-indigo-500 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to manage devices
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make device management effortless and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`card-hover p-8 text-center animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Why choose <span className="gradient-text">TechTrack</span>?
              </h2>
              
              <div className="space-y-6">
                {[
                  'Automated device detection and information collection',
                  'Secure OTP-based assignment process',
                  'Real-time tracking and audit logs',
                  'Role-based access control',
                  'Comprehensive reporting and analytics',
                  'Mobile-friendly interface'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="card p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Lightning Fast</h3>
                    <p className="text-gray-600 text-sm">Deploy in minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Global Access</h3>
                    <p className="text-gray-600 text-sm">Access from anywhere</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enterprise Security</h3>
                    <p className="text-gray-600 text-sm">Bank-level encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of organizations already using TechTrack to manage their devices.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105">
                Start Free Trial
              </Link>
              <Link href="/portal" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-medium px-8 py-4 rounded-xl transition-all duration-200">
                Device Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Monitor className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">TechTrack</span>
            </div>
            
            <div className="flex space-x-8">
              <Link href="/login" className="hover:text-blue-400 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-blue-400 transition-colors">
                Register
              </Link>
              <Link href="/portal" className="hover:text-blue-400 transition-colors">
                Portal
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TechTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}