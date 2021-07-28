enum ProjectStatus {
    Active,
    Finished
}

interface Project {
    id: string;
    title: string;
    description: string;
    people: number;
    status: ProjectStatus;
}

type Listener = (project: Project) => void;

interface ValidateParams{
    value: string | number;
    validations: ['required'?, 'minLength'?, 'maxLength'?, 'min'?, 'max'?]
}
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

function Validate(validateParams: ValidateParams): boolean{
    const value = validateParams.value
    const validations = validateParams.validations

    let isValid = true
    validations.forEach((validation => {
        if(validation){
            switch(validation){
                case 'required':
                    isValid = isValid && value.toString().trim().length !== 0
                    break
                case 'minLength':
                    isValid = isValid && value.toString().length >= 2
                    break
                case 'maxLength':
                    isValid = isValid && value.toString().length <= 20
                    break
                case 'min':
                    if(value != null && typeof value === 'number'){
                        isValid = isValid && value >= 1
                    }
                    break
                case 'max':
                    if(value != null && typeof value === 'number'){
                        isValid = isValid && value <= 20
                    }
                    break
                default:
                    isValid = isValid
            }
    }
    }))
    return isValid
}

class ProjectState{
    private static instance: ProjectState
    private listeners: Listener[];
    constructor(){
        this.listeners = []
    }
    static getInstance(){
        if(this.instance){
            return this.instance
        }else{
            this.instance = new ProjectState();
            return this.instance
        }
    }

    addListerner(listenerFn: Listener){
        this.listeners.push(listenerFn)
    }

    addProject(title: string, description: string, people: number){
        const newProject: Project = {
            id: `${Math.random().toString().substring(2)}`,
            title,
            description,
            people,
            status: ProjectStatus.Active
        }
        this.listeners.forEach((listenerFn: Function) => {
            listenerFn(newProject)
        })
    }
}

const projectState = ProjectState.getInstance()


class ProjectList {
    private templateElement: HTMLTemplateElement;
    private hostElement: HTMLDivElement;
    private listSectionElement: HTMLElement;
    private activeProjects: Project[];
    private finishedProjects: Project[];
    constructor(private type: 'active' | 'finished'){
        this.activeProjects = []
        this.finishedProjects = []
        this.templateElement = <HTMLTemplateElement> document.getElementById('project-list')!
        this.hostElement = <HTMLDivElement> document.getElementById('app')!
        const importedEl = document.importNode(this.templateElement.content, true)
        this.listSectionElement = <HTMLElement> importedEl.firstElementChild!
        this.listSectionElement.id = `${this.type}-projects`
        projectState.addListerner((project: Project) => {
            if(project.status === ProjectStatus.Active){
                this.activeProjects.push(project)
            }else{
                this.finishedProjects.push(project)
            }
            this.showLists()
        })
        this.showForm()
        this.renderContent()
    }

    private showLists(){
        const list = <HTMLUListElement> document.getElementById(`${this.type}-projects-list`)!
        const allProjects = this.type === 'active' ? [...this.activeProjects] : [...this.finishedProjects]
        list.innerHTML = ""
        allProjects.forEach((project: Project) => {
            const listElement = document.createElement('li')
            listElement.textContent = project.title
            list.appendChild(listElement)
        })
    }

    private showForm(){
        this.hostElement.appendChild(this.listSectionElement)
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`
        this.listSectionElement.querySelector('ul')!.id = listId
        const headerSections = this.listSectionElement.getElementsByTagName('h2')
        if(headerSections.length > 0){
            headerSections[0].innerText = this.type === 'active' ? 'Active Projects' : 'Finished Projects'
        }
    }
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

    private resetForm(){
        this.formElement.reset()
    }
    @AutoBind
    handleSubmit(event: Event){
        event.preventDefault();
        event.stopPropagation();
        const formValues = this.gatherUserInput()
        if(Array.isArray(formValues)){
            const [title, desc, people] = formValues
            projectState.addProject(title, desc, people)
            this.resetForm()
        }
    }
}

const projectInput = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinished = new ProjectList('finished');