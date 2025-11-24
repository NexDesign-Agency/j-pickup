"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
                return
            }

            if (user.role === 'ADMIN') {
                // Admin has full access
                return
            }

            if (user.role === 'WAREHOUSE') {
                // Warehouse only has access to pembukuan
                if (pathname?.startsWith('/admin/pembukuan')) {
                    return
                }
            }

            // If not Admin and not authorized Warehouse path, redirect
            router.push('/dashboard')
        }
    }, [user, loading, router, pathname])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    <p className="mt-4 text-gray-600">Verifying access...</p>
                </div>
            </div>
        )
    }

    // Prevent flash of content for unauthorized users
    // We duplicate the check here to avoid rendering children before redirect happens
    const isAuthorized =
        user?.role === 'ADMIN' ||
        (user?.role === 'WAREHOUSE' && pathname?.startsWith('/admin/pembukuan'))

    if (!isAuthorized) {
        return null
    }

    return <>{children}</>
}
