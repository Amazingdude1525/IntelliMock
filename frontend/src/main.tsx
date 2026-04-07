import { createRoot } from "react-dom/client";
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./app/App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);

  try {
    const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

    if (!PUBLISHABLE_KEY) {
      root.render(
        <div className="h-screen bg-black flex flex-col items-center justify-center p-12 text-center text-white font-sans">
          <h1 className="text-2xl font-bold mb-2">Neural Link Error</h1>
          <p className="text-gray-400 max-w-xs mx-auto">VITE_CLERK_PUBLISHABLE_KEY is missing in production environment. Add it to Vercel and redeploy.</p>
        </div>
      );
    } else {
      root.render(
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <App />
        </ClerkProvider>
      );
    }
  } catch (err: any) {
    root.render(
      <div className="h-screen bg-black flex flex-col items-center justify-center p-12 text-center text-white font-sans">
        <h1 className="text-2xl font-bold mb-2">Critical Boot Error</h1>
        <p className="text-red-500 font-mono text-xs">{err?.message || 'Unknown initialization failure'}</p>
      </div>
    );
  }
}