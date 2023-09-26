const {Client, GatewayIntentBits} = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const config = require('./config.json');


client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
	if (message.channelId !== config.channelId)
		return;
	const includesOneImage = message.attachments.some((attachment) => attachment.contentType.startsWith('image/'))
		&& message.attachments.size === 1;
	const isWhitelisted = message.member.permissions.has('Administrator') || message.member.permissions.has('ManageMessages') ||
		message.member.permissions.has('ManageChannels');
	if (isWhitelisted && !includesOneImage)
		return;
	if (!includesOneImage) {
		message.delete();
		const warn = '**Ce channel est réservé au partage de photo pour *La photo de la semaine* !**\n'
			+ 'Si tu veux réagir à une autre photo, fais le dans le thread approprié !\n'
			+ 'Si tu veux poster une photo, assure toi de n\'en poster qu\'une seule à la fois !';
		try {
			await message.author.send(warn);
		} catch (_) {
			message.channel.send(`${message.author} ${warn}`)
				.then(msg => {
					setTimeout(() => {
						msg.delete();
					}, 5000);
				});
		}
		return;
	}
	message.startThread({
		'name': `Photo de ${message.member.displayName} - Commentaires`,
		'reason': 'Thread pour commenter la photo'
	});
	message.react('🌟');
});

client.login(config.botToken);
