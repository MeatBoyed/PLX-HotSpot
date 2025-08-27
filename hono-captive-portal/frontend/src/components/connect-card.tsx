import React, { useState } from "react";

const styles = {
    container: {
        backgroundColor: "var(--brand-primary)",
        position: "relative",
        borderRadius: "1.5rem",
        width: "100%",
        maxWidth: "24rem",
        margin: "0 auto",
    } as React.CSSProperties,
    backgroundImage: {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "1.5rem",
    } as React.CSSProperties,
    card: {
        position: "relative",
        borderRadius: "0.25rem",
        padding: "1rem",
        color: "white",
        overflow: "hidden",
    } as React.CSSProperties,
    wifiIcon: {
        width: "70px",
        height: "70px",
        marginBottom: "0.5rem",
    } as React.CSSProperties,
    title: {
        textAlign: "center",
        marginBottom: "2.5rem",
        fontSize: "1.25rem",
        fontWeight: "bold",
        lineHeight: "1.5",
    } as React.CSSProperties,
    voucherInput: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem",
        gap: "1rem",
        width: "100%",
        padding: "0.75rem",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        color: "black",
        borderColor: "var(--surface-border)",
        borderWidth: "1px",
    } as React.CSSProperties,
    input: {
        fontSize: "1rem",
        fontWeight: "normal",
        width: "100%",
    } as React.CSSProperties,
    termsCheckbox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        marginBottom: "1rem",
        borderColor: "white",
        marginTop: "0.125rem",
        "--tw-checked-bg": "var(--surface-white)",
        "--tw-checked-color": "var(--brand-primary)",
    } as React.CSSProperties,
    termsLabel: {
        fontSize: "0.875rem",
        lineHeight: "1.5",
        cursor: "pointer",
    } as React.CSSProperties,
    button: {
        width: "100%",
        borderRadius: "2rem",
        fontWeight: "500",
        padding: "1.5rem",
        fontSize: "1rem",
        cursor: "pointer",
        backgroundColor: "var(--button-secondary)",
        color: "var(--button-secondary-text)",
        "--tw-hover-bg": "var(--button-secondary-hover)",
    } as React.CSSProperties,
};

export default function ConnectCard() {
    const [voucherCode, setVoucherCode] = useState("");

    return (
        <div style={styles.container}>
            <img
                src="assets/images/internet-claim-bg.png"
                alt="Background overlay"
                style={styles.backgroundImage}
            />

            <div style={styles.card}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <img
                        src="assets/images/wifi-icon.svg"
                        alt="wifi icon"
                        style={styles.wifiIcon}
                    />
                </div>

                <div style={styles.title}>Welcome to the Hotspot!</div>

                <form style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={styles.voucherInput}>
                        <input
                            type="text"
                            id="voucherCode"
                            placeholder="Enter your voucher code"
                            value={voucherCode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoucherCode(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.termsCheckbox}>
                        <input
                            id="terms"
                            type="checkbox"
                            required
                            style={{ borderColor: "white", marginTop: "0.125rem" }}
                        />
                        <label htmlFor="terms" style={styles.termsLabel}>
                            Accept terms & conditions to continue
                        </label>
                    </div>

                    <button style={styles.button} type="submit">
                        <img
                            src="assets/images/watch-video-icon.svg"
                            alt="watch video"
                            width="auth"
                            height="auto"
                        />
                        Watch video to claim
                    </button>
                </form>
            </div>
        </div>
    );
}