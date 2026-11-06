import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

// Features
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FloorPlanPage } from '../features/floorplan/FloorPlanPage';
import { ClimatePage } from '../features/climate/ClimatePage';
import { LightingPage } from '../features/lighting/LightingPage';
import { DevicesPage } from '../features/devices/DevicesPage';
import { SecurityPage } from '../features/security/SecurityPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { AutomationPage } from '../features/automation/AutomationPage';
import { IotDebugPage } from '../features/iot-debug/IotDebugPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="floorplan" element={<FloorPlanPage />} />
        <Route path="climate" element={<ClimatePage />} />
        <Route path="lighting" element={<LightingPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="automation" element={<AutomationPage />} />
        <Route path="iot-debug" element={<IotDebugPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
