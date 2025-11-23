'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Warehouse,
  Package,
  Droplet,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Scale,
  Home,
  ClipboardList,
  BarChart3,
  User,
  LogOut,
  FileText
} from 'lucide-react'

export default function WarehouseDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('home')
  const [stats, setStats] = useState({
    pendingReceive: 0,
    todayReceived: 0,
    totalInventory: 0,
    todayVolume: 0,
    weeklyVolume: 0,
    monthlyVolume: 0
  })

  const [incomingPickups, setIncomingPickups] = useState([
    {
      id: '1',
      courierName: 'Andi Wijaya',
      customerName: 'Budi Santoso',
      volume: 25,
      estimatedArrival: '2024-01-15T14:00:00',
      status: 'IN_TRANSIT',
      pickupDate: '2024-01-15T10:00:00'
    },
    {
      id: '2',
      courierName: 'Siti Dewi',
      customerName: 'Ahmad Yani',
      volume: 30,
      estimatedArrival: '2024-01-15T15:00:00',
      status: 'IN_TRANSIT',
      pickupDate: '2024-01-15T11:00:00'
    }
  ])

  const [recentReceived, setRecentReceived] = useState([
    {
      id: '3',
      courierName: 'Andi Wijaya',
      volume: 20,
      quality: 'GOOD',
      receivedAt: '2024-01-15T13:00:00'
    },
    {
      id: '4',
      courierName: 'Budi Pratama',
      volume: 35,
      quality: 'EXCELLENT',
      receivedAt: '2024-01-15T12:30:00'
    }
  ])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token) {
      router.push('/login')
      return
    }

    if (userData.role !== 'WAREHOUSE') {
      router.push('/dashboard')
      return
    }

    setUser(userData)
    fetchWarehouseStats(token)
  }, [])

  const fetchWarehouseStats = async (token: string) => {
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      
      setStats({
        pendingReceive: data.pendingReceive || 0,
        todayReceived: data.todayReceived || 0,
        totalInventory: data.totalInventory || 0,
        todayVolume: data.todayVolume || 0,
        weeklyVolume: data.weeklyVolume || 0,
        monthlyVolume: data.monthlyVolume || 0
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

  const receivePickup = async (pickupId: string, volume: number, quality: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/pickups/${pickupId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'COMPLETED',
          actualVolume: volume,
          quality: quality
        })
      })

      if (res.ok) {
        alert('Pickup berhasil diterima!')
        fetchWarehouseStats(localStorage.getItem('token')!)
      }
    } catch (error) {
      console.error('Error receiving pickup:', error)
      alert('Gagal menerima pickup')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800'
      case 'ARRIVED': return 'bg-orange-100 text-orange-800'
      case 'RECEIVED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQualityColor = (quality: string) => {
    switch(quality) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800'
      case 'GOOD': return 'bg-blue-100 text-blue-800'
      case 'FAIR': return 'bg-yellow-100 text-yellow-800'
      case 'POOR': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const bottomNavItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/warehouse' },
    { id: 'receive', label: 'Receive', icon: ClipboardList, badge: stats.pendingReceive, path: '/warehouse/receive' },
    { id: 'bills', label: 'Pembayaran', icon: FileText, path: '/bills' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Warehouse className="w-6 h-6" />
                JelantahGO Warehouse
              </h1>
              <p className="text-xs md:text-sm text-purple-100">Dashboard Warehouse</p>
            </div>
            <div className="flex gap-2 md:gap-4 items-center">
              <span className="text-xs md:text-sm text-white hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white text-purple-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-purple-50 text-xs md:text-sm font-medium transition-colors"
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
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white mb-6 md:mb-8 shadow-lg">
          <h2 className="text-lg md:text-2xl font-bold">Selamat pagi, {user?.name}! 📦</h2>
          <p className="text-sm md:text-base opacity-90 mt-1">Monitor dan kelola inventory warehouse</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingReceive}</p>
            <p className="text-xs text-gray-600">Pending Receive</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayReceived}</p>
            <p className="text-xs text-gray-600">Diterima Hari Ini</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Droplet className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalInventory}L</p>
            <p className="text-xs text-gray-600">Total Inventory</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayVolume}L</p>
            <p className="text-xs text-gray-600">Volume Hari Ini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incoming Pickups */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 text-lg">Pickup Masuk</h3>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">
                {incomingPickups.length} Pickup
              </span>
            </div>
            <div className="space-y-4">
              {incomingPickups.map((pickup) => (
                <div key={pickup.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">Kurir: {pickup.courierName}</p>
                      <p className="text-sm text-gray-500">Customer: {pickup.customerName}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(pickup.status)}`}>
                        {pickup.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Volume</p>
                      <p className="font-bold text-purple-600 text-xl">{pickup.volume}L</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Estimasi Tiba</p>
                        <p className="text-sm text-gray-700 font-medium">
                          {new Date(pickup.estimatedArrival).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {pickup.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => {
                        // Open modal untuk input volume actual dan quality
                        const volume = prompt('Masukkan volume actual (Liter):', pickup.volume.toString())
                        if (volume) {
                          const quality = prompt('Quality (EXCELLENT/GOOD/FAIR/POOR):', 'GOOD')
                          if (quality) {
                            receivePickup(pickup.id, parseFloat(volume), quality)
                          }
                        }
                      }}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Terima & Verifikasi
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Inventory Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                Inventory Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hari Ini</span>
                  <span className="font-bold text-gray-900">{stats.todayVolume} L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Minggu Ini</span>
                  <span className="font-bold text-gray-900">{stats.weeklyVolume} L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bulan Ini</span>
                  <span className="font-bold text-gray-900">{stats.monthlyVolume} L</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Stock</span>
                    <span className="font-bold text-purple-600 text-xl">{stats.totalInventory} L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Capacity */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Kapasitas Storage
              </h3>
              <p className="text-3xl font-bold mb-4">{((stats.totalInventory / 10000) * 100).toFixed(1)}%</p>
              <div className="space-y-2 text-sm opacity-90">
                <div className="flex justify-between">
                  <span>Terisi</span>
                  <span className="font-semibold">{stats.totalInventory} L</span>
                </div>
                <div className="flex justify-between">
                  <span>Kapasitas Max</span>
                  <span className="font-semibold">10,000 L</span>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mt-4">
                <div 
                  className="bg-white h-3 rounded-full transition-all" 
                  style={{ width: `${(stats.totalInventory / 10000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Received */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Terakhir Diterima</h3>
              <div className="space-y-3">
                {recentReceived.map((item) => (
                  <div key={item.id} className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-medium text-gray-900">{item.courierName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">{item.volume}L</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(item.quality)}`}>
                        {item.quality}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.receivedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/bills')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Pembayaran Customer</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Laporan Harian</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Quality Issues</span>
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
