"use client"; // For potential future interactivity and state management

import React, { useState } from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Settings2, PlusCircle, Save, UploadCloud, MousePointer, Mail, Tag, Clock, GitFork, Move, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Mock types for funnel elements
interface FunnelStep {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition';
  icon: React.ReactNode;
  properties?: Record<string, any>; // e.g., { emailTemplate: 'welcome_email' }
}

// Placeholder for FileText if not in lucide-react default, or use another icon
const FileText = ({className}: {className?:string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;


const availableSteps: FunnelStep[] = [
  { id: 'fs_trigger_form', name: 'Form Submitted', type: 'trigger', icon: <FileText size={18} className="mr-2" /> },
  { id: 'fs_trigger_tag', name: 'Tag Added', type: 'trigger', icon: <Tag size={18} className="mr-2" /> },
  { id: 'fs_action_email', name: 'Send Email', type: 'action', icon: <Mail size={18} className="mr-2" /> },
  { id: 'fs_action_add_tag', name: 'Add Tag', type: 'action', icon: <Tag size={18} className="mr-2" /> },
  { id: 'fs_action_wait', name: 'Wait Period', type: 'action', icon: <Clock size={18} className="mr-2" /> },
  { id: 'fs_condition_opened', name: 'Email Opened?', type: 'condition', icon: <GitFork size={18} className="mr-2" /> },
];


const FunnelBuilderPage = () => {
  const { t } = useTranslation('funnelBuilderPage');
  const [currentFunnelName, setCurrentFunnelName] = useState<string>("New Untitled Funnel");
  const [selectedStep, setSelectedStep] = useState<FunnelStep | null>(null);
  // Mocked steps on canvas
  const [canvasSteps, setCanvasSteps] = useState<Array<FunnelStep & { x: number; y: number }>>([
    { ...availableSteps[0], id: 'inst_1', x: 50, y: 50, name: "Trial Signup Form" },
    { ...availableSteps[2], id: 'inst_2', x: 50, y: 150, name: "Welcome Email" },
  ]);


  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />

      <div className="flex-grow p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left Panel: Available Steps */}
        <div className="lg:w-1/4 xl:w-1/5 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full overflow-y-auto">
          <h3 className="text-lg font-semibold text-[#1B1F3B] mb-3">Funnel Elements</h3>
          <div className="space-y-2">
            {availableSteps.map(step => (
              <div key={step.id}
                   className="p-3 border border-gray-200 rounded-md hover:bg-gray-100 hover:shadow-sm cursor-grab transition-all flex items-center text-sm text-gray-700"
                   onClick={() => setSelectedStep(step)} // Simulate adding/selecting
                   draggable // Basic draggable attribute for visual cue
                   onDragStart={(e) => e.dataTransfer.setData("text/plain", step.id)} // Basic drag data
              >
                {step.icon} {step.name}
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: Funnel Canvas */}
        <div className="flex-grow bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative h-[600px] lg:h-auto overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={currentFunnelName}
              onChange={(e) => setCurrentFunnelName(e.target.value)}
              className="text-xl font-semibold text-[#1B1F3B] border-b-2 border-transparent focus:border-[#3C4568] focus:outline-none py-1"
              placeholder={t('input.placeholder')}
            />
            <div className="flex space-x-2">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-md text-xs flex items-center">
                <UploadCloud size={14} className="mr-1.5"/> {t('buttons.load')}
              </button>
              <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-2 px-3 rounded-md text-xs flex items-center">
                <Save size={14} className="mr-1.5"/> {t('buttons.save')}
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-xs flex items-center">
                <PlusCircle size={14} className="mr-1.5"/> {t('buttons.new')}
              </button>
            </div>
          </div>
          {/* Mock Canvas Area - In a real app, this would be interactive (e.g., react-flow) */}
          <div className="bg-slate-100/50 h-[calc(100%-60px)] rounded-md border border-dashed border-gray-300 relative overflow-auto"
               onDrop={(e) => { /* Basic drop simulation */ e.preventDefault(); const stepId = e.dataTransfer.getData("text/plain"); const step = availableSteps.find(s => s.id === stepId); if(step) { setCanvasSteps(prev => [...prev, {...step, id: `inst_${Date.now()}`, x: e.clientX % 300, y: e.clientY % 300}]);}}}
               onDragOver={(e) => e.preventDefault()} // Necessary for onDrop to work
          >
            {canvasSteps.map(step => (
                 <div key={step.id}
                      className={`absolute p-3 bg-white rounded-md shadow-md border border-gray-300 cursor-move hover:shadow-lg ${selectedStep?.id === step.id ? 'ring-2 ring-[#3C4568]' : ''}`}
                      style={{left: step.x, top: step.y, minWidth: '150px'}}
                      onClick={() => setSelectedStep(step)}
                 >
                    <div className="flex items-center text-sm font-medium text-gray-800"> {step.icon} {step.name}</div>
                    {/* Placeholder for connections/outputs */}
                 </div>
            ))}
            {canvasSteps.length === 0 && <p className="text-center text-gray-400 p-10">Drag elements from the left panel to build your funnel.</p>}
          </div>
        </div>

        {/* Right Panel: Properties / Selected Step Details */}
        <div className="lg:w-1/4 xl:w-1/5 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full overflow-y-auto">
          <h3 className="text-lg font-semibold text-[#1B1F3B] mb-3">Properties</h3>
          {selectedStep ? (
            <div>
              <p className="text-sm text-gray-600 mb-1">Selected: <span className="font-medium text-gray-800">{selectedStep.name}</span></p>
              <p className="text-xs text-gray-500 mb-3">Type: {selectedStep.type}</p>
              {/* Mock properties form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-0.5">Step Name</label>
                  <input type="text" defaultValue={selectedStep.name} className="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                {selectedStep.type === 'action' && selectedStep.id === 'fs_action_email' && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-0.5">Email Template ID</label>
                    <input type="text" placeholder="e.g., welcome_tpl_01" className="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                )}
                 {selectedStep.type === 'action' && selectedStep.id === 'fs_action_wait' && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-0.5">Wait Duration (days)</label>
                    <input type="number" defaultValue="1" className="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                )}
                <button className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-3 rounded-md text-xs flex items-center mt-4"><Trash2 size={14} className="mr-1.5"/> Remove Step</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Select a step on the canvas or drag a new element to see its properties.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunnelBuilderPage;
