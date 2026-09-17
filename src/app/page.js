"use client";

import { useState } from "react";
import styles from "../style/Home/page.module.css";

import PressureGauge from "./components/PressureGauge";
import WasteLevel from "./components/WasteLevel";
import SensorDashboard from "./components/Sensordashboard";
import Login from "./components/Login";
import Camera from "./components/Camera";

export default function Home() {
    const [loggedIn, setLoggedIn] = useState(false);

    // Login screen
    if (!loggedIn) {
        return (
            <Login
                onLoginSuccess={() => setLoggedIn(true)}
            />
        );
    }

    return (
        <main>

            {/* ================= HEADER ================= */}
            <header className={styles.header}>
                <ul className={styles.list}>
                    <li className={styles.li}>Home</li>
                    <li className={styles.li}>Gas</li>
                    <li className={styles.li}>Waste</li>
                    <li className={styles.li}>About</li>
                </ul>
            </header>


            {/* ================= DATA CARDS ================= */}
            <section className={styles.datacards}>

                {/* ================= PRESSURE GAUGE ================= */}
                <div className={styles.dc1}>

                    <div className={styles.gasmeter}>

                        <h2 className={styles.datacards_dc1_gasmeter_text}>
                            Pressure Gauge
                        </h2>

                        <PressureGauge />

                        {/* ================= CAMERA ================= */}
                        <div className={styles.cameraSection}>


                            <Camera />

                        </div>

                    </div>

                </div>


                {/* ================= TRASH METER ================= */}
                <div className={styles.dc2}>

                    <div className={styles.wastemeter}>

                        <h1 className={styles.datacards_dc1_gasmeter_text}>
                            Trash Meter
                        </h1>

                        <WasteLevel value={65} />

                    </div>

                    {/* Sensor Data */}
                    <SensorDashboard />

                </div>

            </section>

        </main>
    );
}