"use client";
import { useState } from "react";
import styles from "../../style/Home/Login.module.css";

// Hardcoded credentials for now
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            setError("");
            onLoginSuccess();
        } else {
            setError("Invalid username or password");
        }
    }

    return (
        <div className={styles.wrapper}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Login</h2>

                <input
                    className={styles.input}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className={styles.error}>{error}</p>}

                <button className={styles.button} type="submit">
                    Log In
                </button>
            </form>
        </div>
    );
}