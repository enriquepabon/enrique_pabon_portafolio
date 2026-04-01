export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemContext = `You are the AI assistant for Enrique Pabon Ramirez's portfolio website. Answer questions about him based on this context:

PERSONAL: Enrique Pabon Ramirez, based in Barranquilla, Colombia. Email: enriquepabonramirez@gmail.com. Phone: +57 314 206 4795. LinkedIn: linkedin.com/in/enriquepabon. Websites: enriquepabon.com, onzaai.com.

EDUCATION: MBA from EAE Business School, Madrid (2015). Industrial Engineering from Universidad de los Andes, Bogota (2010). Languages: Spanish (Native), English (C1), Portuguese (Conversational).

CURRENT ROLES:
- Founder & AI Strategy Director at Onza AI (2025-Present): Boutique AI consultancy for Colombia and LATAM. 4 service lines: AI Training, Process Automation, Custom AI Applications, Strategic Consulting.
- Director of Agroindustrial Development at Oleoflores (2024-Present): Leading AI transformation across 4 palm oil extraction plants.

CAREER HISTORY:
- 2023-2025: Business Development Manager at Medcann Pharma (pharmaceutical cannabis, grew client portfolio 300%)
- 2022-2023: General Manager Colombia at YVY Life Sciences
- 2020-2022: Operations Manager at YVY Life Sciences, Uruguay (3+ tons CBD flower, US$500K expansion)
- 2018-2020: Supply Chain Director at Avicanna Inc. (US$15M+ purchases, 10-person team, first cannabis seed export to US)
- 2015-2017: Financial Controller Plant at Owens-Illinois (20% cost reduction, US$20M CAPEX)
- 2011-2014: Project Manager Manufacturing at General Motors (US$43M in projects)

KEY PROJECTS:
1. Smart-flow AI: Python, SAP RFC/BAPI, n8n, PostgreSQL. AI system orchestrating fruit flows across 4 extraction plants.
2. Computer Vision: Roboflow, YOLOv8, Python inference pipeline. Classifies palm fruit quality, 5000+ annotated images.
3. WhatsApp Agents: RAG pipeline (OpenAI + pgvector), WhatsApp Business API, semantic chunking. Serves 500+ farmers.
4. n8n Automation: 15+ production workflows connecting SAP, REST APIs, Google Sheets, Telegram, email.
5. BI Dashboards: Looker Studio, Python, LLM-generated narrative summaries (GPT-4), scheduled via n8n.
6. Onza AI Solutions: Python (FastAPI), React, LangChain, pgvector, n8n, Vercel.

TECH STACK: Python, FastAPI, React, React Native, LangChain, OpenAI API, Claude API, Gemini, YOLOv8, Roboflow, pgvector, PostgreSQL, n8n, SAP/ERP, Looker Studio, Docker, Vercel.

SPEAKING: 500+ people trained. 5+ webinars for corporate audiences in Mexico (Grupo Mexico) and Colombia.

Keep answers concise, professional, and helpful. Always answer in the same language as the question. If asked something not covered, politely say you only have info about Enrique's professional background.`;

    const contents = Array.isArray(history) && history.length > 0
      ? [...history, { role: 'user', parts: [{ text: message }] }]
      : [{ role: 'user', parts: [{ text: message }] }];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemContext }] },
          contents,
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return res.status(502).json({ error: 'AI service error', detail: data.error.message });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
