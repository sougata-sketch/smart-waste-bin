"use client";
import { useEffect, useState } from "react";
import styles from "../../style/Home/Sensordashboard.module.css";

const APIURL = "https://smart-waste-bin-server.onrender.com/api/sensor-data/latest";

const DEFAULT_DATA = {
    plastic: false,
    gasValue: 0,
    gasDetected: false,
    irObject: false,
    distance: 0,
    alert: false,
};

export default function SensorDashboard() {
    const [data, setData] = useState(DEFAULT_DATA);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(API_URL);
                const json = await res.json();
                setData(json || DEFAULT_DATA);
            } catch (err) {
                setData(DEFAULT_DATA);
            }
        }

        fetchData();
        const interval = setInterval(fetchData, 2000);

        return () => clearInterval(interval);
    }, []);

    const cards = [
        { label: "Plastic Detected", value: data.plastic ? "YES" : "NO", alert: data.plastic },
        { label: "Gas Level", value: data.gasValue, alert: data.gasDetected },
        { label: "Gas Detected", value: data.gasDetected ? "YES" : "NO", alert: data.gasDetected },
        { label: "IR Object", value: data.irObject ? "YES" : "NO", alert: data.irObject },
        { label: "Bin Distance", value: `${data.distance} cm`, alert: data.distance <= 20 },
        { label: "Alert Status", value: data.alert ? "ALERT" : "NORMAL", alert: data.alert },
    ];

    return (
        <div className={styles.datacards}>
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`${styles.dc1} ${card.alert ? styles.dcAlert : ""}`}
                >
                    <p className={styles.dcLabel}>{card.label}</p>
                    <p className={styles.dcValue}>{card.value}</p>
                </div>
            ))}
        </div>
    );
}