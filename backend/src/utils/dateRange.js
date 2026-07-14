const toISODate = (date) => date.toISOString().slice(0, 10);

exports.toISODate = toISODate;

exports.getToday = () => toISODate(new Date());

exports.getWeekRange = (reference = new Date()) => {
    const date = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
    const day = date.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const start = new Date(date);
    start.setUTCDate(date.getUTCDate() + diffToMonday);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    return { start: toISODate(start), end: toISODate(end) };
};

exports.getMonthRange = (reference = new Date()) => {
    const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
    const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0));
    return { start: toISODate(start), end: toISODate(end) };
};

exports.getISOWeekNumber = (reference = new Date()) => {
    const date = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};
