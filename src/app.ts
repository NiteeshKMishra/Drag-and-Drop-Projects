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

interface Draggable{
    dragStartHandler: (event: DragEvent) => void;
    dragEndHandler: (event: DragEvent) => void;
}

interface DropTarget{
    dragOverHandler: (event: DragEvent) => void;
    dropHandler: (event: DragEvent) => void;
    dropLeaveHandler: (event: DragEvent) => void;
}

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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
        this.callAllListenres(newProject)
    }

    moveProject(project: Project, newStatus: ProjectStatus){
        const newProject = project
        if(newProject.status !== newStatus ){
            newProject.status = newStatus
            this.callAllListenres(newProject)
        }
    }

    private callAllListenres(newProject: Project){
        this.listeners.forEach((listenerFn: Function) => {
            listenerFn(newProject)
        })
    }
}

const projectState = ProjectState.getInstance()


class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
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


class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DropTarget{
    private listId: string;
    private activeProjects: Project[];
    private finishedProjects: Project[];

    constructor(private type: 'active' | 'finished'){
        super('project-list', 'list', `${type}-projects`)
        this.listId = `${this.type}-projects-list`
        this.activeProjects = []
        this.finishedProjects = []
        this.configure()
        this.displayContent()
    }

    @AutoBind
    dragOverHandler(event: DragEvent){
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
            event.preventDefault()
            this.element.querySelector('ul')!.classList.add('droppable')
        }
    }

    @AutoBind
    dropHandler(event: DragEvent){
        if(event.dataTransfer){
            const projectId = event.dataTransfer.getData('text/plain')
            if(projectId){
                const allProjects = this.type === 'active' ? [...this.finishedProjects] : [...this.activeProjects]
                const filteredProjects = allProjects.filter((project: Project) => project.id === projectId)
                if(filteredProjects.length > 0){
                    const tempProject = filteredProjects[0]
                    projectState.moveProject(tempProject, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
                }
            }
        }
    }

    @AutoBind
    dropLeaveHandler(_: DragEvent){
        this.element.querySelector('ul')!.classList.remove('droppable')
    }

    configure(){
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop',this.dropHandler);
        this.element.addEventListener('dragleave',this.dropLeaveHandler)

        projectState.addListerner((project: Project) => {
            if(project.status === ProjectStatus.Active){
                this.activeProjects.push(project)
                const tobeRemovedIndex = this.finishedProjects.findIndex(
                    (finishedProject: Project) => finishedProject.id === project.id
                )
                if(tobeRemovedIndex !== -1){
                    this.finishedProjects.splice(tobeRemovedIndex, 1)
                }
            }else{
                this.finishedProjects.push(project)
                const tobeRemovedIndex = this.activeProjects.findIndex(
                    (activeProject: Project) => activeProject.id === project.id
                )
                if(tobeRemovedIndex !== -1){
                    this.activeProjects.splice(tobeRemovedIndex, 1)
                }
            }
            this.showLists()
        })
    }

    displayContent(){
        this.element.querySelector('ul')!.id = this.listId
        const headerSection = this.element.querySelector('h2')!
        headerSection.innerText = this.type === 'active' ? 'Active Projects' : 'Finished Projects'
    }

    private showLists(){
        const list = <HTMLUListElement> document.getElementById(this.listId)!
        const allProjects = this.type === 'active' ? [...this.activeProjects] : [...this.finishedProjects]
        list.innerHTML = ""
        allProjects.forEach((project: Project) => {
            new ProjectItem(this.listId, project)
        })
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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

const projectInput = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinished = new ProjectList('finished');