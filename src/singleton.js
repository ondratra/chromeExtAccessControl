const constructorLock = Symbol();
const singletonInstance = Symbol();

export default class Singleton {


    // constructor lock prevents class from being instantiate via 'new Singleton()'
    // because constructorLock exists only in this file
    constructor(lock) {
        if (lock !== constructorLock) {
            throw new Error('Cannot instantiate singleton directly. Use getter "instance".');
        }
    }


    static get instance() {
        // 'this' refers to class prototype in static methods
        if (!this[singletonInstance]) {
            this[singletonInstance] = new this(constructorLock);
        }

        return this[singletonInstance];
    }

}
