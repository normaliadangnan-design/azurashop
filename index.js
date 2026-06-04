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
  BOT_TOKEN: 'ILAGAY_ANG_BOT_TOKEN_MO_DITO',
  CLIENT_ID: 'ILAGAY_ANG_BOT_CLIENT_ID_DITO',
  OWNER_ID: 'ILAGAY_ANG_DISCORD_ID_MO_DITO', // Para ikaw lang makagamit ng admin commands
  TICKET_CATEGORY_ID: 'ILAGAY_ANG_ID_NG_TICKET_CATEGORY_MO', // Kopyahin mula sa category ng Ticket
  BOT_THUMBNAIL: 'ILAGAY_ANG_LINK_NG_THUMBNAIL_AVATAR_NG_BOT', // Dapat .png/.jpg at naka-online
  SHOP_LOGO: 'ILAGAY_ANG_LINK_NG_LOGO_NG_SHOP_MO', // Tulad ng nasa example mong picture
  GCASH: {
    NUMBER: '09171234567', // Palitan ng totoong number
    NAME: 'Juan A. Dela Cruz', // Pangalan sa GCash
    QR_CODE: 'ILAGAY_LINK_NG_QR_CODE_MO_KUNG_MERON' // O iwanang blangga kung wala
  }
};
// ==============================================
// ✅ WAG NA BAGUHIN ANG IBABA KUNG HINDI ALAM
// ==============================================

client.on('ready', () => {
  console.log(✅ Bot ay nakakonekta bilang: ${client.user.tag});
  console.log('✅ Lahat ng commands ay aktibo na!');
});

// ==============================================
// 🛡️ ADMIN COMMANDS - /embed
// ==============================================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // /embed command
  if (interaction.commandName === 'embed') {
    if (interaction.user.id !== CONFIG.OWNER_ID) {
      return interaction.reply({
        content: '❌ Wala kang pahintulot gamitin ang command na ito.',
        ephemeral: true
      });
    }

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#2f3136';

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setThumbnail(CONFIG.BOT_THUMBNAIL)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Embed naipadala na!', ephemeral: true });
  }

  // /setupticket command
  if (interaction.commandName === 'setupticket') {
    if (interaction.user.id !== CONFIG.OWNER_ID) {
      return interaction.reply({
        content: '❌ Wala kang pahintulot gamitin ang command na ito.',
        ephemeral: true
      });
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
2nd offense → Timeout 3 days
3rd offense → Timeout 7 days`)
      .setThumbnail(CONFIG.BOT_THUMBNAIL)
      .setImage(CONFIG.SHOP_LOGO)
      .setColor('#1a1a2e')
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_buy')
        .setLabel('🛒 BUY / SHOP')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('open_support')
        .setLabel('🔧 SUPPORT / HELP')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.channel.send({ embeds: [ticketEmbed], components: [buttons] });
    await interaction.reply({ content: '✅ Ticket panel na-setup na!', ephemeral: true });
  }
});

// ==============================================
// 💳 PAYMENT COMMAND - .payment
// ==============================================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '.payment') {
    const paymentEmbed = new EmbedBuilder()
      .setTitle('💳 OFFICIAL PAYMENT METHOD')
      .setDescription('Maaaring magbayad gamit ang GCash:')
      .addFields(
        { name: '📱 GCash Number', value: **${CONFIG.GCASH.NUMBER}**, inline: true },
        { name: '👔 Registered Name', value: **${CONFIG.GCASH.NAME}**, inline: true }
      )
      .setThumbnail(CONFIG.BOT_THUMBNAIL)
      .setColor('#00a8ff')
      .setTimestamp();

    if (CONFIG.GCASH.QR_CODE && CONFIG.GCASH.QR_CODE !== '') {
      paymentEmbed.setImage(CONFIG.GCASH.QR_CODE);
    }

    await message.channel.send({ embeds: [paymentEmbed] });
  }
});

// ==============================================
// 🎟️ TICKET BUTTON HANDLING
// ==============================================
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const { customId, user, guild } = interaction;

  // Check kung may existing ticket na ang user
  const existingTicket = guild.channels.cache.find(ch => 
    ch.name.toLowerCase() === ticket-${user.username.toLowerCase()}
  );

  if (existingTicket && customId !== 'close_ticket') {
    return interaction.reply({
      content: ❌ Mayroon ka nang aktibong ticket: ${existingTicket},
      ephemeral: true
    });
  }

  // Gumawa ng ticket
  if (customId === 'open_buy' || customId === 'open_support') {
    const ticketType = customId === 'open_buy' ? '🛒 ORDER / PURCHASE' : '🔧 SUPPORT / HELP';

    try {
      const ticketChannel = await guild.channels.create({
        name: ticket-${user.username},
        type: ChannelType.GuildText,
        parent: CONFIG.TICKET_CATEGORY_ID,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: user.id, allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory
          ]},
          { id: CONFIG.OWNER_ID, allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages
          ]}
        ]
      });

      const ticketContent = new EmbedBuilder()
        .setTitle(${ticketType} TICKET)
        .setDescription(`Hello ${user}!
*📌 PAALALA:**
• Magbigay ng detalyadong impormasyon
• Para sa pagbili: I-type ang \`.payment\` para makita ang detalye
• Mag-upload ng proof of payment kapag nagbayad na
• Huwag mag-spam, sumagot kami sa loob ng 2 oras

Salamat sa pagpili sa AZURA SHOP!`)
        .setColor('#2ecc71')
        .setThumbnail(CONFIG.BOT_THUMBNAIL)
        .setTimestamp();

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('🔒 CLOSE TICKET')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content:👋 Welcome ${user}!`,
        embeds: [ticketContent],
        components: [closeButton]
      });

      await interaction.reply({
        content: ✅ Ticket na ginawa: ${ticketChannel},
        ephemeral: true
      });

    } catch (error) {
      console.error('Error creating ticket:', error);
      await interaction.reply({
        content: '❌ Hindi nagawa ang ticket. Pakisuyong subukan ulit o magtanong sa admin.',
        ephemeral: true
      });
    }
  }

  // Isara ang ticket
  if (customId === 'close_ticket') {
    await interaction.reply({
      content: '⏳ Isasara at buburahin ang ticket sa loob ng 5 segundo...'
    });
    setTimeout(() => {
      interaction.channel.delete().catch(console.error);
    }, 5000);
  }
});

// ==============================================
// 📝 REGISTER ALL SLASH COMMANDS
// ==============================================
const commands = [
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Gumawa ng custom embed post (Owner only)')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Pamagat ng embed')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Nilalaman o mensahe')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Kulay ng border (hal: #ff0000)')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('setupticket')
    .setDescription('Mag-setup ng ticket panel sa channel na ito (Owner only)')
];

const rest = new REST({ version: '10' }).setToken(CONFIG.BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Nagrerehistro ng mga commands...');
    await rest.put(
      Routes.applicationCommands(CONFIG.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Lahat ng commands ay matagumpay na nairehistro!');
  } catch (error) {
    console.error('❌ Error sa pagrehistro ng commands:', error);
  }
})();

// Mag-login
client.login(CONFIG.BOT_TOKEN);
