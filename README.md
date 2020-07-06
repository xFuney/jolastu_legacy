# Jolastu

Jolastu is yet another Discord bot designed for music playing and giveaways. This bot was a mix of efforts from xFuney over some months, and this code is a refactor of another bot that was in the works prior.

# Run Instructions

Install all dependencies using ``npm install``, run with ``./start``.

# Environment Variables

**JOLASTU_PROD_DISCORD_TOKEN** is required to be set to a Discord token - even if you're only using Jolastu in a development environment.

**JOLASTU_DEV_DISCORD_TOKEN** isn't required, but can be set to a Discord token. This is currently unused.

**KEY_YT** should be set to a YouTube API key, so that you can use the music system. This is a required variable as of right now, as YouTube API is handled by the index.

