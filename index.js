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
// ✅ DETALYE MO
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

client.on('ready', () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// ==============================================
// 🛡️ COMMANDS & BUTTONS
// ==============================================
client.on('interactionCreate', async interaction => {

  // /embed
  if (interaction.isChatInputCommand() && interaction.commandName === 'embed') {
    if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({content:'❌ Wala kang pahintulot.',ephemeral:true});
    const embed = new EmbedBuilder()
      .setTitle(interaction.options.getString('title'))
      .setDescription(interaction.options.getString('description'))
      .setColor(interaction.options.getString('color') || '#2f3136')
      .setThumbnail(CONFIG.BOT_THUMBNAIL)
      .setImage(interaction.options.getString('image'))
      .setTimestamp();
    await interaction.channel.send({embeds:[embed]});
    return interaction.reply({content:'✅ Nai-send na!',ephemeral:true});
  }

  // /setupticket ✅ TAMA NA ANG ITSURA
  if (interaction.isChatInputCommand() && interaction.commandName === 'setupticket') {
    if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({content:'❌ Wala kang pahintulot.',ephemeral:true});

    const embed = new EmbedBuilder()
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
      .setColor('#1a1a2e');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('buy').setLabel('SHOP').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('support').setLabel('SUPPORT').setStyle(ButtonStyle.Secondary)
    );

    await interaction.channel.send({embeds:[embed], components:[buttons]});
    return interaction.reply({content:'✅ Ticket Ready!',ephemeral:true});
  }

  // BUTTON ACTIONS
  if (interaction.isButton()) {
    const {customId,user,guild} = interaction;
    const exist = guild.channels.cache.find(ch => ch.name === `ticket-${user.username.toLowerCase()}`);
    if(exist && customId !== 'close') return interaction.reply({content:`❌ May ticket ka na: ${exist}`,ephemeral:true});

    if(customId === 'buy' || customId === 'support'){
      const type = customId === 'buy' ? '➤ ORDER' : '➤ SUPPORT';
      try {
        const ch = await guild.channels.create({
          name: `ticket-${user.username}`,
          type: ChannelType.GuildText,
          parent: CONFIG.TICKET_CATEGORY_ID,
          permissionOverwrites: [
            {id:guild.id, deny:['ViewChannel']},
            {id:user.id, allow:['ViewChannel','SendMessages','AttachFiles','ReadMessageHistory']},
            {id:CONFIG.OWNER_ID, allow:['ViewChannel','SendMessages','ManageChannels']}
          ]
        });

        const content = new EmbedBuilder()
          .setTitle(`${type} TICKET`)
          .setDescription(`Hello ${user}!
• Ibigay ang detalye ng iyong kailangan
• I-type ang \`.payment\` para makita ang paraan ng pagbabayad
• Mag-upload ng resibo kapag nakabayad na
• Huwag mag-spam, sasagot kami agad

Salamat sa pagpili sa AZURA SHOP!`)
          .setColor('#2ecc71')
          .setThumbnail(CONFIG.BOT_THUMBNAIL);

        const closeBtn = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('close').setLabel('🔒 CLOSE').setStyle(ButtonStyle.Danger)
        );

        await ch.send({content:`👋 Hello ${user}!`, embeds:[content], components:[closeBtn]});
        return interaction.reply({content:`✅ Ticket: ${ch}`,ephemeral:true});

      } catch (e) { return interaction.reply({content:'❌ Error, subukan ulit.',ephemeral:true}); }
    }

    if(customId === 'close'){
      await interaction.reply({content:'⏳ Isasara...'});
      setTimeout(() => interaction.channel.delete().catch(()=>{}), 3000);
    }
  }
});

// ==============================================
// 💳 PAYMENT COMMAND - MAY QR CODE
// ==============================================
client.on('messageCreate', async msg => {
  if(msg.author.bot) return;
  if(msg.content.toLowerCase() === '.payment'){
    const pay = new EmbedBuilder()
      .setTitle('💳 OFFICIAL PAYMENT METHOD')
      .setDescription('Magbayad gamit ang GCash:')
      .addFields(
        {name:'📱 Number', value:`**${CONFIG.GCASH.NUMBER}**`, inline:true},
        {name:'👔 Pangalan', value:`**${CONFIG.GCASH.NAME}**`, inline:true}
      )
      .setThumbnail(CONFIG.BOT_THUMBNAIL)
      .setImage(CONFIG.GCASH.QR_CODE)
      .setColor('#00a8ff');
    await msg.channel.send({embeds:[pay]});
  }
});

// ==============================================
// 📝 REGISTER COMMANDS
// ==============================================
const commands = [
  new SlashCommandBuilder().setName('embed').setDescription('Gumawa ng embed').addStringOption(o=>o.setName('title').setDescription('Pamagat').setRequired(true)).addStringOption(o=>o.setName('description').setDescription('Laman').setRequired(true)),
  new SlashCommandBuilder().setName('setupticket').setDescription('I-setup ang ticket panel')
];

const rest = new REST({version:'10'}).setToken(CONFIG.BOT_TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), {body:commands});
    console.log('✅ Commands Updated!');
  } catch (e) { console.error(e); }
})();

client.login(CONFIG.BOT_TOKEN);
