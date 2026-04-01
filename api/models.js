export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No key' });

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await r.json();
    if (data.error) return res.status(400).json(data.error);

    const models = (data.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name);
    return res.status(200).json({ available_models: models });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
