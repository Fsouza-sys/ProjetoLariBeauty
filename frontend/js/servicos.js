document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const serviceCards = document.querySelectorAll(".service-card");
  const categoryTitleText = document.getElementById("category-title-text");
  const menuToggle = document.getElementById("menu-toggle");
  const navbar = document.getElementById("navbar");
  const categoryTitles = {
    todos: "Procedimentos faciais",
    sobrancelhas: "Design & Simetria",
    cilios: "Extensão de Cílios",
    massagem: "Corporal & Relaxamento",
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const targetCategory = button.getAttribute("data-category");

      if (categoryTitles[targetCategory]) {
        categoryTitleText.textContent = categoryTitles[targetCategory];
      }

      serviceCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-item");

        if (targetCategory === "todos" || cardCategory === targetCategory) {
          card.style.display = "flex";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
          }, 50);
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.95)";
          card.style.display = "none";
        }
      });
    });
  });
  if (menuToggle && navbar) {
    menuToggle.addEventListener("click", () => {
      navbar.style.display = navbar.style.display === "flex" ? "none" : "flex";
    });
  }
});
