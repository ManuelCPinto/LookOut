# LookOut

| Student         | Nº    | Email                           |
| --------------- | ----- | ------------------------------- |
| Filipe Carvalho | 70410 | `fc.carvalho@campus.fct.unl.pt` |
| Manuel Pinto    | 70545 | `msb.pinto@campus.fct.unl.pt`   |

---

## 1. Overview

LookOut is a mobile application built with Expo and React Native that connects to an ESP32-based smart doorbell system. It uses MQTT for real-time messaging, Firebase for user authentication and datanbase, and Supabase for hosting storage. Through the app you can:

* Trigger on‑demand snapshots 
* Enroll and verify fingerprints
* Detect movement through a distance sensor
* Receive logs in real time

## 2. Prerequisites

Ensure you have the following installed:

* **Node.js** (v14 or newer)
* **npm** (or **Yarn**)
* **Expo CLI**

  ```bash
  npm install -g expo-cli
  ```
* **Firebase project**

  * Enable **Authentication** and **Firestore**
  * Copy your config values (`apiKey`, `authDomain`, etc.)
* **Supabase project**

  * Create a table or storage bucket for snapshots
  * Copy your **URL** and **Anon Key**
* **MQTT broker** credentials

  * HiveMQ Cloud (host, port, username, password) or another broker
* An **Android/iOS simulator** or **physical device** with Expo Go

Create a `.env` file in the project root with the following variables:

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
MQTT_HOST=...
MQTT_PORT=...
MQTT_USERNAME=...
MQTT_PASSWORD=...
```

## 3. Setup
 **Clone the repository**:

   ```bash
   git clone https://github.com/your-org/lookout.git
   cd lookout
   ```
 **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

## 4. Running the App

Start the Expo development server:

```bash
expo start
```

Then either:

* Scan the QR code with **Expo Go** on your device
* Run on an emulator:

  ```bash
  expo run:android
  expo run:ios
  ```

## 5. Usage

* **Sign Up / Log In** with your email
* **Pair a doorbell** by scanning the QR code displayed on the ESP32’s OLED
* **Request a snapshot**: open the device modal and tap “Request Snapshot”
* **Enroll a fingerprint**: tap the fingerprint icon, confirm, then scan
* **View logs**: recent motion, snapshot, and fingerprint events appear in real time
