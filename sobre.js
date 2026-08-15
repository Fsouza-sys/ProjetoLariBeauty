const botaoAgendar = document.querySelector("button");

botaoAgendar.addEventListener("click", () => {
    alert("Redirecionando para o agendamento...");
});

const linksMenu = document.querySelectorAll("nav a");
linksMenu.forEach(link => {

    link.addEventListener("mouseenter", () => {
        link.style.color = "#c7a36b";
        link.style.transition = "0.3s";
    });

    link.addEventListener("mouseleave", () => {
        link.style.color = "#4b3527";
    });

});

window.addEventListener("sobre", () => {
    const sobre = document.querySelector(".sobre");
    sobre.style.opacity = "0";
    sobre.style.transform = "translateY(30px)";
    setTimeout(() => {
        sobre.style.transition = "1s";
        sobre.style.opacity = "1";
        sobre.style.transform = "translateY(0)";
    }, 200);

});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const destino = document.querySelector(this.getAttribute("href"));
        if (destino) {
            destino.scrollIntoView({
                behavior: "smooth"
            });
        }

    });

});