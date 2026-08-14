// Vercel Serverless Function entry point
// Importa o Express app do backend e o expõe como handler
const app = require('../backend/src/app');
module.exports = app;
