/**
 * Cloudflare R2 Storage Service
 *
 * Uses native Node.js fetch (available since v18) with AWS Signature V4
 * to bypass the TLS compatibility issues between Node 24 / OpenSSL 3.x
 * and the @aws-sdk S3 client's HTTP handler on certain endpoints.
 *
 * ⚠️  PRODUÇÃO: Não há fallback para disco local.
 *     A Vercel usa Serverless Functions (efêmeras) — gravação local é proibida.
 */

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const crypto = require('crypto');

// ── Helpers: AWS Signature V4 ────────────────────────────────────────────────

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function hexHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function getSigningKey(secretKey, date, region, service) {
  const kDate = hmac(`AWS4${secretKey}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

/**
 * Signs and sends a PUT request to Cloudflare R2 using AWS Signature V4.
 */
async function r2Put(key, body, contentType) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const url = `https://${host}/${bucket}/${key}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = hexHash(body);

  const headers = {
    host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    'content-type': contentType,
    'cache-control': 'public, max-age=31536000',
  };

  // Canonical headers (sorted)
  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headers[k]}`).join('\n') + '\n';
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [
    'PUT',
    `/${bucket}/${key}`,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hexHash(canonicalRequest),
  ].join('\n');

  const signingKey = getSigningKey(secretKey, dateStamp, 'auto', 's3');
  const signature = hmac(signingKey, stringToSign).toString('hex');

  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
      authorization,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`R2 PUT falhou: ${response.status} ${response.statusText} — ${text}`);
  }

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

// ── Validate R2 config on startup ────────────────────────────────────────────
function validateR2Config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;
  const bad = (v) => !v || v.includes('PREENCHA_AQUI');

  if (bad(R2_ACCOUNT_ID) || bad(R2_ACCESS_KEY_ID) || bad(R2_SECRET_ACCESS_KEY) || bad(R2_BUCKET_NAME)) {
    console.error('🚨 ERRO: Cloudflare R2 NÃO configurado! Configure as variáveis R2_* no .env.');
    console.error('   Em produção (Vercel), não é possível gravar arquivos localmente.');
    return false;
  }
  console.log(`☁️  Storage: Cloudflare R2 configurado`);
  console.log(`☁️  Bucket: ${R2_BUCKET_NAME}`);
  return true;
}

const r2Available = validateR2Config();

// ── Public API ───────────────────────────────────────────────────────────────

async function uploadFile(fileBuffer, originalName, mimeType, giftId) {
  if (!r2Available) {
    throw new Error('Cloudflare R2 não configurado. Upload de fotos indisponível.');
  }

  const ext = path.extname(originalName) || '.jpg';
  const key = `gifts/${giftId}/${uuidv4()}${ext}`;

  console.log(`☁️  [R2] Upload: ${key}`);
  const url = await r2Put(key, fileBuffer, mimeType);
  console.log(`✅ [R2] OK: ${url}`);
  return url;
}

async function uploadMultipleFiles(files, giftId) {
  return Promise.all(files.map((f) => uploadFile(f.buffer, f.originalname, f.mimetype, giftId)));
}

module.exports = { uploadFile, uploadMultipleFiles };
