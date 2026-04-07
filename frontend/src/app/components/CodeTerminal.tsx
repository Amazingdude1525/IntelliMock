import { useState, useCallback, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "./GlassCard";
import {
  Play,
  RotateCcw,
  Check,
  X,
  Terminal,
  Code2,
  ChevronDown,
  Copy,
  Loader2,
  Zap,
} from "lucide-react";

interface CodeTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  problem?: {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    examples: { input: string; output: string; explanation?: string }[];
    constraints: string[];
    starterCode: string;
    language: string;
    testCases: { input: string; expectedOutput: string }[];
  };
}

const DEFAULT_PROBLEM = {
  title: "Two Sum",
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
  difficulty: "Easy" as const,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  starterCode: `function twoSum(nums, target) {
  // Write your solution here
  
}

// Test
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log(twoSum([3, 2, 4], 6)); // Expected: [1, 2]
`,
  language: "javascript",
  testCases: [
    { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
    { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
    { input: "[3,3], 6", expectedOutput: "[0,1]" },
  ],
};

// Sample problem bank
const PROBLEM_BANK = [
  DEFAULT_PROBLEM,
  {
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    difficulty: "Easy" as const,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    starterCode: `function reverseString(s) {
  // Modify in-place, do not return anything
  
}

// Test
let s1 = ["h","e","l","l","o"];
reverseString(s1);
console.log(s1); // Expected: ["o","l","l","e","h"]
`,
    language: "javascript",
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
    ],
  },
  {
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "Easy" as const,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    starterCode: `function isValid(s) {
  // Write your solution here
  
}

// Test
console.log(isValid("()")); // Expected: true
console.log(isValid("()[]{}")); // Expected: true
console.log(isValid("(]")); // Expected: false
`,
    language: "javascript",
    testCases: [
      { input: '"()"', expectedOutput: "true" },
      { input: '"()[]{}"', expectedOutput: "true" },
      { input: '"(]"', expectedOutput: "false" },
    ],
  },
  {
    title: "Fibonacci Number",
    description:
      "The Fibonacci numbers form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).",
    difficulty: "Easy" as const,
    examples: [
      { input: "n = 2", output: "1", explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1." },
      { input: "n = 4", output: "3", explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3." },
    ],
    constraints: ["0 <= n <= 30"],
    starterCode: `function fib(n) {
  // Write your solution here
  
}

// Test
console.log(fib(2)); // Expected: 1
console.log(fib(4)); // Expected: 3
console.log(fib(10)); // Expected: 55
`,
    language: "javascript",
    testCases: [
      { input: "2", expectedOutput: "1" },
      { input: "4", expectedOutput: "3" },
      { input: "10", expectedOutput: "55" },
    ],
  },
  {
    title: "Maximum Subarray",
    description:
      "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "Medium" as const,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      { input: "nums = [1]", output: "1" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    starterCode: `function maxSubArray(nums) {
  // Write your solution here (Kadane's Algorithm)
  
}

// Test
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Expected: 6
console.log(maxSubArray([1])); // Expected: 1
console.log(maxSubArray([5,4,-1,7,8])); // Expected: 23
`,
    language: "javascript",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "[1]", expectedOutput: "1" },
      { input: "[5,4,-1,7,8]", expectedOutput: "23" },
    ],
  },
];

const LANG_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

const DIFFICULTY_COLORS = {
  Easy: "#22C55E",
  Medium: "#F59E0B",
  Hard: "#F43F5E",
};

export function CodeTerminal({ isOpen, onClose, problem }: CodeTerminalProps) {
  const currentProblem = problem || PROBLEM_BANK[Math.floor(Math.random() * PROBLEM_BANK.length)];
  const [code, setCode] = useState(currentProblem.starterCode);
  const [language, setLanguage] = useState(currentProblem.language);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; got: string }[]>([]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);
    setTestResults([]);

    // Sandbox execution via Function constructor (safe for client-side demo)
    await new Promise(r => setTimeout(r, 500)); // Simulate processing

    const logs: string[] = [];
    const originalLog = console.log;
    
    try {
      // Capture console.log output
      console.log = (...args: any[]) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };

      // Execute in sandboxed scope
      const fn = new Function(code);
      fn();

      setOutput(logs.length > 0 ? logs : ['(no output)']);
    } catch (err: any) {
      setOutput([`❌ Error: ${err.message}`]);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  }, [code]);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    setOutput([]);

    await new Promise(r => setTimeout(r, 300));

    const results: typeof testResults = [];
    const originalLog = console.log;

    for (const tc of currentProblem.testCases) {
      const logs: string[] = [];
      console.log = (...args: any[]) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };

      try {
        const fn = new Function(code);
        fn();
        const got = logs[logs.length - 1] || '(no output)';
        results.push({
          passed: got.replace(/\s/g, '') === tc.expectedOutput.replace(/\s/g, ''),
          input: tc.input,
          expected: tc.expectedOutput,
          got,
        });
      } catch (err: any) {
        results.push({
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          got: `Error: ${err.message}`,
        });
      }
    }

    console.log = originalLog;
    setTestResults(results);
    setIsRunning(false);
  }, [code, currentProblem.testCases]);

  const resetCode = () => {
    setCode(currentProblem.starterCode);
    setOutput([]);
    setTestResults([]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput(prev => [...prev, '📋 Code copied to clipboard!']);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-7xl h-[90vh] flex flex-col rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0f]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#0f0f18]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-sm font-bold">Code Challenge</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest"
                  style={{
                    color: DIFFICULTY_COLORS[currentProblem.difficulty],
                    backgroundColor: DIFFICULTY_COLORS[currentProblem.difficulty] + '15',
                  }}
                >
                  {currentProblem.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Language selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    <Code2 className="w-3 h-3 text-[#06B6D4]" />
                    {LANG_OPTIONS.find(l => l.value === language)?.label || language}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showLangDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-lg overflow-hidden z-50 min-w-[140px]">
                      {LANG_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setLanguage(opt.value); setShowLangDropdown(false); }}
                          className={`w-full px-4 py-2 text-left text-xs font-mono hover:bg-white/5 transition-colors ${
                            language === opt.value ? 'text-[#7C3AED] bg-[#7C3AED]/5' : 'text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Main content: Problem + Editor */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Problem Description */}
              <div className="w-[400px] border-r border-white/[0.06] overflow-y-auto p-6 scrollbar-hide">
                <h2 className="text-xl font-bold mb-4">{currentProblem.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{currentProblem.description}</p>

                {/* Examples */}
                <div className="space-y-4 mb-6">
                  {currentProblem.examples.map((ex, i) => (
                    <GlassCard key={i} className="p-4 space-y-2">
                      <span className="text-[9px] font-mono text-[#7C3AED] uppercase tracking-widest font-bold">Example {i + 1}</span>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-gray-500">Input: </span>
                          <code className="text-[#06B6D4] font-mono">{ex.input}</code>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Output: </span>
                          <code className="text-[#22C55E] font-mono">{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div className="text-xs text-gray-500 italic mt-1">{ex.explanation}</div>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>

                {/* Constraints */}
                <div className="mb-6">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-3 block">Constraints</span>
                  <ul className="space-y-1">
                    {currentProblem.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-gray-400 font-mono flex items-start gap-2">
                        <span className="text-[#7C3AED] mt-0.5">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Editor + Output */}
              <div className="flex-1 flex flex-col">
                {/* Editor */}
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    onMount={handleEditorMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                      fontLigatures: true,
                      minimap: { enabled: false },
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      renderLineHighlight: "all",
                      lineNumbers: "on",
                      tabSize: 2,
                      automaticLayout: true,
                      wordWrap: "on",
                      bracketPairColorization: { enabled: true },
                    }}
                  />
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-b border-white/[0.06] bg-[#0f0f18]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Run
                    </button>
                    <button
                      onClick={runTests}
                      disabled={isRunning}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3" />
                      Submit
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyCode}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={resetCode}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Reset code"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Output Panel */}
                <div className="h-[200px] overflow-y-auto p-4 bg-[#0a0a0f] font-mono text-xs scrollbar-hide">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-3 h-3 text-gray-500" />
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Output</span>
                  </div>

                  {/* Console output */}
                  {output.map((line, i) => (
                    <div key={i} className={`py-0.5 ${line.includes('❌') ? 'text-[#F43F5E]' : 'text-gray-300'}`}>
                      <span className="text-gray-600 mr-2">{'>'}</span>{line}
                    </div>
                  ))}

                  {/* Test results */}
                  {testResults.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {testResults.map((r, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${
                            r.passed
                              ? 'border-[#22C55E]/20 bg-[#22C55E]/5'
                              : 'border-[#F43F5E]/20 bg-[#F43F5E]/5'
                          }`}
                        >
                          {r.passed ? (
                            <Check className="w-3.5 h-3.5 text-[#22C55E] mt-0.5 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-[#F43F5E] mt-0.5 shrink-0" />
                          )}
                          <div className="space-y-0.5 text-[10px]">
                            <div className="text-gray-400">Input: <code className="text-[#06B6D4]">{r.input}</code></div>
                            <div className="text-gray-400">Expected: <code className="text-[#22C55E]">{r.expected}</code></div>
                            <div className="text-gray-400">Got: <code className={r.passed ? 'text-[#22C55E]' : 'text-[#F43F5E]'}>{r.got}</code></div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-2">
                        {testResults.every(r => r.passed) ? (
                          <span className="text-[#22C55E] text-xs font-bold">✓ All tests passed!</span>
                        ) : (
                          <span className="text-[#F43F5E] text-xs font-bold">
                            {testResults.filter(r => r.passed).length}/{testResults.length} tests passed
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {output.length === 0 && testResults.length === 0 && !isRunning && (
                    <div className="text-gray-600 italic">Run your code or submit to see results...</div>
                  )}
                  {isRunning && (
                    <div className="flex items-center gap-2 text-[#7C3AED]">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Executing...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export the problem bank for use in interview pages
export { PROBLEM_BANK };
