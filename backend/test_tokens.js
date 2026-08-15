const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const res = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'Output exactly this JSON: {"ok": true}' }],
      max_tokens: 6000,
      response_format: { type: 'json_object' }
    });
    console.log('SUCCESS with max_tokens=6000');
    console.log('Usage:', res.usage);
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}
test();
