const API_URL = "http://localhost:3001/api";

let currentDate = new Date(2026, 5, 1); 
const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Data mínima permitida: 09/06/2026
const minDate = new Date(2026, 5, 10);
// Data máxima permitida: 31/12/2026
const maxDate = new Date(2026, 11, 31);

document.addEventListener("DOMContentLoaded", () => {
    const calendarGrid = document.getElementById("calendarGrid");
    const currentMonthYear = document.getElementById("currentMonthYear");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const servicoSel = document.getElementById("servico-sel");
    const telInput = document.getElementById("tel-cli");
    const horariosGrid = document.getElementById("horarios-grid");
    const form = document.getElementById("form-agendamento-direto");
    const selectedDateDisplay = document.getElementById("selected-date-display");
    const dataHidden = document.getElementById("data-sel");

    telInput.addEventListener("input", (e) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.substring(0, 11);
        
        if (v.length > 10) {
            v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (v.length > 5) {
            v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else if (v.length > 0) {
            v = v.replace(/^(\d*)/, "($1");
        }
        e.target.value = v;
    });

    function isDateEnabled(date) {
        return date >= minDate && date <= maxDate;
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthYear.textContent = `${months[month]} ${year}`;

        // Limpa apenas os dias (mantém os nomes da semana)
        const dayNames = calendarGrid.querySelectorAll(".calendar-day-name");
        calendarGrid.innerHTML = "";
        dayNames.forEach(dn => calendarGrid.appendChild(dn));

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Espaços vazios para alinhar o primeiro dia da semana
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "calendar-day empty";
            calendarGrid.appendChild(emptyDiv);
        }

        // Cria os botões dos dias
        for (let day = 1; day <= daysInMonth; day++) {
            const dayBtn = document.createElement("div");
            dayBtn.className = "calendar-day";
            dayBtn.textContent = day;

            // Formata a data para ISO (YYYY-MM-DD)
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateObj = new Date(year, month, day);

            // Verifica se a data está habilitada
            const enabled = isDateEnabled(dateObj);

            if (!enabled) {
                dayBtn.classList.add("disabled");
                dayBtn.style.cursor = "not-allowed";
            } else {
                dayBtn.style.cursor = "pointer";
                dayBtn.onclick = () => {
                    // Remove destaque de outros dias e destaca o atual
                    document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("active"));
                    dayBtn.classList.add("active");
                    
                    // Atualiza campos ocultos e interface
                    dataHidden.value = dateStr;
                    selectedDateDisplay.textContent = `${day} de ${months[month]}`;
                    buscarHorarios(dateStr);
                };
            }

            calendarGrid.appendChild(dayBtn);
        }
    }

    prevMonthBtn.onclick = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        
        if (newDate >= new Date(2026, 5, 1)) {
            currentDate = newDate;
            renderCalendar();
        }
    };

    nextMonthBtn.onclick = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        
        if (newDate <= new Date(2026, 11, 31)) {
            currentDate = newDate;
            renderCalendar();
        }
    };

    fetch(`${API_URL}/servicos`)
        .then(res => res.json())
        .then(data => {
            servicoSel.innerHTML = '<option value="">-- Selecione o Procedimento --</option>';
            data.forEach(s => {
                const option = document.createElement("option");
                option.value = s.nome_Servico;
                option.textContent = s.nome_Servico;
                servicoSel.appendChild(option);
            });
        })
        .catch(() => {
            servicoSel.innerHTML = '<option value="">Erro ao carregar serviços</option>';
        });

    function buscarHorarios(data) {
        horariosGrid.innerHTML = "<p style='color: #999; grid-column: 1/-1;'>Buscando horários...</p>";
        
        fetch(`${API_URL}/disponibilidade/data/${data}`)
            .then(res => res.json())
            .then(horarios => {
                horariosGrid.innerHTML = "";
                if (horarios.length === 0) {
                    horariosGrid.innerHTML = "<p style='color: #d9534f; grid-column: 1/-1;'>Infelizmente não há horários livres para este dia.</p>";
                    return;
                }
                horarios.forEach(h => {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "h-btn";
                    btn.textContent = h.horario_disp.substring(0, 5);
                    btn.onclick = () => {
                        document.querySelectorAll(".h-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        document.getElementById("horario-final").value = h.horario_disp;
                        document.getElementById("id-disp-final").value = h.idDisp;
                    };
                    horariosGrid.appendChild(btn);
                });
            })
            .catch(() => {
                horariosGrid.innerHTML = "<p style='color: #d9534f; grid-column: 1/-1;'>Erro ao conectar com o servidor.</p>";
            });
    }


    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById("nome-cli").value.trim();
        const telefone = telInput.value.replace(/\D/g, "");
        const servico = servicoSel.value;
        const data = dataHidden.value;
        const horario = document.getElementById("horario-final").value;
        const idDisp = document.getElementById("id-disp-final").value;

        // Validações
        if (!nome) { alert("Por favor, preencha seu nome completo!"); return; }
        if (telefone.length < 11) { alert("Por favor, preencha um telefone válido!"); return; }
        if (!servico) { alert("Por favor, selecione um serviço!"); return; }
        if (!data) { alert("Por favor, selecione uma data no calendário!"); return; }
        if (!horario) { alert("Por favor, escolha um horário disponível!"); return; }

        try {
            // 1. Verifica ou cria o cliente automaticamente
            const resCliente = await fetch(`${API_URL}/clientes/verificar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ nomecli: nome, telcel: telefone })
            });
            const cliente = await resCliente.json();

            // 2. Cria o agendamento vinculado ao ID do cliente
            const resAgend = await fetch(`${API_URL}/agendamentos`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    idCli: cliente.idCli,
                    data_agend: data,
                    horario_agend: horario,
                    servico: servico,
                    idDisp: idDisp
                })
            });

            if (resAgend.ok) {
                alert("Agendamento realizado com sucesso! Você será redirecionado para ver seus horários.");
                window.location.href = `meus-agendamentos.html?tel=${telefone}`;
            } else {
                alert("Erro ao confirmar agendamento. Tente novamente.");
            }
        } catch (err) {
            alert("Erro de conexão com o servidor. Verifique se o backend está rodando.");
        }
    };

    renderCalendar();
});
