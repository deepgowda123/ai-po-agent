# 🤖 AI Product Owner Agent

An AI-powered Agile planning assistant that converts client requirements into complete sprint-ready artifacts instantly.

## 🚀 Live Demo
[View Live App](https://ai-product-owner-agent.vercel.app/)

---

## 💡 What It Does

Paste any client requirement — the AI generates a full Agile plan in seconds:

- 📌 **Epic** — high-level business goal
- 🧩 **Features** — major product modules
- 📖 **User Stories** — in standard Agile format
- ✔️ **Acceptance Criteria** — Given / When / Then
- 🔧 **Developer Tasks** — actionable technical work
- 📋 **Product Backlog** — prioritized by importance
- 🏃 **Sprint Planning** — goal + sprint items
- 🎯 **Sprint Review** — demo checklist
- 🔄 **Sprint Retrospective** — team reflection points
- 🏗️ **Architecture Suggestion** — tech stack recommendation

## 💬 Interactive Chat
After generating the plan, chat with the AI agent to modify any section:
> *"Add story points"* · *"Rewrite user story 3"* · *"Change sprint to 3 weeks"*

## ⬇️ Export
- Copy full plan to clipboard
- Download as Markdown file

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| AI Model | Llama 3.3 70B |
| LLM API | Groq (free tier) |
| Deployment | Vercel |

---

## ⚙️ Run Locally
```bash
git clone https://github.com/YOUR_USERNAME/ai-po-agent.git
cd ai-po-agent
npm install
```

Create a `.env` file:
```
VITE_GROQ_API_KEY=your_groq_api_key_here
```
```bash
npm run dev
```

Get your free Groq API key at [console.groq.com](https://console.groq.com)

---

## 🎯 Use Case

Saves hours of manual Agile planning. Built for:
- Product Owners
- Business Analysts  
- Scrum Masters
- DevOps + Agile teams

---

## 👤 Author
Built by Deepika H P (https://github.com/deepgowda123)