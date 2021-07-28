import { AutoBind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { Validate } from "../utils/validations";
import { Component } from "./base-component";

export class ProjectForm extends Component<HTMLDivElement, HTMLFormElement>{
    titleInput: HTMLInputElement;
    descInput: HTMLInputElement;
    peopleInput: HTMLInputElement;
    constructor(){
        super('project-input', 'form', 'user-input')
        this.titleInput = <HTMLInputElement> this.element.querySelector('#title')
        this.descInput = <HTMLInputElement> this.element.querySelector('#description')
        this.peopleInput = <HTMLInputElement> this.element.querySelector('#people')
        this.configure()
    }
    configure(){
        this.element.addEventListener('submit', this.handleSubmit)
    }

    displayContent(){

    }

    @AutoBind
    handleSubmit(event: Event){
        event.preventDefault();
        event.stopPropagation();
        const formValues = this.gatherUserInput()
        if(Array.isArray(formValues)){
            const [title, desc, people] = formValues
            projectState.addProject(title, desc, people)
            this.element.reset()
        }
    }

    private gatherUserInput(): [string, string, number] | void {
        const title = this.titleInput.value
        const desc = this.descInput.value
        const people = this.peopleInput.value
        if(
            !Validate({value: title, validations:['required', 'minLength', 'maxLength']}) || 
            !Validate({value: desc, validations:['required', 'minLength', 'maxLength']}) ||
            !Validate({value: +people, validations:['required', undefined, undefined, 'min', 'max']})
        ){
            alert('Please check the values and try again')
            return
        }
        return [title, desc, +people]
    }
}