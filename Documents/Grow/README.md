**Grow — Farm Game**

- **Frontend**: React + Vite (client/)
- **Backend**: Node.js + Express (server/) with PostgreSQL for saves
docker exec -i $(docker ps -q -f name=Grow_db_1) psql -U postgres -d grow -f /app/server/sql/init.sql
**Dev**: Run server and client locally (no Docker required)

**Quick start (dev)**

1. Start server locally

```bash
cd server
npm install
cp .env.example .env
# edit .env if needed (DATABASE_URL for your local DB)
npm start
```

2. Start client

```bash
cd client
npm install
npm run dev
```

**API**


**Notes**


Using the provided tile image

 - Quick-select seeds: press `1` for Wheat, `2` for Corn, `3` for Berry, `4` for Pumpkin.
 - Press `B` to buy the currently selected seed.
 - Crop icons are in `client/public/icons/` (wheat.svg, corn.svg, berry.svg, pumpkin.svg). They render on top of the tile and scale as they grow.

Hay Day-like visual notes

- The farm now uses a simple isometric/diamond tile presentation. This is a visual approximation to give the same feel as Hay Day.
- Decorative building assets are in `client/public/icons/buildings/` (`barn.svg`, `silo.svg`). They are placed on a few tiles by default to make the map look lived-in.
- To tune the look further you can replace `client/public/tile.png` with a higher-resolution isometric ground tile set and add larger building sprites.

Sound effects

- Copy your purchasing audio file to `client/public/sfx/buy.mp3`. For example, on your machine you can copy:

	`C:\Users\Administrator\Downloads\para-sesi-efekti_PaUswM1.mp3` -> `client/public/sfx/buy.mp3`

- The client plays `/sfx/buy.mp3` when a seed is purchased. If the file is missing the app will continue to work normally.
Hotkeys and visuals

- Quick-select seeds: press `1` for Wheat, `2` for Corn.
- Press `B` to buy the currently selected seed.
- Crop icons are in `client/public/icons/` (wheat.svg, corn.svg). They render on top of the tile and scale as they grow.
