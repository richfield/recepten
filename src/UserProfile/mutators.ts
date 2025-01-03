import arrayMutators  from 'final-form-arrays';
import { Mutator } from 'final-form'
import { UserProfile } from "../Types.js";

// Define the mutators with their appropriate types
type ProfileArrayMutators = {
    [key: string]: Mutator<UserProfile, object>;
    //default: Mutator<RecipeData, object>;
};

// Explicit cast to match the expected type
const myArrayMutators: ProfileArrayMutators = {
    insert: arrayMutators.insert as Mutator<UserProfile, object>,
    concat: arrayMutators.concat as Mutator<UserProfile, object>,
    move: arrayMutators.move as Mutator<UserProfile, object>,
    pop: arrayMutators.pop as Mutator<UserProfile, object>,
    push: arrayMutators.push as Mutator<UserProfile, object>,
    remove: arrayMutators.remove as Mutator<UserProfile, object>
    //default: arrayMutators.default, // Cast to the correct Mutator type
};

export default myArrayMutators;
