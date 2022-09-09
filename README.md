# Snekk 🐍
[![Deploy to Fly](https://github.com/ngynkvn/snekk/actions/workflows/main.yml/badge.svg)](https://github.com/ngynkvn/snekk/actions/workflows/main.yml)

Hi. This is my pet project for messing with docker, containerization, and managing networked application services

# Running

```bash
docker-compose up
```

Should spin up the bot server and a copy of the battlesnakes rule engine. 

It'll automatically run an instance of the game and create a timestamped log of the run on your host machine.

# Development setup

```bash
git submodule update --init --recursive
git config blame.ignoreRevsFile .git-blame-ignore-rev
```

# Compatibility
I'm actually running this with podman, but it should be docker compatible lol
