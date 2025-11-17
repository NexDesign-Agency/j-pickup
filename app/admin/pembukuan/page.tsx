"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Pickup {
  id: string
  customerId: string
  status: string
  scheduledDate: string
  actualDate: string | null
  actualVolume: number | null
  volume: number
  totalPrice: number
  courierFee: number
  affiliateFee: number
  customer: {
    name: string
  }
}

interface Bill {
  id: string
  amount: number
  status: string
  paidDate: string | null
  pickup: {
    customer: {
      name: string
    }
    actualVolume: number | null
    volume: number
  }
}

interface Commission {
  id: string
  type: string
  amount: number
  status: string
  paidDate: string | null
  user: {
    name: string
  }
}

interface OtherExpense {
  id: string
  description: string
  amount: number
  date: string
}

export default function AdminPembukuanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([])
  const [sellingPricePerLiter, setSellingPricePerLiter] = useState(8000)
  const [investorFeePerLiter, setInvestorFeePerLiter] = useState(500)

  const [periodFilter, setPeriodFilter] = useState('thisMonth')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Form state for other expenses
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<OtherExpense | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) return router.push('/login')
    if (user?.role !== 'ADMIN') return router.push('/dashboard')

    // Set default date range (this month)
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])

    fetchAllData()
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchAllData()
    }
  }, [startDate, endDate])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      // Fetch pickups (for revenue calculation)
      const pickupsRes = await fetch(`/api/pickups?status=COMPLETED&startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (pickupsRes.ok) {
        const data = await pickupsRes.json()
        setPickups(data)
      }

      // Fetch bills (customer payments - expense)
      const billsRes = await fetch(`/api/bills?status=PAID&startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (billsRes.ok) {
        const data = await billsRes.json()
        setBills(data)
      }

      // Fetch commissions (courier & affiliate - expense)
      const commissionsRes = await fetch(`/api/commissions?status=PAID&startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (commissionsRes.ok) {
        const data = await commissionsRes.json()
        setCommissions(data)
      }

      // Fetch other expenses
      const expensesRes = await fetch(`/api/other-expenses?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (expensesRes.ok) {
        const data = await expensesRes.json()
        setOtherExpenses(data)
      }

      // Fetch selling price and investor fee from settings
      const settingsRes = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSellingPricePerLiter(data.sellingPricePerLiter || 8000)
        setInvestorFeePerLiter(data.investorFeePerLiter || 500)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveExpense = async () => {
    if (!expenseForm.description.trim() || !expenseForm.amount) {
      toast.error('Keterangan dan nominal wajib diisi')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const method = editingExpense ? 'PUT' : 'POST'
      const url = editingExpense
        ? `/api/other-expenses/${editingExpense.id}`
        : '/api/other-expenses'

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseForm)
      })

      if (res.ok) {
        toast.success(editingExpense ? 'Pengeluaran diupdate' : 'Pengeluaran ditambahkan')
        setShowExpenseForm(false)
        setEditingExpense(null)
        setExpenseForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0] })
        fetchAllData()
      } else {
        toast.error('Gagal menyimpan pengeluaran')
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/other-expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success('Pengeluaran dihapus')
        fetchAllData()
      } else {
        toast.error('Gagal menghapus pengeluaran')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Terjadi kesalahan')
    }
  }

  // Calculate totals
  const totalRevenue = pickups.reduce((sum, p) => {
    const volume = p.actualVolume || p.volume
    return sum + (volume * sellingPricePerLiter)
  }, 0)

  // Calculate total volume for investor fee
  const totalVolume = pickups.reduce((sum, p) => {
    const volume = p.actualVolume || p.volume
    return sum + volume
  }, 0)

  const totalCustomerPayments = bills.reduce((sum, b) => sum + b.amount, 0)
  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0)
  const totalInvestorFee = totalVolume * investorFeePerLiter
  const totalOtherExpenses = otherExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = totalCustomerPayments + totalCommissions + totalInvestorFee + totalOtherExpenses
  const netProfit = totalRevenue - totalExpenses

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pembukuan</h1>
          <p className="text-gray-600 mt-2">Laporan keuangan dan pengeluaran</p>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Periode:</span>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dari</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sampai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Total Pendapatan</span>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-green-100 text-sm mt-2">
              Dari harga jual {sellingPricePerLiter.toLocaleString('id-ID')}/L
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100">Total Pengeluaran</span>
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">
              Rp {totalExpenses.toLocaleString('id-ID')}
            </div>
            <div className="text-red-100 text-sm mt-2 space-y-1">
              <div>Pembayaran Customer: Rp {totalCustomerPayments.toLocaleString('id-ID')}</div>
              <div>Komisi: Rp {totalCommissions.toLocaleString('id-ID')}</div>
              <div>Fee Investor ({totalVolume.toFixed(1)}L): Rp {totalInvestorFee.toLocaleString('id-ID')}</div>
              <div>Lain-lain: Rp {totalOtherExpenses.toLocaleString('id-ID')}</div>
            </div>
          </div>

          {/* Net Profit */}
          <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white opacity-90">Laba Bersih</span>
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">
              Rp {netProfit.toLocaleString('id-ID')}
            </div>
            <p className="text-white opacity-90 text-sm mt-2">
              {netProfit >= 0 ? 'Profit' : 'Rugi'}
            </p>
          </div>
        </div>

        {/* Other Expenses Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pengeluaran Lain-lain</h2>
            <button
              onClick={() => {
                setShowExpenseForm(!showExpenseForm)
                setEditingExpense(null)
                setExpenseForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0] })
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Pengeluaran
            </button>
          </div>

          {/* Expense Form */}
          {showExpenseForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <h3 className="font-medium mb-3">
                {editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="Contoh: Biaya transportasi, listrik, dll"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveExpense}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setShowExpenseForm(false)
                    setEditingExpense(null)
                    setExpenseForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0] })
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Expenses List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Keterangan</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Nominal</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {otherExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Belum ada pengeluaran lain-lain
                    </td>
                  </tr>
                ) : (
                  otherExpenses.map(expense => (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(expense.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">{expense.description}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        Rp {expense.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingExpense(expense)
                              setExpenseForm({
                                description: expense.description,
                                amount: expense.amount.toString(),
                                date: new Date(expense.date).toISOString().split('T')[0]
                              })
                              setShowExpenseForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
