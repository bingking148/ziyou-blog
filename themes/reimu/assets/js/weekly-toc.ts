function initWeeklyToc() {
  if (!window.location.pathname.includes("/weekly/")) return;

  const tocWrapper = _$(".sidebar-toc-wrapper") as HTMLElement;
  if (!tocWrapper) return;

  const nav = tocWrapper.querySelector("nav");
  if (!nav) return;

  const allLinks = nav.querySelectorAll<HTMLAnchorElement>("a");
  const topLis = nav.querySelectorAll<HTMLAnchorElement>(":scope > ul > li, :scope > ol > li");

  const sections: (HTMLElement | null)[] = [];
  allLinks.forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (id) {
      sections.push(document.getElementById(id));
    } else {
      sections.push(null);
    }
  });

  function setActiveLink(index: number) {
    const allLis = nav.querySelectorAll("li");
    allLis.forEach((li) => li.classList.remove("active", "current"));

    if (index < 0 || index >= allLinks.length) return;

    const targetLi = allLinks[index].closest("li");
    if (targetLi) targetLi.classList.add("active");

    const parentLi = targetLi?.parentElement?.closest("li");
    if (parentLi) parentLi.classList.add("active");
  }

  allLinks.forEach((link, index) => {
    link.off("click").on("click", (e: Event) => {
      e.preventDefault();
      const target = sections[index];
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveLink(index);
    });
  });

  const scrollHandler = () => {
    const scrollY = window.scrollY + 150;
    let current = -1;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i] && sections[i]!.offsetTop <= scrollY) {
        current = i;
        break;
      }
    }
    if (current >= 0) {
      setActiveLink(current);
    }
  };

  window.on("scroll", window.throttle(scrollHandler, 100));
  scrollHandler();
}

initWeeklyToc();
