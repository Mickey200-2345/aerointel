# AeroIntel | Global Aviation Intelligence Platform

This is the AeroIntel Enterprise platform, a high-fidelity Next.js application optimized for aviation cargo, logistics, and Android Studio deployment.

## 🚀 How to Export to Android Studio (Clear Steps)

1.  **Prepare the Build**:
    In the terminal below, run:
    ```bash
    npm run build
    ```
2.  **Sync Mobile Assets**:
    Run the following command to move the web files into the Android folder:
    ```bash
    npx cap sync
    ```
3.  **Download the Project**:
    - Go to **File > Open Folder** in the top menu.
    - Accept the default `/home/user` directory.
    - Right-click the **`studio`** folder in the sidebar and select **Zip and Download**.
    - If prompted to "rebuild," click **Cancel**.
4.  **Launch in Android Studio**:
    - Unzip the file on your computer.
    - Open **Android Studio**.
    - Select **Open** and choose the `android` folder inside your unzipped project.

## 🛠️ Tactical Features Included
- **Live Radar Portal**: Real-time satellite tracking with ADS-B protocol handshake.
- **3D Stability Hub**: Advanced weight and balance engine with workable PDF Export and Avionics Sync.
- **AI Shipment Copilot**: Intelligent logistics agent with tactical fallback heuristics.
- **Dynamic Temporal Sync**: All years (2025+) update automatically across the platform.

---
© 2025 AeroIntel Enterprise | Tactical Logistics Nodes