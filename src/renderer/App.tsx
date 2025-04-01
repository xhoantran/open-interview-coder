import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubscribedApp } from './_pages/SubscribedApp';
import { DynamicContainer } from './components/DynamicContainer';
import './global.css';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: Infinity,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Root component that provides the QueryClient
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContainer>
        <SubscribedApp />
      </DynamicContainer>
    </QueryClientProvider>
  );
}

export default App;
