const { GoogleGenerativeAI, GoogleGenerativeAIResponseError } = require("@google/generative-ai");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
if (!process.env.GOOGLE_API_KEY) {
    console.error("Please set the GOOGLE_API_KEY environment variable.");
    process.exit(1);
}

const generationConfig = {
    stopSequences: ["red"],
    maxOutputTokens: 50, // Adjust as needed
    temperature: 0.7,
    topP: 0.1,
    topK: 16,
};

async function getResponse(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    try {
        const result = await model.generateContent(prompt, generationConfig);
        if (result.response && result.response.candidates && result.response.candidates.length > 0) {
            const candidate = result.response.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                return candidate.content.parts[0].text;
            } else {
                return "No content found in the response.";
            }
        } else {
            return "No candidates found in the response.";
        }
    } catch (error) {
        if (error instanceof GoogleGenerativeAIResponseError) {
            return `Error from Google Generative AI API: ${error.message}`;
        } else {
            return `Unexpected error: ${error.message}`;
        }
    }
}

function cleanAndFormatText(text) {
    text = text.replace(/\*/g, '').trim();
    const lines = text.split('\n');
    const seen = new Set();
    let result = [];
    let skipSection = false;

    lines.forEach(line => {
        line = line.trim();
        if (!skipSection && line && !seen.has(line)) {
            result.push(line);
            seen.add(line);
        }
    });

    return result;
}




function createPrompt(data) {
    const process = data['Enter the Process'];
    console.log(process);
    return `
    Provide a Step by Step workflow for the ${process}.For example consider the user asks step by step worfklow for 
    Preparing CHutney , the response should be 
    Step 1 : Gather the requirements or materials 
    Step 2 : Wash the vegetables that are needed to be grinded 
    Step 3 : Grind the ingridents by adding some amount of water 
    Step 4 : Add water based on the requirement 
    Step 5 : Add some salts other species 
    The response should be in a similar format(must contain steps and a short description about the steps) and apply to ${process} process
    `;
}
function convertArrayToObject(array) {
    const result = {};
    let currentKey = '';

    array.forEach(item => {
        item = item.trim();
        if (item.startsWith('Step ')) {
            currentKey = item;
            result[currentKey] = '';
        } else if (currentKey) {
            if (result[currentKey]) {
                result[currentKey] += '\n';
            }
            result[currentKey] += item;
        }
    });

    return result;
}

app.post('/', async (req, res) => {
    const data = req.body;
    const prompt = createPrompt(data);
    const response = await getResponse(prompt);
    const final = cleanAndFormatText(response);
    const result = convertArrayToObject(final);
    console.log(result);
    res.json(result);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
