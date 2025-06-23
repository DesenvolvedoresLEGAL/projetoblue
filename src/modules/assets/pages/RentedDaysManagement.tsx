
import React from 'react';
import { RentedDaysManagement } from '../components/rented-days/RentedDaysManagement';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { Calendar } from 'lucide-react';

const RentedDaysManagementPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <StandardPageHeader
        icon={Calendar}
        title="Gestão de Dias Alugados"
        description="Recalcule e monitore os dados de rented_days dos ativos"
      />
      
      <RentedDaysManagement />
    </div>
  );
};

export default RentedDaysManagementPage;
