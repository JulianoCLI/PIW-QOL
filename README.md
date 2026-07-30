# 🎮 Pokémon Map & Hunt Enhancer Pro

Um script gratuito que adiciona atalhos, informações e melhorias visuais ao [Pokémon Idle World](https://poke.idleworld.online/play).

[![Versão](https://img.shields.io/badge/versão-9.10.11-blue?style=for-the-badge)](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js)
[![Instalar](https://img.shields.io/badge/instalar-script-brightgreen?style=for-the-badge)](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js)
[![Licença](https://img.shields.io/badge/licença-MIT-green?style=for-the-badge)](LICENSE)

## O que este script faz?

O script melhora a tela do jogo e reúne funções que normalmente exigiriam várias janelas ou deslocamentos. Com ele, você pode:

- encontrar e favoritar hunts com facilidade;
- teleportar para uma hunt favorita ou para a última hunt visitada;
- abrir lojas, Mercado Global e Depot mesmo estando dentro de uma hunt;
- comprar grandes quantidades de itens e Poké Bolas;
- vender itens e Pokémon com proteções contra vendas acidentais;
- consultar anúncios do Mercado Global;
- melhorar a Pokédex e o Hunt Analyzer;
- escolher quais modificações deseja usar.

Você não precisa saber programar. Depois de instalado, o script funciona dentro do próprio jogo.

> **Importante:** o script não joga sozinho. Compras, vendas, teletransportes e movimentações do Depot só acontecem quando você clica nos respectivos botões.

## Instalação passo a passo

### 1. Instale uma extensão de userscripts

Escolha apenas uma:

| Navegador | Extensão recomendada |
|---|---|
| Chrome, Brave ou Arc | [Tampermonkey para Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Microsoft Edge | [Tampermonkey para Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |
| Firefox ou Zen | [Tampermonkey para Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/tampermonkey/) |

Essa extensão é o programa que permite ao navegador executar o script.

### 2. Instale o script

1. Clique em [Instalar Pokémon Map & Hunt Enhancer Pro](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js).
2. A extensão abrirá uma tela com o código.
3. Clique em **Instalar**.
4. Abra ou atualize a página do jogo.

Se tudo estiver correto, novos botões aparecerão na barra superior do jogo.

## Conhecendo os novos botões

### ⭐ ou ↻ — Teleporte rápido

Esse botão fica na barra principal.

- **⭐ Favorita:** leva você diretamente para a primeira hunt marcada como favorita.
- **↻ Última hunt:** leva você para a última hunt visitada.
- **Desativado:** esconde o atalho de teleporte da barra.

É possível escolher o comportamento em **Configurações → Script Mods → Ação do botão de teleporte**.

Se ainda não existir uma favorita ou última hunt, o script mostrará uma pequena janela de aviso. Ele não usa os alertas grandes do navegador.

### 🏪 — Lojas

Ao clicar, um menu aparece logo abaixo do botão. As três opções ficam disponíveis em Cerulean e nas hunts:

- **Mercado Global**
- **Loja de Poké Bolas**
- **Vender itens e Pokémon**

O menu não depende do mapa atual. Se você trocar de cidade ou hunt, as opções continuam disponíveis.

### 📦 — Depot

Abre um Depot portátil, inclusive dentro de uma hunt.

Na aba **Itens**:

- a coluna **Mochila** mostra o que está com seu personagem;
- a coluna **Depot** mostra o que está armazenado;
- clique em um item da Mochila para guardá-lo;
- clique em um item do Depot para retirá-lo.

Na aba **Pokémon**:

- a coluna **Equipe** mostra os Pokémon que estão com você;
- a coluna **Box** mostra os Pokémon guardados;
- clique em um Pokémon para movê-lo entre a equipe e o Box.

As quantidades e o total de espaços ocupados são mostrados no próprio painel.

### Inventário

O inventário não escurece o restante da tela e não fecha ao clicar fora dele. Use o botão `X` para fechar. A janela também pode ser redimensionada arrastando seu canto. Os slots mantêm um tamanho fixo e apenas reorganizam suas colunas conforme o espaço disponível.

## Mapa e hunts

### Mapa simplificado

Ao abrir o mapa, você pode usar uma lista organizada no lugar do mapa gráfico tradicional. Cada hunt pode mostrar:

- nome e nível;
- Pokémon encontrado;
- tipo do Pokémon;
- experiência recebida;
- valor de venda;
- efetividade do seu Pokémon ativo;
- drops;
- indicação de que você já está naquela hunt;
- estrela para adicionar aos favoritos.

Você pode ordenar as hunts por:

- maior ou menor preço;
- melhor efetividade;
- maior ganho de experiência.

As hunts favoritas permanecem no começo da lista.

O mapa também considera o nível do treinador:

- hunts acessíveis funcionam normalmente;
- hunts acima do seu nível ficam escurecidas, com cadeado e indicação do nível necessário;
- clicar em uma hunt bloqueada mostra o motivo sem tentar teleportar;
- os filtros de tipo usam somente hunts que seu personagem já pode acessar;
- é possível exibir somente hunts acessíveis, favoritas acessíveis ou hunts com vantagem de tipo;
- a pesquisa também encontra hunts pelo nome de seus drops.

O último filtro e a última ordenação utilizados ficam salvos no navegador.

### Verificar melhor hunt

O botão **Verificar melhor hunt** abre o [PIW Tools](https://piwtools.com.br/) em uma nova aba. O script preenche automaticamente:

- Pokémon principal;
- nível atual;
- HP, ataque, defesa, ataque especial, defesa especial e velocidade;
- clã e rank do clã, quando disponíveis;
- próximo múltiplo de 10 como objetivo da rota.

Nenhum dado de acesso ou senha é enviado. Somente as informações necessárias são colocadas nos parâmetros do link.

Os dados do Pokémon são lidos do cache que o próprio jogo já mantém para o WebSocket. O script não abre uma segunda conexão, não baixa novamente toda a coleção e não precisa abrir a janela “My Pokes”.

### Favoritos

Clique na estrela ao lado de uma hunt para marcá-la. A escolha fica salva no navegador e será lembrada quando você abrir o jogo novamente.

Ao clicar na própria hunt, o script faz o teletransporte e fecha informações antigas da tela, como tooltips de drops.

Se houver mais de uma favorita, o primeiro uso do teleporte pede que você escolha uma hunt principal. Depois disso, o botão sempre usa essa hunt. Clique com o botão direito no botão de estrela da barra para trocar a principal.

### Visualização de drops

Você escolhe como consultar os drops:

- **Ícone (?)**: clique ou passe o mouse no ícone da hunt;
- **Hover**: passe o mouse sobre a hunt;
- **Oculto**: não exibe a prévia.

O padrão é o modo **Ícone (?)**, que deixa a lista mais limpa.

## Loja de Poké Bolas

A loja portátil usa um painel largo para não ficar espremida dentro das hunts.

Ela mostra:

- seu dinheiro atual;
- preço de cada Poké Bola;
- quantidade que você já possui, indicada por **Em estoque**;
- valor total antes da confirmação da compra.

Os botões permitem comprar:

- `+1`
- `+10`
- `+100`
- `+1.000`
- `+10.000`

Antes da compra, uma janela comum do próprio script mostra a quantidade, o custo total e o saldo. Não são usados alertas do navegador.

## Venda de itens e Pokémon

Abra **🏪 Lojas → Vender itens e Pokémon**.

### Venda de itens

Cada linha informa:

- nome do item;
- quantidade disponível;
- valor unitário;
- campo para escolher a quantidade que será vendida.

Na parte inferior existem três botões:

- **Marcar tudo:** seleciona todos os itens que podem ser vendidos;
- **Vender:** vende apenas o que estiver selecionado;
- **Cancelar:** fecha a janela sem vender.

O painel também informa o saldo atual e o valor total da venda selecionada.

### Cadeados e itens protegidos

Itens protegidos não entram em uma seleção em massa. Isso reduz o risco de vender algo importante por engano.

Também é possível cadastrar itens que sempre devem pedir confirmação antes da venda. A lista padrão inclui itens especiais como:

- Strange Pheromone;
- Rare Pokémon Picture;
- Bronze Boss Token;
- Boss Bronze Token.

Você pode alterar essa lista em **Configurações → Script Mods → Itens com confirmação de venda**.

### Venda de Pokémon

Clique em **Pokémon** na janela de venda para trocar de tela. A lista mostra informações úteis do Pokémon, incluindo:

- IV total;
- qualidade;
- preço de venda;
- dados usados pelas proteções de raridade.

É possível filtrar a lista por nome, Shiny ou normal, IV mínimo e qualidade mínima. A leitura tenta primeiro o cache interno do jogo, tornando a janela mais confiável quando existem várias abas abertas.

Pokémon Lendários, Míticos e Divinos podem ser automaticamente excluídos da seleção em massa. Essa proteção pode ser ligada ou desligada nas configurações.

## Loja do Mark em Cerulean

As melhorias também são aplicadas à loja normal do Mark:

- quantidade **Em estoque** nos itens;
- compras de `1`, `10`, `100`, `1.000` e `10.000`;
- exibição do custo antes da compra;
- cadeados para impedir vendas acidentais;
- confirmação para os itens escolhidos nas configurações;
- seleção e venda de itens ou Pokémon.

As quantidades são atualizadas sem reconstruir a janela continuamente, evitando piscadas na tela e valores temporários incorretos.

## Mercado Global portátil

Abra **🏪 Lojas → Mercado Global**. Os anúncios são carregados quando a janela é aberta ou quando você usa o botão **Atualizar**. O script não fica inserindo anúncios em tempo real enquanto a janela está fechada.

### Abas

- **Itens:** mostra anúncios de itens.
- **Pokémon:** mostra os Pokémon anunciados e seus IVs.

### Informações exibidas

- nome do item ou Pokémon;
- quantidade;
- preço;
- moeda utilizada;
- IVs, quando for um Pokémon;
- botão para comprar um anúncio com preço.

O nome do vendedor é omitido para deixar a lista mais simples.

### Filtros

O painel possui filtros inspirados no mercado normal do jogo. Dependendo da aba, você pode filtrar ou organizar por nome, categoria, tipo, qualidade, IV, preço e moeda — **Dólar** ou **DD**.

A opção **Oferta** identifica anúncios sem preço definido.

Os checkboxes **Dólar** e **Diamantes** funcionam de forma independente. Deixe ambos marcados para visualizar todo o mercado ou desmarque uma moeda para ocultar seus anúncios. Ofertas continuam aparecendo normalmente.

Filtros atuam sobre os anúncios carregados. Use **Atualizar** quando quiser buscar novamente os dados do mercado.

## Hunt Analyzer

O script acrescenta ferramentas ao Hunt Analyzer:

- **Reduzir/Expandir:** alterna entre o painel normal e uma versão compacta;
- **Drops:** mostra ou esconde a lista de drops;
- **Comparar:** compara a hunt atual com a anterior.

O modo compacto e a exibição de drops são lembrados pelo navegador.

O painel reduzido pode ser redimensionado pelo canto. Quando os drops estão visíveis, a lista aproveita a altura disponível conforme a janela é expandida.

O Analyzer também funciona no modo de batalha **Cartas**. Ao retornar para a aba do jogo, o mod resincroniza a visibilidade da renderização para evitar que a tela permaneça no estado escuro de economia de recursos.

O comparador mantém o botão de fechar separado das demais ações. A opção de limpar o histórico fica junto do histórico recente, evitando sobreposição em janelas menores.

### Comparador de hunts

Ao trocar de hunt, o script guarda os dados da sessão anterior. A comparação pode incluir:

- saldo total;
- saldo por hora;
- experiência total;
- experiência por hora;
- derrotas por hora;
- duração da hunt;
- total de Pokémon derrotados.

Resultados melhores aparecem destacados em verde e resultados inferiores em vermelho.

A troca de hunt é identificada pelo local, pelo tempo e pelos contadores da sessão, reduzindo perdas quando a troca acontece antes da primeira derrota. As últimas 20 sessões válidas ficam salvas no navegador, e as 10 mais recentes aparecem no comparador.

### Última captura

O Hunt Analyzer também pode mostrar:

- horário da última captura;
- tempo desde a captura;
- quantidade de Poké Bolas usadas.

O Log de Capturas substitui o nível fixo 1 somente pelo número da qualidade original. O número usa a mesma cor da categoria de qualidade exibida ao lado.

## Pokédex

A Pokédex recebe filtros adicionais:

- **Todos:** mostra todos os Pokémon;
- **Capturados:** mostra somente os já capturados;
- **Não capturados:** mostra somente os que ainda faltam.

No filtro de não capturados, é possível ordenar pelo menor valor.

### Fast Travel

Quando o **Fast Travel da Pokédex** está ligado, clicar em um Pokémon procura sua hunt e teletransporta o personagem diretamente para ela.

## Configurações do script

Abra a engrenagem do jogo e selecione a aba **Script Mods**. As opções estão separadas em grupos para facilitar o uso.

| Opção | O que faz |
|---|---|
| Mapa simplificado | Alterna entre a lista do script e o mapa normal |
| Visualização de drops | Escolhe Ícone, Hover ou Oculto |
| Ação do teleporte | Escolhe Favorita, Última hunt ou Desativado |
| Exibir chat | Mostra ou esconde o chat |
| Fast Travel da Pokédex | Permite teleportar clicando na Pokédex |
| Mercado Global nas hunts | Liga ou desliga o mercado portátil |
| Compras em grande quantidade | Liga ou desliga os botões adicionais |
| Venda nas hunts | Liga ou desliga a loja portátil de venda |
| Melhorias da loja do Mark | Liga ou desliga as melhorias em Cerulean |
| Confirmação de venda | Escolhe quais itens exigem confirmação |
| Proteção por cadeado | Evita selecionar itens bloqueados |
| Proteção de raridade | Evita selecionar Pokémon raros em massa |

Por padrão, o chat fica oculto e a visualização de drops usa o ícone `?`. Todas as preferências ficam salvas somente no navegador utilizado.

### Idiomas

Os principais menus do script acompanham o idioma do jogo:

- jogo em português → menus em português;
- jogo em inglês → menus em inglês.

Algumas mensagens muito específicas ainda podem aparecer em português.

## Como atualizar

Normalmente o Tampermonkey ou Violentmonkey procura atualizações sozinho.

Para atualizar manualmente:

1. abra o painel da extensão;
2. encontre **Pokémon Map & Hunt Enhancer Pro**;
3. procure a opção **Verificar atualizações**;
4. atualize a página do jogo.

Você também pode abrir novamente o [link de instalação](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js). Se já estiver instalado, a extensão oferecerá a atualização.

Confira a versão no começo do script. A versão documentada neste README é a **9.10.11**.

## Solução de problemas

### Os novos botões não apareceram

1. Confirme que a extensão está habilitada.
2. Confirme que o script está habilitado dentro da extensão.
3. Atualize a página com `Ctrl + F5`.
4. Verifique se está usando `https://poke.idleworld.online/play`.

### A extensão diz que existe uma versão antiga

Abra o painel da extensão, force a verificação de atualizações e recarregue o jogo. Se necessário, abra o link de instalação novamente.

### Uma loja ou o Depot não carregou

Verifique sua conexão e tente fechar e abrir o painel. Essas janelas consultam sua sessão atual do jogo; se a sessão tiver expirado, atualize a página e entre novamente.

### O Mercado Global está vazio

Confira se algum filtro está escondendo os resultados. Limpe os filtros, habilite a exibição de ofertas e clique em **Atualizar**.

### Um item não foi selecionado por “Marcar tudo”

O item provavelmente está protegido por um cadeado ou pela lista de confirmação. Isso é intencional para evitar vendas acidentais.

### O teleporte rápido não funciona

- No modo Favorita, marque pelo menos uma hunt com a estrela.
- No modo Última hunt, visite uma hunt pela lista primeiro.
- Se o mapa não carregar corretamente, atualize a página antes de tentar novamente.

## Privacidade e segurança

- As configurações e favoritas são salvas localmente no navegador.
- O script não envia suas configurações para serviços de terceiros.
- As funções de loja, mercado, teletransporte e Depot usam a sessão já aberta no próprio jogo.
- Nunca compartilhe cookies, tokens de acesso ou arquivos do perfil do navegador.
- Revise quantidades e valores nas janelas de confirmação antes de comprar ou vender.

Este é um projeto criado pela comunidade e não é uma ferramenta oficial dos desenvolvedores do Pokémon Idle World.

## Créditos

Desenvolvido por **Desjunior** ([JulianoCLI](https://github.com/JulianoCLI)) para a comunidade de Pokémon Idle World.

Sugestões e relatos de problemas podem ser enviados pelas [Issues do GitHub](https://github.com/JulianoCLI/PIW-QOL/issues).

---

**[Instalar o script](https://github.com/JulianoCLI/PIW-QOL/raw/main/piw-qol.user.js)** · **[Reportar um problema](https://github.com/JulianoCLI/PIW-QOL/issues)** · **[Abrir o jogo](https://poke.idleworld.online/play)**
