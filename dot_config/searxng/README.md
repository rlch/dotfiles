# SearXNG (Docker Compose)

Location (after chezmoi apply):
- `~/.config/searxng/docker-compose.yml`
- `~/.config/searxng/.env.example`
- `~/.config/searxng/core-config/`

## First-time setup

```bash
cd ~/.config/searxng
cp -n .env.example .env
# optional: edit .env and change SEARXNG_PORT
docker compose up -d
```

## Verify

```bash
docker compose ps
curl -fsS "http://127.0.0.1:${SEARXNG_PORT:-8080}" >/dev/null && echo ok
```

## Update

```bash
cd ~/.config/searxng
docker compose pull
docker compose up -d
```

## Stop

```bash
cd ~/.config/searxng
docker compose down
```
