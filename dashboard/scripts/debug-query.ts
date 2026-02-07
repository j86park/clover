
import { parseQueryIntent } from '../src/lib/query/nl-parser';
import { generateSafeSQL } from '../src/lib/query/sql-generator';
import * as fs from 'fs';
import path from 'path';

// Manual env loader
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

async function debug() {
    const question = "Which LLM model recommends me most?";
    const userId = "00000000-0000-0000-0000-000000000000";

    console.log('Question:', question);

    const intent = await parseQueryIntent(question);
    console.log('Parsed Intent:', JSON.stringify(intent, null, 2));

    const sql = generateSafeSQL(intent, userId);
    console.log('Generated SQL:\n', sql);

    // Simulation of DB Security Check
    const forbiddenJS = /\b(UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE)\b/i;

    console.log('\n--- Simulation ---');
    console.log('Testing SQL against security regex (\\b boundaries)...');
    if (forbiddenJS.test(sql)) {
        console.log('❌ FAILED security check! Match found.');
        const match = sql.match(forbiddenJS);
        console.log('Match:', match?.[0]);
    } else {
        console.log('✅ PASSED security check.');
    }
}

debug().catch(console.error);
