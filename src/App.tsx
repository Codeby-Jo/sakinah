/**
 * Sakinah App Root Component
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AppProviders } from './app/providers';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProviders>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AppProviders>
  );
}

export default App;
