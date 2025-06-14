"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
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
import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ArchiveBoxIcon,
  ClockIcon,
  ChevronRightIcon,
  TagIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
  EyeIcon // For Preview button
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

interface Letter {
  id: string;
  title: string;
  subject: string;
  body: string; // For simplicity, not displaying full body in the card
  createdAt: string;
  status: 'draft' | 'sent' | 'archived';
  recipientName: string;
  recipientCompany: string;
}

const statusIcons = {
  draft: <ClockIcon className="w-4 h-4 mr-1.5 text-yellow-600" />,
  sent: <PaperAirplaneIcon className="w-4 h-4 mr-1.5 text-green-600" />,
  archived: <ArchiveBoxIcon className="w-4 h-4 mr-1.5 text-gray-500" />,
};

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

export default function GapAnalysisLettersPage() {
  const { t } = useTranslation();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchLetters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/gap-analysis/letters');
        if (!response.ok) {
          throw new Error(`Failed to fetch letters: ${response.statusText}`);
        }
        const data = await response.json();
        setLetters(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('gapAnalysis.lettersPage.errorTitle'));
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetters();
  }, []);

  // Format date utility
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePreview = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsPreviewOpen(true);
  };

  // This page-level loading state is primarily for the initial fetch.
  // The `loading.tsx` file handles the Next.js route transition loading.
  // We might show more granular skeletons here if parts of the page load independently.
  if (isLoading && letters.length === 0) { // Only show this if loading for the first time
    return (
      <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <LoadingSkeleton width="300px" height="36px" className="mb-2" />
            <LoadingSkeleton width="350px" height="20px" />
          </div>
          <LoadingSkeleton width="180px" height="40px" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="bg-white border-none shadow-sm">
              <CardHeader>
                <LoadingSkeleton width="70%" height="24px" className="mb-1" />
                <LoadingSkeleton width="50%" height="16px" />
              </CardHeader>
              <CardContent className="space-y-3">
                <LoadingSkeleton width="90%" height="16px" />
                <LoadingSkeleton width="100%" height="16px" />
                <LoadingSkeleton width="80%" height="16px" />
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <LoadingSkeleton width="100px" height="32px" />
                <LoadingSkeleton width="80px" height="20px" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-red-600 mb-2">{t('gapAnalysis.lettersPage.errorTitle')}</h2>
          <p className="text-gray-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            {t('gapAnalysis.lettersPage.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('gapAnalysis.letters')}</h1>
          <p className="text-gray-500 mt-1">
            {t('gapAnalysis.lettersPage.subtitle')}
          </p>
        </div>
        <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          <span>{t('gapAnalysis.lettersPage.createNew')}</span>
        </Button>
      </div>

      {/* TODO: Add Tabs for filtering (e.g., All, Draft, Sent, Archived) if needed */}
      {/* <Tabs defaultValue="all" className="mb-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs> */}

      {/* Letters Grid / List */}
      {letters.length === 0 && !isLoading ? (
        <div className="text-center py-10">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">{t('gapAnalysis.lettersPage.noLettersTitle')}</h3>
          <p className="text-gray-500">{t('gapAnalysis.lettersPage.noLettersDescription')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {letters.map((letter) => (
            <Card key={letter.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-800 leading-tight">{letter.title}</CardTitle>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${statusColors[letter.status]}`}>
                    {statusIcons[letter.status]}
                    {t(`gapAnalysis.lettersPage.status.${letter.status}`)}
                  </span>
                </div>
                <CardDescription className="text-sm text-gray-500 mt-1 line-clamp-2" title={letter.subject}>
                  {t('gapAnalysis.lettersPage.subjectLabel')}: {letter.subject}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <UserCircleIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{t('gapAnalysis.lettersPage.recipientLabel')}: {letter.recipientName}</span>
                  </div>
                  <div className="flex items-center">
                    <BuildingOffice2Icon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{t('gapAnalysis.lettersPage.companyLabel')}: {letter.recipientCompany}</span>
                  </div>
                  <div className="flex items-center">
                    <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{t('gapAnalysis.lettersPage.idLabel')}: {letter.id}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {t('gapAnalysis.lettersPage.createdLabel')}: {formatDate(letter.createdAt)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 text-sm text-[#1B1F3B] border-gray-300 hover:border-[#3C4568] hover:bg-gray-50"
                  onClick={() => handlePreview(letter)}
                >
                  <EyeIcon className="w-4 h-4" />
                  {t('gapAnalysis.lettersPage.preview')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedLetter && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#1B1F3B]">{selectedLetter.title}</DialogTitle> 
              <DialogDescription className="text-gray-500">
                {t('gapAnalysis.lettersPage.dialogSubjectPrefix')}: {selectedLetter.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 px-1 flex-grow overflow-y-auto prose prose-sm max-w-none">
              <p className="whitespace-pre-line">{selectedLetter.body}</p>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t('gapAnalysis.lettersPage.dialogClose')}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
