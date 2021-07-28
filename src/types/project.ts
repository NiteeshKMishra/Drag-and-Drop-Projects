export enum ProjectStatus {
    Active,
    Finished
}

export interface Project {
    id: string;
    title: string;
    description: string;
    people: number;
    status: ProjectStatus;
}

export type Listener = (project: Project) => void;
