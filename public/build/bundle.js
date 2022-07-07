
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

    /* src\lib\extra\Header.svelte generated by Svelte v3.48.0 */

    const file$2 = "src\\lib\\extra\\Header.svelte";

    function create_fragment$2(ctx) {
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
    			attr_dev(div0, "class", "corner svelte-1wppy64");
    			add_location(div0, file$2, 10, 4, 250);
    			attr_dev(div1, "class", "corner svelte-1wppy64");
    			add_location(div1, file$2, 9, 2, 224);
    			attr_dev(nav, "class", "svelte-1wppy64");
    			add_location(nav, file$2, 15, 2, 326);
    			if (!src_url_equal(img0.src, img0_src_value = "img/favorite.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "favorite");
    			attr_dev(img0, "class", "svelte-1wppy64");
    			add_location(img0, file$2, 22, 10, 454);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1wppy64");
    			add_location(a0, file$2, 21, 6, 430);
    			if (!src_url_equal(img1.src, img1_src_value = "img/login.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "log in");
    			attr_dev(img1, "class", "svelte-1wppy64");
    			add_location(img1, file$2, 25, 10, 543);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-1wppy64");
    			add_location(a1, file$2, 24, 6, 519);
    			attr_dev(div2, "class", "social-block");
    			add_location(div2, file$2, 20, 4, 396);
    			attr_dev(div3, "class", "corner social svelte-1wppy64");
    			add_location(div3, file$2, 19, 2, 363);
    			attr_dev(header, "class", "svelte-1wppy64");
    			add_location(header, file$2, 8, 0, 212);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\lib\main\Filters.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\lib\\main\\Filters.svelte";

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let div16;
    	let input0;
    	let t2;
    	let label0;
    	let t4;
    	let input1;
    	let t5;
    	let label1;
    	let t7;
    	let input2;
    	let t8;
    	let label2;
    	let t10;
    	let input3;
    	let t11;
    	let label3;
    	let t13;
    	let div0;
    	let t15;
    	let div1;
    	let t17;
    	let div2;
    	let t19;
    	let div3;
    	let t21;
    	let div4;
    	let t23;
    	let div5;
    	let t25;
    	let div6;
    	let t27;
    	let div7;
    	let t29;
    	let div8;
    	let t31;
    	let div9;
    	let t33;
    	let div10;
    	let t35;
    	let div11;
    	let t37;
    	let div12;
    	let t39;
    	let div13;
    	let t41;
    	let div14;
    	let t43;
    	let div15;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "FILTER BY COLOR";
    			t1 = space();
    			div16 = element("div");
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "BLUE";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "RED";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			label2 = element("label");
    			label2.textContent = "GREEN";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			label3 = element("label");
    			label3.textContent = "RESET";
    			t13 = space();
    			div0 = element("div");
    			div0.textContent = "1";
    			t15 = space();
    			div1 = element("div");
    			div1.textContent = "2";
    			t17 = space();
    			div2 = element("div");
    			div2.textContent = "3";
    			t19 = space();
    			div3 = element("div");
    			div3.textContent = "4";
    			t21 = space();
    			div4 = element("div");
    			div4.textContent = "5";
    			t23 = space();
    			div5 = element("div");
    			div5.textContent = "6";
    			t25 = space();
    			div6 = element("div");
    			div6.textContent = "7";
    			t27 = space();
    			div7 = element("div");
    			div7.textContent = "8";
    			t29 = space();
    			div8 = element("div");
    			div8.textContent = "9";
    			t31 = space();
    			div9 = element("div");
    			div9.textContent = "10";
    			t33 = space();
    			div10 = element("div");
    			div10.textContent = "11";
    			t35 = space();
    			div11 = element("div");
    			div11.textContent = "12";
    			t37 = space();
    			div12 = element("div");
    			div12.textContent = "13";
    			t39 = space();
    			div13 = element("div");
    			div13.textContent = "14";
    			t41 = space();
    			div14 = element("div");
    			div14.textContent = "15";
    			t43 = space();
    			div15 = element("div");
    			div15.textContent = "16";
    			attr_dev(h1, "class", "svelte-qz1auf");
    			add_location(h1, file$1, 0, 0, 0);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "blue");
    			attr_dev(input0, "name", "color");
    			attr_dev(input0, "class", "svelte-qz1auf");
    			add_location(input0, file$1, 2, 2, 50);
    			attr_dev(label0, "for", "blue");
    			attr_dev(label0, "class", "svelte-qz1auf");
    			add_location(label0, file$1, 3, 2, 99);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "red");
    			attr_dev(input1, "name", "color");
    			attr_dev(input1, "class", "svelte-qz1auf");
    			add_location(input1, file$1, 4, 2, 133);
    			attr_dev(label1, "for", "red");
    			attr_dev(label1, "class", "svelte-qz1auf");
    			add_location(label1, file$1, 5, 2, 181);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "id", "green");
    			attr_dev(input2, "name", "color");
    			attr_dev(input2, "class", "svelte-qz1auf");
    			add_location(input2, file$1, 6, 2, 213);
    			attr_dev(label2, "for", "green");
    			attr_dev(label2, "class", "svelte-qz1auf");
    			add_location(label2, file$1, 7, 2, 263);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "id", "reset");
    			attr_dev(input3, "name", "color");
    			attr_dev(input3, "class", "svelte-qz1auf");
    			add_location(input3, file$1, 8, 2, 299);
    			attr_dev(label3, "for", "reset");
    			attr_dev(label3, "class", "svelte-qz1auf");
    			add_location(label3, file$1, 9, 2, 349);
    			attr_dev(div0, "class", "tile blue svelte-qz1auf");
    			add_location(div0, file$1, 11, 2, 387);
    			attr_dev(div1, "class", "tile red svelte-qz1auf");
    			add_location(div1, file$1, 12, 2, 421);
    			attr_dev(div2, "class", "tile blue svelte-qz1auf");
    			add_location(div2, file$1, 13, 2, 454);
    			attr_dev(div3, "class", "tile green svelte-qz1auf");
    			add_location(div3, file$1, 14, 2, 488);
    			attr_dev(div4, "class", "tile blue svelte-qz1auf");
    			add_location(div4, file$1, 15, 2, 523);
    			attr_dev(div5, "class", "tile red svelte-qz1auf");
    			add_location(div5, file$1, 16, 2, 557);
    			attr_dev(div6, "class", "tile red svelte-qz1auf");
    			add_location(div6, file$1, 17, 2, 590);
    			attr_dev(div7, "class", "tile green svelte-qz1auf");
    			add_location(div7, file$1, 18, 2, 623);
    			attr_dev(div8, "class", "tile blue svelte-qz1auf");
    			add_location(div8, file$1, 19, 2, 658);
    			attr_dev(div9, "class", "tile green svelte-qz1auf");
    			add_location(div9, file$1, 20, 2, 692);
    			attr_dev(div10, "class", "tile red svelte-qz1auf");
    			add_location(div10, file$1, 21, 2, 728);
    			attr_dev(div11, "class", "tile green svelte-qz1auf");
    			add_location(div11, file$1, 22, 2, 762);
    			attr_dev(div12, "class", "tile blue svelte-qz1auf");
    			add_location(div12, file$1, 23, 2, 798);
    			attr_dev(div13, "class", "tile blue svelte-qz1auf");
    			add_location(div13, file$1, 24, 2, 833);
    			attr_dev(div14, "class", "tile green svelte-qz1auf");
    			add_location(div14, file$1, 25, 2, 868);
    			attr_dev(div15, "class", "tile red svelte-qz1auf");
    			add_location(div15, file$1, 26, 2, 904);
    			attr_dev(div16, "class", "filter svelte-qz1auf");
    			add_location(div16, file$1, 1, 0, 26);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div16, anchor);
    			append_dev(div16, input0);
    			append_dev(div16, t2);
    			append_dev(div16, label0);
    			append_dev(div16, t4);
    			append_dev(div16, input1);
    			append_dev(div16, t5);
    			append_dev(div16, label1);
    			append_dev(div16, t7);
    			append_dev(div16, input2);
    			append_dev(div16, t8);
    			append_dev(div16, label2);
    			append_dev(div16, t10);
    			append_dev(div16, input3);
    			append_dev(div16, t11);
    			append_dev(div16, label3);
    			append_dev(div16, t13);
    			append_dev(div16, div0);
    			append_dev(div16, t15);
    			append_dev(div16, div1);
    			append_dev(div16, t17);
    			append_dev(div16, div2);
    			append_dev(div16, t19);
    			append_dev(div16, div3);
    			append_dev(div16, t21);
    			append_dev(div16, div4);
    			append_dev(div16, t23);
    			append_dev(div16, div5);
    			append_dev(div16, t25);
    			append_dev(div16, div6);
    			append_dev(div16, t27);
    			append_dev(div16, div7);
    			append_dev(div16, t29);
    			append_dev(div16, div8);
    			append_dev(div16, t31);
    			append_dev(div16, div9);
    			append_dev(div16, t33);
    			append_dev(div16, div10);
    			append_dev(div16, t35);
    			append_dev(div16, div11);
    			append_dev(div16, t37);
    			append_dev(div16, div12);
    			append_dev(div16, t39);
    			append_dev(div16, div13);
    			append_dev(div16, t41);
    			append_dev(div16, div14);
    			append_dev(div16, t43);
    			append_dev(div16, div15);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div16);
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
    	validate_slots('Filters', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let main;
    	let div;
    	let p;
    	let t2;
    	let filters;
    	let current;
    	header = new Header({ $$inline: true });
    	filters = new Filters({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div = element("div");
    			p = element("p");
    			p.textContent = "InnoAfisha";
    			t2 = space();
    			create_component(filters.$$.fragment);
    			add_location(p, file, 7, 2, 174);
    			attr_dev(div, "class", "title svelte-ynmukb");
    			add_location(div, file, 6, 1, 151);
    			add_location(main, file, 5, 0, 142);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, p);
    			append_dev(main, t2);
    			mount_component(filters, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(filters.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(filters.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(filters);
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

    	$$self.$capture_state = () => ({ Header, Filters });
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
