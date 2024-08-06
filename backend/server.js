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
    maxOutputTokens: 50,
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

    lines.forEach(line => {
        line = line.trim();
        if (line && !seen.has(line)) {
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
    Provide a Step by Step workflow for the ${process}. For example, for the Employee onboarding, the workflow should be:
    Step 1: Pre-Onboarding
    Description: Send offer letter and gather necessary paperwork (employment agreement, tax forms, etc.).
    Step 2: Orientation
    Description: Welcome new hire and provide an overview of the company, its culture, and its policies. Conduct a tour of the facilities and introduce the employee to their team.
    Step 3: Paperwork and Administration
    Description: Complete employment paperwork (I-9, W-4, Direct Deposit Form, etc.) and set up payroll. Issue company hardware and access to necessary systems and software.
    Step 4: Training and Development
    Description: Provide role-specific training to ensure the employee understands their responsibilities and expectations. Offer ongoing training and development opportunities to enhance their skills and knowledge.
    Step 5: Buddy/Mentor Assignment
    Description: Pair the new hire with a buddy or mentor who can provide support and guidance during the onboarding process. Facilitate regular check-ins to monitor progress and address any concerns.
    Step 6: Performance Management
    Description: Establish clear performance expectations and metrics with the employee. Set regular performance reviews to provide feedback and support their growth and development.
    Step 7: Feedback and Evaluation
    Description: Regularly assess the effectiveness of the onboarding process by gathering feedback from both the new hire and their manager. Make adjustments as needed to improve the onboarding experience and ensure a successful transition.

    The response should be in a similar format must contain steps and a short description about the steps and apply to ${process} process.The output should not contain the ${process} in the first line. Ensure the description is at single line
    `;
}

function removeTitleFromWorkflow(title, workflow) {
    // Convert the string into an array of lines
    const lines = workflow.split('\n');

    // Remove lines that match the title
    const filteredLines = lines.filter(line => line.trim() !== title.trim());

    // Return the filtered lines as a string
    return filteredLines.join('\n');
}

app.post('/', async (req, res) => {
    const data = req.body;
    const prompt = createPrompt(data);
    const response = await getResponse(prompt);
    console.log(response);

    // Ensure the response is properly formatted before cleaning and formatting
    const cleanedResponse = removeTitleFromWorkflow(data['Enter the Process'], response);
    const final = cleanAndFormatText(cleanedResponse);
    console.log(final);
    res.json(final);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
