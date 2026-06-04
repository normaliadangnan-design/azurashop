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
  BOT_THUMBNAIL: 'https://cdn.discordapp.com/attachments/1397829995908567092/1511951198503305319/standard_1.gif?ex=6a22fa88&is=6a21a908&hm=cce88bd267c24b5a68e31629d46975320141554b78ca5e542a7a4dbdf0202016',
  SHOP_LOGO: 'https://cdn.discordapp.com/attachments/1397829995908567092/1512223537040195616/static.png?ex=6a234f6a&is=6a21fdea&hm=3f07ec8a1a0d3b74f2427f97ef25a0ae88b99e17b25c900e0ec7d5a368c3bcd1',
  GCASH: {
    NUMBER: '09536398656',
    NAME: 'SA******N A.',
    QR_CODE: 'https://cdn.discordapp.com/attachments/1397829995908567092/1512225732519268453/IMG_4524.png?ex=6a235176&is=6a21fff6&hm=166c7512f46bebe2cbd88f7d340d1d48712b51fbbfff78450512052d53050d0e'
  }
};
// ==============================================
// ✅ WAG NA BAGUHIN ANG IBABA KUNG HINDI ALAM
// ==============================================

client.on('ready', () => {
  console.log(`✅ Bot ay nakakonekta bilang: ${client.user.tag}`);
  console.log('✅ Lahat ng commands ay aktibo na!');
});

// ==============================================
// 🛡️ INTERACTION HANDLER (ISA LANG ITO)
// ==============================================
client.on('interactionCreate', async interaction => {
  // --- SLASH COMMANDS ---
  if (interaction.isChatInputCommand()) {

    // /embed command - ✅ INAYOS NA PWEDE NA MAY LARAWAN/GIF
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
      const imageUrl = interaction.options.getString('image'); // ✅ BAGO: Link ng litrato/gif

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setThumbnail(CONFIG.BOT_THUMBNAIL)
        .setTimestamp();

      // ✅ KUNG MAY NILAGAY NA LARAWAN/GIF, ILALAGAY ITO SA BANNER
      if (imageUrl) {
        embed.setImage(imageUrl);
      }

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
2nd offense → Timeout 2 days
3rd offense → Timeout 5 days`)
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
  }

  // --- BUTTON ACTIONS ---
  if (interaction.isButton()) {
    const { customId, user, guild } = interaction;

    // Check kung may existing ticket na ang user
    const existingTicket = guild.channels.cache.find(ch =>
      ch.name.toLowerCase() === `ticket-${user.username.toLowerCase()}`
    );

    if (existingTicket && customId !== 'close_ticket') {
      return interaction.reply({
        content: `❌ Mayroon ka nang aktibong ticket: ${existingTicket}`,
        ephemeral: true
      });
    }

    // Gumawa ng ticket
    if (customId === 'open_buy' || customId === 'open_support') {
      const ticketType = customId === 'open_buy' ? '🛒 ORDER / PURCHASE' : '🔧 SUPPORT / HELP';

      try {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${user.username}`,
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
          .setTitle(`${ticketType} TICKET`)
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
          content: `👋 Welcome ${user}!`,
          embeds: [ticketContent],
          components: [closeButton]
        });

        await interaction.reply({
          content: `✅ Ticket na ginawa: ${ticketChannel}`,
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
        { name: '📱 GCash Number', value: `**${CONFIG.GCASH.NUMBER}**`, inline: true },
        { name: '👔 Registered Name', value: `**${CONFIG.GCASH.NAME}**`, inline: true }
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
    )
    // ✅ BAGONG OPTION: PARA SA LARAWAN O GIF
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Link ng larawan o GIF (ilalagay bilang malaking banner)')
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
