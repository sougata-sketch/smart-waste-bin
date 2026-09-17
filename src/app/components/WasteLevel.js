import styles from "../../style/Home/page.module.css";

export default function WasteLevel({ value = 50 }) {
    const pct = Math.min(100, Math.max(0, value));

    return (
        <div className={styles.wasteWrapper}>
            <div className={styles.wasteGauge}>
                <div className={styles.wasteFill} style={{ height: `${pct}%` }} />
                <div className={styles.wasteMarker} style={{ bottom: `${pct}%` }} />
            </div>
            <div className={styles.wasteLabel}>{pct}%</div>
        </div>
    );
}
