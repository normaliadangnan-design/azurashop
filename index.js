const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ==============================================
// ✅ PALITAN ANG LAHAT NG DETALYE SA IBABA
// ==============================================
const CONFIG = {
  BOT_TOKEN: 'MTUxMjAzNjcwMzcxNDQxMDYyNg.GjeYDP.7zEjfg20Eduy2pnsOoLgoGxttXDY-AZ4OJgQB0',
  CLIENT_ID: '1512036703714410626',
  OWNER_ID: '1250654354344775703',
  TICKET_CATEGORY_ID: '1511950129110712450',
  BOT_THUMBNAIL: 'https://cdn.discordapp.com/attachments/1397829995908567092/1511951198503305319/standard_1.gif',
  SHOP_LOGO: 'https://cdn.discordapp.com/attachments/1397829995908567092/1512223537040195616/static.png',
  GCASH: {
    NUMBER: '09536398656',
    NAME: 'SA******N A.',
    QR_CODE: 'https://cdn.discordapp.com/attachments/1397829995908567092/1512225732519268453/IMG_4524.png'
  }
};
// ==============================================

client.on('ready', () => {
  console.log(`✅ Bot ay nakakonekta bilang: ${client.user.tag}`);
  console.log('✅ System Ready!');
});

// ==============================================
// 🛡️ INTERACTION HANDLER - INAYOS KO ITO NANG MABUTI
// ==============================================
client.on('interactionCreate', async interaction => {

  // --- SLASH COMMANDS ---
  if (interaction.isChatInputCommand()) {

    // /embed command
    if (interaction.commandName === 'embed') {
      try {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          return interaction.reply({ content: '❌ Wala kang pahintulot.', ephemeral: true });
        }
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || '#2f3136';
        const imageUrl = interaction.options.getString('image');

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(color)
          .setThumbnail(CONFIG.BOT_THUMBNAIL)
          .setTimestamp();
        if (imageUrl) embed.setImage(imageUrl);

        await interaction.channel.send({ embeds: [embed] });
        return interaction.reply({ content: '✅ Nai-send na!', ephemeral: true });
      } catch (e) {
        console.error(e);
        return interaction.reply({ content: '❌ Error sa command.', ephemeral: true });
      }
    }

    // /setupticket command ✅ DITO NA ANG TAMANG AYOS
    if (interaction.commandName === 'setupticket') {
      try {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          return interaction.reply({ content: '❌ Wala kang pahintulot.', ephemeral: true });
        }

        const ticketEmbed = new EmbedBuilder()
          .setTitle('🎟️ AZURA SHOP - TICKET SYSTEM')
          .setDescription(`**📋 TICKET RULES:**
• 2 Hours no reply = Case Close
• If your case is closed, create a new ticket
• Only the buyer can open a ticket regarding their order
• No useless or nonsense tickets
• Spamming tickets = Ban

*⚠️ PENALTIES:*
1st offense → Timeout 1 day
2nd offense → Timeout 2 days
3rd offense → Timeout 5 days`)
          .setThumbnail(CONFIG.BOT_THUMBNAIL)
          .setImage(CONFIG.SHOP_LOGO)
          .setColor('#1a1a2e')
          .setTimestamp();

        // ✅ TAMA NA ANG BUTTON: SHOP at SUPPORT, GRAY
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('open_buy')
            .setLabel('SHOP')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('open_support')
            .setLabel('SUPPORT')
            .setStyle(ButtonStyle.Secondary)
        );

        await interaction.channel.send({ embeds: [ticketEmbed], components: [buttons] });
        return interaction.reply({ content: '✅ Ticket panel na-setup na!', ephemeral: true });

      } catch (e) {
        console.error(e);
        return interaction.reply({ content: '❌ May naganap na error, subukan ulit.', ephemeral: true });
      }
    }
  }

  // --- BUTTON ACTIONS ---
  if (interaction.isButton()) {
    try {
      const { customId, user, guild } = interaction;

      const existingTicket = guild.channels.cache.find(ch => ch.name.toLowerCase() === `ticket-${user.username.toLowerCase()}`);
      if (existingTicket && customId !== 'close_ticket') {
        return interaction.reply({ content: `❌ Mayroon ka nang ticket: ${existingTicket}`, ephemeral: true });
      }

      if (customId === 'open_buy' || customId === 'open_support') {
        const ticketType = customId === 'open_buy' ? '🛒 ORDER / PURCHASE' : '🔧 SUPPORT / HELP';

        const ticketChannel = await guild.channels.create({
          name: `ticket-${user.username}`,
          type: ChannelType.GuildText,
          parent: CONFIG.TICKET_CATEGORY_ID,
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory] },
            { id: CONFIG.OWNER_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
          ]
        });

        const ticketContent = new EmbedBuilder()
          .setTitle(`${ticketType} TICKET`)
          .setDescription(`Hello ${user}!
• Magbigay ng detalyadong impormasyon
• I-type ang \`.payment\` para makita ang detalye
• Mag-upload ng proof of payment kapag nagbayad na
• Huwag mag-spam, sumagot kami sa loob ng 2 oras

Salamat sa pagpili sa AZURA SHOP!`)
          .setColor('#2ecc71')
          .setThumbnail(CONFIG.BOT_THUMBNAIL)
          .setTimestamp();

        const closeButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 CLOSE TICKET').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `👋 Welcome ${user}!`, embeds: [ticketContent], components: [closeButton] });
        return interaction.reply({ content: `✅ Ticket na ginawa: ${ticketChannel}`, ephemeral: true });
      }

      if (customId === 'close_ticket') {
        await interaction.reply({ content: '⏳ Isasara ang ticket...' });
        setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
      }

    } catch (e) {
      console.error(e);
      return interaction.reply({ content: '❌ Hindi nagawa ang aksyon.', ephemeral: true });
    }
  }
});

// ==============================================
// 💳 PAYMENT COMMAND - SIGURADONG LALABAS NA
// ==============================================
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content.toLowerCase() === '.payment') {
    try {
      const paymentEmbed = new EmbedBuilder()
        .setTitle('💳 OFFICIAL PAYMENT METHOD')
        .setDescription('Maaaring magbayad gamit ang GCash:')
        .addFields(
          { name: '📱 GCash Number', value: `**${CONFIG.GCASH.NUMBER}**`, inline: true },
          { name: '👔 Registered Name', value: `**${CONFIG.GCASH.NAME}**`, inline: true }
        )
        .setThumbnail(CONFIG.BOT_THUMBNAIL)
        .setColor('#00a8ff')
        .setTimestamp();

      // ✅ QR CODE MO
      if (CONFIG.GCASH.QR_CODE) paymentEmbed.setImage(CONFIG.GCASH.QR_CODE);

      await message.channel.send({ embeds: [paymentEmbed] });
    } catch (e) {
      console.error(e);
    }
  }
});

// ==============================================
// 📝 FORCE UPDATE NG COMMANDS - DITO ANG SOLUSYON!
// ==============================================
const commands = [
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Gumawa ng embed (Owner)')
    .addStringOption(opt => opt.setName('title').setDescription('Pamagat').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Nilalaman').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Kulay').setRequired(false))
    .addStringOption(opt => opt.setName('image').setDescription('Larawan/GIF').setRequired(false)),
  new SlashCommandBuilder()
    .setName('setupticket')
    .setDescription('Mag-setup ng ticket panel (Owner)')
];

const rest = new REST({ version: '10' }).setToken(CONFIG.BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Pilit na tinatanggal ang lumang commands...');
    // TANGGALIN MUNA LAHAT PARA WALANG SIRA
    await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), { body: [] });
    console.log('🗑️ Lumang commands tinanggal!');
    
    // ILAGAY ANG BAGO
    await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), { body: commands });
    console.log('✅ Bagong commands nairehistro na!');
  } catch (error) {
    console.error('❌ Error sa registration:', error);
  }
})();

client.login(CONFIG.BOT_TOKEN);
