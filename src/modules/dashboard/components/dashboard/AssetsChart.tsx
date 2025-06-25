
import React from "react";
import { useAssets } from "@/context/useAssets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function AssetsChart() {
  const { assets } = useAssets();
  
  // Generate data for the last 7 days
  const last7Days = getLastNDays(7);
  const chartData = last7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const count = assets.filter(asset => {
      const assetDate = asset.registrationDate.split('T')[0];
      return assetDate === dateStr;
    }).length;
    
    return {
      date: formatDate(date),
      count
    };
  });

  const config = {
    assets: { label: "Assets Registered", color: "#4D2BFB" }
  };

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" name="assets" fill="#4D2BFB" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

// Helper function to get the last N days
function getLastNDays(n: number) {
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(date);
  }
  return result;
}

// Helper function to format date
function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
