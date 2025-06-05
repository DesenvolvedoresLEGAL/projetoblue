
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useTicketAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    endDate: new Date(),
  });

  // Mock function for getting analytics data
  const getAnalyticsData = async () => {
    // In a real application, this would be an API call
    // For now, we return mock data
    return {
      ticketVolume: {
        total: 1247,
        previous: 1089,
        percentChange: 14.5,
        byDay: [
          { date: "2024-01-01", count: 32 },
          { date: "2024-01-02", count: 28 },
          { date: "2024-01-03", count: 41 },
          // ...more data points
        ],
      },
      responseMetrics: {
        firstResponseTime: {
          current: 2700, // in seconds
          previous: 3200,
          percentChange: -15.6,
        },
        resolutionTime: {
          current: 8100, // in seconds
          previous: 9600,
          percentChange: -15.6,
        },
      },
      byStatus: [
        { status: "new", count: 23, percentage: 1.8 },
        { status: "open", count: 156, percentage: 12.5 },
        { status: "pending", count: 68, percentage: 5.5 },
        { status: "solved", count: 976, percentage: 78.3 },
        { status: "closed", count: 24, percentage: 1.9 },
      ],
      byPriority: [
        { priority: "low", count: 356, percentage: 28.5 },
        { priority: "normal", count: 623, percentage: 49.9 },
        { priority: "high", count: 189, percentage: 15.2 },
        { priority: "urgent", count: 79, percentage: 6.3 },
      ],
      byChannel: [
        { channel: "email", count: 487, percentage: 39.1 },
        { channel: "chat", count: 298, percentage: 23.9 },
        { channel: "whatsapp", count: 234, percentage: 18.8 },
        { channel: "web", count: 156, percentage: 12.5 },
        { channel: "phone", count: 72, percentage: 5.8 },
      ],
      satisfaction: {
        score: 4.7,
        responses: 352,
        distribution: [
          { rating: 5, count: 234, percentage: 66.5 },
          { rating: 4, count: 87, percentage: 24.7 },
          { rating: 3, count: 18, percentage: 5.1 },
          { rating: 2, count: 8, percentage: 2.3 },
          { rating: 1, count: 5, percentage: 1.4 },
        ],
      },
      topAgents: [
        {
          agent: "Maria Santos",
          tickets: 89,
          resolved: 76,
          avgTime: 6300, // in seconds
          satisfaction: 4.8,
          slaCompliance: 96.2,
        },
        {
          agent: "Pedro Lima",
          tickets: 76,
          resolved: 62,
          avgTime: 7920, // in seconds
          satisfaction: 4.6,
          slaCompliance: 94.7,
        },
        {
          agent: "Lucia Fernandes",
          tickets: 67,
          resolved: 59,
          avgTime: 7080, // in seconds
          satisfaction: 4.9,
          slaCompliance: 97.1,
        },
      ],
      topCategories: [
        { category: "Connectivity", count: 234, trend: "+12%" },
        { category: "Configuration", count: 189, trend: "+8%" },
        { category: "Billing", count: 156, trend: "-5%" },
        { category: "Hardware", count: 123, trend: "+15%" },
        { category: "Software", count: 98, trend: "+3%" },
      ],
    };
  };

  const analyticsQuery = useQuery({
    queryKey: ["ticket-analytics", dateRange],
    queryFn: getAnalyticsData,
  });

  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    dateRange,
    setDateRange,
  };
};
