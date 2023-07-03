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