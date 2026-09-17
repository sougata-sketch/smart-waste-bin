"use client";

import { useEffect, useRef, useState } from "react";

export default function Camera() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const captureRef = useRef(null);

    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const detectingRef = useRef(false);
    const alarmRef = useRef(0);
    const audioContextRef = useRef(null);

    const [cameraOn, setCameraOn] = useState(false);
    const [status, setStatus] = useState("Camera is OFF");

    // =========================
    // START CAMERA
    // =========================
    const startCamera = async () => {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                    },
                    audio: false,
                });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            captureRef.current =
                document.createElement("canvas");

            setCameraOn(true);
            setStatus("AI Detection Running");

            // Start AI detection every 500ms
            timerRef.current = setInterval(
                detectPlastic,
                500
            );
        } catch (error) {
            console.error("Camera Error:", error);
            setStatus("Camera Permission/Error");
        }
    };

    // =========================
    // STOP CAMERA
    // =========================
    const stopCamera = () => {
        // Stop AI timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Stop camera
        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
        }

        // Remove video
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        // Clear red boxes
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }

        detectingRef.current = false;

        setCameraOn(false);
        setStatus("Camera is OFF");
    };

    // =========================
    // ALARM
    // =========================
    const playAlarm = () => {
        const now = Date.now();

        if (now - alarmRef.current < 1000) {
            return;
        }

        alarmRef.current = now;

        try {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) return;

            if (!audioContextRef.current) {
                audioContextRef.current =
                    new AudioContext();
            }

            const audio =
                audioContextRef.current;

            if (audio.state === "suspended") {
                audio.resume();
            }

            const oscillator =
                audio.createOscillator();

            const gain =
                audio.createGain();

            oscillator.type = "square";
            oscillator.frequency.value = 1000;

            gain.gain.setValueAtTime(
                0.15,
                audio.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.01,
                audio.currentTime + 0.3
            );

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start();

            oscillator.stop(
                audio.currentTime + 0.3
            );
        } catch (error) {
            console.log("Alarm error:", error);
        }
    };

    // =========================
    // AI DETECTION
    // =========================
    const detectPlastic = async () => {
        if (!cameraOn && !streamRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const capture = captureRef.current;

        if (!video || !canvas || !capture) {
            return;
        }

        if (
            video.readyState < 2 ||
            video.videoWidth === 0
        ) {
            return;
        }

        if (detectingRef.current) {
            return;
        }

        detectingRef.current = true;

        try {
            // Capture camera frame
            capture.width = video.videoWidth;
            capture.height = video.videoHeight;

            const captureCtx =
                capture.getContext("2d");

            captureCtx.drawImage(
                video,
                0,
                0,
                capture.width,
                capture.height
            );

            const image =
                capture.toDataURL(
                    "image/jpeg",
                    0.75
                );

            // Send to API
            const response =
                await fetch("/api/detect", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        image,
                    }),
                });

            const result =
                await response.json();

            console.log(
                "AI Result:",
                result
            );

            // Setup overlay canvas
            canvas.width =
                video.videoWidth;

            canvas.height =
                video.videoHeight;

            const ctx =
                canvas.getContext("2d");

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            const predictions =
                Array.isArray(
                    result.predictions
                )
                    ? result.predictions
                    : [];

            // ONLY PLASTIC
            // Confidence >= 75%
            const plasticObjects =
                predictions.filter(
                    (prediction) => {
                        const className =
                            String(
                                prediction.class ||
                                ""
                            )
                                .toLowerCase()
                                .trim();

                        const confidence =
                            Number(
                                prediction.confidence ||
                                0
                            );

                        return (
                            className ===
                            "plastic" &&
                            confidence >= 0.75
                        );
                    }
                );

            // Draw red boxes
            plasticObjects.forEach(
                (prediction) => {
                    const x =
                        Number(
                            prediction.x
                        );

                    const y =
                        Number(
                            prediction.y
                        );

                    const width =
                        Number(
                            prediction.width
                        );

                    const height =
                        Number(
                            prediction.height
                        );

                    const left =
                        x - width / 2;

                    const top =
                        y - height / 2;

                    // RED BOX
                    ctx.strokeStyle =
                        "red";

                    ctx.lineWidth = 7;

                    ctx.strokeRect(
                        left,
                        top,
                        width,
                        height
                    );

                    // Confidence
                    const confidence =
                        Math.round(
                            Number(
                                prediction.confidence
                            ) * 100
                        );

                    const label =
                        `PLASTIC ${confidence}%`;

                    ctx.font =
                        "bold 24px Arial";

                    const textWidth =
                        ctx.measureText(
                            label
                        ).width;

                    // Label background
                    ctx.fillStyle =
                        "red";

                    ctx.fillRect(
                        left,
                        Math.max(
                            0,
                            top - 40
                        ),
                        textWidth + 20,
                        40
                    );

                    // Label
                    ctx.fillStyle =
                        "white";

                    ctx.fillText(
                        label,
                        left + 10,
                        Math.max(
                            27,
                            top - 13
                        )
                    );
                }
            );

            // Alarm
            if (
                plasticObjects.length > 0
            ) {
                setStatus(
                    "🚨 PLASTIC DETECTED!"
                );

                playAlarm();
            } else {
                setStatus(
                    "AI Detection Running"
                );
            }
        } catch (error) {
            console.error(
                "Detection Error:",
                error
            );

            setStatus(
                "Detection Error"
            );
        } finally {
            detectingRef.current =
                false;
        }
    };

    // =========================
    // CLEANUP
    // =========================
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(
                    timerRef.current
                );
            }

            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track) =>
                        track.stop()
                    );
            }

            if (
                audioContextRef.current
            ) {
                audioContextRef.current
                    .close()
                    .catch(() => {});
            }
        };
    }, []);

    return (
        <div
            style={{
                width: "100%",
                textAlign: "center",
            }}
        >
            <h2>
                AI Plastic Detection Camera
            </h2>

            <h3
                style={{
                    color:
                        status.includes(
                            "PLASTIC"
                        )
                            ? "red"
                            : "black",
                }}
            >
                {status}
            </h3>

            {/* START / STOP BUTTON */}
            <div
                style={{
                    marginBottom: "20px",
                }}
            >
                {!cameraOn ? (
                    <button
                        onClick={startCamera}
                        style={{
                            padding:
                                "12px 30px",
                            fontSize: "18px",
                            fontWeight:
                                "bold",
                            background:
                                "green",
                            color: "white",
                            border: "none",
                            borderRadius:
                                "10px",
                            cursor: "pointer",
                        }}
                    >
                        ▶ START CAMERA
                    </button>
                ) : (
                    <button
                        onClick={stopCamera}
                        style={{
                            padding:
                                "12px 30px",
                            fontSize: "18px",
                            fontWeight:
                                "bold",
                            background:
                                "red",
                            color: "white",
                            border: "none",
                            borderRadius:
                                "10px",
                            cursor: "pointer",
                        }}
                    >
                        ■ STOP CAMERA
                    </button>
                )}
            </div>

            {/* CAMERA */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "900px",
                    margin: "auto",
                    overflow: "hidden",
                    borderRadius: "15px",
                    background: "black",
                }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: "100%",
                        height: "500px",
                        objectFit: "cover",
                        display: "block",
                    }}
                />

                {/* AI RED BOX */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position:
                            "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents:
                            "none",
                    }}
                />
            </div>
        </div>
    );
}