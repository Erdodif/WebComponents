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