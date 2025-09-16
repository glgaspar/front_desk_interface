export function maskDateTime (input?: string | number, hour=true) {
    if (!input || new Date(input).valueOf() <= new Date("02/01/1900").valueOf()) return "";

    let date = input;
    if (typeof input === "string") date = String(date).replace(/Z$/, "");
    date = new Date(date).toLocaleString();
    if (!hour)
        date = date.split(',')[0];
    return date;
}