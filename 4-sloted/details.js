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

