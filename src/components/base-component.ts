export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    private templateElement: HTMLTemplateElement;
    private hostElement: T;
    element: U;

    constructor(templateElementId: string, hostElementId: string, elementId: string){
        this.templateElement = <HTMLTemplateElement> document.getElementById(templateElementId)!
        this.hostElement = <T> document.getElementById(hostElementId)!
        const importedEl = document.importNode(this.templateElement.content, true)
        this.element = <U> importedEl.firstElementChild!
        this.element.id = elementId
        this.displayElement()
    }
    private displayElement(){
        this.hostElement.appendChild(this.element)
    }

    abstract configure(): void;
    abstract displayContent(): void;
}