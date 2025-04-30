const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const config = require('./config');
const postText = fs.readFileSync('post.txt', 'utf-8');
const LOG_FILE = './logs/log.txt';

function banner() {
  return `
╔════════════════════════════════════════════╗
║     FBGroupAutoPost - Powered by           ║
║             0xGolip-Team Tools             ║
╠════════════════════════════════════════════╣
║  Auto Post ke Grup Facebook (No API)       ║
║  No Cookie. No Manual Input. Just Run.     ║
╚════════════════════════════════════════════╝
  `;
}

async function autoPost() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.clear();
  console.log(banner());

  rl.question("Masukkan URL grup Facebook: ", async (groupId) => {
    rl.close();
    console.log(`[+] Login sebagai: ${config.email}`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
      await page.goto('https://facebook.com/login', { waitUntil: 'networkidle2' });
      await page.type('#email', config.email, { delay: 50 });
      await page.type('#pass', config.password, { delay: 50 });
      await page.click('[name=login]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      console.log(`[+] Membuka grup...`);
      await page.goto(groupId, { waitUntil: 'networkidle2' });

      console.log(`[+] Menyiapkan postingan...`);
      await page.waitForSelector('[role="textbox"]', { visible: true });
      await page.click('[role="textbox"]');
      await page.keyboard.type(postText, { delay: 20 });

      await page.waitForTimeout(1000);
      const postBtn = await page.$('div[aria-label="Post"]');
      if (postBtn) {
        await postBtn.click();
        console.log(`[✓] Post berhasil dikirim!`);
        fs.appendFileSync(LOG_FILE, `[✓] Success - ${new Date().toISOString()}\n`);
      } else {
        throw new Error("Tombol 'Post' tidak ditemukan.");
      }

    } catch (err) {
      console.log(`[✗] Gagal: ${err.message}`);
      fs.appendFileSync(LOG_FILE, `[✗] Failed: ${err.message} - ${new Date().toISOString()}\n`);
    }

    await browser.close();
  });
}

function showLog() {
  console.clear();
  console.log(banner());
  const log = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : 'Belum ada log.';
  console.log(`\n===== LOG POSTING =====\n${log}`);
}

function showMenu() {
  console.clear();
  console.log(banner());
  console.log("1. Jalankan Auto Post");
  console.log("2. Lihat Log Postingan");
  console.log("3. Keluar\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Pilih opsi (1/2/3): ", async (input) => {
    rl.close();
    if (input === '1') await autoPost();
    else if (input === '2') showLog();
    else console.log("Keluar. Sampai jumpa!");
  });
}

showMenu();
