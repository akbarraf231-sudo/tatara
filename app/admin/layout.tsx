import Sidebar from '@/components/admin/Sidebar'

/**
 * Layout untuk semua halaman /admin/*.
 *
 * Auth & role guard dilakukan di:
 *   1. proxy.ts (request-level, redirect cepat)
 *   2. requireAdmin() di tiap page server component (defense in depth)
 *
 * Sidebar disembunyikan otomatis di /admin/login karena halaman login
 * me-render dirinya full-screen dan menutupi konten layout — namun untuk
 * UX yang lebih bersih, layout ini tetap menampilkan sidebar dan login
 * page memang berada di luar konteks "admin yg sudah login".
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </div>
    </div>
  )
}
