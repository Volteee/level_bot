// app/admin/relations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, Relation } from '@/types/user';

export default function RelationsManagement() {
  const [relations, setRelations] = useState<Relation[]>([]);
  const [initiators, setInitiators] = useState<User[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedInitiator, setExpandedInitiator] = useState<string | null>(null);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    setInitData(window.Telegram.WebApp.initData);
  }, []);

  useEffect(() => {
    if (initData !== '') fetchData();
  }, [initData]);

  const fetchData = async () => {
    try {
      const [relationsRes, usersRes] = await Promise.all([
        fetch('/api/admin/relations', {
          headers: {
          'initData': initData,
        },
        }),
        fetch('/api/admin/users', {
          headers: {
          'initData': initData,
        },
        })
      ]);
      
      if (!relationsRes.ok || !usersRes.ok) throw new Error('Failed to fetch data');
      
      const relationsData = await relationsRes.json();
      const usersData = await usersRes.json();
      
      setRelations(relationsData);
      setInitiators(usersData.filter((user: User) => user.role === 'INITIATOR'));
      setInspectors(usersData.filter((user: User) => user.role === 'INSPECTOR'));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const updateRelationInspector = (
    initiatorId: string, 
    inspectorField: keyof Pick<Relation, 'first_inspector_id' | 'second_inspector_id' | 'third_inspector_id' | 'forth_inspector_id'>, 
    inspectorId: string | null
  ) => {
    setRelations(prev => {
      const existingRelationIndex = prev.findIndex(r => r.initiator_id === initiatorId);
      
      if (existingRelationIndex >= 0) {
        const updated = [...prev];
        updated[existingRelationIndex] = {
          ...updated[existingRelationIndex],
          [inspectorField]: inspectorId
        };
        return updated;
      } else {
        const newRelation: Relation = {
          initiator_id: initiatorId,
          first_inspector_id: null,
          second_inspector_id: null,
          third_inspector_id: null,
          forth_inspector_id: null,
          [inspectorField]: inspectorId
        };
        return [...prev, newRelation];
      }
    });
  };

  const getRelationForInitiator = (initiatorId: string): Relation | undefined => {
    return relations.find(r => r.initiator_id === initiatorId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/relations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'initData': initData,
        },
        body: JSON.stringify({ relations }),
      });

      if (response.ok) {
        alert('Назначения успешно сохранены');
        await fetchData(); // Обновляем данные
      } else {
        const error = await response.json();
        alert(`Ошибка при сохранении назначений: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving relations:', error);
      alert('Ошибка при сохранении назначений');
    } finally {
      setSaving(false);
    }
  };

  const toggleInitiator = (initiatorId: string) => {
    setExpandedInitiator(expandedInitiator === initiatorId ? null : initiatorId);
  };

  const getInspectorName = (inspectorId: string | null): string => {
    if (!inspectorId) return 'Не назначен';
    const inspector = inspectors.find(i => i.id === inspectorId);
    return inspector ? inspector.tg_username : 'Не назначен';
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
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">
        Назначение проверяющих инициаторам
      </h1>
      
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Инициатор
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Проверяющий 1
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Проверяющий 2
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Проверяющий 3
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Проверяющий 4
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initiators.map((initiator) => {
              const relation = getRelationForInitiator(initiator.id);
              
              return (
                <tr key={initiator.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {initiator.tg_username}
                    </div>
                  </td>
                  {[
                    { field: 'first_inspector_id', label: '1' },
                    { field: 'second_inspector_id', label: '2' },
                    { field: 'third_inspector_id', label: '3' },
                    { field: 'forth_inspector_id', label: '4' }
                  ].map(({ field, label }) => {
                    const inspectorField = field as keyof Pick<
                      Relation, 
                      'first_inspector_id' | 'second_inspector_id' | 'third_inspector_id' | 'forth_inspector_id'
                    >;
                    const currentInspectorId = relation?.[inspectorField] || null;
                    
                    return (
                      <td key={field} className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <select
                          value={currentInspectorId || ''}
                          onChange={(e) => updateRelationInspector(
                            initiator.id, 
                            inspectorField, 
                            e.target.value || null
                          )}
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Не назначен</option>
                          {inspectors.map((inspector) => (
                            <option key={inspector.id} value={inspector.id}>
                              {inspector.tg_username}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {initiators.map((initiator) => {
          const relation = getRelationForInitiator(initiator.id);
          const isExpanded = expandedInitiator === initiator.id;

          return (
            <div key={initiator.id} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleInitiator(initiator.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {initiator.tg_username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{initiator.tg_username}</h3>
                    <p className="text-sm text-gray-500">
                      {isExpanded ? 'Нажмите чтобы скрыть' : 'Нажмите чтобы настроить'}
                    </p>
                  </div>
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {[
                    { field: 'first_inspector_id', label: 'Проверяющий 1', level: '1' },
                    { field: 'second_inspector_id', label: 'Проверяющий 2', level: '2' },
                    { field: 'third_inspector_id', label: 'Проверяющий 3', level: '3' },
                    { field: 'forth_inspector_id', label: 'Проверяющий 4', level: '4' }
                  ].map(({ field, label, level }) => {
                    const inspectorField = field as keyof Pick<
                      Relation, 
                      'first_inspector_id' | 'second_inspector_id' | 'third_inspector_id' | 'forth_inspector_id'
                    >;
                    const currentInspectorId = relation?.[inspectorField] || null;
                    const currentInspectorName = getInspectorName(currentInspectorId);

                    return (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <select
                              value={currentInspectorId || ''}
                              onChange={(e) => updateRelationInspector(
                                initiator.id, 
                                inspectorField, 
                                e.target.value || null
                              )}
                              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="">Не назначен</option>
                              {inspectors.map((inspector) => (
                                <option key={inspector.id} value={inspector.id}>
                                  {inspector.tg_username}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">
                              {level}
                            </span>
                          </div>
                        </div>
                        {currentInspectorId && (
                          <p className="text-xs text-gray-500 pl-1">
                            Текущий: {currentInspectorName}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Инициатор
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Уровень 1-2
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Уровень 3-4
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initiators.map((initiator) => {
                const relation = getRelationForInitiator(initiator.id);
                
                return (
                  <tr key={initiator.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {initiator.tg_username}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 space-y-2">
                      {[1, 2].map((level) => {
                        const field = `level${level}_inspector_id` as keyof Pick<
                          Relation, 
                          'first_inspector_id' | 'second_inspector_id'
                        >;
                        const currentInspectorId = relation?.[field] || null;
                        
                        return (
                          <div key={level} className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-6">#{level}</span>
                            <select
                              value={currentInspectorId || ''}
                              onChange={(e) => updateRelationInspector(
                                initiator.id, 
                                field, 
                                e.target.value || null
                              )}
                              className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Не назначен</option>
                              {inspectors.map((inspector) => (
                                <option key={inspector.id} value={inspector.id}>
                                  {inspector.tg_username}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </td>
                    
                    <td className="px-4 py-4 space-y-2">
                      {[3, 4].map((level) => {
                        const field = `level${level}_inspector_id` as keyof Pick<
                          Relation, 
                          'third_inspector_id' | 'forth_inspector_id'
                        >;
                        const currentInspectorId = relation?.[field] || null;
                        
                        return (
                          <div key={level} className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-6">#{level}</span>
                            <select
                              value={currentInspectorId || ''}
                              onChange={(e) => updateRelationInspector(
                                initiator.id, 
                                field, 
                                e.target.value || null
                              )}
                              className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Не назначен</option>
                              {inspectors.map((inspector) => (
                                <option key={inspector.id} value={inspector.id}>
                                  {inspector.tg_username}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end px-2 sm:px-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Сохранение...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Сохранить назначения</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}