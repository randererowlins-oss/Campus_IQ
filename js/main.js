/* ============================================================
   Campus IQ — shared behaviour
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Toast ---------- */
  const toastWrap = document.createElement("div");
  toastWrap.className = "toast-wrap";
  document.body.appendChild(toastWrap);

  window.CIQ = window.CIQ || {};
  CIQ.toast = function (message, icon) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      (icon ||
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>') +
      "<span></span>";
    el.querySelector("span").textContent = message;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 380);
    }, 3200);
  };

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    const setMenu = (open) => {
      navToggle.classList.toggle("open", open);
      mobileMenu.classList.toggle("open", open);
      document.body.classList.toggle("menu-locked", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      // staggered link entrance
      mobileMenu.querySelectorAll("a.m-link").forEach((a, i) => {
        a.style.transitionDelay = open ? 0.06 + i * 0.045 + "s" : "0s";
      });
    };
    navToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Grade bar animation (data-grade) ---------- */
  const gradeFills = document.querySelectorAll(".grade-fill[data-grade]");
  if (gradeFills.length) {
    const gio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            requestAnimationFrame(() => {
              el.style.width = el.dataset.grade + "%";
            });
            gio.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    gradeFills.forEach((el) => gio.observe(el));
  }

  /* ---------- Deadline countdowns ---------- */
  const now = new Date();
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    const target = new Date(el.dataset.countdown + "T23:59:59");
    const days = Math.round((target - now) / 86400000);
    const b = el.querySelector("b") || el;
    b.textContent = days < 0 ? "0" : days;
    el.querySelector("small").textContent = days === 0 ? "today" : "days";
  });

  /* ---------- Forms (validation + success morph) ---------- */
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((input) => {
        const field = input.closest(".field");
        const valid =
          input.checkValidity() &&
          (input.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        if (field) field.classList.toggle("error", !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;

      const card = form.closest(".form-card");
      if (card) {
        const ref = "CIQ-" + Math.random().toString(36).slice(2, 7).toUpperCase();
        const refEl = card.querySelector(".ref");
        if (refEl) refEl.textContent = "Reference " + ref;
        card.classList.add("sent");
      }
      const msg = form.dataset.success || "Sent — we'll get back to you within one working day.";
      CIQ.toast(msg);
    });
    // clear error state on input
    form.querySelectorAll("input, textarea, select").forEach((input) => {
      input.addEventListener("input", () => {
        const field = input.closest(".field");
        if (field) field.classList.remove("error");
      });
    });
  });

  /* ---------- ICS calendar export ---------- */
  CIQ.downloadICS = function (ev) {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Campus IQ//EN",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@campusiq",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      "DTSTART:" + ev.start.replace(/[-:]/g, "") + "00",
      "DTEND:" + ev.end.replace(/[-:]/g, "") + "00",
      "SUMMARY:" + ev.title,
      "LOCATION:" + (ev.location || ""),
      "DESCRIPTION:" + (ev.desc || "").replace(/,/g, "\\,"),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    CIQ.toast("Added to your calendar — " + ev.title);
  };

  /* ============================================================
     PAGE MODULES (enabled by body[data-page])
     ============================================================ */
  const page = document.body.dataset.page;

  /* ---------- Events: filtering ---------- */
  if (page === "events") {
    const btns = document.querySelectorAll(".filter-btn[data-filter]");
    const rows = document.querySelectorAll(".event-row[data-tags]");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        let shown = 0;
        rows.forEach((row) => {
          const match = f === "all" || (row.dataset.tags || "").split(" ").includes(f);
          row.hidden = !match;
          if (match) shown++;
        });
        const empty = document.getElementById("eventsEmpty");
        if (empty) empty.hidden = shown !== 0;
      });
    });
  }

  /* ---------- Academics: timetable tabs ---------- */
  if (page === "academics") {
    const TT = {
      mon: [
        { t: "09:00", d: "10:30", code: "MAT 201", name: "Linear Algebra", room: "STEM 204", who: "Prof. Achieng", cls: "" },
        { t: "10:45", d: "12:15", code: "ICS 101", name: "Intro to Computing", room: "Lab 3", who: "Dr. Mwangi", cls: "tt-card--clay" },
        { t: "13:00", d: "14:30", code: "BUS 110", name: "Principles of Management", room: "Hall B", who: "Ms. Njoroge", cls: "tt-card--stone" },
        { t: "15:00", d: "16:00", code: "SEM", name: "Mentorship Seminar", room: "Student Centre", who: "Dean's office", cls: "tt-card--dark" },
      ],
      tue: [
        { t: "09:00", d: "10:30", code: "ICS 210", name: "Data Structures", room: "STEM 101", who: "Dr. Mwangi", cls: "tt-card--clay" },
        { t: "10:45", d: "12:15", code: "HUM 105", name: "Oral & Written English", room: "Arts 2", who: "Mr. Otieno", cls: "" },
        { t: "13:00", d: "15:30", code: "ICS 211", name: "Data Structures — Lab", room: "Lab 1", who: "TA Korir", cls: "tt-card--clay" },
      ],
      wed: [
        { t: "10:00", d: "11:30", code: "BUS 120", name: "Intro to Finance", room: "Hall A", who: "Dr. Kamau", cls: "tt-card--stone" },
        { t: "11:45", d: "13:15", code: "PHY 102", name: "Mechanics", room: "STEM 110", who: "Prof. Wairimu", cls: "" },
        { t: "14:00", d: "15:30", code: "ICS 101", name: "Intro to Computing — Lab", room: "Lab 3", who: "Dr. Mwangi", cls: "tt-card--clay" },
      ],
      thu: [
        { t: "09:00", d: "10:30", code: "MAT 202", name: "Discrete Mathematics", room: "STEM 204", who: "Prof. Achieng", cls: "" },
        { t: "10:45", d: "12:15", code: "ENG 101", name: "Academic Writing", room: "Arts 1", who: "Ms. Chebet", cls: "tt-card--stone" },
        { t: "13:30", d: "15:00", code: "ICS 210", name: "Data Structures — Tutorial", room: "STEM 105", who: "TA Korir", cls: "tt-card--clay" },
      ],
      fri: [
        { t: "09:00", d: "10:30", code: "HUM 210", name: "Introduction to Ethics", room: "Arts 4", who: "Prof. Adan", cls: "" },
        { t: "11:00", d: "12:30", code: "ICS 211", name: "Systems Programming", room: "STEM 101", who: "Dr. Mwangi", cls: "tt-card--clay" },
        { t: "13:00", d: "14:00", code: "WIKI", name: "Study Wiki — open slots", room: "Library L2", who: "Self-paced", cls: "tt-card--dark" },
      ],
    };
    const grid = document.getElementById("ttGrid");
    if (grid) {
      const render = (day) => {
        grid.innerHTML = (TT[day] || [])
          .map(
            (c) => `
        <div class="tt-row reveal in">
          <div class="tt-time"><b>${c.t}</b>– ${c.d}</div>
          <div class="tt-card ${c.cls}">
            <div>
              <div class="tt-code">${c.code}</div>
              <h4>${c.name}</h4>
            </div>
            <div class="tt-meta"><span>${c.room}</span><span>${c.who}</span></div>
          </div>
        </div>`
          )
          .join("");
      };
      document.querySelectorAll(".tab-btn[data-day]").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".tab-btn[data-day]").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          render(btn.dataset.day);
        });
      });
      render("mon");
    }
  }

  /* ---------- Campus: map hotspots + dining filter ---------- */
  if (page === "campus") {
    const BLDGS = {
      1: { name: "Main Library", desc: "Two floors of quiet study, the roof garden, 400 seats and the best view on campus. The 24/7 exam room is on level 1.", hours: "08:00 – 22:00 · 24/7 in exams", floor: "2 floors + roof", wifi: "KAMULU-LIB" },
      2: { name: "Registrar & Admin", desc: "Enrolments, transcripts, fees and the scholarship desk. Grab a queue number on the IQ assistant to skip the line.", hours: "08:00 – 16:30 · Mon–Fri", floor: "Ground floor", wifi: "KAMULU-ADMIN" },
      3: { name: "STEM Block", desc: "Physics and maths lecture halls, three computer labs and the makerspace. Printing labs 1 & 2 sit just off the main lift.", hours: "07:00 – 23:00", floor: "3 floors", wifi: "KAMULU-STEM" },
      4: { name: "Humanities & Arts", desc: "Lecture rooms, the media suite and the Arts Auditorium (180 seats). Debate league rehearsals run here on weekday evenings.", hours: "07:30 – 22:00", floor: "2 floors", wifi: "KAMULU-ARTS" },
      5: { name: "Sports Complex", desc: "Gym, 25m pool, futsal court and the main pitch. Green Bowl café is on the east side — lunch crowds peak 13:00–14:00.", hours: "06:30 – 21:00", floor: "1 floor", wifi: "KAMULU-SPORT" },
      6: { name: "Student Centre", desc: "The social hub: club rooms, the notice board, lost & found, dining credits desk and The Roast café.", hours: "07:00 – 23:00", floor: "2 floors", wifi: "KAMULU-SC" },
      7: { name: "Health Centre", desc: "Walk-in clinic, counselling (book a slot via the assistant) and the pharmacy. Urgent line on 24/7.", hours: "08:00 – 16:00 · urgent 24/7", floor: "Ground floor", wifi: "KAMULU-HEALTH" },
      8: { name: "Residence Hall", desc: "North and South halls, laundry, and the shuttle stop at the main gate. Freshers' orientation packs are in the lobby.", hours: "Access 24/7", floor: "4 floors", wifi: "KAMULU-HALL" },
    };
    const panel = document.getElementById("mapPanel");
    if (panel) {
      const setPanel = (id) => {
        const b = BLDGS[id];
        if (!b) return;
        panel.innerHTML = `
          <div class="mp-num">BUILDING 0${id}</div>
          <h3>${b.name}</h3>
          <p>${b.desc}</p>
          <div class="mp-rows">
            <div class="mp-row"><span>Open</span><b>${b.hours}</b></div>
            <div class="mp-row"><span>Levels</span><b>${b.floor}</b></div>
            <div class="mp-row"><span>Wi-Fi</span><b>${b.wifi}</b></div>
          </div>
          <button class="btn btn-clay btn-sm" id="mpDir">Get walking directions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>`;
        panel.querySelector("#mpDir").addEventListener("click", () =>
          CIQ.toast("Directions sent to your phone — see you at " + b.name)
        );
        document.querySelectorAll(".hotspot").forEach((h) => h.classList.toggle("active", h.dataset.id === String(id)));
      };
      document.querySelectorAll(".hotspot").forEach((h) => {
        h.addEventListener("click", () => setPanel(h.dataset.id));
        h.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPanel(h.dataset.id); }
        });
        h.setAttribute("tabindex", "0");
        h.setAttribute("role", "button");
      });
      setPanel(1);
    }

    // Dining filter
    const dBtns = document.querySelectorAll(".filter-btn[data-dish]");
    const dishes = document.querySelectorAll(".dish-card[data-dish]");
    dBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        dBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.dish;
        dishes.forEach((d) => {
          d.hidden = !(f === "all" || d.dataset.dish.split(" ").includes(f));
        });
      });
    });
  }

  /* ---------- Community: club filter + join ---------- */
  if (page === "community") {
    const cBtns = document.querySelectorAll(".filter-btn[data-club]");
    const clubs = document.querySelectorAll(".club-card[data-cat]");
    cBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        cBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.club;
        clubs.forEach((c) => {
          c.hidden = !(f === "all" || c.dataset.cat.split(" ").includes(f));
        });
      });
    });

    document.querySelectorAll(".join-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const joined = btn.classList.toggle("joined");
        const name = btn.closest(".club-card").querySelector("h3").textContent;
        const count = btn.closest(".club-members");
        if (count) {
          const n = parseInt(count.dataset.n, 10);
          count.textContent = (joined ? n + 1 : n) + " members";
        }
        CIQ.toast(joined ? "You're in — see you at the next " + name + " meet." : "Left " + name + " (for now).",
          joined
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>');
      });
    });
  }

  /* ============================================================
     COMMAND PALETTE (⌘K / Ctrl+K)
     ============================================================ */
  const palette = document.getElementById("palette");
  if (palette) {
    const items = [
      { label: "Home", desc: "Start here", href: "index.html", icon: "home" },
      { label: "IQ Assistant", desc: "Ask anything", href: "assistant.html", icon: "spark" },
      { label: "Events & Deadlines", desc: "What's on", href: "events.html", icon: "cal" },
      { label: "Academics", desc: "Timetable & grades", href: "academics.html", icon: "book" },
      { label: "Campus Map", desc: "Find a building", href: "campus.html", icon: "pin" },
      { label: "Dining", desc: "Eat well", href: "campus.html#dining", icon: "bowl" },
      { label: "Shuttles", desc: "Getting around", href: "campus.html#shuttles", icon: "bus" },
      { label: "Community & Clubs", desc: "Join a club", href: "community.html", icon: "users" },
      { label: "About Campus IQ", desc: "Our story", href: "about.html", icon: "leaf" },
      { label: "Contact", desc: "Say hello", href: "contact.html", icon: "mail" },
    ];
    const ICONS = {
      home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
      spark: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
      cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
      pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
      bowl: '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M12 11V7M9 7c0-2 1-3 1-3M15 7c0-2-1-3-1-3"/>',
      bus: '<path d="M8 6v6M16 6v6M2 12h20M7 18h.01M17 18h.01"/><path d="M4 18V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 9-10 6-2 8 1 8 1s1 9-3 13a7.4 7.4 0 0 1-7 3Z"/><path d="M4 21c3-6 7-9 11-11"/>',
      mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    };
    const input = palette.querySelector("input");
    const list = palette.querySelector(".palette-list");
    let sel = 0;

    const renderList = (q) => {
      const query = q.trim().toLowerCase();
      const visible = items.filter((it) => it.label.toLowerCase().includes(query) || it.desc.toLowerCase().includes(query));
      list.innerHTML = visible.length
        ? visible
            .map(
              (it, i) => `
            <button class="palette-item ${i === sel ? "sel" : ""}" data-href="${it.href}">
              <span class="pi-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[it.icon]}</svg></span>
              <b>${it.label}</b><span class="pi-desc">${it.desc}</span>
            </button>`
            )
            .join("")
        : '<div style="padding:1.2rem;text-align:center;color:var(--stone);font-size:.9rem;">Nothing found for “' + q.replace(/</g, "&lt;") + '”</div>';
      sel = Math.min(sel, Math.max(visible.length - 1, 0));
    };

    const go = (href) => { window.location.href = href; };
    const open = () => {
      palette.classList.add("open");
      input.value = "";
      sel = 0;
      renderList("");
      setTimeout(() => input.focus(), 30);
    };
    const close = () => palette.classList.remove("open");

    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        palette.classList.contains("open") ? close() : open();
      }
      if (e.key === "Escape" && palette.classList.contains("open")) close();
      if (!palette.classList.contains("open")) return;
      const btns = [...list.querySelectorAll(".palette-item")];
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, btns.length - 1); renderList(input.value); btns[sel] && btns[sel].scrollIntoView({ block: "nearest" }); }
      if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); renderList(input.value); btns[sel] && btns[sel].scrollIntoView({ block: "nearest" }); }
      if (e.key === "Enter" && btns[sel]) go(btns[sel].dataset.href);
    });
    input.addEventListener("input", () => { sel = 0; renderList(input.value); });
    palette.addEventListener("click", (e) => {
      const item = e.target.closest(".palette-item");
      if (item) go(item.dataset.href);
      else if (e.target === palette) close();
    });
    document.querySelectorAll("[data-open-palette]").forEach((b) => b.addEventListener("click", open));
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
