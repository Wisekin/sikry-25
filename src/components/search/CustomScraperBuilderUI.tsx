import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  Active,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Trash2Icon, PlusCircleIcon, EyeIcon, CodeIcon, SaveIcon, FolderOpenIcon, HelpCircleIcon, Loader2, GripVerticalIcon, PackageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';

export interface ScraperFieldConfig {
  id: string;
  fieldName: string;
  cssSelector: string;
  type: 'text' | 'attribute' | 'html' | 'link';
  attributeName?: string;
}

export interface FullScraperConfig {
  id?: string;
  name: string;
  targetUrl: string;
  fields: ScraperFieldConfig[];
  description?: string;
}

const initialField: Omit<ScraperFieldConfig, 'id'> = {
  fieldName: '', cssSelector: '', type: 'text', attributeName: ''
};

export function CustomScraperBuilderUI() {
  const { t } = useTranslation('searchPage');
  const [config, setConfig] = useState<FullScraperConfig>({
    name: t('customScraperBuilder.newScraperName', 'New Scraper'), // Default name translated
    targetUrl: '',
    fields: [{...initialField, id: crypto.randomUUID()}],
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [activeDragItem, setActiveDragItem] = useState<Active | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateField = (index: number, updatedField: Partial<ScraperFieldConfig>) => {
    const newFields = [...config.fields];
    newFields[index] = { ...newFields[index], ...updatedField };
    setConfig(prev => ({ ...prev, fields: newFields }));
  };

  const addField = () => {
    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, {...initialField, id: crypto.randomUUID()}],
    }));
  };

  const removeField = (index: number) => {
    const newFields = config.fields.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, fields: newFields }));
  };

  const handleLoadUrlPreview = () => {
    if (config.targetUrl && (config.targetUrl.startsWith('http://') || config.targetUrl.startsWith('https://'))) {
        setIsLoadingPreview(true);
        setPreviewUrl(config.targetUrl);
    } else {
        toast({ title: t('customScraperBuilder.toastInvalidUrlTitle'), description: t('customScraperBuilder.toastInvalidUrlDescription'), variant: "destructive"});
        setPreviewUrl('');
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    // console.log("Saving config:", config); // Keep for debugging if needed
    await new Promise(resolve => setTimeout(resolve, 1500)); // Mock save
    setIsSaving(false);
    toast({ title: t('customScraperBuilder.toastConfigSavedTitle'), description: t('customScraperBuilder.toastConfigSavedDescription', { configName: config.name }) });
  };

  const handleLoadConfig = () => {
    const mockLoadedConfig: FullScraperConfig = {
        id: 'loaded-config-123',
        name: t('customScraperBuilder.loadedExampleName', 'Loaded Example Scraper'),
        targetUrl: 'https://example.com/products',
        fields: [
            { id: crypto.randomUUID(), fieldName: 'productName', cssSelector: 'h1.product-title', type: 'text'},
            { id: crypto.randomUUID(), fieldName: 'price', cssSelector: '.price-tag', type: 'text'},
            { id: crypto.randomUUID(), fieldName: 'imageUrl', cssSelector: 'img.product-image', type: 'attribute', attributeName: 'src'},
        ],
        description: t('customScraperBuilder.loadedExampleDescription', "This is a loaded example.")
    };
    setConfig(mockLoadedConfig);
    setPreviewUrl(mockLoadedConfig.targetUrl);
    toast({ title: t('customScraperBuilder.toastConfigLoadedTitle'), description: t('customScraperBuilder.toastConfigLoadedDescription', { configName: mockLoadedConfig.name }) });
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (active.data.current?.type === 'field' && over.data.current?.type === 'fieldContainer') {
         setConfig((prevConfig) => {
          const oldIndex = prevConfig.fields.findIndex(f => f.id === active.id);
          let newIndex = prevConfig.fields.length -1;
          const overIsField = prevConfig.fields.find(f => f.id === over.id);
          if (overIsField) {
            newIndex = prevConfig.fields.findIndex(f => f.id === over.id);
          }
          return { ...prevConfig, fields: arrayMove(prevConfig.fields, oldIndex, newIndex) };
        });
        return;
      }
      if (active.data.current?.type === 'paletteItem' && over.data.current?.type === 'fieldContainer') {
        const fieldType = active.data.current?.fieldType as ScraperFieldConfig['type'];
        const fieldNameKey = `customScraperBuilder.palette${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}Field`;
        let newField: ScraperFieldConfig = {
            id: crypto.randomUUID(),
            fieldName: t(fieldNameKey, `New ${fieldType} Field`), // Default field name
            cssSelector: '',
            type: fieldType,
        };
        if (fieldType === 'attribute') {
            newField.attributeName = '';
        }
        setConfig(prev => ({ ...prev, fields: [...prev.fields, newField] }));
      }
    }
  };
  
  const handleDragStart = (event: DragEndEvent) => { // DragEndEvent is used for active in examples, might be DragStartEvent
    setActiveDragItem(event.active);
  };

  const predefinedFieldTypes: { nameKey: string; type: ScraperFieldConfig['type'] }[] = [
    { nameKey: 'customScraperBuilder.paletteTextField', type: 'text' },
    { nameKey: 'customScraperBuilder.paletteAttributeField', type: 'attribute' },
    { nameKey: 'customScraperBuilder.paletteHtmlContent', type: 'html' },
    { nameKey: 'customScraperBuilder.paletteLinkUrl', type: 'link' },
  ];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart as any} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragItem(null)}>
    <TooltipProvider>
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-100px)] max-h-full">
      <Card className="w-full lg:w-1/4 xl:w-1/5 flex flex-col max-h-full">
        <CardHeader>
          <CardTitle>{t('customScraperBuilder.paletteTitle')}</CardTitle>
          <CardDescription>{t('customScraperBuilder.paletteDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 flex-grow overflow-y-auto">
          {predefinedFieldTypes.map(pf => (
            <DraggablePaletteItem key={pf.type} id={`palette-${pf.type}`} fieldName={t(pf.nameKey)} fieldType={pf.type} />
          ))}
        </CardContent>
      </Card>

      <Card className="w-full lg:w-1/3 xl:w-2/5 flex flex-col max-h-full">
        <CardHeader>
          <CardTitle>{t('customScraperBuilder.configTitle')}</CardTitle>
          <CardDescription>{t('customScraperBuilder.configDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow overflow-y-auto">
          <div>
            <Label htmlFor="scraperName">{t('customScraperBuilder.labelScraperName')}</Label>
            <Input id="scraperName" value={config.name} onChange={e => setConfig(p => ({...p, name: e.target.value}))} placeholder={t('customScraperBuilder.placeholderScraperName')} />
          </div>
          <div>
            <Label htmlFor="targetUrl">{t('customScraperBuilder.labelTargetUrl')}</Label>
            <div className="flex gap-2">
              <Input id="targetUrl" value={config.targetUrl} onChange={e => setConfig(p => ({...p, targetUrl: e.target.value}))} placeholder={t('customScraperBuilder.placeholderTargetUrl')} />
              <Button variant="outline" size="icon" onClick={handleLoadUrlPreview} aria-label={t('customScraperBuilder.buttonLoadUrlPreview')}>
                <EyeIcon className="h-4 w-4"/>
              </Button>
            </div>
          </div>
          <div>
            <Label>{t('customScraperBuilder.labelFieldsToExtract')}</Label>
            <SortableContext items={config.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div id="fields-container" className="space-y-3 min-h-[100px] max-h-96 overflow-y-auto border p-2 rounded-md bg-slate-50 dark:bg-slate-800/50">
                {config.fields.map((field, index) => (
                  <SortableFieldItem key={field.id} id={field.id} field={field} index={index} updateField={updateField} removeField={removeField} />
                ))}
                {config.fields.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-slate-500 py-8">
                        <p>{t('customScraperBuilder.emptyFields')}</p>
                    </div>
                )}
              </div>
            </SortableContext>
            <Button variant="outline" onClick={addField} className="mt-2 w-full">
              <PlusCircleIcon className="mr-2 h-4 w-4" /> {t('customScraperBuilder.buttonAddFieldManually')}
            </Button>
          </div>
           <div>
                <Label htmlFor="scraperDescription">{t('customScraperBuilder.labelDescription')}</Label>
                <Textarea id="scraperDescription" value={config.description || ''} onChange={e => setConfig(p => ({...p, description: e.target.value}))} placeholder={t('customScraperBuilder.placeholderDescription')}/>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex-col sm:flex-row gap-2">
            <Button onClick={handleLoadConfig} variant="outline" className="w-full sm:w-auto">
                <FolderOpenIcon className="mr-2 h-4 w-4"/> {t('customScraperBuilder.buttonLoadConfig')}
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSaving} className="w-full sm:w-auto sm:ml-auto">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
                {t('customScraperBuilder.buttonSaveConfig')}
            </Button>
        </CardFooter>
      </Card>

      <Card className="w-full lg:w-2/3 flex flex-col max-h-full">
        <CardHeader className="flex-row justify-between items-center">
            <div>
                <CardTitle>{t('customScraperBuilder.previewTitle')}</CardTitle>
                <CardDescription>{t('customScraperBuilder.previewDescription')}</CardDescription>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                        <CodeIcon className="h-5 w-5"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('customScraperBuilder.tooltipSelectorHelper')}</p></TooltipContent>
            </Tooltip>
        </CardHeader>
        <CardContent className="flex-grow p-0 relative bg-gray-100 dark:bg-slate-800">
          {previewUrl ? (
            <>
            {isLoadingPreview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-2">{t('customScraperBuilder.previewLoading')}</p>
                </div>
            )}
            <iframe
              src={previewUrl}
              title={t('customScraperBuilder.previewTitle')}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={() => setIsLoadingPreview(false)}
              onError={() => {
                setIsLoadingPreview(false);
                toast({title: t('customScraperBuilder.toastPreviewErrorTitle'), description: t('customScraperBuilder.previewErrorLoad'), variant: "destructive"});
              }}
            />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
              <EyeIcon className="w-16 h-16 mb-4" />
              <p>{t('customScraperBuilder.previewEnterUrl')}</p>
              <p className="text-xs mt-2">{t('customScraperBuilder.previewSecurityNote')}</p>
            </div>
          )}
           <div className="absolute bottom-2 right-2 p-2 bg-black/50 text-white text-xs rounded shadow-lg">
              {t('customScraperBuilder.dragOverlayFuture')}
            </div>
        </CardContent>
      </Card>
    </div>
    <DragOverlay>
        {activeDragItem ? (
          activeDragItem.data.current?.type === 'paletteItem' ?
            <PaletteItemDragOverlay fieldName={activeDragItem.data.current.fieldName} /> :
          activeDragItem.data.current?.type === 'field' ?
            <FieldItemDragOverlay fieldName={activeDragItem.data.current.field.fieldName} /> : null
        ) : null}
    </DragOverlay>
    </TooltipProvider>
    </DndContext>
  );
}

interface DraggablePaletteItemProps {
  id: string;
  fieldName: string; // This will be the translated name
  fieldType: ScraperFieldConfig['type'];
}
function DraggablePaletteItem({ id, fieldName, fieldType }: DraggablePaletteItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    data: { type: 'paletteItem', fieldType: fieldType, fieldName: fieldName }
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 100 : 'auto' };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
         className="p-2 border rounded-md bg-sky-50 hover:bg-sky-100 cursor-grab flex items-center gap-2 shadow-sm dark:bg-sky-900/50 dark:hover:bg-sky-800/50 dark:border-sky-700">
      <PackageIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
      <span className="text-sm text-sky-700 dark:text-sky-300">{fieldName}</span>
    </div>
  );
}

interface SortableFieldItemProps {
  id: string;
  field: ScraperFieldConfig;
  index: number;
  updateField: (index: number, updatedField: Partial<ScraperFieldConfig>) => void;
  removeField: (index: number) => void;
}

function SortableFieldItem({ id, field, index, updateField, removeField }: SortableFieldItemProps) {
  const { t } = useTranslation('searchPage');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id, data: { type: 'field', field: field } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 100 : 'auto' };

  return (
    <Card ref={setNodeRef} style={style} className="p-3 bg-white dark:bg-slate-800 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1">
            <button {...attributes} {...listeners} className="cursor-grab p-1 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400" aria-label={t('customScraperBuilder.dragActionLabel', "Drag to reorder field")}>
                <GripVerticalIcon className="h-5 w-5" />
            </button>
            <Label className="text-sm font-medium">{t('customScraperBuilder.fieldItemTitle', { indexPlusOne: index + 1, fieldName: field.fieldName || t('customScraperBuilder.fieldItemUntitled') })}</Label>
        </div>
        <Button variant="ghost" size="icon" onClick={() => removeField(index)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500">
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`fieldName-${index}`} className="text-xs">{t('customScraperBuilder.fieldItemLabelName')}</Label>
          <Input id={`fieldName-${index}`} value={field.fieldName} onChange={e => updateField(index, { fieldName: e.target.value })} placeholder={t('customScraperBuilder.fieldItemPlaceholderName')} />
        </div>
        <div>
          <Label htmlFor={`fieldType-${index}`} className="text-xs">{t('customScraperBuilder.fieldItemLabelType')}</Label>
          <Select value={field.type} onValueChange={(value: ScraperFieldConfig['type']) => updateField(index, { type: value, attributeName: value !== 'attribute' ? undefined : field.attributeName })}>
            <SelectTrigger id={`fieldType-${index}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">{t('customScraperBuilder.selectTypeText')}</SelectItem>
              <SelectItem value="attribute">{t('customScraperBuilder.selectTypeAttribute')}</SelectItem>
              <SelectItem value="html">{t('customScraperBuilder.selectTypeHtml')}</SelectItem>
              <SelectItem value="link">{t('customScraperBuilder.selectTypeLink')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-2">
        <Label htmlFor={`cssSelector-${index}`} className="text-xs">{t('customScraperBuilder.fieldItemLabelSelector')}</Label>
        <Input id={`cssSelector-${index}`} value={field.cssSelector} onChange={e => updateField(index, { cssSelector: e.target.value })} placeholder={t('customScraperBuilder.fieldItemPlaceholderSelector')} />
      </div>
      {field.type === 'attribute' && (
        <div className="mt-2">
          <Label htmlFor={`attributeName-${index}`} className="text-xs">{t('customScraperBuilder.fieldItemLabelAttribute')}</Label>
          <Input id={`attributeName-${index}`} value={field.attributeName || ''} onChange={e => updateField(index, { attributeName: e.target.value })} placeholder={t('customScraperBuilder.fieldItemPlaceholderAttribute')} />
        </div>
      )}
    </Card>
  );
}

function PaletteItemDragOverlay({ fieldName }: { fieldName: string }) {
  return <div className="p-2 border rounded-md bg-sky-500 text-white shadow-xl flex items-center gap-2 dark:bg-sky-600"><PackageIcon className="h-5 w-5" />{fieldName}</div>;
}
function FieldItemDragOverlay({ fieldName }: { fieldName: string }) {
  const { t } = useTranslation('searchPage');
  return <div className="p-3 border rounded-md bg-slate-600 text-white shadow-xl dark:bg-slate-700"><GripVerticalIcon className="inline mr-2 h-5 w-5" />{fieldName || t('customScraperBuilder.fieldItemUntitled')}</div>;
}

export default CustomScraperBuilderUI;
