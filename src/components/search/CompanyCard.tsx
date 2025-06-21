import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Company } from "@/src/lib/types";
import {
  Users, MapPin, Mail, Phone, ExternalLink, Briefcase, Tag
} from "lucide-react";

// Utility to truncate long domains for display
function truncateDomain(domain: string, maxLength = 24) {
  if (!domain) return '';
  return domain.length > maxLength ? domain.slice(0, maxLength - 3) + '...' : domain;
}

interface CompanyCardProps {
  company: Company;
  layout?: 'grid' | 'list';
}

export const CompanyCard = ({ company, layout = 'grid' }: CompanyCardProps) => {
  const getConfidenceColor = (score: number) => {
    if (score > 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (score > 80) return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    if (score > 70) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  };

  const confidenceScore = company.confidenceScore || 0;
  const confidenceStyle = getConfidenceColor(confidenceScore);
  const cardClasses = `group bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl hover:bg-[#2A3050]`;
  const employeeDisplay = company.employee_count || 'N/A';

  if (layout === 'list') {
      return (
          <div className={`${cardClasses} p-4 flex items-center gap-4`}>
              <img src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`} alt={`${company.name} logo`} className="w-12 h-12 rounded-md object-contain flex-shrink-0" />
              <div className="flex-grow grid grid-cols-4 gap-4 items-center">
                  <div>
                      <h3 className="font-bold text-base text-[#1B1F3B] group-hover:text-white">{company.name}</h3>
                      <a href={`http://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 group-hover:text-gray-300 hover:underline">{company.domain}</a>
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400 group-hover:text-sky-300" /> {company.industry || 'N/A'}</div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 group-hover:text-sky-300" /> {company.location_text || 'N/A'}</div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400 group-hover:text-sky-300" /> {employeeDisplay} Employees</div>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} group-hover:bg-opacity-20 group-hover:text-white group-hover:border-white/50`}>
                  {confidenceScore}%
              </div>
          </div>
      )
  }

  return (
    <div className={`${cardClasses} flex flex-col h-full`}>
      <CardHeader className="p-4 border-b border-gray-100 group-hover:border-gray-600">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`} alt={`${company.name} logo`} className="w-12 h-12 rounded-md object-contain" />
            <div>
              <h3 className="font-bold text-base text-[#1B1F3B] group-hover:text-white">{company.name}</h3>
              <a href={`http://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 group-hover:text-gray-300 hover:underline flex items-center gap-1" title={company.domain}>
                {truncateDomain(company.domain)} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} group-hover:bg-opacity-20 group-hover:text-white group-hover:border-white/50`}>
            {confidenceScore}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-grow">
        <p className="text-sm text-gray-600 group-hover:text-gray-200">{company.description || 'No description available.'}</p>
        <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400 group-hover:text-sky-300"/> {company.industry || 'N/A'}</div>
        <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 group-hover:text-sky-300"/> {company.location_text || 'N/A'}</div>
        <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400 group-hover:text-sky-300"/> {employeeDisplay} Employees</div>
      </CardContent>
      {company.extractedData && (company.extractedData.emails?.length > 0 || company.extractedData.phones?.length > 0 || company.extractedData.technologies?.length > 0) && (
        <div className="p-4 border-t border-gray-100 group-hover:border-gray-600">
          <h4 className="text-xs font-semibold text-gray-500 group-hover:text-gray-300 mb-2">EXTRACTED DATA</h4>
          <div className="flex flex-wrap gap-2">
              {company.extractedData.emails?.length > 0 && <div className="flex items-center gap-1.5 text-xs bg-gray-100 group-hover:bg-gray-700 text-gray-700 group-hover:text-gray-200 rounded-full px-2 py-1"><Mail className="w-3 h-3"/> {company.extractedData.emails.length} Email(s)</div>}
              {company.extractedData.phones?.length > 0 && <div className="flex items-center gap-1.5 text-xs bg-gray-100 group-hover:bg-gray-700 text-gray-700 group-hover:text-gray-200 rounded-full px-2 py-1"><Phone className="w-3 h-3"/> {company.extractedData.phones.length} Phone(s)</div>}
              {company.extractedData.technologies?.slice(0, 2).map((tech: string, index: number) => (
                  <div key={`${tech}-${index}`} className="flex items-center gap-1.5 text-xs bg-gray-100 group-hover:bg-gray-700 text-gray-700 group-hover:text-gray-200 rounded-full px-2 py-1"><Tag className="w-3 h-3"/> {tech}</div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
