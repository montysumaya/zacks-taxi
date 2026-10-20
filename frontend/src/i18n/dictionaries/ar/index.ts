import type { Dictionary } from "../en";
import core from "./core";
import legal from "./legal";
import pages from "./pages";

const ar: Dictionary = { ...core, pages, legal };
export default ar;
