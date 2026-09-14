import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { BloodDonationReportPage } from './pages/BloodDonationReportPage'
import { BloodDonationReportPreviewPage } from './pages/BloodDonationReportPreviewPage'
import { DashboardPage } from './pages/DashboardPage'
import { DutyChangeEmployeesPage } from './pages/DutyChangeEmployeesPage'
import { DutyChangeFormPage } from './pages/DutyChangeFormPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="staff" element={<EmployeesPage />} />
        <Route path="employees" element={<Navigate to="/staff" replace />} />
        <Route path="duty-change/form" element={<DutyChangeFormPage />} />
        <Route path="duty-change/employees" element={<DutyChangeEmployeesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="reports/blood-donation" element={<BloodDonationReportPage />} />
        <Route
          path="reports/blood-donation/preview"
          element={<BloodDonationReportPreviewPage />}
        />
        <Route path="reports/campaign" element={<Navigate to="/reports/blood-donation" replace />} />
        <Route
          path="reports/campaign/preview"
          element={<Navigate to="/reports/blood-donation/preview" replace />}
        />
        <Route path="reports/sales" element={<Navigate to="/reports/blood-donation" replace />} />
        <Route path="reports/inventory" element={<Navigate to="/reports/blood-donation" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
