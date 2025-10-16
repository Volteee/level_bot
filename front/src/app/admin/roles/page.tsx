// app/admin/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, UserRoleEnum } from '@/types/user';

export default function RolesManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    if (window.Telegram !== undefined)
      setInitData(window.Telegram.WebApp.initData);
  }, []);

  useEffect(() => {
    if (initData !== '') fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
          headers: {
          'initData': initData,
        },
        });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = (userId: string, newRole: UserRoleEnum) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/users/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'initData': initData,
        },
        body: JSON.stringify({ users }),
      });

      if (response.ok) {
        alert('Роли успешно обновлены');
        await fetchUsers(); // Обновляем данные
      } else {
        const error = await response.json();
        alert(`Ошибка при сохранении ролей: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving roles:', error);
      alert('Ошибка при сохранении ролей');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Управление ролями пользователей</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Роль
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.tg_username}
                  </div>
                  <div className="text-sm text-gray-500">
                    Chat ID: {user.chat_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value as UserRoleEnum)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {Object.values(UserRoleEnum).map((role) => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

function getRoleDisplayName(role: UserRoleEnum): string {
  const roleNames = {
    [UserRoleEnum.INITIATOR]: 'Инициатор',
    [UserRoleEnum.INSPECTOR]: 'Проверяющий',
    [UserRoleEnum.ADMIN]: 'Администратор',
    [UserRoleEnum.UNKNOWN]: 'Неопределен',
  };
  return roleNames[role];
}