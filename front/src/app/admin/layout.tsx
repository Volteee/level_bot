// app/admin/layout.tsx
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex flex-wrap space-x-4">
          <Link href="/admin/roles" className="hover:text-gray-300 mb-2 sm:mb-0">
            Управление ролями
          </Link>
          <Link href="/admin/relations" className="hover:text-gray-300 mb-2 sm:mb-0">
            Назначение проверяющих
          </Link>
          <Link href="/admin/conditions" className="hover:text-gray-300">
            Условия уровней
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}