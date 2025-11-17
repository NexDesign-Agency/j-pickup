'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(response.data)
      setUnreadCount(response.data.filter((n: any) => !n.isRead).length)
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch('/api/notifications', 
        { id: notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  if (!user) return null

  return (
    <>
      <header className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-green-600">
                🛢️ JelantahGO
              </Link>
            </div>

            {/* Desktop Navigation - Sekarang akan tampil di desktop */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/pickups" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Pickups
              </Link>
              {(user.role === 'CUSTOMER' || user.role === 'ADMIN') && (
                <Link href="/bills" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Bills
                </Link>
              )}
              {user.role === 'COURIER' && (
                <Link href="/commissions" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Commissions
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link href="/admin/pembukuan" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Pembukuan
                </Link>
              )}
              <Link href="/profile" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-green-600"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif: any) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                            !notif.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="font-medium">{notif.title}</div>
                          <div className="text-sm text-gray-600">{notif.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Info & Logout - Desktop */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger Icon */}
                {!mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-green-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/pickups" 
                className="text-gray-700 hover:text-green-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pickups
              </Link>
              {(user.role === 'CUSTOMER' || user.role === 'ADMIN') && (
                <Link 
                  href="/bills" 
                  className="text-gray-700 hover:text-green-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bills
                </Link>
              )}
              {user.role === 'COURIER' && (
                <Link
                  href="/commissions"
                  className="text-gray-700 hover:text-green-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Commissions
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin/pembukuan"
                  className="text-gray-700 hover:text-green-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pembukuan
                </Link>
              )}
              <Link
                href="/profile"
                className="text-gray-700 hover:text-green-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              
              {/* User Info & Logout - Mobile */}
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
                <div className="mt-3 px-3">
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
