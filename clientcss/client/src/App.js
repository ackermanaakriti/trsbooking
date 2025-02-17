// App.js or App.tsx

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BookingTable from './Pages/Booking/BookingTable';
import Routers from './Global/Router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './Global/Redux/Store';

const queryClient = new QueryClient();  // Initialize a new QueryClient instance

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
    <QueryClientProvider client={queryClient}>
      <div className="App">
       <Routers/>
      </div>
    </QueryClientProvider>
    </PersistGate>
    </Provider>

  );
}

export default App;
