"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Save, DollarSign, Settings as SettingsIcon, Bell, Clock } from 'lucide-react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeSection, setActiveSection] = useState('pricing')

  const [settings, setSettings] = useState({
    // Pricing Settings (Tiered)
    priceTier1Min: 1,
    priceTier1Max: 99,
    priceTier1Rate: 6500,
    priceTier2Min: 100,
    priceTier2Max: 199,
    priceTier2Rate: 7000,
    priceTier3Min: 200,
    priceTier3Rate: 7500,

    // Selling Price
    sellingPricePerLiter: 8000,

    // Courier Commission
    courierCommissionPerLiter: 500,
    courierDailySalary: 50000,

    // Affiliate Commission
    affiliateCommissionPerLiter: 200,

    // Investor Fee
    investorFeePerLiter: 500,

    // System Settings
    appName: 'JelantahGO',
    contactPhone: '',
    contactEmail: '',
    companyAddress: '',

    // Notification Settings
    emailTemplate: '',
    smsTemplate: '',
    reminderHours: 24,

    // Other Settings
    operatingHoursStart: '08:00',
    operatingHoursEnd: '17:00',
    serviceArea: '',
    minimumPickupVolume: 40
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) return router.push('/login')
    if (user?.role !== 'ADMIN') return router.push('/dashboard')

    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan' })
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

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

  const sections = [
    { id: 'pricing', label: 'Pengaturan Harga', icon: DollarSign },
    { id: 'system', label: 'Pengaturan Sistem', icon: SettingsIcon },
    { id: 'notification', label: 'Notifikasi', icon: Bell },
    { id: 'other', label: 'Lainnya', icon: Clock }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-600 mt-2">Kelola pengaturan aplikasi JelantahGO</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Section Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {sections.map(section => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeSection === section.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Pricing Settings */}
            {activeSection === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengaturan Harga</h2>

                  {/* Tier 1 */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Tier 1: Volume Kecil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min (Liter)</label>
                        <input
                          type="number"
                          value={settings.priceTier1Min}
                          onChange={(e) => handleChange('priceTier1Min', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max (Liter)</label>
                        <input
                          type="number"
                          value={settings.priceTier1Max}
                          onChange={(e) => handleChange('priceTier1Max', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga/Liter (Rp)</label>
                        <input
                          type="number"
                          value={settings.priceTier1Rate}
                          onChange={(e) => handleChange('priceTier1Rate', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-green-900 mb-3">Tier 2: Volume Menengah</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min (Liter)</label>
                        <input
                          type="number"
                          value={settings.priceTier2Min}
                          onChange={(e) => handleChange('priceTier2Min', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max (Liter)</label>
                        <input
                          type="number"
                          value={settings.priceTier2Max}
                          onChange={(e) => handleChange('priceTier2Max', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga/Liter (Rp)</label>
                        <input
                          type="number"
                          value={settings.priceTier2Rate}
                          onChange={(e) => handleChange('priceTier2Rate', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tier 3 */}
                  <div className="bg-purple-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-purple-900 mb-3">Tier 3: Volume Besar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min (Liter)</label>
                        <input
                          type="number"
                          value={settings.priceTier3Min}
                          onChange={(e) => handleChange('priceTier3Min', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga/Liter (Rp)</label>
                        <input
                          type="number"
                          value={settings.priceTier3Rate}
                          onChange={(e) => handleChange('priceTier3Rate', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-yellow-900 mb-3">Harga Jual ke Pabrik/Pembeli</h3>
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual per Liter (Rp)</label>
                      <input
                        type="number"
                        value={settings.sellingPricePerLiter}
                        onChange={(e) => handleChange('sellingPricePerLiter', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Harga jual minyak jelantah ke pabrik/pembeli per liter
                      </p>
                    </div>
                  </div>
                </div>

                {/* Commissions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Komisi</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-3">Komisi Kurir</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Per Liter (Rp)</label>
                          <input
                            type="number"
                            value={settings.courierCommissionPerLiter}
                            onChange={(e) => handleChange('courierCommissionPerLiter', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Harian (Rp)</label>
                          <input
                            type="number"
                            value={settings.courierDailySalary}
                            onChange={(e) => handleChange('courierDailySalary', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <p className="text-xs text-gray-500 mt-1">Minimal 1 pickup per hari</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-pink-50 rounded-lg p-4">
                      <h3 className="font-semibold text-pink-900 mb-3">Komisi Affiliate</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Liter (Rp)</label>
                        <input
                          type="number"
                          value={settings.affiliateCommissionPerLiter}
                          onChange={(e) => handleChange('affiliateCommissionPerLiter', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Dari downline yang direferensikan</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investor Fee */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Fee Investor</h2>

                  <div className="bg-indigo-50 rounded-lg p-4 max-w-md">
                    <h3 className="font-semibold text-indigo-900 mb-3">Fee untuk Investor</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Per Liter (Rp)</label>
                      <input
                        type="number"
                        value={settings.investorFeePerLiter}
                        onChange={(e) => handleChange('investorFeePerLiter', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Fee yang dibayarkan ke investor per liter jelantah
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeSection === 'system' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengaturan Sistem</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi</label>
                  <input
                    type="text"
                    value={settings.appName}
                    onChange={(e) => handleChange('appName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Perusahaan</label>
                  <textarea
                    value={settings.companyAddress}
                    onChange={(e) => handleChange('companyAddress', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notification' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengaturan Notifikasi</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Email</label>
                  <textarea
                    value={settings.emailTemplate}
                    onChange={(e) => handleChange('emailTemplate', e.target.value)}
                    rows={5}
                    placeholder="Template email untuk notifikasi..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template SMS</label>
                  <textarea
                    value={settings.smsTemplate}
                    onChange={(e) => handleChange('smsTemplate', e.target.value)}
                    rows={3}
                    placeholder="Template SMS untuk notifikasi..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Pengingat (Jam)</label>
                  <input
                    type="number"
                    value={settings.reminderHours}
                    onChange={(e) => handleChange('reminderHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jam sebelum jadwal pickup</p>
                </div>
              </div>
            )}

            {/* Other Settings */}
            {activeSection === 'other' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengaturan Lainnya</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Operasional Mulai</label>
                    <input
                      type="time"
                      value={settings.operatingHoursStart}
                      onChange={(e) => handleChange('operatingHoursStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Operasional Selesai</label>
                    <input
                      type="time"
                      value={settings.operatingHoursEnd}
                      onChange={(e) => handleChange('operatingHoursEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Layanan</label>
                  <textarea
                    value={settings.serviceArea}
                    onChange={(e) => handleChange('serviceArea', e.target.value)}
                    rows={3}
                    placeholder="Contoh: Jakarta Pusat, Jakarta Selatan, ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Volume Pickup (Liter)</label>
                  <input
                    type="number"
                    value={settings.minimumPickupVolume}
                    onChange={(e) => handleChange('minimumPickupVolume', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  )
}
