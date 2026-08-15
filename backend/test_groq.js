require('dotenv').config({ path: '.env' });
const { generateLetter } = require('./src/services/groqService');

generateLetter({
  player1Name: 'Lucas',
  player2Name: 'Beatriz',
  timeTogether: '8 meses',
  coupleStyle: 'romantico',
  interests: 'Jantar Especial,Vinho',
  traits: 'Adoro o seu sorriso e como voce ilumina meus dias.'
}).then(r => {
  console.log('SUCCESS!');
  console.log('Raw (primeiros 500):', r.slice(0, 500));
  try {
    const parsed = JSON.parse(r);
    console.log('Keys:', Object.keys(parsed));
    console.log('titulo:', parsed.titulo);
    console.log('introducao length:', parsed.introducao?.length);
    console.log('corpo length:', parsed.corpo_principal?.length);
  } catch(e) {
    console.log('PARSE ERROR:', e.message);
  }
}).catch(e => console.error('GENERATION ERROR:', e.message));
