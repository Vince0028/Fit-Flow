
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
                env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (e) { return {}; }
}

const env = loadEnv();
const apiKey = env.VITE_GEMINI_API_KEY;

async function findModel() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) return;
        const data = await response.json();
        const allModels = data.models?.map(m => m.name) || [];
        const candidate = allModels.find(m => m.includes('gemini') && !m.includes('embedding') && !m.includes('vision') && (m.includes('flash') || m.includes('pro')));

        if (candidate) {
            fs.writeFileSync('model_name.txt', candidate.replace('models/', ''));
        } else {
            fs.writeFileSync('model_name.txt', 'NO_MODEL');
        }
    } catch (e) {
        fs.writeFileSync('model_name.txt', 'ERROR: ' + e.message);
    }
}

findModel();
