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

import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-12 text-center text-white">
        <h1 className="text-4xl font-display font-bold mb-4">System Breach Detected</h1>
        <p className="text-gray-400 mb-8 max-w-md">Our 3D Core had a synchronization issue. Please refresh or return home.</p>
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
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "/setup",
        element: <ProtectedRoute><SetupPage /></ProtectedRoute>,
      },
      {
        path: "/interview/:id/chat",
        element: <ProtectedRoute><InterviewChatPage /></ProtectedRoute>,
      },
      {
        path: "/interview/:id/voice",
        element: <ProtectedRoute><InterviewVoicePage /></ProtectedRoute>,
      },
      {
        path: "/feedback",
        element: <ProtectedRoute><FeedbackPage /></ProtectedRoute>,
      },
      {
        path: "/history",
        element: <ProtectedRoute><HistoryPage /></ProtectedRoute>,
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
