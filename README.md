# 🎮 Pokémon Map & Hunt Enhancer Pro

> Script de Qualidade de Vida para o jogo [Pokémon Idle World](https://poke.idleworld.online/play), feito pela comunidade.

[![Version](https://img.shields.io/badge/Versão-9.4.10-blue?style=for-the-badge)](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js)
[![License](https://img.shields.io/badge/Licença-MIT-green?style=for-the-badge)](LICENSE)
[![Game](https://img.shields.io/badge/Jogo-poke.idleworld.online-orange?style=for-the-badge)](https://poke.idleworld.online/play)

---

## 📋 Índice

- [O que é esse Script?](#-o-que-é-esse-script)
- [Instalação Rápida](#-instalação-rápida)
  - [Instalando a Extensão](#-passo-1-instale-a-extensão-de-userscripts)
  - [Instalando o Script](#-passo-2-instale-o-script)
- [Funcionalidades](#-funcionalidades)
  - [🗺️ Mapa Simplificado](#️-1-mapa-simplificado)
  - [⭐ Sistema de Favoritos](#-2-sistema-de-favoritos)
  - [⚡ Botão de Teleporte Rápido](#-3-botão-de-teleporte-rápido)
  - [📊 Hunt Analyzer Aprimorado](#-4-hunt-analyzer-aprimorado)
  - [⚖️ Comparador de Hunts](#️-5-comparador-de-hunts)
  - [🔴 Rastreador de Capturas em Tempo Real](#-6-rastreador-de-capturas-em-tempo-real)
  - [🛒 Melhorias na Loja (Marketplace)](#-7-melhorias-na-loja-marketplace)
  - [📖 Melhorias na Pokédex](#-8-melhorias-na-pokédex)
  - [⚙️ Painel de Configurações](#️-9-painel-de-configurações)
- [Configurações Disponíveis](#️-configurações-disponíveis)
- [FAQ](#-faq)
- [Créditos](#-créditos)

---

## 🔎 O que é esse Script?

O **Pokémon Map & Hunt Enhancer Pro** é um userscript que adiciona dezenas de melhorias de qualidade de vida ao [Pokémon Idle World](https://poke.idleworld.online/play). Ele foi desenvolvido para ajudar jogadores a otimizar suas sessões de hunt, navegar pelo jogo mais rápido e tomar decisões mais inteligentes sobre onde farmar.

**Tudo funciona de forma não-intrusiva:** o script apenas lê a interface nativa do jogo e injeta informações extras — nenhuma ação é feita no servidor, nenhum dado é enviado a terceiros.

---

## 🚀 Instalação Rápida

### 🔧 Passo 1: Instale a extensão de userscripts

Você precisa de uma extensão para rodar scripts no navegador. Recomendamos:

#### Tampermonkey (Mais popular)

| Navegador | Link |
|-----------|------|
| 🟢 **Chrome** / Brave / Arc | [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| 🔵 **Firefox** | [Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/) |
| 🟠 **Edge** | [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |
| 🔷 **Zen Browser** | Use o link do Firefox acima (Zen é baseado em Firefox) |

#### Violentmonkey (Alternativa open-source)

| Navegador | Link |
|-----------|------|
| 🟢 **Chrome** / Brave / Arc | [Chrome Web Store](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegedbjbeeklconlalihjl) |
| 🔵 **Firefox** / **Zen** | [Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/violentmonkey/) |
| 🟠 **Edge** | [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao) |

> 💡 **Dica:** Qualquer uma das duas funciona perfeitamente. O Tampermonkey tem mais recursos e suporte; o Violentmonkey é 100% open-source.

---

### 📥 Passo 2: Instale o Script

Depois de instalar a extensão, clique no botão abaixo para instalar o script com **atualização automática**:

[![Instalar Script](https://img.shields.io/badge/⬇️%20Instalar%20Script-Clique%20Aqui-brightgreen?style=for-the-badge)](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js)

Uma janela do Tampermonkey/Violentmonkey vai abrir pedindo confirmação. Clique em **"Instalar"**.

> 🔄 O script se atualiza automaticamente. Sempre que uma nova versão for publicada no GitHub, sua extensão vai baixar a atualização silenciosamente.

---

## ✨ Funcionalidades

### 🗺️ 1. Mapa Simplificado

> **Onde acessar:** Clique no botão de **Mapa** na dock do jogo.

<!-- 🎬 [VIDEO: Mostrar o mapa nativo vs o mapa simplificado, e como usar a lista de hunts] -->

O mapa visual padrão é substituído por uma lista limpa e ordenável com todas as hunts disponíveis.

**O que você vê em cada hunt:**
- 🖼️ Ícone/sprite do Pokémon
- Nome e Nível da hunt
- **Multiplicador de Efetividade** do seu Pokémon ativo (calculado automaticamente com base no tipo)
- **Badge de tipo** do Pokémon inimigo (ex: `fire`, `water`)
- **Valor de venda** (preço NPC) do Pokémon
- **XP concedido** pelo Pokémon
- Indicador `[Aqui]` se você já está nessa hunt
- ⭐ Botão de Favorito

**Modos de ordenação disponíveis (dropdown no topo):**

> ℹ️ **Nota:** Independentemente do filtro escolhido, suas hunts **Favoritas** estarão sempre fixadas no topo. As **cidades vazias** são ocultadas automaticamente para limpar a interface.

| Modo | Descrição |
|------|-----------|
| Preço: Maior → Menor | Ordena pelo valor de venda |
| Preço: Menor → Maior | Inverso do anterior |
| Efetividade: Maior Vantagem | Ordena pelas maiores vantagens de tipo (desempate por Level) |
| Somente XP | Ordena pelo maior ganho de XP (priorizando as de maior efetividade de tipo) |

**Preview de Drops (configurável):**
- **Hover:** Passe o mouse sobre a hunt para ver os drops em tooltip
- **Ícone (?):** Um botão `?` aparece em cada linha para ver os drops
- **Oculto:** Sem preview de drops

---

### ⭐ 2. Sistema de Favoritos

> **Onde usar:** Botão `★` em cada hunt na lista do mapa.

<!-- 🎬 [VIDEO: Clicar no botão de favorito, mostrar hunt aparecendo no topo da lista] -->

- Clique no `☆` ao lado de qualquer hunt para marcá-la como favorita
- Hunts favoritas aparecem no **topo da lista** com destaque azul
- A barra lateral fica azul para indicar que é favorita
- Os favoritos ficam salvos no navegador e persistem entre sessões

---

### ⚡ 3. Botão de Teleporte Rápido

> **Onde usar:** Barra inferior de navegação do jogo (dock), ao lado do botão de mapa.

<!-- 🎬 [VIDEO: Mostrar o botão na dock e clicar nele para teletransportar] -->

Um botão extra é adicionado à dock do jogo. Ao clicar:
- **Modo ★ (Favorita):** Teletransporta diretamente para sua hunt favorita
- **Modo ↺ (Última):** Teletransporta para a última hunt que você visitou

> 🤖 **Smart Search:** O script procura automaticamente pela hunt varrendo todas as abas (áreas) do mapa de forma invisível. Você não precisa se preocupar em qual aba o mapa estava (Kanto, Outland, etc).

O modo é configurável em **Configurações → Script Mods → Nav Dock Button Action**.

---

### 📊 4. Hunt Analyzer Aprimorado

> **Onde usar:** Janela nativa do **Hunt Analyzer** do jogo.

<!-- 🎬 [VIDEO: Abrir o hunt analyzer, mostrar os botões adicionados e o modo compacto] -->

Três botões são adicionados na parte inferior do Hunt Analyzer:

| Botão | Função |
|-------|--------|
| `⤡ Reduzir` | Compacta a janela para ocupar menos espaço na tela |
| `📦 Drops` | Mostra/esconde a lista de drops da sessão |
| `⚖️ Comparar` | Abre o **Comparador de Hunts** (ver abaixo) |

**Modo Compacto (`⤡ Reduzir`):**

<!-- 🎬 [VIDEO: Demonstrar o modo compacto side-by-side com o modo normal] -->

A janela fica menor e exibe as informações em formato de grade enxuta, ideal para deixar o Hunt Analyzer aberto ao lado do jogo sem ocupar espaço.

---

### ⚖️ 5. Comparador de Hunts

> **Onde acessar:** Botão `⚖️ Comparar` na parte inferior do Hunt Analyzer.

<!-- 🎬 [VIDEO: Fazer uma hunt, trocar para outra hunt, abrir o comparador e mostrar os dados lado a lado] -->

O Comparador salva automaticamente um **snapshot** da hunt anterior quando você troca de local. Ao clicar em **Comparar**, uma janela flutuante exibe os dados lado a lado:

| Métrica | Descrição |
|---------|-----------|
| 💰 Balance Total | Gold acumulado (Loot + Capturas − Supply) |
| 📉 Balance/h | Ritmo de ganho de gold por hora |
| 🌟 XP Gained | Total de XP ganho na sessão |
| ✨ XP/h | Ritmo de ganho de XP por hora |
| ⚔️ Kills/h | Ritmo de abates por hora |
| ⏱️ Tempo | Tempo total na hunt |
| 💀 Defeated | Total de Pokémons derrotados |

**Destaques:**
- 🟢 **Verde** = Melhor resultado nessa métrica
- 🔴 **Vermelho** = Resultado inferior
- 🖱️ A janela pode ser **arrastada** pela tela (segure o título)
- Funciona mesmo sem hunt anterior (exibe valores zerados)

> ℹ️ O snapshot é salvo automaticamente quando o contador de Defeated diminui (indicando troca de hunt). O nome do mapa é gravado no momento da captura para evitar que o nome do novo mapa "vaze" para a hunt anterior.

---

### 🔴 6. Rastreador de Capturas em Tempo Real

> **Onde aparece:** Dentro da barra de rates do Hunt Analyzer (ao lado de XP/h e Kills/h).

<!-- 🎬 [VIDEO: Capturar um Pokémon e mostrar o contador atualizando em tempo real] -->

Uma linha extra é adicionada na barra de taxas do Hunt Analyzer:

```
🔴 Último catch: 17:35 (há 2m) • 5 balls
```

**O que cada parte significa:**
- `17:35` → Horário exato do último catch
- `(há 2m)` → Tempo decorrido desde o último catch (atualiza em tempo real)
- `5 balls` → Quantidade de Pokébolas usadas desde o último catch

Se você ainda não capturou nada na hunt atual, exibe: `🔴 Nenhum catch nesta hunt`

---

### 🛒 7. Melhorias na Loja (Marketplace)

> **Onde acessar:** Janela do **Marketplace** do jogo.

<!-- 🎬 [VIDEO: Mostrar o marketplace com lock de itens e confirmação de venda de raro] -->

#### 🔒 Bloqueio de Itens (Sell Lock)

Na aba **Sell**, um ícone 🔓/🔒 aparece ao lado de cada item. Clique para **bloquear** o item:
- O item travado fica em tom reduzido
- Sua checkbox é desabilitada, impedindo que você o selecione para venda por acidente
- A trava persiste enquanto a janela estiver aberta

#### ✅ Confirmação de Venda para Itens de Valor

Se você tentar vender itens que estão na sua **lista de proteção**, uma janela de confirmação aparece antes de prosseguir. Configure quais itens são protegidos em **Configurações → Script Mods → Sell Confirmation Items**.

Por padrão, `Strange Pheromone` e `Rare Pokémon Picture` já vêm protegidos.

#### 🛡️ Proteção contra Venda de Pokémons Raros

Na aba **Pokémon** da loja, o botão "Selecionar Todos" foi aprimorado: ao clicar nele, Pokémons **Lendários**, **Míticos** e **Divinos** são **automaticamente desmarcados**, protegendo-os de uma venda acidental em massa.

---

### 📖 8. Melhorias na Pokédex

> **Onde acessar:** Janela da **Pokédex** do jogo.

<!-- 🎬 [VIDEO: Mostrar os filtros da Pokédex, ordenação e o Fast Travel em ação] -->

Três botões de filtro são adicionados na Pokédex:

| Botão | Função |
|-------|--------|
| `Todos` | Mostra todos os Pokémons |
| `✓ Caught` | Mostra apenas os que você já capturou |
| `✗ Not Caught` | Mostra apenas os que ainda não capturou |

Quando o filtro **"Not Caught"** está ativo, um botão extra `💰 Menor Valor` aparece para ordenar os Pokémons pelo menor valor de venda (útil para focar nos mais acessíveis primeiro).

#### ⚡ Fast Travel pela Pokédex

Ative o toggle **"⚡ Fast Travel"** na Pokédex. Com ele ativo, clicar em qualquer Pokémon na Pokédex automaticamente **teletransporta você para a hunt** daquele Pokémon, sem precisar abrir o mapa.

---

### ⚙️ 9. Painel de Configurações

> **Onde acessar:** Ícone de Configurações do jogo → Aba **"Script Mods"**.

<!-- 🎬 [VIDEO: Abrir as configurações e mostrar a aba Script Mods com todas as opções] -->

Uma aba extra "Script Mods" é adicionada ao painel de configurações nativo do jogo:

| Configuração | Opções |
|-------------|--------|
| **Simplified Map Mode** | Ligado / Desligado |
| **Drops Preview Mode** | Hover / Ícone (?) / Oculto |
| **Nav Dock Button Action** | ★ Favorita / ↺ Última |
| **Chat Interface** | Exibir / Ocultar |
| **Sell Confirmation Items** | Lista editável com busca e ícones dos itens |
| **Desmarcar Itens com Cadeado (Aba Loja)** | Ligado / Desligado |
| **Proteção de Venda (Pokémons Raros)** | Ligado / Desligado |

---

## 🛠️ Configurações Salvas

Todas as preferências são salvas localmente no **localStorage** do navegador — nenhum dado sai da sua máquina.

| Chave | Padrão | Descrição |
|-------|--------|-----------|
| `hunts_favoritas_v1` | `[]` | Lista de hunts favoritas |
| `ultima_hunt_v1` | `null` | Última hunt visitada |
| `script_mapa_ativo_v1` | `true` | Mapa simplificado ligado/desligado |
| `script_chat_ativo_v1` | `true` | Chat visível ou oculto |
| `script_nav_tp_mode_v1` | `fav` | Modo do botão de teleporte (`fav` ou `last`) |
| `script_drop_mode_v1` | `hover` | Como ver drops na lista (`hover`, `icon`, `off`) |
| `script_sell_confirm_items_v1` | (lista padrão) | Itens protegidos contra venda |
| `script_shop_unselect_lock_v1` | `true` | Proteção contra venda (Itens cadeado) |
| `script_shop_unselect_legendary_v1` | `true` | Proteção contra venda (Lendários) |

---

## ❓ FAQ

**O script funciona no celular?**  
Não. Extensões de userscript não funcionam em navegadores móveis convencionais.

**O script pode me banir do jogo?**  
O script **não faz nenhuma ação automática**, não envia comandos ao servidor e não modifica dados do jogo. Ele apenas lê e melhora a interface visualmente. Nenhum dado é enviado para fora do seu navegador.

**Não estou vendo os drops na lista do mapa.**  
O script carrega os dados de drop da API do jogo (`items.json`). Aguarde alguns segundos após abrir o mapa para que os dados carreguem.

**O Comparador de Hunts não está registrando a hunt anterior.**  
O snapshot é salvo quando o contador de **Defeated** diminui (você trocou de hunt). Certifique-se de ter feito ao menos **1 kill** na hunt anterior antes de trocar.

**Como forçar uma atualização do script?**  
Vá em **Tampermonkey → Dashboard** → clique no nome do script → aba **"Installed Version"** → clique no botão de atualizar. Ou desinstale e reinstale pelo link acima.

---

## 👥 Créditos

Desenvolvido com 💙 por **Desjunior** ([JulianoCLI](https://github.com/JulianoCLI)) para a comunidade de Pokémon Idle World.

Contribuições, sugestões e reports de bugs são muito bem-vindos! Abra uma [Issue](https://github.com/JulianoCLI/PIW-QOL/issues) ou entre em contato pelo Discord da comunidade do jogo.

---

<div align="center">

**[⬇️ Instalar Agora](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js)** • **[📝 Reportar Bug](https://github.com/JulianoCLI/PIW-QOL/issues)** • **[⭐ Dar uma Estrela](https://github.com/JulianoCLI/PIW-QOL)**

</div>
