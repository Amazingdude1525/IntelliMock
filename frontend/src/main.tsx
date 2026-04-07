import { createRoot } from "react-dom/client";
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./app/App.tsx";
import "./styles/index.css";

// Import your Publishable Key
const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  createRoot(document.getElementById("root")!).render(
    <div className="h-screen bg-black flex flex-col items-center justify-center p-12 text-center text-white font-sans">
      <h1 className="text-2xl font-bold mb-2">Neural Link Error</h1>
      <p className="text-gray-400 max-w-xs mx-auto">The VITE_CLERK_PUBLISHABLE_KEY is missing. Please add it to your Environment Variables in Vercel and redeploy.</p>
    </div>
  );
} else {
  createRoot(document.getElementById("root")!).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  );
}