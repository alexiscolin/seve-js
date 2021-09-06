/**
 * @module module
 */

const Module = class {
    constructor (components) {
        this.components = components; 
    }

    /** 
     * Method that retrieve a component from the component list
     * @see {getComponent}
     * @param {string} comp - Name of the component you want retrieve {@link Component})
     * @param {string} [id] - The id of the component you want. If not set, the first entry will be returned
     * @returns {object} - The component
     * @example
     * this.getComponent("canvas", "main");
     */
    getComponent (comp, id) {
        // error function
        const _getComponent = (comp) => {
            const _component = this.components.get(comp);
            if (!_component) {
                throw `Component "${comp}" doesn't exist.`;
            } else {
                return _component;
            }
        }

        // get the component and throw error if needed
        try {
            const component = _getComponent(comp);
            return id ? component?.get(id) : component?.values().next().value;

        } catch (e) {
            console.error(e);
        }
    }
}

export default Module