import * as shell from "shelljs";

//copy all the view files to dist folder during build
shell.cp("-R", "src/views", "dist/");
