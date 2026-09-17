import styles from "../../style/Home/page.module.css";

export default function PressureGauge({ value = 90 }) {
    const pct = Math.min(100, Math.max(0, value));

    return (
        <div className={styles.wrapper}>
            <div className={styles.gauge}>
                <div className={styles.fill} style={{ height: `${pct}%` }} />
                <div className={styles.marker} style={{ bottom: `${pct}%` }} />
            </div>
            <div className={styles.label}>{pct}%</div>
        </div>
    );
}
