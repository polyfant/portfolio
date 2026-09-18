/* Jonas Düring — portfolio. IntersectionObserver-driven; no scroll listeners.
   Scroll-scrubbed effects are pure CSS (animation-timeline) where supported;
   this script only adds classes for reveal fallbacks and paints the hero
   particle field (paused whenever the hero is off-screen). */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supportsScrub = window.CSS && CSS.supports("animation-timeline", "view()");

  /* --- Scroll reveals --- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

  document.querySelectorAll("[data-reveal], .hero-title, .hero-field").forEach(function (el) {
    revealIO.observe(el);
  });

  /* --- Nav background on scroll --- */
  var nav = document.getElementById("nav");
  var sentinel = document.querySelector(".nav-sentinel");
  if (nav && sentinel) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle("scrolled", !entries[0].isIntersecting);
    }, { rootMargin: "-1px 0px 0px 0px", threshold: 0 }).observe(sentinel);
  }

  /* --- Active section in nav --- */
  var links = new Map();
  document.querySelectorAll("[data-navlink]").forEach(function (a) {
    links.set(a.getAttribute("data-navlink"), a);
  });
  var sectionIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var link = links.get(e.target.id);
      if (link) {
        links.forEach(function (a) { a.classList.remove("active"); });
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-38% 0px -55% 0px", threshold: 0 });
  ["work", "notes", "stack", "contact"].forEach(function (id) {
    var s = document.getElementById(id);
    if (s) sectionIO.observe(s);
  });

  /* --- Timeline: light nodes as the line reaches them --- */
  var timeline = document.getElementById("timeline");
  if (timeline) {
    var nodes = timeline.querySelectorAll(".tl-node");

    if (reduceMotion || supportsScrub) {
      nodes.forEach(function (n) { n.classList.add("on"); });
    } else {
      var nodeIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            nodeIO.unobserve(e.target);
          }
        });
      }, { rootMargin: "0px 0px -28% 0px", threshold: 0 });
      nodes.forEach(function (n) { nodeIO.observe(n); });
    }

    if (!supportsScrub && !reduceMotion) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            timeline.classList.add("tl-in");
            obs.disconnect();
          }
        });
      }, { threshold: 0.18 }).observe(timeline);
    } else {
      timeline.classList.add("tl-in");
    }
  }

  /* --- Hero particle field: sparse ember dust, slow drift --- */
  var canvas = document.getElementById("field");
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, particles = [], rafId = null, running = false;

    var resize = function () {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var seed = function () {
      particles = [];
      var count = Math.min(130, Math.round((w * h) / 16000));
      for (var i = 0; i < count; i++) {
        var amber = Math.random() < 0.42;
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.2,
          vx: -0.06 - Math.random() * 0.12,
          vy: -0.03 - Math.random() * 0.08,
          tw: 0.4 + Math.random() * 1.6,          /* twinkle speed */
          phase: Math.random() * Math.PI * 2,
          amber: amber,
          alpha: amber ? 0.5 : 0.22
        });
      }
    };

    var draw = function (t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -4) p.x = w + 4;
        if (p.y < -4) p.y = h + 4;
        var a = p.alpha * (0.55 + 0.45 * Math.sin(p.tw + t * 0.0011 * p.tw + p.phase));
        ctx.beginPath();
        ctx.fillStyle = p.amber
          ? "rgba(232, 167, 94, " + a.toFixed(3) + ")"
          : "rgba(210, 218, 232, " + (a * 0.8).toFixed(3) + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) rafId = requestAnimationFrame(draw);
    };

    var start = function () {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    };
    var stop = function () {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    resize();
    seed();

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); seed(); }, 180);
    });

    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.02 }).observe(canvas);
  }
})();
