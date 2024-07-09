import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { parseChannels } from "../channel/parseChannels";
import { Channel } from "../channel";
import { dayToNumber, dayToString } from "../utils";

const pageStyles: React.CSSProperties = {
    color: "#232129",
    padding: "24px 24px 0 24px",
    fontFamily: "-apple-system, Roboto, sans-serif, serif",
    maxHeight: "calc(100dvh - 48px s- 16px)",
    maxWidth: 560,
    overflowY: "hidden",
};

const headingStyles = {
    marginTop: 0,
    marginBottom: 16,
    maxWidth: 320,
};

const headingAccentStyles = {
    color: "#008DDA",
};

const listStyles: React.CSSProperties = {
    marginBottom: 0,
    paddingLeft: 0,
    listStyle: "none",
};

const listItemStyles: React.CSSProperties = {
    fontWeight: 300,
    fontSize: 24,
    maxWidth: 560,
    marginBottom: 18,

    backgroundColor: "#EEEEEE",

    borderRadius: "16px",
};

const badgeStyles: React.CSSProperties = {
    display: "inline",
    listStyle: "none",

    margin: "4px",
    padding: "4px 6px",

    fontSize: "14px",
    fontWeight: "bold",

    textAlign: "center",

    color: "white",
    backgroundColor: "#606470",

    borderRadius: "8px",
};

const listHeadingStyle = {
    color: "#222831",
    fontWeight: "bold",
    fontSize: 18,
    verticalAlign: "5%",
    marginTop: 0,
};

const descriptionStyle = {
    color: "#232129",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 0,
    lineHeight: 1.25,
};

const linkStyles: React.CSSProperties = {
    display: "inline",
    padding: "8px",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "4px 0",
};

const IndexPage: React.FC<PageProps> = () => {
    const [currentDateTime, setCurrentDateTime] = React.useState(
        new Date()
    );
    const [channels, setChannels] = React.useState<Channel[]>([]);
    const [selectedDay, selectDay] = React.useState(-1);

    React.useEffect(() => {
        fetch(
            `https://raw.githubusercontent.com/syrflover/syrflover/master/transmission-rss-channels.yaml?v=${currentDateTime.getTime()}`
        )
            .then((resp) => resp.text())
            .then((text) => {
                const channels = parseChannels(text);

                console.log(channels);

                setChannels(channels);

                setTimeout(() => {
                    selectDay(currentDateTime.getDay());
                }, 5);
            });
    }, []);

    React.useEffect(() => {
        const day = dayToString(selectedDay);

        if (day) {
            document.getElementsByClassName(day).item(0)?.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [selectedDay]);

    return (
        <main style={pageStyles}>
            <h1 style={headingStyles}>
                <a
                    style={{ color: "#232129" }}
                    href="https://myanimelist.net/animelist/syrlee"
                    target="_blank"
                >
                    <span style={headingAccentStyles}>syr</span>
                    's Anime List
                </a>
            </h1>

            <div
                style={{ display: "flex", justifyContent: "space-evenly" }}
            >
                <p style={linkStyles}>
                    <a
                        style={{ color: "#008DDA" }}
                        href="https://subsplease.org"
                        target="_blank"
                    >
                        SubsPlease
                    </a>
                </p>

                <p style={linkStyles}>
                    <a
                        style={{ color: "#008DDA" }}
                        href="https://anissia.net"
                        target="_blank"
                    >
                        Anissia
                    </a>
                </p>
            </div>

            <ul
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignContent: "center",
                    padding: 0,
                    marginBottom: "8px",
                }}
            >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => {
                        return (
                            <li
                                style={{
                                    ...badgeStyles,
                                    width: "calc(100%/7)",
                                    backgroundColor:
                                        selectedDay === dayToNumber(day)
                                            ? "#008DDA"
                                            : badgeStyles.backgroundColor,
                                }}
                                onClick={() => {
                                    const dayNumber = dayToNumber(day);

                                    if (dayNumber === selectedDay) {
                                        selectDay(-1);
                                    }

                                    setTimeout(() => {
                                        selectDay(dayNumber);
                                    });
                                }}
                            >
                                {day}
                            </li>
                        );
                    }
                )}
            </ul>

            {channels.length > 0 ? (
                <ul
                    style={{
                        ...listStyles,
                        maxHeight: "calc(100dvh - 228px)",
                        overflowY: "auto",
                        borderRadius: "16px",
                    }}
                >
                    {channels
                        .flatMap((channel) => channel.rules)
                        .sort((a, b) => {
                            const convertDay = (a: number) =>
                                a === 0 ? 7 : a;

                            const convertTime = (
                                a: string
                            ): [number, number] =>
                                a.split(":").map((x) => parseInt(x)) as [
                                    number,
                                    number
                                ];

                            const day =
                                convertDay(dayToNumber(a.day)) -
                                convertDay(dayToNumber(b.day));

                            if (day === 0) {
                                const hours =
                                    convertTime(a.time)[0] -
                                    convertTime(b.time)[0];

                                if (hours === 0) {
                                    const minutes =
                                        convertTime(a.time)[1] -
                                        convertTime(b.time)[1];

                                    return minutes;
                                } else {
                                    return hours;
                                }
                            } else {
                                return day;
                            }
                        })
                        .map((rule) => {
                            let highlightColor =
                                dayToNumber(rule.day) === selectedDay
                                    ? "#008DDA"
                                    : null;

                            return (
                                <li
                                    className={rule.day}
                                    key={rule.anissiaUrl}
                                    style={listItemStyles}
                                >
                                    <a
                                        href={rule.anissiaUrl}
                                        target="_blank"
                                        style={{
                                            display: "block",
                                            position: "relative",
                                            width: "calc(100% - 32px)",
                                            // height: "100%",
                                            textDecoration: "none",
                                            padding: "16px",
                                        }}
                                    >
                                        <ul
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignContent: "center",
                                                padding: 0,
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {/* <li
                                            style={{
                                                ...badgeStyles,
                                                margin: "4px 4px 4px 0",
                                                backgroundColor:
                                                    highlightColor ??
                                                    badgeStyles.backgroundColor,
                                            }}
                                        >
                                            {rule.quarter[0]} /{" "}
                                            {rule.quarter[1]}
                                        </li> */}
                                            <li
                                                style={{
                                                    ...badgeStyles,
                                                    backgroundColor:
                                                        highlightColor ??
                                                        badgeStyles.backgroundColor,
                                                }}
                                            >
                                                {rule.day}
                                            </li>
                                            <li
                                                style={{
                                                    ...badgeStyles,
                                                    backgroundColor:
                                                        highlightColor ??
                                                        badgeStyles.backgroundColor,
                                                }}
                                            >
                                                {rule.time}
                                            </li>
                                            <li
                                                style={{
                                                    ...badgeStyles,
                                                    backgroundColor:
                                                        highlightColor ??
                                                        badgeStyles.backgroundColor,
                                                }}
                                            >
                                                {rule.translator}
                                            </li>
                                        </ul>
                                        <span>
                                            <p
                                                style={{
                                                    ...listHeadingStyle,
                                                    margin: 0,
                                                    color:
                                                        highlightColor ??
                                                        listHeadingStyle.color,
                                                }}
                                            >
                                                {rule.match}
                                            </p>
                                            {/* <p style={descriptionStyle}>
                                        {rule.}
                                    </p> */}
                                        </span>
                                    </a>
                                </li>
                            );
                        })}
                </ul>
            ) : (
                "불러오는 중"
            )}
        </main>
    );
};

export default IndexPage;

export const Head: HeadFC = () => (
    <>
        <title>syr's Anime List</title>
        <body style={{ marginBottom: 0 }} />
    </>
);
