// import { useTheme } from "../theme-provider";
import { Link } from "@tanstack/react-router"
import { type CSSProperties } from "react"


export default function Head() {
    // const { theme } = useTheme();

    const divStyle: CSSProperties = {
        width: "full",
        display: "flex",
        alignItems: "center",
        justifyContent: "start",
        padding: "1rem",
        paddingTop: "2rem",
        maxWidth: "28rem"
    }

    const linkStyle: CSSProperties = {
        width: "7rem",
    }
    const imageStyle: CSSProperties = {
        maxWidth: "100%", height: "auto"
    }

    const logo = "assets/images/plusnet-logo.svg"

    return (
        <div style={divStyle}>
            <Link to="/" style={linkStyle} >
                {/* eslint-disable @next/next/no-img-element  */}
                <img
                    src={logo}
                    style={imageStyle}
                    alt="Brand logo"
                    width="auto"
                    height="auto"
                />
            </Link>
        </div>
    )
}