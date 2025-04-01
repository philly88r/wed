import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ServiceMenu from './pages/ServiceMenu';
import AddVendor from './pages/admin/add-vendor';
import SeatingChart from './pages/SeatingChart';
import MoodBoard from './pages/MoodBoard';

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
        path: 'mood-board',
        element: <MoodBoard />,
      },
    ],
  },
]);

export default router;
