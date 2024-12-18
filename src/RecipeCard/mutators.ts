import arrayMutators  from 'final-form-arrays';
import { Mutator } from 'final-form'
import { RecipeData } from "../Types.js";

// Define the mutators with their appropriate types
type MyArrayMutators = {
    [key: string]: Mutator<RecipeData, object>;
    //default: Mutator<RecipeData, object>;
};

// Explicit cast to match the expected type
const myArrayMutators: MyArrayMutators = {
    insert: arrayMutators.insert,
    concat: arrayMutators.concat,
    move: arrayMutators.move,
    pop: arrayMutators.pop,
    push: arrayMutators.push,
    remove: arrayMutators.remove
    //default: arrayMutators.default, // Cast to the correct Mutator type
};

export default myArrayMutators;
