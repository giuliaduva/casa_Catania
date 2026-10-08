function mostraTurno(data, dataCompleta) {

    document.getElementById("finestraTurno").classList.remove("finestra-nascosta");

    document.getElementById("dataTurno").textContent = data;

    document.getElementById("dataTurno").dataset.dataCompleta = dataCompleta;
}

function chiudiFinestra() {
    document.getElementById("finestraTurno").classList.add("finestra-nascosta");
}

async function salvaTurno() {

    const persona = document.getElementById("persona").value;

const pulizieSelezionate = Array.from(
    document.querySelectorAll('input[name="pulizia"]:checked')
).map(function(checkbox) {
    return checkbox.value;
});

const pulizia = pulizieSelezionate.join(", ");
if (pulizieSelezionate.length === 0) {
    alert("Seleziona almeno una pulizia.");
    return;
}

const data = document.getElementById("dataTurno").textContent;
const dataCompleta = document.getElementById("dataTurno").dataset.dataCompleta;

    const { data: turnoSalvato, error } = await supabaseClient
        .from("turni")
        .insert({
            data: dataCompleta,
            persona: persona,
            pulizia: pulizia
        })
        .select()
        .single();

    if (error) {
        console.error("Errore nel salvataggio del turno:", error);
        alert("Non è stato possibile salvare il turno online.");
        return;
    }

    console.log("Turno salvato su Supabase!", turnoSalvato);

    const giorni = document.querySelectorAll(".day");

    giorni.forEach(function(giorno) {

        const numero = giorno.querySelector("strong");

        if (numero && data.startsWith(numero.textContent + " ")) {

            const turno = document.createElement("div");
            turno.classList.add("turno");
        
            turno.innerHTML = `
                <strong>${persona}</strong>
                <div>
                    ${pulizieSelezionate.map(function(pulizia) {
                        return "☑️ " + pulizia;
                    }).join("<br>")}
                </div>
            `;
        
            giorno.appendChild(turno);
        }
    });

    chiudiFinestra();
}


async function aggiungiSpesa() {

    const descrizione = document.getElementById("descrizione").value;
    const importo = document.getElementById("importo").value;
    const persona = document.getElementById("chiHaPagato").value;

    if (descrizione === "" || importo === "") {
        alert("Inserisci cosa avete comprato e quanto avete speso.");
        return;
    }

    const elenco = document.getElementById("elencoSpese");

    const nessunaSpesa = document.querySelector(".nessuna-spesa");

    if (nessunaSpesa) {
        nessunaSpesa.remove();
    }

    const nuovaSpesa = document.createElement("div");

    nuovaSpesa.classList.add("spesa");

    nuovaSpesa.innerHTML = `
        <div>
            <strong>${descrizione}</strong>
            <p>Pagato da ${persona}</p>
        </div>

        <strong>€ ${parseFloat(importo).toFixed(2)}</strong>
    `;

    elenco.prepend(nuovaSpesa);

    aggiornaTotale();
    aggiornaMieSpese();
    aggiornaSaldi();
    aggiornaDebiti();

    document.getElementById("descrizione").value = "";
    document.getElementById("importo").value = "";

    await salvaSpesaSuSupabase(descrizione, importo, persona);
}


function aggiornaTotale() {

    const spese = document.querySelectorAll(".spesa");
    let totale = 0;

    spese.forEach(function(spesa) {

        const testo = spesa.querySelector("strong:last-child").textContent;

        const numero = parseFloat(
            testo.replace("€", "").replace(",", ".").trim()
        );

        totale += numero;
    });

    document.getElementById("totaleSpeso").textContent =
        "€ " + totale.toFixed(2).replace(".", ",");

        const quota = totale / 3;

        document.getElementById("quotaPersona").textContent =
            "€ " + quota.toFixed(2).replace(".", ",");    
    }


function aggiornaMieSpese() {

    const spese = document.querySelectorAll(".spesa");
    let totaleMieSpese = 0;

    spese.forEach(function(spesa) {

        const persona = spesa.querySelector("p").textContent;
        const importo = spesa.querySelector("strong:last-child").textContent;

        if (persona === "Pagato da Giulia") {

            const numero = parseFloat(
                importo.replace("€", "").replace(",", ".").trim()
            );

            totaleMieSpese += numero;
        }
    });

    document.getElementById("mieSpese").textContent =
        "€ " + totaleMieSpese.toFixed(2).replace(".", ",");
}
function aggiornaSaldi() {

    const spese = document.querySelectorAll(".spesa");

    let pagatoGiulia = 0;
    let pagatoEster = 0;
    let pagatoElisabetta = 0;

    spese.forEach(function(spesa) {

        const persona = spesa.querySelector("p").textContent;
        const importo = spesa.querySelector("strong:last-child").textContent;

        const numero = parseFloat(
            importo.replace("€", "").replace(",", ".").trim()
        );

        if (persona === "Pagato da Giulia") {
            pagatoGiulia += numero;
        }

        if (persona === "Pagato da Ester") {
            pagatoEster += numero;
        }

        if (persona === "Pagato da Elisabetta") {
            pagatoElisabetta += numero;
        }
    });

    const totale =
        pagatoGiulia + pagatoEster + pagatoElisabetta;

    const quota = totale / 3;

    const saldoGiulia = pagatoGiulia - quota;
    const saldoEster = pagatoEster - quota;
    const saldoElisabetta = pagatoElisabetta - quota;

    document.getElementById("saldoGiulia").textContent =
        "€ " + saldoGiulia.toFixed(2).replace(".", ",");

    document.getElementById("saldoEster").textContent =
        "€ " + saldoEster.toFixed(2).replace(".", ",");

    document.getElementById("saldoElisabetta").textContent =
        "€ " + saldoElisabetta.toFixed(2).replace(".", ",");
}
function aggiornaDebiti() {

    const saldoGiulia = parseFloat(
        document.getElementById("saldoGiulia").textContent
            .replace("€", "")
            .replace(",", ".")
            .trim()
    );

    const saldoEster = parseFloat(
        document.getElementById("saldoEster").textContent
            .replace("€", "")
            .replace(",", ".")
            .trim()
    );

    const saldoElisabetta = parseFloat(
        document.getElementById("saldoElisabetta").textContent
            .replace("€", "")
            .replace(",", ".")
            .trim()
    );

    const riepilogo = document.getElementById("riepilogoDebiti");

    riepilogo.innerHTML = "";

    if (saldoGiulia > 0 && saldoEster < 0) {

        const importo = Math.min(saldoGiulia, Math.abs(saldoEster));

        riepilogo.innerHTML += `
            <p>💸 Ester deve €${importo.toFixed(2).replace(".", ",")} a Giulia.</p>
        `;
    }

    if (saldoGiulia > 0 && saldoElisabetta < 0) {

        const importo = Math.min(saldoGiulia, Math.abs(saldoElisabetta));

        riepilogo.innerHTML += `
            <p>💸 Elisabetta deve €${importo.toFixed(2).replace(".", ",")} a Giulia.</p>
        `;
    }

    if (saldoEster > 0 && saldoGiulia < 0) {

        const importo = Math.min(saldoEster, Math.abs(saldoGiulia));

        riepilogo.innerHTML += `
            <p>💸 Giulia deve €${importo.toFixed(2).replace(".", ",")} a Ester.</p>
        `;
    }

    if (saldoEster > 0 && saldoElisabetta < 0) {

        const importo = Math.min(saldoEster, Math.abs(saldoElisabetta));

        riepilogo.innerHTML += `
            <p>💸 Elisabetta deve €${importo.toFixed(2).replace(".", ",")} a Ester.</p>
        `;
    }

    if (saldoElisabetta > 0 && saldoGiulia < 0) {

        const importo = Math.min(saldoElisabetta, Math.abs(saldoGiulia));

        riepilogo.innerHTML += `
            <p>💸 Giulia deve €${importo.toFixed(2).replace(".", ",")} a Elisabetta.</p>
        `;
    }

    if (saldoElisabetta > 0 && saldoEster < 0) {

        const importo = Math.min(saldoElisabetta, Math.abs(saldoEster));

        riepilogo.innerHTML += `
            <p>💸 Ester deve €${importo.toFixed(2).replace(".", ",")} a Elisabetta.</p>
        `;
    }
}
async function aggiungiProdotto() {

    const prodotto = document.getElementById("prodotto").value;

    if (prodotto === "") {
        alert("Scrivi cosa bisogna comprare.");
        return;
    }

    const prodottoSalvato = await salvaProdottoSuSupabase(prodotto);

    if (!prodottoSalvato) {
        return;
    }

    mostraProdotto(prodottoSalvato);

    document.getElementById("prodotto").value = "";
}

async function segnaComprato(checkbox) {

    const prodotto = checkbox.closest(".spesa");
    const id = prodotto.dataset.id;

    const comprato = checkbox.checked;

    const testo = prodotto.querySelector("strong");

    if (comprato) {
        testo.style.textDecoration = "line-through";
        testo.style.opacity = "0.5";
    } else {
        testo.style.textDecoration = "none";
        testo.style.opacity = "1";
    }

    const { error } = await supabaseClient
        .from("lista")
        .update({
            comprato: comprato
        })
        .eq("id", id);

    if (error) {
        console.error("Errore nell'aggiornamento:", error);
        alert("Non è stato possibile aggiornare il prodotto online.");
    }
}
const calendario = document.getElementById("calendario");

if (calendario) {

    const titoloMese = document.querySelector(".calendar-header h2");
    const pulsanteIndietro = document.querySelector(".calendar-header button:first-child");
    const pulsanteAvanti = document.querySelector(".calendar-header button:last-child");

    let anno = 2026;
    let mese = 9;

    const nomiMesi = [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre"
    ];

    const giorniSettimana = [
        "Lun",
        "Mar",
        "Mer",
        "Gio",
        "Ven",
        "Sab",
        "Dom"
    ];

    function creaCalendario() {

        calendario.innerHTML = "";

        titoloMese.textContent = nomiMesi[mese] + " " + anno;

        giorniSettimana.forEach(function(giorno) {

            const intestazione = document.createElement("div");

            intestazione.classList.add("day-name");

            intestazione.textContent = giorno;

            calendario.appendChild(intestazione);

        });

        const primoGiorno = new Date(anno, mese, 1);

        let giornoSettimana = primoGiorno.getDay();

        giornoSettimana = giornoSettimana === 0 ? 7 : giornoSettimana;

        for (let i = 1; i < giornoSettimana; i++) {

            const giornoVuoto = document.createElement("div");

            giornoVuoto.classList.add("day", "empty");

            calendario.appendChild(giornoVuoto);

        }

        const numeroGiorni = new Date(anno, mese + 1, 0).getDate();

        for (let giorno = 1; giorno <= numeroGiorni; giorno++) {

            const elementoGiorno = document.createElement("div");

            elementoGiorno.classList.add("day");

            elementoGiorno.innerHTML = `
                <strong>${giorno}</strong>
            `;

            elementoGiorno.onclick = function() {
                const dataCompleta = new Date(anno, mese, giorno)
                    .toISOString()
                    .split("T")[0];
            
                mostraTurno(
                    giorno + " " + nomiMesi[mese].toLowerCase(),
                    dataCompleta
                );
            };
            calendario.appendChild(elementoGiorno);

        }

    }

    pulsanteAvanti.onclick = function() {

        mese++;
    
        if (mese > 11) {
            mese = 0;
            anno++;
        }
    
        creaCalendario();
        caricaTurniDaSupabase();
    
    };

    pulsanteIndietro.onclick = function() {

        mese--;
    
        if (mese < 0) {
            mese = 11;
            anno--;
        }
    
        creaCalendario();
        caricaTurniDaSupabase();
    
    };
    creaCalendario();
    async function caricaTurniDaSupabase() {

        const { data, error } = await supabaseClient
            .from("turni")
            .select("*");
    
        if (error) {
            console.error("Errore nel caricamento dei turni:", error);
            return;
        }
    
        data.forEach(function(turno) {
    
            const giorni = document.querySelectorAll(".day");
    
            giorni.forEach(function(giorno) {
    
                const numero = giorno.querySelector("strong");
    
                if (!numero) {
                    return;
                }
    
                const dataGiorno = new Date(anno, mese, parseInt(numero.textContent))
                    .toISOString()
                    .split("T")[0];
    
                if (dataGiorno === turno.data) {
    
                    const elementoTurno = document.createElement("div");
elementoTurno.classList.add("turno");
giorno.appendChild(elementoTurno);
    
                    const pulizie = turno.pulizia.split(", ");

elementoTurno.innerHTML = `
    <strong>${turno.persona}</strong>
    <div>
        ${pulizie.map(function(pulizia) {
            return "☑️ " + pulizia;
        }).join("<br>")}
    </div>
`;
                }
            });
        });
    }
    
    caricaTurniDaSupabase();

}
async function salvaSpesaSuSupabase(descrizione, importo, persona) {

    const { error } = await supabaseClient
        .from("spese")
        .insert({
            descrizione: descrizione,
            importo: parseFloat(importo),
            persona: persona
        });

    if (error) {
        console.error("Errore nel salvataggio:", error);
        alert("Non è stato possibile salvare la spesa online.");
        return;
    }

    console.log("Spesa salvata su Supabase!");
}
async function caricaSpeseDaSupabase() {

    const { data, error } = await supabaseClient
        .from("spese")
        .select("*")
        .order("data", { ascending: false });

    if (error) {
        console.error("Errore nel caricamento delle spese:", error);
        return;
    }

    data.forEach(function(spesa) {
        mostraSpesa(spesa);
    });

    aggiornaTotale();
    aggiornaMieSpese();
    aggiornaSaldi();
    aggiornaDebiti();
}
if (document.getElementById("elencoSpese")) {
    caricaSpeseDaSupabase();
}
function mostraSpesa(spesa) {

    const elenco = document.getElementById("elencoSpese");

    const nessunaSpesa = document.querySelector(".nessuna-spesa");

    if (nessunaSpesa) {
        nessunaSpesa.remove();
    }

    const nuovaSpesa = document.createElement("div");

    nuovaSpesa.classList.add("spesa");

    nuovaSpesa.innerHTML = `
        <div>
            <strong>${spesa.descrizione}</strong>
            <p>Pagato da ${spesa.persona}</p>
        </div>

        <strong>€ ${parseFloat(spesa.importo).toFixed(2)}</strong>
    `;

    elenco.appendChild(nuovaSpesa);
}
async function salvaProdottoSuSupabase(prodotto) {

    const { data, error } = await supabaseClient
        .from("lista")
        .insert({
            prodotto: prodotto,
            comprato: false
        })
        .select()
        .single();

    if (error) {
        console.error("Errore nel salvataggio del prodotto:", error);
        alert("Non è stato possibile salvare il prodotto online.");
        return null;
    }

    console.log("Prodotto salvato su Supabase!", data);

    return data;
}
async function caricaListaDaSupabase() {

    const { data, error } = await supabaseClient
        .from("lista")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Errore nel caricamento della lista:", error);
        return;
    }

    data.forEach(function(prodotto) {
        mostraProdotto(prodotto);
    });
}


function mostraProdotto(prodotto) {

    const lista = document.getElementById("listaProdotti");

    const listaVuota = document.querySelector(".nessuna-spesa");

    if (listaVuota) {
        listaVuota.remove();
    }

    const nuovoProdotto = document.createElement("div");

    nuovoProdotto.classList.add("spesa");

    nuovoProdotto.dataset.id = prodotto.id;

    nuovoProdotto.innerHTML = `
        <div>
            <label>
                <input 
                    type="checkbox"
                    ${prodotto.comprato ? "checked" : ""}
                    onchange="segnaComprato(this)"
                >
                <strong>${prodotto.prodotto}</strong>
            </label>
        </div>
    `;

    lista.appendChild(nuovoProdotto);

    if (prodotto.comprato) {
        const testo = nuovoProdotto.querySelector("strong");
        testo.style.textDecoration = "line-through";
        testo.style.opacity = "0.5";
    }
}


if (document.getElementById("listaProdotti")) {
    caricaListaDaSupabase();
}