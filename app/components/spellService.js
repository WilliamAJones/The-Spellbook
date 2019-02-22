import Spell from "../models/spell.js";

//private
function formatUrl(url) {
  return '//bcw-getter.herokuapp.com/?url=' + encodeURIComponent(url)
}

// @ts-ignore
let _spellApi = axios.create({
  baseURL: ''
})

let _sandbox = axios.create({
  baseURL: 'https://bcw-sandbox.herokuapp.com/api/WilliamJ/spells'
})

let _state = {
  apiSpells: [],
  activeSpell: {},
  mySpells: []
}

let _subscribers = {
  apiSpells: [],
  activeSpell: [],
  mySpells: []
}

function setState(prop, data) {
  _state[prop] = data
  _subscribers[prop].forEach(fn => fn())
}

//public
export default class SpellService {
  learnSpell() {
    this.addToSpellbook(_state.activeSpell.name)
    _state.mySpells.push(_state.activeSpell)
    setState('mySpells', _state.mySpells)
  }
  setActive(url) {
    _spellApi.get(formatUrl(url))
      .then(res => {
        let data = new Spell(res.data)
        setState('activeSpell', data)
      })
  }
  addSubscriber(prop, fn) {
    _subscribers[prop].push(fn)
  }

  get ApiSpells() {
    return _state.apiSpells.map(s => new Spell(s))
  }
  get ActiveSpell() {
    return _state.activeSpell
  }
  get MySpells() {
    return _state.mySpells
  }

  //POST DATA
  addToSpellbook(name) {
    //find spell
    let spell = _state.apiSpells.find(s=> s.name == name)
    //find if spell is already in list
    let mySpell = _state.mySpells.find(s => s.name == spell.name)
    //prevent adding duplicates
    if (mySpell) {
        alert('YOU HAVE ALREADY LEARNED THIS SPELL')
        return
    }

    ///SEND DATA TO SERVER
    //first parameter is appended on baseURL, second parameter is data to send
    
    _sandbox.post('', _state.activeSpell)
        .then(res => {
            this.getMySpellsData()
        })
        .catch(err => {
            console.log(err)
        })
}

//GET DATA
getMySpellsData() {
    _sandbox.get()
        .then(res => {
            let data = res.data.data.map(s => new Spell(s))
            setState('mySpells', data)
        })
        .catch(err => {
            console.error(err)
        })
}
  getApiSpells() {
    _spellApi.get(formatUrl('http://www.dnd5eapi.co/api/spells'))
      .then(res => {
        let data = res.data.results.map(s => new Spell(s))
        setState('apiSpells', data)
      })
      .catch(err => console.error(err))
  }

  removeFromSpellbook(name) {
    let spell = _state.mySpells.find(s=> s.name == name)
    console.log(_state.mySpells, name)
    
  
    _sandbox.delete(spell._id)
        .then(res => {
            console.log(res.data)
            this.getMySpellsData()
        })
        .catch(err => {
            console.error(err)
        })
}

}