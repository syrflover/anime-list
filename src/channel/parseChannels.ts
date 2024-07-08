import * as YAML from "yaml";
import { Channel } from ".";

export function parseChannels(text: string) {
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
            ["quarter", "day", "time", "translator", "anissiaUrl"].every(
                (key) => rule[key as keyof Channel["rules"][0]]?.length > 0
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
            ["Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat.", "Sun."].some(
                (day) => line.startsWith(day)
            )
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

    return channels;
}
