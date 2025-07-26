import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const CHANNEL_LINK = 'https://t.me/+rCgOphjq46VhNWIy';
const MODERATOR_ID = process.env.MODERATOR_ID;

const users = {};

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  users[chatId] = { step: 'name' };

  bot.sendMessage(chatId, 'Assalomu alaykum! Iltimos, ismingizni kiriting:');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const user = users[chatId];

  // Inline tugmalar orqali kelgan matnlar
  if (msg.text === '📸 Screenshot yuborish') {
    return bot.sendMessage(chatId, 'Iltimos, screenshot yuboring.');
  }

  if (msg.text === '💬 Moderator bilan bog‘lanish') {
    users[chatId].step = 'contactModerator';
    return bot.sendMessage(chatId, 'Moderatorga yuboriladigan xabaringizni yozing:');
  }

  if (user?.step === 'contactModerator') {
    user.step = 'done';
    if (MODERATOR_ID) {
      bot.sendMessage(MODERATOR_ID, `✉️ @${msg.from.username || 'user'} yozdi:\n\n${msg.text}`);
      return bot.sendMessage(chatId, '✅ Xabaringiz moderatorga yuborildi!');
    } else {
      return bot.sendMessage(chatId, '❌ Moderatorga yuborib bo‘lmadi.');
    }
  }

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

Kanalga o'ting: ${CHANNEL_LINK}`,
        {
          reply_markup: {
            keyboard: [
              [{ text: '📸 Screenshot yuborish' }],
              [{ text: '💬 Moderator bilan bog‘lanish' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
          }
        }
      );
  }
});

// 📷 Screenshot yuborilganda
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1];

  const fileId = photo.file_id;
  const fileLink = await bot.getFileLink(fileId);

  console.log(`Screenshot: ${fileLink}`);

  bot.sendMessage(chatId, '✅ Screenshot qabul qilindi! Rahmat.');

  if (MODERATOR_ID) {
    bot.sendPhoto(MODERATOR_ID, fileId, {
      caption: `📥 Screenshot from @${msg.from.username || 'user'} (${chatId})`
    });
  }
});
