"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Eye,
  Navigation,
  Users,
  Package
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string
  address: string
  kelurahan: string | null
  kecamatan: string | null
  kota: string
  latitude: number
  longitude: number
  shareLocationUrl: string | null
  referralCode: string
  referredById: string | null
  isActive: boolean
  lastOrderDate: string | null
  createdAt: string
  updatedAt: string
  referredBy?: {
    id: string
    name: string
    phone: string
  } | null
  _count?: {
    pickupsAsCustomer: number
    referrals: number
  }
  totalVolume?: number
  downlineCount?: number
  downlineTotalVolume?: number
}

interface ReferrerOption {
  id: string
  name: string
  phone: string
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const { user: currentUser, loading: authLoading } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [referrerOptions, setReferrerOptions] = useState<ReferrerOption[]>([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    latitude: '',
    longitude: '',
    shareLocationUrl: '',
    referredById: '',
    isActive: true
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const limit = 10

  useEffect(() => {
    if (!authLoading && currentUser?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [currentUser, authLoading, router])

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchCustomers()
    }
  }, [currentUser, currentPage, searchQuery, filterStatus])

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchReferrerOptions()
    }
  }, [currentUser])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })

      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/customers?${params}`, {
        credentials: 'include'
      })

      if (!res.ok) throw new Error('Failed to fetch customers')

      const data = await res.json()
      setCustomers(data.customers)
      setTotalPages(data.pagination.totalPages)
      setTotalCustomers(data.pagination.total)
    } catch (error) {
      console.error('Error fetching customers:', error)
      alert('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const fetchReferrerOptions = async () => {
    try {
      const res = await fetch('/api/users?limit=1000', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setReferrerOptions(data.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        phone: u.phone
      })))
    } catch (error) {
      console.error('Error fetching referrer options:', error)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Nama wajib diisi'
    if (!formData.phone.trim()) errors.phone = 'No Handphone wajib diisi'
    if (!formData.address.trim()) errors.address = 'Alamat wajib diisi'
    if (!formData.kota.trim()) errors.kota = 'Kota wajib diisi'
    if (!formData.latitude) errors.latitude = 'Latitude wajib diisi'
    if (!formData.longitude) errors.longitude = 'Longitude wajib diisi'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      const url = showEditModal 
        ? `/api/admin/customers/${selectedCustomer?.id}`
        : '/api/admin/customers'
      
      const method = showEditModal ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          email: formData.email || null,
          kelurahan: formData.kelurahan || null,
          kecamatan: formData.kecamatan || null,
          shareLocationUrl: formData.shareLocationUrl || null,
          referredById: formData.referredById || null,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save customer')
      }

      if (!showEditModal && data.defaultPassword) {
        alert(`Customer berhasil dibuat!\n\nPassword default: ${data.defaultPassword}\n\nSilakan berikan password ini kepada customer.`)
      } else {
        alert(showEditModal ? 'Customer berhasil diupdate!' : 'Customer berhasil dibuat!')
      }

      setShowAddModal(false)
      setShowEditModal(false)
      resetForm()
      fetchCustomers()
    } catch (error: any) {
      console.error('Error saving customer:', error)
      alert(error.message || 'Gagal menyimpan customer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus customer ini?')) return

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to delete customer')

      if (data.deactivated) {
        alert('Customer memiliki riwayat pickup dan telah dinonaktifkan.')
      } else {
        alert('Customer berhasil dihapus!')
      }
      
      fetchCustomers()
    } catch (error: any) {
      console.error('Error deleting customer:', error)
      alert(error.message || 'Gagal menghapus customer')
    }
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
      kelurahan: customer.kelurahan || '',
      kecamatan: customer.kecamatan || '',
      kota: customer.kota,
      latitude: customer.latitude.toString(),
      longitude: customer.longitude.toString(),
      shareLocationUrl: customer.shareLocationUrl || '',
      referredById: customer.referredById || '',
      isActive: customer.isActive
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const openDetailModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      latitude: '',
      longitude: '',
      shareLocationUrl: '',
      referredById: '',
      isActive: true
    })
    setFormErrors({})
    setSelectedCustomer(null)
  }

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            shareLocationUrl: `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
          }))
        },
        (error) => {
          alert('Gagal mendapatkan lokasi: ' + error.message)
        }
      )
    } else {
      alert('Browser tidak mendukung geolocation')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    if (filterStatus === 'ACTIVE' && !customer.isActive) return false
    if (filterStatus === 'INACTIVE' && customer.isActive) return false
    return true
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Customer</h1>
            <p className="text-gray-600 mt-1">Kelola data customer JelantahGO</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Tambah Customer
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customer</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCustomers.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCustomers.filter(c => !c.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pickup</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCustomers.reduce((sum, c) => sum + (c._count?.pickupsAsCustomer || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No HP
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terakhir Setor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lama Tidak Setor
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Setoran (L)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah Downline
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Setoran Downline (L)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => {
                      // Calculate days since last order
                      let daysSinceLastOrder = '-';
                      if (customer.lastOrderDate) {
                        const lastDate = new Date(customer.lastOrderDate);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        daysSinceLastOrder = `${diffDays} hari`;
                      }

                      return (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">{customer.kota}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.phone}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {customer.lastOrderDate
                                ? new Date(customer.lastOrderDate).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : 'Belum pernah'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{daysSinceLastOrder}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {(customer.totalVolume || 0).toFixed(1)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.downlineCount || 0}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {(customer.downlineTotalVolume || 0).toFixed(1)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openDetailModal(customer)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Detail"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openEditModal(customer)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openGoogleMaps(customer.latitude, customer.longitude)}
                                className="text-green-600 hover:text-green-900"
                                title="Lokasi"
                              >
                                <Navigation className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan{' '}
                        <span className="font-medium">{(currentPage - 1) * limit + 1}</span>
                        {' '}hingga{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * limit, totalCustomers)}
                        </span>
                        {' '}dari{' '}
                        <span className="font-medium">{totalCustomers}</span>
                        {' '}hasil
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          ‹
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === currentPage
                                  ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          ›
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {showEditModal ? 'Edit Customer' : 'Tambah Customer Baru'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nama lengkap"
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Handphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="08123456789"
                      />
                      {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-gray-400">(Opsional)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kota <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.kota}
                        onChange={(e) => setFormData({...formData, kota: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.kota ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Jakarta, Surabaya, dll"
                      />
                      {formErrors.kota && <p className="text-red-500 text-xs mt-1">{formErrors.kota}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kelurahan <span className="text-gray-400">(Opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.kelurahan}
                        onChange={(e) => setFormData({...formData, kelurahan: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Kelurahan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kecamatan <span className="text-gray-400">(Opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.kecamatan}
                        onChange={(e) => setFormData({...formData, kecamatan: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Kecamatan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.latitude ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="-6.2088"
                      />
                      {formErrors.latitude && <p className="text-red-500 text-xs mt-1">{formErrors.latitude}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.longitude ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="106.8456"
                      />
                      {formErrors.longitude && <p className="text-red-500 text-xs mt-1">{formErrors.longitude}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={3}
                      placeholder="Jl. Contoh No. 123, RT/RW, Detail lokasi..."
                    />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referred By <span className="text-gray-400">(Opsional)</span>
                    </label>
                    <select
                      value={formData.referredById}
                      onChange={(e) => setFormData({...formData, referredById: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Pilih referrer (opsional)</option>
                      {referrerOptions.map((referrer) => (
                        <option key={referrer.id} value={referrer.id}>
                          {referrer.name} ({referrer.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Customer aktif
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        setShowEditModal(false)
                        resetForm()
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Menyimpan...' : (showEditModal ? 'Update' : 'Simpan')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Customer</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.email || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kota</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.kota}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kelurahan</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.kelurahan || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.kecamatan || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedCustomer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCustomer.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referral Code</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.referralCode}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alamat</label>
                    <p className="text-sm text-gray-900">{selectedCustomer.address}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Koordinat</label>
                    <p className="text-sm text-gray-900">
                      {selectedCustomer.latitude}, {selectedCustomer.longitude}
                      {selectedCustomer.shareLocationUrl && (
                        <a
                          href={selectedCustomer.shareLocationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          (Lihat Maps)
                        </a>
                      )}
                    </p>
                  </div>

                  {selectedCustomer.referredBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referred By</label>
                      <p className="text-sm text-gray-900">
                        {selectedCustomer.referredBy.name} ({selectedCustomer.referredBy.phone})
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Pickup</label>
                      <p className="text-sm text-gray-900">{selectedCustomer._count?.pickupsAsCustomer || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Referral</label>
                      <p className="text-sm text-gray-900">{selectedCustomer._count?.referrals || 0}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
