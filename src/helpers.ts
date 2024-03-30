import type { HooksContainer } from '../interface/hooks.d.ts';

/**
 * Performs a partial deep comparison between object and source to determine if object contains equivalent property values. 
 * @param object Object to inspect.
 * @param source Object to match.
 * @returns {Boolean}
 */
export function matches(object: any, source: any): boolean {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            return typeof source[key] === 'object'
                ? matches(object[key], source[key])
                : object[key] === source[key];
        }
    }

  return JSON.stringify(object) === JSON.stringify(source);
}

/**
 * Type-check a HooksContainer.
 * @param value Potential HooksContainer.
 * @returns {Boolean}
 */
export function isHooksContainer(value: Object): value is HooksContainer {
    if (!Object.prototype.hasOwnProperty.call(value, 'hooks')) return false;
    return (value as HooksContainer).hooks instanceof Array;
}
