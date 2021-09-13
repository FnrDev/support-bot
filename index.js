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

client.on('messageCreate', async message => {
    if (message.content === '##lang') {
        if (message.author.bot) return;
        const supportChannel = client.channels.cache.get(config.msgChannel);
        if (!supportChannel) return;
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
            .setCustomId('lang')
            .setPlaceholder('Select Your Language')
            .setMaxValues(2)
            .addOptions([
                {
                    label: "Arabic",
                    value: "ar"
                },
                {
                    label: "English",
                    value: "en"
                },
            ])
        )
        supportChannel.send({ content: "Hey there! Now that you've read our rules, let's get you set up with some roles.\n\nSelect Your language.", components: [row] })
    }
})

client.on('messageCreate', async message => {
    if (message.content === '##gen') {
        if (message.author.bot) return;
        const supportChannel = client.channels.cache.get(config.msgChannel);
        if (!supportChannel) return;
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
            .setCustomId('gen')
            .setPlaceholder('Select Your Gender')
            .addOptions([
                {
                    label: "Man",
                    emoji: "👨",
                    value: "man"
                },
                {
                    label: "Girl",
                    emoji: "👧",
                    value: "girl"
                },
            ])
        )
        return supportChannel.send({ content: "Select Your Gender.", components: [row] })
    }
})

client.on('messageCreate', async message => {
    if (message.content === '##men') {
        if (message.author.bot) return;
        const supportChannel = client.channels.cache.get(config.msgChannel);
        if (!supportChannel) return;
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
            .setCustomId('mention')
            .setPlaceholder('Get Notifications')
            .addOptions([
                {
                    label: "Giveaways Mention",
                    emoji: "🎉",
                    description: "Get notifications when giveaway started",
                    value: "giveaway"
                },
                {
                    label: "Announcemnt Mention",
                    emoji: "🔔",
                    description: "Get notification for important news",
                    value: "announcemnt"
                },
            ])
        )
        return supportChannel.send({ content: "Get Notificactions.", components: [row] })
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
            .setLabel('Delete')
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

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    // start of lang select menu
    if (interaction.customId === 'lang') {
        if (interaction.values.includes('ar')) {
            const arabicRole = interaction.guild.roles.cache.get('844954800445194291');
            if (!arabicRole) return interaction.reply({ content: "i can\'t find arabic role", ephemeral: true });
            if (interaction.member.roles.cache.has(arabicRole.id)) {
                await interaction.member.roles.remove(arabicRole, `Removed arabic role by select menu`);
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            } else {
                await interaction.member.roles.add(arabicRole, `Added arabic role by select menu`)
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            }
        }
        if (interaction.values.includes('en')) {
            const englishRole = interaction.guild.roles.cache.get('844954830183333908');
            if (!englishRole) return interaction.reply({ content: "i can\'t find english role", ephemeral: true });
            if (interaction.member.roles.cache.has(englishRole.id)) {
                await interaction.member.roles.remove(englishRole, `Removed english role by select menu`)
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            } else {
                await interaction.member.roles.add(englishRole, `Added english role by select menu`);
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            }
        }
    }
    // end of lang select menu
    // Start of gender select meun
    if (interaction.customId === 'gen') {
        if (interaction.values.includes('man')) {
            const manRole = interaction.guild.roles.cache.get('886910293458964491');
            if (!manRole) return interaction.reply({ content: "i can\'t find man role", ephemeral: true });
            if (interaction.member.roles.cache.has(manRole.id)) {
                await interaction.member.roles.remove(manRole, `Removed man role by select menu`)
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            } else {
                await interaction.member.roles.add(manRole, `Added man role by select menu`)
                interaction.reply({ content: "Roles Changed", ephemeral: true })
            }
        }
        if (interaction.values.includes('girl')) {
            const girlRole = interaction.guild.roles.cache.get('886910360232275968');
            if (!girlRole) return interaction.reply({ content: "i can\'t find girl role", ephemeral: true });
            if (interaction.values.includes('girl')) {
                const manRole = interaction.guild.roles.cache.get('886910293458964491');
                interaction.member.roles.remove(manRole, `Remove man role by select menu`)
            }
            if (interaction.values.includes('man')) {
                const girlRole = interaction.guild.roles.cache.get('886910360232275968');
                interaction.member.roles.remove(girlRole, `Remove girl role by select menu`)
            }
            if (interaction.member.roles.cache.has(girlRole.id)) {
                await interaction.member.roles.remove(girlRole, `Removed girl role by select menu`)
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            } else {
                await interaction.member.roles.add(girlRole, `Added girl role by select menu`)
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            }
        }
    }
    if (interaction.customId === 'mention') {
        if (interaction.values.includes('giveaway')) {
            const giveawayRole = interaction.guild.roles.cache.get('886922365852848138');
            if (!giveawayRole) return interaction.reply({ content: "i can\'t find giveaway role", ephemeral: true });
            if (interaction.member.roles.cache.has(giveawayRole.id)) {
                await interaction.member.roles.remove(giveawayRole, `Removed giveaway role by select menu`)
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            } else {
                await interaction.member.roles.add(giveawayRole, `Added giveaway role by select menu`);
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            }
        }
        if (interaction.values.includes('announcemnt')) {
            const announcemntRole = interaction.guild.roles.cache.get('886922453882904646');
            if (!announcemntRole) return interaction.reply({ content: "i can\'t find announcement role", ephemeral: true })
            if (interaction.member.roles.cache.has(announcemntRole.id)) {
                await interaction.member.roles.remove(announcemntRole, `Removed announcement role by select menu`);
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            } else {
                await interaction.member.roles.add(announcemntRole, `Added announcement role by select menu`);
                interaction.reply({ content: "Roles Changed.", ephemeral: true })
            }
        }
    }
})

client.login(config.token);