import { useState } from "react";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are an expert Agile Product Owner and Business Analyst.
When given a client requirement, you ALWAYS respond in this EXACT format with no deviation:

EPIC
[Write one clear epic title]

USER STORIES
1. As a [user], I want to [action], so that [benefit].
2. As a [user], I want to [action], so that [benefit].
3. As a [user], I want to [action], so that [benefit].
4. As a [user], I want to [action], so that [benefit].
5. As a [user], I want to [action], so that [benefit].

SPRINT BACKLOG
1. [Developer task]
2. [Developer task]
3. [Developer task]
4. [Developer task]
5. [Developer task]

ARCHITECTURE SUGGESTION
Frontend: [suggestion]
Backend: [suggestion]
Database: [suggestion]
Additional: [suggestion]

Always be specific, technical, and practical.`;

export default function App() {
  const [requirement, setRequirement] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseOutput = (text) => {
    const sections = { epic: "", stories: [], tasks: [], architecture: [] };

    const epicMatch = text.match(/EPIC\n([\s\S]*?)(?=USER STORIES)/);
    if (epicMatch) sections.epic = epicMatch[1].trim();

    const storiesMatch = text.match(/USER STORIES\n([\s\S]*?)(?=SPRINT BACKLOG)/);
    if (storiesMatch) {
      sections.stories = storiesMatch[1]
        .trim()
        .split("\n")
        .filter((l) => l.trim());
    }

    const tasksMatch = text.match(/SPRINT BACKLOG\n([\s\S]*?)(?=ARCHITECTURE SUGGESTION)/);
    if (tasksMatch) {
      sections.tasks = tasksMatch[1]
        .trim()
        .split("\n")
        .filter((l) => l.trim());
    }

    const archMatch = text.match(/ARCHITECTURE SUGGESTION\n([\s\S]*?)$/);
    if (archMatch) {
      sections.architecture = archMatch[1]
        .trim()
        .split("\n")
        .filter((l) => l.trim());
    }

    return sections;
  };

  const analyze = async () => {
    if (!requirement.trim()) return;
    setLoading(true);
    setError("");
    setOutput(null);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: requirement },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      const data = await response.json();
      const text = data.choices[0].message.content;
      setOutput(parseOutput(text));
    } catch (err) {
      setError("Something went wrong. Check your API key in .env file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <div className="badge">AI AGENT</div>
        <h1>Product Owner <span>Agent</span></h1>
        <p>Paste your client requirement. AI generates Agile artifacts instantly.</p>
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
          <button onClick={analyze} disabled={loading || !requirement.trim()}>
            {loading ? "ANALYZING..." : "GENERATE AGILE ARTIFACTS →"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>AI is analyzing requirements...</p>
          </div>
        )}

        {output && (
          <div className="output">
            <div className="card epic">
              <div className="card-label">📌 EPIC</div>
              <div className="card-content">{output.epic}</div>
            </div>

            <div className="card stories">
              <div className="card-label">📖 USER STORIES</div>
              <ul>
                {output.stories.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="card tasks">
              <div className="card-label">✅ SPRINT BACKLOG</div>
              <ul>
                {output.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="card arch">
              <div className="card-label">🏗️ ARCHITECTURE</div>
              <ul>
                {output.architecture.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}