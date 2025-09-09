/*
═══════════════════════════════
            🔰 WANZ OFFICIAL               
═══════════════════════════════
 ⚠️  JANGAN HAPUS CREDIT DEVELOPER
═══════════════════════════════
 📱 WhatsApp : wa.me/6283898286223
 📸 Instagram : instagram.com/wan_xyzbca
═══════════════════════════════
*/

/*
═══════════════════════════════
═══════ KONFIGURASI GLOBAL ════════
═══════════════════════════════
*/

/*
global.domain = 'https://wanzganteng.biz.id'
global.apikey = 'ptla_'
global.capikey = 'ptlc_'
global.eggsnya = '15'
global.location = '1'

( konfigurasi di config.js/settings.js kalian)
*/

/*
═══════════════════════════════
══════ FUNCTION  CPANEL BUTTON ═════
═══════════════════════════════

INPUT CASE
═══════════════════════════════
.cpanel spesifikasi,namapanel,nomortarget
═══════════════════════════════

CONTOH
═══════════════════════════════
.cpanel unli,wanzganteng,6283898206223
═══════════════════════════════
*/

async function CreatePanel(sock, paket, username, nomorRaw) {
  const crypto = require('crypto')
  const fetch = require('node-fetch')

  const nomor = nomorRaw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  const email = `${username}_wanzdev@gmail.com`

  const specs = {
    '1gb':  { memo: "1024",  disk: "1024",  cpu: "50"  },
    '2gb':  { memo: "2048",  disk: "2048",  cpu: "70"  },
    '3gb':  { memo: "3072",  disk: "3072",  cpu: "90"  },
    '4gb':  { memo: "4096",  disk: "4096",  cpu: "100" },
    '5gb':  { memo: "5120",  disk: "5120",  cpu: "110" },
    '6gb':  { memo: "6144",  disk: "6144",  cpu: "120" },
    '7gb':  { memo: "7168",  disk: "7168",  cpu: "130" },
    '8gb':  { memo: "8192",  disk: "8192",  cpu: "140" },
    '9gb':  { memo: "9150",  disk: "9150",  cpu: "150" },
    'unli': { memo: "0", disk: "0", cpu: "0" }
  }

  const spec = specs[paket.toLowerCase()]
  if (!spec) throw new Error('Paket tidak ditemukan.')

  const password = crypto.randomBytes(5).toString('hex')

  // === BUAT AKUN USER ===
  const urlUser = `${global.domain}/api/application/users`
  const resUser = await fetch(urlUser, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + global.apikey
    },
    body: JSON.stringify({
      email, username, first_name: username,
      last_name: username, language: "en",
      password: "wanzganteng"
    })
  })

  const userData = await resUser.json()
  if (userData.errors) throw new Error(JSON.stringify(userData.errors[0], null, 2))
  const user = userData.attributes

  // === AMBIL STARTUP CMD DARI EGG ===
  const eggRes = await fetch(`${global.domain}/api/application/nests/5/eggs/${global.eggsnya}`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + global.apikey
    }
  })
  const eggData = await eggRes.json()
  const startup_cmd = eggData.attributes.startup

  // === BUAT SERVER ===
  const serverRes = await fetch(`${global.domain}/api/application/servers`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + global.apikey
    },
    body: JSON.stringify({
      name: username,
      user: user.id,
      egg: parseInt(global.eggsnya),
      docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
      startup: startup_cmd,
      environment: { "INST": "npm", "USER_UPLOAD": "0", "AUTO_UPDATE": "0", "CMD_RUN": "npm start" },
      limits: { memory: spec.memo, swap: 0, disk: spec.disk, io: 500, cpu: spec.cpu },
      feature_limits: { databases: 0, backups: 0, allocations: 0 },
      deploy: { locations: [parseInt(global.location)], dedicated_ip: false, port_range: [] }
    })
  })
  const serverData = await serverRes.json()
  if (serverData.errors) throw new Error(JSON.stringify(serverData.errors[0], null, 2))
  const server = serverData.attributes

  // === KIRIM PRIVATE MESSAGE ===
  const readmore = String.fromCharCode(8206).repeat(4001)
  const notifText = `*BERIKUT DATA PANEL ANDA*\n${readmore}\n*• 👤 Username : ${user.username}*\n*• 🔑 Password : ${password}*\n*• 🖥️ Server   : ${paket.toUpperCase()}*\n\n*💾 Simpan data ini baik-baik dan jangan dibagikan ke siapa pun.*`

  const privateMsg = generateWAMessageFromContent(nomor, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({ text: notifText }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: `Wanz Official` }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              { name: "cta_url", buttonParamsJson: `{"display_text":"LOGIN","url":"${global.domain}"}` },
              { name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "COPY USERNAME", copy_code: user.username }) },
              { name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "COPY PASSWORD", copy_code: password }) },
              { name: "cta_url", buttonParamsJson: `{"display_text":"DEVELOPER SCRIPT","url":"https://wa.me/6283898206223"}` }
            ]
          })
        })
      }
    }
  }, {})

  await sock.relayMessage(nomor, privateMsg.message, { messageId: privateMsg.key.id })

  return {
    userId: user.id,
    serverId: server.id,
    username: user.username,
    password: password,
    paket: paket
  }
}

