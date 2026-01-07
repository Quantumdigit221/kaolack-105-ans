
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Clé API Gemini à configurer dans .env ou variable d'environnement GOOGLE_GEMINI_API_KEY
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

/**
 * Route pour rechercher des informations sur Kaolack via le web
 * Utilise DuckDuckGo Instant Answer API (gratuite, pas besoin de clé API)
 */

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Liste de mots-clés liés à la mairie, état civil, municipalité, histoire/culture de Kaolack, et personnalités connues
    const mairieKeywords = [
      'mairie', 'municipalité', 'commune', 'conseil municipal', 'état civil', 'acte de naissance', 'mariage', 'décès',
      'certificat', 'domicile', 'urbanisme', 'permis', 'administration', 'service public', 'population', 'registre',
      'conseiller', 'maire', 'adjoint', 'démarche', 'papier', 'document', 'identité', 'recensement', 'bureau',
      'affaires sociales', 'enfance', 'famille', 'citoyen', 'élection', 'vote', 'budget', 'délibération', 'projet municipal',
      'état-civil', 'municipal', 'municipale', 'municipales', 'municipaux', 'municipalité', 'municipalités', 'municipalisation',
      // Histoire et culture de Kaolack
      'histoire', 'fondation', 'création', 'origine', 'kaolack', 'culture', 'patrimoine', 'tradition', 'géographie', 'personnalité', 'personnage', 'figure', 'notable', 'célèbre', 'mosquée', 'religieux', 'islam', 'spiritualité', 'marché', 'économie', 'artisanat', 'enseignement', 'éducation', 'santé', 'transport', 'fleuve', 'saloum', 'anniversaire', '105 ans', 'développement', 'transformation', 'changement', 'évolution',
      // Personnalités connues de Kaolack (ajoutez ici d'autres noms si besoin)
      'serigne mboup', 'cheikh ibrahima niass', 'el hadji ibrahima niass', 'abdoulaye diop', 'moustapha niass', 'samba ka', 'fatou kiné camara', 'alioune badara mbengue', 'mame abdoulaye niass', 'mame bou kounta', 'mame cheikh ibra', 'mame cheikh', 'ibrahima niass', 'mboup', 'niass', 'kounta', 'camara', 'mbengue'
    ];
    const lowerQuery = query.toLowerCase();
    const isMairieRelated = mairieKeywords.some(kw => lowerQuery.includes(kw));
    if (!isMairieRelated) {
      return res.json({
        success: false,
        answer: "Je suis un assistant dédié à la mairie de Kaolack, à l'état civil, à l'histoire de la ville et à ses personnalités. Merci de poser une question en lien avec la municipalité, les démarches administratives, les services de la commune, l'histoire/culture ou les personnalités de Kaolack.",
        source: 'default'
      });
    }

    // Si la clé Gemini est présente, essayer Gemini puis fallback web si besoin
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Réponds en français à la question suivante sur la mairie, l'état civil ou les services municipaux de Kaolack. Sois concis, factuel et pédagogique. Question: ${query}`;
        const result = await model.generateContent(prompt);
        const answer = result?.response?.text();
        if (answer && answer.trim().length > 0) {
          return res.json({
            success: true,
            answer,
            source: 'gemini'
          });
        }
        // Si Gemini ne répond pas, continuer vers fallback web
      } catch (geminiError) {
        console.error('Erreur Gemini:', geminiError);
        // continuer vers fallback web
      }
    }

    // Fallback web (DuckDuckGo puis Wikipedia)
    let result = null;
    let webSource = 'web';
    try {
      const searchQuery = encodeURIComponent(query); // Ne pas préfixer par "Kaolack"
      const duckDuckGoUrl = `https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(duckDuckGoUrl);
      const data = await response.json();
      if (data.AbstractText) {
        result = data.AbstractText;
      } else if (data.Answer) {
        result = data.Answer;
      } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        result = data.RelatedTopics[0].Text || data.RelatedTopics[0].FirstURL;
      } else if (data.Definition) {
        result = data.Definition;
      }
      if (!result) {
        const wikipediaUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent('Kaolack')}`;
        try {
          const wikiResponse = await fetch(wikipediaUrl);
          const wikiData = await wikiResponse.json();
          if (wikiData.extract) {
            result = wikiData.extract.substring(0, 500);
          }
        } catch (wikiError) {
          console.error('Erreur Wikipedia:', wikiError);
        }
      }
    } catch (webError) {
      console.error('Erreur Web:', webError);
      webSource = 'default';
    }
    if (result) {
      return res.json({
        success: true,
        answer: result,
        source: webSource
      });
    } else {
      return res.json({
        success: false,
        answer: "Je n'ai pas trouvé d'informations spécifiques sur ce sujet. Pouvez-vous reformuler votre question ou être plus précis ?",
        source: 'default'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la recherche web:', error);
    return res.status(500).json({
      error: 'Erreur lors de la recherche',
      details: error.message
    });
  }
});

module.exports = router;

