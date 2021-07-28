import { Listener, Project, ProjectStatus } from "../types/project";

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

export const projectState = ProjectState.getInstance()
