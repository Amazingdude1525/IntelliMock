import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIntelliMockStore } from "../../store/intellimockStore";
import { GlassCard } from "./GlassCard";
import { Sparkles, GraduationCap, Target, Briefcase, ArrowRight, Check } from "lucide-react";

export function OnboardingManager() {
  const { onboardingData, setOnboardingData } = useIntelliMockStore();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    university: "",
    major: "",
    targetRole: "",
    targetTier: ""
  });

  if (onboardingData) return null;

  const steps = [
    {
      title: "Academic Background",
      subtitle: "Where are you currently honing your craft?",
      icon: GraduationCap,
      fields: [
        { key: "university", label: "University / Institution", placeholder: "e.g. Stanford University" },
        { key: "major", label: "Primary Major / Degree", placeholder: "e.g. Computer Science" }
      ]
    },
    {
      title: "Career Trajectory",
      subtitle: "What's the dream role we're aiming for?",
      icon: Target,
      fields: [
        { key: "targetRole", label: "Target Role", placeholder: "e.g. Senior Software Engineer" },
        { key: "targetTier", label: "Company Tier Goal", placeholder: "e.g. FAANG / High-Growth Startup" }
      ]
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setOnboardingData(formData);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <GlassCard className="p-10 border-accent-purple/30 bg-black/40">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 flex items-center justify-center mx-auto mb-6 border border-accent-purple/20">
              <currentStep.icon className="w-8 h-8 text-accent-purple" />
            </div>
            <h2 className="text-3xl font-display font-black mb-2 tracking-tight italic">
              {currentStep.title}
            </h2>
            <p className="text-text-muted">{currentStep.subtitle}</p>
          </div>

          <div className="space-y-6 mb-10">
            {currentStep.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-2 px-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={(formData as any)[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple/50 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${i === step ? "w-6 bg-accent-purple" : "bg-white/10"}`} 
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={Object.values(formData).some((v, i) => i <= step*2 + 1 && !v)}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-bold hover:bg-accent-purple hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black transition-all"
            >
              {step === steps.length - 1 ? (
                <>Complete Setup <Check className="w-5 h-5" /></>
              ) : (
                <>Next Intelligence <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </GlassCard>
        
        <p className="mt-8 text-center text-[10px] font-mono text-text-muted uppercase tracking-[0.4em]">
          Initializing Personalized Neural Environment
        </p>
      </motion.div>
    </div>
  );
}
