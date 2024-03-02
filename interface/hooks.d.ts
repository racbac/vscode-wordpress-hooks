import { HooksContainer as __HooksContainer, Hook as __Hook } from '@wp-hooks/wordpress-core/interface';

export { Tag, Tags, Doc } from '@wp-hooks/wordpress-core/interface';

export interface Hook extends __Hook {
    /**
     * Get link to documentation.
     */
    docLink?: () => string
}

export type Hooks = Hook[];

export interface HooksContainer extends __HooksContainer {
    /**
     * Template for link to documentation.
     *
     * {@link https://liquidjs.com/tutorials/intro-to-liquid.html#Outputs Docs}
     */
    docLinkTemplate?: string,
    hooks: Hooks
}
