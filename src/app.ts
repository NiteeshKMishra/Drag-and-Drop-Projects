import { ProjectForm } from "./components/project-form";
import { ProjectList } from "./components/project-list";

function main(){
    new ProjectForm();
    new ProjectList('active');
    new ProjectList('finished');
}

main()