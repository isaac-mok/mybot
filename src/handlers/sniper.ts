/**
 * Credit to: https://github.com/DankMemer/sniper
 * 
 * Modified by adding by user snipes
 */

import { CacheType, Client, GuildEmoji, Interaction, Message, MessageEmbed, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, ReactionEmoji, TextBasedChannel, TextChannel, User } from "discord.js";

const snipes: Record<string, DeletedContent> = {};
const snipesByUser: Record<string, DeletedContent> = {};
const editSnipes: Record<string, EditedContent> = {};
const editSnipesByUser: Record<string, EditedContent> = {};
const reactionSnipes: Record<string, ReactionRemovedContent> = {};
const reactionSnipesByUser: Record<string, ReactionRemovedContent> = {};

const formatEmoji = (emoji: GuildEmoji | ReactionEmoji) => {
	return !emoji.id || (emoji instanceof GuildEmoji ? emoji.available : false)
		? emoji.toString() // bot has access or unicode emoji
		: `[:${emoji.name}:](${emoji.url})`; // bot cannot use the emoji
};

export function sniperStoreDelete(message: Message<boolean> | PartialMessage) {
	if (message.partial || (message.embeds.length && !message.content)) return; // content is null or deleted embed

  const image = message.attachments.first();

	const content = {
		author: message.author,
		content: message.content,
		createdAt: message.createdTimestamp,
		image: typeof image !== 'undefined'
			? image.proxyURL
			: null,
	};

	snipes[message.channel.id] = content;

	snipesByUser[message.author.id] = content;
}

export function sniperStoreEdit(oldMessage: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) {
	if (oldMessage.partial) return; // content is null

	const content = {
		author: oldMessage.author,
		content: oldMessage.content,
		createdAt: newMessage.editedTimestamp,
	};

	editSnipes[oldMessage.channel.id] = content;

	editSnipesByUser[oldMessage.author.id] = content;
}

export async function sniperStoreReactionRemove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
	if (reaction.partial) reaction = await reaction.fetch();

	const content = {
		user: user,
		emoji: reaction.emoji,
		messageURL: reaction.message.url,
		createdAt: Date.now(),
	};

	reactionSnipes[reaction.message.channel.id] = content;

  const author = reaction.message.author;
  if (author !== null) reactionSnipesByUser[author.id] = content;
}

export async function sniperInteraction(client: Client<boolean>, interaction: Interaction<CacheType>) {
  try {
		if (!interaction.isCommand()) return;

		const channel =
			(interaction.options.getChannel("channel") || interaction.channel) as TextChannel;

    if (channel === null) return;
		
		const user = interaction.options.getUser("target") || null;

		if (interaction.commandName === "snipe") {
			let snipe;
			if (user !== null) {
				snipe = snipesByUser[user.id];
			} else {
        if (channel !== null) snipe = snipes[channel.id];
			}

			if (!snipe) return interaction.reply("There's nothing to snipe!");

			const embed = new MessageEmbed()
				.setAuthor({
          name: snipe.author.tag,
          iconURL: snipe.author.avatarURL() || ''
        })
				.setFooter({
          text: `#${channel.name}`,
        })
				.setTimestamp(snipe.createdAt);
			snipe.content ? embed.setDescription(snipe.content) : null;
			snipe.image ? embed.setImage(snipe.image) : null;

			await interaction.reply({ embeds: [embed] });
		} else if (interaction.commandName === "editsnipe") {
			let snipe;
			if (user !== null) {
				snipe = editSnipesByUser[user.id];
			} else {
				snipe = editSnipes[channel.id];
			}

			await interaction.reply(
				snipe
					? {
							embeds: [
								new MessageEmbed()
									.setDescription(snipe.content)
									.setAuthor({
                    name: snipe.author.tag,
                    iconURL: snipe.author.avatarURL() || ''
                  })
									.setFooter({
                    text: `#${channel.name}`
                  })
									.setTimestamp(snipe.createdAt),
							],
						}
					: "There's nothing to snipe!"
			);
		} else if (interaction.commandName === "reactionsnipe") {
			let snipe;
			if (user !== null) {
				snipe = reactionSnipesByUser[user.id];
			} else {
				snipe = reactionSnipes[channel.id];
			}

			await interaction.reply(
				snipe
					? {
							embeds: [
								new MessageEmbed()
									.setDescription(
										`reacted with ${formatEmoji(
											snipe.emoji
										)} on [this message](${snipe.messageURL})`
									)
									.setAuthor({
                    name: snipe.user.tag || '',
                    iconURL: snipe.user.avatarURL() || '',
                  })
									.setFooter({
                    text: `#${channel.name}`
                  })
									.setTimestamp(snipe.createdAt),
							],
						}
					: "There's nothing to snipe!"
			);
		}
	} catch (error) {
		console.error(error);
	}
}

interface DeletedContent {
  author: User
  content: string
  createdAt: number
  image: string | null
}

interface EditedContent {
  author: User
  content: string
  createdAt: number  | null
}

interface ReactionRemovedContent {
  user: User | PartialUser
  emoji: GuildEmoji | ReactionEmoji
  messageURL: string
  createdAt: number
}
