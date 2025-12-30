
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const cleanLine = trimmed.replace(/^export\s+/, '');
            const match = cleanLine.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();
const apiKey = env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No VITE_GEMINI_API_KEY found");
    process.exit(1);
}

console.log(`🔑 Found API Key: ${apiKey.substring(0, 5)}...`);

async function test() {
    try {
        console.log("📡 Fetching available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`❌ Fetch failed: ${response.status}`);
            const text = await response.text();
            console.error(`Response: ${text}`);
            return;
        }

        const data = await response.json();
        const allModels = data.models?.map(m => m.name) || [];

        // Find candidate: prefer flash, then pro.
        const candidate = allModels.find(m => m.includes('gemini') && !m.includes('embedding') && !m.includes('vision') && (m.includes('flash') || m.includes('pro')));

        if (candidate) {
            let modelName = candidate.replace('models/', '');
            console.log(`✅ Found candidate model: ${modelName} (${candidate})`);

            console.log(`🔄 Testing generation...`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello!");
            const response = await result.response;
            console.log("🎉 SUCCESS! Response:", response.text());
        } else {
            console.error("❌ No suitable Gemini model found. Available:", allModels);
        }

    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

test();
