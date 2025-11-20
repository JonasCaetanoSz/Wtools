# 📦 WhatsAppTools — Automação interna do WhatsApp Web

> **Aviso importante:** Este projeto usa APIs internas do WhatsApp Web (módulos `WAWeb*`). Esses módulos não são públicos e podem mudar a qualquer atualização do WhatsApp — use em ambiente de desenvolvimento e por sua conta e risco.

Este repositório contém três classes principais que facilitam automações internas dentro do WhatsApp Web: `WhatsAppTools`, `User` e `Chat`. O README abaixo descreve cada classe, todos os métodos, parâmetros, valores retornados e exemplos de uso prático.

---
## ✅ Conteúdo deste README

- [Instalação / Como injetar](#-instalação--como-injetar)
- [Visão geral das classes](#-visão-geral-das-classes)
- [Classe `WhatsAppTools`](#-classe-whatsapptools)
  - `myProfileShortDetails()`
  - `GetUser(id)`
  - `getQr()`
  - `setQrCodeChangeEventListenner(callback)`
  - `logout()`
  - `onReady(callback)`
  - `onDisconnected(callback)`
- [Classe `User`](#-classe-user)
  - `phone()`
  - `profilePic()`
  - `biograpy()`
  - `block()`
  - `unblock()`
  - `getChat()`
- [Classe `Chat`](#-classe-chat)
  - `open(message?)`
  - `close()`
  - `clearMessageTextArea()`
  - `setMessageTextAreaContent(message)`
  - `pin()` / `unpin()`
  - `mute()` / `unmute()`
  - `archive()` / `unarchive()`
  - `markAsRead()` / `MarkAsUnread()`
  - `sendMessage(content)`
- [Exemplos completos](#-exemplos-completos)
- [Boas práticas e considerações de segurança](#-boas-práticas-e-considerações-de-segurança)
- [Contribuição e Licença](#-contribuição-e-licença)

---
## 🛠️ Instalação / Como injetar

Esse script foi desenhado para ser executado no console do navegador (DevTools) quando a página do **WhatsApp Web** estiver aberta, ou injetado via extensão (ex.: Tampermonkey) — **não** é um pacote npm. Para usar:

1. Abra `https://web.whatsapp.com/`
2. Abra o console do navegador (F12 / Ctrl+Shift+I)
3. Cole o código que contém as classes (`WhatsAppTools`, `User`, `Chat`) no console e pressione Enter.
4. Uma instância global será criada automaticamente:
```js
var WTools = new WhatsAppTools();
```

> ⚠️ Se o WhatsApp atualizar os nomes dos módulos internos (`WAWeb*`), o script pode quebrar. Mantenha cópia do código e revise os nomes dos módulos caso algo pare de funcionar.

---
## 🔎 Visão geral das classes

- **WhatsAppTools** — ponto de entrada. Cria `GetUser`, lida com eventos (QR change, ready, disconnected), e retorna informações do perfil logado.
- **User** — representa um usuário/contato. Métodos para obter telefone, foto, bio, bloquear, desbloquear e instanciar `Chat`.
- **Chat** — representa um chat individual; métodos para abrir/fechar chat, escrever no editor, enviar mensagens via API interna, fixar, silenciar, arquivar, marcar como lido, etc.

---
# 🧭 Classe `WhatsAppTools`

Instância criada automaticamente ao carregar o script:

```js
var WTools = new WhatsAppTools();
```

### constructor
Inicializa `myWid` e `myLid` (identificadores do usuário logado) usando módulos internos:

```js
this.myWid = window.require("WAWebUserPrefsMeUser").getMaybeMePnUser() || window.require("WAWebUserPrefsMeUser").getMaybeMeLidUser();
this.myLid = window.require("WAWebUserPrefsMeUser").getMaybeMeLidUser();
```

### myProfileShortDetails()

Retorna um objeto com dados simples do perfil atual.

**Uso:**
```js
const me = await WTools.myProfileShortDetails();
console.log(me.display_name, me.phone, me.biograpy);
```

**Retorna:** `Object | false` — Exemplo:
```js
{
  "display_name": "Seu Nome",
  "biograpy": "Status aqui",
  "phone": "5511999999999",
  "profilePic": { /* objeto com metadados da foto */ },
  "privacy": { /* settings */ }
}
```

---

### GetUser(id)

Cria uma instância `User` a partir de um id (aceita com ou sem sufixo `@s.whatsapp.net`).

**Uso:**
```js
const user = await WTools.GetUser("5511999999999"); // ou "5511999999999@s.whatsapp.net"
```

**Retorna:** `User | false`

---

### getQr()

Gera o texto do QR code usado para conectar uma sessão do WhatsApp Web (útil para builds de automação de login).

**Uso:**
```js
const qr = await WTools.getQr();
console.log(qr);
```

**Retorna:** `string | false` — string formatada que combina ref, chaves em base64 e plataforma.

---

### setQrCodeChangeEventListenner(callback)

Define uma função que será chamada quando o `ref` (QR) mudar. Ideal para exibir o novo QR em outro painel que você tenha.

**Uso:**
```js
await WTools.setQrCodeChangeEventListenner(async qrText => {
  console.log("Novo QR:", qrText);
});
```

**Parâmetros:** `callback(refString)` — função que recebe o texto do QR.

**Retorna:** `true`

---

### logout()

Desconecta a sessão atual do WhatsApp Web.

**Uso:**
```js
await WTools.logout();
```

---

### onReady(callback)

Registra callback para quando o estado do socket for `CONNECTED`.

**Uso:**
```js
await WTools.onReady(() => {
  console.log("WhatsApp conectado");
});
```

**Parâmetros:** `callback()` — sem parâmetros.

---

### onDisconnected(callback)

Registra callback para quando o estado do socket for `DISCONNECTED`.

**Uso:**
```js
await WTools.onDisconnected(() => {
  console.log("WhatsApp desconectado");
});
```

---
# 👤 Classe `User`

Representa um contato. Criada via `WTools.GetUser(id)`.

### constructor(wid)
```js
constructor(wid) {
  this._wid = wid;
  this._chat = null;
}
```

### phone()

Retorna o número do usuário a partir do `wid`.

**Uso:**
```js
const phone = await user.phone();
```
**Retorna:** `string | false` — número de telefone ou `false` se não disponível.

### profilePic()

Puxa a foto de perfil via `WAWebContactProfilePicThumbBridge`.

**Uso:**
```js
const pic = await user.profilePic();
```
**Retorna:** `object | false` — objeto com `eurl` (url), largura/altura etc, ou `false`.

### biograpy()

Pega a biografia/status do contato.

**Uso:**
```js
const bio = await user.biograpy();
```
**Retorna:** `string | false` — texto do status ou `false`.

### block()

Bloqueia o usuário usando `WAWebBlockContactAction.blockContact`.

**Uso:**
```js
await user.block();
```
**Retorna:** `true` (assume sucesso — você pode capturar exceções)

### unblock()

Desbloqueia o usuário.

**Uso:**
```js
await user.unblock();
```
**Retorna:** `true`

### getChat()

Retorna uma instância `Chat` correspondente a este usuário (procura ou cria o chat).

**Uso:**
```js
const chat = await user.getChat();
if (!chat) { console.log("Não encontrou chat"); }
```

**Retorna:** `Chat | false`

---
# 💬 Classe `Chat`

Representa um chat; criado com `new Chat(model, wid)` — normalmente via `user.getChat()`.

### constructor(model, wid)
```js
constructor(model, wid) {
  this._model = model;
  this._user_wid = wid;
}
```

### open(message?)

Abre o chat no painel inferior (openChatBottom) e opcionalmente escreve uma mensagem no editor.

**Uso:**
```js
const ok = await chat.open("Mensagem inicial");
if (!ok) console.log("Editor não encontrado ou chat não abriu");
```

**Parâmetros:** `message` (string, opcional) — texto para preencher o editor.

**Retorna:** `Promise<boolean>` — `true` se o editor foi encontrado, `false` caso contrário.

**Observações:** abre o chat e usa `WAWebCmd.Cmd.openChatBottom`. Se o editor de mensagem (`[aria-placeholder='Digite uma mensagem']`) não aparecer a função retorna `false`.

---

### close()

Fecha o chat via `WAWebCmd.Cmd.closeChat`. Observa o DOM (MutationObserver) para garantir que o editor foi removido — com timeout de 5s.

**Uso:**
```js
const closed = await chat.close();
console.log(closed ? "Fechado" : "Não fechado (timeout)");
```

**Retorna:** `Promise<boolean>` — `true` se o editor sumiu, `false` se timeout.

---

### clearMessageTextArea()

Limpa o campo de digitação usando `WAWebLexicalUtils.setTextContent(editor, "")`.

**Uso:**
```js
const ok = await chat.clearMessageTextArea();
```

**Retorna:** `Promise<boolean>` — `true` se o campo ficou vazio, `false` se não conseguiu encontrar o editor.

---

### setMessageTextAreaContent(message)

Define o conteúdo do editor (sem enviar). Usa `WAWebLexicalUtils.setTextContent`.

**Uso:**
```js
await chat.setMessageTextAreaContent("Texto aqui");
```

**Retorna:** `Promise<boolean>` — `true` se o editor contém a mensagem; `false` caso contrário.

---

### pin() / unpin()

Fixa ou desafixa o chat usando `WAWebCmd.Cmd.pinChat`.

**Uso:**
```js
await chat.pin();
await chat.unpin();
```

**Retorna:** `true` (as chamadas enviam o comando — você pode validar via store se desejar)

---

### mute() / unmute()

Silencia (mute) e ativa som (unmute). A implementação de `unmute()` no código original retorna uma Promise mas não resolve explicitamente — se desejar, implemente confirmação. Exemplo de uso:

```js
await chat.mute();
await chat.unmute();
```

**Retorna:** `true` (mute) e `Promise` (unmute — ajuste para devolver booleano se quiser).

---

### archive() / unarchive()

Arquiva/desarquiva chats com `WAWebCmd.Cmd.archiveChat`.

**Uso:**
```js
await chat.archive();
await chat.unarchive();
```

---

### markAsRead() / MarkAsUnread()

Marca como lido ou não lido (uso de `WAWebCmd.Cmd.markChatUnread`).

**Uso:**
```js
await chat.markAsRead();
await chat.MarkAsUnread();
```

**Observação:** há inconsistência de casing (`markAsRead` vs `MarkAsUnread`) — recomendo padronizar para camelCase (`markAsUnread`).

---

### sendMessage(content)

Envia uma mensagem usando as APIs internas (constrói `MsgKey`, `message` e chama `WAWebSendMsgChatAction.addAndSendMsgToChat`).

**Uso:**
```js
const ok = await chat.sendMessage("Olá via API interna!");
console.log(ok ? "enviada" : "falhou");
```

**Retorna:** `Promise<boolean>` — `true` se `messageSendResult === "OK"`, `false` caso contrário.

**Exemplo simplificado do fluxo interno:**
1. Cria `MsgKey` via `WAWebMsgKey.newId()`
2. Monta `message` com `body`, `to`, `from`, timestamps e `ephemeralFields`
3. Chama `addAndSendMsgToChat(this._model, message)`
4. Marca stream e unread/updades de UI
5. Checa `senderStatus["messageSendResult"]`

---
# 🔁 Exemplos completos

### Exemplo 1 — enviar mensagem a um número
```js
(async () => {
  var WTools = new WhatsAppTools();
  const user = await WTools.GetUser("5511999999999"); // 55 = BR country code + DDD + numero
  const chat = await user.getChat();

  if (!chat) {
    console.error("Chat não encontrado para", user);
    return;
  }

  await chat.open();
  await chat.sendMessage("Olá! Esta é uma mensagem automática enviada via script.");
  await chat.close();
})();
```

### Exemplo 2 — escutar conexão e exibir perfil
```js
WTools.onReady(async () => {
  const me = await WTools.myProfileShortDetails();
  console.log("Conectado como:", me.display_name, me.phone);
});
```

### Exemplo 3 — exibir QR e reagir a mudança
```js
WTools.setQrCodeChangeEventListenner(qr => {
  // atualizar Qr em UI externa
  console.log("Novo QR para leitura:", qr);
});
```

---
# 📌 Boas práticas e considerações de segurança

- **Backups do seu código:** guarde o código porque atualizações do WhatsApp podem quebrar nomes de módulos.
- **Evite ações em massa:** automatizar envios em massa pode fazer com que a conta seja limitada ou banida.
- **Ambiente de testes:** utilize uma conta secundária para testes — não use sua conta pessoal em scripts experimentais.
- **Tratamento de erros:** envolva chamadas em `try/catch` para capturar exceções vindas de módulos internos.

## 🤝 Contribuições

Toda ajuda é **muito bem-vinda**!  
Se você deseja melhorar o projeto, sugerir novas funcionalidades, corrigir problemas ou enviar pull requests, fique totalmente à vontade para contribuir.

Obrigado por apoiar o desenvolvimento! 🚀

# 📄 Licença

distribuído sobre [MIT](https://choosealicense.com/licenses/mit/) Licença