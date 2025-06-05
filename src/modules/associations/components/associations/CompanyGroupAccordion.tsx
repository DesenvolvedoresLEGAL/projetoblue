
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, StopCircle, Loader2, Building2 } from "lucide-react";
import { Association } from '@/types/associations';
import { CompanyGroup } from '@/utils/timestampGroupingUtils';
import { AssociationStatusBadge } from './AssociationStatusBadge';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface CompanyGroupAccordionProps {
  companyGroups: CompanyGroup[];
  onEditAssociation: (association: Association) => void;
  onEndAssociation: (associationId: number) => void;
  debouncedSearchTerm: string;
  isEndingAssociation: boolean;
}

export const CompanyGroupAccordion: React.FC<CompanyGroupAccordionProps> = ({
  companyGroups,
  onEditAssociation,
  onEndAssociation,
  debouncedSearchTerm,
  isEndingAssociation
}) => {
  const highlightSearchTerm = (text: string | null, searchTerm: string) => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-black rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Accordion type="multiple" className="space-y-2">
      {companyGroups.map((companyGroup, index) => (
        <AccordionItem 
          key={`${companyGroup.companyName}-${index}`} 
          value={`company-${index}`}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-3 text-left">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {highlightSearchTerm(companyGroup.companyName, debouncedSearchTerm)}
                </div>
                <div className="text-sm text-gray-500">
                  {companyGroup.associations.length} associaç{companyGroup.associations.length === 1 ? 'ão' : 'ões'}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Linha</TableHead>
                  <TableHead>Rádio</TableHead>
                  <TableHead>Solução</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyGroup.associations.map((association) => (
                  <TableRow key={association.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs">
                      {highlightSearchTerm(association.id.toString(), debouncedSearchTerm)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {highlightSearchTerm(association.asset_iccid || association.asset_radio || association.asset_id, debouncedSearchTerm)}
                    </TableCell>
                    <TableCell>
                      {association.asset_line_number ? 
                        highlightSearchTerm(association.asset_line_number.toString(), debouncedSearchTerm) : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {highlightSearchTerm(association.asset_radio, debouncedSearchTerm) || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {association.asset_solution_name}
                      </span>
                    </TableCell>
                    <TableCell>{formatDateForDisplay(association.entry_date)}</TableCell>
                    <TableCell>{association.exit_date ? formatDateForDisplay(association.exit_date) : '-'}</TableCell>
                    <TableCell>
                      <AssociationStatusBadge 
                        exitDate={association.exit_date}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {association.association_id === 1 ? 'Locação' : 
                         association.association_id === 2 ? 'Assinatura' : 
                         'Outros'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditAssociation(association)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!association.exit_date && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEndAssociation(association.id)}
                            disabled={isEndingAssociation}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            {isEndingAssociation ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <StopCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
