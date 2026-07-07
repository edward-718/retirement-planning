const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let TOKEN = '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';
let REPO = 'retirement-planning';
let OWNER = 'edward-718';
const STATE_FILE = path.join(__dirname, '.upload-state.json');

// ========== 本地状态管理（用于增量检测）==========

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function computeHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// 对比本地文件与上次上传状态，返回需要上传的文件列表
function detectChanges(files, state) {
  const toUpload = [];
  const currentPaths = new Set();

  for (const file of files) {
    currentPaths.add(file.path);
    const hash = computeHash(file.fullPath);
    const last = state[file.path];

    // 如果文件不存在于状态记录，或哈希变了，则需要上传
    if (!last || last.hash !== hash) {
      toUpload.push({ ...file, hash });
    }
  }

  // 检测远程是否有文件被本地删除了（可选：如需删除远程文件可开启）
  // const toDelete = Object.keys(state).filter(p => !currentPaths.has(p));

  return { toUpload, currentPaths };
}

// ========== GitHub API 请求封装（带重试）==========

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function githubRequest(method, pathname, data = null, retries = 3) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: pathname,
      method: method,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'retirement-planning-uploader',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', async (err) => {
      if (retries > 0) {
        console.log(`  请求失败，${retries}秒后重试...`);
        await sleep(1000 * (4 - retries));
        try {
          const result = await githubRequest(method, pathname, data, retries - 1);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(err);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// ========== GitHub 仓库操作 ==========

async function getRepo() {
  return await githubRequest('GET', `/repos/${OWNER}/${REPO}`);
}

async function createRepo() {
  return await githubRequest('POST', '/user/repos', {
    name: REPO,
    description: '养老准备系统 - 个人养老规划工具',
    private: false,
    auto_init: true
  });
}

async function getAuthenticatedUser() {
  const result = await githubRequest('GET', '/user');
  if (result.status === 200) {
    console.log(`认证用户: ${result.data.login}`);
    return result.data.login;
  }
  console.log('获取用户信息失败:', result.data);
  return null;
}

async function getFileSha(filePath) {
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
  const result = await githubRequest('GET', `/repos/${OWNER}/${REPO}/contents/${encodedPath}`);
  if (result.status === 200 && result.data.sha) {
    return result.data.sha;
  }
  return null;
}

async function uploadFile(filePath, content, commitMessage) {
  const sha = await getFileSha(filePath);
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
  const data = {
    message: commitMessage || `Update ${filePath}`,
    content: Buffer.from(content).toString('base64'),
    sha: sha
  };
  const result = await githubRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${encodedPath}`, data);
  if (result.status !== 200 && result.status !== 201) {
    console.log(`失败原因:`, JSON.stringify(result.data).substring(0, 300));
  }
  return result;
}

// ========== 文件扫描 ==========

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    // 跳过不需要上传的目录和文件
    if (item === '.trae' || item === 'github-upload.cjs' || item === '.upload-state.json') continue;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item === 'node_modules') continue;
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push({
        path: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
        fullPath: fullPath
      });
    }
  }
  return files;
}

// ========== 主流程 ==========

async function main() {
  try {
    // 1. 认证检查
    console.log('检查认证信息...');
    let user = await getAuthenticatedUser();
    if (!user) {
      console.log('无法获取认证用户，请检查 token 是否有效');
      return;
    }
    OWNER = user;

    // 2. 检查仓库
    console.log(`\n检查仓库 ${OWNER}/${REPO}...`);
    let repoResult = await getRepo();

    if (repoResult.status === 404) {
      console.log('仓库不存在，正在创建...');
      repoResult = await createRepo();
      if (repoResult.status === 201) {
        console.log('仓库创建成功!');
      } else if (repoResult.status === 422 && repoResult.data.errors?.[0]?.message?.includes('already exists')) {
        console.log('仓库已存在 (422)，将继续上传文件.');
      } else {
        console.log('仓库创建失败:', repoResult.data);
        return;
      }
    } else if (repoResult.status === 200) {
      console.log('仓库已存在.');
    } else {
      console.log('检查仓库失败:', repoResult.data);
      return;
    }

    // 3. 扫描本地文件
    const projectRoot = __dirname;
    const files = getAllFiles(projectRoot);
    console.log(`\n扫描到 ${files.length} 个本地文件`);

    // 4. 加载上次状态并检测变更
    const state = loadState();
    const { toUpload } = detectChanges(files, state);

    if (toUpload.length === 0) {
      console.log('\n✓ 没有文件需要上传（所有文件已是最新）');
      return;
    }

    console.log(`检测到 ${toUpload.length} 个文件有变更，开始上传...\n`);

    // 5. 生成统一的 commit message 前缀（基于日期）
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);
    const commitPrefix = `[${dateStr} ${timeStr}]`;

    // 6. 逐个上传变更文件
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const content = fs.readFileSync(file.fullPath, 'utf-8');
      const commitMessage = `${commitPrefix} ${file.path}`;

      process.stdout.write(`[${i + 1}/${toUpload.length}] 上传 ${file.path} ... `);
      const result = await uploadFile(file.path, content, commitMessage);

      if (result.status === 200 || result.status === 201) {
        console.log('✓');
        // 更新状态：记录成功上传的文件的哈希
        state[file.path] = { hash: file.hash, uploadedAt: new Date().toISOString() };
      } else {
        console.log(`✗ (${result.status})`);
      }

      // 请求间隔，避免触发速率限制
      if (i < toUpload.length - 1) {
        await sleep(300);
      }
    }

    // 7. 保存状态
    saveState(state);

    console.log('\n上传完成!');
    console.log(`本次上传: ${toUpload.length} 个文件，跳过: ${files.length - toUpload.length} 个未变更文件`);
  } catch (error) {
    console.error('错误:', error.message);
  }
}

main();
