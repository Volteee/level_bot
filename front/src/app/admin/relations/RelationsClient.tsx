// app/admin/relations/RelationsClient.tsx
'use client';

import { useState } from 'react';
import { User, Relation } from '@/types/user';

interface RelationsClientProps {
  initialRelations: Relation[];
  initialInitiators: User[];
  initialInspectors: User[];
}

export default function RelationsClient({ 
  initialRelations, 
  initialInitiators, 
  initialInspectors 
}: RelationsClientProps) {
  const [relations, setRelations] = useState<Relation[]>(initialRelations);
  const [initiators] = useState<User[]>(initialInitiators);
  const [inspectors] = useState<User[]>(initialInspectors);
  const [saving, setSaving] = useState(false);
  const [expandedInitiator, setExpandedInitiator] = useState<string | null>(null);

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
        },
        body: JSON.stringify({ 'relations': relations, 'initData': window.Telegram.WebApp.initData }),
      });

      if (response.ok) {
        alert('Назначения успешно сохранены');
        const updatedResponse = await fetch('/api/admin/relations');
        const updatedRelations = await updatedResponse.json();
        setRelations(updatedRelations);
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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">
        Назначение проверяющих инициаторам
      </h1>
      
      {/* Desktop Table (скрыт на мобильных) */}
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

      {/* Mobile Cards (показывается на мобильных) */}
      <div className="lg:hidden space-y-4">
        {initiators.map((initiator) => {
          const relation = getRelationForInitiator(initiator.id);
          const isExpanded = expandedInitiator === initiator.id;

          return (
            <div key={initiator.id} className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Header */}
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

              {/* Expandable Content */}
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

      {/* Tablet View (промежуточный размер) */}
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
                    
                    {/* Уровни 1-2 */}
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
                    
                    {/* Уровни 3-4 */}
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

      {/* Кнопка сохранения */}
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

      {/* Статистика */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 px-2 sm:px-0">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{initiators.length}</div>
          <div className="text-sm text-blue-800">Инициаторов</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{inspectors.length}</div>
          <div className="text-sm text-green-800">Проверяющих</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {relations.filter(r => r.first_inspector_id || r.second_inspector_id || r.third_inspector_id || r.forth_inspector_id).length}
          </div>
          <div className="text-sm text-purple-800">Назначений</div>
        </div>
      </div>
    </div>
  );
}