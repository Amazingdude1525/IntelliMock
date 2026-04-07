import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { SetupPage } from "./pages/SetupPage";
import { InterviewChatPage } from "./pages/InterviewChatPage";
import { InterviewVoicePage } from "./pages/InterviewVoicePage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HistoryPage } from "./pages/HistoryPage";
import { CreatorsPage } from "./pages/CreatorsPage";
import { FAQPage } from "./pages/FAQPage";

import { ErrorBoundary } from "./components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-4xl font-display font-bold mb-4 text-white">System Breach Detected</h1>
        <p className="text-text-muted mb-8 max-w-md">Our 3D Core had a synchronization issue. Please refresh or return home.</p>
        <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-accent-purple rounded-full text-white font-bold">
          Restore Terminal
        </button>
      </div>
    ),
    children: [
      {
        path: "/",
        Component: LandingPage,
      },
      {
        path: "/dashboard",
        Component: Dashboard,
      },
      {
        path: "/setup",
        Component: SetupPage,
      },
      {
        path: "/interview/:id/chat",
        Component: InterviewChatPage,
      },
      {
        path: "/interview/:id/voice",
        Component: InterviewVoicePage,
      },
      {
        path: "/feedback",
        Component: FeedbackPage,
      },
      {
        path: "/history",
        Component: HistoryPage,
      },
      {
        path: "/creators",
        Component: CreatorsPage,
      },
      {
        path: "/faq",
        Component: FAQPage,
      },
    ]
  },
]);
