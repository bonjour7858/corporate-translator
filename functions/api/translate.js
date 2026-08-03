export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { text } = await request.json();

    // 1. Validation de l'entrée utilisateur
    if (!text || text.trim().length === 0 || text.length > 500) {
      return new Response(
        JSON.stringify({ error: "Texte invalide ou trop long (500 caractères max)." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Vérification de la clé d'API Groq
    const GROQ_API_KEY = env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Clé GROQ_API_KEY introuvable dans la configuration Cloudflare Pages." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. System Prompt pour l'IA
    const systemPrompt = `Tu es un consultant exécutif de haut niveau spécialisé dans la communication d'entreprise. 
Ta tâche est de reformuler le message brut, franc ou familier fourni par l'utilisateur pour le rendre extrêmement professionnel, diplomatique, élégant et adapté aux standards exécutifs (pour un email d'entreprise ou Slack).
Règles strictes :
1. Réponds UNIQUEMENT avec la version professionnelle reformulée en français.
2. Ne mets aucun commentaire, aucun titre, aucune note d'introduction ni de conclusion.`;

    // 4. Appel à l'API Groq (Llama 3.3)
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.6,
        max_tokens: 300
      })
    });

    const groqData = await groqResponse.json();

    if (!groqResponse.ok) {
      return new Response(
        JSON.stringify({ error: groqData.error?.message || "Erreur de l'API Groq" }),
        { status: groqResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const resultText = groqData.choices[0]?.message?.content?.trim();

    // 5. Réponse envoyée au frontend
    return new Response(
      JSON.stringify({ result: resultText }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur serveur : " + err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
