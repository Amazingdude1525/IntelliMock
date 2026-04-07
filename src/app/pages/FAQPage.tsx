import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { GridOverlay } from "../components/GridOverlay";
import { GlassCard } from "../components/GlassCard";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How does the AI analyze my performance?",
    answer: "IntelliMock uses a multi-modal analysis engine. It processes your verbal responses using advanced LLMs for content accuracy, while simultaneously monitoring biometric markers like eye contact, posture, and speech clarity through our real-time vision system."
  },
  {
    question: "Can I use IntelliMock for non-technical roles?",
    answer: "Absolutely. Our platform is designed for a vast array of roles including Product Management, UI/UX Design, Human Resources, and Business Development. The AI adapts its questioning style to the specific industry standards of your chosen role."
  },
  {
    question: "Is my data used for model training?",
    answer: "We prioritize user privacy. Your biometric data and interview recordings are processed locally or in secure ephemeral streams. We do not use personal interview data to train public models without explicit, anonymized consent."
  },
  {
    question: "How do I get the Career Roadmap?",
    answer: "After completing a full interview session, our AI generates a comprehensive 'Perfect Report'. This includes a Strengths/Weaknesses breakdown and a 3-phase Career Roadmap tailored to your current performance and target aspirations."
  },
  {
    question: "Does it support multiple languages?",
    answer: "Currently, IntelliMock is optimized for English, focusing on technical and corporate terminology. We are working on expanding support for more languages in future updates."
  }
];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <GridOverlay />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-display font-black mb-6 italic tracking-tighter">
              Knowledge <span className="text-accent-purple">Base</span>
            </h1>
            <p className="text-lg text-text-muted font-light">
              Common questions about the IntelliMock platform and AI intelligence.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between group"
                  >
                    <span className="text-lg font-bold group-hover:text-accent-purple transition-colors italic">
                      {faq.question}
                    </span>
                    {openIndex === index ? (
                      <Minus className="w-5 h-5 text-accent-purple" />
                    ) : (
                      <Plus className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
                    )}
                  </button>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-text-muted leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 text-center p-12 rounded-3xl bg-surface-alt border border-white/5"
          >
            <h3 className="text-2xl font-display font-bold mb-4 italic">Still have questions?</h3>
            <p className="text-text-muted mb-8">Out team is ready to help you optimize your interview performance.</p>
            <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-accent-purple hover:text-white transition-all">
              Contact Support
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
