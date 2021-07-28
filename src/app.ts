import { ProjectForm } from "./components/project-form.js";
import { ProjectList } from "./components/project-list.js";

function main(){
    new ProjectForm();
    new ProjectList('active');
    new ProjectList('finished');
}

main()