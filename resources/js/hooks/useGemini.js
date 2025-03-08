import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const objectToJsonString = (obj) => {
    try {
      return `\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
    } catch (error) {
      console.error("Error converting object to JSON:", error);
      return "Error: Unable to convert object to JSON.";
    }
  };

  const promptBuilder = (name, obj, instructions) => {
    return `${instructions}\n${name}\n${objectToJsonString(obj)}`;
  };

  const prompt = async (promptText, setResponse) => {
    setLoading(true);
    setError(null);

    try {
      const result = await model.generateContent(promptText + GENERAL_INSTRUCTIONS + CONTEXT);
      const text = result.response.text();
      if (setResponse) setResponse(text); // Allow caller to handle response
      return text;
    } catch (err) {
      console.error('Error generating content:', err);
      setError('An error occurred.');
      return 'An error occurred.';
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, prompt, objectToJsonString, promptBuilder };
};

export default useGemini;

const GENERAL_INSTRUCTIONS = `
JUST TEXT NO MARKDOWNS,
DO NOT RESPOND WITH RAW UTC DATE,
TRANSFORM DATE TO PH TIME LOCALE,
NO TITLE,
`;

const CONTEXT = `
THIS IS A CONTEXT DOESNT NEED TO MENTION ANY OF THIS IN YOUR RESPONSE,
ALL DATA IS FROM BUS TRANSPORTATION MANAGEMENT SYSTEM SPECIFICALLY LOGISTIC MODULE,
LOGISTIC MODULE CONTAIN THE FOLLOWING SUB MODULE: INVENTORY AND WAREHOUSING MANAGEMENT, AUDIT MANAGEMENT (NOT FINANCIAL ONLY IN INVENTORY), INFRASTRUCTURE MAINTENANCE MANAGEMENT (ACT AS PORTAL FOR REQUESTING MATERIALS),
SO THERE IS NO TERM "SALE" BUT "REQUEST BECAUSE INCOMING PRODUCT FROM PROCUREMENT IS BASED ON REQUESTS AND ALL PRODUCT RELEASE IS CAME FROM REQUESTS,
THERE IS NO ALSO PROFIT GAIN BECAUSE THIS IS NOT A INVENTORY FOR PRODUCT THAT ARE SALE,
`;
