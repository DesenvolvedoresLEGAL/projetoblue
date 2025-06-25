
import { useState, useMemo } from "react";
import { useDataUsage } from "@/context/DataUsageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChipWithMetrics, TimeRange, GroupByOption } from "@/types/dataUsage";
import { UsageFilters } from "@modules/data-usage/components/data-usage/UsageFilters";
import { UsageChart } from "@modules/data-usage/components/data-usage/UsageChart";
import { ChipSummaryCards } from "@modules/data-usage/components/data-usage/ChipSummaryCards";
import { UsageMetricCards } from "@modules/data-usage/components/data-usage/UsageMetricCards";
import { UsageHeader } from "@modules/data-usage/components/data-usage/UsageHeader";
import { useChipDataGrouping } from "@modules/data-usage/hooks/useChipDataGrouping";

export default function DataUsage() {
  const { 
    getActiveChipsWithMetrics, 
    getAvailableCarriers,
    getAvailableClients,
    getAvailableRegions
  } = useDataUsage();
  
  // State for filters
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [groupBy, setGroupBy] = useState<GroupByOption>("CHIP");
  const [clientFilter, setClientFilter] = useState<string>("all_clients");
  const [carrierFilter, setCarrierFilter] = useState<string>("all_carriers");
  const [regionFilter, setRegionFilter] = useState<string>("all_regions");
  const [signalFilter, setSignalFilter] = useState<string>("all_signals");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [viewType, setViewType] = useState<"cards" | "chart">("chart");
  
  // Get active chips with metrics
  const allChips = getActiveChipsWithMetrics();
  
  // Get available options for filters
  const availableCarriers = getAvailableCarriers();
  const availableClients = getAvailableClients();
  const availableRegions = getAvailableRegions();
  
  // Apply filters
  const filteredChips = useMemo(() => {
    return allChips.filter(chip => {
      if (clientFilter !== "all_clients" && chip.clientName !== clientFilter) return false;
      if (carrierFilter !== "all_carriers" && chip.carrier !== carrierFilter) return false;
      if (regionFilter !== "all_regions" && chip.region !== regionFilter) return false;
      if (signalFilter !== "all_signals" && chip.quality?.status !== signalFilter) return false;
      return true;
    });
  }, [allChips, clientFilter, carrierFilter, regionFilter, signalFilter]);
  
  // Group data using the custom hook
  const groupedData = useChipDataGrouping(filteredChips, groupBy);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    return groupedData.map(item => ({
      name: item.name,
      download: item.download,
      upload: item.upload,
      quality: item.quality?.status,
      carrier: item.carrier,
      iccid: item.iccid,
      clientName: item.clientName
    })).sort((a, b) => b.download - a.download);
  }, [groupedData]);
  
  // Format labels for chart
  const formatLabel = (value: string) => {
    if (value.length > 15) {
      return value.substring(0, 12) + '...';
    }
    return value;
  };

  // Clear all filters
  const clearFilters = () => {
    setClientFilter("all_clients");
    setCarrierFilter("all_carriers");
    setRegionFilter("all_regions");
    setSignalFilter("all_signals");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Handle export to Excel
  const handleExport = () => {
    alert("Exportar dados para Excel");
  };

  return (
    <div className="space-y-6">
      <UsageHeader 
        handleExport={handleExport}
        viewType={viewType}
        setViewType={setViewType}
      />

      <UsageMetricCards filteredChips={filteredChips} />

      <UsageFilters
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        carrierFilter={carrierFilter}
        setCarrierFilter={setCarrierFilter}
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
        signalFilter={signalFilter}
        setSignalFilter={setSignalFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        clearFilters={clearFilters}
        carriers={availableCarriers}
        clients={availableClients}
        regions={availableRegions}
      />

      <Tabs value={viewType} className="w-full">
        <TabsContent value="chart" className="mt-0">
          <UsageChart
            data={filteredChips}
            timeRange={timeRange}
            groupBy={groupBy}
            chartData={chartData}
            formatLabel={formatLabel}
            startDate={startDate}
            endDate={endDate}
          />
        </TabsContent>
        
        <TabsContent value="cards" className="mt-0">
          <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
            <CardHeader>
              <CardTitle className="text-legal-dark dark:text-text-primary-dark">Cartões de Resumo por Chip</CardTitle>
            </CardHeader>
            <CardContent>
              <ChipSummaryCards chips={filteredChips} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
