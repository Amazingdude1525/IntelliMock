import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createSession, uploadResume, syncUser } from "../../lib/api";
import { useIntelliMockStore } from "../../store/intellimockStore";
import { SplineScene } from "../components/SplineScene";
import {
  Code,
  Package,
  Database,
  Users,
  Wrench,
  Palette,
  MessageSquare,
  Mic,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Clock
} from "lucide-react";

const roles = [
  { id: "sde", label: "Software Engineer", icon: Code },
  { id: "pm", label: "Product Manager", icon: Package },
  { id: "ds", label: "Data Scientist", icon: Database },
  { id: "hr", label: "Human Resources", icon: Users },
  { id: "devops", label: "DevOps Engineer", icon: Wrench },
  { id: "design", label: "Designer", icon: Palette },
];

const domains = [
  "Frontend", "Backend", "Full Stack", "Mobile", "ML/AI",
  "Cloud", "Security", "B2B SaaS", "E-commerce", "Fintech",
];

const difficulties = [
  { id: "easy", label: "Easy", description: "Entry-level questions", color: "accent-green" },
  { id: "medium", label: "Medium", description: "Intermediate scenarios", color: "accent-amber" },
  { id: "hard", label: "Hard", description: "Advanced topics, system design", color: "accent-red" },
];

const personas = [
  { id: "google", name: "Google Engineer", style: "Analytical", description: "Focuses on algorithms", avatar: "🧑‍💻" },
  { id: "startup", name: "Startup CTO", style: "Fast-paced", description: "Values quick thinking", avatar: "🚀" },
  { id: "mckinsey", name: "McKinsey Partner", style: "Strategic", description: "Emphasizes impact", avatar: "💼" },
  { id: "default", name: "Balanced", style: "Friendly", description: "Well-rounded approach", avatar: "⭐" },
];

const modes = [
  { id: "chat", label: "Chat Mode", icon: MessageSquare, description: "Text-based interview format" },
  { id: "voice", label: "Voice Mode", icon: Mic, description: "Realistic voice conversation" },
];

export function SetupPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const setActiveSessionId = useIntelliMockStore((s) => s.setActiveSessionId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("chat");
  const [selectedDuration, setSelectedDuration] = useState<number>(20);
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const canProceed = () => {
    if (step === 1) return selectedRole && selectedDomain && selectedDifficulty;
    if (step === 2) return selectedPersona && selectedMode;
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setResumeFile(file);
      setUploadedFile(file.name);
      toast.success("Resume attached successfully");
    }
  };

  const clearFile = () => {
    setResumeFile(null);
    setUploadedFile("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (user) {
      syncUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "",
        avatar_url: user.imageUrl,
      }).catch(console.error);
    }
  }, [user]);

  const handleStart = async () => {
    setIsStarting(true);
    const toastId = toast.loading("Initializing session...");
    
    try {
      let resume_url = null;
      let resume_text = null;

      if (resumeFile) {
        toast.loading("Uploading and parsing resume...", { id: toastId });
        const uploadRes = await uploadResume(resumeFile);
        resume_url = uploadRes.url;
        resume_text = uploadRes.text_preview;
      }

      toast.loading("Creating interview...", { id: toastId });
      const session = await createSession({
        role: selectedRole,
        domain: selectedDomain,
        difficulty: selectedDifficulty,
        persona: selectedPersona,
        mode: selectedMode,
        duration: selectedDuration,
        resume_url: resume_url || undefined,
        resume_text: resume_text || undefined,
        user_id: user?.id || 'anonymous'
      });

      setActiveSessionId(session.id);
      toast.success("Session created!", { id: toastId });
      
      navigate(`/interview/${session.id}/${selectedMode}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session. Check your connection or API keys.", { id: toastId });
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-text-primary relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <SplineScene scene="https://prod.spline.design/b3JzPfQqzKfS3Uyy/scene.splinecode" className="scale-125 rotate-12" />
      </div>
      <GridOverlay />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-display font-bold">Setup Interview</h1>
              <span className="text-sm font-mono text-text-muted">
                Step {step} of 3
              </span>
            </div>
            <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-purple to-accent-blue"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Role Selection */}
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">
                    Choose Your Role
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className="text-left"
                      >
                        <GlassCard
                          className={`p-4 transition-all ${
                            selectedRole === role.id
                              ? "ring-2 ring-accent-purple shadow-lg shadow-accent-purple/20"
                              : ""
                          }`}
                          hover
                        >
                          <role.icon className="w-8 h-8 text-accent-purple mb-3" />
                          <div className="font-medium">{role.label}</div>
                        </GlassCard>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domain Selection */}
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">
                    Select Domain
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {domains.map((domain) => (
                      <button
                        key={domain}
                        onClick={() => setSelectedDomain(domain)}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                          selectedDomain === domain
                            ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20"
                            : "bg-surface-alt text-text-muted hover:bg-surface"
                        }`}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">
                    Choose Difficulty
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty.id}
                        onClick={() => setSelectedDifficulty(difficulty.id)}
                        className="text-left"
                      >
                        <div style={
                             selectedDifficulty === difficulty.id
                               ? {
                                   borderColor: `var(--${difficulty.color})`,
                                   boxShadow: `0 8px 24px var(--${difficulty.color})/0.2`,
                                 }
                               : {}
                           }>
                        <GlassCard
                          className={`p-6 transition-all ${
                            selectedDifficulty === difficulty.id
                              ? `ring-2 shadow-lg`
                              : ""
                          }`}
                          hover
                        >
                          <div
                            className="text-2xl font-display font-bold mb-2"
                            style={{ color: `var(--${difficulty.color})` }}
                          >
                            {difficulty.label}
                          </div>
                          <p className="text-sm text-text-muted">
                            {difficulty.description}
                          </p>
                        </GlassCard>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Persona Selection */}
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">
                    Choose Interviewer Persona
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {personas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => setSelectedPersona(persona.id)}
                        className="text-left"
                      >
                        <GlassCard
                          className={`p-6 transition-all ${
                            selectedPersona === persona.id
                              ? "ring-2 ring-accent-purple shadow-lg shadow-accent-purple/20"
                              : ""
                          }`}
                          hover
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{persona.avatar}</div>
                            <div className="flex-1">
                              <h3 className="font-display font-bold mb-1">
                                {persona.name}
                              </h3>
                              <p className="text-sm text-accent-purple mb-2">
                                {persona.style}
                              </p>
                              <p className="text-sm text-text-muted">
                                {persona.description}
                              </p>
                            </div>
                          </div>
                        </GlassCard>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Selection */}
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">
                    Select Interview Mode
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className="text-left"
                      >
                        <GlassCard
                          className={`p-8 transition-all ${
                            selectedMode === mode.id
                              ? "ring-2 ring-accent-purple shadow-lg shadow-accent-purple/20"
                              : ""
                          }`}
                          hover
                        >
                          <mode.icon className="w-10 h-10 text-accent-purple mb-4" />
                          <h3 className="text-xl font-display font-bold mb-2">
                            {mode.label}
                          </h3>
                          <p className="text-sm text-text-muted">
                            {mode.description}
                          </p>
                        </GlassCard>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">
                    Upload Resume (Optional)
                  </h2>
                  <p className="text-text-muted mb-6">
                    Upload your resume to get personalized questions based on your experience.
                  </p>

                  {!uploadedFile ? (
                    <GlassCard className="p-12">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-accent-purple mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Drop your resume PDF here
                        </p>
                        <p className="text-sm text-text-muted mb-4">
                          or click to browse
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2 rounded-full bg-accent-purple text-white font-medium text-sm hover:bg-accent-purple/90 transition-colors"
                        >
                          Select File
                        </button>
                      </div>
                    </GlassCard>
                  ) : (
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-accent-green" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{uploadedFile}</p>
                          <p className="text-sm text-text-muted">Uploaded successfully</p>
                        </div>
                        <button
                          onClick={clearFile}
                          className="text-sm text-accent-red hover:text-accent-red/80 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </GlassCard>
                  )}

                  <div className="text-center mt-6">
                    <button
                      onClick={handleStart}
                      className="text-text-muted hover:text-text-primary transition-colors text-sm"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between mt-12"
          >
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-alt text-text-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-purple text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-purple/90 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-purple text-white font-medium disabled:opacity-50 hover:bg-accent-purple/90 transition-colors"
              >
                {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Interview"}
                {!isStarting && <ChevronRight className="w-5 h-5" />}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
