/**
 * Credit to: https://github.com/DankMemer/sniper
 * 
 * Modified by adding by user snipes
 */

import { CacheType, Client, EmbedBuilder, GuildEmoji, Interaction, Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, ReactionEmoji, TextChannel, User } from "discord.js";

const snipes: Record<string, DeletedContent[]> = {};
const snipesByUser: Record<string, DeletedContent[]> = {};
const editSnipes: Record<string, EditedContent[]> = {};
const editSnipesByUser: Record<string, EditedContent[]> = {};
const reactionSnipes: Record<string, ReactionRemovedContent[]> = {};
const reactionSnipesByUser: Record<string, ReactionRemovedContent[]> = {};
const maxArrayLength = 5;

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

	if (snipes[message.channel.id] === undefined) {
		snipes[message.channel.id] = [];
	} else if (snipes[message.channel.id].length >= maxArrayLength) {
		snipes[message.channel.id].pop();
	}
	snipes[message.channel.id].unshift(content);

	if (snipesByUser[message.author.id] === undefined) {
		snipesByUser[message.author.id] = [];
	} else if (snipesByUser[message.author.id].length >= maxArrayLength) {
		snipesByUser[message.author.id].pop();
	}
	snipesByUser[message.author.id].unshift(content);
}

export function sniperStoreEdit(oldMessage: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) {
	if (oldMessage.partial) return; // content is null

	const content = {
		author: oldMessage.author,
		content: oldMessage.content,
		createdAt: newMessage.editedTimestamp,
	};

	if (editSnipes[oldMessage.channel.id] === undefined) {
		editSnipes[oldMessage.channel.id] = [];
	} else if (editSnipes[oldMessage.channel.id].length >= maxArrayLength) {
		editSnipes[oldMessage.channel.id].pop();
	}
	editSnipes[oldMessage.channel.id].unshift(content);

	if (editSnipesByUser[oldMessage.author.id] === undefined) {
		editSnipesByUser[oldMessage.author.id] = [];
	} else if (editSnipesByUser[oldMessage.author.id].length >= maxArrayLength) {
		editSnipesByUser[oldMessage.author.id].pop();
	}
	editSnipesByUser[oldMessage.author.id].unshift(content);
}

export async function sniperStoreReactionRemove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
	if (reaction.partial) reaction = await reaction.fetch();

	const content = {
		user: user,
		emoji: reaction.emoji,
		messageURL: reaction.message.url,
		createdAt: Date.now(),
	};

	if (reactionSnipes[reaction.message.channel.id] === undefined) {
		reactionSnipes[reaction.message.channel.id] = [];
	} else if (reactionSnipes[reaction.message.channel.id].length >= maxArrayLength) {
		reactionSnipes[reaction.message.channel.id].pop();
	}
	reactionSnipes[reaction.message.channel.id].unshift(content);

  const author = reaction.message.author;
  if (author !== null) {
		if (reactionSnipesByUser[author.id] === undefined) {
			reactionSnipesByUser[author.id] = [];
		} else if (reactionSnipesByUser[author.id].length >= maxArrayLength) {
			reactionSnipesByUser[author.id].pop();
		}
		reactionSnipesByUser[author.id].unshift(content);
	}
}

export async function sniperInteraction(client: Client<boolean>, interaction: Interaction<CacheType>) {
  try {
		if (!interaction.isCommand()) return;
		if (interaction.isContextMenuCommand()) return;

		const channel =
			(interaction.options.getChannel("channel") || interaction.channel) as TextChannel;

    if (channel === null) return;
		
		const user = interaction.options.getUser("target") || null;

		const history = interaction.options.getInteger("history") || 0;

		if (interaction.commandName === "snipe") {
			let snipe;
			if (user !== null) {
				snipe = snipesByUser[user.id]?.[history];
			} else {
        if (channel !== null) snipe = snipes[channel.id]?.[history];
			}

			if (!snipe) return interaction.reply("There's nothing to snipe!");

			const embed = new EmbedBuilder()
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
				snipe = editSnipesByUser[user.id]?.[history];
			} else {
				snipe = editSnipes[channel.id]?.[history];
			}

			await interaction.reply(
				snipe
					? {
							embeds: [
								new EmbedBuilder()
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
				snipe = reactionSnipesByUser[user.id]?.[history];
			} else {
				snipe = reactionSnipes[channel.id]?.[history];
			}

			await interaction.reply(
				snipe
					? {
							embeds: [
								new EmbedBuilder()
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
