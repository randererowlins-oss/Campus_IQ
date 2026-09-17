/* ============================================================
   IQ Assistant — campus knowledge engine (demo, runs locally)
   ============================================================ */
(function () {
  "use strict";
  const body = document.getElementById("chatBody");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  if (!body || !form || !input) return;

  const K = [
    {
      keys: ["hi", "hello", "hey", "habari", "jambo", "yo"],
      reply: "Hello! I'm IQ — the campus assistant for Kamulu University. I track timetables, deadlines, events, shuttles and everything in between. What do you need?",
      chips: ["When does registration close?", "What's on this weekend?", "Where's the nearest print lab?"],
    },
    {
      keys: ["timetable", "timetables", "my week", "what am i doing"],
      reply: "Your week-14 timetable lives on the <b>Academics page</b> — Mon to Fri tabs, with room changes flagged in real time. One change this week: Wed 11:45 PHY 102 is in <b>STEM 210</b>, not STEM 110 (projector repair).",
      chips: ["When do exams start?", "Where is the Health Centre?"],
    },
    {
      keys: ["registration", "register", "enrol", "enroll", "credit", "elective"],
      reply: "Registration for Spring 2027 runs until <b>Friday 2 Oct, 17:00 EAT</b>. Path: Student Portal → Courses → Enrol. You have 6 elective credits left to select — I'd grab HUM 210 early, it fills first.",
      chips: ["What's my timetable?", "Which electives are popular?"],
    },
    {
      keys: ["library", "read", "quiet", "study room"],
      reply: "The Main Library is open <b>08:00–22:00</b> (Mon–Fri) and <b>10:00–18:00</b> weekends — and 24/7 during exam weeks. The roof garden and the level-2 silence zone are the quietest spots. Study rooms book through me.",
      chips: ["Book a study room", "When do exams start?"],
    },
    {
      keys: ["print", "printer", "printing", "scan"],
      reply: "Two print labs: <b>STEM Lab 2</b> (next to the main lift) and the <b>Student Centre kiosk</b>. KSh 5 per A4 black & white, KSh 15 colour. Scan-to-email works from Lab 2 terminals.",
      chips: ["Where is STEM Lab 2?", "Wi-Fi password please"],
    },
    {
      keys: ["eat", "food", "dining", "breakfast", "lunch", "cafe", "cafeteria", "hungry", "menu"],
      reply: "Three spots on campus: <b>The Roast</b> (main quad — everything), <b>Green Bowl</b> (all-veg, east side of Sports Complex) and <b>Night Nibbles</b> (open till 23:00, great for revision fuel). Dining credits work at all three — full menu on the Campus page.",
      chips: ["Show the menu", "How do dining credit refunds work?"],
    },
    {
      keys: ["refund", "money back", "credit refund"],
      reply: "Dining-credit refunds are processed at the <b>Student Centre desk</b> within 5 working days. You'll need your student ID — bring it, don't photograph it (the desk is strict about that one).",
      chips: ["Where is the Student Centre?", "What time is it open?"],
    },
    {
      keys: ["event", "weekend", "week", "what's on", "whats on", "happening", "concert", "fair"],
      reply: "This week at Kamulu:<br>• <b>Sat 19 Sep</b> — Freshers' Fair, Student Centre (clubs, food, bunting)<br>• <b>Sun 20 Sep</b> — Farmers' Market, Great Lawn 09:00–14:00<br>• <b>Wed 23 Sep</b> — Debate League, Arts Auditorium 18:00<br>• <b>Fri 25 Sep</b> — Hack the Campus 4.0, STEM Lab (36 hrs, 50 teams)",
      chips: ["Add Hack the Campus to my calendar", "Show all events"],
    },
    {
      keys: ["where", "directions", "map", "building", "room", "find"],
      reply: "Open the <b>Campus Map</b> and tap a numbered pin — I'll show opening hours, Wi-Fi name and walking directions for each building. The map is the fastest way around.",
      chips: ["Open the campus map", "Where's the Health Centre?"],
    },
    {
      keys: ["shuttle", "bus", "transport", "ride", "commute"],
      reply: "Campus shuttles run <b>07:00–19:00 every 20 minutes</b>, KSh 50 per ride (or free with a valid semester shuttle pass). North Loop from the Hall gate, West Loop from the Sports Complex. Peak times: 07:30 and 17:00 — come 10 min early.",
      chips: ["Shuttle pass price?", "Which stop is closest to the Library?"],
    },
    {
      keys: ["wifi", "wi-fi", "internet", "network", "password"],
      reply: "Student network is <b>KAMULU-STUDENT</b> — password is your portal PIN. Guests use <b>KAMULU-GUEST</b> (2-hour sessions, re-auth at the Student Centre kiosk). If it drops mid-lecture, the IT help desk in STEM 105 sorts most things in 10 minutes.",
      chips: ["Where is the IT help desk?", "Library Wi-Fi name?"],
    },
    {
      keys: ["sick", "health", "clinic", "doctor", "counsel", "tired", "stressed"],
      reply: "The <b>Health Centre</b> is walk-in, 08:00–16:00. Counselling slots are bookable through me — most slots open 3 days ahead, Tuesdays fill first. Urgent? The line is 24/7: <b>+254 700 000 111</b>.",
      chips: ["Book a counselling slot", "Where is the Health Centre?"],
    },
    {
      keys: ["lost", "found", "phone", "wallet"],
      reply: "Lost & found lives at the <b>Student Centre front desk</b>. Check the board first — about 60% of phones show up there within 48 hours. I can also post a notice to Community for you.",
      chips: ["Post a lost-item notice", "Where's the notice board?"],
    },
    {
      keys: ["grade", "gpa", "mark", "result", "transcript", "exam result"],
      reply: "Your <b>Spring 2026 GPA is 3.82</b> — top 8% of your cohort, up 0.21 from last semester. Full breakdown with per-course bars is on the Academics page. Transcripts request: Registrar desk or the portal.",
      chips: ["Show my grades", "Request a transcript"],
    },
    {
      keys: ["exam", "exams", "study week", "revision", "timetable for exam"],
      reply: "Study week starts <b>Monday 5 Oct</b>. The official exam timetable drops <b>24 Sep</b> — I'll flag it the moment it's live. Library goes 24/7 for the whole period, and the roof garden opens early (05:00) for the 6am crew.",
      chips: ["Add the timetable date to my calendar", "Book a 24/7 study room"],
    },
    {
      keys: ["hackathon", "hack the campus", "hack"],
      reply: "<b>Hack the Campus 4.0</b> — Fri 25 Sep, 18:00 → Mon 28 Sep, STEM Lab. 36 hours, 50 teams, KSh 200k prize pool plus internships. Themes this year: campus services, agriculture tech and accessibility. Teams form in the portal.",
      chips: ["Add it to my calendar", "What tracks are there?"],
    },
    {
      keys: ["scholarship", "bursary", "fee", "fees", "pay"],
      reply: "The <b>Merit Scholarship form</b> closes <b>9 Oct</b> — GPA 3.5+ qualifies, 10% of the pool goes to students with 3.7+. Fee installments: 3 equal payments, last one 30 Sep. The Registrar desk can set up a family payment plan.",
      chips: ["Register for the scholarship", "Fee payment options?"],
    },
    {
      keys: ["club", "join", "society", "community"],
      reply: "There are <b>38 active clubs</b> — from Code Collective to Goma & Beats. Freshers' Fair on Saturday is the easiest way to join (sign-ups in 10 minutes flat). Browse and join on the Community page.",
      chips: ["Show the club list", "When is the Freshers' Fair?"],
    },
    {
      keys: ["bike", "cycle", "parking"],
      reply: "Bike racks are at the <b>Hall gate</b> and the <b>STEM Block entrance</b>. The campus cycle-lending scheme is KSh 30/day, signed out at the Student Centre. Motorcycle parking is the east lot — ID required after 18:00.",
      chips: ["Where's the east lot?", "Student Centre hours?"],
    },
    {
      keys: ["thank", "thanks", "asante"],
      reply: "Asante! Anything else — deadlines, directions, or just a study-room for the afternoon?",
      chips: ["Book a study room", "What's on this weekend?"],
    },
  ];

  const FALLBACK = {
    reply: "I don't have that one filed yet. I'm strongest on: registration, library, printing, dining, events, shuttles, Wi-Fi, health, lost & found and grades. Try rephrasing, or pick one of these:",
    chips: ["When does registration close?", "Where's the nearest print lab?", "What's on this weekend?"],
  };

  const time = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const addMsg = (who, html) => {
    const m = document.createElement("div");
    m.className = "msg msg-" + who;
    m.innerHTML =
      '<div class="bubble">' + html + "</div>" +
      '<div class="msg-time">' + time() + "</div>";
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  };

  const addChips = (chips) => {
    const wrap = document.createElement("div");
    wrap.className = "msg msg-ai";
    const c = document.createElement("div");
    c.className = "msg-chips";
    chips.forEach((label) => {
      const b = document.createElement("button");
      b.className = "msg-chip";
      b.textContent = label;
      b.addEventListener("click", () => {
        input.value = label;
        send();
      });
      c.appendChild(b);
    });
    wrap.appendChild(c);
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  };

  let busy = false;
  function send() {
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    addMsg("user", escapeHtml(text));

    busy = true;
    const t = document.createElement("div");
    t.className = "msg msg-ai typing";
    t.innerHTML = '<div class="bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;

    const lower = text.toLowerCase();
    let hit = FALLBACK;
    for (const k of K) {
      if (k.keys.some((word) => lower.includes(word))) { hit = k; break; }
    }

    const delay = 650 + Math.min(1400, hit.reply.length * 7);
    setTimeout(() => {
      t.remove();
      addMsg("ai", hit.reply);
      addChips(hit.chips);
      busy = false;
      input.focus();
    }, delay);
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); send(); });

  // the chips that ship with the first greeting
  document.querySelectorAll("#chatBody .msg-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.textContent;
      send();
    });
  });

  // side-panel sample prompts
  document.querySelectorAll(".ask-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.textContent;
      input.focus();
      send();
    });
  });
})();
