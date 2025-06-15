"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/src/i18n/config.client';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { ListChecks, CheckCircle2, AlertOctagon, PlusCircle, Filter, Edit2 } from 'lucide-react'; // Added Edit2 for table actions

interface ReEngagementTask {
  id: string;
  description: string;
  leadName?: string;
  assignedTo?: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
}

const ReEngagementTasksPage = () => {
  const { t } = useTranslation('reengagementTasksPage');

  const tasks: ReEngagementTask[] = [
    { id: 'task_001', description: 'Draft personalized email for Cold Lead Segment A', leadName: 'Segment A', assignedTo: 'Marketing Team', dueDate: '2023-11-10', status: 'Completed', priority: 'High' },
    { id: 'task_002', description: 'Follow-up call with Jane Doe (Warm Lead)', leadName: 'Jane Doe', assignedTo: 'Sales Rep Alice', dueDate: '2023-11-12', status: 'Open', priority: 'High' },
    { id: 'task_003', description: 'Review engagement metrics for Campaign X', leadName: 'Campaign X', assignedTo: 'Analyst Bob', dueDate: '2023-11-14', status: 'In Progress', priority: 'Medium' },
    { id: 'task_004', description: 'Send special offer to recently re-engaged leads', leadName: 'Re-engaged Group 1', assignedTo: 'Marketing Automation', dueDate: '2023-11-08', status: 'Overdue', priority: 'Medium' },
    { id: 'task_005', description: 'Prepare content for new re-engagement sequence', assignedTo: 'Content Team', dueDate: '2023-11-20', status: 'Open', priority: 'Low' },
  ];

  const openTasks = tasks.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const completedToday = tasks.filter(t => t.status === 'Completed' && t.dueDate === new Date().toISOString().split('T')[0]).length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;

  const getStatusBadgeStyle = (status: ReEngagementTask['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Open': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityTextStyle = (priority: ReEngagementTask['priority']) => {
    switch (priority) {
      case 'High': return 'text-red-600 font-semibold';
      case 'Medium': return 'text-amber-600 font-semibold';
      case 'Low': return 'text-green-600 font-semibold';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader 
        title={t('header.title')} 
        subtitle={t('header.subtitle')} 
      />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard 
            title={t('metrics.openTasks.title')} 
            value={openTasks} 
            icon={<ListChecks size={24} className="text-blue-500" />} 
            change={t('metrics.openTasks.change')} 
            changeColor="text-green-600" 
          />
          <QualityMetricCard 
            title={t('metrics.completedToday.title')} 
            value={completedToday} 
            icon={<CheckCircle2 size={24} className="text-green-500" />} 
          />
          <QualityMetricCard 
            title={t('metrics.overdueTasks.title')} 
            value={overdueTasks} 
            icon={<AlertOctagon size={24} className="text-red-500" />} 
            change={t('metrics.overdueTasks.change', { count: overdueTasks })} 
            changeColor="text-red-600"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1B1F3B] mb-3 sm:mb-0">{t('taskList.title')}</h2>
            <div className="flex items-center space-x-3">
                <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-lg flex items-center text-sm transition-colors">
                    <Filter size={16} className="mr-2" /> {t('taskList.buttons.filter')}
                </button>
                <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-2 px-4 rounded-lg flex items-center text-sm transition-colors">
                    <PlusCircle size={16} className="mr-2" /> {t('taskList.buttons.createNew')}
                </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('taskList.table.headers.description')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('taskList.table.headers.leadSegment')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('taskList.table.headers.assignedTo')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('taskList.table.headers.dueDate')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('taskList.table.headers.priority')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('taskList.table.headers.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('taskList.table.headers.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{task.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{task.leadName || t('taskList.table.body.notApplicable')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{task.assignedTo || t('taskList.table.body.unassigned')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{task.dueDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <span className={getPriorityTextStyle(task.priority)}>{t(`taskList.priority.${task.priority.toLowerCase()}`)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(task.status)}`}>
                        {t(`taskList.status.${task.status.toLowerCase().replace(' ', '')}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"><Edit2 size={16} /></button>
                      <button className="text-green-600 hover:text-green-800 transition-colors"><CheckCircle2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tasks.length === 0 && <p className="text-center py-4 text-gray-500">{t('taskList.emptyMessage')}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReEngagementTasksPage;
