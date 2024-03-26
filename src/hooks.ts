import { Liquid } from 'liquidjs';
import type {
    Hook,
    Hooks, HooksContainer,
} from '../interface/hooks.d.ts';
import { isHooksContainer, matches } from './helpers.js';

const templater = new Liquid();
templater.registerFilter('replace_regex', (v: string, search: string, replace: string, flags?: string) => v.replace(new RegExp(search, flags), replace));

export default class HooksRepository {
    #hooks: Map<string, Hook> = new Map();

    all = () => Array.from(this.#hooks.values());

    clear = () => {
        this.#hooks.clear();
    };

    filter = (criteria: object | ((hook: Hook) => boolean), limit: number = 0) => {
        const filter = criteria instanceof Function
            ? criteria
            : (hook: Hook) => matches(hook, criteria);

        const needles: Hooks = [];
        let haystack = [...this.all()];
        let result;

        switch (limit) {
            case 0:
                return this.all().filter(filter);

            case 1:
                result = this.all().find(filter);
                return result ? [result] : [];

            default:
                while (needles.length < limit) {
                    result = haystack.findIndex(filter);
                    if (result === -1) break;
                    needles.push(haystack[result]);
                    haystack = haystack.slice(result);
                }
                return needles;
        }
    };

    find = (criteria: object | ((hook: Hook) => boolean) | string) => {
        if (typeof criteria === 'string') {
            return this.#hooks.get(criteria);
        }
        const result = this.filter(criteria, 1);
        return result.length ? result[0] : undefined;
    };

    push = (...sources: Array<HooksContainer | Hooks>) => sources.flatMap((source) => {
            let container: HooksContainer;
            if (isHooksContainer(source)) {
                container = source;
            } else {
                container = {
                    $schema: 'https://raw.githubusercontent.com/wp-hooks/generator/0.9.0/schema.json',
                    hooks: source,
                };
            }

            const { hooks, docLinkTemplate } = container;
            let transform: undefined | ((hook: Hook) => Hook);

            if (docLinkTemplate) {
                const template = templater.parse(docLinkTemplate);
                transform = (hook: Hook) => ({
                    ...hook,
                    docLink() {
                        return templater.renderSync(template, {
                            name: this.name,
                            type: this.type,
                        });
                    },
                });
            }

            if (transform) for (const hook of hooks) this.#hooks.set(hook.name, transform(hook));
            else for (const hook of hooks) this.#hooks.set(hook.name, hook);

            return hooks;
        });
}
