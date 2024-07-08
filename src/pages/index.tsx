import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import YAML from "yaml";

const pageStyles: React.CSSProperties = {
    color: "#232129",
    padding: 24,
    fontFamily: "-apple-system, Roboto, sans-serif, serif",
};

const headingStyles = {
    marginTop: 0,
    marginBottom: 32,
    maxWidth: 320,
};

const headingAccentStyles = {
    color: "#008DDA",
};

const listStyles: React.CSSProperties = {
    marginBottom: 24,
    paddingLeft: 0,
    listStyle: "none",
};

const listItemStyles: React.CSSProperties = {
    fontWeight: 300,
    fontSize: 24,
    maxWidth: 560,
    marginBottom: 30,

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

type Channel = {
    url: string;
    rules: {
        // year, quarter
        quarter: [number, number];
        day: string;
        time: string;
        translator: string;
        anissiaUrl: string;
        match: string;
    }[];
};

const dayToNumber = (x: string) => {
    switch (x) {
        case "Mon":
            return 1;

        case "Tue":
            return 2;

        case "Wed":
            return 3;

        case "Thu":
            return 4;

        case "Fri":
            return 5;

        case "Sat":
            return 6;

        case "Sun":
            return 0;

        default:
            return -1;
    }
};

const IndexPage: React.FC<PageProps> = () => {
    const [currentDateTime, setCurrentDateTime] = React.useState(
        new Date()
    );
    const [channels, setChannels] = React.useState<Channel[]>([]);

    React.useEffect(() => {
        fetch(
            "https://raw.githubusercontent.com/syrflover/syrflover/master/transmission-rss-channels.yaml"
        )
            .then((resp) => resp.text())
            .then((text) => {
                const channels: Channel[] = YAML.parse(text);

                console.log(channels);

                const lines = text
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);

                let currentQuarter = "";
                let currentIndex = [0, 0];

                for (let line of lines) {
                    let rules = channels[currentIndex[0]].rules;
                    let rule = rules[currentIndex[1]];

                    if (currentIndex[1] > rules.length - 1) {
                        currentIndex[0] += 1;
                        currentIndex[1] = 0;

                        rules = channels[currentIndex[0]].rules;
                        rule = rules[currentIndex[1]];
                    }

                    if (
                        [
                            "quarter",
                            "day",
                            "time",
                            "translator",
                            "anissiaUrl",
                        ].every(
                            (key) =>
                                rule[key as keyof Channel["rules"][0]]
                                    ?.length > 0
                        )
                    ) {
                        if (currentIndex[1] < rules.length - 1) {
                            currentIndex[1] += 1;

                            rule = rules[currentIndex[1]];
                        } else {
                            continue;
                        }
                    }

                    if (line.startsWith("# - match: ")) {
                        rule.anissiaUrl = "";

                        continue;
                    }

                    if (line.startsWith("#")) {
                        line = line.replace("#", "").trim();

                        if (line.length === 0) {
                            continue;
                        }
                    } else {
                        continue;
                    }

                    console.log(line, currentIndex);

                    if (line.startsWith("Q.")) {
                        currentQuarter = line.replace("Q.", "").trim();
                    }

                    if (
                        [
                            "Mon.",
                            "Tue.",
                            "Wed.",
                            "Thu.",
                            "Fri.",
                            "Sat.",
                            "Sun.",
                        ].some((day) => line.startsWith(day))
                    ) {
                        let [day, time, translator] = line
                            .split(".")
                            .map((x) => x.trim());

                        rule.quarter = currentQuarter
                            .split("/")
                            .map((x) => parseInt(x)) as [number, number];

                        rule.day = day;
                        rule.time = time;
                        rule.translator = translator;
                    }

                    if (line.startsWith("https://anissia.net/")) {
                        rule.anissiaUrl = line;
                    }
                }

                console.log(channels);

                setChannels(channels);
            });
    }, []);

    return (
        <main style={pageStyles}>
            <h1 style={headingStyles}>
                <span style={headingAccentStyles}>syr</span>
                's Anime List
            </h1>

            <ul style={listStyles}>
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
                            dayToNumber(rule.day) ===
                            currentDateTime.getDay()
                                ? "#008DDA"
                                : null;

                        return (
                            <li
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
                                        <li
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
                                        </li>
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
        </main>
    );
};

export default IndexPage;

export const Head: HeadFC = () => <title>syr's Anime List</title>;
