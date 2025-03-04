const response = fetch("https://www.mtggoldfish.com/q?query_string=dandan")
const res = await response
const htmlText = res.text();
const content = await htmlText;
const parser = new DOMParser();
const doc = parser.parseFromString(content, "text/html");
const rows = doc.querySelectorAll("table.table tbody tr");
let cards = [];
rows.forEach(row => {
    const cardElement = row.querySelector(".card_name a");

    if (cardElement) {
        const cardName = cardElement.textContent.trim();
        const cardId = cardElement.getAttribute("data-card-id");
        const cardImage = cardElement.getAttribute("data-full-image");

        cards.push({ cardName, cardId, cardImage, encodeURIComponent(cardId)});
    }
});