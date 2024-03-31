/*Copyright 2024 Jonas Caetano

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

class Chat {
    constructor(model, findwappFunction){
      this.findwappFunction = findwappFunction;
      this._inst = model;
    }

    async archive(){
        return new Promise(async (resolve, reject) => {
          const func = this.findwappFunction("Cmd")
          await func[0].archiveChat(this._inst, true)
          resolve(true)
        })
    };

    async unarchive(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("Cmd")
        await func[0].archiveChat(this._inst, false)
        resolve(true)
      })
  };

    async open(message){
        return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("openChat")
        if (typeof func != "object"){

          reject(false)
        }       
        const wId = this._inst["__x_id"]
        await func[0](wId)

        if (typeof message === "string" && message.length >= 1){

          await new Promise((s, r) => { setTimeout(() => { s(true) }, 200) } )
          const newTagElement = document.createElement("a")
          const userPhone = this._inst.__x_contact.__x_id.user
          newTagElement.setAttribute("class", "_11JPr selectable-text copyable-texts OpenChat")
          newTagElement.setAttribute("href", `http://wa.me/${userPhone}?text=${message}`)
          newTagElement.setAttribute("title",  `http://wa.me/${userPhone}` )
          newTagElement.setAttribute("target", `_blank`)
          document.body.append(newTagElement)
          newTagElement.click()
          newTagElement.remove()
        } 
        resolve(true)
      })
  };

    async close(){
        return new Promise(async (resolve, reject) => {
            const func = this.findwappFunction("Cmd")
            func[0].closeChat(this._inst)
        resolve(true)
        })
    };

    async pin(){
    return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("Cmd")
        await func[0].pinChat(this._inst, true)
        resolve(true)
    })
    };

    async unpin(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("Cmd")
        await func[0].pinChat(this._inst, false)
        resolve(true)
      })
    };

    async mute(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("Cmd")
        await func[0].muteChat(this._inst, true, 0)
        resolve(true)
      })
    };

    async unmute(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("Cmd")
        await func[0].muteChat(this._inst, false)
        resolve(true)
      })
    };

    async clear(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("sendClear")
        await func[0](this._inst, false)
        resolve(true)
      })
    };

    async delete(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("sendDelete")
        await func[0](this._inst)
        resolve(true)
      })
    };

    async markAsRead(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("Cmd")
        await func[0].markChatUnread(this._inst, false)
        resolve(true)
      })
    };

    async markAsUnread(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("Cmd")
        await func[0].markChatUnread(this._inst, true)
        resolve(true)
      })
    };
}

class User {
  constructor(wid, findwappFunction){
    this.findwappFunction = findwappFunction
    this._wid = wid
    const chatCollections = this.findwappFunction("ChatCollection")[0]
    chatCollections._models.forEach(chatModel => {
    if ( chatModel.__x_id === this._wid ){
        this.chat = new Chat(chatModel, this.findwappFunction)
    }});

    if ( typeof this.chat === "undefined" ){
      /*const func = this.findwappFunction("Chat")
      const chat = new func[0]({"id": this._wid})
      const chat = new chatCollections.modelCl*ass({"id": this._wid})
      chatCollections._models.push(chat) */
      const chatConstructor = new chatCollections.modelClass({"id": this._wid})
      const chat = chatCollections.add(chatConstructor, true)[0]
      this.chat = new Chat(chat, this.findwappFunction)
    }

    this.DeviceId = () => { this._wid.getDeviceId() }
    this.isBot = () => { return this._wid.isBot() }
    this.Jid = () => { return this._wid.toJid() }
    this.phone = this._wid.user
  }

  async pic(){
    return new Promise(async (resolve, reject) => {
      const func = this.findwappFunction("profilePicResync")
      const data = await func[0]( [this.chat._inst] )
      if ( Object.keys( data[0] ).includes("eurl") === false  ){
        reject(data)
      }
      resolve({
        thumbnail: data[0]["previewEurl"],
        full_pic: data[0]["eurl"],
        additional: {
          thumbnail_direct_path: data[0]["previewDirectPath"],
          timestamp: data[0]["timestamp"],
          file_hash: data[0]["filehash"],
          stale: data[0]["stale"],
          tag: data[0]["tag"]
        }})
    })
  }

  async biography(){
    return new Promise(async (resolve, reject) => {
      const func = this.findwappFunction("getStatus")
      let status, data;
      for ( let i = 1; i < 3 && typeof status === "undefined"; i++){
        switch (i) {
          case 1:
            data = await this.chat._inst.__x_contact.getStatus()
            status = data.status
          case 2:
            data = await func[0](this._wid)
            status = data.status
          case 3:
            data = await func[1](this._wid)
            status = data.status
          default:
            break;
        }
      }
      //const status = typeof data === "string"? data : typeof data.status
      if (typeof status === "undefined"){
        reject(status)
      }
      resolve(status)
    })
  }

  async block(){
    return new Promise(async (resolve, reject) => {
      const func = this.findwappFunction("blockUser")
      if ( this._wid === window.WTools.myWid ){
        reject(this._wid)
    }
    await func[0](this._wid)
    resolve(true)
    })
  }

  async unblock(){
    return new Promise(async (resolve, reject) => {
      const func = this.findwappFunction("unblockUser")
      if ( this._wid === window.WTools.myWid ){
        reject(this._wid)
    }
    await func[0](this._wid)
    resolve(true)
    })
  }
}

class WhatsAppTools {

    constructor(){
      this.myWid = this.findwappFunction("getMaybeMeUser")[0]()
    }
  
    async myProfileShortDetails() {
        return new Promise(async (resolve, reject) => {
  
          let wawcDbName = "wawc";
          let databases = await window.indexedDB.databases()
          let wawcDbVersion = databases.find(db => db.name === wawcDbName).version
          let wawcDb = window.indexedDB.open(wawcDbName, wawcDbVersion)
          wawcDb.onsuccess = function (event) {
              let dbInstance = event.target.result
              let transaction = dbInstance.transaction(["user"], "readonly")
              let objectStore = transaction.objectStore("user")
              let getAllRequest = objectStore.getAll()
              getAllRequest.onsuccess = function (event) {
                  let data = event.target.result;
                  let profile_access_settings =  JSON.parse( data.find(data => data.value.indexOf("online") > -1 ).value )
                  resolve({
                      me_display_name: JSON.parse( data.find(data => data.key == "me-display-name").value),
                      pic_url: JSON.parse(data.find(data => data.value.indexOf("n.jpg?") > -1 ).value),
                      last_wid_md: JSON.parse(data.find(data => data.key == "last-wid-md").value),
                      phone: JSON.parse(data.find(data => data.key == "last-wid-md").value).split(":")[0],
                      settings: {
                          system_theme_mode: JSON.parse( data.find(data => data.key == "system-theme-mode") ?  data.find(data => data.key == "system-theme-mode").value : null   ),
                          theme: JSON.parse(data.find(data => data.key == "theme").value),
                          profile_pic_vissible_for: profile_access_settings.profilePicture,
                          read_receipts_vissible_for: profile_access_settings.readReceipts,
                          about_vissible_for: profile_access_settings.about,
                          call_add_avalible_for: profile_access_settings.callAdd,
                          group_add_avalible_for: profile_access_settings.groupAdd,
                          last_seen_vissible_for: profile_access_settings.lastSeen
  
                        }
                    });
                };
            };
  
            })
  
    }
  
    async setTheme(theme){
          return new Promise(async (resolve, reject) => {
            const func = this.findwappFunction("setTheme")
            if (theme === "dark" || theme === "light"){
              //document.body.setAttribute("class", "web dark")
              window.theme = theme
              func[0](theme)
            } /*else if (theme === "light"){
  
              document.body.removeAttribute("class")
            }*/ else {
              reject(theme)
            }
            resolve(true);
          })
    };
  
    async GetUser(id){
          return new Promise(async (resolve, reject) => {
            const func = this.findwappFunction("createWid")
            if (typeof func != "object" || func.length <= 0 ){
              reject(func)
            }
          const id_ = id.indexOf("@") > -1 ? id : id + this.myWid._serialized.match(/@(.*)/)[0]
          const wId = new func[0](id_)
          resolve(new User(wId, this.findwappFunction) )
  
          })
    };

    async logout(){
      return new Promise(async (resolve, reject) => {
        const func = this.findwappFunction("socketLogout")
        if (typeof func != "object" || func.length <= 0 ){
          reject(func)
        }
      await func[0]()
      resolve(true)

      })
};
  
    findwappFunction(name) {
          var results = []
          const webpackChunk = window.webpackChunkbuild || window.webpackChunkwhatsapp_web_client
          const wappFunctions = {}
          if (webpackChunk) {
              webpackChunk.push([
                  [Math.random().toString(36).substring(7)],
                  {},
                  function (require) {
                      for (const wappFunction in require.m) {

                        if (Object.prototype.hasOwnProperty.call(require.m, wappFunction)) {
                              wappFunctions[wappFunction] = require(wappFunction)
                          }
                      }
                  }
              ]);
          }
          for (const func in wappFunctions) {
              if (wappFunctions.hasOwnProperty(func)) {
                  const wappFunction = wappFunctions[func]
                /*
              if (name === "ChatModels" && typeof wappFunction !== "undefined" && wappFunction.default && typeof wappFunction.default.Chat !== "undefined") {
                    return wappFunction.default.Chat
                  }
                */
                  if (typeof wappFunction === "object" && wappFunction[name]) {
                      results.push(wappFunction[name])
                  }
              }
          }
          return results
      }
      
}

window.WTools = new WhatsAppTools();
