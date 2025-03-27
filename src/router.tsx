import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ServiceMenu from './pages/ServiceMenu';
import AddVendor from './pages/admin/add-vendor';
import SeatingChart from './pages/SeatingChart';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <ServiceMenu />,
      },
      {
        path: 'admin/add-vendor',
        element: <AddVendor />,
      },
      {
        path: 'seating-chart',
        element: <SeatingChart />,
      },
    ],
  },
]);

export default router;
