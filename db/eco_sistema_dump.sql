--
-- PostgreSQL database dump
--

\restrict BqVDrxU5IRfJKidrSGday3WXi4rO6RsarpkjeNhDpgvqlk0kiMY7yEC1CeuQA7a

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: sync_outbox_capture(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_outbox_capture() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO sync_outbox(table_name, operation, payload) VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD));
  ELSE
    INSERT INTO sync_outbox(table_name, operation, payload) VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW));
  END IF;
  RETURN NULL;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asiento_lineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asiento_lineas (
    id integer NOT NULL,
    asiento_id integer NOT NULL,
    cuenta_id integer NOT NULL,
    debe numeric(14,2) DEFAULT 0 NOT NULL,
    haber numeric(14,2) DEFAULT 0 NOT NULL,
    descripcion character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: asiento_lineas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asiento_lineas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asiento_lineas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asiento_lineas_id_seq OWNED BY public.asiento_lineas.id;


--
-- Name: asientos_contables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asientos_contables (
    id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    descripcion character varying(255) NOT NULL,
    estado character varying(20) DEFAULT 'borrador'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT asientos_contables_estado_check CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'confirmado'::character varying])::text[])))
);


--
-- Name: asientos_contables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asientos_contables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asientos_contables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asientos_contables_id_seq OWNED BY public.asientos_contables.id;


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
    tipo character varying(50) DEFAULT 'nota'::character varying,
    trabajadores text,
    CONSTRAINT calendario_eventos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'completado'::character varying, 'cancelado'::character varying])::text[])))
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
    CONSTRAINT contactos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['cliente'::character varying, 'proveedor'::character varying, 'otro'::character varying])::text[])))
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
-- Name: gastos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gastos (
    id integer NOT NULL,
    concepto character varying(150) NOT NULL,
    categoria character varying(100) NOT NULL,
    monto numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    notas text,
    comprobante_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gastos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'pagado'::character varying])::text[])))
);


--
-- Name: gastos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gastos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gastos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gastos_id_seq OWNED BY public.gastos.id;


--
-- Name: piscina_consumos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscina_consumos (
    id integer NOT NULL,
    piscina_id integer NOT NULL,
    producto_id integer,
    nombre_externo text,
    cantidad integer NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: piscina_consumos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.piscina_consumos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: piscina_consumos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.piscina_consumos_id_seq OWNED BY public.piscina_consumos.id;


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
    frecuencia character varying(20) DEFAULT 'semanal'::character varying NOT NULL,
    precio_mantenimiento numeric(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT piscinas_estado_check CHECK (((estado)::text = ANY ((ARRAY['operativa'::character varying, 'mantenimiento'::character varying, 'cerrada'::character varying])::text[]))),
    CONSTRAINT piscinas_frecuencia_check CHECK (((frecuencia)::text = ANY ((ARRAY['semanal'::character varying, 'quincenal'::character varying])::text[])))
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
-- Name: plan_cuentas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_cuentas (
    id integer NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    tipo character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT plan_cuentas_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['activo'::character varying, 'pasivo'::character varying, 'patrimonio'::character varying, 'ingreso'::character varying, 'gasto'::character varying])::text[])))
);


--
-- Name: plan_cuentas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_cuentas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_cuentas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_cuentas_id_seq OWNED BY public.plan_cuentas.id;


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
    CONSTRAINT productos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['bienes'::character varying, 'servicio'::character varying, 'combo'::character varying])::text[])))
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
-- Name: sync_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_outbox (
    id bigint NOT NULL,
    table_name text NOT NULL,
    operation text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    synced_at timestamp with time zone,
    attempts integer DEFAULT 0 NOT NULL,
    last_error text
);


--
-- Name: sync_outbox_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sync_outbox_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sync_outbox_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sync_outbox_id_seq OWNED BY public.sync_outbox.id;


--
-- Name: sync_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_state (
    id boolean DEFAULT true NOT NULL,
    is_online boolean DEFAULT false NOT NULL,
    last_check_at timestamp with time zone,
    last_success_at timestamp with time zone,
    CONSTRAINT sync_state_id_check CHECK (id)
);


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
-- Name: venta_lineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venta_lineas (
    id integer NOT NULL,
    venta_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL,
    precio_unitario numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: venta_lineas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.venta_lineas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: venta_lineas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.venta_lineas_id_seq OWNED BY public.venta_lineas.id;


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas (
    id integer NOT NULL,
    contacto_id integer NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    estado character varying(50) DEFAULT 'borrador'::character varying NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ventas_estado_check CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'confirmada'::character varying, 'facturada'::character varying, 'cancelada'::character varying])::text[])))
);


--
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventas_id_seq OWNED BY public.ventas.id;


--
-- Name: asiento_lineas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asiento_lineas ALTER COLUMN id SET DEFAULT nextval('public.asiento_lineas_id_seq'::regclass);


--
-- Name: asientos_contables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asientos_contables ALTER COLUMN id SET DEFAULT nextval('public.asientos_contables_id_seq'::regclass);


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
-- Name: gastos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos ALTER COLUMN id SET DEFAULT nextval('public.gastos_id_seq'::regclass);


--
-- Name: piscina_consumos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_consumos ALTER COLUMN id SET DEFAULT nextval('public.piscina_consumos_id_seq'::regclass);


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
-- Name: plan_cuentas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_cuentas ALTER COLUMN id SET DEFAULT nextval('public.plan_cuentas_id_seq'::regclass);


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
-- Name: sync_outbox id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_outbox ALTER COLUMN id SET DEFAULT nextval('public.sync_outbox_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: venta_lineas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta_lineas ALTER COLUMN id SET DEFAULT nextval('public.venta_lineas_id_seq'::regclass);


--
-- Name: ventas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas ALTER COLUMN id SET DEFAULT nextval('public.ventas_id_seq'::regclass);


--
-- Data for Name: asiento_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asiento_lineas (id, asiento_id, cuenta_id, debe, haber, descripcion, created_at) FROM stdin;
\.


--
-- Data for Name: asientos_contables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asientos_contables (id, fecha, descripcion, estado, created_at) FROM stdin;
\.


--
-- Data for Name: calendario_eventos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendario_eventos (id, titulo, fecha, descripcion, proyecto_id, created_at, piscina_id, estado, tipo, trabajadores) FROM stdin;
1	matenimiendo	2026-07-09	\N	\N	2026-07-08 19:22:58.459099	1	pendiente	nota	\N
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
-- Data for Name: gastos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gastos (id, concepto, categoria, monto, fecha, estado, notas, comprobante_url, created_at) FROM stdin;
\.


--
-- Data for Name: piscina_consumos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscina_consumos (id, piscina_id, producto_id, nombre_externo, cantidad, notas, created_at) FROM stdin;
1	1	153	\N	1	\N	2026-07-08 19:23:58.377284-05
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
1	1	0.00	2026-07-01	2026-07-31	f	\N		2026-07-09 13:56:18.953035-05
2	1	0.00	2026-07-01	2026-07-31	f	\N		2026-07-09 13:56:28.813652-05
\.


--
-- Data for Name: piscinas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscinas (id, contacto_id, nombre, ubicacion, volumen_m3, estado, nivel_cloro, notas, created_at, frecuencia, precio_mantenimiento) FROM stdin;
1	1			0.00	operativa	\N		2026-07-08 14:51:31.719776-05	semanal	0.00
\.


--
-- Data for Name: plan_cuentas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_cuentas (id, codigo, nombre, tipo, created_at) FROM stdin;
1	1000	Caja	activo	2026-07-08 15:58:25.294339-05
2	1010	Bancos	activo	2026-07-08 15:58:25.294339-05
3	1020	Cuentas por Cobrar	activo	2026-07-08 15:58:25.294339-05
4	1030	Inventario de Mercaderías	activo	2026-07-08 15:58:25.294339-05
5	1040	Activos Fijos	activo	2026-07-08 15:58:25.294339-05
6	2000	Cuentas por Pagar	pasivo	2026-07-08 15:58:25.294339-05
7	2010	Impuestos por Pagar	pasivo	2026-07-08 15:58:25.294339-05
8	2020	Préstamos por Pagar	pasivo	2026-07-08 15:58:25.294339-05
9	3000	Capital Social	patrimonio	2026-07-08 15:58:25.294339-05
10	3010	Resultados Acumulados	patrimonio	2026-07-08 15:58:25.294339-05
11	4000	Ventas	ingreso	2026-07-08 15:58:25.294339-05
12	4010	Otros Ingresos	ingreso	2026-07-08 15:58:25.294339-05
13	5000	Costo de Ventas	gasto	2026-07-08 15:58:25.294339-05
14	5010	Gastos Operativos	gasto	2026-07-08 15:58:25.294339-05
15	5020	Gastos de Personal	gasto	2026-07-08 15:58:25.294339-05
16	5030	Gastos Financieros	gasto	2026-07-08 15:58:25.294339-05
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (id, nombre, sku, stock, precio, created_at, favorito, foto_url, vende, compra, es_gasto, tipo, rastrear_inventario, unidad, impuesto_venta, codigo_detraccion, costo, categoria, referencia, codigo_barras, notas_internas, limite_stock) FROM stdin;
57	TEE DE 1" S/P INYECTOPLAST	ACC-048	-1	0.00	2026-07-08 16:48:35.329802-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
10	ADAPTADOR DE 1/2" PVC	ACC-001	0	0.00	2026-07-08 16:48:35.302771-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
11	CODO DE 1/2" MX INYECTOPLAST	ACC-002	0	0.00	2026-07-08 16:48:35.307804-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
12	CODO DE 1/2" S/P INYECTOPLAST	ACC-003	0	0.00	2026-07-08 16:48:35.308474-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
13	CODO DE 1/2" S/P PAVCO	ACC-004	0	0.00	2026-07-08 16:48:35.309158-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
14	CODO DE 1/2" X 45° S/P HECHIZO	ACC-005	0	0.00	2026-07-08 16:48:35.309785-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
15	TEE DE 1/2" S/P INYECTOPLAST	ACC-006	0	0.00	2026-07-08 16:48:35.310407-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
16	TEE DE 1/2" S/P PAVCO	ACC-007	0	0.00	2026-07-08 16:48:35.310987-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
17	UNIÓN DE 1/2" C/R INYECTOPLAST	ACC-008	0	0.00	2026-07-08 16:48:35.311669-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
18	UNIÓN DE 1/2" MX INYECTOPLAST	ACC-009	0	0.00	2026-07-08 16:48:35.312319-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
19	UNIÓN DE 1/2" S/P HECHIZO	ACC-010	0	0.00	2026-07-08 16:48:35.312972-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
20	UNIÓN DE 1/2" S/P INYECTOPLAST	ACC-011	0	0.00	2026-07-08 16:48:35.313452-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
21	UNIÓN DE 1/2" S/P PAVCO	ACC-012	0	0.00	2026-07-08 16:48:35.313933-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
22	ADAPTADOR DE 3/4" PVC	ACC-013	0	0.00	2026-07-08 16:48:35.314387-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
23	BUSHING DE 3/4" X 1/2" INYECTOPLAST	ACC-014	0	0.00	2026-07-08 16:48:35.314821-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
24	BUSHING DE 3/4" X 1/2" PAVCO	ACC-015	0	0.00	2026-07-08 16:48:35.315262-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
25	CODO DE 3/4" MX INYECTOPLAST	ACC-016	0	0.00	2026-07-08 16:48:35.315705-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
26	CODO DE 3/4" S/P INYECTOPLAST	ACC-017	0	0.00	2026-07-08 16:48:35.316151-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
27	CODO DE 3/4" S/P PAVCO	ACC-018	0	0.00	2026-07-08 16:48:35.316581-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
28	CODO DE 3/4" X 45° HECHIZO	ACC-019	0	0.00	2026-07-08 16:48:35.317031-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
29	CURVA DE 3/4" LUZ	ACC-020	0	0.00	2026-07-08 16:48:35.317497-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
30	REDUCCIÓN DE 3/4" X 1/2" C/R (HECHIZO)	ACC-021	0	0.00	2026-07-08 16:48:35.317939-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
31	REDUCCIÓN DE 3/4" X 1/2" S/P (HECHIZO)	ACC-022	0	0.00	2026-07-08 16:48:35.31837-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
32	REDUCCIÓN DE 3/4" X 1/2" S/P PAVCO	ACC-023	0	0.00	2026-07-08 16:48:35.318766-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
33	TEE DE 3/4" S/P INYECTOPLAST	ACC-024	0	0.00	2026-07-08 16:48:35.31918-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
34	TEE DE 3/4" S/P PAVCO	ACC-025	0	0.00	2026-07-08 16:48:35.319606-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
35	UNIÓN DE 3/4" C/R INYECTOPLAST	ACC-026	0	0.00	2026-07-08 16:48:35.320071-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
36	UNIÓN DE 3/4" MIXTO INYECTOPLAST	ACC-027	0	0.00	2026-07-08 16:48:35.320459-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
37	UNIÓN DE 3/4" S/P HECHIZO	ACC-028	0	0.00	2026-07-08 16:48:35.320833-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
38	UNIÓN DE 3/4" S/P INYECTOPLAST	ACC-029	0	0.00	2026-07-08 16:48:35.321275-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
39	UNIÓN DE 3/4" S/P PAVCO	ACC-030	0	0.00	2026-07-08 16:48:35.32172-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
40	ADAPTADOR DE 1" PAVCO	ACC-031	0	0.00	2026-07-08 16:48:35.322147-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
41	ADAPTADOR DE 1" PVC	ACC-032	0	0.00	2026-07-08 16:48:35.322561-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
42	BUSHING DE 1" X 1/2" INYECTOPLAST	ACC-033	0	0.00	2026-07-08 16:48:35.322984-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
43	BUSHING DE 1" X 1/2" PAVCO	ACC-034	0	0.00	2026-07-08 16:48:35.323426-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
44	BUSHING DE 1" X 3/4" INYECTOPLAST	ACC-035	0	0.00	2026-07-08 16:48:35.323876-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
45	BUSHING DE 1" X 3/4" PAVCO	ACC-036	0	0.00	2026-07-08 16:48:35.324298-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
46	CODO DE 1" S/P INYECTOPLAST	ACC-037	0	0.00	2026-07-08 16:48:35.324724-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
47	CODO DE 1" S/P PAVCO	ACC-038	0	0.00	2026-07-08 16:48:35.325404-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
48	CODO DE 1" X 45° HECHIZO	ACC-039	0	0.00	2026-07-08 16:48:35.325819-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
49	CODO DE 1" X 45° INYECTOPLAST	ACC-040	0	0.00	2026-07-08 16:48:35.326212-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
50	CURVA DE 1" LUZ	ACC-041	0	0.00	2026-07-08 16:48:35.326632-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
51	REDUCCIÓN DE 1" X 1/2"  C/R	ACC-042	0	0.00	2026-07-08 16:48:35.327176-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
52	REDUCCIÓN DE 1" X 1/2" PAVCO	ACC-043	0	0.00	2026-07-08 16:48:35.327628-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
53	REDUCCIÓN DE 1" X 1/2" S/P	ACC-044	0	0.00	2026-07-08 16:48:35.32808-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
54	REDUCCIÓN DE 1" X 3/4" C/R	ACC-045	0	0.00	2026-07-08 16:48:35.328498-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
55	REDUCCIÓN DE 1" X 3/4" PAVCO	ACC-046	0	0.00	2026-07-08 16:48:35.328935-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
56	REDUCCIÓN DE 1" X 3/4" S/P	ACC-047	0	0.00	2026-07-08 16:48:35.329376-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
58	TEE DE 1" S/P PAVCO	ACC-049	0	0.00	2026-07-08 16:48:35.330233-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
59	UNIÓN DE 1" C/R INYECTOPLAST	ACC-050	0	0.00	2026-07-08 16:48:35.331342-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
60	UNIÓN DE 1" MX INYECTOPLAST	ACC-051	0	0.00	2026-07-08 16:48:35.331814-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
61	UNIÓN DE 1" S/P HECHIZO	ACC-052	0	0.00	2026-07-08 16:48:35.332281-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
62	UNIÓN DE 1" S/P INYECTOPLAST	ACC-053	0	0.00	2026-07-08 16:48:35.33271-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
63	UNIÓN DE 1" S/P PAVCO	ACC-054	0	0.00	2026-07-08 16:48:35.333144-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
64	ADAPTADOR DE 1 1/4"	ACC-055	0	0.00	2026-07-08 16:48:35.333547-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
65	CODO DE 1 1/4" S/P INY	ACC-056	0	0.00	2026-07-08 16:48:35.333952-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
66	CODO DE 1 1/4" S/P PAVCO	ACC-057	0	0.00	2026-07-08 16:48:35.334356-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
67	TEE DE 1 1/4"	ACC-058	0	0.00	2026-07-08 16:48:35.334804-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
68	REDUCCIÓN 1 1/4" X 1" C/R	ACC-059	0	0.00	2026-07-08 16:48:35.335202-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
69	REDUCCIÓN 1 1/4" X 1" S/P	ACC-060	0	0.00	2026-07-08 16:48:35.335617-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
70	ADAPTADOR DE 1 1/2 ERA	ACC-061	0	0.00	2026-07-08 16:48:35.336052-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
71	ADAPTADOR DE 1 1/2"	ACC-062	0	0.00	2026-07-08 16:48:35.336458-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
73	CODO DE 1 1/2" S/P INYECTOPLAST	ACC-064	0	0.00	2026-07-08 16:48:35.337394-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
74	CODO DE 1 1/2" S/P PAVCO	ACC-065	0	0.00	2026-07-08 16:48:35.337814-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
75	CODO DE 1 1/2" X 45° HECHIZO	ACC-066	0	0.00	2026-07-08 16:48:35.338302-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
76	CODO DE 1 1/2" X 45° S/P ERA	ACC-067	0	0.00	2026-07-08 16:48:35.338752-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
77	REDUCCIÓN DE 1 1/2" X 1" C/R	ACC-068	0	0.00	2026-07-08 16:48:35.339238-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
78	REDUCCIÓN DE 1 1/2" X 1" S/P	ACC-069	0	0.00	2026-07-08 16:48:35.339652-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
79	REDUCCIÓN DE 1 1/2" X 1/2" C/R	ACC-070	0	0.00	2026-07-08 16:48:35.340085-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
80	REDUCCIÓN DE 1 1/2" X 1/2" S/P	ACC-071	0	0.00	2026-07-08 16:48:35.340487-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
81	REDUCCIÓN DE 1 1/2" X 3/4" C/R	ACC-072	0	0.00	2026-07-08 16:48:35.340883-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
82	REDUCCIÓN DE 1 1/2" X 3/4" S/P	ACC-073	0	0.00	2026-07-08 16:48:35.34128-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
83	TEE DE 1 1/2" S/P ERA	ACC-074	0	0.00	2026-07-08 16:48:35.341718-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
84	TEE DE 1 1/2" S/P INYECTOPLAST	ACC-075	0	0.00	2026-07-08 16:48:35.342211-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
85	TEE DE 1 1/2" S/P PAVCO	ACC-076	0	0.00	2026-07-08 16:48:35.342741-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
86	UNIÓN DE 1 1/2" S/P INYECTOPLAST	ACC-077	0	0.00	2026-07-08 16:48:35.343188-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
87	UNIÓN DE 1 1/2" S/P PAVCO	ACC-078	0	0.00	2026-07-08 16:48:35.343619-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
88	ADAPTADOR DE 2"	ACC-079	0	0.00	2026-07-08 16:48:35.344058-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
89	CODO DE 2" S/P ERA	ACC-080	0	0.00	2026-07-08 16:48:35.344481-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
90	CODO DE 2" S/P INYECTOPLAST	ACC-081	0	0.00	2026-07-08 16:48:35.344872-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
91	CODO DE 2" S/P PAVCO	ACC-082	0	0.00	2026-07-08 16:48:35.345547-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
92	CODO DE 2" X 45° S/P ERA	ACC-083	0	0.00	2026-07-08 16:48:35.346037-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
93	CODO DE 2" X 45° S/P HECHIZO	ACC-084	0	0.00	2026-07-08 16:48:35.346507-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
94	REDUCCIÓN DE  2" X 1 1/2" C/R	ACC-085	0	0.00	2026-07-08 16:48:35.34704-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
95	REDUCCIÓN DE  2" X 1 1/2" S/P	ACC-086	0	0.00	2026-07-08 16:48:35.347505-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
96	REDUCCIÓN DE  2" X 1/2" C/R	ACC-087	0	0.00	2026-07-08 16:48:35.34795-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
97	REDUCCIÓN DE  2" X 1/2" S/P	ACC-088	0	0.00	2026-07-08 16:48:35.348428-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
98	REDUCCIÓN DE  2" X 3/4" C/R	ACC-089	0	0.00	2026-07-08 16:48:35.348834-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
99	REDUCCIÓN DE  2" X 3/4" S/P	ACC-090	0	0.00	2026-07-08 16:48:35.349318-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
100	REDUCCIÓN DE 2" X 1" C/R	ACC-091	0	0.00	2026-07-08 16:48:35.349743-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
101	REDUCCIÓN DE 2" X 1" S/P	ACC-092	0	0.00	2026-07-08 16:48:35.35017-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
102	TEE DE 2" S/P ERA	ACC-093	0	0.00	2026-07-08 16:48:35.350577-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
103	TEE DE 2" S/P INYECTOPLAST	ACC-094	0	0.00	2026-07-08 16:48:35.350988-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
104	TEE DE 2" S/P PAVCO	ACC-095	0	0.00	2026-07-08 16:48:35.351374-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
105	UNIÓN DE 2" S/P INYECTOPLAST	ACC-096	0	0.00	2026-07-08 16:48:35.351764-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
106	UNIÓN DE 2" S/P PAVCO	ACC-097	0	0.00	2026-07-08 16:48:35.352182-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
107	TEE DE 3" S/P ERA	ACC-098	0	0.00	2026-07-08 16:48:35.352566-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
108	CODO DE 3" S/P ERA	ACC-099	0	0.00	2026-07-08 16:48:35.352923-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
109	CODO DE 3" X 45° S/P ERA	ACC-100	0	0.00	2026-07-08 16:48:35.353366-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
110	CINTA AISLANTE 3M	ACC-101	0	0.00	2026-07-08 16:48:35.353759-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
111	CINTA TEFLÓN	ACC-102	0	0.00	2026-07-08 16:48:35.354291-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
112	PEGAMENTO DE 1/32 AZUL	ACC-103	0	0.00	2026-07-08 16:48:35.354902-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
113	PEGAMENTO DE 1/32 DORADO	ACC-104	0	0.00	2026-07-08 16:48:35.355486-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
114	PEGAMENTO DE 1/4 DORADO	ACC-105	0	0.00	2026-07-08 16:48:35.355914-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
115	PEGAMENTO DE 1/4 NEGRO	ACC-106	0	0.00	2026-07-08 16:48:35.356331-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
116	TAPÓN DE 1/2" S/P HEM	ACC-107	0	0.00	2026-07-08 16:48:35.35676-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
117	TAPÓNDE 1/2" C/R HEM	ACC-108	0	0.00	2026-07-08 16:48:35.357192-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
118	TAPÓN DE  3/4" S/P HEM	ACC-109	0	0.00	2026-07-08 16:48:35.357605-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
119	TAPÓN DE  3/4" C/R HEM	ACC-110	0	0.00	2026-07-08 16:48:35.358021-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
120	TAPÓN DE 1" C/R HEM	ACC-111	0	0.00	2026-07-08 16:48:35.358533-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
121	TAPÓN DE 1" S/P HEM	ACC-112	0	0.00	2026-07-08 16:48:35.358918-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
122	TAPÓN DE 1 1/2" C/R HEM	ACC-113	0	0.00	2026-07-08 16:48:35.359382-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
123	TAPÓN DE 1 1/2" S/P HEM	ACC-114	0	0.00	2026-07-08 16:48:35.359784-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
124	TAPÓN DE 2" S/P HEM ERA	ACC-115	0	0.00	2026-07-08 16:48:35.360311-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
125	TAPÓN DE 2" C/R HEM ERA	ACC-116	0	0.00	2026-07-08 16:48:35.360677-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
126	TAPÓN DE 3" S/P HEM ERA	ACC-117	0	0.00	2026-07-08 16:48:35.361082-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
127	UNIÓN UNIVERSAL DE 1/2" C/R	ACC-118	0	0.00	2026-07-08 16:48:35.361458-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
128	UNIÓN UNIVERSAL DE 1/2" S/P	ACC-119	0	0.00	2026-07-08 16:48:35.361833-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
129	UNIÓN UNIVERSAL DE 3/4" C/R	ACC-120	0	0.00	2026-07-08 16:48:35.362256-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
130	UNIÓN UNIVERSAL DE 3/4" S/P	ACC-121	0	0.00	2026-07-08 16:48:35.362671-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
131	UNIÓN UNIVERSAL DE 1" C/R	ACC-122	0	0.00	2026-07-08 16:48:35.363148-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
132	UNIÓN UNIVERSAL DE 1" S/P	ACC-123	0	0.00	2026-07-08 16:48:35.363559-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
133	UNIÓN UNIVERSAL DE 1 1/2" C/R	ACC-124	0	0.00	2026-07-08 16:48:35.36393-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
134	UNIÓN UNIVERSAL DE 1 1/2" S/P	ACC-125	0	0.00	2026-07-08 16:48:35.364336-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
135	UNIÓN UNIVERSAL DE 1 1/4" C/R	ACC-126	0	0.00	2026-07-08 16:48:35.365027-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
136	UNIÓN UNIVERSAL DE 1 1/4" S/P	ACC-127	0	0.00	2026-07-08 16:48:35.365442-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
137	UNIÓN UNIVERSAL DE 2" C/R	ACC-128	0	0.00	2026-07-08 16:48:35.36587-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
138	UNIÓN UNIVERSAL DE 2" S/P	ACC-129	0	0.00	2026-07-08 16:48:35.366281-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
139	VÁLVULA DE PASO DE 1/2" S/P SANKING	ACC-130	0	0.00	2026-07-08 16:48:35.36668-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
140	VÁLVULA DE PASO DE 3/4" S/P SANKING	ACC-131	0	0.00	2026-07-08 16:48:35.367063-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
141	VÁLVULA DE PASO DE 1" S/P SANKING	ACC-132	0	0.00	2026-07-08 16:48:35.367462-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
142	VÁLVULA DE PASO DE 1 1/2" S/P SANKING	ACC-133	0	0.00	2026-07-08 16:48:35.367884-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
143	VÁLVULA DE PASO DE 2" S/P SANKING	ACC-134	0	0.00	2026-07-08 16:48:35.368274-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
144	BOQUILLA 4 VAN AJUSTABLE AMARILLO RAIN BIRD	ACC-135	0	0.00	2026-07-08 16:48:35.36868-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
145	BOQUILLA 6 VAN AJUSTABLE NARANJA RAIN BIRD	ACC-136	0	0.00	2026-07-08 16:48:35.369133-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
146	BOQUILLA 8 VAN AJUSTABLE VERDE RAIN BIRD	ACC-137	0	0.00	2026-07-08 16:48:35.369609-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
147	BOQUILLA 10 VAN AJUSTABLE AZUL RAIN BIRD	ACC-138	0	0.00	2026-07-08 16:48:35.37007-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
148	BOQUILLA 12 VAN AJUSTABLE MARRON RAIN BIRD	ACC-139	0	0.00	2026-07-08 16:48:35.370458-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
149	BOQUILLA 4 A AJUSTABLE HUNTER	ACC-140	0	0.00	2026-07-08 16:48:35.370831-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
150	BOQUILLA 6 A AJUSTABLE HUNTER	ACC-141	0	0.00	2026-07-08 16:48:35.3712-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
151	BOQUILLA 8 A AJUSTABLE HUNTER	ACC-142	0	0.00	2026-07-08 16:48:35.371573-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
152	BOQUILLA 10 A AJUSTABLE HUNTER	ACC-143	0	0.00	2026-07-08 16:48:35.371961-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
72	CODO DE 1 1/2" S/P ERA	ACC-063	-4	0.00	2026-07-08 16:48:35.336946-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
153	BOQUILLA 12 A AJUSTABLE HUNTER	ACC-144	-1	0.00	2026-07-08 16:48:35.372374-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10
\.


--
-- Data for Name: proyecto_empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_empleados (proyecto_id, empleado_id) FROM stdin;
1	4
7	7
\.


--
-- Data for Name: proyecto_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_items (id, proyecto_id, producto_id, nombre_externo, cantidad, justificacion, created_at) FROM stdin;
1	1	\N	\N	1	\N	2026-07-05 23:36:59.82473
4	7	57	\N	1	\N	2026-07-08 18:47:59.805756
6	7	\N	MANOMETRO	1	1234	2026-07-08 18:49:54.850774
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyectos (id, nombre, estado, created_at) FROM stdin;
1	OMAR	en_progreso	2026-07-05 23:36:31.023452
5	harry	en_progreso	2026-07-07 22:34:28.39086
7	BRISEÑO	en_progreso	2026-07-08 18:47:59.789192
\.


--
-- Data for Name: sync_outbox; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sync_outbox (id, table_name, operation, payload, created_at, synced_at, attempts, last_error) FROM stdin;
1	contactos	INSERT	{"id": 2, "tipo": "cliente", "email": "test@sync.com", "notas": "", "nombre": "Test Sync E2E", "telefono": "", "direccion": {}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-09T12:50:27.135803-05:00", "es_empresa": true, "puesto_trabajo": "", "identificaciones": [], "contactos_relacionados": []}	2026-07-09 12:50:27.135803-05	2026-07-09 12:50:37.007663-05	0	\N
2	contactos	UPDATE	{"id": 2, "tipo": "cliente", "email": "test@sync.com", "notas": "", "nombre": "Test Sync E2E Updated", "telefono": "", "direccion": {}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-09T12:50:27.135803-05:00", "es_empresa": true, "puesto_trabajo": "", "identificaciones": [], "contactos_relacionados": []}	2026-07-09 12:51:02.035757-05	2026-07-09 12:51:10.884841-05	0	\N
3	contactos	DELETE	{"id": 2, "tipo": "cliente", "email": "test@sync.com", "notas": "", "nombre": "Test Sync E2E Updated", "telefono": "", "direccion": {}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-09T12:50:27.135803-05:00", "es_empresa": true, "puesto_trabajo": "", "identificaciones": [], "contactos_relacionados": []}	2026-07-09 12:51:27.136863-05	2026-07-09 12:51:36.025892-05	0	\N
4	contactos	INSERT	{"id": 3, "tipo": "cliente", "email": "", "notas": "", "nombre": "Test Offline", "telefono": "", "direccion": {}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-09T12:51:53.524764-05:00", "es_empresa": true, "puesto_trabajo": "", "identificaciones": [], "contactos_relacionados": []}	2026-07-09 12:51:53.524764-05	2026-07-09 12:52:08.649091-05	0	\N
5	contactos	DELETE	{"id": 3, "tipo": "cliente", "email": "", "notas": "", "nombre": "Test Offline", "telefono": "", "direccion": {}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-09T12:51:53.524764-05:00", "es_empresa": true, "puesto_trabajo": "", "identificaciones": [], "contactos_relacionados": []}	2026-07-09 12:52:12.888238-05	2026-07-09 12:52:23.739838-05	0	\N
6	usuarios	INSERT	{"id": 6, "username": "preview_test", "created_at": "2026-07-09T13:03:29.460414-05:00", "password_hash": "$2b$10$V7UJ5A9hXaP5Cx5CWYXP8urg4f2nBFsLn6gcvI1ihw5BXKuQfYO5C", "nombre_completo": "Preview Test"}	2026-07-09 13:03:29.460414-05	2026-07-09 13:05:00.871722-05	0	\N
7	usuarios	DELETE	{"id": 6, "username": "preview_test", "created_at": "2026-07-09T13:03:29.460414-05:00", "password_hash": "$2b$10$V7UJ5A9hXaP5Cx5CWYXP8urg4f2nBFsLn6gcvI1ihw5BXKuQfYO5C", "nombre_completo": "Preview Test"}	2026-07-09 13:04:47.179024-05	2026-07-09 13:05:01.021175-05	0	\N
8	usuarios	INSERT	{"id": 7, "username": "preview_test", "created_at": "2026-07-09T13:48:42.26496-05:00", "password_hash": "$2b$10$vFS5Wz2mAJ4X8KRgrz4LAecFAfhvmSpICYZVbFc/.i.0l323kUnwa", "nombre_completo": "Preview Test"}	2026-07-09 13:48:42.26496-05	2026-07-09 13:57:45.60364-05	0	\N
9	piscina_pagos	INSERT	{"id": 1, "monto": 0.00, "notas": "", "pagado": false, "created_at": "2026-07-09T13:56:18.953035-05:00", "fecha_pago": null, "piscina_id": 1, "periodo_fin": "2026-07-31", "periodo_inicio": "2026-07-01"}	2026-07-09 13:56:18.953035-05	2026-07-09 14:01:23.791332-05	1	relation "piscina_pagos" does not exist
10	piscina_pagos	INSERT	{"id": 2, "monto": 0.00, "notas": "", "pagado": false, "created_at": "2026-07-09T13:56:28.813652-05:00", "fecha_pago": null, "piscina_id": 1, "periodo_fin": "2026-07-31", "periodo_inicio": "2026-07-01"}	2026-07-09 13:56:28.813652-05	2026-07-09 14:01:23.937812-05	0	\N
11	usuarios	DELETE	{"id": 7, "username": "preview_test", "created_at": "2026-07-09T13:48:42.26496-05:00", "password_hash": "$2b$10$vFS5Wz2mAJ4X8KRgrz4LAecFAfhvmSpICYZVbFc/.i.0l323kUnwa", "nombre_completo": "Preview Test"}	2026-07-09 13:57:28.948624-05	2026-07-09 14:01:24.084702-05	0	\N
12	piscina_materiales	INSERT	{"id": 1, "fecha": "2026-07-09", "monto": 25.00, "notas": "", "cantidad": 1.00, "created_at": "2026-07-09T14:01:22.707171-05:00", "piscina_id": 1, "nombre_material": "Test Sync Material"}	2026-07-09 14:01:22.707171-05	2026-07-09 14:01:24.232102-05	0	\N
13	piscina_materiales	DELETE	{"id": 1, "fecha": "2026-07-09", "monto": 25.00, "notas": "", "cantidad": 1.00, "created_at": "2026-07-09T14:01:22.707171-05:00", "piscina_id": 1, "nombre_material": "Test Sync Material"}	2026-07-09 14:01:44.032973-05	2026-07-09 14:01:45.179176-05	0	\N
14	usuarios	INSERT	{"id": 8, "username": "preview_test", "created_at": "2026-07-09T23:55:53.388862-05:00", "password_hash": "$2b$10$6OGuHoGqMQG1b/Q2dbtDiOc478QJpo1T/k/F7YrGVbuDi0VOHn7N6", "nombre_completo": "Preview Test"}	2026-07-09 23:55:53.388862-05	\N	5	invalid input syntax for type uuid: "8"
18	usuarios	INSERT	{"id": 10, "username": "preview_test", "created_at": "2026-07-10T00:35:41.319191-05:00", "password_hash": "$2b$10$GL5n6eA5Ieh1nSiseeZ6ieJ9wBg6Uow.DOWeDo/ntJQp.mH6eIT2e", "nombre_completo": "Preview Test"}	2026-07-10 00:35:41.319191-05	\N	0	\N
19	usuarios	DELETE	{"id": 10, "username": "preview_test", "created_at": "2026-07-10T00:35:41.319191-05:00", "password_hash": "$2b$10$GL5n6eA5Ieh1nSiseeZ6ieJ9wBg6Uow.DOWeDo/ntJQp.mH6eIT2e", "nombre_completo": "Preview Test"}	2026-07-10 00:36:48.298582-05	\N	0	\N
15	usuarios	DELETE	{"id": 8, "username": "preview_test", "created_at": "2026-07-09T23:55:53.388862-05:00", "password_hash": "$2b$10$6OGuHoGqMQG1b/Q2dbtDiOc478QJpo1T/k/F7YrGVbuDi0VOHn7N6", "nombre_completo": "Preview Test"}	2026-07-09 23:59:41.643611-05	\N	5	invalid input syntax for type uuid: "8"
16	usuarios	INSERT	{"id": 9, "username": "preview_test", "created_at": "2026-07-10T00:05:36.178061-05:00", "password_hash": "$2b$10$7gqjqaESkoIJVCM9riaSDOtK80qW2ybdLJ/tAk2tSQO.FGo05787C", "nombre_completo": "Preview Test"}	2026-07-10 00:05:36.178061-05	\N	5	invalid input syntax for type uuid: "9"
17	usuarios	DELETE	{"id": 9, "username": "preview_test", "created_at": "2026-07-10T00:05:36.178061-05:00", "password_hash": "$2b$10$7gqjqaESkoIJVCM9riaSDOtK80qW2ybdLJ/tAk2tSQO.FGo05787C", "nombre_completo": "Preview Test"}	2026-07-10 00:06:41.871027-05	\N	5	invalid input syntax for type uuid: "9"
\.


--
-- Data for Name: sync_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sync_state (id, is_online, last_check_at, last_success_at) FROM stdin;
t	t	2026-07-10 00:12:20.766049-05	2026-07-09 14:01:45.180046-05
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, username, password_hash, nombre_completo, created_at) FROM stdin;
1	harry	$2b$10$2oO0ysur9CFTXVPZJ81Smenyt6MkD6tmmcZ7Lln.cPf/y0GwPrrmC	Harry	2026-07-05 15:25:03.511624-05
\.


--
-- Data for Name: venta_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.venta_lineas (id, venta_id, producto_id, cantidad, precio_unitario, subtotal, created_at) FROM stdin;
\.


--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ventas (id, contacto_id, total, estado, fecha, notas, created_at) FROM stdin;
\.


--
-- Name: asiento_lineas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asiento_lineas_id_seq', 2, true);


--
-- Name: asientos_contables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asientos_contables_id_seq', 1, true);


--
-- Name: calendario_eventos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calendario_eventos_id_seq', 1, true);


--
-- Name: contactos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contactos_id_seq', 3, true);


--
-- Name: empleados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empleados_id_seq', 12, true);


--
-- Name: gastos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gastos_id_seq', 2, true);


--
-- Name: piscina_consumos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piscina_consumos_id_seq', 1, true);


--
-- Name: piscina_materiales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piscina_materiales_id_seq', 1, true);


--
-- Name: piscina_pagos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piscina_pagos_id_seq', 2, true);


--
-- Name: piscinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piscinas_id_seq', 1, true);


--
-- Name: plan_cuentas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_cuentas_id_seq', 16, true);


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.productos_id_seq', 153, true);


--
-- Name: proyecto_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proyecto_items_id_seq', 6, true);


--
-- Name: proyectos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proyectos_id_seq', 7, true);


--
-- Name: sync_outbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sync_outbox_id_seq', 19, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 10, true);


--
-- Name: venta_lineas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.venta_lineas_id_seq', 1, false);


--
-- Name: ventas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ventas_id_seq', 1, false);


--
-- Name: asiento_lineas asiento_lineas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asiento_lineas
    ADD CONSTRAINT asiento_lineas_pkey PRIMARY KEY (id);


--
-- Name: asientos_contables asientos_contables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asientos_contables
    ADD CONSTRAINT asientos_contables_pkey PRIMARY KEY (id);


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
-- Name: gastos gastos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_pkey PRIMARY KEY (id);


--
-- Name: piscina_consumos piscina_consumos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_consumos
    ADD CONSTRAINT piscina_consumos_pkey PRIMARY KEY (id);


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
-- Name: plan_cuentas plan_cuentas_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_cuentas
    ADD CONSTRAINT plan_cuentas_codigo_key UNIQUE (codigo);


--
-- Name: plan_cuentas plan_cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_cuentas
    ADD CONSTRAINT plan_cuentas_pkey PRIMARY KEY (id);


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
-- Name: sync_outbox sync_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_outbox
    ADD CONSTRAINT sync_outbox_pkey PRIMARY KEY (id);


--
-- Name: sync_state sync_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_state
    ADD CONSTRAINT sync_state_pkey PRIMARY KEY (id);


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
-- Name: venta_lineas venta_lineas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta_lineas
    ADD CONSTRAINT venta_lineas_pkey PRIMARY KEY (id);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- Name: idx_asiento_lineas_asiento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asiento_lineas_asiento ON public.asiento_lineas USING btree (asiento_id);


--
-- Name: idx_asiento_lineas_cuenta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asiento_lineas_cuenta ON public.asiento_lineas USING btree (cuenta_id);


--
-- Name: idx_piscinas_contacto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_piscinas_contacto ON public.piscinas USING btree (contacto_id);


--
-- Name: idx_sync_outbox_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sync_outbox_pending ON public.sync_outbox USING btree (id) WHERE (synced_at IS NULL);


--
-- Name: asiento_lineas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.asiento_lineas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: asientos_contables trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.asientos_contables FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: calendario_eventos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.calendario_eventos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: contactos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.contactos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: empleados trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.empleados FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: gastos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.gastos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: piscina_consumos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.piscina_consumos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: piscina_materiales trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.piscina_materiales FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: piscina_pagos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.piscina_pagos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: piscinas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.piscinas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: plan_cuentas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.plan_cuentas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: productos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: proyecto_empleados trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.proyecto_empleados FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: proyecto_items trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.proyecto_items FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: proyectos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: usuarios trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: venta_lineas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.venta_lineas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: ventas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.ventas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: asiento_lineas asiento_lineas_asiento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asiento_lineas
    ADD CONSTRAINT asiento_lineas_asiento_id_fkey FOREIGN KEY (asiento_id) REFERENCES public.asientos_contables(id) ON DELETE CASCADE;


--
-- Name: asiento_lineas asiento_lineas_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asiento_lineas
    ADD CONSTRAINT asiento_lineas_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.plan_cuentas(id);


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
-- Name: piscina_consumos piscina_consumos_piscina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_consumos
    ADD CONSTRAINT piscina_consumos_piscina_id_fkey FOREIGN KEY (piscina_id) REFERENCES public.piscinas(id) ON DELETE CASCADE;


--
-- Name: piscina_consumos piscina_consumos_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piscina_consumos
    ADD CONSTRAINT piscina_consumos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


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
-- Name: venta_lineas venta_lineas_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta_lineas
    ADD CONSTRAINT venta_lineas_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BqVDrxU5IRfJKidrSGday3WXi4rO6RsarpkjeNhDpgvqlk0kiMY7yEC1CeuQA7a

