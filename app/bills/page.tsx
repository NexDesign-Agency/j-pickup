'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import { X, Eye } from 'lucide-react'

type TabType = 'customer' | 'courier' | 'affiliate'

export default function BillsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('customer')
  const [bills, setBills] = useState([])
  const [courierCommissions, setCourierCommissions] = useState([])
  const [affiliateCommissions, setAffiliateCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [detailsModal, setDetailsModal] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchData()
    }
  }, [user, authLoading, filter, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      if (activeTab === 'customer') {
        const url = filter === 'ALL' ? '/api/bills' : `/api/bills?status=${filter}`
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBills(response.data)
      } else if (activeTab === 'courier') {
        const url = filter === 'ALL'
          ? '/api/commissions?type=COURIER'
          : `/api/commissions?type=COURIER&status=${filter}`
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCourierCommissions(response.data)
      } else if (activeTab === 'affiliate') {
        const url = filter === 'ALL'
          ? '/api/commissions?type=AFFILIATE'
          : `/api/commissions?type=AFFILIATE&status=${filter}`
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAffiliateCommissions(response.data)
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handlePayBill = async (billId: string) => {
    if (!confirm('Konfirmasi pembayaran tagihan ini?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/bills/${billId}`,
        { status: 'PAID' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Pembayaran berhasil!')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran')
    }
  }

  const handlePayCommission = async (commissionId: string) => {
    if (!confirm('Konfirmasi pembayaran komisi ini?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/commissions/${commissionId}`,
        { status: 'PAID' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Pembayaran berhasil!')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran')
    }
  }

  const showDetails = (item: any) => {
    setDetailsModal(item)
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      UNPAID: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const canPayBills = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE'

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pembayaran & Komisi</h1>
          <p className="text-gray-600 mt-2">Kelola pembayaran customer, kurir, dan affiliate</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('customer')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'customer'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pembayaran Customer
              </button>
              <button
                onClick={() => setActiveTab('courier')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'courier'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pembayaran Kurir
              </button>
              <button
                onClick={() => setActiveTab('affiliate')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'affiliate'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Komisi Affiliate
              </button>
            </nav>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2 flex-wrap">
            {['ALL', activeTab === 'customer' ? 'UNPAID' : 'PENDING', 'PAID', 'OVERDUE'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Bills Tab */}
        {activeTab === 'customer' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill: any) => (
                      <tr key={bill.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {bill.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-sm font-medium text-gray-900">{bill.user.name}</div>
                          <div className="text-sm text-gray-500">{bill.user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          Rp {bill.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(bill.dueDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bill.status)}`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => showDetails(bill)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Detail
                            </button>
                            {bill.status === 'UNPAID' && canPayBills && (
                              <button
                                onClick={() => handlePayBill(bill.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Bayar
                              </button>
                            )}
                            {bill.status === 'PAID' && bill.paidDate && (
                              <span className="text-xs text-gray-500">
                                Dibayar: {new Date(bill.paidDate).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courier Commissions Tab */}
        {activeTab === 'courier' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kurir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komisi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courierCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    courierCommissions.map((commission: any) => (
                      <tr key={commission.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-sm font-medium text-gray-900">{commission.user.name}</div>
                          <div className="text-sm text-gray-500">{commission.user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {commission.pickup.customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {commission.pickup.actualVolume || commission.pickup.volume} L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          Rp {commission.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(commission.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(commission.status)}`}>
                            {commission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => showDetails(commission)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Detail
                            </button>
                            {commission.status === 'PENDING' && canPayBills && (
                              <button
                                onClick={() => handlePayCommission(commission.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Bayar
                              </button>
                            )}
                            {commission.status === 'PAID' && commission.paidDate && (
                              <span className="text-xs text-gray-500">
                                Dibayar: {new Date(commission.paidDate).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Affiliate Commissions Tab */}
        {activeTab === 'affiliate' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komisi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {affiliateCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    affiliateCommissions.map((commission: any) => (
                      <tr key={commission.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-sm font-medium text-gray-900">{commission.user.name}</div>
                          <div className="text-sm text-gray-500">{commission.user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {commission.pickup.customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {commission.pickup.actualVolume || commission.pickup.volume} L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          Rp {commission.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(commission.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(commission.status)}`}>
                            {commission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => showDetails(commission)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Detail
                            </button>
                            {commission.status === 'PENDING' && canPayBills && (
                              <button
                                onClick={() => handlePayCommission(commission.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Bayar
                              </button>
                            )}
                            {commission.status === 'PAID' && commission.paidDate && (
                              <span className="text-xs text-gray-500">
                                Dibayar: {new Date(commission.paidDate).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Pickup</h2>
                <button
                  onClick={() => setDetailsModal(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Pickup Info */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2">Informasi Pickup</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Customer</p>
                      <p className="font-medium">{detailsModal.pickup?.customer?.name || detailsModal.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tanggal</p>
                      <p className="font-medium">
                        {new Date(detailsModal.pickup?.scheduledDate || detailsModal.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Volume Estimasi</p>
                      <p className="font-medium">{detailsModal.pickup?.volume} L</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Volume Aktual</p>
                      <p className="font-medium text-green-600">
                        {detailsModal.pickup?.actualVolume || '-'} L
                      </p>
                    </div>
                  </div>
                </div>

                {/* Photo Proof */}
                {detailsModal.pickup?.photoProof && (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">Foto Bukti Pickup</h3>
                    <img
                      src={detailsModal.pickup.photoProof}
                      alt="Pickup Proof"
                      className="w-full max-w-md rounded-lg border"
                    />
                  </div>
                )}

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informasi Pembayaran</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {detailsModal.invoiceNumber && (
                      <div>
                        <p className="text-gray-500">Invoice</p>
                        <p className="font-medium">{detailsModal.invoiceNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Jumlah</p>
                      <p className="font-medium text-green-600">
                        Rp {(detailsModal.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(detailsModal.status)}`}>
                        {detailsModal.status}
                      </span>
                    </div>
                    {detailsModal.paidDate && (
                      <div>
                        <p className="text-gray-500">Tanggal Bayar</p>
                        <p className="font-medium">
                          {new Date(detailsModal.paidDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setDetailsModal(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
