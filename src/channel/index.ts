export type Channel = {
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
