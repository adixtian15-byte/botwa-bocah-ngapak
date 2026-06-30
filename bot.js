const {
 default: makeWASocket,
 useMultiFileAuthState,
 DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const qrcode = require("qrcode-terminal")
const config = require("./config")


let spam = {}
let users = {}


console.log("BOT START")


function getUser(id){

if(!users[id]){

users[id]={
money:0,
level:1,
exp:0
}

}

return users[id]

}



async function startBot(){


const {state, saveCreds} =
await useMultiFileAuthState("./session")



const sock = makeWASocket({

auth:state,

logger:pino({
level:"silent"
}),

browser:[
"Bocah Ngapak",
"Chrome",
"10.0"
]

})



sock.ev.on(
"creds.update",
saveCreds
)



sock.ev.on(
"connection.update",
async(update)=>{


const {
connection,
lastDisconnect,
qr
}=update



if(qr){

console.log("SCAN QR")

qrcode.generate(qr,{
small:true
})

}



if(connection==="connecting")
console.log("🔄 Menghubungkan...")



if(connection==="open"){

console.log("✅ BOT NYALA")
console.log("🤖",config.botName)

}



if(connection==="close"){

let reason =
lastDisconnect?.error?.output?.statusCode


if(reason !== DisconnectReason.loggedOut){

console.log("🔁 Reconnect")

startBot()

}


}


})





sock.ev.on(
"messages.upsert",
async({messages})=>{


let msg = messages[0]


if(!msg.message || msg.key.fromMe)
return



let from = msg.key.remoteJid

let sender =
msg.key.participant || from



let text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""


let group =
from.endsWith("@g.us")



let user =
getUser(sender)





// MENU

if(text===".menu"){

await sock.sendMessage(from,{
text:
`> Waktu Sekarang : _${new Date().toLocaleDateString("id-ID")}_

Halo kak, Saya adalah *bocah ngapak* bot whatsapp otomatis yang dapat membantu melalui whatsapp:

1. Dilarang Spam Bot
2. Dilarang Menelpon Bot
3. Dilarang Spam No Owner
4. Dilarang Menelpon No Owner


⌨️ Commands Menu

.menu
.menu fun
.owner
.ping
.say
.all
.welcome
.tebak
.peti
.wheel
.profile


> Mode: Public

🌸 Sakura Team`
})

}





// OWNER

if(text===".owner"){

await sock.sendMessage(from,{
text:
`┌──────────────────
│ 👑 OWNER INFORMATION
└──────────────────
│ 📛 Nama: Tian
│ 📱 Nomor: +6281229822705
│ 🤖 Bot: bocah ngapak
│ 🔗 Link: wa.me/6281229822705
└──────────────────

Hai @${sender.split("@")[0]}, itu ownerku 🦈💙`,
mentions:[sender]
})

}





// WELCOME MANUAL

if(text===".welcome"){

await sock.sendMessage(from,{
text:
`─── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───── 
⋆.°🧁 \`𝚰𝐃 𝐂α𝗋d 𝐒𝐓!\` 🍬°.⋆ 
─── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───── 

.✦ ݁ 🧁 Nama :
.✦ ݁ 🧁 Gender :
.✦ ݁ 🧁 Umur :
.✦ ݁ 🧁 Kelas :
.✦ ݁ 🧁 Roblox Username :
.✦ ݁ 🧁 Asal Kota :

─── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ───── 

⋆.°🧁 Welcome To ST! 🍬°.⋆`
})

}





if(text===".ping"){

sock.sendMessage(from,{
text:"🏓 Pong!"
})

}





if(text.startsWith(".say ")){

sock.sendMessage(from,{
text:text.replace(".say ","")
})

}





// ALL

if(text===".all" && group){

let meta =
await sock.groupMetadata(from)

sock.sendMessage(from,{
text:"📢 Tag semua",
mentions:
meta.participants.map(x=>x.id)
})

}





// ANTI LINK

if(group && text.includes("chat.whatsapp.com")){

sock.sendMessage(from,{
text:"⚠️ Anti link aktif"
})

}





// TEBak

if(text===".tebak"){

let angka =
Math.floor(Math.random()*10)+1

user.tebak=angka


sock.sendMessage(from,{
text:"🎯 Tebak angka 1-10"
})

}



if(user.tebak && !isNaN(text)){

if(Number(text)===user.tebak){

user.money+=100
user.exp+=10

sock.sendMessage(from,{
text:"🎉 Benar!\n💰 +100 uang"
})

delete user.tebak


}

}





// PETI

if(text===".peti"){

let hadiah =
Math.floor(Math.random()*500)

user.money+=hadiah


sock.sendMessage(from,{
text:
`🎁 Peti dibuka!

Kamu dapat:
💰 ${hadiah}`
})

}





// WHEEL

if(text===".wheel"){

let hadiah =
Math.floor(Math.random()*1000)

user.money+=hadiah


sock.sendMessage(from,{
text:
`🎡 Magic Wheel

Menang:
💰 ${hadiah}`
})

}





// PROFILE

if(text===".profile"){

sock.sendMessage(from,{
text:
`👤 PROFILE

Level: ${user.level}
EXP: ${user.exp}
Money: ${user.money}`
})

}





// ANTI SPAM

spam[sender]=(spam[sender]||0)+1

setTimeout(()=>{
spam[sender]=0
},5000)


if(spam[sender]>5){

sock.sendMessage(from,{
text:"⚠️ Jangan spam!"
})

spam[sender]=0

}



})





// AUTO WELCOME

sock.ev.on(
"group-participants.update",
async(data)=>{


if(data.action==="add"){


for(let user of data.participants){


await sock.sendMessage(data.id,{

text:
`─── ⋆⋅☆⋅⋆ ───── ⋆⋅☆⋅⋆ ─────

⋆.°🧁 ID Card ST! 🍬°.⋆

.✦ ݁ 🧁 Nama : @${user.split("@")[0]}
.✦ ݁ 🧁 Gender :
.✦ ݁ 🧁 Umur :
.✦ ݁ 🧁 Kelas :
.✦ ݁ 🧁 Roblox Username :
.✦ ݁ 🧁 Asal Kota :

─── ⋆⋅☆⋅⋆ ─────

⋆.°🧁 Welcome To ST! 🍬°.⋆

─── ⋆⋅☆⋅⋆ ─────`,

mentions:[user]

})


}


}


})


}


startBot()