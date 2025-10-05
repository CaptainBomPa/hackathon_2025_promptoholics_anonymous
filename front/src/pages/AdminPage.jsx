import { Box } from '@mui/material';
import AdminReportPanel from '../components/admin/AdminReportPanel';

/**
 * Admin Page Component
 * Main page for administrator functions
 */
const AdminPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminReportPanel />
    </Box>
  );
};

export default AdminPage;