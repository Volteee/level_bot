// app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStateEnum } from '@/types/user';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'SUCCESS' | 'ALL'>('PENDING');
  const [initData, setInitData] = useState('');

  useEffect(() => {
    if (window.Telegram !== undefined)
      setInitData(window.Telegram.WebApp.initData);
  }, []);

  useEffect(() => {
    if (initData !== '') fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData, filter]);

  const fetchOrders = async () => {
    try {
      const url = filter === 'ALL' 
        ? '/api/admin/orders'
        : `/api/admin/orders?state=${filter}`;
      
      const response = await fetch(url, {
        headers: { 'initData': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const getStateDisplayName = (state: OrderStateEnum): string => {
    const stateNames = {
      [OrderStateEnum.CREATED]: 'Создана',
      [OrderStateEnum.PENDING]: 'В процессе',
      [OrderStateEnum.SUCCESS]: 'Успешно',
      [OrderStateEnum.CANCELED]: 'Отменена',
      [OrderStateEnum.PAID]: 'Оплачена',
    };
    return stateNames[state];
  };

  const getStateColor = (state: OrderStateEnum): string => {
    const colors = {
      [OrderStateEnum.CREATED]: 'bg-gray-100 text-gray-800',
      [OrderStateEnum.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStateEnum.SUCCESS]: 'bg-green-100 text-green-800',
      [OrderStateEnum.CANCELED]: 'bg-red-100 text-red-800',
      [OrderStateEnum.PAID]: 'bg-blue-100 text-blue-800',
    };
    return colors[state];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление заявками</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'PENDING'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            В процессе
          </button>
          <button
            onClick={() => setFilter('SUCCESS')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'SUCCESS'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Успешные
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'ALL'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Все
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Заявка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Инициатор
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Прогресс
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата создания
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {order.description}
                  </div>
                  {order.reply && (
                    <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                      Ответ: {order.reply}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.initiator?.tg_username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAmount(order.amount, order.currency)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(order.state)}`}>
                    {getStateDisplayName(order.state)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.state === OrderStateEnum.PENDING ? (
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(order.step / order.level) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {order.step}/{order.level}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">Заявки не найдены</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div>Найдено заявок: {orders.length}</div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Обновить</span>
        </button>
      </div>
    </div>
  );
}