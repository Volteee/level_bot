// app/admin/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, UserRoleEnum } from '@/types/user';

export default function RolesManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [initData, setInitData] = useState('');

  useEffect(() => {
    if (window.Telegram !== undefined) {
      setInitData(window.Telegram.WebApp.initData);
      setCurrentUsername(String(window.Telegram.WebApp.initDataUnsafe.user?.username));
    }
  }, []);

  useEffect(() => {
    if (initData !== '')fetchUsers();
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

  const updateUserRoles = (userId: string, newRoles: UserRoleEnum[]) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, roles: newRoles } : user
    ));
  };

  const toggleUserRole = (userId: string, role: UserRoleEnum) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const hasRole = user.roles.includes(role);
    let newRoles: UserRoleEnum[];

    if (hasRole) {
      newRoles = user.roles.filter(r => r !== role);
    } else {
      newRoles = [...user.roles, role];
    }

    if (newRoles.length === 0) {
      newRoles = [UserRoleEnum.UNKNOWN];
    }

    updateUserRoles(userId, newRoles);
  };

  const handleSave = async () => {
    const usersWithoutRoles = users.filter(user => !user.roles || user.roles.length === 0);
    if (usersWithoutRoles.length > 0) {
      alert('Все пользователи должны иметь хотя бы одну роль');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/users/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'initData': initData,
        },
        body: JSON.stringify({ users, currentUsername }),
      });

      if (response.ok) {
        alert('Роли успешно обновлены');
        await fetchUsers();
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

  const getRoleDisplayName = (role: UserRoleEnum): string => {
    const roleNames = {
      [UserRoleEnum.INITIATOR]: 'Инициатор',
      [UserRoleEnum.INSPECTOR]: 'Проверяющий',
      [UserRoleEnum.ADMIN]: 'Администратор',
      [UserRoleEnum.UNKNOWN]: 'Неопределен',
      [UserRoleEnum.PAYEER]: 'Плательщик',
    };
    return roleNames[role];
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
                Роли
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
                  {user.tg_username === currentUsername && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      (Это вы)
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.values(UserRoleEnum).map((role) => {
                      const hasRole = user.roles.includes(role);
                      const isCurrentUser = user.tg_username === currentUsername;
                      const isAdminRole = role === UserRoleEnum.ADMIN;
                      const isDisabled = isCurrentUser && isAdminRole && hasRole;

                      return (
                        <label
                          key={role}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                            hasRole
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        >
                          <input
                            type="checkbox"
                            checked={hasRole}
                            onChange={() => toggleUserRole(user.id, role)}
                            disabled={isDisabled}
                            className="hidden"
                          />
                          <span className="flex items-center">
                            {getRoleDisplayName(role)}
                            {isDisabled && (
                              <svg className="w-3 h-3 ml-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Выберите одну или несколько ролей
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => fetchUsers()}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Отменить изменения
        </button>
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