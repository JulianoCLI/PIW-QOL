// ==UserScript==
// @name         Pokémon Map & Hunt Enhancer Pro
// @namespace    http://tampermonkey.net/
// @version      9.8.1
// @description  Suporte a ícones oficiais via items.json, lógica de valores robusta e tooltips esteticamente alinhadas ao jogo.
// @author       Desjunior (JulianoCLI)
// @match        https://poke.idleworld.online/play
// @grant        none
// @updateURL    https://raw.githubusercontent.com/JulianoCLI/PIW-QOL/main/piw-qol.user.js
// @downloadURL  https://raw.githubusercontent.com/JulianoCLI/PIW-QOL/main/piw-qol.user.js
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_FAVS = 'hunts_favoritas_v1';
    const STORAGE_LAST_HUNT = 'ultima_hunt_v1';
    const STORAGE_SCRIPT_ACTIVE = 'script_mapa_ativo_v1';
    const STORAGE_CHAT_ACTIVE = 'script_chat_ativo_v1';
    const STORAGE_NAV_MODE = 'script_nav_tp_mode_v1';
    const STORAGE_DROP_MODE = 'script_drop_mode_v1'; // 'hover', 'icon', 'off'
    const STORAGE_SELL_CONFIRM = 'script_sell_confirm_items_v1';
    const STORAGE_SELL_LOCKS = 'script_sell_locks_v1';
    const STORAGE_DEX_FAST_TRAVEL = 'script_dex_fast_travel_v1';
    const STORAGE_GUARD_LEGENDARY = 'script_guard_legendary_v1';
    const STORAGE_GUARD_SELL_LOCK = 'script_guard_sell_lock_v1';

    let isRendering = false;
    const globalCreatureApiData = new Map();
    const globalItemApiData = new Map();

    // URLs oficiais do jogo
    const POKEMON_TYPES_JSON_URL = 'https://poke.idleworld.online/game/creatures.json';
    const ITEMS_JSON_URL = 'https://poke.idleworld.online/game/items.json';

    // --- TABELA COMPACTA DE TIPOS POKÉMON ---
    const TYPE_CHART = {
        normal: { rock: 0.5, ghost: 0, steel: 0.5 },
        fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
        water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
        electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
        grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
        ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
        fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2 },
        poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
        ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
        flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
        psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
        bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5 },
        rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
        ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
        dragon: { dragon: 2, steel: 0.5 },
        dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5 },
        steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5 }
    };

    const BASE_POKEMON_TYPES = {
        "magneton": ["electric", "steel"], "charizard": ["fire", "flying"], "blastoise": ["water"],
        "venusaur": ["grass", "poison"], "pikachu": ["electric"], "alakazam": ["psychic"],
        "gengar": ["ghost", "poison"], "dragonite": ["dragon", "flying"], "gyarados": ["water", "flying"],
        "arcanine": ["fire"], "scyther": ["bug", "flying"], "golem": ["rock", "ground"],
        "snorlax": ["normal"], "lapras": ["water", "ice"], "machamp": ["fighting"],
        "pinsir": ["bug"], "eevee": ["normal"], "vaporeon": ["water"], "jolteon": ["electric"], "flareon": ["fire"]
    };

    let POKEMON_TYPES = { ...BASE_POKEMON_TYPES };

    // Carregamento de Criaturas da API
    async function loadExternalPokemonData() {
        try {
            const response = await fetch(POKEMON_TYPES_JSON_URL);
            if (response.ok) {
                const data = await response.json();
                const creaturesList = Array.isArray(data) ? data : (data.creatures || []);
                if (creaturesList.length > 0) {
                    const fetchedTypes = {};
                    creaturesList.forEach(poke => {
                        const pokeName = (poke.name || '').toLowerCase().trim();
                        const t1 = poke.type1 || poke.type_1;
                        const t2 = poke.type2 || poke.type_2;
                        if (pokeName && t1) {
                            const types = [t1.toLowerCase().trim()];
                            if (t2) types.push(t2.toLowerCase().trim());
                            fetchedTypes[pokeName] = types;
                        }
                        globalCreatureApiData.set(pokeName, poke);
                    });
                    POKEMON_TYPES = { ...BASE_POKEMON_TYPES, ...fetchedTypes };
                    buildSimpleList();
                }
            }
        } catch (e) {
            console.warn("⚠️ Falha ao carregar creatures.json", e);
        }
    }

    // Carregamento de Itens da API (para buscar os ícones botânicos/oficiais)
    async function loadExternalItemData() {
        try {
            const response = await fetch(ITEMS_JSON_URL);
            if (response.ok) {
                const data = await response.json();
                const itemsList = Array.isArray(data) ? data : (data.items || Object.values(data));
                itemsList.forEach(item => {
                    if (!item) return;
                    const itemName = (item.name || item.title || '').toLowerCase().trim();
                    const itemId = String(item.id || item.key || '').toLowerCase().trim();

                    if (itemName) globalItemApiData.set(itemName, item);
                    if (itemId) globalItemApiData.set(itemId, item);
                });
                buildSimpleList();
            }
        } catch (e) {
            console.warn("⚠️ Falha ao carregar items.json", e);
        }
    }

    loadExternalPokemonData();
    loadExternalItemData();

    function applyOutlandModifier(baseMultiplier) {
        if (baseMultiplier === 1.5) return 1.75;
        if (baseMultiplier === 2.0) return 2.50;
        if (baseMultiplier >= 4.0) return 5.50;
        if (baseMultiplier === 0.5) return 0.33;
        return baseMultiplier;
    }

    function getOffensiveMultiplier(attackerTypes, defenderTypes) {
        let bestMult = null;
        attackerTypes.forEach(attType => {
            let mult = 1.0;
            defenderTypes.forEach(defType => {
                const chart = TYPE_CHART[attType];
                if (chart && chart[defType] !== undefined) {
                    mult *= chart[defType];
                }
            });
            if (bestMult === null || mult > bestMult) {
                bestMult = mult;
            }
        });
        return applyOutlandModifier(bestMult !== null ? bestMult : 1.0);
    }

    function getCleanHuntName(huntName) {
        if (!huntName) return '';
        return huntName.toLowerCase()
            .replace(/\[.*?\]/g, '')
            .replace(/\(.*\)/g, '')
            .trim();
    }

    function getDefenderTypes(huntName) {
        const cleanName = getCleanHuntName(huntName);
        if (POKEMON_TYPES[cleanName]) return POKEMON_TYPES[cleanName];

        const words = cleanName.split(/\s+/);
        for (let i = words.length - 1; i >= 0; i--) {
            const subName = words.slice(i).join(' ');
            if (POKEMON_TYPES[subName]) return POKEMON_TYPES[subName];
            if (POKEMON_TYPES[words[i]]) return POKEMON_TYPES[words[i]];
        }
        return ["normal"];
    }

    // --- PROCESSAMENTO DE DROPS COM ÍCONES REAIS DO ITEMS.JSON ---
    function resolveItemIcon(itemName) {
        const cleanKey = itemName.toLowerCase().trim();
        let itemObj = globalItemApiData.get(cleanKey);

        if (!itemObj) {
            // Tenta buscar por correspondência parcial
            for (const [key, val] of globalItemApiData.entries()) {
                if (cleanKey.includes(key) || key.includes(cleanKey)) {
                    itemObj = val;
                    break;
                }
            }
        }

        if (itemObj) {
            const imgPath = itemObj.image || itemObj.icon || itemObj.sprite || itemObj.img || '';
            if (imgPath) {
                // Se o caminho for relativo, constrói a URL correta com base no domínio
                const fullImgUrl = imgPath.startsWith('http') ? imgPath : `https://poke.idleworld.online/${imgPath.startsWith('/') ? imgPath.slice(1) : imgPath}`;
                return `<img src="${fullImgUrl}" style="width:20px; height:20px; vertical-align:middle; margin-right:8px; object-fit:contain;" />`;
            }
        }

        // Fallback visual caso o item não tenha imagem mapeada
        return `<span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; background:#12202a; border:1px solid #273f52; border-radius:4px; margin-right:8px; font-size:10px; color:#48bb78;">🌿</span>`;
    }

    function parseDropsHTML(rawDrops) {
        if (!rawDrops) return '';

        if (Array.isArray(rawDrops)) {
            return rawDrops.map(d => {
                let itemName = 'Item';
                let customImgHTML = '';

                if (typeof d === 'object' && d !== null) {
                    itemName = d.name || d.item || d.label || d.title || 'Item';
                    const directImg = d.image || d.icon || d.sprite || d.img || '';
                    if (directImg) {
                        const fullUrl = directImg.startsWith('http') ? directImg : `https://poke.idleworld.online/${directImg.startsWith('/') ? directImg.slice(1) : directImg}`;
                        customImgHTML = `<img src="${fullUrl}" style="width:20px; height:20px; vertical-align:middle; margin-right:8px; object-fit:contain;" />`;
                    }
                } else {
                    itemName = String(d);
                }

                const iconHTML = customImgHTML || resolveItemIcon(itemName);

                return `
                    <div style="display:flex; align-items:center; margin-bottom:6px; font-size:13px; color:#cbd5e0; background:rgba(20,34,45,0.6); padding:4px 8px; border-radius:4px; border:1px solid #1a2d3a;">
                        ${iconHTML}
                        <span style="font-weight:500; color:#e2e8f0;">${itemName}</span>
                    </div>
                `;
            }).join('');
        }

        if (typeof rawDrops === 'string') {
            return `<div style="font-size:13px; color:#cbd5e0;">${rawDrops}</div>`;
        }

        return '';
    }

    function extractHuntDetailsFromJSON(name, marker) {
        const cleanName = getCleanHuntName(name);
        let priceVal = 0;
        let experience = 0;
        let dropsHTML = '';

        if (globalCreatureApiData.has(cleanName)) {
            const pokeObj = globalCreatureApiData.get(cleanName);
            const possiblePriceKeys = ['sellValue', 'priceNpc', 'sell', 'sellsFor', 'price', 'value', 'gold', 'money', 'cost', 'reward'];

            for (const key of possiblePriceKeys) {
                if (pokeObj[key] !== undefined && pokeObj[key] !== null && pokeObj[key] !== '') {
                    const parsed = parseInt(String(pokeObj[key]).replace(/\D/g, ''), 10);
                    if (!isNaN(parsed) && parsed > 0) {
                        priceVal = parsed;
                        break;
                    }
                }
            }

            if (pokeObj.experience !== undefined) {
                experience = parseInt(pokeObj.experience, 10) || 0;
            } else if (pokeObj.exp !== undefined) {
                experience = parseInt(pokeObj.exp, 10) || 0;
            }

            const rawDrops = pokeObj.drops || pokeObj.drop || pokeObj.loot || pokeObj.items;
            dropsHTML = parseDropsHTML(rawDrops);
        }

        if ((priceVal === 0 || !dropsHTML) && marker) {
            marker.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            const mapTip = document.querySelector('.map-tip');
            if (mapTip) {
                if (priceVal === 0) {
                    const sellEl = mapTip.querySelector('.map-tip-sell b') || mapTip.querySelector('.map-tip-sell');
                    if (sellEl) {
                        const parsedDom = parseInt(sellEl.textContent.replace(/\D/g, ''), 10);
                        if (!isNaN(parsedDom) && parsedDom > 0) priceVal = parsedDom;
                    }
                }
                if (!dropsHTML) {
                    const dropsEl = mapTip.querySelector('.map-tip-drops');
                    if (dropsEl) {
                        dropsHTML = `<div style="font-size:13px; color:#cbd5e0; padding:4px;">${dropsEl.innerHTML}</div>`;
                    }
                }
            }
            marker.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        }

        let sellsFor = priceVal > 0 ? `$ ${priceVal.toLocaleString('en-US')}` : 'Indisponível';
        if (cleanName === 'aerodactyl') sellsFor = 'Não pode ser vendido';
        const expText = experience > 0 ? `${experience.toLocaleString('en-US')} XP` : '';
        return { sellsFor, numericPrice: priceVal, dropsHTML, experience, expText };
    }

    // --- ESTILOS VISUAIS (ESTÉTICA BOTÂNICA E LIMPA) ---
    const style = document.createElement('style');
    style.id = 'simplifier-dynamic-styles';
    style.innerHTML = `
        .promo-overlay { display: none !important; }
        #dock-btn-quick-tp {
            background: rgba(49, 130, 206, 0.2);
            border: 1px solid #3182ce;
            color: #ffcc00;
            font-size: 16px; font-weight: bold;
            display: inline-flex; align-items: center; justify-content: center;
            transition: all 0.2s ease;
        }
        #dock-btn-quick-tp:hover { background: rgba(49, 130, 206, 0.5); transform: scale(1.08); }

        .hunt-drop-tooltip {
            position: absolute; background: #0c161f; border: 1px solid #233e52;
            border-radius: 8px; padding: 10px 14px; z-index: 9999; font-size: 13px;
            color: #e2e8f0; pointer-events: none; box-shadow: 0 8px 20px rgba(0,0,0,0.8);
            min-width: 180px; max-width: 280px;
        }
        .drop-icon-btn {
            background: #14222d; border: 1px solid #2b4c66; color: #48bb78;
            border-radius: 50%; width: 24px; height: 24px; font-size: 12px;
            display: inline-flex; align-items: center; justify-content: center;
            cursor: pointer; margin-left: 8px; font-weight: bold; transition: all 0.2s;
        }
        .drop-icon-btn:hover { background: #1c3040; border-color: #48bb78; }

        .map-window {
            display: flex !important;
            flex-direction: column !important;
            width: 780px !important;
            max-width: 95vw !important;
            height: 620px !important;
            background: #181a20 !important;
            color: #fff !important;
            border-radius: 8px;
            overflow: hidden;
        }
        .map-window .map-body {
            flex: 1 !important;
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        .mod-disabled {
            opacity: 0.35 !important;
            pointer-events: none !important;
            filter: grayscale(100%);
        }

        .mk-lock-sell { font-size: 14px; background: none; border: none; cursor: pointer; margin-left: 6px; padding: 2px; }
        .mk-lock-sell:hover { opacity: 0.8; }
        .mk-srow-head.locked { opacity: 0.6; }

        .sell-confirm-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .sell-confirm-modal { background: #0c161f; border: 1px solid #273f52; border-radius: 8px; padding: 0; color: #e2e8f0; width: 320px; box-shadow: 0 12px 32px rgba(0,0,0,0.8); overflow: hidden; }
        .sell-confirm-title { background: #14222d; border-bottom: 1px solid #273f52; padding: 12px 16px; font-size: 15px; font-weight: bold; color: #63b3ed; display: flex; align-items: center; gap: 8px; }
        .sell-confirm-body { padding: 16px; }
        .sell-confirm-body p { color: #a0aec0; font-size: 13px; margin: 0 0 10px 0; }
        .sell-confirm-items { background: #14222d; border: 1px solid #1a2d3a; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; max-height: 100px; overflow-y: auto; }
        .sell-confirm-items div { color: #ffcc00; font-weight: bold; font-size: 13px; padding: 2px 0; }
        .sell-confirm-footer { display: flex; gap: 8px; }
        .sell-confirm-btn { flex: 1; padding: 8px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px; transition: background 0.15s; }
        .sell-confirm-btn.yes { background: #48bb78; color: #fff; }
        .sell-confirm-btn.yes:hover { background: #38a169; }
        .sell-confirm-btn.no { background: #2b4c66; color: #e2e8f0; border: 1px solid #273f52; }
        .sell-confirm-btn.no:hover { background: #3182ce; }

        .dex-script-controls { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 6px 10px; border-top: 1px solid #1a2d3a; }
        .dex-fbtn { padding: 4px 10px; border: 1px solid #273f52; background: #0c161f; color: #a0aec0; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.15s; }
        .dex-fbtn:hover { border-color: #3182ce; color: #e2e8f0; }
        .dex-fbtn.on { background: #3182ce; color: #fff; border-color: #3182ce; }
        .dex-ft-label { display: flex; align-items: center; gap: 4px; color: #a0aec0; font-size: 12px; cursor: pointer; margin-left: auto; }
        .dex-ft-label input { cursor: pointer; }
        .dex-cell.dex-hidden { display: none !important; }

        /* Hunt Analyzer Compact Mode */
        .ha-window.ha-compact { max-width: 290px !important; width: 290px !important; }
        .ha-window.ha-compact .ha-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 4px !important; }
        .ha-window.ha-compact .ha-card { padding: 4px 8px !important; flex-direction: row !important; align-items: center !important; justify-content: flex-start !important; gap: 8px !important; }
        .ha-window.ha-compact .ha-card small { display: none !important; }
        .ha-window.ha-compact .ha-card-ico { font-size: 16px !important; margin: 0 !important; }
        .ha-window.ha-compact .ha-card b { font-size: 14px !important; }
        .ha-window.ha-compact .ha-balance { font-size: 14px !important; padding: 4px !important; flex-direction: row !important; justify-content: space-between !important; }
        .ha-window.ha-compact .ha-balance span { display: none !important; }
        .ha-window.ha-compact .ha-balance::before { content: 'Balance'; font-weight: bold; }
        .ha-window.ha-compact .ha-rates { display: flex !important; flex-direction: column !important; align-items: stretch !important; gap: 4px !important; padding: 4px !important; font-size: 11px !important; }
        .ha-window.ha-compact .ha-rates span { width: 100% !important; text-align: center !important; margin: 0 !important; }
        .ha-window.ha-compact .ha-drops-head, .ha-window.ha-compact .ha-note { display: none !important; }
        .ha-window.ha-compact .ha-clog-btn { display: none !important; }
        .ha-window.ha-compact .ha-drops { display: none !important; }
        .ha-window.ha-compact .ha-drops.show-drops { display: flex !important; max-height: 80px !important; overflow-y: auto !important; padding: 4px !important; }
        
        /* Hunt Analyzer Custom UI */
        .ha-script-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 8px; padding: 0 8px 8px 8px; }
        .ha-sbtn { background: #1a2d3a; color: #a0aec0; border: 1px solid #273f52; border-radius: 6px; padding: 6px 4px; font-size: 11px; cursor: pointer; transition: all 0.15s ease; text-align: center; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .ha-sbtn:hover { background: #3182ce; color: #fff; border-color: #3182ce; }
        .ha-catch-stats { display: block; width: 100%; text-align: center; margin-top: 4px; }
        .ha-catch-stats.hidden { display: none !important; }
        .ha-rates { flex-wrap: wrap !important; }

        /* Compare Modal */
        .ha-compare-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 10000; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .ha-compare-modal { pointer-events: auto; width: 340px; box-shadow: 0 12px 32px rgba(0,0,0,0.8); }
        .ha-compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ha-compare-table th { text-align: center; padding: 8px; color: #a0aec0; border-bottom: 1px solid #273f52; font-weight: normal; }
        .ha-compare-table td { padding: 8px; border-bottom: 1px solid #1a2d3a; text-align: center; font-weight: bold; }
        .ha-compare-table tr:nth-child(even) { background-color: rgba(255, 255, 255, 0.03); }
        .ha-compare-table td:first-child { text-align: left; font-weight: normal; color: #a0aec0; }
        .ha-compare-winner { color: #48bb78 !important; }
        .ha-compare-loser { color: #f56565 !important; }
        .ha-compare-modal .ha-title { cursor: grab; user-select: none; }
        .ha-compare-modal .ha-title:active { cursor: grabbing; }
    `;
    document.head.appendChild(style);

    const styleMapMod = document.createElement('style');
    styleMapMod.id = 'simplifier-map-override';
    styleMapMod.innerHTML = `
        .map-viewport, .map-img, .map-zoom { display: none !important; }
        .map-body { width: 100% !important; max-width: 100% !important; padding: 0 !important; background: transparent !important; }
        .hunt-marker { opacity: 0 !important; position: absolute !important; pointer-events: none !important; }
    `;

    function isScriptMapActive() { return localStorage.getItem(STORAGE_SCRIPT_ACTIVE) !== 'false'; }
    function setScriptMapActive(state) { localStorage.setItem(STORAGE_SCRIPT_ACTIVE, state ? 'true' : 'false'); applyMapScriptState(); }

    function isChatActive() { return localStorage.getItem(STORAGE_CHAT_ACTIVE) !== 'false'; }
    function setChatActive(state) { localStorage.setItem(STORAGE_CHAT_ACTIVE, state ? 'true' : 'false'); applyChatState(); }

    function getNavTpMode() { return localStorage.getItem(STORAGE_NAV_MODE) || 'fav'; }
    function setNavTpMode(mode) { localStorage.setItem(STORAGE_NAV_MODE, mode); updateNavButtonAppearance(); }

    function getDropMode() { return localStorage.getItem(STORAGE_DROP_MODE) || 'hover'; }
    function setDropMode(mode) { localStorage.setItem(STORAGE_DROP_MODE, mode); buildSimpleList(); }

    function getSellConfirmItems() {
        const stored = localStorage.getItem(STORAGE_SELL_CONFIRM);
        if (stored) return JSON.parse(stored);
        return ['Strange Pheromone', 'Rare Pokémon Picture']; // defaults
    }
    function setSellConfirmItems(items) {
        localStorage.setItem(STORAGE_SELL_CONFIRM, JSON.stringify(items));
    }

    function getSellLocks() {
        const stored = localStorage.getItem(STORAGE_SELL_LOCKS);
        return stored ? JSON.parse(stored) : [];
    }
    function addSellLock(itemName) {
        const locks = getSellLocks();
        if (!locks.includes(itemName)) { locks.push(itemName); localStorage.setItem(STORAGE_SELL_LOCKS, JSON.stringify(locks)); }
    }
    function removeSellLock(itemName) {
        const locks = getSellLocks().filter(n => n !== itemName);
        localStorage.setItem(STORAGE_SELL_LOCKS, JSON.stringify(locks));
    }

    function isDexFastTravelActive() { return localStorage.getItem(STORAGE_DEX_FAST_TRAVEL) === 'true'; }
    function setDexFastTravel(val) { localStorage.setItem(STORAGE_DEX_FAST_TRAVEL, val ? 'true' : 'false'); }

    function isGuardLegendaryActive() { return localStorage.getItem(STORAGE_GUARD_LEGENDARY) !== 'false'; }
    function setGuardLegendary(val) { localStorage.setItem(STORAGE_GUARD_LEGENDARY, val ? 'true' : 'false'); }

    function isGuardSellLockActive() { return localStorage.getItem(STORAGE_GUARD_SELL_LOCK) !== 'false'; }
    function setGuardSellLock(val) { localStorage.setItem(STORAGE_GUARD_SELL_LOCK, val ? 'true' : 'false'); }

    function applyMapScriptState() {
        const active = isScriptMapActive();
        const existingContainer = document.getElementById('simple-hunts-container');
        if (active) {
            if (!document.getElementById('simplifier-map-override')) document.head.appendChild(styleMapMod);
            if (existingContainer) existingContainer.style.display = 'block';
            buildSimpleList();
        } else {
            if (document.getElementById('simplifier-map-override')) styleMapMod.remove();
            if (existingContainer) existingContainer.style.display = 'none';
        }
    }

    function applyChatState() {
        const active = isChatActive();
        const chatFab = document.querySelector('.chat-fab');
        const chatBox = document.querySelector('.chat-box');
        if (chatFab) chatFab.style.display = active ? '' : 'none';
        if (chatBox) chatBox.style.display = active ? '' : 'none';
    }

    function getFavorites() {
        const favs = localStorage.getItem(STORAGE_FAVS);
        return favs ? JSON.parse(favs) : [];
    }

    function toggleFavorite(huntName) {
        let favs = getFavorites();
        if (favs.includes(huntName)) favs = favs.filter(name => name !== huntName);
        else favs.push(huntName);
        localStorage.setItem(STORAGE_FAVS, JSON.stringify(favs));
        buildSimpleList();
    }

    function saveLastHunt(huntName) {
        if (huntName && huntName !== 'Sem Nome') localStorage.setItem(STORAGE_LAST_HUNT, huntName);
    }
    function getLastHunt() { return localStorage.getItem(STORAGE_LAST_HUNT) || null; }

    function getActivePokemonName() {
        const nameEl = document.querySelector('.phud-name');
        return nameEl ? nameEl.textContent.trim().toLowerCase() : '';
    }

    async function teleportToTarget(huntName) {
        if (!huntName) {
            alert('Nenhuma hunt definida!');
            return;
        }

        const mapBtn = document.querySelector('button[data-guide="dock-map"]');
        let mapWindow = document.querySelector('.map-window');

        if (!mapWindow || mapWindow.style.display !== 'block') {
            if (mapBtn) mapBtn.click();
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        mapWindow = document.querySelector('.map-window');
        if (!mapWindow) {
            alert('Mapa não abriu.');
            return;
        }

        let allTabs = Array.from(mapWindow.querySelectorAll('.map-area:not(.locked)'));
        if (allTabs.length === 0) {
            const found = await tryFindMarkerAsync(huntName, 20, 100);
            if (!found) alert(`Hunt "${huntName}" não foi localizada.`);
            return;
        }

        const activeTab = mapWindow.querySelector('.map-area.on');
        if (activeTab) {
            const found = await tryFindMarkerAsync(huntName, 10, 100);
            if (found) return;
        }

        for (const tab of allTabs) {
            if (tab === activeTab) continue;

            tab.click();
            const found = await tryFindMarkerAsync(huntName, 20, 100);
            if (found) return;
        }

        alert(`Hunt "${huntName}" não foi localizada em nenhuma área.`);
    }

    function tryFindMarkerAsync(huntName, maxAttempts, intervalMs) {
        return new Promise(resolve => {
            let attempts = 0;
            const interval = setInterval(() => {
                const markers = Array.from(document.querySelectorAll('.hunt-marker'));
                const targetMarker = markers.find(m => {
                    const nameEl = m.querySelector('.hunt-name');
                    return nameEl && nameEl.textContent.trim().toLowerCase() === huntName.toLowerCase();
                });

                if (targetMarker) {
                    clearInterval(interval);
                    targetMarker.click();
                    resolve(true);
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        resolve(false);
                    }
                }
            }, intervalMs);
        });
    }

    function teleportToFavorite() {
        const favs = getFavorites();
        if (favs.length === 0) return alert('Você não possui nenhuma hunt favorita!');
        teleportToTarget(favs[0]);
    }

    function teleportToLastHunt() {
        const last = getLastHunt();
        if (!last) return alert('Nenhuma última hunt registrada ainda.');
        teleportToTarget(last);
    }

    function handleNavQuickTP() {
        if (getNavTpMode() === 'fav') teleportToFavorite();
        else teleportToLastHunt();
    }

    function updateNavButtonAppearance() {
        const tpBtn = document.getElementById('dock-btn-quick-tp');
        if (!tpBtn) return;
        const mode = getNavTpMode();
        tpBtn.innerHTML = mode === 'fav' ? '★' : '↺';
        tpBtn.title = mode === 'fav' ? 'Teleportar para Hunt Favorita' : 'Teleportar para Última Hunt';
    }

    function injectQuickTPButton() {
        if (document.getElementById('dock-btn-quick-tp')) return;
        const gameDock = document.querySelector('nav.game-dock');
        if (gameDock) {
            const tpBtn = document.createElement('button');
            tpBtn.id = 'dock-btn-quick-tp';
            tpBtn.className = 'dock-btn dock-btn-custom';
            tpBtn.type = 'button';
            tpBtn.addEventListener('click', handleNavQuickTP);

            const mapBtn = gameDock.querySelector('button[data-guide="dock-map"]');
            if (mapBtn && mapBtn.nextSibling) gameDock.insertBefore(tpBtn, mapBtn.nextSibling);
            else gameDock.appendChild(tpBtn);
            updateNavButtonAppearance();
        }
    }

    function injectConfigTab() {
        const cfgWindow = document.querySelector('.cfg-window');
        if (!cfgWindow || cfgWindow.querySelector('.cfg-tab-mods')) return;

        const cfgTabs = cfgWindow.querySelector('.cfg-tabs');
        const cfgBody = cfgWindow.querySelector('.cfg-body');
        if (!cfgTabs || !cfgBody) return;

        const modsTab = document.createElement('button');
        modsTab.className = 'cfg-tab cfg-tab-mods';
        modsTab.type = 'button';
        modsTab.textContent = 'Script Mods';

        let originalContent = cfgBody.querySelector('.cfg-original-content');
        if (!originalContent) {
            originalContent = document.createElement('div');
            originalContent.className = 'cfg-original-content';
            while (cfgBody.firstChild) originalContent.appendChild(cfgBody.firstChild);
            cfgBody.appendChild(originalContent);
        }

        let modsContent = cfgBody.querySelector('.cfg-mods-content');
        if (!modsContent) {
            modsContent = document.createElement('div');
            modsContent.className = 'cfg-mods-content';
            modsContent.style.display = 'none';
            cfgBody.appendChild(modsContent);
        }

        cfgTabs.appendChild(modsTab);

        function updateModsUI() {
            const mapActive = isScriptMapActive();
            const chatActiveState = isChatActive();
            const navMode = getNavTpMode();
            const dropMode = getDropMode();
            const sellConfirmItems = getSellConfirmItems();

            modsContent.innerHTML = `
                <div style="padding: 10px; display: flex; flex-direction: column; gap: 12px; background: #0c161f; border-radius: 8px;">
                    <div style="font-size: 16px; font-weight: bold; color: #63b3ed; border-bottom: 1px solid #1a2d3a; padding-bottom: 8px; margin-bottom: 4px;">Configurações do Mod</div>
                    
                    <div class="cfg-row" style="background: #14222d; padding: 10px; border-radius: 6px; border: 1px solid #1a2d3a; margin: 0;">
                        <div class="cfg-label" style="margin-bottom: 6px;">
                            <b style="color: #e2e8f0; font-size: 14px;">Simplified Map Mode</b>
                            <span style="color: #a0aec0; font-size: 11px;">Ativa a lista limpa ou restaura o mapa gráfico nativo</span>
                        </div>
                        <div class="cfg-seg" style="display: flex; gap: 4px;">
                            <button class="cfg-seg-btn ${mapActive ? 'on' : ''} btn-map-on" type="button" style="flex:1;">Ligado</button>
                            <button class="cfg-seg-btn ${!mapActive ? 'on' : ''} btn-map-off" type="button" style="flex:1;">Desligado</button>
                        </div>
                    </div>

                    <div class="cfg-row ${!mapActive ? 'mod-disabled' : ''}" id="sub-map-feature-row" style="background: #14222d; padding: 10px; border-radius: 6px; border: 1px solid #1a2d3a; margin: 0;">
                        <div class="cfg-label" style="margin-bottom: 6px;">
                            <b style="color: #e2e8f0; font-size: 14px;">Drops Preview Mode</b>
                            <span style="color: #a0aec0; font-size: 11px;">Como ver itens na lista do mapa</span>
                        </div>
                        <div class="cfg-seg" style="display: flex; gap: 4px;">
                            <button class="cfg-seg-btn ${dropMode === 'hover' ? 'on' : ''} btn-drop-hover" type="button" style="flex:1;">Hover</button>
                            <button class="cfg-seg-btn ${dropMode === 'icon' ? 'on' : ''} btn-drop-icon" type="button" style="flex:1;">Ícone (?)</button>
                            <button class="cfg-seg-btn ${dropMode === 'off' ? 'on' : ''} btn-drop-off" type="button" style="flex:1;">Oculto</button>
                        </div>
                    </div>

                    <div class="cfg-row" style="background: #14222d; padding: 10px; border-radius: 6px; border: 1px solid #1a2d3a; margin: 0;">
                        <div class="cfg-label" style="margin-bottom: 6px;">
                            <b style="color: #e2e8f0; font-size: 14px;">Nav Dock Button Action</b>
                            <span style="color: #a0aec0; font-size: 11px;">Ação do botão de teleport na barra do jogo</span>
                        </div>
                        <div class="cfg-seg" style="display: flex; gap: 4px;">
                            <button class="cfg-seg-btn ${navMode === 'fav' ? 'on' : ''} btn-nav-fav" type="button" style="flex:1;">★ Favorita</button>
                            <button class="cfg-seg-btn ${navMode === 'last' ? 'on' : ''} btn-nav-last" type="button" style="flex:1;">↺ Última</button>
                        </div>
                    </div>

                    <div class="cfg-row" style="background: #14222d; padding: 10px; border-radius: 6px; border: 1px solid #1a2d3a; margin: 0;">
                        <div class="cfg-label" style="margin-bottom: 6px;">
                            <b style="color: #e2e8f0; font-size: 14px;">Chat Interface</b>
                            <span style="color: #a0aec0; font-size: 11px;">Exibe ou oculta a janela de chat</span>
                        </div>
                        <div class="cfg-seg" style="display: flex; gap: 4px;">
                            <button class="cfg-seg-btn ${chatActiveState ? 'on' : ''} btn-chat-on" type="button" style="flex:1;">Exibir</button>
                            <button class="cfg-seg-btn ${!chatActiveState ? 'on' : ''} btn-chat-off" type="button" style="flex:1;">Ocultar</button>
                        </div>
                    </div>

                    <div class="cfg-row" style="background: #14222d; padding: 10px; border-radius: 6px; border: 1px solid #1a2d3a; margin: 0;">
                        <div class="cfg-label" style="margin-bottom: 6px;">
                            <b style="color: #e2e8f0; font-size: 14px;">Pokédex Fast Travel</b>
                            <span style="color: #a0aec0; font-size: 11px;">Exibe o toggle de Fast Travel na Pokédex</span>
                        </div>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 4px 0;">
                            <input type="checkbox" class="btn-dex-ft" ${isDexFastTravelActive() ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:#3182ce;">
                            <span style="color:#a0aec0; font-size:12px;">Habilitar ⚡ Fast Travel na Pokédex</span>
                        </label>
                    </div>

                    <div class="cfg-row" style="background: #14222d; padding: 10px; border-radius: 6px; border: 1px solid #1a2d3a; margin: 0;">
                        <div class="cfg-label" style="margin-bottom: 6px;">
                            <b style="color: #e2e8f0; font-size: 14px;">Select All Guards</b>
                            <span style="color: #a0aec0; font-size: 11px;">Proteções ao clicar em Select All nas abas</span>
                        </div>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 4px 0;">
                            <input type="checkbox" class="btn-guard-leg" ${isGuardLegendaryActive() ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:#3182ce;">
                            <span style="color:#a0aec0; font-size:12px;">Desmarcar Pokémons Lendários (Aba Pokémon)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 4px 0;">
                            <input type="checkbox" class="btn-guard-lock" ${isGuardSellLockActive() ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:#3182ce;">
                            <span style="color:#a0aec0; font-size:12px;">Desmarcar Itens com Cadeado (Aba Loja)</span>
                        </label>
                    </div>

                    <div class="cfg-row" style="background: #14222d; padding: 10px; border-radius: 6px; border: 1px solid #1a2d3a; margin: 0; display:flex; gap:12px; align-items:flex-start;">
                        <div class="cfg-label" style="flex:1;">
                            <b style="color: #e2e8f0; font-size: 14px;">Sell Confirmation Items</b>
                            <span style="color: #a0aec0; font-size: 11px; display:block; margin-top:4px;">Itens protegidos. Busque ao lado para adicionar.</span>
                        </div>
                        
                        <div id="cfg-sell-selected-list" style="flex:1; display:flex; flex-direction:column; gap:4px; max-height:120px; overflow-y:auto; padding-right:4px;">
                        </div>
                        
                        <div style="flex:1; position:relative; min-width:180px;">
                            <button type="button" id="cfg-sell-dd-btn" style="width:100%; text-align:left; background:#0c161f; color:#e2e8f0; border:1px solid #273f52; padding:6px 10px; border-radius:4px; cursor:pointer;">Selecionar Itens ▾</button>
                            <div id="cfg-sell-dropdown-menu" style="display:none; position:absolute; top:100%; right:0; width:100%; background:#14222d; border:1px solid #273f52; border-radius:4px; z-index:10; box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-top:4px; padding:6px; box-sizing:border-box;">
                                <input type="text" id="cfg-sell-search" placeholder="Buscar..." style="width:100%; box-sizing:border-box; background:#0c161f; color:#e2e8f0; border:1px solid #273f52; border-radius:4px; padding:6px; outline:none; margin-bottom:6px;">
                                <div id="cfg-sell-dropdown" style="max-height:150px; overflow-y:auto;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            modsContent.querySelector('.btn-nav-fav').addEventListener('click', () => { setNavTpMode('fav'); updateModsUI(); });
            modsContent.querySelector('.btn-nav-last').addEventListener('click', () => { setNavTpMode('last'); updateModsUI(); });

            modsContent.querySelector('.btn-drop-hover').addEventListener('click', () => { setDropMode('hover'); updateModsUI(); });
            modsContent.querySelector('.btn-drop-icon').addEventListener('click', () => { setDropMode('icon'); updateModsUI(); });
            modsContent.querySelector('.btn-drop-off').addEventListener('click', () => { setDropMode('off'); updateModsUI(); });

            modsContent.querySelector('.btn-map-on').addEventListener('click', () => {
                setScriptMapActive(true);
                document.getElementById('sub-map-feature-row').classList.remove('mod-disabled');
                updateModsUI();
            });
            modsContent.querySelector('.btn-map-off').addEventListener('click', () => {
                setScriptMapActive(false);
                document.getElementById('sub-map-feature-row').classList.add('mod-disabled');
                updateModsUI();
            });

            modsContent.querySelector('.btn-chat-on').addEventListener('click', () => { setChatActive(true); updateModsUI(); });
            modsContent.querySelector('.btn-chat-off').addEventListener('click', () => { setChatActive(false); updateModsUI(); });

            modsContent.querySelector('.btn-dex-ft').addEventListener('change', (e) => {
                setDexFastTravel(e.target.checked);
            });
            
            modsContent.querySelector('.btn-guard-leg').addEventListener('change', (e) => {
                setGuardLegendary(e.target.checked);
            });
            modsContent.querySelector('.btn-guard-lock').addEventListener('change', (e) => {
                setGuardSellLock(e.target.checked);
            });

            const selectedListEl = modsContent.querySelector('#cfg-sell-selected-list');
            const ddBtn = modsContent.querySelector('#cfg-sell-dd-btn');
            const ddMenu = modsContent.querySelector('#cfg-sell-dropdown-menu');
            const searchInputEl = modsContent.querySelector('#cfg-sell-search');
            const dropdownEl = modsContent.querySelector('#cfg-sell-dropdown');

            ddBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ddMenu.style.display = ddMenu.style.display === 'none' ? 'block' : 'none';
                if (ddMenu.style.display === 'block') {
                    renderDropdown();
                    searchInputEl.focus();
                }
            });

            document.addEventListener('click', (e) => {
                if (!ddMenu.contains(e.target) && e.target !== ddBtn) {
                    ddMenu.style.display = 'none';
                }
            });

            let uniqueItems = null;

            function initUniqueItems() {
                if (uniqueItems) return;
                uniqueItems = [];
                const seenNames = new Set();
                for (const item of globalItemApiData.values()) {
                    const name = item.name || item.title;
                    if (name && !seenNames.has(name)) {
                        seenNames.add(name);
                        uniqueItems.push(item);
                    }
                }
                uniqueItems.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title));
            }

            function renderSelected() {
                const items = getSellConfirmItems();
                selectedListEl.innerHTML = '';
                if (items.length === 0) {
                    selectedListEl.innerHTML = '<span style="color:#718096; font-size:12px; margin:auto;">Nenhum item protegido</span>';
                } else {
                    items.forEach(itemName => {
                        const iconHTML = resolveItemIcon(itemName);
                        const tag = document.createElement('div');
                        tag.style = 'display:flex; justify-content:space-between; align-items:center; background:#1a2d3a; border:1px solid #2b4c66; padding:4px 8px; border-radius:4px; font-size:12px;';
                        
                        const leftDiv = document.createElement('div');
                        leftDiv.style = 'display:flex; align-items:center; gap:6px; color:#e2e8f0;';
                        leftDiv.innerHTML = `${iconHTML} <span>${itemName}</span>`;
                        
                        const rmBtn = document.createElement('span');
                        rmBtn.innerHTML = '×';
                        rmBtn.style = 'cursor:pointer; color:#f56565; font-weight:bold; font-size:14px;';
                        rmBtn.addEventListener('click', () => {
                            setSellConfirmItems(items.filter(i => i !== itemName));
                            renderSelected();
                            if (ddMenu.style.display === 'block') renderDropdown();
                        });
                        
                        tag.appendChild(leftDiv);
                        tag.appendChild(rmBtn);
                        selectedListEl.appendChild(tag);
                    });
                }
            }

            function renderDropdown() {
                initUniqueItems();
                const query = searchInputEl.value.toLowerCase().trim();
                const selectedItems = getSellConfirmItems();
                dropdownEl.innerHTML = '';
                
                const filtered = query ? uniqueItems.filter(item => (item.name || item.title).toLowerCase().includes(query)) : uniqueItems;
                const toShow = filtered.slice(0, 50);

                if (toShow.length === 0) {
                    dropdownEl.innerHTML = '<div style="padding:6px; color:#718096; font-size:12px; text-align:center;">Nenhum item encontrado</div>';
                    return;
                }
                
                toShow.forEach(item => {
                    const itemName = item.name || item.title;
                    const isChecked = selectedItems.includes(itemName);
                    const iconHTML = resolveItemIcon(itemName);
                    
                    const row = document.createElement('label');
                    row.style = 'display:flex; align-items:center; padding:6px 10px; cursor:pointer; border-bottom:1px solid #1a2d3a; font-size:13px;';
                    row.addEventListener('mouseenter', () => row.style.background = '#14222d');
                    row.addEventListener('mouseleave', () => row.style.background = 'transparent');
                    
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.checked = isChecked;
                    cb.style.marginRight = '8px';
                    cb.addEventListener('change', () => {
                        let current = getSellConfirmItems();
                        if (cb.checked && !current.includes(itemName)) current.push(itemName);
                        else if (!cb.checked) current = current.filter(i => i !== itemName);
                        setSellConfirmItems(current);
                        renderSelected();
                    });
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = itemName;
                    nameSpan.style.color = '#e2e8f0';
                    
                    row.appendChild(cb);
                    row.insertAdjacentHTML('beforeend', iconHTML);
                    row.appendChild(nameSpan);
                    dropdownEl.appendChild(row);
                });
            }

            searchInputEl.addEventListener('input', renderDropdown);
            renderSelected();
        }

        const tabsList = Array.from(cfgTabs.querySelectorAll('.cfg-tab'));
        tabsList.forEach(tab => {
            tab.addEventListener('click', () => {
                tabsList.forEach(t => t.classList.remove('on'));
                tab.classList.add('on');
                if (tab.classList.contains('cfg-tab-mods')) {
                    originalContent.style.display = 'none';
                    modsContent.style.display = 'block';
                    updateModsUI();
                } else {
                    modsContent.style.display = 'none';
                    originalContent.style.display = 'block';
                }
            });
        });
    }

    function buildSimpleList() {
        if (!isScriptMapActive() || isRendering) return;
        isRendering = true;

        try {
            const mapWindow = document.querySelector('.map-window');
            const mapBody = document.querySelector('.map-body');

            if (!mapWindow || !mapBody) { isRendering = false; return; }

            let customFilterBar = document.getElementById('custom-hunts-filter-bar');
            if (!customFilterBar) {
                customFilterBar = document.createElement('div');
                customFilterBar.id = 'custom-hunts-filter-bar';
                customFilterBar.style = `
                    display: flex; gap: 8px; margin-top: 8px; margin-bottom: 4px; font-size: 13px;
                `;
                
                                customFilterBar.innerHTML = `
                    <select id="sort-hunts-select" style="background:#0c161f; color:#cbd5e0; border:1px solid #1a2d3a; padding:6px 10px; border-radius:6px; outline:none; flex-grow:1; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3); font-family: inherit; cursor: pointer;">
                        <option value="price_desc">Preço: Maior -> Menor</option>
                        <option value="price_asc">Preço: Menor -> Maior</option>
                        <option value="eff_desc">Efetividade: Maior Vantagem</option>
                        <option value="xp_desc">Somente XP: Maior XP</option>
                    </select>
                `;
                mapBody.appendChild(customFilterBar);

                document.getElementById('sort-hunts-select').addEventListener('change', () => { isRendering = false; buildSimpleList(); });
            }

            let simpleContainer = document.getElementById('simple-hunts-container');
            if (!simpleContainer) {
                simpleContainer = document.createElement('div');
                simpleContainer.id = 'simple-hunts-container';
                simpleContainer.style = `
                    width: 100%; max-height: 480px; overflow-y: auto; background: #0d161d;
                    border: 1px solid #1a2d3a; border-radius: 6px; padding: 12px;
                    box-sizing: border-box; font-family: sans-serif; margin-top: 6px;
                `;
                mapBody.appendChild(simpleContainer);
            }

            simpleContainer.innerHTML = '';
            if (mapWindow.classList.contains('invisible-check')) { isRendering = false; return; }

            const searchInput = document.querySelector('.map-filter-q');
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

            const markers = Array.from(document.querySelectorAll('.hunt-marker'));
            const favorites = getFavorites();
            const activePkmn = getActivePokemonName();
            const activePkmnTypes = POKEMON_TYPES[activePkmn] || ["normal"];

            let huntDataList = [];

            markers.forEach(marker => {
                const styleAttr = marker.getAttribute('style') || '';
                if (styleAttr.includes('display: none') || styleAttr.includes('opacity: 0')) return;

                const nameEl = marker.querySelector('.hunt-name');
                const lvlEl = marker.querySelector('.hunt-lvl');
                const iconDiv = marker.querySelector('.hunt-circle div[style*="background-image"]');

                const name = nameEl ? nameEl.textContent.trim() : 'Sem Nome';
                const lvlText = lvlEl ? lvlEl.textContent.trim() : 'Nv 1';
                const isHere = marker.classList.contains('here');

                if (isHere) saveLastHunt(name);

                const details = extractHuntDetailsFromJSON(name, marker);
                const defenderTypes = getDefenderTypes(name);
                const effectiveness = getOffensiveMultiplier(activePkmnTypes, defenderTypes);
                const xpEfficiency = (details.experience && effectiveness) ? details.experience / effectiveness : Infinity;

                huntDataList.push({
                    name, lvlText, isHere,
                    sellsFor: details.sellsFor,
                    numericPrice: details.numericPrice,
                    dropsHTML: details.dropsHTML,
                    experience: details.experience,
                    expText: details.expText,
                    effectiveness,
                    defenderTypes,
                    iconStyle: iconDiv ? (iconDiv.getAttribute('style') || '') : '',
                    originalElement: marker,
                    xpEfficiency
                });
            });

            if (query) {
                huntDataList = huntDataList.filter(hunt => hunt.name.toLowerCase().includes(query));
            }

            const sortVal = document.getElementById('sort-hunts-select') ? document.getElementById('sort-hunts-select').value : 'price_desc';
            huntDataList.sort((a, b) => {
                const aFav = favorites.includes(a.name);
                const bFav = favorites.includes(b.name);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;

                if (sortVal === 'price_desc') return b.numericPrice - a.numericPrice;
                if (sortVal === 'price_asc') return a.numericPrice - b.numericPrice;
                if (sortVal === 'eff_desc') {
                    if (b.effectiveness !== a.effectiveness) return b.effectiveness - a.effectiveness;
                    const lvlA = parseInt(a.lvlText.replace(/\D/g, '')) || 0;
                    const lvlB = parseInt(b.lvlText.replace(/\D/g, '')) || 0;
                    return lvlB - lvlA;
                }
                if (sortVal === 'xp_desc') {
                    if (b.experience !== a.experience) return b.experience - a.experience;
                    return b.effectiveness - a.effectiveness;
                }
                return a.name.localeCompare(b.name);
            });

            if (huntDataList.length === 0) {
                simpleContainer.innerHTML = `<div style="color: #718096; text-align: center; padding: 20px;">Nenhuma hunt encontrada.</div>`;
                isRendering = false;
                return;
            }

            const dropMode = getDropMode();

            huntDataList.forEach(hunt => {
                const isFav = favorites.includes(hunt.name);
                const row = document.createElement('div');
                row.style = `
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 10px 14px; margin-bottom: 8px;
                    background: ${hunt.isHere ? '#163126' : '#14222d'};
                    border-left: 4px solid ${hunt.isHere ? '#4caf50' : (isFav ? '#3182ce' : '#273f52')};
                    border-radius: 4px; color: #e2e8f0; font-size: 14px; cursor: pointer; position: relative;
                `;

                const spriteContainer = document.createElement('div');
                spriteContainer.style = `
                    width: 42px; height: 42px; min-width: 42px; overflow: hidden; display: flex;
                    align-items: center; justify-content: center; background: #1c3040; border-radius: 50%; margin-right: 14px;
                `;

                if (hunt.iconStyle) {
                    const sprite = document.createElement('div');
                    sprite.style = hunt.iconStyle;
                    spriteContainer.appendChild(sprite);
                }

                let bottomInfoHTML = '';
                if (hunt.sellsFor !== 'Indisponível' || hunt.expText) {
                    let priceHTML = '';
                    if (hunt.sellsFor === 'Não pode ser vendido') priceHTML = `<span>${hunt.sellsFor}</span>`;
                    else if (hunt.sellsFor !== 'Indisponível') priceHTML = `<span>Valor: ${hunt.sellsFor}</span>`;
                    
                    bottomInfoHTML = `
                        <div style="font-size: 12px; color: #48bb78; margin-top: 3px; font-weight: 500; display: flex; gap: 10px;">
                            ${priceHTML}
                            ${hunt.expText ? `<span style="color: #ed8936;">${hunt.expText}</span>` : ''}
                        </div>
                    `;
                }

                const typeBadgesHTML = hunt.defenderTypes.map(t => 
                    `<span style="font-size: 10px; background: #2d3748; color: #cbd5e0; padding: 1px 5px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${t}</span>`
                ).join(' ');

                const infoDiv = document.createElement('div');
                infoDiv.style = 'flex-grow: 1; margin-right: 12px;';
                infoDiv.innerHTML = `
                    <div style="font-weight: bold; color: ${isFav ? '#3182ce' : '#fff'}; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        ${hunt.name}
                        <span style="font-size: 11px; background: #243b4d; padding: 2px 6px; border-radius: 4px; color: #cbd5e0;">
                            ${hunt.lvlText}
                        </span>
                        <span style="font-size: 11px; background: #1a365d; color: #63b3ed; padding: 2px 6px; border-radius: 4px;">
                            ${hunt.effectiveness > 1 ? `⚡ ${hunt.effectiveness}x` : `${hunt.effectiveness}x`}
                        </span>
                        ${typeBadgesHTML}
                        ${hunt.isHere ? '<span style="font-size: 11px; color: #4caf50; font-weight: bold;">[Aqui]</span>' : ''}
                    </div>
                    ${bottomInfoHTML}
                `;

                if (dropMode === 'hover' && hunt.dropsHTML) {
                    row.addEventListener('mouseenter', (e) => showDropTooltip(e, hunt.dropsHTML));
                    row.addEventListener('mouseleave', hideDropTooltip);
                }

                row.addEventListener('click', (e) => {
                    if (e.target.closest('button')) return;
                    saveLastHunt(hunt.name);
                    teleportToTarget(hunt.name);
                });

                const actionContainer = document.createElement('div');
                actionContainer.style = 'display: flex; align-items: center;';

                if (dropMode === 'icon' && hunt.dropsHTML) {
                    const iconBtn = document.createElement('button');
                    iconBtn.type = 'button';
                    iconBtn.className = 'drop-icon-btn';
                    iconBtn.innerHTML = '?';
                    iconBtn.addEventListener('mouseenter', (e) => showDropTooltip(e, hunt.dropsHTML));
                    iconBtn.addEventListener('mouseleave', hideDropTooltip);
                    actionContainer.appendChild(iconBtn);
                }

                const favBtn = document.createElement('button');
                favBtn.type = 'button';
                favBtn.innerHTML = isFav ? '★' : '☆';
                favBtn.style = `
                    background: none; border: none; color: ${isFav ? '#3182ce' : '#4a5568'};
                    font-size: 20px; cursor: pointer; padding: 4px 8px; outline: none;
                `;
                favBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(hunt.name);
                });

                actionContainer.appendChild(favBtn);

                row.appendChild(spriteContainer);
                row.appendChild(infoDiv);
                row.appendChild(actionContainer);
                simpleContainer.appendChild(row);
            });

        } catch (e) {
            console.error("Erro no Simplificador de Mapa: ", e);
        } finally {
            isRendering = false;
        }
    }

    let activeTooltip = null;
    function showDropTooltip(e, dropsHTML) {
        hideDropTooltip();
        activeTooltip = document.createElement('div');
        activeTooltip.className = 'hunt-drop-tooltip';
        activeTooltip.innerHTML = `<div style="font-weight:bold; color:#48bb78; margin-bottom:8px; border-bottom:1px solid #1a2d3a; padding-bottom:4px; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Drops da Hunt:</div><div>${dropsHTML}</div>`;
        document.body.appendChild(activeTooltip);

        const rect = e.target.getBoundingClientRect();
        activeTooltip.style.top = `${rect.bottom + window.scrollY + 6}px`;
        activeTooltip.style.left = `${rect.left + window.scrollX}px`;
    }

    function hideDropTooltip() {
        if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
    }

    let renderTimeout = null;

    function showSellConfirm(itemNames, callback) {
        if (!itemNames || itemNames.length === 0) return callback(true);
        
        const backdrop = document.createElement('div');
        backdrop.className = 'sell-confirm-backdrop';
        backdrop.innerHTML = `
            <div class="sell-confirm-modal">
                <div class="sell-confirm-title">⚠️ Confirmar Venda</div>
                <div class="sell-confirm-body">
                    <p>Você está prestes a vender os seguintes itens de alto valor:</p>
                    <div class="sell-confirm-items">
                        ${itemNames.map(n => `<div>• ${n}</div>`).join('')}
                    </div>
                    <div class="sell-confirm-footer">
                        <button class="sell-confirm-btn yes" type="button">✅ Confirmar Venda</button>
                        <button class="sell-confirm-btn no" type="button">❌ Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);
        
        backdrop.querySelector('.yes').addEventListener('click', () => {
            backdrop.remove();
            callback(true);
        });
        backdrop.querySelector('.no').addEventListener('click', () => {
            backdrop.remove();
            callback(false);
        });
    }

    function getPokemonRarity(row) {
        const span = row.querySelector('.mk-meta span');
        if (!span) return null;
        return span.textContent.trim().toLowerCase();
    }

    function injectShopEnhancements() {
        const mkWindow = document.querySelector('.win-window.mk-window');
        if (!mkWindow) return;
        
        // 1. Sell Tab: Locks & Intercept Sell
        const isSellTab = !!Array.from(mkWindow.querySelectorAll('.mk-tab')).find(t => t.classList.contains('on') && t.textContent.includes('Sell'));
        if (isSellTab) {
            const locks = getSellLocks();
            const guardActive = isGuardSellLockActive();
            mkWindow.querySelectorAll('.mk-srow-head').forEach(row => {
                if (row.querySelector('.mk-lock')) return;
                const priceSpan = row.querySelector('.mk-price');
                const nameEl = row.querySelector('.mk-name');
                const itemName = nameEl ? nameEl.textContent.trim() : '';
                if (priceSpan) {
                    const lockBtn = document.createElement('button');
                    lockBtn.type = 'button';
                    const initLocked = locks.includes(itemName);
                    lockBtn.className = `mk-lock${initLocked ? ' on' : ''}`;
                    lockBtn.title = initLocked ? 'Unlock — release for selling' : 'Lock — protect from selling';
                    lockBtn.setAttribute('aria-label', initLocked ? 'Unlock Item' : 'Lock Item');
                    lockBtn.innerHTML = initLocked ? '🔒' : '🔓';
                    
                    if (initLocked) {
                        row.classList.add('locked');
                        const cb = row.querySelector('input.mk-check');
                        if (cb) {
                            if (cb.checked) cb.click();
                            if (guardActive) cb.setAttribute('disabled', '');
                        }
                    }

                    lockBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const isLocked = row.classList.toggle('locked');
                        lockBtn.className = `mk-lock${isLocked ? ' on' : ''}`;
                        lockBtn.title = isLocked ? 'Unlock — release for selling' : 'Lock — protect from selling';
                        lockBtn.setAttribute('aria-label', isLocked ? 'Unlock Item' : 'Lock Item');
                        lockBtn.innerHTML = isLocked ? '🔒' : '🔓';
                        
                        if (isLocked) addSellLock(itemName); else removeSellLock(itemName);
                        
                        const cb = row.querySelector('input.mk-check');
                        if (cb) {
                            if (isLocked) {
                                if (cb.checked) cb.click();
                                if (guardActive) cb.setAttribute('disabled', '');
                            } else {
                                cb.removeAttribute('disabled');
                            }
                        }
                    });
                    
                    row.appendChild(lockBtn);
                }
            });
            
            // Hijack Select All to respect our custom locks
            const sellSelectAll = mkWindow.querySelector('button.mk-selall');
            if (sellSelectAll && !sellSelectAll.dataset.sellLockIntercepted) {
                sellSelectAll.addEventListener('click', (e) => {
                    if (!isGuardSellLockActive()) return;
                    e.stopImmediatePropagation();
                    e.stopPropagation();

                    const allRows = Array.from(mkWindow.querySelectorAll('.mk-srow-head'));
                    const unlockedRows = allRows.filter(r => !r.classList.contains('locked'));
                    
                    const anyUnchecked = unlockedRows.some(r => {
                        const cb = r.querySelector('input.mk-check');
                        return cb && !cb.checked;
                    });

                    unlockedRows.forEach(r => {
                        const cb = r.querySelector('input.mk-check');
                        if (cb) {
                            if (anyUnchecked && !cb.checked) cb.click();
                            else if (!anyUnchecked && cb.checked) cb.click();
                        }
                    });
                    
                    sellSelectAll.textContent = anyUnchecked ? '☑ Deselect all' : '☐ Select all';
                }, true); // Important: capture phase!
                sellSelectAll.dataset.sellLockIntercepted = 'true';
            }
            
            // Intercept Sell CTA via event delegation on the sellbar
            const sellBar = mkWindow.querySelector('.mk-sellbar');
            if (sellBar && !sellBar.dataset.sellIntercepted) {
                let sellConfirmed = false;
                sellBar.addEventListener('click', (e) => {
                    const sellBtn = e.target.closest('button.mk-sell');
                    if (!sellBtn || sellBtn.disabled) return;
                    
                    // If we already confirmed, let it through
                    if (sellConfirmed) {
                        sellConfirmed = false;
                        return;
                    }
                    
                    const confirmList = getSellConfirmItems();
                    const selectedToConfirm = [];
                    mkWindow.querySelectorAll('.mk-srow-head').forEach(row => {
                        const cb = row.querySelector('input.mk-check');
                        if (cb && cb.checked) {
                            const nameEl = row.querySelector('.mk-name');
                            const itemName = nameEl ? nameEl.textContent.trim() : '';
                            if (confirmList.includes(itemName)) {
                                selectedToConfirm.push(itemName);
                            }
                        }
                    });
                    
                    if (selectedToConfirm.length > 0) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        showSellConfirm(selectedToConfirm, (confirmed) => {
                            if (confirmed) {
                                sellConfirmed = true;
                                sellBtn.click();
                            }
                        });
                    }
                }, true); // capture phase – runs before React's handler
                sellBar.dataset.sellIntercepted = 'true';
            }
        }
        
        const isPokeTab = !!Array.from(mkWindow.querySelectorAll('.mk-tab')).find(t => t.classList.contains('on') && t.textContent.includes('Pokémon'));
        if (isPokeTab) {
            const selectAllBtn = mkWindow.querySelector('button.mk-selall');
            if (selectAllBtn && !selectAllBtn.dataset.intercepted) {
                selectAllBtn.addEventListener('click', () => {
                    if (!isGuardLegendaryActive()) return;
                    let ticks = 0;
                    const interval = setInterval(() => {
                        mkWindow.querySelectorAll('.mk-srow-head').forEach(row => {
                            const rarity = getPokemonRarity(row);
                            const forbidden = ['lendária', 'mítica', 'divina'];
                            if (rarity && forbidden.some(r => rarity.includes(r))) {
                                const cb = row.querySelector('input.mk-check');
                                if (cb && cb.checked) cb.click();
                            }
                        });
                        ticks++;
                        if (ticks > 5) clearInterval(interval);
                    }, 20);
                });
                selectAllBtn.dataset.intercepted = 'true';
            }
        }
    }

    function injectDexEnhancements() {
        const dexWindow = document.querySelector('.dex-window');
        if (!dexWindow) return;

        // If a dex-cell-detail is open (pokemon detail page), grid won't be present
        const grid = dexWindow.querySelector('.dex-grid');
        if (!grid) {
            // Remove stale controls if grid is gone (user opened a pokemon page)
            const stale = dexWindow.querySelector('.dex-script-controls');
            if (stale) stale.remove();
            return;
        }

        if (dexWindow.querySelector('.dex-script-controls')) return;

        const dexControls = dexWindow.querySelector('.dex-controls');
        if (!dexControls) return;

        const ftEnabled = isDexFastTravelActive();

        const bar = document.createElement('div');
        bar.className = 'dex-script-controls';
        bar.innerHTML = `
            <button class="dex-fbtn on" data-filter="all" type="button">Todos</button>
            <button class="dex-fbtn" data-filter="caught" type="button">✓ Caught</button>
            <button class="dex-fbtn" data-filter="notcaught" type="button">✗ Not Caught</button>
            <button class="dex-fbtn" data-filter="sort-value" type="button" style="display:none;">💰 Menor Valor</button>
            ${ftEnabled ? '<label class="dex-ft-label"><input type="checkbox" class="dex-ft-check"> ⚡ Fast Travel</label>' : ''}
        `;
        dexControls.after(bar);

        const filterBtns = bar.querySelectorAll('.dex-fbtn[data-filter]');
        const sortBtn = bar.querySelector('.dex-fbtn[data-filter="sort-value"]');
        let currentFilter = 'all';
        let sortedByValue = false;
        let originalOrder = null;

        function applyFilter() {
            const cells = grid.querySelectorAll('.dex-cell');
            cells.forEach(cell => {
                const isCaught = cell.classList.contains('caught');
                if (currentFilter === 'all') {
                    cell.classList.remove('dex-hidden');
                } else if (currentFilter === 'caught') {
                    cell.classList.toggle('dex-hidden', !isCaught);
                } else if (currentFilter === 'notcaught') {
                    cell.classList.toggle('dex-hidden', isCaught);
                }
            });
        }

        function getPokeValue(name) {
            const cleanName = name.toLowerCase().trim();
            if (globalCreatureApiData.has(cleanName)) {
                const pokeObj = globalCreatureApiData.get(cleanName);
                const possiblePriceKeys = ['sellValue', 'priceNpc', 'sell', 'sellsFor', 'price', 'value', 'gold', 'money', 'cost', 'reward'];
                for (const key of possiblePriceKeys) {
                    if (pokeObj[key] !== undefined && pokeObj[key] !== null && pokeObj[key] !== '') {
                        const parsed = parseInt(String(pokeObj[key]).replace(/\D/g, ''), 10);
                        if (!isNaN(parsed) && parsed > 0) return parsed;
                    }
                }
            }
            return 999999;
        }

        function sortByValue() {
            if (!originalOrder) {
                originalOrder = Array.from(grid.children);
            }
            const cells = Array.from(grid.querySelectorAll('.dex-cell'));
            cells.sort((a, b) => {
                const nameA = a.querySelector('.dex-cell-name')?.textContent || '';
                const nameB = b.querySelector('.dex-cell-name')?.textContent || '';
                return getPokeValue(nameA) - getPokeValue(nameB);
            });
            cells.forEach(c => grid.appendChild(c));
            sortedByValue = true;
        }

        function restoreOrder() {
            if (originalOrder) {
                originalOrder.forEach(c => grid.appendChild(c));
                sortedByValue = false;
            }
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                if (filter === 'sort-value') {
                    if (sortedByValue) {
                        restoreOrder();
                        btn.classList.remove('on');
                    } else {
                        sortByValue();
                        btn.classList.add('on');
                    }
                    applyFilter();
                    return;
                }
                currentFilter = filter;
                filterBtns.forEach(b => {
                    if (b.dataset.filter !== 'sort-value') b.classList.remove('on');
                });
                btn.classList.add('on');

                if (filter === 'notcaught') {
                    sortBtn.style.display = '';
                } else {
                    sortBtn.style.display = 'none';
                    if (sortedByValue) {
                        restoreOrder();
                        sortBtn.classList.remove('on');
                    }
                }
                applyFilter();
            });
        });

        // Fast Travel: intercept clicks on dex-cell
        const ftCheck = bar.querySelector('.dex-ft-check');
        if (ftCheck) {
            grid.addEventListener('click', (e) => {
                if (!ftCheck.checked) return;
                const cell = e.target.closest('.dex-cell');
                if (!cell) return;
                e.stopPropagation();
                e.preventDefault();
                const pokeName = cell.querySelector('.dex-cell-name')?.textContent?.trim();
                if (!pokeName) return;
                teleportToTarget(pokeName);
            }, true);
        }
    }

    let lastHuntSnapshot = null;
    let currentHuntSnapshot = null;
    let lastCatchTimestamp = null;
    let ballsAtLastCatch = 0;
    let capturesCount = 0;
    let lastHuntStartTime = null;
    let currentHuntStartTime = Date.now();

    function formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    }

    function showCompareModal() {
        const curr = currentHuntSnapshot || { defeated: 0, timeText: '0s', balance: 0, balHour: 0, xpHour: 0, killsHour: 0, xpGained: 0, locName: 'Nenhuma' };
        const last = lastHuntSnapshot || { defeated: 0, timeText: '0s', balance: 0, balHour: 0, xpHour: 0, killsHour: 0, xpGained: 0, locName: 'Nenhuma' };

        const cmp = (a, b) => {
            if (a > b) return ['ha-compare-winner', 'ha-compare-loser'];
            if (b > a) return ['ha-compare-loser', 'ha-compare-winner'];
            return ['', ''];
        };

        const formatTitle = (ts, loc) => {
            let res = loc ? loc : 'Hunt';
            if (ts) {
                const d = new Date(ts);
                res += ` (${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')})`;
            }
            return res;
        };
        const lastTitle = formatTitle(lastHuntStartTime, last.locName);
        const currTitle = formatTitle(currentHuntStartTime, curr.locName);

        const [balLast, balCurr] = cmp(last.balance, curr.balance);
        const [balhLast, balhCurr] = cmp(last.balHour, curr.balHour);
        const [xpLast, xpCurr] = cmp(last.xpHour, curr.xpHour);
        const [killsLast, killsCurr] = cmp(last.killsHour, curr.killsHour);
        const [xpgLast, xpgCurr] = cmp(last.xpGained, curr.xpGained);

        const formatBal = (val) => val < 0 ? `-$${formatNumber(Math.abs(val))}` : `$${formatNumber(val)}`;

        const backdrop = document.createElement('div');
        backdrop.className = 'ha-compare-backdrop';
        backdrop.innerHTML = `
            <div class="ha-window ha-compare-modal" style="position: relative; box-shadow: 0 12px 32px rgba(0,0,0,0.8);">
                <div class="ha-title">
                    <span>⚖️ Comparação de Hunts</span>
                    <button class="ha-x ha-compare-close" aria-label="Close" type="button">×</button>
                </div>
                <div style="padding: 12px;">
                    <table class="ha-compare-table">
                        <tr><th>Métrica</th><th>${lastTitle}</th><th>${currTitle}</th></tr>
                        <tr><td>💰 Balance Total</td><td class="${balLast}">${formatBal(last.balance)}</td><td class="${balCurr}">${formatBal(curr.balance)}</td></tr>
                        <tr><td>📉 Balance/h</td><td class="${balhLast}">${formatBal(last.balHour)}</td><td class="${balhCurr}">${formatBal(curr.balHour)}</td></tr>
                        <tr><td>🌟 XP Gained</td><td class="${xpgLast}">${formatNumber(last.xpGained)}</td><td class="${xpgCurr}">${formatNumber(curr.xpGained)}</td></tr>
                        <tr><td>✨ XP/h</td><td class="${xpLast}">${formatNumber(last.xpHour)}</td><td class="${xpCurr}">${formatNumber(curr.xpHour)}</td></tr>
                        <tr><td>⚔️ Kills/h</td><td class="${killsLast}">${formatNumber(last.killsHour)}</td><td class="${killsCurr}">${formatNumber(curr.killsHour)}</td></tr>
                        <tr><td>⏱️ Tempo</td><td>${last.timeText}</td><td>${curr.timeText}</td></tr>
                        <tr><td>💀 Defeated</td><td>${last.defeated}</td><td>${curr.defeated}</td></tr>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        // Make modal draggable
        let isDragging = false, startX, startY, initialX = 0, initialY = 0;
        const modal = backdrop.querySelector('.ha-compare-modal');
        const titleBar = modal.querySelector('.ha-title');
        
        titleBar.addEventListener('mousedown', e => {
            if (e.target.closest('.ha-compare-close')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            modal.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
        });
        document.addEventListener('mouseup', e => {
            if (!isDragging) return;
            isDragging = false;
            initialX += e.clientX - startX;
            initialY += e.clientY - startY;
        });

        backdrop.querySelector('.ha-compare-close').addEventListener('click', () => backdrop.remove());
    }

    function trackHuntAnalyzer() {
        const haWindow = document.querySelector('.ha-window:not(.ha-compare-modal)');
        if (!haWindow) return;

        const getCardVal = (idx) => {
            const card = haWindow.querySelectorAll('.ha-card b')[idx];
            return card ? parseInt(card.textContent.replace(/[^0-9]/g, ''), 10) || 0 : 0;
        };
        const defeated = getCardVal(0);
        const timeText = haWindow.querySelectorAll('.ha-card b')[1]?.textContent || '0s';
        const xpGained = getCardVal(2);
        
        const balanceNode = haWindow.querySelector('.ha-balance b');
        let balance = 0;
        if (balanceNode) {
            balance = parseInt(balanceNode.textContent.replace(/−/g, '-').replace(/[.]/g, '').replace(/[^0-9-]/g, ''), 10) || 0;
        }

        const catchCard = haWindow.querySelector('.ha-catch b');
        const currentCatch = catchCard ? parseInt(catchCard.textContent.replace(/[^0-9]/g, ''), 10) || 0 : 0;
        
        let currentBalls = 0;
        const supplyCard = haWindow.querySelector('.ha-supply small');
        if (supplyCard) {
            const match = supplyCard.textContent.match(/(\d+)\s+balls/);
            if (match) currentBalls = parseInt(match[1], 10);
        }

        const isReset = currentHuntSnapshot && defeated < currentHuntSnapshot.defeated;
        
        if (isReset) {
            lastHuntSnapshot = { ...currentHuntSnapshot };
            capturesCount = 0;
            lastCatchTimestamp = null;
            ballsAtLastCatch = 0;
            lastHuntStartTime = currentHuntStartTime;
            currentHuntStartTime = Date.now();
        }

        let locName = currentHuntSnapshot ? currentHuntSnapshot.locName : '';
        if (!locName || isReset) {
            const tloc = document.querySelector('.phud-tloc');
            if (tloc) {
                const parts = tloc.textContent.split('·');
                if (parts.length > 1) locName = parts[1].trim();
            }
        }

        if (currentCatch > capturesCount) {
            capturesCount = currentCatch;
            lastCatchTimestamp = Date.now();
            ballsAtLastCatch = currentBalls;
        }

        const ratesNode = haWindow.querySelector('.ha-rates');
        let balHour = 0, xpHour = 0, killsHour = 0;
        if (ratesNode) {
            const spans = ratesNode.querySelectorAll('span:not(.ha-catch-stats)');
            if (spans[0]) balHour = parseInt(spans[0].textContent.replace(/−/g, '-').replace(/[.]/g, '').replace(/[^0-9-]/g, ''), 10) || 0;
            if (spans[1]) xpHour = parseInt(spans[1].textContent.replace(/[.]/g, '').replace(/[^0-9]/g, ''), 10) || 0;
            if (spans[2]) killsHour = parseInt(spans[2].textContent.replace(/[.]/g, '').replace(/[^0-9]/g, ''), 10) || 0;

            let catchStats = ratesNode.querySelector('.ha-catch-stats');
            if (!catchStats) {
                catchStats = document.createElement('span');
                catchStats.className = 'ha-rate ha-catch-stats';
                ratesNode.appendChild(catchStats);
            }
            if (lastCatchTimestamp) {
                const diffMs = Date.now() - lastCatchTimestamp;
                const diffM = Math.floor(diffMs / 60000);
                const timeStr = diffM > 0 ? `há ${diffM}m` : 'agora';
                const dateStr = new Date(lastCatchTimestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const ballsSpent = currentBalls - ballsAtLastCatch;
                const newText = `🔴 Último catch: ${dateStr} (${timeStr}) • ${ballsSpent} balls`;
                if (catchStats.textContent !== newText) {
                    catchStats.textContent = newText;
                }
                catchStats.classList.remove('hidden');
            } else {
                const newText = `🔴 Nenhum catch nesta hunt`;
                if (catchStats.textContent !== newText) {
                    catchStats.textContent = newText;
                }
                catchStats.classList.remove('hidden');
            }
        }

        const snapshot = { defeated, timeText, balance, balHour, xpHour, killsHour, xpGained, locName };
        currentHuntSnapshot = snapshot;

        const oldToggle = haWindow.querySelector('.ha-title .ha-btn-toggle-view');
        if (oldToggle) oldToggle.remove();

        let actionArea = haWindow.querySelector('.ha-script-actions');
        let isNewActionArea = false;
        if (!actionArea) {
            actionArea = document.createElement('div');
            actionArea.className = 'ha-script-actions';
            isNewActionArea = true;
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'ha-sbtn btn-toggle-view';
            toggleBtn.innerHTML = haWindow.classList.contains('ha-compact') ? '⤢ Expandir' : '⤡ Reduzir';
            toggleBtn.type = 'button';
            toggleBtn.addEventListener('click', () => {
                const isCompact = haWindow.classList.toggle('ha-compact');
                toggleBtn.innerHTML = isCompact ? '⤢ Expandir' : '⤡ Reduzir';
            });

            const dropBtn = document.createElement('button');
            dropBtn.className = 'ha-sbtn btn-show-drops';
            dropBtn.innerHTML = '📦 Drops';
            dropBtn.type = 'button';
            dropBtn.addEventListener('click', () => {
                const drops = haWindow.querySelector('.ha-drops');
                if (drops) drops.classList.toggle('show-drops');
            });

            const compareBtn = document.createElement('button');
            compareBtn.className = 'ha-sbtn btn-compare';
            compareBtn.innerHTML = '⚖️ Comparar';
            compareBtn.type = 'button';
            compareBtn.addEventListener('click', showCompareModal);

            actionArea.appendChild(toggleBtn);
            actionArea.appendChild(dropBtn);
            actionArea.appendChild(compareBtn);
        }

        if (isNewActionArea) {
            const clogBtn = haWindow.querySelector('.ha-clog-btn');
            if (clogBtn) {
                clogBtn.before(actionArea);
            } else {
                haWindow.appendChild(actionArea);
            }
        }
    }

    let domCheckTimeout = null;
    const observer = new MutationObserver(() => {
        if (domCheckTimeout) return;
        domCheckTimeout = setTimeout(() => {
            domCheckTimeout = null;
            
            injectQuickTPButton();
            if (document.querySelector('.cfg-window')) injectConfigTab();
            applyChatState();
            if (document.querySelector('.win-window')) injectShopEnhancements();
            if (document.querySelector('.dex-window')) injectDexEnhancements();
            if (document.querySelector('.ha-window:not(.ha-compare-modal)')) trackHuntAnalyzer();

            const mapWindow = document.querySelector('.map-window');
            if (mapWindow) {
                if (renderTimeout) clearTimeout(renderTimeout);
                renderTimeout = setTimeout(buildSimpleList, 200);
            }
        }, 150);
    });

    applyMapScriptState();
    observer.observe(document.body, { childList: true, subtree: true });
})();