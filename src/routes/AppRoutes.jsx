import React, { lazy, Suspense } from 'react';
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
import { BleStickEmPage } from '../features/ble-stickem/BleStickEmPage';
import { BleInspectorPage } from '../features/ble-inspector/BleInspectorPage';

const BleReportPage = lazy(() => import('../features/ble-report/BleReportPage'));

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
        <Route path="ble-scanner" element={<BleStickEmPage />} />
        <Route path="ble-inspector" element={<BleInspectorPage />} />
        <Route
          path="ble-report"
          element={
            <Suspense fallback={null}>
              <BleReportPage />
            </Suspense>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
