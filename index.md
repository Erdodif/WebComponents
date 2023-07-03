# Webkomponensek, a HTML jövője

Újradefiniálható a html? Elfelejthetjük a JS keretrendszereket? Mik is a Webkomponensek pontosan?

Tartsatok velem, és minderre választ adok néhány példával.

## Előfeltételek

A cikk megértésében a `HTML/CSS/JS` alapvető ismerete és az OOP irányelvei segíthetnek 👀.

---

## Mik is a Webkomponensek?

A `html custom element` (_lejjebb csak webkomponensek_) egy `API`, ami lehetőséget ad arra, hogy bármely létező `HTML` elemet alapul véve új `HTML` számára értelmezhető elemet hozhassunk létre.

A felhasználáshoz a következőket kell elvégezni:

- Definiálunk egy osztályt, ami a `HTMLElement` osztályból származik
  - Itt létrehozzuk és kezeljük az elem életciklusát
- Hozzáadjuk a dokumentum `CustomElementRegistry` osztályához az elemet
- Felhasználni az új elemet a `.html` fájlban statikusan, vagy `JavaScript`-en keresztül dinamikusan

## Mire jók a webkomponensek

Legfőbb funkciója egy feladathoz szükséges elemek csokorba fogása, az újra felhasználhatóság érdekében, valamint lehetőség van rá, hogy lokális stílus legyen rá alkalmazva, ami nincs hatással a dokumentum többi részére, így nem kell aggódni a véletlen felüldefiniálások, és reszponzivitási problémák miatt.

## Egyszerű, statikus elem

Néhány egszerűbb példával megnézzük, hogyan is működnek ezek, a most még rejtélyes elemek.

Nézzük az alábbi JS kódot:

```js
class HelloWorld extends HTMLElement {
    constructor(){
        super();
        this.innerHTML = `<p>Hello World<p>`;
    }
    /*
    //Szintén valid, deklaratív megközelítés:   
    constructor(){
        super();
        this.appendChild(document.createElement("p"));
        this.children[0].innerText = "Hello World";
    }*/   
}

document.addEventListener("DOMContentLoaded",()=>{
    customElements.define('hello-world',HelloWorld);
});
```

Ahogy látjuk, `HelloWorld` a `HTMLElement` osztályból származik le. Túl sok mindent nem csinál, a tartalma "_Hello World!_" csupán.
A nyilvántartáshoz a `customElements.define()` függvénnyel adhatjuk hozzá az új elemünket.

Fontos megjegyeznem, hogy az elnevezés konvenciója az, hogy kötőjellel legyenek a szaval elválasztva, és legalább két szóból áljon, így könnyen megkülönböztethető a natív `HTML` elemektől.

> A `DOMContentLoaded` event csupán azért használatos, hogy a DOM már létezzen, mikor a JavaScript a `hello-world` elemet definiálja, különben hibát kapunk.
>
> Persze ez elkerülhető úgy is, ha a script elemet a dokumentum végén importáljuk, viszont ez a konvenció.

---

Nézzük is akkor az `index.html`-ben:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bare-minimum</title>
    <script src="hello.js"></script>
</head>
<body>
    <hello-world></hello-world>
</body>
</html>
```

> Vegyük észre, hogy a webkomponensek nem önlezáró elemek, így a `<hello-world/>` nem valid.
>
> A Böngésző render-motorjában van definiálja, pontosan mely elemek lehetnek önlezáróak a W3 standard szerint, így az egyedi komponensek sose lesznek önlezáróak.

## Attribútumok felhasználása

Persze, ha csak előre ismert szöveget tudnánk használni, nem lenne semmi érdekes a webkomponnesekben. Szerencsénkre, az attribútumokhoz a konstruktorban már hozzájuk lehet férni. Nézzünk is rá egy egyszerű példát.

```js
class FancyInput extends HTMLElement{
    constructor(){
        super();
        this.innerHTML= 
        `<style>
            span { width: 6em; height:1em; position:relative }
            img { position:absolute; top:5%; right:1%; height:100%; user-select:none; }
        </style>
        <span>
            <input type="${this.getAttribute('type')}">
            <img src="${this.getAttribute('src')}">
        </span>`;
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    customElements.define('fancy-input',FancyInput);
});
```

Az attribútumokat ugyanúgy kell megadni, mint ahogy azt egy `<img>` vagy `<input>` elemmel tennénk:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>With Attributes</title>
    <script src="fancy-input.js"></script>
    <style>
        form{
            display: flex;
            flex-direction: column;
            gap:1em;
        }
    </style>
</head>
<body>
    <form>
        <h1>Bejelentkezés</h1>
        <fancy-input type="text" src="assets/user.svg"></fancy-input>
        <fancy-input type="password" src="assets/key.svg"></fancy-input>
    </form>
</body>
</html>
```

A kimenet így fog kinézni:

![Kimenet](/images/with-attributes.png)

> Tehát, ha már egyszer felépítettünk egy jó komponenst, felhasználhatjuk még egyszer, és bízhatuk abban, hogy működni fog.

---

## Shadow DOM

Az előző példával egy baj van: az így definiált stílus még globális, tehát ha máshol `<img>` elem lenne használva, azok önálló életre kellnének az importálás után. Nyilván ezt nem szeretnénk, itt jön képbe a shadow DOM.

A shadow-DOM elrejti a webkomponnensünk tartalmát a külső DOM számára, így a kettő stílusa nem fog összegabalyodni.

Alakítsuk hát át az előző kódot a shadow-dom felhasználásával:

```js
let template = document.createElement("template");
template.innerHTML = `<style>
    span { width: 6em; height:1em; position:relative }
    img { position:absolute; top:5%; right:1%; height:100%; user-select:none; }
</style>
<span>
    <input>
    <img>
</span>`


class FancyInput extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.querySelector('input').setAttribute("type",this.getAttribute("type"));
        this.shadowRoot.querySelector('img').setAttribute("src",this.getAttribute("src"));
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    customElements.define('fancy-input',FancyInput);
});
```

A legkönnyebben `template` elemmel lehet megoldani, amit így eredményül kapunk, azt már nem okoz gondot a dokumentum egyéb stílusával.

A `{mode:'open'}` leginkább fejlesztés közben használatos, ilyenkor a shadow-root elemei a DOM-ban láthatók.

Kép a Fejlesztői nézetről:

![Fejlesztői nézet](/images/shadowed.png)

## Gyerek elemek átengedése

Természetesen a webkomponensünk tartalmazhat gyerek elemeket, ahhoz egy különleges `<slot/>` elemet használunk fel.
megadható adott nevű elemek elhelyezése, mindet azok `slot=""` attribútumuk szerint.

Példának készítsük el a `<details>` egy speciálisabb megfelelőjét:

```js
let template = document.createElement('template');
template.innerHTML = `
<style>
    div{
        width:20em;
    }
    ::slotted(img){
        max-width:20em;
        height:auto;
    }
</style>
<div>
    <h1>
        <slot name="name">Nameless image</slot>
    </h1>
    <slot name="image">Image unavailable</slot>
    <button id="show">More details</button>
    <div id="details" style="display:none">
        <div>
            <span>Size:</span>
            <span><slot name="width">N/A</slot>x<slot name="height">N/A</slot></span>   
        </div>
        <div>
            <span>Description:</span>
            <span><slot name="description"></slot><span>
        </div>
        <slot></slot>
    </div>
</div>`;

document.addEventListener("DOMContentLoaded",()=>{
    customElements.define(
        'custom-details',
        class extends HTMLElement{
            opened = false;
            constructor(){
                super();
                this.attachShadow({mode:'open'});
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                let button = this.shadowRoot.querySelector('#show');
                button.addEventListener("click",()=>{
                    this.opened = !this.opened;
                    button.innerHTML = this.opened?"Hide details":"More details";
                    this.shadowRoot.querySelector('#details').style.display = this.opened?"block":"none";
                })
            }
        }
    );
});
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="details.js"></script>
</head>
<body>
    <custom-details>
        <img src="./assets/coins.jpg" slot="image">
        <div slot="name">Valuable plant</div>
        <span slot="width">3456</span>
        <span slot="height">2304</span>
        <div slot="description">Random növény egy adag 50 ezres érmén</div>
        <div>Licenc: public-domain</div>
        <div>A kép nem eladó!</div>
    </custom-details>
</body>
</html>
```

És íme a kimeneti állapot:

| | |
|--|--|
| ![Csukva](/images/details_closed.png) | ![Nyitva](/images/details_opened.png) |

## Életciklus metódusai

- `constructor()`
  - Az objektum létrehozásakor vagy frissítésekor kerül meghívásra
- `connectedCallback()`
  - Az objektum DOM-ba helyezésének idejében kerül meghívásra
  - Ilyenkor érdemes az eseményfigyelőket beállítani(_`eventListener`_)
- `disconnectedCallback()`
  - Az objektum Dom-ból eltávolításakor kerül meghívásra
  - Az eseményvezérlők és változók felszabadítására alkalmas
- `attributeChangedCallback(attributeName, oldValue, newValue)`
  - Minden alaklommal, amikor az atribútumaiban változás történik, ez meghívódik
  - Reaktivitását lehet az elemnek javítani

> A példákban nem fedtem le minden felhasználási területet, komplexebb feladatoknál viszont szükség lehet az életciklus további metódusait használni.

---

## Gyakran ismételt kérdések

### Mit szól rá a validátor?

A webkomponensek W3 standard része, ha a validátor hozzáfér az objektumot definiáló kódhoz, elfogadja, hiszen a kód validnak minősül.

Felhasználhatóságról a [Can I use](https://caniuse.com/?search=custom%20element) oldal ad pontos választ.

---

### Hogyan tudom mások komponenseit felhasználni?

A külső JavaScript könyvtárakhoz hasonlóan (például _bootstrap, jquery_), egy `<script src="">` elem elég is lehet, azután pedig nincs más dolga az embernek, mint a definiált elemet használni a DOM-ban.

---

### Mikor éri meg a shadow-root-ot elzárni?

A shadow root elrejtése (_`{mode:'closed'}`_) akkor célszerű, ha a webkomponensünkket külső felhasználásra szánjuk, webkomponenseket egyébként is azért használunk, mert nem akarjuk újra feltalálni a kereket.

> _"Ami a webkomponensben történik, az a webkomponensben is marad"_ - Kotlin

---

### Mennyire akadálymentes?

Tekintve, hogy minden webkomponens natív HTML elemekből áll össze, szemantikus HTML használatával ugyanolyan akadálymentes lehet, mint webkomponensek nélkül.

Tekinktsünk a webkomponensekre úgy, mint egy okos csomagolásra a már jól ismert eszközök köré.

---

### Mi lesz a keretrendszerek sorsa?

Az állapotkezelés azért nem a leg kézenfekvőbb a webkomponnesek esetébek, céljuk nem is a sablon alapú keretrendszerek (_Vue, React, Svelte_) leváltása. A webkomponensek felhasználása inkább vizivig editorok reneszánszára, illetve beágyazások megkönnyítésére szolgál.

> Példának hoznám az egyik legismertebb animációs platformot, a __LottieFiles__-t, ami a `<lottie-player>` elemmel ad lehetőséget a kis méretű, vektoros animációinak beágyazására.

Legjobban az Objektumevű programozás egyszeres-felelősség elvével tudom hasonlítani. A webkomponens lényege, hogy egy dolgot csináljon, és azt jól csinálja. A keretrendszerek jellemzően komplex állapotok kezelésére hivatottak, amit a webkomponnesekkel már csak nehezen lehetne megvalósítani.

---

## Konklúzió

A webkomponnesek egy nagyszerű módja az egyszerű, újra felhasználható elemek létrehozására úgy, hogy nem hagyjuk el a natív HTML/CSS/JS földjét.

Egyszerűbb viselkedések implementálására a webkomponens tökéletes eszköz lehet, gyakorlati haszna pedig hosszútávú, hiszen akkor is működni fog, ha megjelenik a következő, _`n+1`-edik_ JS keretrendszer.

## Források

- [MDN webkomponensek](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [MDN shadow-root](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [MDN Templates and slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots)
- [Webkomponens oktatóvideó](https://www.youtube.com/watch?v=PCWaFLy3VUo)

## Ajánlott videó

- [Web components with Kevin Powell and Dave Rupert](https://www.youtube.com/watch?v=Sq5oiHjwFxI)
