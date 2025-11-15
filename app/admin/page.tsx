"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  Package,
  FileText,
  DollarSign,
  User,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Users,
  Wallet,
  Settings
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchStats()
    }
  }, [user, authLoading])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        console.error('Failed to fetch stats:', res.status)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const getBottomNavItems = () => {
    const baseItems = [
      { id: 'home', label: 'Home', icon: Home, href: '/admin' },
      { id: 'pickups', label: 'Pickups', icon: Package, href: '/pickups', badge: stats?.pendingPickups }
    ]

    if (user?.role === 'CUSTOMER') {
      return [
        ...baseItems,
        { id: 'bills', label: 'Bills', icon: FileText, href: '/bills' },
        { id: 'profile', label: 'Profile', icon: User, href: '/profile' }
      ]
    }

    if (user?.role === 'COURIER') {
      return [
        ...baseItems,
        { id: 'commissions', label: 'Earnings', icon: DollarSign, href: '/commissions' },
        { id: 'profile', label: 'Profile', icon: User, href: '/profile' }
      ]
    }

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
        { id: 'profile', label: 'Profile', icon: User, href: '/profile' }
      ]
    }

    return [
      ...baseItems,
      { id: 'profile', label: 'Profile', icon: User, href: '/profile' }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white mb-4 md:mb-8 shadow-lg">
          <h2 className="text-lg md:text-2xl font-bold">Selamat datang, {user?.name}! 👋</h2>
          <p className="text-sm md:text-base opacity-90 mt-1">
            {user?.role === 'CUSTOMER' && 'Kelola pickup minyak jelantah Anda dengan mudah'}
            {user?.role === 'COURIER' && 'Siap untuk pickup hari ini?'}
            {user?.role === 'WAREHOUSE' && 'Monitor penerimaan minyak jelantah'}
            {user?.role === 'ADMIN' && 'Dashboard monitoring sistem JelantahGO'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {user?.role === 'ADMIN' && (
            <>
              <StatCard title="Total Users" value={stats?.totalUsers} icon={<Users className="w-6 h-6 md:w-8 md:h-8" />} color="blue" />
              <StatCard title="Total Pickups" value={stats?.totalPickups} icon={<Package className="w-6 h-6 md:w-8 md:h-8" />} color="green" />
              <StatCard title="Pending" value={stats?.pendingPickups} icon={<Clock className="w-6 h-6 md:w-8 md:h-8" />} color="orange" />
              <StatCard title="Revenue" value={`Rp ${stats?.totalRevenue?.toLocaleString() || 0}`} icon={<DollarSign className="w-6 h-6 md:w-8 md:h-8" />} color="purple" />
            </>
          )}

          {user?.role === 'CUSTOMER' && (
            <>
              <StatCard title="My Pickups" value={stats?.myPickups} icon={<Package className="w-6 h-6 md:w-8 md:h-8" />} color="blue" />
              <StatCard title="Pending" value={stats?.pendingPickups} icon={<Clock className="w-6 h-6 md:w-8 md:h-8" />} color="orange" />
              <StatCard title="Completed" value={stats?.completedPickups} icon={<CheckCircle className="w-6 h-6 md:w-8 md:h-8" />} color="green" />
              <StatCard title="Total Spent" value={`Rp ${stats?.totalSpent?.toLocaleString() || 0}`} icon={<Wallet className="w-6 h-6 md:w-8 md:h-8" />} color="purple" />
            </>
          )}

          {user?.role === 'COURIER' && (
            <>
              <StatCard title="Assigned" value={stats?.assignedPickups} icon={<Truck className="w-6 h-6 md:w-8 md:h-8" />} color="blue" />
              <StatCard title="Completed" value={stats?.completedPickups} icon={<CheckCircle className="w-6 h-6 md:w-8 md:h-8" />} color="green" />
              <StatCard title="Earnings" value={`Rp ${stats?.totalEarnings?.toLocaleString() || 0}`} icon={<DollarSign className="w-6 h-6 md:w-8 md:h-8" />} color="purple" />
              <StatCard title="Pending" value={stats?.pendingCommissions} icon={<Clock className="w-6 h-6 md:w-8 md:h-8" />} color="orange" />
            </>
          )}

          {user?.role === 'WAREHOUSE' && (
            <>
              <StatCard title="Received" value={stats?.receivedPickups} icon={<Package className="w-6 h-6 md:w-8 md:h-8" />} color="blue" />
              <StatCard title="Total Volume" value={`${stats?.totalVolume || 0} L`} icon={<TrendingUp className="w-6 h-6 md:w-8 md:h-8" />} color="green" />
            </>
          )}
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {user?.role === 'CUSTOMER' && (
              <Link href="/pickups/new" className="group bg-gradient-to-r from-green-500 to-green-600 text-white p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
                <div className="text-3xl md:text-4xl mb-2">➕</div>
                <div className="text-sm md:text-base font-medium">New Pickup</div>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link href="/admin/pickups/new" className="group bg-gradient-to-r from-green-500 to-green-600 text-white p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
                <div className="text-3xl md:text-4xl mb-2">🚀</div>
                <div className="text-sm md:text-base font-medium">Quick Pickup</div>
              </Link>
            )}
            
            {user?.role === 'ADMIN' && (
              <Link href="/admin/users" className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
                <div className="text-3xl md:text-4xl mb-2">👥</div>
                <div className="text-sm md:text-base font-medium">User Management</div>
              </Link>
            )}
            
            <Link href="/pickups" className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl md:text-4xl mb-2">📋</div>
              <div className="text-sm md:text-base font-medium">All Pickups</div>
            </Link>
            
            {(user?.role === 'CUSTOMER' || user?.role === 'ADMIN') && (
              <Link href="/bills" className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
                <div className="text-3xl md:text-4xl mb-2">💳</div>
                <div className="text-sm md:text-base font-medium">Bills</div>
              </Link>
            )}
            
            {user?.role === 'COURIER' && (
              <Link href="/commissions" className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
                <div className="text-3xl md:text-4xl mb-2">💵</div>
                <div className="text-sm md:text-base font-medium">Commissions</div>
              </Link>
            )}

            <Link href="/profile" className="group bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl md:text-4xl mb-2">👤</div>
              <div className="text-sm md:text-base font-medium">Profile</div>
            </Link>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
        <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${getBottomNavItems().length}, 1fr)` }}>
          {getBottomNavItems().map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive 
                    ? 'text-green-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-green-600 rounded-b-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: any
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const bgClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50'
  }

  const textClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-3 md:mb-0">
          <p className="text-xs md:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{value ?? 0}</p>
        </div>
        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${bgClasses[color]} w-fit ${textClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
