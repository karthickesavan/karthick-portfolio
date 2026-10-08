const loader = document.querySelector(".loader");
window.addEventListener("load", () => setTimeout(() => loader?.classList.add("done"), 550));

const cursor = document.querySelector(".cursor-light");
window.addEventListener("pointermove", e => {
  if (!cursor) return;
  cursor.animate({left:`${e.clientX}px`,top:`${e.clientY}px`},{duration:500,fill:"forwards"});
});

const progress = document.querySelector(".scroll-line span");
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.height = `${max ? (scrollY/max)*100 : 0}%`;
};
addEventListener("scroll", updateProgress, {passive:true});
updateProgress();

const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      io.unobserve(entry.target);
    }
  });
},{threshold:.12});
reveals.forEach(el => io.observe(el));

const menu = document.querySelector(".menu");
const panel = document.querySelector(".mobile-panel");
menu?.addEventListener("click", () => {
  const open = !panel.classList.contains("open");
  panel.classList.toggle("open", open);
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  panel.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
});
document.querySelectorAll(".mobile-panel a").forEach(a => a.addEventListener("click", () => {
  panel.classList.remove("open"); menu.classList.remove("open");
  menu.setAttribute("aria-expanded","false"); panel.setAttribute("aria-hidden","true");
  document.body.classList.remove("menu-open");
}));

const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
    }
  });
},{rootMargin:"-45% 0px -45% 0px",threshold:0});
sections.forEach(s => navObserver.observe(s));

document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX-r.left}px`);
    card.style.setProperty("--my", `${e.clientY-r.top}px`);
  });
});

document.querySelectorAll(".btn,.talk").forEach(el => {
  el.addEventListener("pointermove", e => {
    if (matchMedia("(pointer:fine)").matches) {
      const r = el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.08;
      const y=(e.clientY-r.top-r.height/2)*.08;
      el.style.transform=`translate(${x}px,${y}px)`;
    }
  });
  el.addEventListener("pointerleave",()=>el.style.transform="");
});
