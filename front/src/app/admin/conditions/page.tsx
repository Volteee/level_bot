// app/admin/conditions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { LevelConditions } from '@/types/config';

export default function ConditionsManagement() {
  const [conditions, setConditions] = useState<LevelConditions>({
    first_low: 0,
    first_high: 2000,
    second_low: 2000,
    second_high: 20000,
    third_low: 20000,
    third_high: 40000,
    forth_low: 40000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initData, setInitData] = useState('');

  useEffect(() => {
    if (window.Telegram !== undefined)
      setInitData(window.Telegram.WebApp.initData);
  }, []);

  useEffect(() => {
    if (initData !== '') fetchConditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData]);

  const fetchConditions = async () => {
    try {
      const response = await fetch('/api/admin/conditions', {
        headers: {
          'initData': initData,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conditions');
      const data = await response.json();
      setConditions(data);
    } catch (error) {
      console.error('Error fetching conditions:', error);
      alert('Не удалось загрузить настройки условий');
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (field: keyof LevelConditions, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    if (isNaN(numValue)) {
      setErrors(prev => ({ ...prev, [field]: 'Введите корректное число' }));
      return;
    }

    if (numValue < 0) {
      setErrors(prev => ({ ...prev, [field]: 'Значение не может быть отрицательным' }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    setConditions(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const validateConditions = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (conditions.first_low >= conditions.first_high) {
      newErrors.first_high = 'Верхняя граница должна быть больше нижней';
    }

    if (conditions.second_low >= conditions.second_high) {
      newErrors.second_high = 'Верхняя граница должна быть больше нижней';
    }

    if (conditions.third_low >= conditions.third_high) {
      newErrors.third_high = 'Верхняя граница должна быть больше нижней';
    }

    if (conditions.first_high !== conditions.second_low) {
      newErrors.second_low = 'Диапазоны должны быть непрерывными';
    }

    if (conditions.second_high !== conditions.third_low) {
      newErrors.third_low = 'Диапазоны должны быть непрерывными';
    }

    if (conditions.third_high !== conditions.forth_low) {
      newErrors.forth_low = 'Диапазоны должны быть непрерывными';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateConditions()) {
      alert('Исправьте ошибки в настройках перед сохранением');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/conditions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'initData': initData,
        },
        body: JSON.stringify({ conditions }),
      });

      if (response.ok) {
        alert('Условия успешно сохранены');
      } else {
        const error = await response.json();
        alert(`Ошибка при сохранении условий: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving conditions:', error);
      alert('Ошибка при сохранении условий');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchConditions();
    setErrors({});
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(num);
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Настройка условий для определения уровня по сумме
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Уровень
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Диапазон суммы
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Нижняя граница
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Верхняя граница
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Уровень 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Первый уровень</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  от {formatNumber(conditions.first_low)} до {formatNumber(conditions.first_high)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <input
                      type="number"
                      value={conditions.first_low}
                      onChange={(e) => handleConditionChange('first_low', e.target.value)}
                      className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.first_low ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                    {errors.first_low && (
                      <p className="absolute -bottom-6 left-0 text-xs text-red-500">{errors.first_low}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <input
                      type="number"
                      value={conditions.first_high}
                      onChange={(e) => handleConditionChange('first_high', e.target.value)}
                      className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.first_high ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                    {errors.first_high && (
                      <p className="absolute -bottom-6 left-0 text-xs text-red-500">{errors.first_high}</p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Уровень 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-semibold text-sm">2</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Второй уровень</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  от {formatNumber(conditions.second_low)} до {formatNumber(conditions.second_high)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <input
                      type="number"
                      value={conditions.second_low}
                      onChange={(e) => handleConditionChange('second_low', e.target.value)}
                      className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.second_low ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                    {errors.second_low && (
                      <p className="absolute -bottom-6 left-0 text-xs text-red-500">{errors.second_low}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <input
                      type="number"
                      value={conditions.second_high}
                      onChange={(e) => handleConditionChange('second_high', e.target.value)}
                      className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.second_high ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                    {errors.second_high && (
                      <p className="absolute -bottom-6 left-0 text-xs text-red-500">{errors.second_high}</p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Уровень 3 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 font-semibold text-sm">3</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Третий уровень</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  от {formatNumber(conditions.third_low)} до {formatNumber(conditions.third_high)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <input
                      type="number"
                      value={conditions.third_low}
                      onChange={(e) => handleConditionChange('third_low', e.target.value)}
                      className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.third_low ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                    {errors.third_low && (
                      <p className="absolute -bottom-6 left-0 text-xs text-red-500">{errors.third_low}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <input
                      type="number"
                      value={conditions.third_high}
                      onChange={(e) => handleConditionChange('third_high', e.target.value)}
                      className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.third_high ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                    {errors.third_high && (
                      <p className="absolute -bottom-6 left-0 text-xs text-red-500">{errors.third_high}</p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Уровень 4 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold text-sm">4</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Четвертый уровень</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  от {formatNumber(conditions.forth_low)} и выше
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <input
                      type="number"
                      value={conditions.forth_low}
                      onChange={(e) => handleConditionChange('forth_low', e.target.value)}
                      className={`w-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.forth_low ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                    {errors.forth_low && (
                      <p className="absolute -bottom-6 left-0 text-xs text-red-500">{errors.forth_low}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ∞
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          <div className="p-4 space-y-6">
            {/* Уровень 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Первый уровень</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Нижняя граница
                  </label>
                  <input
                    type="number"
                    value={conditions.first_low}
                    onChange={(e) => handleConditionChange('first_low', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_low ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.first_low && (
                    <p className="text-xs text-red-500 mt-1">{errors.first_low}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Верхняя граница
                  </label>
                  <input
                    type="number"
                    value={conditions.first_high}
                    onChange={(e) => handleConditionChange('first_high', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_high ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.first_high && (
                    <p className="text-xs text-red-500 mt-1">{errors.first_high}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Диапазон: от {formatNumber(conditions.first_low)} до {formatNumber(conditions.first_high)}
                </p>
              </div>
            </div>

            {/* Уровень 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Второй уровень</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Нижняя граница
                  </label>
                  <input
                    type="number"
                    value={conditions.second_low}
                    onChange={(e) => handleConditionChange('second_low', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.second_low ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.second_low && (
                    <p className="text-xs text-red-500 mt-1">{errors.second_low}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Верхняя граница
                  </label>
                  <input
                    type="number"
                    value={conditions.second_high}
                    onChange={(e) => handleConditionChange('second_high', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.second_high ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.second_high && (
                    <p className="text-xs text-red-500 mt-1">{errors.second_high}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Диапазон: от {formatNumber(conditions.second_low)} до {formatNumber(conditions.second_high)}
                </p>
              </div>
            </div>

            {/* Уровень 3 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600 font-semibold text-sm">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Третий уровень</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Нижняя граница
                  </label>
                  <input
                    type="number"
                    value={conditions.third_low}
                    onChange={(e) => handleConditionChange('third_low', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.third_low ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.third_low && (
                    <p className="text-xs text-red-500 mt-1">{errors.third_low}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Верхняя граница
                  </label>
                  <input
                    type="number"
                    value={conditions.third_high}
                    onChange={(e) => handleConditionChange('third_high', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.third_high ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.third_high && (
                    <p className="text-xs text-red-500 mt-1">{errors.third_high}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Диапазон: от {formatNumber(conditions.third_low)} до {formatNumber(conditions.third_high)}
                </p>
              </div>
            </div>

            {/* Уровень 4 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold text-sm">4</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Четвертый уровень</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Нижняя граница
                  </label>
                  <input
                    type="number"
                    value={conditions.forth_low}
                    onChange={(e) => handleConditionChange('forth_low', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.forth_low ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.forth_low && (
                    <p className="text-xs text-red-500 mt-1">{errors.forth_low}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Диапазон: от {formatNumber(conditions.forth_low)} и выше
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Сбросить изменения
        </button>
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(errors).length > 0}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Сохранение...
            </>
          ) : (
            'Сохранить условия'
          )}
        </button>
      </div>
    </div>
  );
}