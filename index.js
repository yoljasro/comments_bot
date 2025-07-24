// kommentPulBot - foydalanuvchini ro'yxatdan o'tkazish, kanalga yo'naltirish va screenshot qabul qilish

import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const CHANNEL_LINK = 'https://t.me/+rCgOphjq46VhNWIy'; // yopiq kanalga invite-link

const users = {}; // vaqtinchalik xotirada

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = { step: 'name' };

  bot.sendMessage(chatId, 'Assalomu alaykum! Iltimos, ismingizni kiriting:');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const user = users[chatId];
  if (!user || msg.text?.startsWith('/')) return;

  switch (user.step) {
    case 'name':
      user.name = msg.text;
      user.step = 'surname';
      return bot.sendMessage(chatId, 'Familiyangizni kiriting:');
    case 'surname':
      user.surname = msg.text;
      user.step = 'instagram';
      return bot.sendMessage(chatId, 'Instagram username ( @sizniki ) kiriting:');
    case 'instagram':
      user.instagram = msg.text;
      user.step = 'done';
      return bot.sendMessage(chatId,
        `✅ Siz ro'yxatdan o'tdingiz!

👤 Ism: ${user.name}
👤 Familiya: ${user.surname}
📸 Instagram: ${user.instagram}

💸 Har bir like + comment = 2000 so'm
📆 To'lov oyda 1 marta
📢 Kanalga a'zo bo'lish majburiy!

Kanalga o'ting: ${CHANNEL_LINK}`);
  }
});

// Foydalanuvchi screenshot yuborganda
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1]; // eng katta rasm

  const fileId = photo.file_id;
  const fileLink = await bot.getFileLink(fileId);

  // log uchun
  console.log(`Screenshot: ${fileLink}`);

  // Moderatsiya uchun yuborish (o'zingizga forward qilishingiz mumkin)
  bot.sendMessage(chatId, '✅ Screenshot qabul qilindi! Rahmat.');

  // Misol: moderatorga yuborish
  const MODERATOR_ID = process.env.MODERATOR_ID; // .env faylda ID saqlang
  if (MODERATOR_ID) {
    bot.sendPhoto(MODERATOR_ID, fileId, {
      caption: `📥 Screenshot from @${msg.from.username || 'user'} (${chatId})`
    });
  }
});
