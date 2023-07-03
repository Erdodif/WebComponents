class HelloWorld extends HTMLElement {
    constructor(){
        super();
        /* //Szintén valid, deklaratív megközelítés    
        this.appendChild(document.createElement("p"));
        this.children[0].innerText = "Hello World";
        */
        this.innerHTML = `<p>Hello World<p>`;
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    customElements.define('hello-world',HelloWorld);
});