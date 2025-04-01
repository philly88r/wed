import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ServiceMenu from './pages/ServiceMenu';
import AddVendor from './pages/admin/add-vendor';
import SeatingChart from './pages/SeatingChart';
import VisionBoard from './pages/VisionBoard';

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
      {
        path: 'vision-board',
        element: <VisionBoard />,
      },
    ],
  },
]);

export default router;
