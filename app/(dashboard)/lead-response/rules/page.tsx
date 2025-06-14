"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input"; // For form
import { Textarea } from "@/src/components/ui/textarea"; // For form
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"; // For status in form

import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon, // Could be used for "view details" if needed
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon, // For active status
  XCircleIcon, // For inactive status
  AdjustmentsHorizontalIcon // General rules icon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton"; // Main skeleton loader
import type { LeadResponseRule } from '@/app/api/lead-response/rules/route'; // Import type from API

// Helper function for date formatting
const formatDate = (dateString: string, locale: string = 'en') => {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const initialRuleFormData: Omit<LeadResponseRule, 'id' | 'createdAt' | 'lastModified'> = {
  name: '',
  trigger: '',
  actions: [''],
  status: 'inactive',
  priority: 0,
};

export default function LeadResponseRulesPage() {
  const { t, locale } = useTranslation();
  const [rules, setRules] = useState<LeadResponseRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<LeadResponseRule | null>(null);
  const [formData, setFormData] = useState(initialRuleFormData);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lead-response/rules");
      if (!response.ok) throw new Error(t('leadResponse.rulesPage.error.fetchFailed'));
      const apiResponse = await response.json();
      setRules(apiResponse.data || []); // Assuming API wraps in { data: ... }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(t('leadResponse.rulesPage.error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: 'active' | 'inactive') => {
    setFormData(prev => ({ ...prev, status: value }));
  };
  
  const handleActionChange = (index: number, value: string) => {
    const newActions = [...formData.actions];
    newActions[index] = value;
    setFormData(prev => ({ ...prev, actions: newActions }));
  };

  const addActionField = () => {
    setFormData(prev => ({ ...prev, actions: [...prev.actions, ''] }));
  };
  
  const removeActionField = (index: number) => {
    const newActions = formData.actions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, actions: newActions }));
  };


  const handleCreateOrUpdateRule = async () => {
    const method = currentRule ? 'PUT' : 'POST';
    const url = '/api/lead-response/rules';
    const body = currentRule ? JSON.stringify({ ...formData, id: currentRule.id }) : JSON.stringify(formData);

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${currentRule ? 'update' : 'create'} rule`);
      }
      await fetchRules(); // Refetch to update list
      setIsFormDialogOpen(false);
    } catch (err) {
      if (err instanceof Error) setError(err.message); // Show error to user
      else setError(t('leadResponse.rulesPage.error.formSubmitFailed'));
    }
  };

  const openNewRuleDialog = () => {
    setCurrentRule(null);
    setFormData(initialRuleFormData);
    setIsFormDialogOpen(true);
  };

  const openEditRuleDialog = (rule: LeadResponseRule) => {
    setCurrentRule(rule);
    setFormData({
        name: rule.name,
        trigger: rule.trigger,
        actions: rule.actions,
        status: rule.status,
        priority: rule.priority || 0
    });
    setIsFormDialogOpen(true);
  };
  
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm(t('leadResponse.rulesPage.confirmDelete'))) return;
    try {
      const response = await fetch(`/api/lead-response/rules?id=${ruleId}`, { method: 'DELETE' });
      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || t('leadResponse.rulesPage.error.deleteFailed'));
      }
      await fetchRules();
    } catch (err) {
       if (err instanceof Error) setError(err.message);
       else setError(t('leadResponse.rulesPage.error.deleteFailed'));
    }
  };

  const toggleRuleStatus = async (rule: LeadResponseRule) => {
    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
    try {
        const response = await fetch('/api/lead-response/rules', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...rule, status: newStatus })
        });
        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || t('leadResponse.rulesPage.error.statusUpdateFailed'));
        }
        await fetchRules();
    } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError(t('leadResponse.rulesPage.error.statusUpdateFailed'));
    }
  };


  if (isLoading && rules.length === 0) {
     // Uses loading.tsx for initial route load, this is for subsequent loads.
    return (
        <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div><LoadingSkeleton width="300px" height="36px" className="mb-2" /><LoadingSkeleton width="350px" height="20px" /></div>
                <LoadingSkeleton width="180px" height="40px" />
            </div>
            <Card className="bg-white border-none shadow-sm"><CardContent><LoadingSkeleton height="300px" /></CardContent></Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('leadResponse.rulesPage.title')}</h1>
          <p className="text-gray-500 mt-1">{t('leadResponse.rulesPage.subtitle')}</p>
        </div>
        <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2" onClick={openNewRuleDialog}>
          <PlusCircleIcon className="w-5 h-5" />
          {t('leadResponse.rulesPage.createNewRule')}
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200 shadow-sm mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-red-700 font-semibold">{t('leadResponse.rulesPage.error.title')}</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {/* Rules Table Card */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <AdjustmentsHorizontalIcon className="w-6 h-6 mr-2 text-blue-600" /> {t('leadResponse.rulesPage.tableTitle')}
          </CardTitle>
          <CardDescription>{t('leadResponse.rulesPage.tableDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 && !isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">{t('leadResponse.rulesPage.noRules')}</p>
              <Button className="bg-[#1B1F3B] text-white hover:bg-[#2A3050]" onClick={openNewRuleDialog}>
                <PlusCircleIcon className="w-5 h-5 mr-2" />{t('leadResponse.rulesPage.createNewRule')}
              </Button>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('leadResponse.rulesPage.tableHeaders.name')}</TableHead>
                  <TableHead>{t('leadResponse.rulesPage.tableHeaders.trigger')}</TableHead>
                  <TableHead>{t('leadResponse.rulesPage.tableHeaders.actions')}</TableHead>
                  <TableHead>{t('leadResponse.rulesPage.tableHeaders.status')}</TableHead>
                  <TableHead>{t('leadResponse.rulesPage.tableHeaders.lastModified')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800">{rule.name}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={rule.trigger}>{rule.trigger}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                        <ul className="list-disc list-inside">
                            {rule.actions.slice(0,2).map((action, i) => <li key={i} className="truncate" title={action}>{action}</li>)}
                            {rule.actions.length > 2 && <li className="text-xs text-gray-400">...and {rule.actions.length - 2} more</li>}
                        </ul>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => toggleRuleStatus(rule)} className={`text-xs h-7 px-2 py-0.5 rounded-full flex items-center ${rule.status === 'active' ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>
                        {rule.status === 'active' ? <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> : <XCircleIcon className="w-3.5 h-3.5 mr-1" />}
                        {t(`leadResponse.rulesPage.status.${rule.status}`)}
                      </Button>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDate(rule.lastModified, locale)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" title={t('common.edit') as string} onClick={() => openEditRuleDialog(rule)}>
                          <PencilSquareIcon className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" title={t('common.delete') as string} onClick={() => handleDeleteRule(rule.id)}>
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Rule Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogContent className="sm:max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle>{currentRule ? t('leadResponse.rulesPage.editRuleTitle') : t('leadResponse.rulesPage.createRuleTitle')}</DialogTitle>
                    <DialogDescription>{currentRule ? t('leadResponse.rulesPage.editRuleDescription') : t('leadResponse.rulesPage.createRuleDescription')}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('leadResponse.rulesPage.form.nameLabel')}</label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('leadResponse.rulesPage.form.namePlaceholder') as string} className="border-gray-300"/>
                    </div>
                    <div>
                        <label htmlFor="trigger" className="block text-sm font-medium text-gray-700 mb-1">{t('leadResponse.rulesPage.form.triggerLabel')}</label>
                        <Textarea id="trigger" name="trigger" value={formData.trigger} onChange={handleInputChange} placeholder={t('leadResponse.rulesPage.form.triggerPlaceholder') as string} className="border-gray-300"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('leadResponse.rulesPage.form.actionsLabel')}</label>
                        {formData.actions.map((action, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <Input 
                                    value={action} 
                                    onChange={(e) => handleActionChange(index, e.target.value)} 
                                    placeholder={`${t('leadResponse.rulesPage.form.actionPlaceholder')} #${index + 1}`}
                                    className="border-gray-300 flex-grow"
                                />
                                {formData.actions.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeActionField(index)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                                        <TrashIcon className="w-4 h-4"/>
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addActionField} className="text-xs border-gray-300 text-gray-700 hover:bg-gray-100">
                            <PlusCircleIcon className="w-4 h-4 mr-1"/> {t('leadResponse.rulesPage.form.addAction')}
                        </Button>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">{t('leadResponse.rulesPage.form.statusLabel')}</label>
                        <Select name="status" value={formData.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-full border-gray-300"><SelectValue placeholder={t('leadResponse.rulesPage.form.statusPlaceholder')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">{t('leadResponse.rulesPage.status.active')}</SelectItem>
                                <SelectItem value="inactive">{t('leadResponse.rulesPage.status.inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">{t('leadResponse.rulesPage.form.priorityLabel')}</label>
                        <Input id="priority" name="priority" type="number" value={formData.priority} onChange={handleInputChange} placeholder={t('leadResponse.rulesPage.form.priorityPlaceholder') as string} className="border-gray-300"/>
                    </div>
                </div>
                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleCreateOrUpdateRule} className="bg-[#1B1F3B] text-white hover:bg-[#2A3050]">{currentRule ? t('common.saveChanges') : t('common.create')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
