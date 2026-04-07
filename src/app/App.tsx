import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { router } from './routes';
import { GlobalLoader } from './components/GlobalLoader';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ErrorBoundary fallback={
        <div className="h-screen bg-black flex flex-col items-center justify-center p-12 text-center">
          <h1 className="text-3xl font-display font-bold mb-4 text-white">Initialization Error</h1>
          <p className="text-text-muted mb-8 max-w-sm">We're having trouble loading the 3D core. Please check your connection and refresh.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-accent-purple rounded-full text-white font-medium">
            Retry System
          </button>
        </div>
      }>
        {!isLoaded && <GlobalLoader onComplete={() => setIsLoaded(true)} />}
        
        {/* Only render the router once the 3D initialization is done OR fallback if time passes */}
        <div className={isLoaded ? "block" : "hidden"}>
          <RouterProvider router={router} />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            },
          }}
        />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
