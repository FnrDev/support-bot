const Discord = require("discord.js");
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require('./config.json');
require('colors');
const fs = require('fs');
const wait = require('util').promisify(setTimeout);

client.on('ready', () => {
    console.log(`[Discord API] Logged in as ${client.user.username}`.yellow);
    client.user.setActivity({ name: "Github: FnrDev", type: "WATCHING" })
})

client.on('messageCreate', async message => {
    if (message.content === '##sendmsg') {
        if (message.author.bot) return;
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
        const tickChannel = await interaction.guild.channels.create(`${interaction.user.username}-ticket`, {
            parent: config.categoryId,
            permissionOverwrites: [
                {
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                    id: interaction.user.id
                },
                {
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_MESSAGES", "MANAGE_CHANNELS"],
                    id: config.supportRoleId
                },
                {
                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                    id: interaction.guild.id
                }
            ]
        });
        const embed = new Discord.MessageEmbed()
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`Support will be with you shortly.\nTo close this ticket react with 🔒`)
        .setColor('#F10FF8')
        .setFooter(`${interaction.guild.name} Support`, interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp()
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('close')
            .setStyle('DANGER')
            .setLabel('Close')
            .setEmoji('🔒')
        )
        tickChannel.send({ content: interaction.user.toString(), embeds: [embed], components: [row] })
        interaction.reply({ content: `✅ ${interaction.user.toString()} You can ask your question in ${tickChannel}`, ephemeral: true });
        const collector = tickChannel.createMessageComponentCollector()
        collector.on('collect', async i => {
            if (i.customId === 'close') {
                await i.deferReply()
                const msg = await i.editReply(':x: **Deleteing ticket in 5 secounds**')
                await wait(5000)
                msg.channel.delete()
            }
        })
    }
})

client.login(config.token);