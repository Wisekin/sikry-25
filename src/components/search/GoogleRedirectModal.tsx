import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogClose,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ExternalLink, Search, XIcon, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/src/components/ui/separator';

interface GoogleRedirectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (googleSearchUrl: string) => void;
    companyNameQuery: string;
}

const GOOGLE_SEARCH_SUFFIX = ' company official website';

export const GoogleRedirectModal = ({
    isOpen,
    onClose,
    onConfirm,
    companyNameQuery,
}: GoogleRedirectModalProps) => {
    const { t } = useTranslation('searchPage');
    const [googleSearchUrlInput, setGoogleSearchUrlInput] = useState('');

    const handleConfirm = useCallback(() => {
        const trimmedUrl = googleSearchUrlInput.trim();
        if (trimmedUrl) {
            onConfirm(trimmedUrl);
            setGoogleSearchUrlInput('');
        }
    }, [googleSearchUrlInput, onConfirm]);

    const generateGoogleSearchLink = useCallback(() => {
        const fullQuery = `${companyNameQuery}${GOOGLE_SEARCH_SUFFIX}`;
        return `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}`;
    }, [companyNameQuery]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl p-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <DialogHeader className="p-6 pb-4 border-b dark:border-gray-700">
                    <DialogTitle className="flex items-center text-2xl font-bold text-gray-800 dark:text-white">
                        <Search className="mr-3 h-6 w-6 text-blue-500" />
                        {t('googleRedirectModal.title', 'Find Company on Google')}
                    </DialogTitle>
                    <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
                        <XIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span className="sr-only">{t('common.close', 'Close')}</span>
                    </DialogClose>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 p-6 pt-4">
                    {/* Left Column: Search Action */}
                    <div className="flex flex-col justify-center rounded-lg bg-gray-50 dark:bg-gray-700 p-6 shadow-md">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {t('googleRedirectModal.step1.title', 'Step 1: Search on Google')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {t('googleRedirectModal.step1.description', "We couldn't find a direct match for '{{query}}'. Use the button below to search on Google and find the company's official website.", { query: companyNameQuery })}
                        </p>
                        <Button variant="outline" asChild className="mt-6 w-full">
                            <a href={generateGoogleSearchLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                {t('googleRedirectModal.searchGoogle', 'Search Google for "{{query}}"', { query: companyNameQuery })}
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>

                    {/* Vertical Separator for medium screens and up */}
                    <div className="relative hidden md:flex items-center justify-center">
                        <Separator orientation="vertical" />
                        <div className="absolute bg-white p-2 rounded-full border">
                            <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>

                    {/* Horizontal Separator for mobile screens */}
                    <div className="relative md:hidden flex items-center justify-center my-6">
                        <Separator orientation="horizontal" />
                    </div>

                    {/* Right Column: Paste URL Action */}
                    <div className="flex flex-col justify-center p-6">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {t('googleRedirectModal.step2.title', 'Step 2: Submit the URL')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {t('googleRedirectModal.step2.description', 'Once you find the correct website, paste its URL below to proceed. You can also paste the Google search results page URL.')}
                        </p>
                        <label htmlFor="google-url-input" className="mt-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('googleRedirectModal.pasteUrlLabel', 'Company Website or Google URL')}
                        </label>
                        <Input
                            id="google-url-input"
                            type="url"
                            placeholder={t('googleRedirectModal.urlPlaceholder', 'e.g., https://www.example.com')}
                            value={googleSearchUrlInput}
                            onChange={(e) => setGoogleSearchUrlInput(e.target.value)}
                            className="w-full mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <DialogFooter className="bg-gray-50 dark:bg-gray-700 p-4 border-t dark:border-gray-600">
                    <Button variant="ghost" onClick={onClose} className="text-gray-700 dark:text-gray-300">
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleConfirm} disabled={!googleSearchUrlInput.trim()} className="bg-blue-500 text-white hover:bg-blue-600">
                        {t('common.confirm', 'Confirm and Continue')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
