import React from 'react';
import { TechnicianDashboard } from '../components/TechnicianDashboard';

// TODO: Get current user from auth context
const MOCK_TECHNICIAN_ID = 'tech-123';

export const SetupDashboard: React.FC = () => {
  return <TechnicianDashboard technicianId={MOCK_TECHNICIAN_ID} />;
};