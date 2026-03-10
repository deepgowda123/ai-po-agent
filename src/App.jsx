import { useState, useRef, useEffect } from "react";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are an expert Agile Product Owner and Business Analyst.
When given a client requirement, you ALWAYS respond in this EXACT format:

EPIC
[One clear epic title]

FEATURES
1. [Feature name]
2. [Feature name]
3. [Feature name]
4. [Feature name]

USER STORIES
1. As a [user], I want to [action], so that [benefit].
2. As a [user], I want to [action], so that [benefit].
3. As a [user], I want to [action], so that [benefit].
4. As a [user], I want to [action], so that [benefit].
5. As a [user], I want to [action], so that [benefit].

ACCEPTANCE CRITERIA
1. Given [context], When [action], Then [outcome].
2. Given [context], When [action], Then [outcome].
3. Given [context], When [action], Then [outcome].

TASKS
1. [Developer task]
2. [Developer task]
3. [Developer task]
4. [Developer task]
5. [Developer task]

PRODUCT BACKLOG
P1 - [Highest priority item]
P2 - [Second priority item]
P3 - [Third priority item]
P4 - [Fourth priority item]

SPRINT PLANNING
Sprint Duration: 2 weeks
Sprint Goal: [Clear sprint goal]
Sprint Items:
- [Item 1]
- [Item 2]
- [Item 3]

SPRINT REVIEW
Demo Items:
- [What will be demonstrated 1]
- [What will be demonstrated 2]
- [What will be demonstrated 3]

SPRINT RETROSPECTIVE
What went well: [Point]
Needs improvement: [Point]
Action item: [Point]

ARCHITECTURE SUGGESTION
Frontend: [suggestion]
Backend: [suggestion]
Database: [suggestion]
DevOps: [suggestion]
Additional: [suggestion]

Always be specific, technical, and practical. Never skip any section.`;

const CHAT_SYSTEM_PROMPT = `You are an expert Agile Product Owner assistant.
You have access to the current Agile plan.
When the user asks to modify something, update ONLY that section and return the COMPLETE updated plan in the same format.
Be specific, helpful, and practical.`;

const callGroq = async (messages) => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
};

const parseOutput = (text) => {
  const extract = (label, nextLabel) => {
    const regex = new RegExp(`${label}\\n([\\s\\S]*?)(?=${nextLabel}|$)`);
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  return {
    epic: extract("EPIC", "FEATURES"),
    features: extract("FEATURES", "USER STORIES").split("\n").filter(Boolean),
    stories: extract("USER STORIES", "ACCEPTANCE CRITERIA").split("\n").filter(Boolean),
    criteria: extract("ACCEPTANCE CRITERIA", "TASKS").split("\n").filter(Boolean),
    tasks: extract("TASKS", "PRODUCT BACKLOG").split("\n").filter(Boolean),
    backlog: extract("PRODUCT BACKLOG", "SPRINT PLANNING").split("\n").filter(Boolean),
    sprint: extract("SPRINT PLANNING", "SPRINT REVIEW").split("\n").filter(Boolean),
    review: extract("SPRINT REVIEW", "SPRINT RETROSPECTIVE").split("\n").filter(Boolean),
    retro: extract("SPRINT RETROSPECTIVE", "ARCHITECTURE SUGGESTION").split("\n").filter(Boolean),
    architecture: extract("ARCHITECTURE SUGGESTION", "ZZZEND").split("\n").filter(Boolean),
  };
};

const Section = ({ emoji, label, color, items, isText }) => (
  <div className={`card card-${color}`}>
    <div className="card-label">{emoji} {label}</div>
    {isText ? (
      <div className="card-epic">{items}</div>
    ) : (
      <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    )}
  </div>
);

export default function App() {
  const [requirement, setRequirement] = useState("");
  const [rawPlan, setRawPlan] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const generate = async () => {
    if (!requirement.trim()) return;
    setLoading(true);
    setError("");
    setOutput(null);
    setRawPlan("");
    setChatMessages([]);
    try {
      const text = await callGroq([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: requirement },
      ]);
      setRawPlan(text);
      setOutput(parseOutput(text));
    } catch {
      setError("Something went wrong. Check your API key in .env file.");
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !rawPlan) return;
    const userMsg = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const text = await callGroq([
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        { role: "user", content: `Current Agile Plan:\n${rawPlan}\n\nUser request: ${chatInput}` },
      ]);
      setRawPlan(text);
      setOutput(parseOutput(text));
      setChatMessages([...newMessages, { role: "assistant", content: "✅ Plan updated! Scroll up to see the changes." }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "❌ Something went wrong. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyPlan = () => {
    navigator.clipboard.writeText(rawPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdown = () => {
    const blob = new Blob([rawPlan], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agile-plan.md";
    a.click();
  };

  return (
    <div className="app">
      <header>
        <div className="badge">AI AGENT</div>
        <h1>Product Owner <span>Agent</span></h1>
        <p>Paste your client requirement. AI generates a complete Agile plan instantly.</p>
      </header>

      <main>
        <div className="input-section">
          <label>CLIENT REQUIREMENT</label>
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Example: Build a food delivery app where users can browse restaurants, order food, track delivery in real-time, and pay using credit card or UPI..."
            rows={6}
          />
          <button onClick={generate} disabled={loading || !requirement.trim()}>
            {loading ? "ANALYZING..." : "GENERATE AGILE PLAN →"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>AI is generating your Agile plan...</p>
          </div>
        )}

        {output && (
          <>
            <div className="export-bar">
              <span className="export-label">AGILE PLAN GENERATED</span>
              <div className="export-buttons">
                <button className="btn-sm" onClick={copyPlan}>
                  {copied ? "✅ COPIED" : "📋 COPY"}
                </button>
                <button className="btn-sm" onClick={exportMarkdown}>
                  ⬇️ EXPORT MD
                </button>
              </div>
            </div>

            <div className="output">
              <Section emoji="📌" label="EPIC" color="purple" items={output.epic} isText />
              <Section emoji="🧩" label="FEATURES" color="cyan" items={output.features} />
              <Section emoji="📖" label="USER STORIES" color="cyan" items={output.stories} />
              <Section emoji="✔️" label="ACCEPTANCE CRITERIA" color="green" items={output.criteria} />
              <Section emoji="🔧" label="TASKS" color="green" items={output.tasks} />
              <Section emoji="📋" label="PRODUCT BACKLOG" color="yellow" items={output.backlog} />
              <Section emoji="🏃" label="SPRINT PLANNING" color="yellow" items={output.sprint} />
              <Section emoji="🎯" label="SPRINT REVIEW" color="orange" items={output.review} />
              <Section emoji="🔄" label="SPRINT RETROSPECTIVE" color="orange" items={output.retro} />
              <Section emoji="🏗️" label="ARCHITECTURE" color="blue" items={output.architecture} />
            </div>

            <div className="chat-section">
              <div className="chat-header">
                <span>💬 CHAT WITH YOUR AGILE AGENT</span>
                <span className="chat-hint">Ask to modify any section</span>
              </div>
              <div className="chat-examples">
                <span>Try:</span>
                <button className="chip" onClick={() => setChatInput("Add story points to each user story")}>Add story points</button>
                <button className="chip" onClick={() => setChatInput("Add more acceptance criteria")}>More criteria</button>
                <button className="chip" onClick={() => setChatInput("Change sprint duration to 3 weeks")}>Change sprint</button>
              </div>
              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <p className="chat-empty">Your Agile plan is ready. Ask me to modify anything!</p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.role}`}>
                    <span className="chat-role">{msg.role === "user" ? "YOU" : "AGENT"}</span>
                    <span>{msg.content}</span>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-msg assistant">
                    <span className="chat-role">AGENT</span>
                    <span>Updating plan...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-row">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="e.g. Add story points, rewrite user story 2, change sprint to 3 weeks..."
                  disabled={chatLoading}
                />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>
                  SEND →
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}