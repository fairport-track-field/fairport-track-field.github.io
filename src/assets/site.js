// Small enhancements. Every page works without this script.
(function () {
  var today = (function () {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function parse(iso) { var p = iso.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function label(start, end) {
    var s = parse(start);
    var out = DAYS[s.getDay()] + ", " + MONTHS[s.getMonth()] + " " + s.getDate();
    if (!end) return out;
    var e = parse(end);
    return out + (e.getMonth() === s.getMonth() ? "–" + e.getDate() : " – " + MONTHS[e.getMonth()] + " " + e.getDate());
  }

  // Home: keep "Next meet" current even if the site hasn't been rebuilt.
  var hero = document.getElementById("next-meet");
  if (hero && hero.dataset.meets) {
    var meets = JSON.parse(hero.dataset.meets);
    var next = meets.find(function (m) { return (m.end_date || m.date) >= today; });
    if (next) {
      var set = function (field, text) { var el = hero.querySelector('[data-field="' + field + '"]'); if (el) el.textContent = text; };
      set("name", next.name);
      set("date", label(next.date, next.end_date));
      set("where", next.location + (next.time ? ", " + next.time : ""));
      var days = Math.round((parse(next.date) - parse(today)) / 86400000);
      var cd = hero.querySelector("[data-countdown]");
      if (cd) cd.textContent = days > 1 ? "in " + days + " days" : days === 1 ? "tomorrow" : "today";
    }
  }

  // Schedule: mark finished meets and the next one up; open the next meet's event order.
  var rows = document.querySelectorAll(".schedule__row");
  var foundNext = false;
  rows.forEach(function (row) {
    var detail = row.nextElementSibling && row.nextElementSibling.classList.contains("schedule__detail") ? row.nextElementSibling : null;
    if (row.dataset.end < today) {
      row.classList.add("is-past");
      if (detail) detail.classList.add("is-past");
    } else if (!foundNext) {
      row.classList.add("is-next");
      foundNext = true;
    }
  });

  document.querySelectorAll(".key-dates__list li").forEach(function (li) {
    if (li.dataset.end < today) li.classList.add("is-past");
  });

  // Top 10: girls / boys filter.
  var toggle = document.querySelector(".gender-toggle");
  if (toggle) {
    toggle.hidden = false;
    var stored = null;
    try { stored = localStorage.getItem("fairport-list-gender"); } catch (e) {}
    var apply = function (value) {
      document.body.classList.remove("show-girls", "show-boys");
      if (value !== "both") document.body.classList.add("show-" + value);
      toggle.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.show === value)); });
      try { localStorage.setItem("fairport-list-gender", value); } catch (e) {}
    };
    toggle.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (btn) apply(btn.dataset.show);
    });
    if (stored) apply(stored);
  }
})();
