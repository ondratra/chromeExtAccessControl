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
        if (!this[singletonInstance]) {
            this[singletonInstance] = new Singleton(constructorLock);
        }

        return this[singletonInstance];
    }

}
