# BCC-EP Cross-LAN — Deployment Ready

## Local PC / LAN
1. Install Node.js 20+ and MySQL 8+.
2. Import `schema.sql` into `baaocc_portal`.
3. Copy `.env.example` to `.env` and set the MySQL values.
4. Run `npm install` then `npm start`.
5. Open `http://localhost:4000` on the host PC.
6. On another device connected to the same Wi-Fi, open `http://YOUR-PC-LAN-IP:4000`.
7. Allow Node.js / TCP port 4000 through Windows Firewall if another device cannot connect.

## Docker
1. Change the demo passwords in `docker-compose.yml` before use.
2. Run `docker compose up -d --build`.
3. Open `http://localhost:4000` or `http://YOUR-PC-LAN-IP:4000`.
4. Uploaded files are persisted in `./uploads`; MySQL data is stored in the Docker volume `mysql_data`.

## Internet deployment
Do not expose MySQL directly to the internet. Put the Node app behind HTTPS/reverse proxy and use a managed/persistent MySQL service. For cloud platforms with ephemeral disks, replace local `uploads/` with persistent/object storage.

## Cross-device API
The frontend uses the same-origin `/api` path when served by Node, so phones do not need a hard-coded `localhost` API address. `localhost` on a phone means the phone itself; use the host PC's LAN IP for same-Wi-Fi access.
