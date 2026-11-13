/* Fil — site script: language switch, menu, shows, videos, photos, booking form. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var VIDEOS = window.FILROCK_VIDEOS || [];
  var PHOTOS = window.FILROCK_PHOTOS || {};
  var SHOWS = window.FILROCK_SHOWS || [];

  /* ---------- language ---------- */
  var T = {
    en: {
      watch: "Watch", min: "min", all: "All", english: "In English", french: "En français", italian: "Italiano",
      shown: function (n) { return n + (n === 1 ? " video" : " videos"); },
      noShows: "No public shows on the calendar right now. Fil is booking private events — send a request below.",
      map: "Map", event: "Facebook event page", close: "Close", prev: "Previous photo", next: "Next photo",
      with: "with", search: "Search a song or an artist",
      sending: "Sending…", sent: "Thank you. Your request was sent — Fil will reply by email.",
      failed: "The request did not go through. Please email fil@filrock.com directly.",
      mailOpened: "Your email app should open with your request filled in. Press send there to finish.",
      required: "Please fill in your name, your email and the event date.",
      subject: "Booking request", langLabel: "Lire en français"
    },
    fr: {
      watch: "Voir", min: "min", all: "Toutes", english: "In English", french: "En français", italian: "Italiano",
      shown: function (n) { return n + (n === 1 ? " vidéo" : " vidéos"); },
      noShows: "Pas de concert public au calendrier pour le moment. Fil accepte les soirées privées — envoyez une demande ci-dessous.",
      map: "Plan", event: "Page de l'événement sur Facebook", close: "Fermer", prev: "Photo précédente", next: "Photo suivante",
      with: "avec", search: "Chercher une chanson ou un artiste",
      sending: "Envoi…", sent: "Merci. Votre demande est envoyée — Fil vous répondra par e-mail.",
      failed: "La demande n'est pas passée. Écrivez directement à fil@filrock.com.",
      mailOpened: "Votre messagerie devrait s'ouvrir avec la demande déjà remplie. Appuyez sur envoyer pour terminer.",
      required: "Merci d'indiquer votre nom, votre e-mail et la date de l'événement.",
      subject: "Demande de réservation", langLabel: "Read in English"
    }
  };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var lang = store("filrock-lang") || ((navigator.language || "en").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");
  function t(k) { return T[lang][k]; }
  var listeners = [];
  function setLang(l) {
    lang = l === "fr" ? "fr" : "en";
    doc.setAttribute("data-lang", lang);
    doc.setAttribute("lang", lang);
    store("filrock-lang", lang);
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var v = el.getAttribute("data-" + lang); if (v === null) return;
      if (el.hasAttribute("placeholder")) el.setAttribute("placeholder", v);
      else if (el.tagName === "META") el.setAttribute("content", v);
      else if (el.tagName === "TITLE") el.textContent = v;
      else el.setAttribute("aria-label", v);
    });
    document.querySelectorAll(".lang").forEach(function (b) {
      b.innerHTML = lang === "en" ? "<b>EN</b> / FR" : "EN / <b>FR</b>";
      b.setAttribute("aria-label", t("langLabel"));
    });
    listeners.forEach(function (fn) { fn(); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".lang"); if (b) setLang(lang === "en" ? "fr" : "en");
  });

  /* ---------- menu ---------- */
  var menuBtn = document.querySelector(".menu-btn"), nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } });
  }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }
  function byId(id) { for (var i = 0; i < VIDEOS.length; i++) if (VIDEOS[i].id === id) return VIDEOS[i]; return null; }
  var langTag = { en: "EN", fr: "FR", it: "IT" };
  function place(v) { return [v.venue, v.city].filter(Boolean).join(", "); }

  /* ---------- video player ---------- */
  var player = document.getElementById("player");
  function openVideo(id) {
    var v = byId(id); if (!v || !player) return;
    var media = player.querySelector(".dlg-media"), cap = player.querySelector(".dlg-cap");
    media.className = "dlg-media " + v.shape;
    // Our own fast copy plays first; YouTube only when we have no copy on the site.
    if (v.youtube && !/^assets\//.test(v.src)) {
      media.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.youtube) + '?autoplay=1&rel=0" title="' + esc(v.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    } else {
      media.innerHTML = '<video controls autoplay playsinline preload="metadata" poster="' + esc(v.poster) + '" src="' + esc(v.src) + '"></video>';
    }
    cap.innerHTML = "<b>" + esc(v.title) + "</b><span>" + esc([v.artist, v.guest ? t("with") + " " + v.guest : "", place(v)].filter(Boolean).join(" — ")) + "</span>";
    player.querySelector(".dlg-close").setAttribute("aria-label", t("close"));
    if (player.showModal) player.showModal(); else player.setAttribute("open", "");
  }
  if (player) {
    player.addEventListener("close", function () { player.querySelector(".dlg-media").innerHTML = ""; });
    player.addEventListener("click", function (e) { if (e.target === player) player.close(); });
    player.querySelector(".dlg-close").addEventListener("click", function () { player.close(); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-video]"); if (b) { e.preventDefault(); openVideo(b.getAttribute("data-video")); }
  });

  /* ---------- video cards ---------- */
  var playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l15 8-15 8z"/></svg>';
  function card(v) {
    return '<button class="vcard" type="button" data-video="' + esc(v.id) + '">' +
      '<span class="vthumb ' + v.shape + '">' + (v.shape === "v" ? '<img class="vbg" loading="lazy" src="' + esc(v.poster) + '" alt="">' : "") +
      '<img class="vfg" loading="lazy" src="' + esc(v.poster) + '" alt="" width="640" height="400">' +
      '<span class="vlang">' + langTag[v.lang] + '</span><span class="vplay">' + playIcon + '</span>' +
      '<span class="vdur">' + mmss(v.dur) + '</span></span>' +
      '<span class="vtitle">' + esc(v.title) + '</span>' +
      '<span class="vmeta">' + esc(v.artist) + (v.guest ? " — " + t("with") + " " + esc(v.guest) : "") + "<br>" + esc(place(v)) + "</span>" +
      '<span class="sr-only">' + t("watch") + "</span></button>";
  }
  var grid = document.querySelector("[data-videos]");
  if (grid) {
    var limit = grid.getAttribute("data-videos"); // "featured" or "all"
    var featured = (grid.getAttribute("data-ids") || "").split(",").filter(Boolean);
    var filter = "all", query = "";
    var count = document.querySelector("[data-video-count]");
    var search = document.querySelector("[data-video-search]");
    function render() {
      var list = limit === "featured" ? featured.map(byId).filter(Boolean) : VIDEOS.filter(function (v) { return !v.hidden; });
      if (filter !== "all") list = list.filter(function (v) { return v.lang === filter; });
      if (query) {
        var q = query.toLowerCase();
        list = list.filter(function (v) { return (v.title + " " + v.artist + " " + v.venue + " " + v.city + " " + v.guest).toLowerCase().indexOf(q) > -1; });
      }
      grid.innerHTML = list.map(card).join("");
      if (count) count.textContent = t("shown")(list.length);
    }
    document.querySelectorAll("[data-filter]").forEach(function (c) {
      c.addEventListener("click", function () {
        filter = c.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === c ? "true" : "false"); });
        render();
      });
    });
    if (search) search.addEventListener("input", function () { query = search.value.trim(); render(); });
    listeners.push(render);
  }

  /* ---------- shows ---------- */
  var showsEl = document.querySelector("[data-shows]");
  function renderShows() {
    if (!showsEl) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var up = SHOWS.filter(function (s) { return new Date(s.date + "T23:59:59") >= today; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!up.length) { showsEl.innerHTML = '<p class="shows-empty">' + esc(t("noShows")) + "</p>"; return; }
    var loc = lang === "fr" ? "fr-FR" : "en-US";
    showsEl.innerHTML = '<ul class="show-list">' + up.map(function (s) {
      var d = new Date(s.date + "T12:00:00");
      var map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.venue + ", " + s.address);
      return '<li class="show"><div class="show-date"><span class="d">' + d.getDate() + '</span><span class="m">' +
        esc(d.toLocaleDateString(loc, { month: "short", year: "numeric" })) + '</span><span class="w">' +
        esc(d.toLocaleDateString(loc, { weekday: "long" })) + "</span></div><div><h3>" + esc(s.venue) + "</h3>" +
        (s.title ? '<p class="show-title">' + esc(s.title[lang]) + "</p>" : "") +
        "<p>" + esc(s.time[lang]) + (s.room ? " — " + esc(s.room[lang]) : "") + "</p><p>" + esc(s.address) + ' (<a href="' + map + '" target="_blank" rel="noopener">' + t("map") + "</a>)</p>" +
        (s.guests ? "<p>" + esc(s.guests[lang]) + "</p>" : "") +
        (s.link ? '<p><a href="' + esc(s.link) + '" target="_blank" rel="noopener">' + t("event") + "</a></p>" : "") + "</div></li>";
    }).join("") + "</ul>";
  }
  listeners.push(renderShows);

  /* ---------- photos ---------- */
  var viewer = document.getElementById("viewer"), vList = [], vIdx = 0;
  function showPhoto() {
    var p = vList[vIdx]; if (!p || !viewer) return;
    viewer.querySelector(".dlg-media").innerHTML = '<img src="assets/img/lib/' + esc(p.f) + '" alt="' + esc(p.cap || "Fil") + '">';
    viewer.querySelector(".dlg-cap").innerHTML = (p.cap ? "<b>" + esc(p.cap) + "</b>" : "") + (p.credit ? "<span>" + esc(p.credit) + "</span>" : "");
  }
  function openPhoto(list, i) {
    vList = list; vIdx = i; showPhoto();
    viewer.querySelector(".dlg-prev").setAttribute("aria-label", t("prev"));
    viewer.querySelector(".dlg-next").setAttribute("aria-label", t("next"));
    viewer.querySelector(".dlg-close").setAttribute("aria-label", t("close"));
    if (viewer.showModal) viewer.showModal(); else viewer.setAttribute("open", "");
  }
  if (viewer) {
    viewer.querySelector(".dlg-close").addEventListener("click", function () { viewer.close(); });
    viewer.querySelector(".dlg-prev").addEventListener("click", function () { vIdx = (vIdx - 1 + vList.length) % vList.length; showPhoto(); });
    viewer.querySelector(".dlg-next").addEventListener("click", function () { vIdx = (vIdx + 1) % vList.length; showPhoto(); });
    viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") viewer.querySelector(".dlg-prev").click();
      if (e.key === "ArrowRight") viewer.querySelector(".dlg-next").click();
    });
  }
  // Home page: a picked set of photos (e.g. Friends), in the order given in data-files.
  document.querySelectorAll("[data-photo-pick]").forEach(function (box) {
    var all = PHOTOS[box.getAttribute("data-photo-pick")] || [];
    var want = (box.getAttribute("data-files") || "").split(",").filter(Boolean);
    var list = want.length ? want.map(function (f) { return all.filter(function (p) { return p.f === f; })[0]; }).filter(Boolean) : all;
    box.innerHTML = list.map(function (p, i) {
      return '<button class="pitem" type="button" data-i="' + i + '"><img loading="lazy" src="assets/img/thumb/' + esc(p.f) + '" alt="' + esc(p.cap || "Fil") + '" width="' + Math.min(640, p.w) + '" height="' + Math.round(Math.min(640, p.w) * p.h / p.w) + '">' + (p.cap ? "<span>" + esc(p.cap) + "</span>" : "") + "</button>";
    }).join("");
    box.addEventListener("click", function (e) { var b = e.target.closest(".pitem"); if (b && viewer) openPhoto(list, +b.getAttribute("data-i")); });
  });
  var pgrid = document.querySelector("[data-photos]");
  if (pgrid) {
    var group = pgrid.getAttribute("data-photos");
    function renderPhotos() {
      var list = PHOTOS[group] || [];
      pgrid.innerHTML = list.map(function (p, i) {
        return '<button class="pitem" type="button" data-i="' + i + '"><img loading="lazy" src="assets/img/thumb/' + esc(p.f) + '" alt="' + esc(p.cap || "Fil") + '" width="' + Math.min(640, p.w) + '" height="' + Math.round(Math.min(640, p.w) * p.h / p.w) + '">' + (p.cap ? "<span>" + esc(p.cap) + "</span>" : "") + "</button>";
      }).join("");
    }
    pgrid.addEventListener("click", function (e) {
      var b = e.target.closest(".pitem"); if (b) openPhoto(PHOTOS[group], +b.getAttribute("data-i"));
    });
    document.querySelectorAll("[data-group]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        group = tab.getAttribute("data-group");
        document.querySelectorAll("[data-group]").forEach(function (o) { o.setAttribute("aria-pressed", o === tab ? "true" : "false"); });
        renderPhotos();
      });
    });
    renderPhotos();
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById("booking");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(form);
      if (f.get("botcheck")) return;
      var name = (f.get("name") || "").trim(), email = (f.get("email") || "").trim(), date = (f.get("date") || "").trim();
      if (!name || !email || !date) { status.textContent = t("required"); return; }
      var lines = [
        "Name: " + name, "Email: " + email, "Phone: " + (f.get("phone") || ""),
        "Event date: " + date, "Type of event: " + (f.get("type") || ""),
        "Place / city: " + (f.get("place") || ""), "Guests: " + (f.get("guests") || ""), "", (f.get("message") || "")
      ];
      var subject = t("subject") + " — " + date + " — " + name;
      var key = window.FILROCK_FORM_KEY;
      if (key) {
        status.textContent = t("sending");
        fetch("https://api.web3forms.com/submit", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: key, subject: subject, from_name: "filrock.com website", replyto: email, message: lines.join("\n") })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.success) { status.textContent = t("sent"); form.reset(); } else { status.textContent = t("failed"); }
        }).catch(function () { status.textContent = t("failed"); });
      } else {
        window.location.href = "mailto:" + (window.FILROCK_EMAIL || "fil@filrock.com") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
        status.textContent = t("mailOpened");
      }
    });
  }

  /* ---------- footer year + start ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  setLang(lang);
})();
