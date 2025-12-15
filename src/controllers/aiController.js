const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in .env file');
  } else {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI initialized');
  }
} catch (error) {
  console.error('Failed to initialize Gemini:', error.message);
}

exports.chatWithAI = async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    console.log('AI Chat request:', message);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    console.log('AI Response generated');

    res.status(200).json({
      success: true,
      data: {
        message: text,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service error: ' + error.message
    });
  }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }

    console.log('AI Suggestion request for:', title);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze this forum post and provide suggestions in JSON format:

Title: ${title}
Content: ${content}

Respond with ONLY valid JSON (no markdown, no extra text):
{
  "tags": ["tag1", "tag2", "tag3"],
  "category": "General Discussion",
  "summary": "Brief summary"
}

Categories: General Discussion, Technical Support, Feature Requests, Announcements`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('AI Raw response:', text);

    let suggestions;
    try {
      const cleanText = text.replace(/``````/g, '').trim();
      suggestions = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      suggestions = {
        tags: ['discussion', 'help', 'question'],
        category: 'General Discussion',
        summary: 'A forum discussion post'
      };
    }

    console.log('AI Suggestions generated:', suggestions);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service error: ' + error.message
    });
  }
};
