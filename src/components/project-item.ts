import { AutoBind } from "../decorators/autobind.js"
import { Draggable } from "../types/drag-drop.js"
import { Project } from "../types/project.js"
import { Component } from "./base-component.js"

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
    constructor(hostId: string, private project: Project){
        super('single-project', hostId, project.id)
        this.configure()
        this.displayContent()
    }

    get persons(){
        if(this.project.people === 1){
            return '1 person'
        }else{
            return `${this.project.people} persons`
        }
    }
    @AutoBind
    dragStartHandler(event: DragEvent){
        event.dataTransfer!.setData('text/plain', this.project.id)
        event.dataTransfer!.effectAllowed = 'move'
    }
    @AutoBind
    dragEndHandler(_: DragEvent){
    }
    configure(){
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }
    displayContent(){
        this.element.querySelector('h2')!.textContent = this.project.title
        this.element.querySelector('h3')!.textContent = `${this.persons} assigned`
        this.element.querySelector('p')!.textContent = this.project.description
    }
}