function AutoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }
    return adjustedDescriptor
}

class ProjectInput{
    private templateElement: HTMLTemplateElement;
    private hostElement: HTMLDivElement;
    private formElement: HTMLFormElement;
    titleInput: HTMLInputElement;
    descInput: HTMLInputElement;
    peopleInput: HTMLInputElement;
    constructor(){
        this.templateElement = <HTMLTemplateElement> document.getElementById('project-input')!
        this.hostElement = <HTMLDivElement> document.getElementById('app')!
        const importedNodes = document.importNode(this.templateElement.content, true)
        this.formElement = <HTMLFormElement> importedNodes.firstElementChild
        this.formElement.id = 'user-input'
        this.titleInput = <HTMLInputElement> this.formElement.querySelector('#title')
        this.descInput = <HTMLInputElement> this.formElement.querySelector('#description')
        this.peopleInput = <HTMLInputElement> this.formElement.querySelector('#people')
        this.showForm()
        this.configureForm()
    }

    private showForm(){
        this.hostElement.appendChild(this.formElement)
    }

    private configureForm(){
        this.formElement.addEventListener('submit', this.handleSubmit)
    }

    private gatherUserInput(): [string, string, number] | void {
        const title = this.titleInput.value.trim()
        const desc = this.descInput.value.trim()
        const people = this.peopleInput.value.trim()
        if(!title || !desc || !people){
            alert('All the values are required')
            return
        }
        return [title, desc, +people]
    }

    private resetForm(){
        this.formElement.reset()
    }
    @AutoBind
    handleSubmit(event: Event){
        event.preventDefault();
        event.stopPropagation();
        const formValues = this.gatherUserInput()
        if(Array.isArray(formValues)){
            this.resetForm()
        }
    }
}

const projectInput = new ProjectInput();