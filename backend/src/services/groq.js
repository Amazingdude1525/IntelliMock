// IntelliMock Groq AI Service
// Handles interview prompts, streaming, and feedback generation

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const personas = {
  google: 'You are a senior Google engineer. Ask deep technical questions, focus on system design, evaluate using STAR method.',
  startup: 'You are a fast-paced startup CTO. Value hustle, practical problem-solving, and speed over textbook answers.',
  mckinsey: 'You are a McKinsey partner. Ask sharp analytical questions, love frameworks, evaluate structured thinking.',
  default: 'You are an experienced professional interviewer conducting a fair, structured IntelliMock interview.',
};

export function buildInterviewPrompt(role, domain, difficulty, persona, resumeText) {
  const personaText = personas[persona] || personas.default;

  return `${personaText}

You are conducting a ${difficulty} ${domain} interview for the role of ${role} on IntelliMock.
${resumeText ? `Candidate resume summary: ${resumeText.slice(0, 800)}` : ''}

STRICT RULES:
- Ask ONE question at a time. Never multiple questions in one message.
- After each answer, acknowledge in 1 sentence, then ask the next question.
- Adapt difficulty based on answer quality automatically.
- After exactly 7 questions, respond with only: "INTELLIMOCK_COMPLETE"
- Keep all questions relevant to ${role} and ${domain}.
- Never break character. Never mention you are an AI.
- Vary question types: technical, behavioral, situational, case-based.`;
}

export function buildFeedbackPrompt(conversation, role, domain) {
  return `You are an expert interview coach for IntelliMock.
Analyze this ${role} / ${domain} interview and return ONLY valid JSON, no extra text:

Conversation:
${conversation}

Return exactly this JSON:
{
  "clarity_score": <0-100>,
  "depth_score": <0-100>,
  "communication_score": <0-100>,
  "confidence_score": <0-100>,
  "overall_score": <0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "summary": "2-sentence summary of overall performance",
  "career_roadmap": {
    "immediate": ["action 1", "action 2"],
    "short_term": ["action 1", "action 2"],
    "long_term": ["action 1", "action 2"]
  },
  "verdict": "Ready" | "Almost Ready" | "Needs Work"
}`;
}

export async function sendToGroq(messages, stream = true) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 300,
      temperature: 0.7,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  return response;
}

export async function sendToGroqNonStream(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
