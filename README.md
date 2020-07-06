# Lame Corner Bot

Whatever we need for discord.

## Things we need to add

- reaction roles message create/update
- advanced message embed create/update
- event registration/reminders
- whitelist/blacklist command (for role)
- general reminder command for users
- command to add emote to server from url


Leaderboard functionality?
- leaderboards for games civ games

## Commands

Prefix used here is `!`.

**Note:** This may not be the actual prefix used when deployed.

#### `!msg <create/update/get> <channel> <messageId>`
  - `<messageId>` is only required if getting/updating
  - `<create/update/get>` can be abbreviated to `<c/u/g>`
  - Allows you to create/modify messages with embeds. If you plan on editing a message, do a get first to see the
    current message data. Make any changes you want and then update it with the modified data.

## How to Deploy

### Deps

- Node.js > v12
- Npm

### Set env vars

Directly inject env vars in deployment env or have a `.env` file.

- `DISCORD_TOKEN` - Token for bot to login with
- `PREFIX` - prefix used for all commands
- `OWNER_ID` - user id of the bot owner
  - gives them full control regardless of guild/server
