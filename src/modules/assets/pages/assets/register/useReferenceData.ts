
import {
  useManufacturers,
  useAssetSolutions,
  useStatusRecords
} from "@modules/assets/hooks/useAssetManagement";

export function useReferenceData() {
  const { data: manufacturers = [], isLoading: isManufacturersLoading } = useManufacturers();
  const { data: solutions = [], isLoading: isSolutionsLoading } = useAssetSolutions();
  const { data: statuses = [], isLoading: isStatusesLoading } = useStatusRecords();

  const isReferenceDataLoading = isManufacturersLoading || isSolutionsLoading || isStatusesLoading;

  const operators = manufacturers.filter(m => 
    m.description && m.description.toLowerCase().includes("operadora")
  );
  
  const equipmentManufacturers = manufacturers.filter(m => 
    !m.description || !m.description.toLowerCase().includes("operadora")
  );
  
  const equipmentSolutions = solutions.filter(s => s.id !== 11);

  return {
    isReferenceDataLoading,
    operators,
    equipmentManufacturers,
    equipmentSolutions,
    statuses
  };
}
