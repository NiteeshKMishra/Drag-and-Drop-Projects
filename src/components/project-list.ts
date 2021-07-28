import { AutoBind } from "../decorators/autobind";
import { DropTarget } from "../types/drag-drop";
import { Project, ProjectStatus } from "../types/project";
import { Component } from "./base-component";
import { ProjectItem } from "./project-item";

import { projectState } from "../state/project-state";


export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DropTarget{
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