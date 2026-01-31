const axios = require("axios");

const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validasi input
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Fetch portfolio data dari database
    let portfolioContext = '';
    try {
      const portfolioData = await getPortfolioData();
      portfolioContext = formatPortfolioContext(portfolioData);
    } catch (error) {
      console.log('Failed to fetch portfolio data:', error.message);
      // Continue without portfolio data
    }

    // Siapkan system prompt dengan batasan yang ketat
    const systemPrompt = `You are an AI assistant EXCLUSIVELY for Irvan Nasyakban's portfolio website. 

${portfolioContext}

CRITICAL RULES - YOU MUST FOLLOW THESE STRICTLY:
1. ONLY answer questions about Irvan Nasyakban's portfolio information (projects, skills, experience, education, certifications, organizations, contact info)
2. If a question is NOT related to Irvan's portfolio, you MUST respond with EXACTLY this message in Bahasa Indonesia: "Mohon maaf saya tidak dapat memberikan informasi apapun kecuali tentang portfolio Irvan Nasyakban"
3. DO NOT answer general knowledge questions, math problems, coding help, or any topic outside Irvan's portfolio
4. DO NOT provide information about other people, companies, or topics
5. DO NOT engage in conversations about politics, religion, or sensitive topics
6. DO NOT write code, solve problems, or provide tutorials unless it's specifically about Irvan's portfolio projects

ALLOWED TOPICS:
- Irvan's personal information (name, contact, education)
- Irvan's technical skills and proficiency levels
- Irvan's projects (descriptions, technologies used, links)
- Irvan's work experience and job descriptions
- Irvan's organizational activities
- Irvan's educational background
- Irvan's certifications and achievements
- How to contact Irvan
- Questions comparing Irvan's skills or projects

EXAMPLES OF INVALID QUESTIONS (respond with the rejection message):
- "What is the capital of France?"
- "How do I make a cake?"
- "Write a Python function to sort an array"
- "What is 2+2?"
- "Tell me about Elon Musk"
- "What's the weather today?"
- "How to learn programming?"

RESPONSE FORMAT:
- Be friendly, professional, and informative for VALID questions
- Provide specific details from the portfolio data
- Use markdown formatting for better readability (bold, lists, etc.)
- For INVALID questions, respond ONLY with: "Mohon maaf saya tidak dapat memberikan informasi apapun kecuali tentang portfolio Irvan Nasyakban"`;

    // Siapkan messages untuk API
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      // Tambahkan conversation history jika ada
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message
      }
    ];

    // Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.3, // Lower temperature for more focused responses
        max_tokens: 1024,
        top_p: 0.9, // Lower top_p for more deterministic responses
        stream: false,
        stop: null // No stop sequences
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    // Extract AI response
    let aiMessage = response.data.choices[0].message.content;

    // Post-processing: Double check if response is about portfolio
    // This is a safety net in case the model doesn't follow instructions perfectly
    const isPortfolioRelated = checkIfPortfolioRelated(message, aiMessage);
    
    if (!isPortfolioRelated) {
      aiMessage = "Mohon maaf saya tidak dapat memberikan informasi apapun kecuali tentang portfolio Irvan Nasyakban";
    }

    // Return response
    return res.status(200).json({
      success: true,
      message: aiMessage,
      conversationId: response.data.id,
      usage: response.data.usage
    });

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

// Helper function to check if question/response is portfolio-related
const checkIfPortfolioRelated = (question, response) => {
  const lowerQuestion = question.toLowerCase();
  const lowerResponse = response.toLowerCase();

  // Keywords that indicate portfolio-related questions
  const portfolioKeywords = [
    'irvan', 'nasyakban', 'portfolio', 'project', 'skill', 'experience',
    'education', 'certificate', 'organization', 'work', 'job', 'technical',
    'programming', 'developer', 'software', 'contact', 'email', 'phone',
    'doorsmeer', 'mentor heal', 'greensys', 'miti', 'javascript', 'python',
    'react', 'express', 'node', 'database', 'mysql', 'mongodb'
  ];

  // Keywords that indicate non-portfolio questions (common general knowledge)
  const nonPortfolioKeywords = [
    'weather', 'recipe', 'capital', 'country', 'president', 'celebrity',
    'movie', 'song', 'book', 'history', 'science', 'math problem', 'solve',
    'calculate', 'write code', 'tutorial', 'how to make', 'what is the meaning'
  ];

  // Check if response is the rejection message
  if (response.includes("Mohon maaf saya tidak dapat memberikan informasi apapun kecuali tentang portfolio Irvan Nasyakban")) {
    return true; // It's handling it correctly
  }

  // Check for obvious non-portfolio keywords in question
  const hasNonPortfolioKeywords = nonPortfolioKeywords.some(keyword => 
    lowerQuestion.includes(keyword)
  );

  if (hasNonPortfolioKeywords) {
    return false; // Definitely not portfolio-related
  }

  // Check for portfolio keywords in question or response
  const hasPortfolioKeywords = portfolioKeywords.some(keyword => 
    lowerQuestion.includes(keyword) || lowerResponse.includes(keyword)
  );

  // If question is very short and generic, be more strict
  if (question.trim().split(' ').length <= 3 && !hasPortfolioKeywords) {
    return false;
  }

  return hasPortfolioKeywords;
};

const getPortfolioData = async () => {
  const apiUrl = process.env.API_URL;
  
  try {
    const [biodata, certificates, education, experience, organizations, projects, skills] = await Promise.all([
      axios.get(`${apiUrl}/all-biodata`).catch(() => ({ data: null })),
      axios.get(`${apiUrl}/all-certificate`).catch(() => ({ data: [] })),
      axios.get(`${apiUrl}/all-education`).catch(() => ({ data: [] })),
      axios.get(`${apiUrl}/all-experience`).catch(() => ({ data: [] })),
      axios.get(`${apiUrl}/all-organizations`).catch(() => ({ data: [] })),
      axios.get(`${apiUrl}/all-project`).catch(() => ({ data: [] })),
      axios.get(`${apiUrl}/all-skill`).catch(() => ({ data: [] }))
    ]);

    return {
      biodata: biodata.data,
      certificates: certificates.data,
      education: education.data,
      experience: experience.data,
      organizations: organizations.data,
      projects: projects.data,
      skills: skills.data
    };
  } catch (error) {
    console.error('Error fetching portfolio data:', error.message);
    throw error;
  }
};

const formatPortfolioContext = (data) => {
  let context = '';

  // Biodata
  if (data.biodata) {
    const bio = data.biodata;
    context += `\n## PERSONAL INFORMATION\n`;
    context += `Name: ${bio.nama}\n`;
    context += `Email: ${bio.email}\n`;
    context += `Phone: ${bio.noHp}\n`;
    context += `Address: ${bio.alamat}\n`;
    context += `Birth Date: ${new Date(bio.tglLahir).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    context += `\n## TECHNICAL SKILLS\n`;
    data.skills.forEach(skill => {
      if (skill.languages) context += `Languages: ${skill.languages}\n`;
      if (skill.frameworks) context += `Frameworks: ${skill.frameworks}\n`;
      if (skill.databases) context += `Databases: ${skill.databases}\n`;
      if (skill.tools) context += `Tools: ${skill.tools}\n`;
      if (skill.other) context += `Other: ${skill.other}\n`;
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    context += `\n## PROJECTS (${data.projects.length} total)\n`;
    data.projects.forEach((project, index) => {
      context += `\n${index + 1}. ${project.judul}\n`;
      context += `   Description: ${project.deskripsi}\n`;
      context += `   Tech Stack: ${project.techStack}\n`;
      if (project.github && project.github !== '-') {
        context += `   GitHub: ${project.github}\n`;
      }
      if (project.link && project.link !== '-') {
        context += `   Live Demo: ${project.link}\n`;
      }
      if (project.tags) {
        context += `   Tags: ${project.tags}\n`;
      }
    });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    context += `\n## WORK EXPERIENCE (${data.experience.length} total)\n`;
    data.experience.forEach((exp, index) => {
      context += `\n${index + 1}. ${exp.divisi} at ${exp.namaPerusahaan}\n`;
      context += `   Period: ${exp.periode}\n`;
      context += `   Location: ${exp.alamat}\n`;
      context += `   Status: ${exp.status}\n`;
      context += `   Description: ${exp.jobdesk}\n`;
    });
  }

  // Organizations
  if (data.organizations && data.organizations.length > 0) {
    context += `\n## ORGANIZATIONS (${data.organizations.length} total)\n`;
    data.organizations.forEach((org, index) => {
      context += `\n${index + 1}. ${org.divisi} at ${org.organisasi}\n`;
      context += `   Period: ${org.periode}\n`;
      context += `   Location: ${org.lokasi}\n`;
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    context += `\n## EDUCATION (${data.education.length} total)\n`;
    data.education.forEach((edu, index) => {
      context += `\n${index + 1}. ${edu.bagian} at ${edu.instansi}\n`;
      context += `   Period: ${edu.periode}\n`;
    });
  }

  // Certificates
  if (data.certificates && data.certificates.length > 0) {
    context += `\n## CERTIFICATIONS (${data.certificates.length} total)\n`;
    data.certificates.forEach((cert, index) => {
      context += `\n${index + 1}. ${cert.judul}\n`;
      context += `   Description: ${cert.deskripsi}\n`;
      if (cert.link && cert.link !== '-') {
        context += `   Link: ${cert.link}\n`;
      }
    });
  }

  return context;
};

const getPortfolioContext = async (req, res) => {
  try {
    const portfolioData = await getPortfolioData();
    
    return res.status(200).json({
      success: true,
      data: portfolioData,
      formattedContext: formatPortfolioContext(portfolioData)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get portfolio context',
      error: error.message
    });
  }
};

module.exports = {
  chatWithAI,
  getPortfolioContext,
};