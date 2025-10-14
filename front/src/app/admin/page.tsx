"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  initiators: number;
  inspectors: number;
  admins: number;
  totalRelations: number;
  configuredRelations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    setInitData(window.Telegram.WebApp.initData);
  }, []);

  useEffect(() => {
    if (initData !== '') fetchStats();
  }, [initData])

  console.log(initData)

  const fetchStats = async () => {
    try {
      const [usersRes, relationsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: {
          'initData': initData,
        },
        }),
        fetch('/api/admin/relations', {
          headers: {
          'initData': initData,
        },
        })
      ]);
      
      if (!usersRes.ok || !relationsRes.ok) throw new Error('Failed to fetch data');
      
      const users = await usersRes.json();
      const relations = await relationsRes.json();

      const statsData: Stats = {
        totalUsers: users.length,
        initiators: users.filter((user: any) => user.role === 'INITIATOR').length,
        inspectors: users.filter((user: any) => user.role === 'INSPECTOR').length,
        admins: users.filter((user: any) => user.role === 'ADMIN').length,
        totalRelations: relations.length,
        configuredRelations: relations.filter((rel: any) => 
          rel.first_inspector_id || rel.second_inspector_id || 
          rel.third_inspector_id || rel.forth_inspector_id
        ).length
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Управление ролями',
      description: 'Назначение ролей пользователям системы',
      href: '/admin/roles',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M 5 9 a 4 4 0 1 1 0 1 M 15 21 H 3 v -1 a 6 6 0 0 1 12 0 v 1 z m 0 0 h 6 v -1 a 6 6 0 0 0 -9 -5.197 m 6 -4.803 a 2.5 2.5 0 1 1 -5 1 a 2.5 2.5 0 0 1 5 -1 z" />
        </svg>
      ),
      color: 'bg-blue-500'
    },
    {
      title: 'Назначение проверяющих',
      description: 'Распределение проверяющих по инициаторам и уровням',
      href: '/admin/relations',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-green-500'
    },
    {
      title: 'Условия уровней',
      description: 'Настройка диапазонов сумм для определения уровней заявок',
      href: '/admin/conditions',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Панель администратора
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Управление пользователями, назначениями и настройками системы
        </p>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Пользователи</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M 5 9 a 4 4 0 1 1 0 1 M 15 21 H 3 v -1 a 6 6 0 0 1 12 0 v 1 z m 0 0 h 6 v -1 a 6 6 0 0 0 -9 -5.197 m 6 -4.803 a 2.5 2.5 0 1 1 -5 1 a 2.5 2.5 0 0 1 5 -1 z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Инициаторы</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.initiators}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Проверяющие</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.inspectors}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Назначения</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {stats.configuredRelations}/{stats.totalRelations}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Карточки навигации */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {dashboardCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-300 group block"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className={`${card.color} p-2 sm:p-3 rounded-lg text-white group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                  {card.icon}
                </div>
                <h3 className="ml-3 text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {card.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                {card.description}
              </p>
              <div className="flex items-center text-blue-600 font-medium text-sm sm:text-base group-hover:text-blue-700 transition-colors">
                <span>Перейти</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Кнопка обновления статистики */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={fetchStats}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Обновить статистику</span>
        </button>
      </div>
    </div>
  );
}