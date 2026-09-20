# Baao Community College Unified Enrollment Portal

The project contains the original web portal features (Student, Instructor,
Registrar, and Admin) and a Node/Express + MySQL backend. The same portal is
also available from the Expo React Native shell in [`mobile/`](./mobile/).
The mobile shell keeps the existing screens and interactions intact while
providing a native Android/iOS entry point. The backend is configured to listen
on all network interfaces so phones and other devices on the same LAN can
reach the portal.

## Backend and database

1. Install Node.js 20 LTS (recommended) and MySQL 8. Node 26 is not supported
   by Expo SDK 57.
2. Install the backend packages:

   ```powershell
   npm.cmd install --no-audit --no-fund
   ```

3. Create the database and seed the demo records:

   ```powershell
   mysql -u root -p < schema.sql
   ```

4. Copy `.env.example` to `.env` and set the MySQL values if they differ from
   the defaults.
5. Start the API and web portal:

   ```powershell
   npm run dev
   ```

Open `http://localhost:4000`. The API health check is available at
`http://localhost:4000/api/health`.

Important: the web portal now automatically sends API requests to port `4000`
when opened through Live Server or another frontend port. For the most reliable
setup, run the Node.js server with `npm start` and open `http://localhost:4000`.
The Admin and Registrar portals load their account records from MySQL through
`/api/bootstrap`; they no longer depend on the local demo records when the API
is available.

## React Native / Expo Go (SDK 57)

The mobile project is configured for Expo SDK 57. Use the current Expo Go
application that supports SDK 57; an older Expo Go version may show an
"unsupported SDK" message.

Install the mobile dependencies once:

```powershell
npm.cmd run mobile:install
```

Start Expo:

```powershell
npm.cmd run mobile:clear
```

The app automatically detects the Expo LAN host and uses the backend on port
4000. The Android emulator fallback is `http://10.0.2.2:4000`, and the iOS
Simulator fallback is `http://localhost:4000`. For a physical device, the
backend must be running and the device and computer must be on the same Wi-Fi.
If automatic detection is not available, set the URL manually:

```powershell
$env:EXPO_PUBLIC_PORTAL_URL = "http://192.168.1.20:4000"
npm.cmd run mobile
```

The backend must be running and Windows Firewall must allow inbound access to
port 4000 for physical-device testing.

## Physical phone / LAN access

The web portal and Expo shell support testing from a physical phone on the same Wi-Fi network. The Node.js server listens on `0.0.0.0:4000`, and the server prints the PC's LAN address when it starts. For example:

```text
Network: http://192.168.1.20:4000
```

Open that Network address on a phone browser, or run Expo Go from the `mobile/` folder. The Expo shell automatically uses the computer's Expo LAN host and port `4000`, so the phone does not use its own `localhost`.

Requirements for physical-device testing:

- PC and phone are connected to the same Wi-Fi/LAN.
- MySQL and the Node.js API are running on the PC.
- Windows Firewall allows inbound TCP traffic on port `4000`.
- Do not use `localhost` as the API address on the phone.

Different phone IP addresses are normal. For example, the PC can be `192.168.1.20` and the phone can be `192.168.1.35`; the phone should still connect to `http://192.168.1.20:4000`.

For a phone using mobile data or a completely different Wi-Fi network, a public HTTPS backend/domain is required. A private `192.168.x.x` address cannot normally be reached across the public Internet.


## Cross-device photo uploads (LAN)

The portal is configured for LAN testing. Start the Node.js server on the computer that also runs MySQL. The server listens on `0.0.0.0:4000` and prints the computer's Network URL when it starts. On a phone connected to the same Wi-Fi, open that Network URL, for example `http://192.168.254.102:4000`. Do not use `localhost` on the phone.

Student requirement images are compressed in the browser and stored with the student's document data in MySQL. Because the image is returned through `/api/bootstrap`, the Registrar and Admin portals on other devices on the same LAN can see the same uploaded image. Keep the server laptop, MySQL, and Node.js running while the devices are using the portal. If the Wi-Fi/network changes, use the new Network URL printed by Node.js.
