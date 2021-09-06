const Discord = require("discord.js");
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require('./config.json');
require('colors');
const fs = require('fs');

client.on('ready', () => {
    console.log(`[Discord API] Logged in as ${client.user.username}`.yellow);
})

client.on('messageCreate', async message => {
    if (message.content === '##sendmsg') {
        if (message.author.id !== '596227913209217024') return;
        const supportChannel = client.channels.cache.get(config.msgChannel);
        if (!supportChannel) return;
        const embed = new Discord.MessageEmbed()
        .setAuthor(`ProBot Support`, 'https://cdn.discordapp.com/icons/224308865427046402/a_f08cbf2da908d34c5eef3d7978d1825e.gif?size=1024')
        .setDescription(`:one: Vote Link\n\n:two: Invite Link\n\n:sos: **None of the above options answer my question**`)
        .setColor('#F10FF8')
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('one')
            .setStyle('SECONDARY')
            .setEmoji('1️⃣')
        )
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('two')
            .setStyle('SECONDARY')
            .setEmoji('2️⃣')
        )
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('sos')
            .setEmoji('🆘')
            .setStyle('SECONDARY')
        )
        supportChannel.send({ embeds: [embed], components: [row] })
    }
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton) return;
    if (interaction.customId === 'one') {
        fs.readFile('./replies/vote.txt', (err, data) => {
            if (err) throw err;
            interaction.reply({ content: data.toString(), ephemeral: true })
        })
    }
    if (interaction.customId === 'two') {
        fs.readFile('./replies/invite.txt', (err, data) => {
            if (err) throw err;
            interaction.reply({ content: data.toString(), ephemeral: true })
        })
    }
    if (interaction.customId === 'sos') {
        const support = client.channels.cache.get(config.support_channel_id);
        if (!support) return;
        if (support.permissionsFor(interaction.user.id).toArray().includes('VIEW_CHANNEL')) {
            return interaction.reply({ content: `:x: ${interaction.user} You already have access for ${support} channel`, ephemeral: true })
        }
        await support.permissionOverwrites.edit(interaction.user.id, { VIEW_CHANNEL: true });
        interaction.reply({ content: `<@${interaction.user.id}> You can ask your question in ${support} channel`, ephemeral: true })
    }
})

client.login(config.token);