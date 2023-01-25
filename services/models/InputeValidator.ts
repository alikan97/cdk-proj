import { Item } from "./Model"
import { v4 as uuidv4 } from 'uuid';

export function validateEntry (arg: any) : Item{
    if (!(arg as Item).itemId) {
        throw new Error('Value for id is required!');
    } else if (!(arg as Item).name) {
        throw new Error('Name is required!');
    }

    return {
        itemId: uuidv4(),
        name: arg.name,
        quantity: arg.quantity,
        location: arg.location
    } as Item;
}