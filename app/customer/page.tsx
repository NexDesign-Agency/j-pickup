'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Calendar,
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Home,
  ClipboardList,
  MessageCircle,
  User,
  LogOut,
  TrendingUp
} from 'lucide-react'

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('home')
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    totalLiters: 0
  })

  const [recentOrders, setRecentOrders] = useState([
    {
      id: '1',
      date: '2024-01-15',
      volume: 25,
      status: 'COMPLETED',
      amount: 125000,
      courier: 'Andi Wijaya'
    },
    {
      id: '2',
      date: '2024-01-10',
      volume: 30,
      status: 'PENDING',
      amount: 150000,
      courier: '-'
    }
  ])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token) {
      router.push('/login')
      return
    }

    if (userData.role !== 'CUSTOMER') {
      router.push('/dashboard')
      return
    }

    setUser(userData)
    fetchCustomerStats(token)
  }, [])

  const fetchCustomerStats = async (token: string) => {
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      
      setStats({
        totalOrders: data.totalPickups || 0,
        completedOrders: data.completedPickups || 0,
        pendingOrders: data.pendingPickups || 0,
        totalSpent: data.totalRevenue || 0,
        totalLiters: data.totalVolume || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'CANCELLED': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const bottomNavItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/customer' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, badge: stats.pendingOrders, path: '/pickups' },
    { id: 'messages', label: 'Chat', icon: MessageCircle, path: '/customer/messages' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">JelantahGO</h1>
              <p className="text-xs md:text-sm text-green-100">Dashboard Customer</p>
            </div>
            <div className="flex gap-2 md:gap-4 items-center">
              <span className="text-xs md:text-sm text-white hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white text-green-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-50 text-xs md:text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white mb-6 md:mb-8 shadow-lg">
          <h2 className="text-lg md:text-2xl font-bold">Halo, {user?.name}! 👋</h2>
          <p className="text-sm md:text-base opacity-90 mt-1">Selamat datang di dashboard customer JelantahGO</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-xs text-gray-600">Total Order</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            <p className="text-xs text-gray-600">Selesai</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Rp {(stats.totalSpent / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-600">Total Belanja</p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => router.push('/pickups/new')}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all mb-6 md:mb-8 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Pickup Baru</h3>
                <p className="text-sm text-green-100">Jadwalkan penjemputan minyak jelantah</p>
              </div>
            </div>
            <TrendingUp className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Order Terbaru</h3>
              <button 
                onClick={() => router.push('/pickups')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Semua
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Volume</p>
                      <p className="font-semibold text-gray-900">{order.volume} Liter</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-semibold text-gray-900">Rp {order.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  {order.courier !== '-' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Kurir</p>
                      <p className="font-medium text-gray-900">{order.courier}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Volume Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Statistik Volume</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Dikumpulkan</span>
                  <span className="font-bold text-green-600">{stats.totalLiters} Liter</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rata-rata/Order</span>
                  <span className="font-bold text-gray-900">
                    {stats.totalOrders > 0 ? (stats.totalLiters / stats.totalOrders).toFixed(1) : 0} Liter
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Harga/Liter</span>
                  <span className="font-bold text-gray-900">Rp 5.000</span>
                </div>
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-2">Kode Referral Anda</h3>
              <p className="text-sm opacity-90 mb-4">Ajak teman dan dapatkan bonus!</p>
              <div className="bg-white/20 rounded-lg p-3 mb-3">
                <p className="font-mono font-bold text-lg tracking-wider text-center">
                  {user?.referralCode || 'LOADING...'}
                </p>
              </div>
              <button className="w-full bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                Bagikan Kode
              </button>
            </div>

            {/* Help */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Butuh Bantuan?</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Chat dengan CS</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">FAQ Pickup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile */}
      
    </div>
  )
}
