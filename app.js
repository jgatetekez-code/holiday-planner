const API = "https://date.nager.at/api/v3";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const countrySelect = document.getElementById("country-select");
const yearSelect = document.getElementById("year-select");
const controls = document.getElementById("controls");
const sortSelect = document.getElementById("sort-select");
const highlightFilter = document.getElementById("highlight-filter");
const monthFilter = document.getElementById("month-filter");
const typeFilter = document.getElementById("type-filter");
const searchInput = document.getElementById("search-input");
const statusEl = document.getElementById("status");
const summaryEl = document.getElementById("summary");
const resultsEl = document.getElementById("results");

let holidays = [];
let offDays = new Set();

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.className = isError ? "error" : "";
}

function parseDate(text) {
    const [y, m, d] = text.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function key(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function addDays(date, n) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + n);
    return copy;
}

function shortDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

async function getJSON(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
        const response = await fetch(url, { signal: controller.signal });

        if (response.status === 404) {
            throw new Error("No holiday data is available for that country.");
        }

        if (!response.ok) {
            throw new Error("The holiday service returned an error (" + response.status + "). Please try again.");
        }
        return await response.json();
    } catch (error) {
        if (error.name == "AbortError") {
            throw new Error("The holiday service took too long to answer. Please try again.");
        }
        if (error instanceof TypeError) {
            throw new Error("Network problem. Check your internet connection and try again.");
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}



function isOff(date, extra) {
    const day = date.getDay();
    return day === 0 || day === 6 || offDays.has(key(date)) || (extra && key(date) === key(extra));
}

function findBreak(date, extra) {
    let start = date;
    let end = date;
    let days = 1;
    while (isOff(addDays(start, -1), extra)) { start = addDays(start, -1); days++; }
    while (isOff(addDays(end, 1), extra)) { end = addDays(end, 1); days++; }
    return { start, end, days };
}

function findBridge(brk) {
    let best = null;
    [addDays(brk.start, -1), addDays(brk.end, 1)].forEach(leave => {
        if (isOff(leave)) return;
        const joined = findBreak(leave, leave);
        if (joined.days >= brk.days + 2 && (!best || joined.days > best.days)) {
            best = { leave: leave, days: joined.days, start: joined.start, end: joined.end };
        }
    });
    return best;
}

function analyse(list) {
    offDays = new Set(list.filter(h => h.counts).map(h => h.date));

    list.forEach(h => {
        const d = parseDate(h.date);
        h.dateObj = d;
        h.onWeekend = d.getDay() === 0 || d.getDay() === 6;
        h.break = null;
        h.bridge = null;
        if (h.counts && !h.onWeekend) {
            h.break = findBreak(d);
            h.bridge = findBridge(h.break);
        }
        h.longWeekend = !!h.break && h.break.days >= 3;
        h.breakDays = h.break ? h.break.days : 0;
    })
}

function cleanHoliday(p) {
    const types = Array.isArray(p.types) ? p.types : [];
    const isGlobal = p.global !== false;
    return {
        date: p.date,
        name: p.name || "Unnamed holiday",
        localName: p.localName || "",
        types: types,
        isGlobal: isGlobal,
        counts: isGlobal && types.includes("Public")
    };
}

function getVisible() {
    let list = [...holidays];

    const highlight = highlightFilter.value;
    if (highlight === "long") list = list.filter(h => h.longWeekend);
    if (highlight === "bridge") list = list.filter(h => h.bridge);

    const month = monthFilter.value;
    if (month !== "all") list = list.filter(h => h.dateObj.getMonth() === Number(month));

    const type = typeFilter.value;
    if (type !== "all") list = list.filter(h => h.types.includes(type));
    const term = searchInput.value.trim().toLowerCase();
    if (term) {
        list = list.filter(h => h.name.toLowerCase().includes(term) || h.localName.toLowerCase().includes(term));
    }

    const sort = sortSelect.value;
    if (sort === "date") list.sort((a, b) => a.date.localeCompare(b.date));
    if (sort === "break") list.sort((a, b) => b.breakDays - a.breakDays || a.date.localeCompare(b.date));
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;

}

function makeCard(h) {
    const card = el("article", "card");
    card.appendChild(el("p", "date", shortDate(h.dateObj) + " " + h.dateObj.getFullYear()));
    card.appendChild(el("h3", "", h.name));
    if (h.localName && h.localName !== h.name) card.appendChild(el("p", "local", h.localName));

    const tags = el("div", "tags");
    h.types.forEach(t => tags.appendChild(el("span", "tag", t)));
    if (!h.isGlobal) tags.appendChild(el("span", "tag", "Regional"));
    card.appendChild(tags);

    if (h.longWeekend) {
        card.appendChild(el("p", "note long",
            "🎉 " + h.break.days + "-day break: " + shortDate(h.break.start) + " to " + shortDate(h.break.end)));

    } else if (h.onWeekend) {
        card.appendChild(el("p", "note plain", "Falls on a weekend"));

    } else if (!h.counts) {
        card.appendChild(el("p", "note plain", "Not counted as a nationwide day off"));
 
    } else if (h.break && h.break.days === 2) {
        card.appendChild(el("p", "note plain",
       "2-day break: " + shortDate(h.break.start) + " to " + shortDate(h.break.end)));
    }
    else {
        card.appendChild(el("p", "note plain", "Single day off, no long weekend"));

    }

    if (h.bridge) {
        card.appendChild(el("p", "note bridge",
            "💡 Take " + shortDate(h.bridge.leave) + " off for a " + h.bridge.days + "-day break (" +
            shortDate(h.bridge.start) + " to " + shortDate(h.bridge.end) + ")"));
    }
    return card;
}

function render() {
    const list = getVisible();
    resultsEl.innerHTML = "";

    const longCount = holidays.filter(h => h.longWeekend).length;
    const bridgeCount = holidays.filter(h => h.bridge).length;
    summaryEl.textContent = holidays.length + " holidays this year, " + longCount +
        " give a long weekend, " + bridgeCount + " have a bridge-day tip.";

    if (list.length === 0) {
        setStatus("No holidays match your Filters.");
        return;
    }
    setStatus("");
    list.forEach(h => resultsEl.appendChild(makeCard(h)));
}

async function loadHolidays() {
    const country = countrySelect.value;
    const year = yearSelect.value;
    if (!country) return;

    setStatus("Loading holidays...");
    resultsEl.innerHTML = "";
    summaryEl.textContent = "";
    controls.classList.add("hidden");

    try {
        const data = await getJSON(API + "/PublicHolidays/" + year + "/" + country);
        if (!Array.isArray(data) || data.length === 0) {
            setStatus("No holidays found for that country and year.");
            return;
        }
        holidays = data.map(cleanHoliday);
        analyse(holidays);
        controls.classList.remove("hidden");
        render();
    } catch (error) {
        setStatus(error.message, true);
    }

}

async function loadCountries() {
    try {
        const data = await getJSON(API + "/AvailableCountries");
        if (!Array.isArray(data)) throw new Error("The holiday service sent back unexpected data.");
        data.sort((a, b) => a.name.localeCompare(b.name));

        countrySelect.innerHTML = "";
        const placeholder = el("option", "", "Choose a country");
        placeholder.value = "";
        countrySelect.appendChild(placeholder);
        data.forEach(c => {
            const option = el("option", "", c.name);
            option.value = c.countryCode;
            countrySelect.appendChild(option);
        });
        setStatus("Choose a country to see its holidays.");
    } catch (error) {
        countrySelect.innerHTML = "";
        countrySelect.appendChild(el("option", "", "Could not load countries"));
        setStatus(error.message + " Refresh the page to try again.", true);
    }
}

function setupSelects() {
    const thisYear = new Date().getFullYear();
    for (let y = thisYear - 2; y <= thisYear + 3; y++) {
        const option = el("option", "", String(y));
        option.value = y;
        if (y === thisYear) option.selected = true;
        yearSelect.appendChild(option);
    }
    MONTHS.forEach((name, i) => {
        const option = el("option", "", name);
        option.value = i;
        monthFilter.appendChild(option);
    });
}

countrySelect.addEventListener("change", loadHolidays);
yearSelect.addEventListener("change", loadHolidays);
[sortSelect, highlightFilter, monthFilter, typeFilter].forEach(s => s.addEventListener("change", render));
searchInput.addEventListener("input", render);

setupSelects();
loadCountries();

