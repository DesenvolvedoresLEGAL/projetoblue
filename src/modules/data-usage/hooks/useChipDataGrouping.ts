
import { useMemo } from 'react';
import { ChipWithMetrics, GroupByOption } from '@/types/dataUsage';

export const useChipDataGrouping = (filteredChips: ChipWithMetrics[], groupBy: GroupByOption) => {
  return useMemo(() => {
    if (groupBy === "CLIENTE") {
      const clientData: Record<string, ChipWithMetrics & { 
        download: number; 
        upload: number; 
        chips: number; 
        name: string 
      }> = {};
      
      filteredChips.forEach(chip => {
        if (chip.clientId && chip.clientName) {
          if (!clientData[chip.clientName]) {
            clientData[chip.clientName] = {
              ...chip,
              download: 0,
              upload: 0,
              chips: 0,
              name: chip.clientName
            };
          }
          
          clientData[chip.clientName].download += chip.metrics?.download || 0;
          clientData[chip.clientName].upload += chip.metrics?.upload || 0;
          clientData[chip.clientName].chips += 1;
        }
      });
      
      return Object.values(clientData);
    } else if (groupBy === "OPERADORA") {
      const carrierData: Record<string, ChipWithMetrics & { 
        download: number; 
        upload: number; 
        chips: number; 
        name: string 
      }> = {};
      
      filteredChips.forEach(chip => {
        if (!carrierData[chip.carrier]) {
          carrierData[chip.carrier] = {
            ...chip,
            download: 0,
            upload: 0,
            chips: 0,
            name: chip.carrier
          };
        }
        
        carrierData[chip.carrier].download += chip.metrics?.download || 0;
        carrierData[chip.carrier].upload += chip.metrics?.upload || 0;
        carrierData[chip.carrier].chips += 1;
      });
      
      return Object.values(carrierData);
    } else if (groupBy === "REGIAO") {
      const regionData: Record<string, ChipWithMetrics & { 
        download: number; 
        upload: number; 
        chips: number; 
        name: string 
      }> = {};
      
      filteredChips.forEach(chip => {
        const region = chip.region || "Desconhecida";
        
        if (!regionData[region]) {
          regionData[region] = {
            ...chip,
            download: 0,
            upload: 0,
            chips: 0,
            name: region
          };
        }
        
        regionData[region].download += chip.metrics?.download || 0;
        regionData[region].upload += chip.metrics?.upload || 0;
        regionData[region].chips += 1;
      });
      
      return Object.values(regionData);
    } else {
      return filteredChips.map(chip => ({
        ...chip,
        name: chip.phoneNumber || chip.id,
        download: chip.metrics?.download || 0,
        upload: chip.metrics?.upload || 0
      }));
    }
  }, [filteredChips, groupBy]);
};
