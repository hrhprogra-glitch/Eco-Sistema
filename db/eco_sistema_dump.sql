--
-- PostgreSQL database dump
--

\restrict BED6Xb112cJfQCKHQsrW4f3QonDKCnvXaW3MIHIc0UrqfdsYliaq6cL9fBRnGUp

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: calendario_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendario_eventos (
    id integer NOT NULL,
    titulo text NOT NULL,
    fecha date NOT NULL,
    descripcion text,
    proyecto_id integer,
    created_at timestamp without time zone DEFAULT now(),
    piscina_id integer,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    CONSTRAINT calendario_eventos_estado_check CHECK (((estado)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('completado'::character varying)::text, ('cancelado'::character varying)::text])))
);


--
-- Name: calendario_eventos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calendario_eventos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calendario_eventos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calendario_eventos_id_seq OWNED BY public.calendario_eventos.id;


--
-- Name: contactos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contactos (
    id integer NOT NULL,
    nombre character varying(200) NOT NULL,
    tipo character varying(20) DEFAULT 'cliente'::character varying NOT NULL,
    es_empresa boolean DEFAULT true NOT NULL,
    email character varying(200) DEFAULT ''::character varying NOT NULL,
    telefono character varying(50) DEFAULT ''::character varying NOT NULL,
    sitio_web text DEFAULT ''::text NOT NULL,
    puesto_trabajo text DEFAULT ''::text NOT NULL,
    direccion jsonb DEFAULT '{}'::jsonb NOT NULL,
    identificaciones jsonb DEFAULT '[]'::jsonb NOT NULL,
    etiquetas jsonb DEFAULT '[]'::jsonb NOT NULL,
    contactos_relacionados jsonb DEFAULT '[]'::jsonb NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contactos_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('cliente'::character varying)::text, ('proveedor'::character varying)::text, ('otro'::character varying)::text])))
);


--
-- Name: contactos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contactos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contactos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contactos_id_seq OWNED BY public.contactos.id;


--
-- Name: empleados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empleados (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    puesto character varying(100) NOT NULL,
    area character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    foto_url text,
    email_trabajo character varying(200),
    telefono_trabajo character varying(50),
    jefe_directo character varying(150),
    dni character varying(20),
    dni_foto_url text,
    monto_pago numeric(12,2) DEFAULT 0 NOT NULL
);


--
-- Name: empleados_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.empleados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: empleados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.empleados_id_seq OWNED BY public.empleados.id;


--
-- Name: piscina_materiales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscina_materiales (
    id integer NOT NULL,
    piscina_id integer NOT NULL,
    nombre_material character varying(150) NOT NULL,
    cantidad numeric(10,2) DEFAULT 1 NOT NULL,
    monto numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: piscina_materiales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.piscina_materiales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: piscina_materiales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.piscina_materiales_id_seq OWNED BY public.piscina_materiales.id;


--
-- Name: piscina_pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscina_pagos (
    id integer NOT NULL,
    piscina_id integer NOT NULL,
    monto numeric(12,2) DEFAULT 0 NOT NULL,
    periodo_inicio date NOT NULL,
    periodo_fin date NOT NULL,
    pagado boolean DEFAULT false NOT NULL,
    fecha_pago date,
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: piscina_pagos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.piscina_pagos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: piscina_pagos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.piscina_pagos_id_seq OWNED BY public.piscina_pagos.id;


--
-- Name: piscinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscinas (
    id integer NOT NULL,
    contacto_id integer NOT NULL,
    nombre character varying(150) DEFAULT ''::character varying NOT NULL,
    ubicacion text DEFAULT ''::text NOT NULL,
    volumen_m3 numeric(10,2) DEFAULT 0 NOT NULL,
    estado character varying(20) DEFAULT 'operativa'::character varying NOT NULL,
    nivel_cloro numeric(5,2),
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT piscinas_estado_check CHECK (((estado)::text = ANY (ARRAY[('operativa'::character varying)::text, ('mantenimiento'::character varying)::text, ('cerrada'::character varying)::text])))
);


--
-- Name: piscinas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.piscinas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: piscinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.piscinas_id_seq OWNED BY public.piscinas.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    sku character varying(50) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    precio numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    favorito boolean DEFAULT false NOT NULL,
    foto_url text,
    vende boolean DEFAULT true NOT NULL,
    compra boolean DEFAULT false NOT NULL,
    es_gasto boolean DEFAULT false NOT NULL,
    tipo character varying(20) DEFAULT 'bienes'::character varying NOT NULL,
    rastrear_inventario boolean DEFAULT false NOT NULL,
    unidad character varying(30) DEFAULT 'Unidad'::character varying NOT NULL,
    impuesto_venta character varying(50),
    codigo_detraccion character varying(50),
    costo numeric(12,2) DEFAULT 0 NOT NULL,
    categoria character varying(100),
    referencia character varying(100),
    codigo_barras character varying(100),
    notas_internas text,
    limite_stock integer DEFAULT 0 NOT NULL,
    CONSTRAINT productos_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('bienes'::character varying)::text, ('servicio'::character varying)::text, ('combo'::character varying)::text])))
);


--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: proyecto_empleados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyecto_empleados (
    proyecto_id integer NOT NULL,
    empleado_id integer NOT NULL
);


--
-- Name: proyecto_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyecto_items (
    id integer NOT NULL,
    proyecto_id integer,
    producto_id integer,
    nombre_externo text,
    cantidad integer NOT NULL,
    justificacion text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: proyecto_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proyecto_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proyecto_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proyecto_items_id_seq OWNED BY public.proyecto_items.id;


--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyectos (
    id integer NOT NULL,
    nombre text NOT NULL,
    estado text DEFAULT 'en_progreso'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: proyectos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proyectos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proyectos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proyectos_id_seq OWNED BY public.proyectos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    nombre_completo character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: calendario_eventos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendario_eventos ALTER COLUMN id SET DEFAULT nextval('public.calendario_eventos_id_seq'::regclass);


--
-- Name: contactos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contactos ALTER COLUMN id SET DEFAULT nextval('public.contactos_id_seq'::regclass);


--
-- Name: empleados id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.empleados_id_seq'::regclass);


--
-- Name: piscina_materiales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_materiales ALTER COLUMN id SET DEFAULT nextval('public.piscina_materiales_id_seq'::regclass);


--
-- Name: piscina_pagos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_pagos ALTER COLUMN id SET DEFAULT nextval('public.piscina_pagos_id_seq'::regclass);


--
-- Name: piscinas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscinas ALTER COLUMN id SET DEFAULT nextval('public.piscinas_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Name: proyecto_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_items ALTER COLUMN id SET DEFAULT nextval('public.proyecto_items_id_seq'::regclass);


--
-- Name: proyectos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyectos ALTER COLUMN id SET DEFAULT nextval('public.proyectos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: calendario_eventos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendario_eventos (id, titulo, fecha, descripcion, proyecto_id, created_at, piscina_id, estado) FROM stdin;
1	mantenimiento	2026-07-02	\N	\N	2026-07-06 20:16:17.825175	\N	pendiente
\.


--
-- Data for Name: contactos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contactos (id, nombre, tipo, es_empresa, email, telefono, sitio_web, puesto_trabajo, direccion, identificaciones, etiquetas, contactos_relacionados, notas, created_at) FROM stdin;
1	Harry	cliente	t	harry@gmail	946000608			{"zip": "", "pais": "", "calle": "", "calle2": "", "ciudad": "", "estado": "", "distrito": ""}	[]	[]	[]		2026-07-05 20:56:22.216318-05
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empleados (id, nombre, puesto, area, created_at, foto_url, email_trabajo, telefono_trabajo, jefe_directo, dni, dni_foto_url, monto_pago) FROM stdin;
4	Harry			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
5	Billy			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
6	Jhon			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
7	Marco			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
8	Raul			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
9	Antony			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
10	Amador			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
11	Jose			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00
12	Ulices	Jefe		2026-07-05 22:54:56.766021-05	\N	\N	\N	\N	\N	\N	0.00
\.


--
-- Data for Name: piscina_materiales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscina_materiales (id, piscina_id, nombre_material, cantidad, monto, fecha, notas, created_at) FROM stdin;
\.


--
-- Data for Name: piscina_pagos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscina_pagos (id, piscina_id, monto, periodo_inicio, periodo_fin, pagado, fecha_pago, notas, created_at) FROM stdin;
\.


--
-- Data for Name: piscinas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscinas (id, contacto_id, nombre, ubicacion, volumen_m3, estado, nivel_cloro, notas, created_at) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (id, nombre, sku, stock, precio, created_at, favorito, foto_url, vende, compra, es_gasto, tipo, rastrear_inventario, unidad, impuesto_venta, codigo_detraccion, costo, categoria, referencia, codigo_barras, notas_internas, limite_stock) FROM stdin;
4	Aspersor de Impacto	RIE-002	30	45.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Accesorios	\N	\N	\N	5
5	Generador Gasolina 3KW	EQ-100	5	1200.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Equipos	\N	\N	\N	2
6	Bomba de Agua 1HP	BOM-01	8	350.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Electrobombas	\N	\N	\N	3
7	Cloro en Pastillas (1kg)	PIS-05	20	35.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Piscinas	\N	\N	\N	10
3	Tubo PVC 1/2	PVC-001	49	12.50	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Accesorios	\N	\N	\N	10
\.


--
-- Data for Name: proyecto_empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_empleados (proyecto_id, empleado_id) FROM stdin;
1	4
\.


--
-- Data for Name: proyecto_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_items (id, proyecto_id, producto_id, nombre_externo, cantidad, justificacion, created_at) FROM stdin;
1	1	3	\N	1	\N	2026-07-05 23:36:59.82473
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyectos (id, nombre, estado, created_at) FROM stdin;
1	OMAR	en_progreso	2026-07-05 23:36:31.023452
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, username, password_hash, nombre_completo, created_at) FROM stdin;
1	harry	$2b$10$2oO0ysur9CFTXVPZJ81Smenyt6MkD6tmmcZ7Lln.cPf/y0GwPrrmC	Harry	2026-07-05 15:25:03.511624-05
\.


--
-- Name: calendario_eventos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calendario_eventos_id_seq', 1, true);


--
-- Name: contactos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contactos_id_seq', 1, true);


--
-- Name: empleados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empleados_id_seq', 12, true);


--
-- Name: piscina_materiales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piscina_materiales_id_seq', 1, false);


--
-- Name: piscina_pagos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piscina_pagos_id_seq', 1, false);


--
-- Name: piscinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piscinas_id_seq', 1, false);


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.productos_id_seq', 8, true);


--
-- Name: proyecto_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proyecto_items_id_seq', 2, true);


--
-- Name: proyectos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proyectos_id_seq', 3, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, true);


--
-- Name: calendario_eventos calendario_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendario_eventos
    ADD CONSTRAINT calendario_eventos_pkey PRIMARY KEY (id);


--
-- Name: contactos contactos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contactos
    ADD CONSTRAINT contactos_pkey PRIMARY KEY (id);


--
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);


--
-- Name: piscina_materiales piscina_materiales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_materiales
    ADD CONSTRAINT piscina_materiales_pkey PRIMARY KEY (id);


--
-- Name: piscina_pagos piscina_pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_pagos
    ADD CONSTRAINT piscina_pagos_pkey PRIMARY KEY (id);


--
-- Name: piscinas piscinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscinas
    ADD CONSTRAINT piscinas_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: productos productos_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_sku_key UNIQUE (sku);


--
-- Name: proyecto_empleados proyecto_empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_empleados
    ADD CONSTRAINT proyecto_empleados_pkey PRIMARY KEY (proyecto_id, empleado_id);


--
-- Name: proyecto_items proyecto_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_items
    ADD CONSTRAINT proyecto_items_pkey PRIMARY KEY (id);


--
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- Name: idx_piscina_materiales_piscina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_piscina_materiales_piscina ON public.piscina_materiales USING btree (piscina_id);


--
-- Name: idx_piscina_pagos_piscina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_piscina_pagos_piscina ON public.piscina_pagos USING btree (piscina_id);


--
-- Name: idx_piscinas_contacto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_piscinas_contacto ON public.piscinas USING btree (contacto_id);


--
-- Name: calendario_eventos calendario_eventos_piscina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendario_eventos
    ADD CONSTRAINT calendario_eventos_piscina_id_fkey FOREIGN KEY (piscina_id) REFERENCES public.piscinas(id) ON DELETE CASCADE;


--
-- Name: calendario_eventos calendario_eventos_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendario_eventos
    ADD CONSTRAINT calendario_eventos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE SET NULL;


--
-- Name: piscina_materiales piscina_materiales_piscina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_materiales
    ADD CONSTRAINT piscina_materiales_piscina_id_fkey FOREIGN KEY (piscina_id) REFERENCES public.piscinas(id) ON DELETE CASCADE;


--
-- Name: piscina_pagos piscina_pagos_piscina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_pagos
    ADD CONSTRAINT piscina_pagos_piscina_id_fkey FOREIGN KEY (piscina_id) REFERENCES public.piscinas(id) ON DELETE CASCADE;


--
-- Name: piscinas piscinas_contacto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscinas
    ADD CONSTRAINT piscinas_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id) ON DELETE CASCADE;


--
-- Name: proyecto_empleados proyecto_empleados_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_empleados
    ADD CONSTRAINT proyecto_empleados_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: proyecto_empleados proyecto_empleados_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_empleados
    ADD CONSTRAINT proyecto_empleados_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: proyecto_items proyecto_items_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_items
    ADD CONSTRAINT proyecto_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE SET NULL;


--
-- Name: proyecto_items proyecto_items_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_items
    ADD CONSTRAINT proyecto_items_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BED6Xb112cJfQCKHQsrW4f3QonDKCnvXaW3MIHIc0UrqfdsYliaq6cL9fBRnGUp

