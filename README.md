# 💰 BRL2GO - Conversor de Moedas Profissional

Um conversor de moedas moderno, rápido e profissional com taxas de câmbio em tempo real.

## ✨ Características Principais

### 🎨 Interface
- **Design Moderno**: Interface limpa e profissional com gradientes suaves
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações Suaves**: Transições e feedback visual de alta qualidade
- **Modo Escuro**: Fundo verde escuro elegante com contraste perfeito

### ⚡ Funcionalidades

1. **Conversão em Tempo Real**
   - Atualização automática enquanto você digita
   - Debounce inteligente para otimizar requisições
   - Cache de 1 minuto para melhor performance

2. **10+ Moedas Suportadas**
   - BRL (Real Brasileiro)
   - USD (Dólar Americano)
   - EUR (Euro)
   - GBP (Libra Esterlina)
   - JPY (Iene Japonês)
   - CAD (Dólar Canadense)
   - AUD (Dólar Australiano)
   - CHF (Franco Suíço)
   - CNY (Yuan Chinês)
   - ARS (Peso Argentino)

3. **Histórico de Conversões**
   - Salva automaticamente as últimas 5 conversões
   - Persistência com localStorage
   - Clique para reutilizar conversões anteriores

4. **Valores Rápidos**
   - Botões para conversão instantânea: 100, 500, 1k, 5k
   - Economiza tempo para valores comuns

5. **Indicadores Avançados**
   - Taxa de câmbio atual em destaque
   - Tendência de variação (subida/descida)
   - Timestamp da última atualização
   - Indicador de status ao vivo

6. **Recursos Premium**
   - Auto-refresh a cada 5 minutos
   - Símbolos de moeda dinâmicos
   - Bandeiras dos países
   - Notificações toast elegantes
   - Atalhos de teclado

## 🚀 Otimizações Implementadas

### Performance
- ✅ Debouncing para reduzir chamadas à API
- ✅ Sistema de cache inteligente (1 minuto)
- ✅ Lazy loading de recursos
- ✅ Otimização de re-renders
- ✅ Timeout de 5 segundos nas requisições

### Experiência do Usuário
- ✅ Loading overlay durante operações
- ✅ Feedback visual imediato
- ✅ Validação de entrada em tempo real
- ✅ Formatação automática de números
- ✅ Suporte a vírgula e ponto decimal
- ✅ Mensagens de erro amigáveis

### Arquitetura
- ✅ Código modular e organizado
- ✅ Sistema de estado centralizado
- ✅ Tratamento robusto de erros
- ✅ API primária + fallback
- ✅ AbortController para cancelar requisições
- ✅ Event delegation otimizado

### Acessibilidade
- ✅ Labels semânticos
- ✅ ARIA attributes
- ✅ Navegação por teclado
- ✅ Foco visível
- ✅ Alto contraste

## 🎯 Atalhos de Teclado

- `Ctrl/Cmd + Enter` - Converter
- `Ctrl/Cmd + Shift + S` - Inverter moedas
- `Tab` - Navegar entre campos

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Animações e gradientes modernos
- **JavaScript (ES6+)** - Lógica e interatividade
- **AwesomeAPI** - Cotações em tempo real (API primária)
- **ExchangeRate-API** - API de fallback
- **Google Fonts** - Tipografia (Montserrat & Poppins)
- **FlagCDN** - Bandeiras dos países

## 📱 Responsividade

- **Desktop**: Layout otimizado com máximo de 480px de largura
- **Tablet**: Adaptações para telas médias
- **Mobile**: Interface compacta para smartphones (< 640px)
- **Mobile Small**: Otimizações extras (< 380px)

## 🔧 Como Usar

1. **Abra o arquivo `index.html` em seu navegador**
2. Digite o valor que deseja converter
3. Selecione as moedas de origem e destino
4. A conversão é feita automaticamente!

### Recursos Extras
- Clique no botão de troca (⇅) para inverter as moedas
- Use os botões de valores rápidos para conversões comuns
- Clique no ícone de refresh para forçar atualização da cotação
- Acesse o histórico para reutilizar conversões anteriores

## 📊 APIs Utilizadas

### AwesomeAPI (Primária)
```
https://economia.awesomeapi.com.br/last/BRL-USD
```
- Foco em moedas brasileiras
- Atualização frequente
- Sem necessidade de API key

### ExchangeRate-API (Fallback)
```
https://open.er-api.com/v6/latest/USD
```
- Cobertura global
- Backup confiável
- Gratuita

## 🎨 Personalização

### Cores (CSS Variables)
```css
--primary-green: #064531
--accent-green: #10B981
--logo-color: #91C759
```

### Configurações JavaScript
```javascript
CONFIG = {
    CACHE_DURATION: 60000,        // 1 minuto
    DEBOUNCE_DELAY: 500,          // 0.5 segundos
    MAX_HISTORY_ITEMS: 5,         // 5 itens
    AUTO_REFRESH_INTERVAL: 300000 // 5 minutos
}
```

## 🐛 Tratamento de Erros

- Fallback automático entre APIs
- Mensagens de erro amigáveis
- Retry logic implementado
- Timeout de requisições
- Cache como backup

## 📈 Melhorias Futuras Sugeridas

- [ ] PWA (Progressive Web App)
- [ ] Modo offline completo
- [ ] Gráficos de variação histórica
- [ ] Mais moedas (100+ moedas)
- [ ] Conversor múltiplo (várias moedas simultaneamente)
- [ ] Exportação de histórico (CSV/PDF)
- [ ] Calculadora integrada
- [ ] Temas personalizáveis
- [ ] Comparação lado a lado
- [ ] Alertas de taxa favorável

## 📄 Licença

Projeto de código aberto para uso educacional e comercial.

## 👨‍💻 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com 💚 usando as melhores práticas de desenvolvimento web**