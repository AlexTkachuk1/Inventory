import {randomRangeInt} from "cc";

declare global {
    interface Array<T> {
        removeAt(index: number): Array<T>;
        random(): T;
        clear(): void;
        exists(value: T): boolean;
    }
}

Array.prototype.removeAt = function removeAt(index: number) {
    return this.splice(index, 1);
};
Array.prototype.random = function random() {
    const randIndex = randomRangeInt(0, this.length);
    return this.slice(randIndex, randIndex + 1)[0];
};
Array.prototype.clear = function clear() {
    this.length = 0;
};
Array.prototype.exists = function exists(value) {
    return this.indexOf(value) != -1;
};

export {};