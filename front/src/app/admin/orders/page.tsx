// app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStateEnum } from '@/types/user';
import OrderFiles from '@/components/OrderFiles';

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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Заголовок и фильтры */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Управление заявками</h1>
        
        {/* Мобильные фильтры - вертикальные */}
        <div className="lg:hidden space-y-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="PENDING">В процессе</option>
            <option value="SUCCESS">Успешные</option>
            <option value="ALL">Все заявки</option>
          </select>
          
          {/* Статистика */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 rounded p-2 text-center">
              <div className="font-semibold text-blue-700">{orders.length}</div>
              <div className="text-blue-600">Всего</div>
            </div>
            <div className="bg-yellow-50 rounded p-2 text-center">
              <div className="font-semibold text-yellow-700">
                {orders.filter(o => o.state === OrderStateEnum.PENDING).length}
              </div>
              <div className="text-yellow-600">В процессе</div>
            </div>
            <div className="bg-green-50 rounded p-2 text-center">
              <div className="font-semibold text-green-700">
                {orders.filter(o => o.state === OrderStateEnum.SUCCESS).length}
              </div>
              <div className="text-green-600">Успешно</div>
            </div>
          </div>
        </div>

        {/* Десктопные фильтры */}
        <div className="hidden lg:flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                filter === 'PENDING'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              В процессе
            </button>
            <button
              onClick={() => setFilter('SUCCESS')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                filter === 'SUCCESS'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Успешные
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                filter === 'ALL'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Все
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Найдено: {orders.length} заявок
          </div>
        </div>
      </div>

      {/* Список заявок */}
      <div className="space-y-3 sm:space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            {/* Заголовок карточки */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                  {truncateText(order.description, window.innerWidth < 640 ? 60 : 100)}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{order.initiator?.tg_username}</span>
                  <span>•</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1 ml-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(order.state)}`}>
                  {getStateDisplayName(order.state)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatAmount(order.amount, order.currency)}
                </span>
              </div>
            </div>

            {/* Файлы заявки */}
            {order.files && order.files.length > 0 && (
              <OrderFiles files={order.files} />
            )}

            {/* Прогресс для заявок в процессе */}
            {order.state === OrderStateEnum.PENDING && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">Прогресс проверки</span>
                  <span className="text-xs text-gray-500">
                    {order.step}/{order.level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(order.step / order.level) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Ответ проверяющего (если есть) */}
            {order.reply && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600 font-medium mb-1">Ответ проверяющего:</div>
                <div className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2">
                  {truncateText(order.reply, window.innerWidth < 640 ? 80 : 150)}
                </div>
              </div>
            )}

            {/* Детали заявки */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Уровень:</span>
                  <span className="ml-1 font-medium text-gray-700">{order.level}</span>
                </div>
                <div>
                  <span className="text-gray-500">Валюта:</span>
                  <span className="ml-1 font-medium text-gray-700">{order.currency}</span>
                </div>
                {order.state === OrderStateEnum.PENDING && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Текущий шаг:</span>
                    <span className="ml-1 font-medium text-gray-700">{order.step} из {order.level}</span>
                  </div>
                )}
                {order.files && order.files.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Файлов:</span>
                    <span className="ml-1 font-medium text-gray-700">{order.files.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Сообщение если заявок нет */}
      {orders.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm sm:text-base">Заявки не найдены</p>
          <p className="text-gray-400 text-xs mt-1">Попробуйте изменить фильтр</p>
        </div>
      )}

      {/* Кнопка обновления */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Обновить</span>
        </button>
      </div>

      {/* Информация о фильтре для мобильных */}
      <div className="lg:hidden mt-4 text-center">
        <p className="text-xs text-gray-500">
          Показано: {orders.length} заявок • Фильтр: {
            filter === 'PENDING' ? 'В процессе' :
            filter === 'SUCCESS' ? 'Успешные' : 'Все'
          }
        </p>
      </div>
    </div>
  );
}