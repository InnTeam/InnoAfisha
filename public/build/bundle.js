
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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

    /* src\lib\extra\Header.svelte generated by Svelte v3.48.0 */

    const file$5 = "src\\lib\\extra\\Header.svelte";

    function create_fragment$5(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let t1;
    	let nav;
    	let t3;
    	let div3;
    	let div2;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let a1;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "27 August, Wednesday";
    			t1 = space();
    			nav = element("nav");
    			nav.textContent = "InnoAfisha";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t4 = space();
    			a1 = element("a");
    			img1 = element("img");
    			attr_dev(div0, "class", "corner svelte-18xu58i");
    			add_location(div0, file$5, 10, 4, 250);
    			attr_dev(div1, "class", "corner svelte-18xu58i");
    			add_location(div1, file$5, 9, 2, 224);
    			attr_dev(nav, "class", "svelte-18xu58i");
    			add_location(nav, file$5, 15, 2, 326);
    			if (!src_url_equal(img0.src, img0_src_value = "img/favorite.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "favorite");
    			attr_dev(img0, "class", "svelte-18xu58i");
    			add_location(img0, file$5, 22, 10, 454);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-18xu58i");
    			add_location(a0, file$5, 21, 6, 430);
    			if (!src_url_equal(img1.src, img1_src_value = "img/login.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "log in");
    			attr_dev(img1, "class", "svelte-18xu58i");
    			add_location(img1, file$5, 25, 10, 543);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-18xu58i");
    			add_location(a1, file$5, 24, 6, 519);
    			attr_dev(div2, "class", "social-block");
    			add_location(div2, file$5, 20, 4, 396);
    			attr_dev(div3, "class", "corner social svelte-18xu58i");
    			add_location(div3, file$5, 19, 2, 363);
    			attr_dev(header, "class", "svelte-18xu58i");
    			add_location(header, file$5, 8, 0, 212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(header, t1);
    			append_dev(header, nav);
    			append_dev(header, t3);
    			append_dev(header, div3);
    			append_dev(div3, div2);
    			append_dev(div2, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t4);
    			append_dev(div2, a1);
    			append_dev(a1, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const images = [
        {
                name: "Harry Potter and the Philosopher's Stone",
                url: "https://i.guim.co.uk/img/media/7576688b2a01536172c4cd04d77978f4a128a195/0_121_3020_1813/master/3020.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=ebbf699229de3ff84fa821372f01326a",
                keyword: "nature",
                descr: "25 Nov, 12:00 Art Space"
        }, 
        {
                name: "Sunlight",
                url: "https://media3.giphy.com/media/xT0xeNf2csFIbeAxvq/giphy.gif?cid=ecf05e47vgs0k9lju46i82qprmict9oirj61fzgih4p27wa6&rid=giphy.gif",
                keyword: "nature",
                descr: "Lorem ipsum dolor.."
        }, 
        {
                name: "Forest",
                url: "https://media0.giphy.com/media/5xtDarFOeUIMZkLclTa/giphy.gif?cid=ecf05e470cbe5d36900df2a901cc3d236bad495cae404194&rid=giphy.gif",
                keyword: "nature",
                descr: "Lorem ipsum dolor.."
        }, 
        {
                name: "Retro",
                url: "https://media4.giphy.com/media/coJKXGmsKHqJG/giphy.gif?cid=ecf05e472dn6lee2e35h0s6rue5me96wixz1938rke4rcf91&rid=giphy.gif",
                keyword: "cars",
                descr: "Lorem ipsum dolor.."
        }, 
        {
                name: "Fast",
                url: "https://media4.giphy.com/media/abgxkEiJQjaSY/giphy.gif?cid=ecf05e47gw3slntmubichpyolkpilno6kdow97m3afhbkzn5&rid=giphy.gif",
                keyword: "cars",
                descr: "Lorem ipsum dolor.."
        }, 
        {
                name: "Classic",
                url: "https://media3.giphy.com/media/l4EoTXSI1kLJB9g6A/giphy.gif?cid=ecf05e47icgxx5wohyron0pz5ansqo3pihb90fn8hd80w41t&rid=giphy.gif",
                keyword: "cars",
                descr: "Lorem ipsum dolor.."
        }, 
        {
                name: "Child",
                url: "https://media0.giphy.com/media/iprlQKfz9ScvI6Lqph/giphy.gif?cid=ecf05e47sl8b6pbslpb3vgtp7x3mldqddm1wkbxjb5cxfrau&rid=giphy.gif",
                keyword: "people",
                descr: "Lorem ipsum dolor.."
        }, 
        {
                name: "Man",
                url: "https://media1.giphy.com/media/9iwHCRDji7tUQ/giphy.gif?cid=ecf05e47s9u25sbik1qt30ub1ga7fxgw7mlbvstagznnzjzs&rid=giphy.gif",
                keyword: "people",
                descr: "Lorem ipsum dolor.."
        }, 
        {
                name: "Woman",
                url: "https://media2.giphy.com/media/jULDx93JmHDEobmk2s/giphy.gif?cid=ecf05e47lrskfuuip9i2ys7g51m9zmhltllf0p772ag5c73c&rid=giphy.gif",
                keyword: "people",
                descr: "Lorem ipsum dolor.."
        }
    ];

    const categories = ["all", "nature", "cars", "people"];

    /* src\lib\filters\ButtonContainer.svelte generated by Svelte v3.48.0 */

    const file$4 = "src\\lib\\filters\\ButtonContainer.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(div, file$4, 7, 0, 71);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonContainer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\lib\filters\Gallery.svelte generated by Svelte v3.48.0 */

    const file$3 = "src\\lib\\filters\\Gallery.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "row svelte-1kyqgnq");
    			add_location(div, file$3, 9, 0, 91);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\lib\filters\Filters.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\lib\\filters\\Filters.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i].name;
    	child_ctx[3] = list[i].url;
    	child_ctx[4] = list[i].keyword;
    	child_ctx[5] = list[i].descr;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (15:2) {#each categories as category}
    function create_each_block_1(ctx) {
    	let button;
    	let t0_value = /*category*/ ctx[8] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "btn svelte-qp69p4");
    			attr_dev(button, "data-name", /*category*/ ctx[8]);
    			toggle_class(button, "active", /*selected*/ ctx[0] === /*category*/ ctx[8]);
    			add_location(button, file$2, 15, 3, 374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*filterSelection*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, categories*/ 1) {
    				toggle_class(button, "active", /*selected*/ ctx[0] === /*category*/ ctx[8]);
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(15:2) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    // (14:1) <ButtonContainer>
    function create_default_slot_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = categories;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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
    			if (dirty & /*categories, selected, filterSelection*/ 3) {
    				each_value_1 = categories;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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
    		source: "(14:1) <ButtonContainer>",
    		ctx
    	});

    	return block;
    }

    // (36:3) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h4;
    	let t1_value = /*name*/ ctx[2] + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*descr*/ ctx[5] + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = /*url*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*name*/ ctx[2]);
    			set_style(img, "width", "100%");
    			attr_dev(img, "class", "svelte-qp69p4");
    			add_location(img, file$2, 38, 6, 985);
    			attr_dev(h4, "class", "svelte-qp69p4");
    			add_location(h4, file$2, 39, 6, 1038);
    			attr_dev(p, "class", "svelte-qp69p4");
    			add_location(p, file$2, 40, 6, 1061);
    			attr_dev(div0, "class", "content svelte-qp69p4");
    			add_location(div0, file$2, 37, 5, 956);
    			attr_dev(div1, "class", "column svelte-qp69p4");
    			toggle_class(div1, "show", /*selected*/ ctx[0] === /*keyword*/ ctx[4]);
    			add_location(div1, file$2, 36, 4, 895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h4);
    			append_dev(h4, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, images*/ 1) {
    				toggle_class(div1, "show", /*selected*/ ctx[0] === /*keyword*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(36:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:3) {#if selected === "all"}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h4;
    	let t1_value = /*name*/ ctx[2] + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*descr*/ ctx[5] + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = /*url*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*name*/ ctx[2]);
    			set_style(img, "width", "100%");
    			attr_dev(img, "class", "svelte-qp69p4");
    			add_location(img, file$2, 30, 6, 762);
    			attr_dev(h4, "class", "svelte-qp69p4");
    			add_location(h4, file$2, 31, 6, 815);
    			attr_dev(p, "class", "svelte-qp69p4");
    			add_location(p, file$2, 32, 6, 838);
    			attr_dev(div0, "class", "content svelte-qp69p4");
    			add_location(div0, file$2, 29, 5, 733);
    			attr_dev(div1, "class", "show column svelte-qp69p4");
    			add_location(div1, file$2, 28, 4, 701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h4);
    			append_dev(h4, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:3) {#if selected === \\\"all\\\"}",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#each images as {name, url, keyword, descr}}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*selected*/ ctx[0] === "all") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
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
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:2) {#each images as {name, url, keyword, descr}}",
    		ctx
    	});

    	return block;
    }

    // (26:1) <Gallery>
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let each_value = images;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			if (dirty & /*images, selected*/ 1) {
    				each_value = images;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(26:1) <Gallery>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let buttoncontainer;
    	let t;
    	let gallery;
    	let current;

    	buttoncontainer = new ButtonContainer({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	gallery = new Gallery({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(buttoncontainer.$$.fragment);
    			t = space();
    			create_component(gallery.$$.fragment);
    			attr_dev(main, "class", "svelte-qp69p4");
    			add_location(main, file$2, 12, 0, 309);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(buttoncontainer, main, null);
    			append_dev(main, t);
    			mount_component(gallery, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const buttoncontainer_changes = {};

    			if (dirty & /*$$scope, selected*/ 2049) {
    				buttoncontainer_changes.$$scope = { dirty, ctx };
    			}

    			buttoncontainer.$set(buttoncontainer_changes);
    			const gallery_changes = {};

    			if (dirty & /*$$scope, selected*/ 2049) {
    				gallery_changes.$$scope = { dirty, ctx };
    			}

    			gallery.$set(gallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttoncontainer.$$.fragment, local);
    			transition_in(gallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttoncontainer.$$.fragment, local);
    			transition_out(gallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(buttoncontainer);
    			destroy_component(gallery);
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
    	validate_slots('Filters', slots, []);
    	let selected = "all";
    	const filterSelection = e => $$invalidate(0, selected = e.target.dataset.name);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		images,
    		categories,
    		ButtonContainer,
    		Gallery,
    		selected,
    		filterSelection
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, filterSelection];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\lib\extra\Footer.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\lib\\extra\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div14;
    	let div10;
    	let div2;
    	let div1;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div4;
    	let div3;
    	let h60;
    	let t5;
    	let ul0;
    	let li0;
    	let a2;
    	let t7;
    	let li1;
    	let a3;
    	let t9;
    	let li2;
    	let a4;
    	let t11;
    	let li3;
    	let a5;
    	let t13;
    	let div6;
    	let div5;
    	let h61;
    	let t15;
    	let ul1;
    	let li4;
    	let a6;
    	let t17;
    	let li5;
    	let a7;
    	let t19;
    	let li6;
    	let a8;
    	let t21;
    	let li7;
    	let a9;
    	let t23;
    	let div9;
    	let div8;
    	let h62;
    	let t25;
    	let div7;
    	let p1;
    	let t27;
    	let form;
    	let input;
    	let t28;
    	let button;
    	let span;
    	let i0;
    	let t29;
    	let div13;
    	let div12;
    	let div11;
    	let p2;
    	let t30;
    	let i1;
    	let t31;
    	let a10;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div14 = element("div");
    			div10 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "The Customer is at the heart of our unique bussiness model, which include design.";
    			t2 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h60 = element("h6");
    			h60.textContent = "Shopping";
    			t5 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			a2 = element("a");
    			a2.textContent = "Clothing Store";
    			t7 = space();
    			li1 = element("li");
    			a3 = element("a");
    			a3.textContent = "Trending Shoes";
    			t9 = space();
    			li2 = element("li");
    			a4 = element("a");
    			a4.textContent = "Accessories";
    			t11 = space();
    			li3 = element("li");
    			a5 = element("a");
    			a5.textContent = "Sale";
    			t13 = space();
    			div6 = element("div");
    			div5 = element("div");
    			h61 = element("h6");
    			h61.textContent = "Links";
    			t15 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			a6 = element("a");
    			a6.textContent = "Contact Us";
    			t17 = space();
    			li5 = element("li");
    			a7 = element("a");
    			a7.textContent = "Payment Methods";
    			t19 = space();
    			li6 = element("li");
    			a8 = element("a");
    			a8.textContent = "Delivary";
    			t21 = space();
    			li7 = element("li");
    			a9 = element("a");
    			a9.textContent = "Return & Exchanges";
    			t23 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h62 = element("h6");
    			h62.textContent = "NewsLetter";
    			t25 = space();
    			div7 = element("div");
    			p1 = element("p");
    			p1.textContent = "Be the first to know about new arrivals, look books, sales & promos!";
    			t27 = space();
    			form = element("form");
    			input = element("input");
    			t28 = space();
    			button = element("button");
    			span = element("span");
    			i0 = element("i");
    			t29 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			p2 = element("p");
    			t30 = text("Copyright © 2021 All rights reserved | This template is made with ");
    			i1 = element("i");
    			t31 = text("\r\n                         by ");
    			a10 = element("a");
    			a10.textContent = "FantacyDesigns";
    			if (!src_url_equal(img0.src, img0_src_value = "img/footer-logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1yrpwju");
    			add_location(img0, file$1, 6, 37, 263);
    			attr_dev(a0, "href", "#a");
    			attr_dev(a0, "class", "svelte-1yrpwju");
    			add_location(a0, file$1, 6, 24, 250);
    			attr_dev(div0, "class", "footer-logo svelte-1yrpwju");
    			add_location(div0, file$1, 5, 20, 199);
    			attr_dev(p0, "class", "svelte-1yrpwju");
    			add_location(p0, file$1, 8, 20, 355);
    			if (!src_url_equal(img1.src, img1_src_value = "img/payment.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-1yrpwju");
    			add_location(img1, file$1, 9, 33, 478);
    			attr_dev(a1, "href", "#b");
    			attr_dev(a1, "class", "svelte-1yrpwju");
    			add_location(a1, file$1, 9, 20, 465);
    			attr_dev(div1, "class", "footer-about svelte-1yrpwju");
    			add_location(div1, file$1, 4, 16, 151);
    			attr_dev(div2, "class", "col-lg-3 col-md-6 col-sm-6");
    			add_location(div2, file$1, 3, 12, 93);
    			attr_dev(h60, "class", "svelte-1yrpwju");
    			add_location(h60, file$1, 15, 20, 695);
    			attr_dev(a2, "href", "#a");
    			attr_dev(a2, "class", "svelte-1yrpwju");
    			add_location(a2, file$1, 17, 28, 768);
    			attr_dev(li0, "class", "svelte-1yrpwju");
    			add_location(li0, file$1, 17, 24, 764);
    			attr_dev(a3, "href", "#a");
    			attr_dev(a3, "class", "svelte-1yrpwju");
    			add_location(a3, file$1, 18, 28, 834);
    			attr_dev(li1, "class", "svelte-1yrpwju");
    			add_location(li1, file$1, 18, 24, 830);
    			attr_dev(a4, "href", "#a");
    			attr_dev(a4, "class", "svelte-1yrpwju");
    			add_location(a4, file$1, 19, 28, 900);
    			attr_dev(li2, "class", "svelte-1yrpwju");
    			add_location(li2, file$1, 19, 24, 896);
    			attr_dev(a5, "href", "#a");
    			attr_dev(a5, "class", "svelte-1yrpwju");
    			add_location(a5, file$1, 20, 28, 963);
    			attr_dev(li3, "class", "svelte-1yrpwju");
    			add_location(li3, file$1, 20, 24, 959);
    			attr_dev(ul0, "class", "svelte-1yrpwju");
    			add_location(ul0, file$1, 16, 20, 734);
    			attr_dev(div3, "class", "footer-widget svelte-1yrpwju");
    			add_location(div3, file$1, 14, 16, 646);
    			attr_dev(div4, "class", "col-lg-2 offset-lg-1 col-md-3 col-sm-6");
    			add_location(div4, file$1, 13, 12, 576);
    			attr_dev(h61, "class", "svelte-1yrpwju");
    			add_location(h61, file$1, 28, 20, 1186);
    			attr_dev(a6, "href", "#a");
    			attr_dev(a6, "class", "svelte-1yrpwju");
    			add_location(a6, file$1, 30, 28, 1256);
    			attr_dev(li4, "class", "svelte-1yrpwju");
    			add_location(li4, file$1, 30, 24, 1252);
    			attr_dev(a7, "href", "#b");
    			attr_dev(a7, "class", "svelte-1yrpwju");
    			add_location(a7, file$1, 31, 28, 1318);
    			attr_dev(li5, "class", "svelte-1yrpwju");
    			add_location(li5, file$1, 31, 24, 1314);
    			attr_dev(a8, "href", "#c");
    			attr_dev(a8, "class", "svelte-1yrpwju");
    			add_location(a8, file$1, 32, 28, 1385);
    			attr_dev(li6, "class", "svelte-1yrpwju");
    			add_location(li6, file$1, 32, 24, 1381);
    			attr_dev(a9, "href", "#d");
    			attr_dev(a9, "class", "svelte-1yrpwju");
    			add_location(a9, file$1, 33, 28, 1445);
    			attr_dev(li7, "class", "svelte-1yrpwju");
    			add_location(li7, file$1, 33, 24, 1441);
    			attr_dev(ul1, "class", "svelte-1yrpwju");
    			add_location(ul1, file$1, 29, 20, 1222);
    			attr_dev(div5, "class", "footer-widget svelte-1yrpwju");
    			add_location(div5, file$1, 27, 16, 1137);
    			attr_dev(div6, "class", "col-lg-2 col-md-3 col-sm-6");
    			add_location(div6, file$1, 26, 12, 1078);
    			attr_dev(h62, "class", "svelte-1yrpwju");
    			add_location(h62, file$1, 41, 20, 1693);
    			attr_dev(p1, "class", "svelte-1yrpwju");
    			add_location(p1, file$1, 43, 24, 1791);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Your Email");
    			attr_dev(input, "class", "svelte-1yrpwju");
    			add_location(input, file$1, 45, 28, 1939);
    			attr_dev(i0, "class", "fa fa-envelope");
    			attr_dev(i0, "arial-hidden", "true");
    			add_location(i0, file$1, 46, 56, 2041);
    			add_location(span, file$1, 46, 50, 2035);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-1yrpwju");
    			add_location(button, file$1, 46, 28, 2013);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "class", "svelte-1yrpwju");
    			add_location(form, file$1, 44, 24, 1892);
    			attr_dev(div7, "class", "footer-newslatter");
    			add_location(div7, file$1, 42, 20, 1734);
    			attr_dev(div8, "class", "footer-widget svelte-1yrpwju");
    			add_location(div8, file$1, 40, 16, 1644);
    			attr_dev(div9, "class", "col-lg-3 offset-lg-1 col-md-6 col-sm-6");
    			add_location(div9, file$1, 39, 12, 1574);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$1, 2, 8, 62);
    			attr_dev(i1, "class", "fa fa-heart-o svelte-1yrpwju");
    			attr_dev(i1, "arial-hidden", "true");
    			add_location(i1, file$1, 57, 94, 2496);
    			attr_dev(a10, "href", "#a");
    			attr_dev(a10, "class", "svelte-1yrpwju");
    			add_location(a10, file$1, 58, 28, 2575);
    			attr_dev(p2, "class", "svelte-1yrpwju");
    			add_location(p2, file$1, 57, 20, 2422);
    			attr_dev(div11, "class", "footer-copyright-text svelte-1yrpwju");
    			add_location(div11, file$1, 56, 16, 2365);
    			attr_dev(div12, "class", "col-lg-12 text-center");
    			add_location(div12, file$1, 55, 12, 2312);
    			attr_dev(div13, "class", "row");
    			add_location(div13, file$1, 54, 8, 2281);
    			attr_dev(div14, "class", "container");
    			add_location(div14, file$1, 1, 4, 29);
    			attr_dev(footer, "class", "footer svelte-1yrpwju");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div14);
    			append_dev(div14, div10);
    			append_dev(div10, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div1, t0);
    			append_dev(div1, p0);
    			append_dev(div1, t2);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    			append_dev(div10, t3);
    			append_dev(div10, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h60);
    			append_dev(div3, t5);
    			append_dev(div3, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a2);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(li1, a3);
    			append_dev(ul0, t9);
    			append_dev(ul0, li2);
    			append_dev(li2, a4);
    			append_dev(ul0, t11);
    			append_dev(ul0, li3);
    			append_dev(li3, a5);
    			append_dev(div10, t13);
    			append_dev(div10, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h61);
    			append_dev(div5, t15);
    			append_dev(div5, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a6);
    			append_dev(ul1, t17);
    			append_dev(ul1, li5);
    			append_dev(li5, a7);
    			append_dev(ul1, t19);
    			append_dev(ul1, li6);
    			append_dev(li6, a8);
    			append_dev(ul1, t21);
    			append_dev(ul1, li7);
    			append_dev(li7, a9);
    			append_dev(div10, t23);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h62);
    			append_dev(div8, t25);
    			append_dev(div8, div7);
    			append_dev(div7, p1);
    			append_dev(div7, t27);
    			append_dev(div7, form);
    			append_dev(form, input);
    			append_dev(form, t28);
    			append_dev(form, button);
    			append_dev(button, span);
    			append_dev(span, i0);
    			append_dev(div14, t29);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, p2);
    			append_dev(p2, t30);
    			append_dev(p2, i1);
    			append_dev(p2, t31);
    			append_dev(p2, a10);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let div;
    	let p;
    	let t2;
    	let filters;
    	let t3;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	filters = new Filters({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = "InnoAfisha";
    			t2 = space();
    			create_component(filters.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			add_location(p, file, 8, 2, 227);
    			attr_dev(div, "class", "title svelte-pk7flt");
    			add_location(div, file, 7, 1, 204);
    			add_location(main, file, 5, 0, 182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			append_dev(main, div);
    			append_dev(div, p);
    			append_dev(main, t2);
    			mount_component(filters, main, null);
    			append_dev(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(filters.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(filters.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(filters);
    			destroy_component(footer);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Filters, Footer });
    	return [];
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

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
