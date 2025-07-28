// Taxas fixas simuladas (valores fictícios para exemplo)
const taxas = {
    USD: { BRL: 5.6, EUR: 0.86, USD: 1 },
    BRL: { USD: 1 / 5.6, EUR: 0.86 / 5.6, BRL: 1 },
    EUR: { USD: 1.16, BRL: 6.49, EUR: 1 }
};

const amountInput = document.getElementById("amount");
const convertInput = document.getElementById("convert");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");

// Função de conversão
function converter(source) {
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (source === "amount") {
        const valor = parseFloat(amountInput.value);
        if (!isNaN(valor)) {
            convertInput.value = (valor * taxas[from][to]).toFixed(2);
        } else {
            convertInput.value = "";
        }
    } else if (source === "convert") {
        const valor = parseFloat(convertInput.value);
        if (!isNaN(valor)) {
            amountInput.value = (valor * taxas[to][from]).toFixed(2);
        } else {
            amountInput.value = "";
        }
    }
}

// Atualiza a conversão automaticamente
amountInput.addEventListener("input", () => converter("amount"));
convertInput.addEventListener("input", () => converter("convert"));
fromCurrency.addEventListener("change", () => converter("amount"));
toCurrency.addEventListener("change", () => converter("amount"));
