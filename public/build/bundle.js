
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    /* src\Forms.svelte generated by Svelte v3.48.0 */

    const file$2 = "src\\Forms.svelte";

    function create_fragment$2(ctx) {
    	let div6;
    	let div5;
    	let form0;
    	let h20;
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
    	let t6;
    	let form1;
    	let h21;
    	let t8;
    	let div2;
    	let i2;
    	let t9;
    	let input3;
    	let t10;
    	let div3;
    	let i3;
    	let t11;
    	let input4;
    	let t12;
    	let div4;
    	let i4;
    	let t13;
    	let input5;
    	let t14;
    	let input6;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			form0 = element("form");
    			h20 = element("h2");
    			h20.textContent = "Sign in";
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
    			t6 = space();
    			form1 = element("form");
    			h21 = element("h2");
    			h21.textContent = "Sign up";
    			t8 = space();
    			div2 = element("div");
    			i2 = element("i");
    			t9 = space();
    			input3 = element("input");
    			t10 = space();
    			div3 = element("div");
    			i3 = element("i");
    			t11 = space();
    			input4 = element("input");
    			t12 = space();
    			div4 = element("div");
    			i4 = element("i");
    			t13 = space();
    			input5 = element("input");
    			t14 = space();
    			input6 = element("input");
    			attr_dev(h20, "class", "title svelte-15z3zxf");
    			add_location(h20, file$2, 3, 12, 124);
    			attr_dev(i0, "class", "fas fa-user");
    			add_location(i0, file$2, 5, 16, 211);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			add_location(input0, file$2, 6, 16, 254);
    			attr_dev(div0, "class", "input-field svelte-15z3zxf");
    			add_location(div0, file$2, 4, 12, 168);
    			attr_dev(i1, "class", "fas fa-lock");
    			add_location(i1, file$2, 9, 16, 375);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file$2, 10, 16, 418);
    			attr_dev(div1, "class", "input-field svelte-15z3zxf");
    			add_location(div1, file$2, 8, 12, 332);
    			attr_dev(input2, "type", "submit");
    			input2.value = "Login";
    			attr_dev(input2, "class", "btn solid");
    			add_location(input2, file$2, 12, 12, 500);
    			attr_dev(form0, "action", "#");
    			attr_dev(form0, "class", "sign-in-form svelte-15z3zxf");
    			add_location(form0, file$2, 2, 8, 72);
    			attr_dev(h21, "class", "title svelte-15z3zxf");
    			add_location(h21, file$2, 15, 12, 634);
    			attr_dev(i2, "class", "fas fa-user");
    			add_location(i2, file$2, 17, 16, 721);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Username");
    			add_location(input3, file$2, 18, 16, 764);
    			attr_dev(div2, "class", "input-field svelte-15z3zxf");
    			add_location(div2, file$2, 16, 12, 678);
    			attr_dev(i3, "class", "fas fa-envelope");
    			add_location(i3, file$2, 21, 16, 885);
    			attr_dev(input4, "type", "email");
    			attr_dev(input4, "placeholder", "Email");
    			add_location(input4, file$2, 22, 16, 932);
    			attr_dev(div3, "class", "input-field svelte-15z3zxf");
    			add_location(div3, file$2, 20, 12, 842);
    			attr_dev(i4, "class", "fas fa-lock");
    			add_location(i4, file$2, 25, 16, 1051);
    			attr_dev(input5, "type", "password");
    			attr_dev(input5, "placeholder", "Password");
    			add_location(input5, file$2, 26, 16, 1094);
    			attr_dev(div4, "class", "input-field svelte-15z3zxf");
    			add_location(div4, file$2, 24, 12, 1008);
    			attr_dev(input6, "type", "submit");
    			attr_dev(input6, "class", "btn");
    			input6.value = "Sign up";
    			add_location(input6, file$2, 28, 12, 1176);
    			attr_dev(form1, "action", "#");
    			attr_dev(form1, "class", "sign-up-form svelte-15z3zxf");
    			add_location(form1, file$2, 14, 8, 582);
    			attr_dev(div5, "class", "signin-signup svelte-15z3zxf");
    			add_location(div5, file$2, 1, 4, 35);
    			attr_dev(div6, "class", "forms-container svelte-15z3zxf");
    			add_location(div6, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, form0);
    			append_dev(form0, h20);
    			append_dev(form0, t1);
    			append_dev(form0, div0);
    			append_dev(div0, i0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			append_dev(form0, t3);
    			append_dev(form0, div1);
    			append_dev(div1, i1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			append_dev(form0, t5);
    			append_dev(form0, input2);
    			append_dev(div5, t6);
    			append_dev(div5, form1);
    			append_dev(form1, h21);
    			append_dev(form1, t8);
    			append_dev(form1, div2);
    			append_dev(div2, i2);
    			append_dev(div2, t9);
    			append_dev(div2, input3);
    			append_dev(form1, t10);
    			append_dev(form1, div3);
    			append_dev(div3, i3);
    			append_dev(div3, t11);
    			append_dev(div3, input4);
    			append_dev(form1, t12);
    			append_dev(form1, div4);
    			append_dev(div4, i4);
    			append_dev(div4, t13);
    			append_dev(div4, input5);
    			append_dev(form1, t14);
    			append_dev(form1, input6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Forms', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Forms> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Forms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Forms",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Panels.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\Panels.svelte";

    function create_fragment$1(ctx) {
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
    			h11.textContent = "Innopolis Afisha";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Sign in and select your favorite events!";
    			t10 = space();
    			button1 = element("button");
    			button1.textContent = "Sign in";
    			t12 = space();
    			img1 = element("img");
    			set_style(h10, "font-size", "3rem");
    			add_location(h10, file$1, 3, 12, 111);
    			add_location(p0, file$1, 4, 12, 174);
    			attr_dev(button0, "class", "btn transparent");
    			attr_dev(button0, "id", "sign-up-btn");
    			add_location(button0, file$1, 5, 12, 235);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$1, 2, 8, 76);
    			if (!src_url_equal(img0.src, img0_src_value = "img/log.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "image svelte-1ktpngb");
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$1, 7, 8, 328);
    			attr_dev(div1, "class", "panel left-panel");
    			add_location(div1, file$1, 1, 4, 36);
    			set_style(h11, "font-size", "3rem");
    			add_location(h11, file$1, 11, 12, 468);
    			add_location(p1, file$1, 12, 12, 531);
    			attr_dev(button1, "class", "btn transparent");
    			attr_dev(button1, "id", "sign-in-btn");
    			add_location(button1, file$1, 13, 12, 592);
    			attr_dev(div2, "class", "content");
    			add_location(div2, file$1, 10, 8, 433);
    			if (!src_url_equal(img1.src, img1_src_value = "img/register.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "image svelte-1ktpngb");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 15, 8, 685);
    			attr_dev(div3, "class", "panel right-panel");
    			add_location(div3, file$1, 9, 4, 392);
    			attr_dev(div4, "class", "panels-container svelte-1ktpngb");
    			add_location(div4, file$1, 0, 0, 0);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Panels",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let forms;
    	let t1;
    	let panels;
    	let current;
    	forms = new Forms({ $$inline: true });
    	panels = new Panels({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			create_component(forms.$$.fragment);
    			t1 = space();
    			create_component(panels.$$.fragment);
    			attr_dev(div0, "class", "mainPage svelte-1wiikja");
    			add_location(div0, file, 6, 2, 139);
    			attr_dev(div1, "class", "container svelte-1wiikja");
    			add_location(div1, file, 5, 1, 113);
    			add_location(main, file, 4, 0, 105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			mount_component(forms, div1, null);
    			append_dev(div1, t1);
    			mount_component(panels, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(forms.$$.fragment, local);
    			transition_in(panels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(forms.$$.fragment, local);
    			transition_out(panels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(forms);
    			destroy_component(panels);
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

    	$$self.$capture_state = () => ({ Forms, Panels });
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
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    sign_up_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });
    sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
