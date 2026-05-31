const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = 'fa942b46197213cc143cfb59545be8ab';
const OWNER = 'ZphyrC';
const REPO = 'ad-calcium-h5';
const BASE = 'C:\\Users\\21645\\Desktop\\h5';

// Files/folders to skip
const SKIP = ['node_modules', '.git', 'deploy.js', '_temp_strategy.txt',
  'AD钙奶30周年-项目指南.pptx', 'AD钙奶h5设计 周展冲 叶煜洁 涂美琳.pptx',
  '参考素材', 'lib', 'components', '娃哈哈【2026.3.19确定版】\\2026第18届大广赛-娃哈哈-命题策略单（4.28最新版）.docx',
  '娃哈哈【2026.3.19确定版】\\娃哈哈LOGO【2026】.ai', 'pic\\wahaha-logo.pdf',
  '娃哈哈【2026.3.19确定版】\\AD钙.mp4',
  'fronts\\寒蝉手拙体.ttf'];

function shouldSkip(filePath) {
  const rel = path.relative(BASE, filePath).replace(/\\/g, '/');
  for (const s of SKIP) {
    if (rel === s.replace(/\\/g, '/') || rel.startsWith(s.replace(/\\/g, '/'))) return true;
  }
  return false;
}

function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (shouldSkip(full)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function apiPost(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'gitee.com',
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        const code = res.statusCode;
        if (code === 201 || code === 200) {
          console.log('  OK');
          resolve(JSON.parse(d));
        } else if (code === 400 && d.includes('already exists')) {
          console.log('  (already exists)');
          resolve(null);
        } else {
          console.log(`  FAIL ${code}: ${d.substring(0, 200)}`);
          reject(new Error(`HTTP ${code}`));
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function deploy() {
  const allFiles = getAllFiles(BASE);
  console.log(`Found ${allFiles.length} files to upload\n`);

  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const rel = path.relative(BASE, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath);
    const b64 = content.toString('base64');
    const sizeKB = (content.length / 1024).toFixed(1);

    process.stdout.write(`[${i + 1}/${allFiles.length}] ${rel} (${sizeKB}KB)...`);

    try {
      await apiPost(
        `/api/v5/repos/${OWNER}/${REPO}/contents/${encodeURI(rel)}`,
        {
          access_token: TOKEN,
          content: b64,
          message: `Add ${rel}`,
        }
      );
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('\n=== Upload complete! ===');
  console.log(`Repo: https://gitee.com/${OWNER}/${REPO}`);
  console.log('Now go to: repo -> 服务 -> Gitee Pages -> 启动');
}

deploy().catch(console.error);
