
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.48.0 */

    const { Error: Error_1, Object: Object_1, console: console_1$1 } = globals;

    // (251:0) {:else}
    function create_else_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location$1 = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location: location$1,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\extra\Header.svelte generated by Svelte v3.48.0 */
    const file$g = "src\\lib\\extra\\Header.svelte";

    // (58:3) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "img/login.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "19px");
    			attr_dev(img, "height", "auto");
    			attr_dev(img, "alt", "login");
    			add_location(img, file$g, 67, 5, 1488);
    			attr_dev(button, "type", "logoutFrom");
    			attr_dev(button, "class", "btnLogout svelte-1c0h7q9");
    			set_style(button, "text-decoration", "none");
    			set_style(button, "border", "none");
    			add_location(button, file$g, 58, 4, 1272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(58:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:3) {#if !document.cookie}
    function create_if_block$2(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "img/logout.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "28px");
    			attr_dev(img, "height", "auto");
    			attr_dev(img, "alt", "logout");
    			add_location(img, file$g, 50, 5, 1145);
    			attr_dev(button, "type", "loginForm");
    			attr_dev(button, "class", "btnLogin svelte-1c0h7q9");
    			set_style(button, "text-decoration", "none");
    			set_style(button, "border", "none");
    			add_location(button, file$g, 41, 4, 932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:3) {#if !document.cookie}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let nav;
    	let a0;
    	let t3;
    	let div3;
    	let div2;
    	let a1;
    	let img;
    	let img_src_value;
    	let t4;

    	function select_block_type(ctx, dirty) {
    		if (!document.cookie) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type();
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*dateTime*/ ctx[0]);
    			t1 = space();
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "InnoAfisha";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			a1 = element("a");
    			img = element("img");
    			t4 = space();
    			if_block.c();
    			attr_dev(div0, "class", "corner svelte-1c0h7q9");
    			add_location(div0, file$g, 15, 2, 378);
    			attr_dev(div1, "class", "corner svelte-1c0h7q9");
    			add_location(div1, file$g, 14, 1, 355);
    			attr_dev(a0, "class", "titleLink svelte-1c0h7q9");
    			attr_dev(a0, "href", "#/");
    			add_location(a0, file$g, 22, 2, 525);
    			attr_dev(nav, "class", "title svelte-1c0h7q9");
    			set_style(nav, "font-family", "'Lemon', cursive");
    			set_style(nav, "font-size", "30px");
    			set_style(nav, "color", "#1F3E24");
    			add_location(nav, file$g, 18, 1, 425);
    			if (!src_url_equal(img.src, img_src_value = "img/favourite.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "30px");
    			attr_dev(img, "height", "auto");
    			attr_dev(img, "alt", "favourite");
    			add_location(img, file$g, 33, 4, 795);
    			attr_dev(a1, "class", "liked svelte-1c0h7q9");
    			attr_dev(a1, "href", "#/favourites");
    			set_style(a1, "text-decoration", "none");
    			set_style(a1, "color", "#4E7149");
    			add_location(a1, file$g, 27, 3, 641);
    			attr_dev(div2, "class", "social_block");
    			add_location(div2, file$g, 26, 2, 611);
    			attr_dev(div3, "class", "corner_social svelte-1c0h7q9");
    			add_location(div3, file$g, 25, 1, 581);
    			attr_dev(header, "class", "svelte-1c0h7q9");
    			add_location(header, file$g, 13, 0, 345);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(header, t1);
    			append_dev(header, nav);
    			append_dev(nav, a0);
    			append_dev(header, t3);
    			append_dev(header, div3);
    			append_dev(div3, div2);
    			append_dev(div2, a1);
    			append_dev(a1, img);
    			append_dev(div2, t4);
    			if_block.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dateTime*/ 1) set_data_dev(t0, /*dateTime*/ ctx[0]);
    			if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let logoutFrom;
    	let loginForm;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let dateTime = String(new Date());
    	dateTime = dateTime.slice(0, 15);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		loginForm();
    	};

    	const click_handler_1 = () => {
    		logoutFrom();
    	};

    	$$self.$capture_state = () => ({ dateTime, push, loginForm, logoutFrom });

    	$$self.$inject_state = $$props => {
    		if ('dateTime' in $$props) $$invalidate(0, dateTime = $$props.dateTime);
    		if ('loginForm' in $$props) $$invalidate(1, loginForm = $$props.loginForm);
    		if ('logoutFrom' in $$props) $$invalidate(2, logoutFrom = $$props.logoutFrom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(2, logoutFrom = async () => {
    		document.cookie = "access_token" + "=; Max-Age=-1;";
    		location.reload();
    	});

    	$$invalidate(1, loginForm = async () => {
    		await push("#/auth");
    		location.reload();
    	});

    	return [dateTime, loginForm, logoutFrom, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\lib\extra\Footer.svelte generated by Svelte v3.48.0 */

    const file$f = "src\\lib\\extra\\Footer.svelte";

    function create_fragment$f(ctx) {
    	let footer;
    	let div9;
    	let div5;
    	let div1;
    	let div0;
    	let h6;
    	let t1;
    	let ul;
    	let li0;
    	let t3;
    	let li1;
    	let t5;
    	let li2;
    	let t7;
    	let li3;
    	let t9;
    	let li4;
    	let t11;
    	let div4;
    	let div3;
    	let div2;
    	let p0;
    	let t13;
    	let div8;
    	let div7;
    	let div6;
    	let p1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div9 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Contact us if you have any questions";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "n.grigorenko@innopolis.university";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "i.chebykin@innopolis.university";
    			t5 = space();
    			li2 = element("li");
    			li2.textContent = "v.ryabenko@innopolis.university";
    			t7 = space();
    			li3 = element("li");
    			li3.textContent = "k.koshmanova@innopolis.university";
    			t9 = space();
    			li4 = element("li");
    			li4.textContent = "i.yusupov@innopolis.university";
    			t11 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Be the first to know about new events in Innopolis!";
    			t13 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			p1 = element("p");
    			p1.textContent = "Copyright © 2022 All rights reserved.";
    			attr_dev(h6, "class", "svelte-1ii2nsl");
    			add_location(h6, file$f, 5, 5, 156);
    			attr_dev(li0, "class", "svelte-1ii2nsl");
    			add_location(li0, file$f, 7, 6, 220);
    			attr_dev(li1, "class", "svelte-1ii2nsl");
    			add_location(li1, file$f, 8, 6, 270);
    			attr_dev(li2, "class", "svelte-1ii2nsl");
    			add_location(li2, file$f, 9, 6, 318);
    			attr_dev(li3, "class", "svelte-1ii2nsl");
    			add_location(li3, file$f, 10, 6, 366);
    			attr_dev(li4, "class", "svelte-1ii2nsl");
    			add_location(li4, file$f, 11, 6, 416);
    			attr_dev(ul, "class", "svelte-1ii2nsl");
    			add_location(ul, file$f, 6, 5, 208);
    			attr_dev(div0, "class", "footer-widget svelte-1ii2nsl");
    			add_location(div0, file$f, 4, 4, 122);
    			attr_dev(div1, "class", "col-lg-2 col-md-3 col-sm-6");
    			add_location(div1, file$f, 3, 3, 75);
    			attr_dev(p0, "class", "svelte-1ii2nsl");
    			add_location(p0, file$f, 19, 6, 628);
    			attr_dev(div2, "class", "footer-newslatter");
    			add_location(div2, file$f, 18, 5, 589);
    			attr_dev(div3, "class", "footer-widget svelte-1ii2nsl");
    			add_location(div3, file$f, 17, 4, 555);
    			attr_dev(div4, "class", "col-lg-3 offset-lg-1 col-md-6 col-sm-6");
    			add_location(div4, file$f, 16, 3, 497);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$f, 2, 2, 53);
    			attr_dev(p1, "class", "svelte-1ii2nsl");
    			add_location(p1, file$f, 29, 5, 858);
    			attr_dev(div6, "class", "footer-copyright-text svelte-1ii2nsl");
    			add_location(div6, file$f, 28, 4, 816);
    			attr_dev(div7, "class", "col-lg-12 text-center");
    			add_location(div7, file$f, 27, 3, 775);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$f, 26, 2, 753);
    			attr_dev(div9, "class", "container");
    			add_location(div9, file$f, 1, 1, 26);
    			attr_dev(footer, "class", "footer svelte-1ii2nsl");
    			add_location(footer, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div9);
    			append_dev(div9, div5);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(div0, t1);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(ul, t7);
    			append_dev(ul, li3);
    			append_dev(ul, t9);
    			append_dev(ul, li4);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\lib\extra\services\Spinner.svelte generated by Svelte v3.48.0 */

    const file$e = "src\\lib\\extra\\services\\Spinner.svelte";

    function create_fragment$e(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "circle svelte-xgavu2");
    			set_style(div, "--size", /*size*/ ctx[0] + /*unit*/ ctx[2]);
    			set_style(div, "--color", /*color*/ ctx[1]);
    			add_location(div, file$e, 5, 0, 110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size, unit*/ 5) {
    				set_style(div, "--size", /*size*/ ctx[0] + /*unit*/ ctx[2]);
    			}

    			if (dirty & /*color*/ 2) {
    				set_style(div, "--color", /*color*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Spinner', slots, []);
    	let { size = 60 } = $$props;
    	let { color = "#FF3E00" } = $$props;
    	let { unit = "px" } = $$props;
    	const writable_props = ['size', 'color', 'unit'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(2, unit = $$props.unit);
    	};

    	$$self.$capture_state = () => ({ size, color, unit });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(2, unit = $$props.unit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, color, unit];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { size: 0, color: 1, unit: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get size() {
    		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(
            timeoutErrorMessage,
            config,
            config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      },

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw enhanceError(e, this, 'E_JSON_PARSE');
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults_1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    var name = "axios";
    var version = "0.21.4";
    var description = "Promise based HTTP client for the browser and node.js";
    var main = "index.js";
    var scripts = {
    	test: "grunt test",
    	start: "node ./sandbox/server.js",
    	build: "NODE_ENV=production grunt build",
    	preversion: "npm test",
    	version: "npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json",
    	postversion: "git push && git push --tags",
    	examples: "node ./examples/server.js",
    	coveralls: "cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
    	fix: "eslint --fix lib/**/*.js"
    };
    var repository = {
    	type: "git",
    	url: "https://github.com/axios/axios.git"
    };
    var keywords = [
    	"xhr",
    	"http",
    	"ajax",
    	"promise",
    	"node"
    ];
    var author = "Matt Zabriskie";
    var license = "MIT";
    var bugs = {
    	url: "https://github.com/axios/axios/issues"
    };
    var homepage = "https://axios-http.com";
    var devDependencies = {
    	coveralls: "^3.0.0",
    	"es6-promise": "^4.2.4",
    	grunt: "^1.3.0",
    	"grunt-banner": "^0.6.0",
    	"grunt-cli": "^1.2.0",
    	"grunt-contrib-clean": "^1.1.0",
    	"grunt-contrib-watch": "^1.0.0",
    	"grunt-eslint": "^23.0.0",
    	"grunt-karma": "^4.0.0",
    	"grunt-mocha-test": "^0.13.3",
    	"grunt-ts": "^6.0.0-beta.19",
    	"grunt-webpack": "^4.0.2",
    	"istanbul-instrumenter-loader": "^1.0.0",
    	"jasmine-core": "^2.4.1",
    	karma: "^6.3.2",
    	"karma-chrome-launcher": "^3.1.0",
    	"karma-firefox-launcher": "^2.1.0",
    	"karma-jasmine": "^1.1.1",
    	"karma-jasmine-ajax": "^0.1.13",
    	"karma-safari-launcher": "^1.0.0",
    	"karma-sauce-launcher": "^4.3.6",
    	"karma-sinon": "^1.0.5",
    	"karma-sourcemap-loader": "^0.3.8",
    	"karma-webpack": "^4.0.2",
    	"load-grunt-tasks": "^3.5.2",
    	minimist: "^1.2.0",
    	mocha: "^8.2.1",
    	sinon: "^4.5.0",
    	"terser-webpack-plugin": "^4.2.3",
    	typescript: "^4.0.5",
    	"url-search-params": "^0.10.0",
    	webpack: "^4.44.2",
    	"webpack-dev-server": "^3.11.0"
    };
    var browser = {
    	"./lib/adapters/http.js": "./lib/adapters/xhr.js"
    };
    var jsdelivr = "dist/axios.min.js";
    var unpkg = "dist/axios.min.js";
    var typings = "./index.d.ts";
    var dependencies = {
    	"follow-redirects": "^1.14.0"
    };
    var bundlesize = [
    	{
    		path: "./dist/axios.min.js",
    		threshold: "5kB"
    	}
    ];
    var pkg = {
    	name: name,
    	version: version,
    	description: description,
    	main: main,
    	scripts: scripts,
    	repository: repository,
    	keywords: keywords,
    	author: author,
    	license: license,
    	bugs: bugs,
    	homepage: homepage,
    	devDependencies: devDependencies,
    	browser: browser,
    	jsdelivr: jsdelivr,
    	unpkg: unpkg,
    	typings: typings,
    	dependencies: dependencies,
    	bundlesize: bundlesize
    };

    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};
    var currentVerArr = pkg.version.split('.');

    /**
     * Compare package versions
     * @param {string} version
     * @param {string?} thanVersion
     * @returns {boolean}
     */
    function isOlderVersion(version, thanVersion) {
      var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
      var destVer = version.split('.');
      for (var i = 0; i < 3; i++) {
        if (pkgVersionArr[i] > destVer[i]) {
          return true;
        } else if (pkgVersionArr[i] < destVer[i]) {
          return false;
        }
      }
      return false;
    }

    /**
     * Transitional option validator
     * @param {function|boolean?} validator
     * @param {string?} version
     * @param {string} message
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      var isDeprecated = version && isOlderVersion(version);

      function formatMessage(opt, desc) {
        return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new Error(formatMessage(opt, ' has been removed in ' + version));
        }

        if (isDeprecated && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new TypeError('option ' + opt + ' must be ' + result);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw Error('Unknown option ' + opt);
        }
      }
    }

    var validator = {
      isOlderVersion: isOlderVersion,
      assertOptions: assertOptions,
      validators: validators$1
    };

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
          forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
          clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    /* src\lib\event\eventLoad.svelte generated by Svelte v3.48.0 */
    const file$d = "src\\lib\\event\\eventLoad.svelte";

    // (1:0) <script lang="ts">import Spinner from "../extra/services/Spinner.svelte";  import axios from "axios";  export let params = "";  let event = [];  async function getEvent() {      await axios          .get(`https://innoafisha.pythonanywhere.com/api/v1/events/` + params)          .then(async (res) => {          if (res.status === 200) {              setTimeout(() => {                  event = res.data;              }
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import Spinner from \\\"../extra/services/Spinner.svelte\\\";  import axios from \\\"axios\\\";  export let params = \\\"\\\";  let event = [];  async function getEvent() {      await axios          .get(`https://innoafisha.pythonanywhere.com/api/v1/events/` + params)          .then(async (res) => {          if (res.status === 200) {              setTimeout(() => {                  event = res.data;              }",
    		ctx
    	});

    	return block;
    }

    // (24:0) {:then getEvent}
    function create_then_block$2(ctx) {
    	let div8;
    	let div5;
    	let div4;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let div0;
    	let button0;
    	let t1_value = /*event*/ ctx[0]["date"] + "";
    	let t1;
    	let t2;
    	let button1;
    	let t3_value = /*event*/ ctx[0]["location"] + "";
    	let t3;
    	let t4;
    	let div3;
    	let div2;
    	let button2;
    	let t5_value = /*event*/ ctx[0]["time"] + "";
    	let t5;
    	let t6;
    	let a;
    	let button3;
    	let a_href_value;
    	let t8;
    	let div7;
    	let p0;
    	let t9_value = /*event*/ ctx[0]["event_name"] + "";
    	let t9;
    	let t10;
    	let div6;
    	let p1;
    	let t11_value = /*event*/ ctx[0]["description"] + "";
    	let t11;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			t1 = text(t1_value);
    			t2 = space();
    			button1 = element("button");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button2 = element("button");
    			t5 = text(t5_value);
    			t6 = space();
    			a = element("a");
    			button3 = element("button");
    			button3.textContent = "Site";
    			t8 = space();
    			div7 = element("div");
    			p0 = element("p");
    			t9 = text(t9_value);
    			t10 = space();
    			div6 = element("div");
    			p1 = element("p");
    			t11 = text(t11_value);
    			attr_dev(img, "class", "event_pic svelte-1k7tqhw");
    			if (!src_url_equal(img.src, img_src_value = /*event*/ ctx[0]["picture"])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "373px");
    			attr_dev(img, "height", "373px");
    			attr_dev(img, "alt", "event");
    			add_location(img, file$d, 28, 4, 736);
    			attr_dev(button0, "class", "rectangle2 svelte-1k7tqhw");
    			add_location(button0, file$d, 37, 6, 923);
    			attr_dev(button1, "class", "rectangle2 svelte-1k7tqhw");
    			add_location(button1, file$d, 38, 6, 982);
    			attr_dev(div0, "class", "line1 svelte-1k7tqhw");
    			add_location(div0, file$d, 36, 5, 896);
    			attr_dev(div1, "class", "dateplace svelte-1k7tqhw");
    			add_location(div1, file$d, 35, 4, 866);
    			attr_dev(button2, "class", "rectangle2 svelte-1k7tqhw");
    			add_location(button2, file$d, 43, 6, 1123);
    			attr_dev(button3, "class", "btn svelte-1k7tqhw");
    			add_location(button3, file$d, 45, 7, 1215);
    			attr_dev(a, "href", a_href_value = /*event*/ ctx[0]["link"]);
    			add_location(a, file$d, 44, 6, 1182);
    			attr_dev(div2, "class", "line2 svelte-1k7tqhw");
    			add_location(div2, file$d, 42, 5, 1096);
    			attr_dev(div3, "class", "numsite svelte-1k7tqhw");
    			add_location(div3, file$d, 41, 4, 1068);
    			attr_dev(div4, "class", "event_pic svelte-1k7tqhw");
    			add_location(div4, file$d, 26, 3, 656);
    			attr_dev(div5, "class", "col_left svelte-1k7tqhw");
    			add_location(div5, file$d, 25, 2, 629);
    			attr_dev(p0, "class", "title svelte-1k7tqhw");
    			add_location(p0, file$d, 52, 3, 1338);
    			attr_dev(p1, "class", "description svelte-1k7tqhw");
    			add_location(p1, file$d, 56, 4, 1426);
    			attr_dev(div6, "class", "rectangle1 svelte-1k7tqhw");
    			add_location(div6, file$d, 55, 3, 1396);
    			attr_dev(div7, "class", "col_right svelte-1k7tqhw");
    			add_location(div7, file$d, 51, 2, 1310);
    			attr_dev(div8, "class", "columns svelte-1k7tqhw");
    			add_location(div8, file$d, 24, 1, 604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div5);
    			append_dev(div5, div4);
    			append_dev(div4, img);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(button1, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button2);
    			append_dev(button2, t5);
    			append_dev(div2, t6);
    			append_dev(div2, a);
    			append_dev(a, button3);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, p0);
    			append_dev(p0, t9);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, p1);
    			append_dev(p1, t11);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*event*/ 1 && !src_url_equal(img.src, img_src_value = /*event*/ ctx[0]["picture"])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*event*/ 1 && t1_value !== (t1_value = /*event*/ ctx[0]["date"] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*event*/ 1 && t3_value !== (t3_value = /*event*/ ctx[0]["location"] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*event*/ 1 && t5_value !== (t5_value = /*event*/ ctx[0]["time"] + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*event*/ 1 && a_href_value !== (a_href_value = /*event*/ ctx[0]["link"])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*event*/ 1 && t9_value !== (t9_value = /*event*/ ctx[0]["event_name"] + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*event*/ 1 && t11_value !== (t11_value = /*event*/ ctx[0]["description"] + "")) set_data_dev(t11, t11_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(24:0) {:then getEvent}",
    		ctx
    	});

    	return block;
    }

    // (22:16)    <Spinner />  {:then getEvent}
    function create_pending_block$2(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(22:16)    <Spinner />  {:then getEvent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let await_block_anchor;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 3,
    		blocks: [,,,]
    	};

    	handle_promise(/*promise*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EventLoad', slots, []);
    	let { params = "" } = $$props;
    	let event = [];

    	async function getEvent() {
    		await axios.get(`https://innoafisha.pythonanywhere.com/api/v1/events/` + params).then(async res => {
    			if (res.status === 200) {
    				setTimeout(
    					() => {
    						$$invalidate(0, event = res.data);
    					},
    					0
    				);
    			}
    		}).catch(async () => {
    			location.reload();
    		});
    	}

    	let promise = getEvent();
    	const writable_props = ['params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EventLoad> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(2, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		Spinner,
    		axios,
    		params,
    		event,
    		getEvent,
    		promise
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(2, params = $$props.params);
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    		if ('promise' in $$props) $$invalidate(1, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [event, promise, params];
    }

    class EventLoad extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { params: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EventLoad",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get params() {
    		throw new Error("<EventLoad>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EventLoad>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\EventPage.svelte generated by Svelte v3.48.0 */
    const file$c = "src\\routes\\EventPage.svelte";

    function create_fragment$c(ctx) {
    	let main;
    	let body;
    	let header;
    	let t0;
    	let eventload;
    	let t1;
    	let div;
    	let t2;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });

    	eventload = new EventLoad({
    			props: { params: /*params*/ ctx[0].id },
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(eventload.$$.fragment);
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "class", "spacespace svelte-31cq22");
    			add_location(div, file$c, 10, 2, 276);
    			attr_dev(body, "class", "svelte-31cq22");
    			add_location(body, file$c, 7, 1, 216);
    			add_location(main, file$c, 6, 0, 207);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			mount_component(header, body, null);
    			append_dev(body, t0);
    			mount_component(eventload, body, null);
    			append_dev(body, t1);
    			append_dev(body, div);
    			append_dev(body, t2);
    			mount_component(footer, body, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const eventload_changes = {};
    			if (dirty & /*params*/ 1) eventload_changes.params = /*params*/ ctx[0].id;
    			eventload.$set(eventload_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(eventload.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(eventload.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(eventload);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EventPage', slots, []);
    	let { params } = $$props;
    	const writable_props = ['params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EventPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({ Header, Footer, EventLoad, params });

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(0, params = $$props.params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [params];
    }

    class EventPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EventPage",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[0] === undefined && !('params' in props)) {
    			console.warn("<EventPage> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<EventPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EventPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\extra\services\TextImage.svelte generated by Svelte v3.48.0 */

    const file$b = "src\\lib\\extra\\services\\TextImage.svelte";

    function create_fragment$b(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "title svelte-j7wu53");
    			add_location(div, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextImage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextImage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TextImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextImage",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\lib\extra\services\ButtonContainer.svelte generated by Svelte v3.48.0 */

    const file$a = "src\\lib\\extra\\services\\ButtonContainer.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "id", "myBtnContainer");
    			attr_dev(div, "class", "svelte-1yeucvb");
    			add_location(div, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonContainer', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ButtonContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class ButtonContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonContainer",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\lib\extra\services\Gallery.svelte generated by Svelte v3.48.0 */

    const file$9 = "src\\lib\\extra\\services\\Gallery.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "row svelte-lv2zij");
    			add_location(div, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gallery', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\lib\home\Filters.svelte generated by Svelte v3.48.0 */
    const file$8 = "src\\lib\\home\\Filters.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (50:2) {#each types as type}
    function create_each_block_1$1(ctx) {
    	let button;
    	let t0_value = /*type*/ ctx[18] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "btn svelte-w2rdhu");
    			attr_dev(button, "data-name", /*type*/ ctx[18]);
    			toggle_class(button, "active", /*selected*/ ctx[0] === /*type*/ ctx[18]);
    			add_location(button, file$8, 50, 3, 1813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*filterSelection*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, types*/ 9) {
    				toggle_class(button, "active", /*selected*/ ctx[0] === /*type*/ ctx[18]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(50:2) {#each types as type}",
    		ctx
    	});

    	return block;
    }

    // (49:1) <ButtonContainer>
    function create_default_slot_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*types*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*types, selected, filterSelection*/ 25) {
    				each_value_1 = /*types*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(49:1) <ButtonContainer>",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">import ButtonContainer from "../extra/services/ButtonContainer.svelte";  import Gallery from "../extra/services/Gallery.svelte";  import eventFev from "../../main";  import axios from "axios";  import { push }
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import ButtonContainer from \\\"../extra/services/ButtonContainer.svelte\\\";  import Gallery from \\\"../extra/services/Gallery.svelte\\\";  import eventFev from \\\"../../main\\\";  import axios from \\\"axios\\\";  import { push }",
    		ctx
    	});

    	return block;
    }

    // (64:1) {:then getThings}
    function create_then_block$1(ctx) {
    	let gallery;
    	let current;

    	gallery = new Gallery({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallery, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallery_changes = {};

    			if (dirty & /*$$scope, events, addFavEvent, selected*/ 2097159) {
    				gallery_changes.$$scope = { dirty, ctx };
    			}

    			gallery.$set(gallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(64:1) {:then getThings}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {:else}
    function create_else_block(ctx) {
    	let div6;
    	let div5;
    	let a;
    	let img0;
    	let img0_src_value;
    	let a_href_value;
    	let t0;
    	let div1;
    	let div0;
    	let h4;
    	let t1_value = /*event*/ ctx[15]["event_name"] + "";
    	let t1;
    	let t2;
    	let div3;
    	let hr;
    	let t3;
    	let div2;
    	let p0;
    	let t4_value = /*event*/ ctx[15]["date"] + "";
    	let t4;
    	let t5;
    	let t6_value = /*event*/ ctx[15]["time"] + "";
    	let t6;
    	let t7;
    	let p1;
    	let t8_value = /*event*/ ctx[15]["location"] + "";
    	let t8;
    	let t9;
    	let div4;
    	let button0;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let button1;
    	let img2;
    	let img2_src_value;
    	let t11;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[10](/*event*/ ctx[15]);
    	}

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[11](/*event*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			hr = element("hr");
    			t3 = space();
    			div2 = element("div");
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = text(", ");
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			div4 = element("div");
    			button0 = element("button");
    			img1 = element("img");
    			t10 = space();
    			button1 = element("button");
    			img2 = element("img");
    			t11 = space();
    			if (!src_url_equal(img0.src, img0_src_value = /*event*/ ctx[15]["picture"])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			set_style(img0, "width", "100%");
    			attr_dev(img0, "class", "svelte-w2rdhu");
    			add_location(img0, file$8, 127, 8, 3724);
    			attr_dev(a, "class", "pickpick svelte-w2rdhu");
    			attr_dev(a, "href", a_href_value = "#/event/" + /*event*/ ctx[15].id);
    			add_location(a, file$8, 126, 7, 3668);
    			attr_dev(h4, "class", "svelte-w2rdhu");
    			add_location(h4, file$8, 138, 9, 3969);
    			attr_dev(div0, "class", "imgTitle svelte-w2rdhu");
    			set_style(div0, "text-align", "center");
    			add_location(div0, file$8, 134, 8, 3878);
    			attr_dev(div1, "class", "containerName svelte-w2rdhu");
    			add_location(div1, file$8, 133, 7, 3841);
    			attr_dev(hr, "class", "svelte-w2rdhu");
    			add_location(hr, file$8, 142, 8, 4082);
    			attr_dev(p0, "class", "svelte-w2rdhu");
    			add_location(p0, file$8, 144, 9, 4135);
    			attr_dev(p1, "class", "svelte-w2rdhu");
    			add_location(p1, file$8, 145, 9, 4185);
    			attr_dev(div2, "class", "descriptInfo svelte-w2rdhu");
    			add_location(div2, file$8, 143, 8, 4098);
    			set_style(div3, "text-align", "center");
    			add_location(div3, file$8, 141, 7, 4039);
    			attr_dev(img1, "class", "likedEv svelte-w2rdhu");
    			if (!src_url_equal(img1.src, img1_src_value = "img/liked.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "like");
    			add_location(img1, file$8, 157, 9, 4502);
    			attr_dev(button0, "type", "addFavEvent");
    			attr_dev(button0, "class", "bLikedEv svelte-w2rdhu");
    			add_location(button0, file$8, 149, 8, 4286);
    			attr_dev(img2, "class", "likedEv svelte-w2rdhu");
    			if (!src_url_equal(img2.src, img2_src_value = "img/dislike.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "dislike");
    			add_location(img2, file$8, 171, 9, 4847);
    			attr_dev(button1, "type", "addFavEvent");
    			attr_dev(button1, "class", "bLikedEv svelte-w2rdhu");
    			add_location(button1, file$8, 163, 8, 4628);
    			attr_dev(div4, "class", "buttonLiked svelte-w2rdhu");
    			add_location(div4, file$8, 148, 7, 4251);
    			attr_dev(div5, "class", "content svelte-w2rdhu");
    			add_location(div5, file$8, 125, 6, 3638);
    			attr_dev(div6, "class", "column svelte-w2rdhu");
    			toggle_class(div6, "show", /*selected*/ ctx[0] === /*event*/ ctx[15]["type"]);
    			add_location(div6, file$8, 124, 5, 3570);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, a);
    			append_dev(a, img0);
    			append_dev(div5, t0);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t1);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, hr);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div2, t7);
    			append_dev(div2, p1);
    			append_dev(p1, t8);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(button0, img1);
    			append_dev(div4, t10);
    			append_dev(div4, button1);
    			append_dev(button1, img2);
    			append_dev(div6, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_2, false, false, false),
    					listen_dev(button1, "click", click_handler_3, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*events*/ 2 && !src_url_equal(img0.src, img0_src_value = /*event*/ ctx[15]["picture"])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*events*/ 2 && a_href_value !== (a_href_value = "#/event/" + /*event*/ ctx[15].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*events*/ 2 && t1_value !== (t1_value = /*event*/ ctx[15]["event_name"] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*events*/ 2 && t4_value !== (t4_value = /*event*/ ctx[15]["date"] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*events*/ 2 && t6_value !== (t6_value = /*event*/ ctx[15]["time"] + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*events*/ 2 && t8_value !== (t8_value = /*event*/ ctx[15]["location"] + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*selected, events*/ 3) {
    				toggle_class(div6, "show", /*selected*/ ctx[0] === /*event*/ ctx[15]["type"]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(124:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#if selected === "all"}
    function create_if_block$1(ctx) {
    	let div6;
    	let div5;
    	let a;
    	let img0;
    	let img0_src_value;
    	let a_href_value;
    	let t0;
    	let div1;
    	let div0;
    	let h4;
    	let t1_value = /*event*/ ctx[15]["event_name"] + "";
    	let t1;
    	let t2;
    	let div3;
    	let hr;
    	let t3;
    	let div2;
    	let p0;
    	let t4_value = /*event*/ ctx[15]["date"] + "";
    	let t4;
    	let t5;
    	let t6_value = /*event*/ ctx[15]["time"] + "";
    	let t6;
    	let t7;
    	let p1;
    	let t8_value = /*event*/ ctx[15]["location"] + "";
    	let t8;
    	let t9;
    	let div4;
    	let button0;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let button1;
    	let img2;
    	let img2_src_value;
    	let t11;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*event*/ ctx[15]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*event*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			hr = element("hr");
    			t3 = space();
    			div2 = element("div");
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = text(", ");
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			div4 = element("div");
    			button0 = element("button");
    			img1 = element("img");
    			t10 = space();
    			button1 = element("button");
    			img2 = element("img");
    			t11 = space();
    			if (!src_url_equal(img0.src, img0_src_value = /*event*/ ctx[15]["picture"])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			set_style(img0, "width", "100%");
    			attr_dev(img0, "class", "svelte-w2rdhu");
    			add_location(img0, file$8, 70, 8, 2264);
    			attr_dev(a, "class", "pickpick svelte-w2rdhu");
    			attr_dev(a, "href", a_href_value = "#/event/" + /*event*/ ctx[15].id);
    			add_location(a, file$8, 69, 7, 2208);
    			attr_dev(h4, "class", "svelte-w2rdhu");
    			add_location(h4, file$8, 81, 9, 2509);
    			attr_dev(div0, "class", "imgTitle svelte-w2rdhu");
    			set_style(div0, "text-align", "center");
    			add_location(div0, file$8, 77, 8, 2418);
    			attr_dev(div1, "class", "containerName svelte-w2rdhu");
    			add_location(div1, file$8, 76, 7, 2381);
    			attr_dev(hr, "class", "svelte-w2rdhu");
    			add_location(hr, file$8, 85, 8, 2622);
    			attr_dev(p0, "class", "svelte-w2rdhu");
    			add_location(p0, file$8, 87, 9, 2675);
    			attr_dev(p1, "class", "svelte-w2rdhu");
    			add_location(p1, file$8, 88, 9, 2725);
    			attr_dev(div2, "class", "descriptInfo svelte-w2rdhu");
    			add_location(div2, file$8, 86, 8, 2638);
    			set_style(div3, "text-align", "center");
    			add_location(div3, file$8, 84, 7, 2579);
    			attr_dev(img1, "class", "likedEv svelte-w2rdhu");
    			if (!src_url_equal(img1.src, img1_src_value = "img/liked.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "like");
    			add_location(img1, file$8, 100, 9, 3042);
    			attr_dev(button0, "type", "addFavEvent");
    			attr_dev(button0, "class", "bLikedEv svelte-w2rdhu");
    			add_location(button0, file$8, 92, 8, 2826);
    			attr_dev(img2, "class", "likedEv svelte-w2rdhu");
    			if (!src_url_equal(img2.src, img2_src_value = "img/dislike.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "dislike");
    			add_location(img2, file$8, 114, 9, 3387);
    			attr_dev(button1, "type", "addFavEvent");
    			attr_dev(button1, "class", "bLikedEv svelte-w2rdhu");
    			add_location(button1, file$8, 106, 8, 3168);
    			attr_dev(div4, "class", "buttonLiked svelte-w2rdhu");
    			add_location(div4, file$8, 91, 7, 2791);
    			attr_dev(div5, "class", "content svelte-w2rdhu");
    			add_location(div5, file$8, 68, 6, 2178);
    			attr_dev(div6, "class", "show column svelte-w2rdhu");
    			add_location(div6, file$8, 67, 5, 2145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, a);
    			append_dev(a, img0);
    			append_dev(div5, t0);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t1);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, hr);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div2, t7);
    			append_dev(div2, p1);
    			append_dev(p1, t8);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(button0, img1);
    			append_dev(div4, t10);
    			append_dev(div4, button1);
    			append_dev(button1, img2);
    			append_dev(div6, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*events*/ 2 && !src_url_equal(img0.src, img0_src_value = /*event*/ ctx[15]["picture"])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*events*/ 2 && a_href_value !== (a_href_value = "#/event/" + /*event*/ ctx[15].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*events*/ 2 && t1_value !== (t1_value = /*event*/ ctx[15]["event_name"] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*events*/ 2 && t4_value !== (t4_value = /*event*/ ctx[15]["date"] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*events*/ 2 && t6_value !== (t6_value = /*event*/ ctx[15]["time"] + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*events*/ 2 && t8_value !== (t8_value = /*event*/ ctx[15]["location"] + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(67:4) {#if selected === \\\"all\\\"}",
    		ctx
    	});

    	return block;
    }

    // (66:3) {#each events as event, index (event.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*selected*/ ctx[0] === "all") return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(66:3) {#each events as event, index (event.id)}",
    		ctx
    	});

    	return block;
    }

    // (65:2) <Gallery>
    function create_default_slot$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*events*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*event*/ ctx[15].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*deleteFavEvent, events, addFavEvent, selected*/ 71) {
    				each_value = /*events*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(65:2) <Gallery>",
    		ctx
    	});

    	return block;
    }

    // (62:17)     <Spinner />   {:then getThings}
    function create_pending_block$1(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(62:17)     <Spinner />   {:then getThings}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let buttoncontainer;
    	let t;
    	let current;

    	buttoncontainer = new ButtonContainer({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 14,
    		blocks: [,,,]
    	};

    	handle_promise(/*promise*/ ctx[5], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(buttoncontainer.$$.fragment);
    			t = space();
    			info.block.c();
    			attr_dev(main, "class", "svelte-w2rdhu");
    			add_location(main, file$8, 47, 0, 1757);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(buttoncontainer, main, null);
    			append_dev(main, t);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const buttoncontainer_changes = {};

    			if (dirty & /*$$scope, selected*/ 2097153) {
    				buttoncontainer_changes.$$scope = { dirty, ctx };
    			}

    			buttoncontainer.$set(buttoncontainer_changes);
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttoncontainer.$$.fragment, local);
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttoncontainer.$$.fragment, local);

    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(buttoncontainer);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let addFavEvent;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Filters', slots, []);
    	const types = ["all", "IT", "music", "culture", "cinema", "sport", "other"];
    	let selected = "all";
    	const filterSelection = e => $$invalidate(0, selected = e.target.dataset.name);
    	let events = [];
    	let sourceJson = "events";

    	async function getThings() {
    		const res = await axios.get(`https://innoafisha.pythonanywhere.com/api/v1/` + sourceJson);

    		if (res.status === 200) {
    			setTimeout(
    				() => {
    					$$invalidate(1, events = res.data);
    					return true;
    				},
    				0
    			);
    		}
    	}

    	let promise = getThings();

    	async function deleteFavEvent(id) {
    		let sourceDelete = app[id];
    		$$invalidate(7, axios.defaults.headers.common["Authorization"] = `Token ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`, axios);
    		await axios.delete("https://innoafisha.pythonanywhere.com/api/v1/favourites/" + sourceDelete);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	const click_handler = event => {
    		addFavEvent(event.id);
    	};

    	const click_handler_1 = event => {
    		deleteFavEvent(event.id);
    	};

    	const click_handler_2 = event => {
    		addFavEvent(event.id);
    	};

    	const click_handler_3 = event => {
    		deleteFavEvent(event.id);
    	};

    	$$self.$capture_state = () => ({
    		ButtonContainer,
    		Gallery,
    		eventFev: app,
    		axios,
    		push,
    		Spinner,
    		types,
    		selected,
    		filterSelection,
    		events,
    		sourceJson,
    		getThings,
    		promise,
    		deleteFavEvent,
    		addFavEvent
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('events' in $$props) $$invalidate(1, events = $$props.events);
    		if ('sourceJson' in $$props) sourceJson = $$props.sourceJson;
    		if ('promise' in $$props) $$invalidate(5, promise = $$props.promise);
    		if ('addFavEvent' in $$props) $$invalidate(2, addFavEvent = $$props.addFavEvent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*axios*/ 128) {
    			$$invalidate(2, addFavEvent = async id => {
    				$$invalidate(7, axios.defaults.headers.common["Authorization"] = `Token ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`, axios);

    				await axios.post("https://innoafisha.pythonanywhere.com/api/v1/favourites", { event: id }, {
    					headers: { "Content-Type": "application/json" }
    				}).then(res => {
    					app[res.data.event] = res.data.id;
    				}).catch(async () => {
    					await push("#/auth");
    					location.reload();
    				});
    			});
    		}
    	};

    	return [
    		selected,
    		events,
    		addFavEvent,
    		types,
    		filterSelection,
    		promise,
    		deleteFavEvent,
    		axios,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\routes\MainPage.svelte generated by Svelte v3.48.0 */
    const file$7 = "src\\routes\\MainPage.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let body;
    	let header;
    	let t0;
    	let textimage;
    	let t1;
    	let filters;
    	let t2;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	textimage = new TextImage({ $$inline: true });
    	filters = new Filters({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(textimage.$$.fragment);
    			t1 = space();
    			create_component(filters.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(body, "class", "svelte-1wbj8wi");
    			add_location(body, file$7, 13, 1, 576);
    			add_location(main, file$7, 12, 0, 568);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			mount_component(header, body, null);
    			append_dev(body, t0);
    			mount_component(textimage, body, null);
    			append_dev(body, t1);
    			mount_component(filters, body, null);
    			append_dev(body, t2);
    			mount_component(footer, body, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(textimage.$$.fragment, local);
    			transition_in(filters.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(textimage.$$.fragment, local);
    			transition_out(filters.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(textimage);
    			destroy_component(filters);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainPage', slots, []);

    	onMount(async () => {
    		axios.defaults.headers.common["Authorization"] = `Token ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`;
    		await axios.get("https://innoafisha.pythonanywhere.com/api/v1/authusers/");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		TextImage,
    		Filters,
    		Footer,
    		onMount,
    		axios
    	});

    	return [];
    }

    class MainPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainPage",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\lib\loginpage\Forms.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file$6 = "src\\lib\\loginpage\\Forms.svelte";

    function create_fragment$6(ctx) {
    	let form;
    	let h2;
    	let t1;
    	let div0;
    	let i0;
    	let t2;
    	let input0;
    	let t3;
    	let div1;
    	let i1;
    	let t4;
    	let input1;
    	let t5;
    	let div2;
    	let i2;
    	let t6;
    	let input2;
    	let t7;
    	let input3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			h2 = element("h2");
    			h2.textContent = "Sign up";
    			t1 = space();
    			div0 = element("div");
    			i0 = element("i");
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div1 = element("div");
    			i1 = element("i");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div2 = element("div");
    			i2 = element("i");
    			t6 = space();
    			input2 = element("input");
    			t7 = space();
    			input3 = element("input");
    			attr_dev(h2, "class", "titleA svelte-fb4u93");
    			add_location(h2, file$6, 24, 1, 685);
    			attr_dev(i0, "class", "fas fa-user");
    			add_location(i0, file$6, 26, 2, 748);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			add_location(input0, file$6, 27, 2, 779);
    			attr_dev(div0, "class", "input-field svelte-fb4u93");
    			add_location(div0, file$6, 25, 1, 719);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$6, 30, 2, 886);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "placeholder", "Email");
    			add_location(input1, file$6, 31, 2, 921);
    			attr_dev(div1, "class", "input-field svelte-fb4u93");
    			add_location(div1, file$6, 29, 1, 857);
    			attr_dev(i2, "class", "fas fa-lock");
    			add_location(i2, file$6, 34, 2, 1023);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "placeholder", "Password");
    			add_location(input2, file$6, 35, 2, 1054);
    			attr_dev(div2, "class", "input-field svelte-fb4u93");
    			add_location(div2, file$6, 33, 1, 994);
    			attr_dev(input3, "type", "submit");
    			attr_dev(input3, "class", "btnA");
    			input3.value = "Sign up";
    			attr_dev(input3, "id", "sign-inin-btn");
    			add_location(input3, file$6, 37, 1, 1136);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "class", "sign-up-form svelte-fb4u93");
    			add_location(form, file$6, 23, 0, 610);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h2);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, i0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			set_input_value(input0, /*username*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, div1);
    			append_dev(div1, i1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*email*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, div2);
    			append_dev(div2, i2);
    			append_dev(div2, t6);
    			append_dev(div2, input2);
    			set_input_value(input2, /*password*/ ctx[2]);
    			append_dev(form, t7);
    			append_dev(form, input3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*submit*/ ctx[3])) /*submit*/ ctx[3].apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*email*/ 2 && input1.value !== /*email*/ ctx[1]) {
    				set_input_value(input1, /*email*/ ctx[1]);
    			}

    			if (dirty & /*password*/ 4 && input2.value !== /*password*/ ctx[2]) {
    				set_input_value(input2, /*password*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let submit;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Forms', slots, []);
    	let username = "", email = "", password = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Forms> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	function input2_input_handler() {
    		password = this.value;
    		$$invalidate(2, password);
    	}

    	$$self.$capture_state = () => ({ axios, username, email, password, submit });

    	$$self.$inject_state = $$props => {
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('email' in $$props) $$invalidate(1, email = $$props.email);
    		if ('password' in $$props) $$invalidate(2, password = $$props.password);
    		if ('submit' in $$props) $$invalidate(3, submit = $$props.submit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*email, username, password*/ 7) {
    			$$invalidate(3, submit = async () => {
    				let axiosConfig = {
    					headers: { "Content-Type": "application/json" }
    				};

    				await axios.post("https://innoafisha.pythonanywhere.com/api/v1/authusers/", { email, username, password }, axiosConfig).then(res => {
    					console.log("RESPONSE RECEIVED: ", res);
    				}).catch(err => {
    					console.log("AXIOS ERROR: ", err);
    				});
    			});
    		}
    	};

    	return [
    		username,
    		email,
    		password,
    		submit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Forms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Forms",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\lib\loginpage\FormsLogin.svelte generated by Svelte v3.48.0 */
    const file$5 = "src\\lib\\loginpage\\FormsLogin.svelte";

    function create_fragment$5(ctx) {
    	let form;
    	let h2;
    	let t1;
    	let div0;
    	let i0;
    	let t2;
    	let input0;
    	let t3;
    	let div1;
    	let i1;
    	let t4;
    	let input1;
    	let t5;
    	let input2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			h2 = element("h2");
    			h2.textContent = "Sign in";
    			t1 = space();
    			div0 = element("div");
    			i0 = element("i");
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div1 = element("div");
    			i1 = element("i");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			input2 = element("input");
    			attr_dev(h2, "class", "titleA svelte-fb4u93");
    			add_location(h2, file$5, 21, 1, 739);
    			attr_dev(i0, "class", "fas fa-user");
    			add_location(i0, file$5, 23, 2, 802);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			add_location(input0, file$5, 24, 2, 833);
    			attr_dev(div0, "class", "input-field svelte-fb4u93");
    			add_location(div0, file$5, 22, 1, 773);
    			attr_dev(i1, "class", "fas fa-lock");
    			add_location(i1, file$5, 27, 2, 941);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file$5, 28, 2, 972);
    			attr_dev(div1, "class", "input-field svelte-fb4u93");
    			add_location(div1, file$5, 26, 1, 912);
    			attr_dev(input2, "type", "submit");
    			input2.value = "Login";
    			attr_dev(input2, "class", "btnA solid");
    			add_location(input2, file$5, 30, 1, 1055);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "class", "sign-in-form svelte-fb4u93");
    			add_location(form, file$5, 20, 0, 664);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h2);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, i0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			set_input_value(input0, /*usernameL*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, div1);
    			append_dev(div1, i1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*passwordL*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, input2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*submit*/ ctx[2])) /*submit*/ ctx[2].apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*usernameL*/ 1 && input0.value !== /*usernameL*/ ctx[0]) {
    				set_input_value(input0, /*usernameL*/ ctx[0]);
    			}

    			if (dirty & /*passwordL*/ 2 && input1.value !== /*passwordL*/ ctx[1]) {
    				set_input_value(input1, /*passwordL*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let submit;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormsLogin', slots, []);
    	let usernameL = "", passwordL = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FormsLogin> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		usernameL = this.value;
    		$$invalidate(0, usernameL);
    	}

    	function input1_input_handler() {
    		passwordL = this.value;
    		$$invalidate(1, passwordL);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		push,
    		usernameL,
    		passwordL,
    		submit
    	});

    	$$self.$inject_state = $$props => {
    		if ('usernameL' in $$props) $$invalidate(0, usernameL = $$props.usernameL);
    		if ('passwordL' in $$props) $$invalidate(1, passwordL = $$props.passwordL);
    		if ('submit' in $$props) $$invalidate(2, submit = $$props.submit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*axios, passwordL, usernameL*/ 11) {
    			$$invalidate(2, submit = async () => {
    				const response = await axios.post("https://innoafisha.pythonanywhere.com/auth/token/login", { password: passwordL, username: usernameL }, {
    					headers: { "Content-Type": "application/json" }
    				});

    				if (response.status === 200) {
    					$$invalidate(3, axios.defaults.headers.common["Authorization"] = `Token ${response.data.auth_token}`, axios);
    					document.cookie = `access_token=${response.data.auth_token}`;
    					await push("/");
    				}
    			});
    		}
    	};

    	return [
    		usernameL,
    		passwordL,
    		submit,
    		axios,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class FormsLogin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormsLogin",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\lib\loginpage\Panels.svelte generated by Svelte v3.48.0 */

    const file$4 = "src\\lib\\loginpage\\Panels.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let h10;
    	let t1;
    	let p0;
    	let t3;
    	let button0;
    	let t5;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let div3;
    	let div2;
    	let h11;
    	let t8;
    	let p1;
    	let t10;
    	let button1;
    	let t12;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Innopolis Afisha";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Sign up and select your favorite events!";
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Sign up";
    			t5 = space();
    			img0 = element("img");
    			t6 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h11 = element("h1");
    			h11.textContent = "InnopolisAfisha";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Sign in and select your favorite events!";
    			t10 = space();
    			button1 = element("button");
    			button1.textContent = "Sign in";
    			t12 = space();
    			img1 = element("img");
    			set_style(h10, "font-size", "3rem");
    			add_location(h10, file$4, 3, 3, 93);
    			attr_dev(p0, "class", "svelte-tiaf0d");
    			add_location(p0, file$4, 4, 3, 147);
    			attr_dev(button0, "class", "btnA transparent");
    			attr_dev(button0, "id", "sign-up-btn");
    			add_location(button0, file$4, 5, 3, 199);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$4, 2, 2, 67);
    			if (!src_url_equal(img0.src, img0_src_value = "img/log.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "image svelte-tiaf0d");
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$4, 7, 2, 280);
    			attr_dev(div1, "class", "panel left-panel");
    			add_location(div1, file$4, 1, 1, 33);
    			set_style(h11, "font-size", "3rem");
    			add_location(h11, file$4, 11, 3, 399);
    			attr_dev(p1, "class", "svelte-tiaf0d");
    			add_location(p1, file$4, 12, 3, 452);
    			attr_dev(button1, "class", "btnA transparent");
    			attr_dev(button1, "id", "sign-in-btn");
    			add_location(button1, file$4, 13, 3, 504);
    			attr_dev(div2, "class", "content");
    			add_location(div2, file$4, 10, 2, 373);
    			if (!src_url_equal(img1.src, img1_src_value = "img/register.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "image svelte-tiaf0d");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$4, 15, 2, 585);
    			attr_dev(div3, "class", "panel right-panel");
    			add_location(div3, file$4, 9, 1, 338);
    			attr_dev(div4, "class", "panels-container svelte-tiaf0d");
    			add_location(div4, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, button0);
    			append_dev(div1, t5);
    			append_dev(div1, img0);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h11);
    			append_dev(div2, t8);
    			append_dev(div2, p1);
    			append_dev(div2, t10);
    			append_dev(div2, button1);
    			append_dev(div3, t12);
    			append_dev(div3, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Panels', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Panels> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Panels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Panels",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\routes\Auth.svelte generated by Svelte v3.48.0 */
    const file$3 = "src\\routes\\Auth.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let formslogin;
    	let t1;
    	let forms;
    	let t2;
    	let panels;
    	let t3;
    	let script;
    	let current;
    	formslogin = new FormsLogin({ $$inline: true });
    	forms = new Forms({ $$inline: true });
    	panels = new Panels({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(formslogin.$$.fragment);
    			t1 = space();
    			create_component(forms.$$.fragment);
    			t2 = space();
    			create_component(panels.$$.fragment);
    			t3 = space();
    			script = element("script");
    			script.textContent = "if (true) {\r\n    const sign_in_btn = document.querySelector(\"#sign-in-btn\");\r\n    const sign_up_btn = document.querySelector(\"#sign-up-btn\");\r\n    const sign_inin_btn = document.querySelector(\"#sign-inin-btn\");\r\n    const containerA = document.querySelector(\".containerA\");\r\n    sign_up_btn.addEventListener(\"click\", () => {\r\n        containerA.classList.add(\"sign-up-mode\");\r\n    });\r\n    sign_in_btn.addEventListener(\"click\", () => {\r\n        containerA.classList.remove(\"sign-up-mode\");\r\n    });\r\n    sign_inin_btn.addEventListener(\"click\", () => {\r\n        containerA.classList.remove(\"sign-up-mode\");\r\n    });\r\n}\r\nelse {\r\n    sign_up_btn.addEventListener(\"click\", () => {\r\n        containerA.classList.add(\"sign-up-mode\");\r\n    });\r\n    sign_in_btn.addEventListener(\"click\", () => {\r\n        containerA.classList.remove(\"sign-up-mode\");\r\n    });\r\n    sign_inin_btn.addEventListener(\"click\", () => {\r\n        containerA.classList.remove(\"sign-up-mode\");\r\n    });\r\n}";
    			attr_dev(div0, "class", "mainPage svelte-1coq52y");
    			add_location(div0, file$3, 7, 2, 232);
    			attr_dev(div1, "class", "signin-signup svelte-1coq52y");
    			add_location(div1, file$3, 9, 3, 292);
    			attr_dev(div2, "class", "forms-container svelte-1coq52y");
    			add_location(div2, file$3, 8, 2, 259);
    			attr_dev(div3, "class", "containerA svelte-1coq52y");
    			add_location(div3, file$3, 6, 1, 205);
    			attr_dev(script, "lang", "ts");
    			add_location(script, file$3, 16, 1, 394);
    			add_location(main, file$3, 5, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(formslogin, div1, null);
    			append_dev(div1, t1);
    			mount_component(forms, div1, null);
    			append_dev(div3, t2);
    			mount_component(panels, div3, null);
    			append_dev(main, t3);
    			append_dev(main, script);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formslogin.$$.fragment, local);
    			transition_in(forms.$$.fragment, local);
    			transition_in(panels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formslogin.$$.fragment, local);
    			transition_out(forms.$$.fragment, local);
    			transition_out(panels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(formslogin);
    			destroy_component(forms);
    			destroy_component(panels);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Auth', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Auth> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Forms, FormsLogin, Panels });
    	return [];
    }

    class Auth extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Auth",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\lib\favourites\Favourites.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\lib\\favourites\\Favourites.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (1:0) <script lang="ts">import Gallery from "../extra/services/Gallery.svelte";  import Spinner from "../extra/services/Spinner.svelte";  import axios from "axios";  import { push }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import Gallery from \\\"../extra/services/Gallery.svelte\\\";  import Spinner from \\\"../extra/services/Spinner.svelte\\\";  import axios from \\\"axios\\\";  import { push }",
    		ctx
    	});

    	return block;
    }

    // (28:1) {:then getThings}
    function create_then_block(ctx) {
    	let gallery;
    	let t0;
    	let div;
    	let h1;
    	let current;

    	gallery = new Gallery({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallery.$$.fragment);
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Oops, there's nothing here... Like the events if you want to see\r\n\t\t\t\tmore...";
    			attr_dev(h1, "class", "svelte-11cws61");
    			add_location(h1, file$2, 63, 3, 1867);
    			attr_dev(div, "class", "nothingHere svelte-11cws61");
    			add_location(div, file$2, 62, 2, 1837);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallery, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallery_changes = {};

    			if (dirty & /*$$scope, eventsIds, events*/ 1027) {
    				gallery_changes.$$scope = { dirty, ctx };
    			}

    			gallery.$set(gallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallery, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(28:1) {:then getThings}",
    		ctx
    	});

    	return block;
    }

    // (32:5) {#if event.id === eventId["event"]}
    function create_if_block(ctx) {
    	let div5;
    	let div4;
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;
    	let t0;
    	let div1;
    	let div0;
    	let h4;
    	let t1_value = /*event*/ ctx[8]["event_name"] + "";
    	let t1;
    	let t2;
    	let div3;
    	let hr;
    	let t3;
    	let div2;
    	let p0;
    	let t4_value = /*event*/ ctx[8]["date"] + "";
    	let t4;
    	let t5;
    	let t6_value = /*event*/ ctx[8]["time"] + "";
    	let t6;
    	let t7;
    	let p1;
    	let t8_value = /*event*/ ctx[8]["location"] + "";
    	let t8;
    	let t9;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			hr = element("hr");
    			t3 = space();
    			div2 = element("div");
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = text(", ");
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			if (!src_url_equal(img.src, img_src_value = /*event*/ ctx[8]["picture"])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			set_style(img, "width", "100%");
    			attr_dev(img, "class", "svelte-11cws61");
    			add_location(img, file$2, 35, 9, 1215);
    			attr_dev(a, "class", "pickpick svelte-11cws61");
    			attr_dev(a, "href", a_href_value = "#/event/" + /*event*/ ctx[8].id);
    			add_location(a, file$2, 34, 8, 1158);
    			attr_dev(h4, "class", "svelte-11cws61");
    			add_location(h4, file$2, 46, 10, 1471);
    			attr_dev(div0, "class", "imgTitle svelte-11cws61");
    			set_style(div0, "text-align", "center");
    			add_location(div0, file$2, 42, 9, 1376);
    			attr_dev(div1, "class", "containerName svelte-11cws61");
    			add_location(div1, file$2, 41, 8, 1338);
    			attr_dev(hr, "class", "svelte-11cws61");
    			add_location(hr, file$2, 50, 9, 1588);
    			attr_dev(p0, "class", "svelte-11cws61");
    			add_location(p0, file$2, 52, 10, 1643);
    			attr_dev(p1, "class", "svelte-11cws61");
    			add_location(p1, file$2, 53, 10, 1694);
    			attr_dev(div2, "class", "descriptInfo svelte-11cws61");
    			add_location(div2, file$2, 51, 9, 1605);
    			set_style(div3, "text-align", "center");
    			add_location(div3, file$2, 49, 8, 1544);
    			attr_dev(div4, "class", "content svelte-11cws61");
    			add_location(div4, file$2, 33, 7, 1127);
    			attr_dev(div5, "class", "show column svelte-11cws61");
    			add_location(div5, file$2, 32, 6, 1093);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, img);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, hr);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div2, t7);
    			append_dev(div2, p1);
    			append_dev(p1, t8);
    			append_dev(div5, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events*/ 2 && !src_url_equal(img.src, img_src_value = /*event*/ ctx[8]["picture"])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*events*/ 2 && a_href_value !== (a_href_value = "#/event/" + /*event*/ ctx[8].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*events*/ 2 && t1_value !== (t1_value = /*event*/ ctx[8]["event_name"] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*events*/ 2 && t4_value !== (t4_value = /*event*/ ctx[8]["date"] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*events*/ 2 && t6_value !== (t6_value = /*event*/ ctx[8]["time"] + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*events*/ 2 && t8_value !== (t8_value = /*event*/ ctx[8]["location"] + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(32:5) {#if event.id === eventId[\\\"event\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#each events as event, index (event.id)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*event*/ ctx[8].id === /*eventId*/ ctx[5]["event"] && create_if_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*event*/ ctx[8].id === /*eventId*/ ctx[5]["event"]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(31:4) {#each events as event, index (event.id)}",
    		ctx
    	});

    	return block;
    }

    // (30:3) {#each eventsIds as eventId, index (eventId.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value_1 = /*events*/ ctx[1];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*event*/ ctx[8].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*events, eventsIds*/ 3) {
    				each_value_1 = /*events*/ ctx[1];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:3) {#each eventsIds as eventId, index (eventId.id)}",
    		ctx
    	});

    	return block;
    }

    // (29:2) <Gallery>
    function create_default_slot(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*eventsIds*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*eventId*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events, eventsIds*/ 3) {
    				each_value = /*eventsIds*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block, each_1_anchor, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(29:2) <Gallery>",
    		ctx
    	});

    	return block;
    }

    // (26:17)     <Spinner />   {:then getThings}
    function create_pending_block(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(26:17)     <Spinner />   {:then getThings}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 4,
    		blocks: [,,,]
    	};

    	handle_promise(/*promise*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "My favourites";
    			t1 = space();
    			info.block.c();
    			attr_dev(h1, "class", "svelte-11cws61");
    			add_location(h1, file$2, 24, 1, 854);
    			attr_dev(main, "class", "svelte-11cws61");
    			add_location(main, file$2, 23, 0, 845);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Favourites', slots, []);
    	let eventsIds = [];
    	let events = [];

    	async function getThings() {
    		axios.defaults.headers.common["Authorization"] = `Token ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`;

    		await axios.get("https://innoafisha.pythonanywhere.com/api/v1/favourites").then(async res => {
    			$$invalidate(0, eventsIds = res.data);
    		}).catch(async () => {
    			await push("#/auth");
    			location.reload();
    		});

    		const resres = await axios.get(`https://innoafisha.pythonanywhere.com/api/v1/events`);
    		$$invalidate(1, events = resres.data);
    	}

    	let promise = getThings();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Favourites> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Gallery,
    		Spinner,
    		axios,
    		push,
    		eventsIds,
    		events,
    		getThings,
    		promise
    	});

    	$$self.$inject_state = $$props => {
    		if ('eventsIds' in $$props) $$invalidate(0, eventsIds = $$props.eventsIds);
    		if ('events' in $$props) $$invalidate(1, events = $$props.events);
    		if ('promise' in $$props) $$invalidate(2, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [eventsIds, events, promise];
    }

    class Favourites extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Favourites",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\routes\FavouritesPage.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\routes\\FavouritesPage.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let body;
    	let header;
    	let t0;
    	let favourites;
    	let t1;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	favourites = new Favourites({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(favourites.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(body, "class", "svelte-1wbj8wi");
    			add_location(body, file$1, 11, 1, 442);
    			add_location(main, file$1, 10, 0, 434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			mount_component(header, body, null);
    			append_dev(body, t0);
    			mount_component(favourites, body, null);
    			append_dev(body, t1);
    			mount_component(footer, body, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(favourites.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(favourites.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(favourites);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FavouritesPage', slots, []);

    	onMount(async () => {
    		axios.defaults.headers.common["Authorization"] = `Token ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FavouritesPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		Favourites,
    		onMount,
    		axios
    	});

    	return [];
    }

    class FavouritesPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FavouritesPage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let router;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(router.$$.fragment);
    			add_location(main, file, 13, 0, 404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let routes = {
    		"/": MainPage,
    		"/auth": Auth,
    		"/event/:id": EventPage,
    		"/favourites": FavouritesPage
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		EventPage,
    		MainPage,
    		Auth,
    		FavouritesPage,
    		routes
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(0, routes = $$props.routes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    let eventFav = [];
    const app = new App({
        target: document.body,
    });

    exports["default"] = app;
    exports.eventFav = eventFav;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=bundle.js.map
