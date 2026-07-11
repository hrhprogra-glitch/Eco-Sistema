--
-- PostgreSQL database dump
--

\restrict dPIO9fD1RzGaSVlbct2vXTJgY91eEDKcQHmqKOjPrJrb4sbUo0ZW2SFjgLmCBJV

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: sync_outbox_capture(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_outbox_capture() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF current_setting('app.sync_apply', true) = 'on' THEN
    RETURN NULL;
  END IF;

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
    debe numeric(14,2) DEFAULT 0 NOT NULL,
    haber numeric(14,2) DEFAULT 0 NOT NULL,
    descripcion character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    asiento_id uuid NOT NULL,
    cuenta_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: asientos_contables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asientos_contables (
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    descripcion character varying(255) NOT NULL,
    estado character varying(20) DEFAULT 'borrador'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    numero bigint NOT NULL,
    CONSTRAINT asientos_contables_estado_check CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'confirmado'::character varying])::text[])))
);


--
-- Name: asientos_contables_numero_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asientos_contables_numero_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asientos_contables_numero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asientos_contables_numero_seq OWNED BY public.asientos_contables.numero;


--
-- Name: calendario_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendario_eventos (
    titulo text NOT NULL,
    fecha date NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT now(),
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    piscina_id uuid,
    proyecto_id uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tipo character varying(50) DEFAULT 'nota'::character varying,
    trabajadores text,
    CONSTRAINT calendario_eventos_estado_check CHECK (((estado)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('completado'::character varying)::text, ('cancelado'::character varying)::text])))
);


--
-- Name: contactos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contactos (
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
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contactos_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('cliente'::character varying)::text, ('proveedor'::character varying)::text, ('otro'::character varying)::text])))
);


--
-- Name: empleados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empleados (
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
    monto_pago numeric(12,2) DEFAULT 0 NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gastos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gastos (
    concepto character varying(150) NOT NULL,
    categoria character varying(100) NOT NULL,
    monto numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    notas text,
    comprobante_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gastos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'pagado'::character varying])::text[])))
);


--
-- Name: piscina_consumos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscina_consumos (
    nombre_externo text,
    cantidad integer NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    piscina_id uuid NOT NULL,
    producto_id uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: piscina_materiales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscina_materiales (
    nombre_material character varying(150) NOT NULL,
    cantidad numeric(10,2) DEFAULT 1 NOT NULL,
    monto numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    piscina_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: piscina_pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscina_pagos (
    monto numeric(12,2) DEFAULT 0 NOT NULL,
    periodo_inicio date NOT NULL,
    periodo_fin date NOT NULL,
    pagado boolean DEFAULT false NOT NULL,
    fecha_pago date,
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    piscina_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: piscinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piscinas (
    nombre character varying(150) DEFAULT ''::character varying NOT NULL,
    ubicacion text DEFAULT ''::text NOT NULL,
    volumen_m3 numeric(10,2) DEFAULT 0 NOT NULL,
    estado character varying(20) DEFAULT 'operativa'::character varying NOT NULL,
    nivel_cloro numeric(5,2),
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    frecuencia character varying(20) DEFAULT 'semanal'::character varying NOT NULL,
    precio_mantenimiento numeric(10,2) DEFAULT 0 NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contacto_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT piscinas_estado_check CHECK (((estado)::text = ANY (ARRAY[('operativa'::character varying)::text, ('mantenimiento'::character varying)::text, ('cerrada'::character varying)::text]))),
    CONSTRAINT piscinas_frecuencia_check CHECK (((frecuencia)::text = ANY ((ARRAY['semanal'::character varying, 'quincenal'::character varying])::text[])))
);


--
-- Name: plan_cuentas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_cuentas (
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    tipo character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT plan_cuentas_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['activo'::character varying, 'pasivo'::character varying, 'patrimonio'::character varying, 'ingreso'::character varying, 'gasto'::character varying])::text[])))
);


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
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
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT productos_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('bienes'::character varying)::text, ('servicio'::character varying)::text, ('combo'::character varying)::text])))
);


--
-- Name: proyecto_empleados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyecto_empleados (
    proyecto_id uuid NOT NULL,
    empleado_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: proyecto_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyecto_items (
    nombre_externo text,
    cantidad integer NOT NULL,
    justificacion text,
    created_at timestamp without time zone DEFAULT now(),
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proyecto_id uuid,
    producto_id uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyectos (
    nombre text NOT NULL,
    estado text DEFAULT 'en_progreso'::text,
    created_at timestamp without time zone DEFAULT now(),
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


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
    last_pull_at timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    CONSTRAINT sync_state_id_check CHECK (id)
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    nombre_completo character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: venta_lineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venta_lineas (
    cantidad integer DEFAULT 1 NOT NULL,
    precio_unitario numeric(12,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venta_id uuid NOT NULL,
    producto_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas (
    total numeric(12,2) DEFAULT 0 NOT NULL,
    estado character varying(50) DEFAULT 'borrador'::character varying NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contacto_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    numero bigint NOT NULL,
    CONSTRAINT ventas_estado_check CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'confirmada'::character varying, 'facturada'::character varying, 'cancelada'::character varying])::text[])))
);


--
-- Name: ventas_numero_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventas_numero_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_numero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventas_numero_seq OWNED BY public.ventas.numero;


--
-- Name: asientos_contables numero; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asientos_contables ALTER COLUMN numero SET DEFAULT nextval('public.asientos_contables_numero_seq'::regclass);


--
-- Name: sync_outbox id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_outbox ALTER COLUMN id SET DEFAULT nextval('public.sync_outbox_id_seq'::regclass);


--
-- Name: ventas numero; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas ALTER COLUMN numero SET DEFAULT nextval('public.ventas_numero_seq'::regclass);


--
-- Data for Name: asiento_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asiento_lineas (debe, haber, descripcion, created_at, id, asiento_id, cuenta_id, updated_at) FROM stdin;
\.


--
-- Data for Name: asientos_contables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asientos_contables (fecha, descripcion, estado, created_at, id, updated_at, numero) FROM stdin;
\.


--
-- Data for Name: calendario_eventos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendario_eventos (titulo, fecha, descripcion, created_at, estado, id, piscina_id, proyecto_id, updated_at, tipo, trabajadores) FROM stdin;
matenimiendo	2026-07-09	\N	2026-07-08 19:22:58.459	pendiente	c6f9a7a6-fb9a-54a7-a117-57b2f424ee15	1363072c-725a-5da3-b05d-c4f115a416ec	\N	2026-07-09 18:51:09.702989-05	nota	\N
\.


--
-- Data for Name: contactos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contactos (nombre, tipo, es_empresa, email, telefono, sitio_web, puesto_trabajo, direccion, identificaciones, etiquetas, contactos_relacionados, notas, created_at, id, updated_at) FROM stdin;
Harry	cliente	t	harry@gmail	946000608			{"zip": "", "pais": "", "calle": "", "calle2": "", "ciudad": "", "estado": "", "distrito": ""}	{}	{}	{}		2026-07-05 20:56:22.216-05	d142ef26-317d-56bd-aa3b-6b5d29bb6fdb	2026-07-09 18:47:51.006797-05
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empleados (nombre, puesto, area, created_at, foto_url, email_trabajo, telefono_trabajo, jefe_directo, dni, dni_foto_url, monto_pago, id, updated_at) FROM stdin;
Harry			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	c5cd0632-9e14-5593-89d6-ac08c593f99c	2026-07-09 18:47:50.457371-05
Billy			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	4e6a0bcb-3f7e-5c8d-a2c4-e7b5acc5c6f9	2026-07-09 18:47:50.459657-05
Jhon			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	66b52108-2089-531c-bf99-80c34a530b9f	2026-07-09 18:47:50.460614-05
Marco			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	374d65b5-5f34-5cb6-b863-eb15cdc62bc4	2026-07-09 18:47:50.461606-05
Raul			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	21f63bd5-c546-5b6b-a0e3-ff0f503aa6cd	2026-07-09 18:47:50.462371-05
Antony			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	472f6b7d-fe4f-5e67-80b4-cb44cd378833	2026-07-09 18:47:50.46339-05
Amador			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	a5c7a01b-43d6-5d2d-a880-a817a94137a9	2026-07-09 18:47:50.464018-05
Jose			2026-07-05 22:54:56.766-05	\N	\N	\N	Ulices	\N	\N	0.00	8b93c12e-2240-5566-bec3-4f3231fc50d5	2026-07-09 18:47:50.464576-05
Ulices	Jefe		2026-07-05 22:54:56.766-05	\N	\N	\N	\N	\N	\N	0.00	c5a1a2b1-f683-582f-b851-01e3ad78643c	2026-07-09 18:47:50.46514-05
\.


--
-- Data for Name: gastos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gastos (concepto, categoria, monto, fecha, estado, notas, comprobante_url, created_at, id, updated_at) FROM stdin;
\.


--
-- Data for Name: piscina_consumos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscina_consumos (nombre_externo, cantidad, notas, created_at, id, piscina_id, producto_id, updated_at) FROM stdin;
\N	1	\N	2026-07-08 19:23:58.377-05	65c89c42-cd87-5b73-bbed-be0aacda6770	1363072c-725a-5da3-b05d-c4f115a416ec	f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2	2026-07-09 18:48:12.001526-05
\.


--
-- Data for Name: piscina_materiales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscina_materiales (nombre_material, cantidad, monto, fecha, notas, created_at, id, piscina_id, updated_at) FROM stdin;
\.


--
-- Data for Name: piscina_pagos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscina_pagos (monto, periodo_inicio, periodo_fin, pagado, fecha_pago, notas, created_at, id, piscina_id, updated_at) FROM stdin;
0.00	2026-07-01	2026-07-31	f	\N		2026-07-09 13:56:18.953-05	a60357e6-0f5b-5334-85a3-b28aa838d3e3	1363072c-725a-5da3-b05d-c4f115a416ec	2026-07-09 18:48:12.302848-05
0.00	2026-07-01	2026-07-31	f	\N		2026-07-09 13:56:28.813-05	b2e0a4c8-03a2-51d6-ba6b-71a9f986ccb2	1363072c-725a-5da3-b05d-c4f115a416ec	2026-07-09 18:48:12.30488-05
\.


--
-- Data for Name: piscinas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscinas (nombre, ubicacion, volumen_m3, estado, nivel_cloro, notas, created_at, frecuencia, precio_mantenimiento, id, contacto_id, updated_at) FROM stdin;
		0.00	operativa	\N		2026-07-08 14:51:31.719-05	semanal	0.00	1363072c-725a-5da3-b05d-c4f115a416ec	d142ef26-317d-56bd-aa3b-6b5d29bb6fdb	2026-07-09 18:47:51.626738-05
\.


--
-- Data for Name: plan_cuentas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_cuentas (codigo, nombre, tipo, created_at, id, updated_at) FROM stdin;
1000	Caja	activo	2026-07-08 15:58:25.294-05	e6c8eb16-17f9-52fc-abbb-7f36971f570a	2026-07-09 18:47:51.308209-05
1010	Bancos	activo	2026-07-08 15:58:25.294-05	c65a99cf-e12d-5d74-84e9-74086cc54e1d	2026-07-09 18:47:51.311084-05
1020	Cuentas por Cobrar	activo	2026-07-08 15:58:25.294-05	08bec2bd-a8a0-5abb-b35f-0d9839557e19	2026-07-09 18:47:51.312795-05
1030	Inventario de Mercaderías	activo	2026-07-08 15:58:25.294-05	42dac88b-a716-5576-a1ec-dff1ac565931	2026-07-09 18:47:51.314028-05
1040	Activos Fijos	activo	2026-07-08 15:58:25.294-05	1242c481-688e-502f-9cb9-7f12e526ac46	2026-07-09 18:47:51.31504-05
2000	Cuentas por Pagar	pasivo	2026-07-08 15:58:25.294-05	e72ed80c-f9e0-59d1-a1da-06afc35a8191	2026-07-09 18:47:51.316014-05
2010	Impuestos por Pagar	pasivo	2026-07-08 15:58:25.294-05	536b4b51-1cd0-5be5-b8aa-f77f38afec52	2026-07-09 18:47:51.316963-05
2020	Préstamos por Pagar	pasivo	2026-07-08 15:58:25.294-05	d24a0457-b5bf-5546-ba3e-ef46cfa11bf6	2026-07-09 18:47:51.317664-05
3000	Capital Social	patrimonio	2026-07-08 15:58:25.294-05	9b67c169-d4c6-57b4-8f38-9de006b068e5	2026-07-09 18:47:51.318316-05
3010	Resultados Acumulados	patrimonio	2026-07-08 15:58:25.294-05	77a75c46-82bd-546f-946b-b8b3d4ac30f2	2026-07-09 18:47:51.318969-05
4000	Ventas	ingreso	2026-07-08 15:58:25.294-05	4a5b180b-2dc0-5388-bad7-49934450937f	2026-07-09 18:47:51.319613-05
4010	Otros Ingresos	ingreso	2026-07-08 15:58:25.294-05	2039d4bd-441e-5230-a62c-7e3c9a71eb78	2026-07-09 18:47:51.320248-05
5000	Costo de Ventas	gasto	2026-07-08 15:58:25.294-05	d55babbb-dff9-59dc-a207-9c4ed9304a9e	2026-07-09 18:47:51.32088-05
5010	Gastos Operativos	gasto	2026-07-08 15:58:25.294-05	3b4cd1a3-0d15-56d6-8402-edeeeba9c118	2026-07-09 18:47:51.321507-05
5020	Gastos de Personal	gasto	2026-07-08 15:58:25.294-05	2b3a09bd-6559-5cec-81b5-7977730b5973	2026-07-09 18:47:51.32214-05
5030	Gastos Financieros	gasto	2026-07-08 15:58:25.294-05	7d991356-f736-58d6-ac14-2f4d3932cf74	2026-07-09 18:47:51.322914-05
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (nombre, sku, stock, precio, created_at, favorito, foto_url, vende, compra, es_gasto, tipo, rastrear_inventario, unidad, impuesto_venta, codigo_detraccion, costo, categoria, referencia, codigo_barras, notas_internas, limite_stock, id, updated_at) FROM stdin;
Aspersor de Impacto	RIE-002	30	45.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Accesorios	\N	\N	\N	5	09b5c708-a433-5b15-bd9f-e84285ce7d2d	2026-07-09 18:36:06.088835-05
Generador Gasolina 3KW	EQ-100	5	1200.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Equipos	\N	\N	\N	2	a2db731f-e5f5-5bcc-a441-65043c124749	2026-07-09 18:36:06.088835-05
Bomba de Agua 1HP	BOM-01	8	350.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Electrobombas	\N	\N	\N	3	b5adc7ff-f1a0-5519-b5d7-bacd2e0bc08a	2026-07-09 18:36:06.088835-05
Cloro en Pastillas (1kg)	PIS-05	20	35.00	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Piscinas	\N	\N	\N	10	c2b77661-b714-506e-9b81-7b40a5bed5e2	2026-07-09 18:36:06.088835-05
Tubo PVC 1/2	PVC-001	49	12.50	2026-07-05 22:55:34.41768-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	Accesorios	\N	\N	\N	10	421cfb8d-3e92-55fb-9375-b01a0d3763d0	2026-07-09 18:36:06.088835-05
TEE DE 1" S/P INYECTOPLAST	ACC-048	-1	0.00	2026-07-08 16:48:35.329-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	f2184d14-d793-5542-8093-935bb6e4b137	2026-07-09 18:48:10.636279-05
ADAPTADOR DE 1/2" PVC	ACC-001	0	0.00	2026-07-08 16:48:35.302-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	40d309f7-efe2-5e18-a8b5-a39cf3c19048	2026-07-09 18:48:10.63904-05
CODO DE 1/2" MX INYECTOPLAST	ACC-002	0	0.00	2026-07-08 16:48:35.307-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	cc5cad1a-732b-528e-a616-b8feee0b7219	2026-07-09 18:48:10.64027-05
CODO DE 1/2" S/P INYECTOPLAST	ACC-003	0	0.00	2026-07-08 16:48:35.308-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	381542e7-b890-55a3-967f-2c5d087871ab	2026-07-09 18:48:10.641922-05
CODO DE 1/2" S/P PAVCO	ACC-004	0	0.00	2026-07-08 16:48:35.309-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	91e92481-eb3d-5bd4-be1b-2f2b23d2dd39	2026-07-09 18:48:10.643229-05
CODO DE 1/2" X 45° S/P HECHIZO	ACC-005	0	0.00	2026-07-08 16:48:35.309-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	75b2b6d6-3c42-5968-936f-cba813162083	2026-07-09 18:48:10.64451-05
TEE DE 1/2" S/P INYECTOPLAST	ACC-006	0	0.00	2026-07-08 16:48:35.31-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	bde314c9-492d-5e47-95b8-aba976a9043a	2026-07-09 18:48:10.645775-05
TEE DE 1/2" S/P PAVCO	ACC-007	0	0.00	2026-07-08 16:48:35.31-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7dbe0235-e65e-571a-954f-428f42a3b9fb	2026-07-09 18:48:10.647053-05
UNIÓN DE 1/2" C/R INYECTOPLAST	ACC-008	0	0.00	2026-07-08 16:48:35.311-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3c7d9d56-d50f-57d2-bc4c-ff95f778eb54	2026-07-09 18:48:10.648272-05
UNIÓN DE 1/2" MX INYECTOPLAST	ACC-009	0	0.00	2026-07-08 16:48:35.312-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	87813572-acfa-53a9-9abd-573591a23da4	2026-07-09 18:48:10.649454-05
UNIÓN DE 1/2" S/P HECHIZO	ACC-010	0	0.00	2026-07-08 16:48:35.312-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	760efc73-558f-57fe-8985-8f740656b39f	2026-07-09 18:48:10.650577-05
UNIÓN DE 1/2" S/P INYECTOPLAST	ACC-011	0	0.00	2026-07-08 16:48:35.313-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	22473a7b-e905-5ca7-bd83-502123019aaa	2026-07-09 18:48:10.651655-05
UNIÓN DE 1/2" S/P PAVCO	ACC-012	0	0.00	2026-07-08 16:48:35.313-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	9872caba-4641-5f5e-bf09-e6bd2e9ae09d	2026-07-09 18:48:10.652803-05
ADAPTADOR DE 3/4" PVC	ACC-013	0	0.00	2026-07-08 16:48:35.314-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	572f9fb9-3be3-55d9-b896-a61198905d65	2026-07-09 18:48:10.653657-05
BUSHING DE 3/4" X 1/2" INYECTOPLAST	ACC-014	0	0.00	2026-07-08 16:48:35.314-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	cc13ee29-cbe5-52f5-b097-62adb968c2f9	2026-07-09 18:48:10.654982-05
BUSHING DE 3/4" X 1/2" PAVCO	ACC-015	0	0.00	2026-07-08 16:48:35.315-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	32c8ad44-cb67-5727-9404-b0ade3ad3eb8	2026-07-09 18:48:10.655755-05
CODO DE 3/4" MX INYECTOPLAST	ACC-016	0	0.00	2026-07-08 16:48:35.315-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3c1e2987-bdc7-5672-9c60-c346cd2ecc30	2026-07-09 18:48:10.656523-05
CODO DE 3/4" S/P INYECTOPLAST	ACC-017	0	0.00	2026-07-08 16:48:35.316-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	37874425-e7d0-5e8a-bc86-af12a2df4fe6	2026-07-09 18:48:10.657344-05
CODO DE 3/4" S/P PAVCO	ACC-018	0	0.00	2026-07-08 16:48:35.316-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e9651d08-8f4c-537e-bc7e-8febe75bcf16	2026-07-09 18:48:10.658574-05
CODO DE 3/4" X 45° HECHIZO	ACC-019	0	0.00	2026-07-08 16:48:35.317-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a9dae332-0c8b-54f5-a5f4-984fefd909bb	2026-07-09 18:48:10.659455-05
CURVA DE 3/4" LUZ	ACC-020	0	0.00	2026-07-08 16:48:35.317-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0376cf0e-311b-5688-8a0d-ccd69f12e153	2026-07-09 18:48:10.660228-05
REDUCCIÓN DE 3/4" X 1/2" C/R (HECHIZO)	ACC-021	0	0.00	2026-07-08 16:48:35.317-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	99ce1d3e-5e14-54eb-ab08-0aad42b778b7	2026-07-09 18:48:10.660999-05
REDUCCIÓN DE 3/4" X 1/2" S/P (HECHIZO)	ACC-022	0	0.00	2026-07-08 16:48:35.318-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	390f9f80-ed55-5020-85de-7128b039fdc7	2026-07-09 18:48:10.661776-05
REDUCCIÓN DE 3/4" X 1/2" S/P PAVCO	ACC-023	0	0.00	2026-07-08 16:48:35.318-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e07b5382-7cfd-5657-a01c-4051ba7f0a5b	2026-07-09 18:48:10.662539-05
TEE DE 3/4" S/P INYECTOPLAST	ACC-024	0	0.00	2026-07-08 16:48:35.319-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	d9e94aef-df3d-5db4-88e4-f560d0981a58	2026-07-09 18:48:10.663287-05
TEE DE 3/4" S/P PAVCO	ACC-025	0	0.00	2026-07-08 16:48:35.319-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	6baf29a4-90cc-5a29-9d6b-d1630f2b78dd	2026-07-09 18:48:10.664296-05
UNIÓN DE 3/4" C/R INYECTOPLAST	ACC-026	0	0.00	2026-07-08 16:48:35.32-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	49996c70-9223-546d-952c-d256b4418ffc	2026-07-09 18:48:10.6652-05
UNIÓN DE 3/4" MIXTO INYECTOPLAST	ACC-027	0	0.00	2026-07-08 16:48:35.32-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	99b4ea0e-5cab-5334-bbb6-88224ce45beb	2026-07-09 18:48:10.666024-05
UNIÓN DE 3/4" S/P HECHIZO	ACC-028	0	0.00	2026-07-08 16:48:35.32-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3a3eec23-75ae-53c7-9106-227d535d5f39	2026-07-09 18:48:10.667021-05
UNIÓN DE 3/4" S/P INYECTOPLAST	ACC-029	0	0.00	2026-07-08 16:48:35.321-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b46ec589-2b62-5ab4-93cd-1377bcab828d	2026-07-09 18:48:10.668472-05
UNIÓN DE 3/4" S/P PAVCO	ACC-030	0	0.00	2026-07-08 16:48:35.321-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7e52bb7f-91da-56ef-8f67-8826b85571a1	2026-07-09 18:48:10.66959-05
ADAPTADOR DE 1" PAVCO	ACC-031	0	0.00	2026-07-08 16:48:35.322-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	77642961-99c3-5ab9-9c8a-7cf71901a31c	2026-07-09 18:48:10.670846-05
ADAPTADOR DE 1" PVC	ACC-032	0	0.00	2026-07-08 16:48:35.322-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4d0b8c17-4cf1-584b-bb6f-946308d9bd67	2026-07-09 18:48:10.671855-05
BUSHING DE 1" X 1/2" INYECTOPLAST	ACC-033	0	0.00	2026-07-08 16:48:35.322-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c0ba6de3-ab23-5fbc-84fa-df046e7de64b	2026-07-09 18:48:10.673129-05
BUSHING DE 1" X 1/2" PAVCO	ACC-034	0	0.00	2026-07-08 16:48:35.323-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8b125c01-d3d2-5267-85dd-87c40b4d6dce	2026-07-09 18:48:10.674056-05
BUSHING DE 1" X 3/4" INYECTOPLAST	ACC-035	0	0.00	2026-07-08 16:48:35.323-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7453c0a6-eba9-5205-ac4a-8e62f4f916fe	2026-07-09 18:48:10.67522-05
BUSHING DE 1" X 3/4" PAVCO	ACC-036	0	0.00	2026-07-08 16:48:35.324-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2d897a75-6aca-523c-9a5b-480ca0c16fed	2026-07-09 18:48:10.676979-05
CODO DE 1" S/P INYECTOPLAST	ACC-037	0	0.00	2026-07-08 16:48:35.324-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	43986777-f738-577f-af1c-e80c7390902b	2026-07-09 18:48:10.677963-05
CODO DE 1" S/P PAVCO	ACC-038	0	0.00	2026-07-08 16:48:35.325-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a5a9cd9b-3cc3-5f56-8a73-7fb21219698a	2026-07-09 18:48:10.67886-05
CODO DE 1" X 45° HECHIZO	ACC-039	0	0.00	2026-07-08 16:48:35.325-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3b13c771-120f-52f6-ad09-99d9803d4db9	2026-07-09 18:48:10.680325-05
CODO DE 1" X 45° INYECTOPLAST	ACC-040	0	0.00	2026-07-08 16:48:35.326-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	78f0e96c-f9da-5ad4-b3b8-272f1f53d683	2026-07-09 18:48:10.681393-05
REDUCCIÓN DE 1" X 1/2"  C/R	ACC-042	0	0.00	2026-07-08 16:48:35.327-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	65e5b0df-424a-5616-92e3-2f99addc4d32	2026-07-09 18:48:10.684131-05
REDUCCIÓN DE 1" X 1/2" PAVCO	ACC-043	0	0.00	2026-07-08 16:48:35.327-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	83afd834-715f-5c16-b25a-a95f1dd215f2	2026-07-09 18:48:10.685129-05
REDUCCIÓN DE 1" X 1/2" S/P	ACC-044	0	0.00	2026-07-08 16:48:35.328-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	938c79dd-a78b-52fe-b5b1-7dc8c3402e27	2026-07-09 18:48:10.685995-05
REDUCCIÓN DE 1" X 3/4" C/R	ACC-045	0	0.00	2026-07-08 16:48:35.328-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c871218e-0326-53d9-a009-71688b4a6036	2026-07-09 18:48:10.686826-05
REDUCCIÓN DE 1" X 3/4" S/P	ACC-047	0	0.00	2026-07-08 16:48:35.329-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	68c758fc-c132-589d-8922-d6026f6eda2b	2026-07-09 18:48:10.688451-05
TEE DE 1" S/P PAVCO	ACC-049	0	0.00	2026-07-08 16:48:35.33-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	89df1bdb-b965-5f56-8217-a40c8177ba1c	2026-07-09 18:48:10.689722-05
UNIÓN DE 1" C/R INYECTOPLAST	ACC-050	0	0.00	2026-07-08 16:48:35.331-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1a1e22be-f271-52bd-a3ef-2a8557e9ae09	2026-07-09 18:48:10.690664-05
UNIÓN DE 1" MX INYECTOPLAST	ACC-051	0	0.00	2026-07-08 16:48:35.331-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	ed3ea75a-5278-5456-9d04-437ccf02d49e	2026-07-09 18:48:10.69188-05
UNIÓN DE 1" S/P HECHIZO	ACC-052	0	0.00	2026-07-08 16:48:35.332-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b0cc10af-6bd3-5db2-b767-bde9f7f44585	2026-07-09 18:48:10.692805-05
UNIÓN DE 1" S/P INYECTOPLAST	ACC-053	0	0.00	2026-07-08 16:48:35.332-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	d5867674-d4e4-5b33-bf2c-bf34edfd5dfc	2026-07-09 18:48:10.693613-05
UNIÓN DE 1" S/P PAVCO	ACC-054	0	0.00	2026-07-08 16:48:35.333-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	fbae89c5-c2b7-5474-ac58-670f2b75cf33	2026-07-09 18:48:10.694359-05
ADAPTADOR DE 1 1/4"	ACC-055	0	0.00	2026-07-08 16:48:35.333-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c4c9b9d2-56ff-5b1e-a245-b1facf78c2bf	2026-07-09 18:48:10.695376-05
CODO DE 1 1/4" S/P INY	ACC-056	0	0.00	2026-07-08 16:48:35.333-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b31cbc61-31e9-5a74-9a3b-301797e1ba2a	2026-07-09 18:48:10.696187-05
CODO DE 1 1/4" S/P PAVCO	ACC-057	0	0.00	2026-07-08 16:48:35.334-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	6bc0da10-1394-5d66-9305-5cd508cff2a6	2026-07-09 18:48:10.696952-05
TEE DE 1 1/4"	ACC-058	0	0.00	2026-07-08 16:48:35.334-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	64351fee-56ae-543c-86a3-29fdf973385b	2026-07-09 18:48:10.69788-05
REDUCCIÓN 1 1/4" X 1" C/R	ACC-059	0	0.00	2026-07-08 16:48:35.335-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7123701e-bc4e-5456-9042-4e0b7d77421a	2026-07-09 18:48:10.699119-05
REDUCCIÓN 1 1/4" X 1" S/P	ACC-060	0	0.00	2026-07-08 16:48:35.335-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	eb46241c-803d-5560-9ad0-16da41bbc89a	2026-07-09 18:48:10.700033-05
ADAPTADOR DE 1 1/2 ERA	ACC-061	0	0.00	2026-07-08 16:48:35.336-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	34511404-c08a-5451-b2fe-bc875d6e5a80	2026-07-09 18:48:10.700903-05
ADAPTADOR DE 1 1/2"	ACC-062	0	0.00	2026-07-08 16:48:35.336-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0ebec45b-3a42-5153-9553-bd1c747f23d5	2026-07-09 18:48:10.701731-05
CODO DE 1 1/2" S/P INYECTOPLAST	ACC-064	0	0.00	2026-07-08 16:48:35.337-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	426afc45-d4d5-5e20-b286-5132bd35c5e8	2026-07-09 18:48:10.702547-05
CODO DE 1 1/2" S/P PAVCO	ACC-065	0	0.00	2026-07-08 16:48:35.337-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e3b897ae-b9d3-5aaf-9462-daf834c8c088	2026-07-09 18:48:10.703361-05
CODO DE 1 1/2" X 45° HECHIZO	ACC-066	0	0.00	2026-07-08 16:48:35.338-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1a9210ee-bdf4-5795-aab4-dbe2542aedd4	2026-07-09 18:48:10.704226-05
CODO DE 1 1/2" X 45° S/P ERA	ACC-067	0	0.00	2026-07-08 16:48:35.338-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	48a15ed1-5b22-54a7-8c32-e0744a9b60f1	2026-07-09 18:48:10.705153-05
REDUCCIÓN DE 1 1/2" X 1" C/R	ACC-068	0	0.00	2026-07-08 16:48:35.339-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	31b0f73a-f7fa-534e-94eb-bd1e68f160c6	2026-07-09 18:48:10.706261-05
REDUCCIÓN DE 1 1/2" X 1" S/P	ACC-069	0	0.00	2026-07-08 16:48:35.339-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4c2fcba8-2426-54ff-9fd7-08d3557837af	2026-07-09 18:48:10.707366-05
REDUCCIÓN DE 1 1/2" X 1/2" C/R	ACC-070	0	0.00	2026-07-08 16:48:35.34-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2889229d-6e81-5dd2-8901-09cb2f5fc48b	2026-07-09 18:48:10.709251-05
REDUCCIÓN DE 1 1/2" X 1/2" S/P	ACC-071	0	0.00	2026-07-08 16:48:35.34-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	46f66b10-9c5d-5246-8ea4-1cc34b02baa3	2026-07-09 18:48:10.711187-05
REDUCCIÓN DE 1 1/2" X 3/4" C/R	ACC-072	0	0.00	2026-07-08 16:48:35.34-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b5398bfc-2831-548f-8d49-ca164bba11c4	2026-07-09 18:48:10.712817-05
REDUCCIÓN DE 1 1/2" X 3/4" S/P	ACC-073	0	0.00	2026-07-08 16:48:35.341-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	78109a30-d5ea-5b55-8e7b-f112d6a7989b	2026-07-09 18:48:10.714452-05
TEE DE 1 1/2" S/P ERA	ACC-074	0	0.00	2026-07-08 16:48:35.341-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b5c77901-6f06-5693-bb83-646b48a7df54	2026-07-09 18:48:10.715884-05
TEE DE 1 1/2" S/P INYECTOPLAST	ACC-075	0	0.00	2026-07-08 16:48:35.342-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	37f14383-509c-5367-b426-d17b22e25eda	2026-07-09 18:48:10.71692-05
TEE DE 1 1/2" S/P PAVCO	ACC-076	0	0.00	2026-07-08 16:48:35.342-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0826dae6-3103-5764-b57e-e59be2d61871	2026-07-09 18:48:10.717855-05
UNIÓN DE 1 1/2" S/P INYECTOPLAST	ACC-077	0	0.00	2026-07-08 16:48:35.343-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	613475e7-ef03-5ffe-805e-e414fcb5cd3a	2026-07-09 18:48:10.718824-05
UNIÓN DE 1 1/2" S/P PAVCO	ACC-078	0	0.00	2026-07-08 16:48:35.343-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2910dcf9-d4dd-59cc-af84-8a2e4a36b263	2026-07-09 18:48:10.719704-05
ADAPTADOR DE 2"	ACC-079	0	0.00	2026-07-08 16:48:35.344-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	99f2a75e-eb02-5dc0-ba43-4cf8d28ea026	2026-07-09 18:48:10.720626-05
CODO DE 2" S/P ERA	ACC-080	0	0.00	2026-07-08 16:48:35.344-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0d273e7a-9ed0-5fa9-9afc-c59a763f0be4	2026-07-09 18:48:10.721498-05
CODO DE 2" S/P INYECTOPLAST	ACC-081	0	0.00	2026-07-08 16:48:35.344-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8d1f0c86-5abb-5f6d-a4db-86407c98185e	2026-07-09 18:48:10.722365-05
CODO DE 2" S/P PAVCO	ACC-082	0	0.00	2026-07-08 16:48:35.345-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1756fe94-47be-5bcd-90b5-840756033066	2026-07-09 18:48:10.723401-05
CODO DE 2" X 45° S/P ERA	ACC-083	0	0.00	2026-07-08 16:48:35.346-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5505c592-f222-513e-9300-8194feaa3ae7	2026-07-09 18:48:10.724475-05
CODO DE 2" X 45° S/P HECHIZO	ACC-084	0	0.00	2026-07-08 16:48:35.346-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8cd39b4b-0a87-575c-9981-a308feb17259	2026-07-09 18:48:10.725933-05
REDUCCIÓN DE  2" X 1 1/2" S/P	ACC-086	0	0.00	2026-07-08 16:48:35.347-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	277eb69e-1289-51e2-b7bc-edf74d5736c0	2026-07-09 18:48:10.727874-05
REDUCCIÓN DE  2" X 1/2" C/R	ACC-087	0	0.00	2026-07-08 16:48:35.347-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	473c4088-be47-53af-9166-b535d87a5a13	2026-07-09 18:48:10.728701-05
REDUCCIÓN DE  2" X 1/2" S/P	ACC-088	0	0.00	2026-07-08 16:48:35.348-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c3829407-2470-57c5-9ef2-f027a327675d	2026-07-09 18:48:10.729652-05
REDUCCIÓN DE  2" X 3/4" C/R	ACC-089	0	0.00	2026-07-08 16:48:35.348-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8c8d88d1-41ae-5202-9182-8c224e1c8ec7	2026-07-09 18:48:10.730563-05
REDUCCIÓN DE  2" X 3/4" S/P	ACC-090	0	0.00	2026-07-08 16:48:35.349-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	976209aa-82f1-5a44-8f80-b36cb9e3e234	2026-07-09 18:48:10.731331-05
REDUCCIÓN DE 2" X 1" C/R	ACC-091	0	0.00	2026-07-08 16:48:35.349-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	fa2f987a-73b7-5102-a9ac-80a6eeaa8e0d	2026-07-09 18:48:10.7321-05
REDUCCIÓN DE 2" X 1" S/P	ACC-092	0	0.00	2026-07-08 16:48:35.35-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	675b5ce6-000b-5d88-8f40-afa4ac8f7028	2026-07-09 18:48:10.732847-05
TEE DE 2" S/P ERA	ACC-093	0	0.00	2026-07-08 16:48:35.35-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c556ca43-1b69-5854-99ff-345141513c57	2026-07-09 18:48:10.73358-05
TEE DE 2" S/P INYECTOPLAST	ACC-094	0	0.00	2026-07-08 16:48:35.35-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	70349a12-ee8f-54da-af7d-617e35517610	2026-07-09 18:48:10.734326-05
TEE DE 2" S/P PAVCO	ACC-095	0	0.00	2026-07-08 16:48:35.351-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	02c6b755-3f6d-5015-a52e-202afd068228	2026-07-09 18:48:10.735067-05
UNIÓN DE 2" S/P INYECTOPLAST	ACC-096	0	0.00	2026-07-08 16:48:35.351-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a4ae5c14-6f49-5420-965a-29b588243734	2026-07-09 18:48:10.735804-05
UNIÓN DE 2" S/P PAVCO	ACC-097	0	0.00	2026-07-08 16:48:35.352-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	51328acf-30eb-5aa5-b294-837207b690a8	2026-07-09 18:48:10.736562-05
TEE DE 3" S/P ERA	ACC-098	0	0.00	2026-07-08 16:48:35.352-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	d24d37fe-2076-559f-a539-5cc50aa5e468	2026-07-09 18:48:10.737301-05
CURVA DE 1" LUZ	ACC-041	0	0.00	2026-07-08 16:48:35.326-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0480012b-36e6-5c17-b2c7-830cdf871eca	2026-07-09 18:48:10.682213-05
REDUCCIÓN DE 1" X 3/4" PAVCO	ACC-046	0	0.00	2026-07-08 16:48:35.328-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	cd8a5a14-1c4c-5b84-b060-08a817f45117	2026-07-09 18:48:10.687614-05
REDUCCIÓN DE  2" X 1 1/2" C/R	ACC-085	0	0.00	2026-07-08 16:48:35.347-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	df5ee723-d9b5-5e5c-9238-2ce0a027b591	2026-07-09 18:48:10.726962-05
CODO DE 3" S/P ERA	ACC-099	0	0.00	2026-07-08 16:48:35.352-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7a627a58-497f-55a1-91ae-5b362092b27d	2026-07-09 18:48:10.738022-05
CODO DE 3" X 45° S/P ERA	ACC-100	0	0.00	2026-07-08 16:48:35.353-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	895f344c-c2a7-5f6d-86f7-363975030473	2026-07-09 18:48:10.738758-05
CINTA AISLANTE 3M	ACC-101	0	0.00	2026-07-08 16:48:35.353-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a42a170c-d142-5b01-bbb8-725ff1481341	2026-07-09 18:48:10.739615-05
CINTA TEFLÓN	ACC-102	0	0.00	2026-07-08 16:48:35.354-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	fe65c97a-47ed-5766-936f-eae5a44fdbf3	2026-07-09 18:48:10.740547-05
PEGAMENTO DE 1/32 AZUL	ACC-103	0	0.00	2026-07-08 16:48:35.354-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	26d6dc7e-1fcb-5008-9b03-1e73064c253a	2026-07-09 18:48:10.742385-05
PEGAMENTO DE 1/32 DORADO	ACC-104	0	0.00	2026-07-08 16:48:35.355-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5e1a7eb5-5644-5189-bafc-1873d1aeec6e	2026-07-09 18:48:10.744158-05
PEGAMENTO DE 1/4 DORADO	ACC-105	0	0.00	2026-07-08 16:48:35.355-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c7706c29-e09c-5cab-892a-60385cab5678	2026-07-09 18:48:10.745171-05
PEGAMENTO DE 1/4 NEGRO	ACC-106	0	0.00	2026-07-08 16:48:35.356-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	343d3e1b-6e56-5d66-a4d8-61559df55a61	2026-07-09 18:48:10.745973-05
TAPÓN DE 1/2" S/P HEM	ACC-107	0	0.00	2026-07-08 16:48:35.356-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	9936fdc6-d62d-5848-a355-8067c2d98375	2026-07-09 18:48:10.746753-05
TAPÓNDE 1/2" C/R HEM	ACC-108	0	0.00	2026-07-08 16:48:35.357-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	50635ee0-6fe2-5caa-9043-e696a8d73dc9	2026-07-09 18:48:10.747497-05
TAPÓN DE  3/4" S/P HEM	ACC-109	0	0.00	2026-07-08 16:48:35.357-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0a757210-25b3-5e11-8789-db5ef24ca8f1	2026-07-09 18:48:10.748236-05
TAPÓN DE  3/4" C/R HEM	ACC-110	0	0.00	2026-07-08 16:48:35.358-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	07e39420-bfc4-5506-88fc-fbea80a367bb	2026-07-09 18:48:10.748989-05
TAPÓN DE 1" C/R HEM	ACC-111	0	0.00	2026-07-08 16:48:35.358-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2cd91b16-9e02-523b-9b49-3c5f50b58068	2026-07-09 18:48:10.749714-05
TAPÓN DE 1" S/P HEM	ACC-112	0	0.00	2026-07-08 16:48:35.358-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	364af1ec-e913-5ca0-b535-2b5a6e981c1a	2026-07-09 18:48:10.750625-05
TAPÓN DE 1 1/2" C/R HEM	ACC-113	0	0.00	2026-07-08 16:48:35.359-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	63be48da-170c-51ef-9f2f-5c8140f1abc9	2026-07-09 18:48:10.751376-05
TAPÓN DE 1 1/2" S/P HEM	ACC-114	0	0.00	2026-07-08 16:48:35.359-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	6fba2f9b-13a2-5111-8ebb-45b7ea3e897e	2026-07-09 18:48:10.752217-05
TAPÓN DE 2" S/P HEM ERA	ACC-115	0	0.00	2026-07-08 16:48:35.36-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b47be98c-12fe-56b2-aac8-c31c9c413718	2026-07-09 18:48:10.753049-05
TAPÓN DE 2" C/R HEM ERA	ACC-116	0	0.00	2026-07-08 16:48:35.36-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	29e5f975-e94f-5e97-8337-b6490bb08499	2026-07-09 18:48:10.753825-05
TAPÓN DE 3" S/P HEM ERA	ACC-117	0	0.00	2026-07-08 16:48:35.361-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	dc7957da-6ba3-55ca-90df-ff06a426c130	2026-07-09 18:48:10.754612-05
UNIÓN UNIVERSAL DE 1/2" C/R	ACC-118	0	0.00	2026-07-08 16:48:35.361-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	34c0ae40-8eae-5288-a3f7-6ad06241ba3e	2026-07-09 18:48:10.755561-05
UNIÓN UNIVERSAL DE 1/2" S/P	ACC-119	0	0.00	2026-07-08 16:48:35.361-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7a1ebb26-5b4f-5c83-9285-659ad7c58bb5	2026-07-09 18:48:10.756603-05
UNIÓN UNIVERSAL DE 3/4" C/R	ACC-120	0	0.00	2026-07-08 16:48:35.362-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e050958a-3542-5ea8-b405-4a3140a09e99	2026-07-09 18:48:10.758008-05
UNIÓN UNIVERSAL DE 3/4" S/P	ACC-121	0	0.00	2026-07-08 16:48:35.362-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	128f6352-dc01-5e85-a197-c1867e1167a6	2026-07-09 18:48:10.759446-05
UNIÓN UNIVERSAL DE 1" C/R	ACC-122	0	0.00	2026-07-08 16:48:35.363-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0c842fa2-c56d-5519-9a36-288f9618a19d	2026-07-09 18:48:10.760414-05
UNIÓN UNIVERSAL DE 1" S/P	ACC-123	0	0.00	2026-07-08 16:48:35.363-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	bd8567e8-83e6-515e-904b-6de1b6d4e7c6	2026-07-09 18:48:10.761196-05
UNIÓN UNIVERSAL DE 1 1/2" C/R	ACC-124	0	0.00	2026-07-08 16:48:35.363-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	62b795c2-93f2-54e3-b4a1-c318774ec84e	2026-07-09 18:48:10.761951-05
UNIÓN UNIVERSAL DE 1 1/2" S/P	ACC-125	0	0.00	2026-07-08 16:48:35.364-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5d8dc9a9-99f1-531c-8212-9756067631c3	2026-07-09 18:48:10.762682-05
UNIÓN UNIVERSAL DE 1 1/4" C/R	ACC-126	0	0.00	2026-07-08 16:48:35.365-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	019ba977-8e2b-52bb-b771-17ff4caf278f	2026-07-09 18:48:10.763677-05
UNIÓN UNIVERSAL DE 1 1/4" S/P	ACC-127	0	0.00	2026-07-08 16:48:35.365-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4c2383ba-e5ae-5260-ac64-f0be3a5233ab	2026-07-09 18:48:10.764524-05
UNIÓN UNIVERSAL DE 2" C/R	ACC-128	0	0.00	2026-07-08 16:48:35.365-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a2bcc95d-d211-5757-9a30-3fc45ebc9c2d	2026-07-09 18:48:10.765449-05
UNIÓN UNIVERSAL DE 2" S/P	ACC-129	0	0.00	2026-07-08 16:48:35.366-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	191fdea1-312e-5790-ab06-0c8f29872019	2026-07-09 18:48:10.766256-05
VÁLVULA DE PASO DE 1/2" S/P SANKING	ACC-130	0	0.00	2026-07-08 16:48:35.366-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1d0c6d97-68ac-5e42-a1c6-4e26822fd2e4	2026-07-09 18:48:10.766996-05
VÁLVULA DE PASO DE 3/4" S/P SANKING	ACC-131	0	0.00	2026-07-08 16:48:35.367-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	661ed685-141d-50a9-8d30-b5481b6ecdb7	2026-07-09 18:48:10.767711-05
VÁLVULA DE PASO DE 1" S/P SANKING	ACC-132	0	0.00	2026-07-08 16:48:35.367-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5a563239-ed7d-5f66-bcce-1c294b0201bd	2026-07-09 18:48:10.76842-05
VÁLVULA DE PASO DE 1 1/2" S/P SANKING	ACC-133	0	0.00	2026-07-08 16:48:35.367-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5d47f643-ee7f-54d4-80bd-65590e493290	2026-07-09 18:48:10.769127-05
VÁLVULA DE PASO DE 2" S/P SANKING	ACC-134	0	0.00	2026-07-08 16:48:35.368-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	922f85c4-e5c7-53fd-9275-ef2dba106106	2026-07-09 18:48:10.76985-05
BOQUILLA 4 VAN AJUSTABLE AMARILLO RAIN BIRD	ACC-135	0	0.00	2026-07-08 16:48:35.368-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b3a441a5-1f4d-5574-906c-3a023b41cfcb	2026-07-09 18:48:10.770562-05
BOQUILLA 6 VAN AJUSTABLE NARANJA RAIN BIRD	ACC-136	0	0.00	2026-07-08 16:48:35.369-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	35cd7882-7a27-5b56-8688-123a291d4f03	2026-07-09 18:48:10.77126-05
BOQUILLA 8 VAN AJUSTABLE VERDE RAIN BIRD	ACC-137	0	0.00	2026-07-08 16:48:35.369-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4515e9da-a481-5799-bbf8-767ecc6a084d	2026-07-09 18:48:10.772124-05
BOQUILLA 10 VAN AJUSTABLE AZUL RAIN BIRD	ACC-138	0	0.00	2026-07-08 16:48:35.37-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0430b658-b059-5d51-8763-c5887bc26c19	2026-07-09 18:48:10.773042-05
BOQUILLA 12 VAN AJUSTABLE MARRON RAIN BIRD	ACC-139	0	0.00	2026-07-08 16:48:35.37-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e17c498b-09c4-5be0-8838-e643ae616810	2026-07-09 18:48:10.773761-05
BOQUILLA 4 A AJUSTABLE HUNTER	ACC-140	0	0.00	2026-07-08 16:48:35.37-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	76231af3-1071-516f-9986-f05216c562da	2026-07-09 18:48:10.774772-05
BOQUILLA 6 A AJUSTABLE HUNTER	ACC-141	0	0.00	2026-07-08 16:48:35.371-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	53665884-a8b4-589b-84b6-441cd7d86904	2026-07-09 18:48:10.776018-05
BOQUILLA 8 A AJUSTABLE HUNTER	ACC-142	0	0.00	2026-07-08 16:48:35.371-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2e85468b-0b08-5828-888b-41579c6c4b57	2026-07-09 18:48:10.776859-05
BOQUILLA 10 A AJUSTABLE HUNTER	ACC-143	0	0.00	2026-07-08 16:48:35.371-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8a4457cf-6ae8-50c1-a8ed-c5fcacab53f0	2026-07-09 18:48:10.777736-05
CODO DE 1 1/2" S/P ERA	ACC-063	-4	0.00	2026-07-08 16:48:35.336-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	93c7236b-7274-58cc-8e79-291f1706e4be	2026-07-09 18:48:10.778681-05
BOQUILLA 12 A AJUSTABLE HUNTER	ACC-144	-1	0.00	2026-07-08 16:48:35.372-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2	2026-07-09 18:48:10.779412-05
\.


--
-- Data for Name: proyecto_empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_empleados (proyecto_id, empleado_id, updated_at) FROM stdin;
18ba31e5-6b1b-5f99-a316-8d9ed10ab398	c5cd0632-9e14-5593-89d6-ac08c593f99c	2026-07-09 18:51:10.009255-05
f1b30cad-e0dc-5867-bf91-323fbf08d8bf	374d65b5-5f34-5cb6-b863-eb15cdc62bc4	2026-07-09 18:40:31.244-05
\.


--
-- Data for Name: proyecto_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_items (nombre_externo, cantidad, justificacion, created_at, id, proyecto_id, producto_id, updated_at) FROM stdin;
\N	1	\N	2026-07-05 23:36:59.824	e5dfc08c-9df0-5b26-ba46-24dfaf7a5087	18ba31e5-6b1b-5f99-a316-8d9ed10ab398	\N	2026-07-09 18:51:09.85596-05
MANOMETRO	1	1234	2026-07-08 18:49:54.85	f04a546e-9673-5d8c-8a57-c66707729f62	f1b30cad-e0dc-5867-bf91-323fbf08d8bf	\N	2026-07-09 18:40:31.244-05
\N	1	\N	2026-07-08 18:47:59.805	02b1ca0c-09a3-5fef-ac25-902095864cb6	f1b30cad-e0dc-5867-bf91-323fbf08d8bf	f2184d14-d793-5542-8093-935bb6e4b137	2026-07-09 18:40:31.244-05
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyectos (nombre, estado, created_at, id, updated_at) FROM stdin;
OMAR	en_progreso	2026-07-05 23:36:31.023	18ba31e5-6b1b-5f99-a316-8d9ed10ab398	2026-07-09 18:47:51.156864-05
harry	en_progreso	2026-07-07 22:34:28.39	8a382110-66d5-593a-bf3d-44f335189c05	2026-07-09 18:48:11.084109-05
BRISEÑO	en_progreso	2026-07-08 18:47:59.789	f1b30cad-e0dc-5867-bf91-323fbf08d8bf	2026-07-09 18:48:11.085041-05
\.


--
-- Data for Name: sync_outbox; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sync_outbox (id, table_name, operation, payload, created_at, synced_at, attempts, last_error) FROM stdin;
1	usuarios	DELETE	{"id": 2, "username": "claude_qa_test", "created_at": "2026-07-09T18:28:00.824914-05:00", "password_hash": "$2b$10$Qw.kh1H03GZVAz1WDe/.leqlNYsqFXm98CtStKBMMtDdnvS1M1mo.", "nombre_completo": "QA Test"}	2026-07-09 18:35:16.547447-05	2026-07-09 18:37:18.781391-05	0	\N
2	gastos	INSERT	{"id": "a26046c6-3dde-49af-8d28-ec9b33c0648d", "fecha": "2026-07-09", "monto": 1.23, "notas": null, "estado": "pendiente", "concepto": "TEST_PUSH", "categoria": "test", "created_at": "2026-07-09T18:47:48.297742-05:00", "updated_at": "2026-07-09T18:47:48.297742-05:00", "comprobante_url": null}	2026-07-09 18:47:48.297742-05	2026-07-09 18:47:50.002426-05	0	\N
3	gastos	DELETE	{"id": "5e0fe085-8107-4a95-97f6-295c2f9db35d", "fecha": "2026-07-09", "monto": 4.56, "notas": null, "estado": "pendiente", "concepto": "TEST_PULL", "categoria": "test", "created_at": "2026-07-09T18:47:49.979-05:00", "updated_at": "2026-07-09T18:48:11.401487-05:00", "comprobante_url": null}	2026-07-09 18:48:35.050479-05	2026-07-09 18:48:36.147904-05	0	\N
4	gastos	DELETE	{"id": "a26046c6-3dde-49af-8d28-ec9b33c0648d", "fecha": "2026-07-09", "monto": 1.23, "notas": null, "estado": "pendiente", "concepto": "TEST_PUSH", "categoria": "test", "created_at": "2026-07-09T18:47:48.297742-05:00", "updated_at": "2026-07-09T18:47:48.297742-05:00", "comprobante_url": null}	2026-07-09 18:48:58.18185-05	2026-07-09 18:48:58.963185-05	0	\N
5	usuarios	INSERT	{"id": "271cf633-babd-4465-bff3-9558a6b64b65", "username": "claude_qa_test", "created_at": "2026-07-09T18:49:04.024438-05:00", "updated_at": "2026-07-09T18:49:04.024438-05:00", "password_hash": "$2b$10$902fSycPMQnA1M01FLmS3.hrIjpV/rEk5upZTGF5kZoS7HjfNysZ2", "nombre_completo": "QA Test"}	2026-07-09 18:49:04.024438-05	2026-07-09 18:49:19.048111-05	0	\N
6	usuarios	DELETE	{"id": "271cf633-babd-4465-bff3-9558a6b64b65", "username": "claude_qa_test", "created_at": "2026-07-09T18:49:04.024438-05:00", "updated_at": "2026-07-09T18:49:04.024438-05:00", "password_hash": "$2b$10$902fSycPMQnA1M01FLmS3.hrIjpV/rEk5upZTGF5kZoS7HjfNysZ2", "nombre_completo": "QA Test"}	2026-07-09 18:50:41.556036-05	2026-07-09 18:51:06.653143-05	0	\N
7	gastos	INSERT	{"id": "552a1d6d-0b23-4e94-b011-d78f28793206", "fecha": "2026-07-09", "monto": 1.23, "notas": null, "estado": "pendiente", "concepto": "TEST_PUSH", "categoria": "test", "created_at": "2026-07-09T18:51:04.805076-05:00", "updated_at": "2026-07-09T18:51:04.805076-05:00", "comprobante_url": null}	2026-07-09 18:51:04.805076-05	2026-07-09 18:51:06.803748-05	0	\N
8	gastos	DELETE	{"id": "036b10f4-eca9-40f1-aa6a-f3c5d09e9f6d", "fecha": "2026-07-09", "monto": 4.56, "notas": null, "estado": "pendiente", "concepto": "TEST_PULL", "categoria": "test", "created_at": "2026-07-09T18:51:06.494-05:00", "updated_at": "2026-07-09T18:51:06.494-05:00", "comprobante_url": null}	2026-07-09 18:51:51.356086-05	2026-07-09 18:51:52.447519-05	0	\N
9	gastos	DELETE	{"id": "552a1d6d-0b23-4e94-b011-d78f28793206", "fecha": "2026-07-09", "monto": 1.23, "notas": null, "estado": "pendiente", "concepto": "TEST_PUSH", "categoria": "test", "created_at": "2026-07-09T18:51:04.805076-05:00", "updated_at": "2026-07-09T18:51:04.805076-05:00", "comprobante_url": null}	2026-07-09 18:52:14.573771-05	\N	0	\N
10	usuarios	INSERT	{"id": "9cebfd8a-110a-47b3-b626-66d61bd9f148", "username": "_test_verify", "created_at": "2026-07-09T19:00:57.869103-05:00", "updated_at": "2026-07-09T19:00:57.869103-05:00", "password_hash": ".f/rnDWtKoyvJTdHinwwIIGoLKmvpI2", "nombre_completo": "Test Verify"}	2026-07-09 19:00:57.869103-05	\N	0	\N
11	usuarios	UPDATE	{"id": "9cebfd8a-110a-47b3-b626-66d61bd9f148", "username": "_test_verify", "created_at": "2026-07-09T19:00:57.869103-05:00", "updated_at": "2026-07-09T19:02:23.036573-05:00", "password_hash": "$2b$10$waUNluNEA8Qske8YSmrDQe.f/rnDWtKoyvJTdHinwwIIGoLKmvpI2", "nombre_completo": "Test Verify"}	2026-07-09 19:02:23.036573-05	\N	0	\N
12	ventas	INSERT	{"id": "26e9e4de-90cc-4be5-bb7f-f059f40a81fc", "fecha": "2026-07-10", "notas": "", "total": 0.00, "estado": "borrador", "numero": 1, "created_at": "2026-07-09T19:05:39.025083-05:00", "updated_at": "2026-07-09T19:05:39.025083-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-09 19:05:39.025083-05	\N	0	\N
13	venta_lineas	INSERT	{"id": "79c2c068-b2b1-40e4-ad70-bbb0283ccfcc", "cantidad": 1, "subtotal": 0.00, "venta_id": "26e9e4de-90cc-4be5-bb7f-f059f40a81fc", "created_at": "2026-07-09T19:05:39.025083-05:00", "updated_at": "2026-07-09T19:05:39.025083-05:00", "producto_id": "f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2", "precio_unitario": 0.00}	2026-07-09 19:05:39.025083-05	\N	0	\N
14	asientos_contables	INSERT	{"id": "0b853948-43f1-4fa2-a6fb-eef51e8c8e52", "fecha": "2026-07-10", "estado": "borrador", "numero": 1, "created_at": "2026-07-09T19:11:59.107789-05:00", "updated_at": "2026-07-09T19:11:59.107789-05:00", "descripcion": "Prueba UUID asiento"}	2026-07-09 19:11:59.107789-05	\N	0	\N
15	asiento_lineas	INSERT	{"id": "3d1a4f52-93ee-4770-86a3-bf481e112e43", "debe": 50.00, "haber": 0.00, "cuenta_id": "e6c8eb16-17f9-52fc-abbb-7f36971f570a", "asiento_id": "0b853948-43f1-4fa2-a6fb-eef51e8c8e52", "created_at": "2026-07-09T19:11:59.107789-05:00", "updated_at": "2026-07-09T19:11:59.107789-05:00", "descripcion": null}	2026-07-09 19:11:59.107789-05	\N	0	\N
16	asiento_lineas	INSERT	{"id": "95e0dc62-b56f-44a0-8c9a-3a9225fcbb50", "debe": 0.00, "haber": 50.00, "cuenta_id": "4a5b180b-2dc0-5388-bad7-49934450937f", "asiento_id": "0b853948-43f1-4fa2-a6fb-eef51e8c8e52", "created_at": "2026-07-09T19:11:59.107789-05:00", "updated_at": "2026-07-09T19:11:59.107789-05:00", "descripcion": null}	2026-07-09 19:11:59.107789-05	\N	0	\N
17	asientos_contables	UPDATE	{"id": "0b853948-43f1-4fa2-a6fb-eef51e8c8e52", "fecha": "2026-07-10", "estado": "confirmado", "numero": 1, "created_at": "2026-07-09T19:11:59.107789-05:00", "updated_at": "2026-07-09T19:13:40.971541-05:00", "descripcion": "Prueba UUID asiento"}	2026-07-09 19:13:40.971541-05	\N	0	\N
18	asiento_lineas	DELETE	{"id": "3d1a4f52-93ee-4770-86a3-bf481e112e43", "debe": 50.00, "haber": 0.00, "cuenta_id": "e6c8eb16-17f9-52fc-abbb-7f36971f570a", "asiento_id": "0b853948-43f1-4fa2-a6fb-eef51e8c8e52", "created_at": "2026-07-09T19:11:59.107789-05:00", "updated_at": "2026-07-09T19:11:59.107789-05:00", "descripcion": null}	2026-07-09 19:14:42.930095-05	\N	0	\N
19	asiento_lineas	DELETE	{"id": "95e0dc62-b56f-44a0-8c9a-3a9225fcbb50", "debe": 0.00, "haber": 50.00, "cuenta_id": "4a5b180b-2dc0-5388-bad7-49934450937f", "asiento_id": "0b853948-43f1-4fa2-a6fb-eef51e8c8e52", "created_at": "2026-07-09T19:11:59.107789-05:00", "updated_at": "2026-07-09T19:11:59.107789-05:00", "descripcion": null}	2026-07-09 19:14:42.930095-05	\N	0	\N
20	asientos_contables	DELETE	{"id": "0b853948-43f1-4fa2-a6fb-eef51e8c8e52", "fecha": "2026-07-10", "estado": "confirmado", "numero": 1, "created_at": "2026-07-09T19:11:59.107789-05:00", "updated_at": "2026-07-09T19:13:40.971541-05:00", "descripcion": "Prueba UUID asiento"}	2026-07-09 19:14:42.937961-05	\N	0	\N
21	venta_lineas	DELETE	{"id": "79c2c068-b2b1-40e4-ad70-bbb0283ccfcc", "cantidad": 1, "subtotal": 0.00, "venta_id": "26e9e4de-90cc-4be5-bb7f-f059f40a81fc", "created_at": "2026-07-09T19:05:39.025083-05:00", "updated_at": "2026-07-09T19:05:39.025083-05:00", "producto_id": "f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2", "precio_unitario": 0.00}	2026-07-09 19:14:42.938548-05	\N	0	\N
22	ventas	DELETE	{"id": "26e9e4de-90cc-4be5-bb7f-f059f40a81fc", "fecha": "2026-07-10", "notas": "", "total": 0.00, "estado": "borrador", "numero": 1, "created_at": "2026-07-09T19:05:39.025083-05:00", "updated_at": "2026-07-09T19:05:39.025083-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-09 19:14:42.939873-05	\N	0	\N
23	usuarios	DELETE	{"id": "9cebfd8a-110a-47b3-b626-66d61bd9f148", "username": "_test_verify", "created_at": "2026-07-09T19:00:57.869103-05:00", "updated_at": "2026-07-09T19:02:23.036573-05:00", "password_hash": "$2b$10$waUNluNEA8Qske8YSmrDQe.f/rnDWtKoyvJTdHinwwIIGoLKmvpI2", "nombre_completo": "Test Verify"}	2026-07-09 19:14:42.941316-05	\N	0	\N
24	usuarios	INSERT	{"id": "3e56f1ac-1b49-42c4-a9ed-489a1701c74b", "username": "claude_qa_test", "created_at": "2026-07-10T22:36:51.39414-05:00", "updated_at": "2026-07-10T22:36:51.39414-05:00", "password_hash": "$2b$10$2290Ljfz5vPBbSgBKzkB/ulIrFTt/C1S6sj.a8yZnIS7bGSJbVs1a", "nombre_completo": "QA Test"}	2026-07-10 22:36:51.39414-05	\N	0	\N
25	usuarios	DELETE	{"id": "3e56f1ac-1b49-42c4-a9ed-489a1701c74b", "username": "claude_qa_test", "created_at": "2026-07-10T22:36:51.39414-05:00", "updated_at": "2026-07-10T22:36:51.39414-05:00", "password_hash": "$2b$10$2290Ljfz5vPBbSgBKzkB/ulIrFTt/C1S6sj.a8yZnIS7bGSJbVs1a", "nombre_completo": "QA Test"}	2026-07-10 22:37:43.70056-05	\N	0	\N
26	usuarios	INSERT	{"id": "ba2c391d-06b9-483b-9baf-114861fefb58", "username": "claude_qa_test", "created_at": "2026-07-10T22:43:15.743525-05:00", "updated_at": "2026-07-10T22:43:15.743525-05:00", "password_hash": "$2b$10$75G/Q2Xk5W/pURvPdB9qou1uHIYzKzmbzkODNGivA2YiyDTKI/YgG", "nombre_completo": "QA Test"}	2026-07-10 22:43:15.743525-05	\N	0	\N
27	usuarios	DELETE	{"id": "ba2c391d-06b9-483b-9baf-114861fefb58", "username": "claude_qa_test", "created_at": "2026-07-10T22:43:15.743525-05:00", "updated_at": "2026-07-10T22:43:15.743525-05:00", "password_hash": "$2b$10$75G/Q2Xk5W/pURvPdB9qou1uHIYzKzmbzkODNGivA2YiyDTKI/YgG", "nombre_completo": "QA Test"}	2026-07-10 22:43:57.523571-05	\N	0	\N
\.


--
-- Data for Name: sync_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sync_state (id, is_online, last_check_at, last_success_at, last_pull_at) FROM stdin;
t	t	2026-07-09 18:52:12.145648-05	2026-07-09 18:51:55.487031-05	2026-07-09 18:51:53.529-05
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (username, password_hash, nombre_completo, created_at, id, updated_at) FROM stdin;
harry	$2b$10$2oO0ysur9CFTXVPZJ81Smenyt6MkD6tmmcZ7Lln.cPf/y0GwPrrmC	Harry	2026-07-05 15:25:03.511-05	c40ab922-aaca-545a-9f8c-0be28f1c5c8e	2026-07-09 18:47:50.301926-05
\.


--
-- Data for Name: venta_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.venta_lineas (cantidad, precio_unitario, subtotal, created_at, id, venta_id, producto_id, updated_at) FROM stdin;
\.


--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ventas (total, estado, fecha, notas, created_at, id, contacto_id, updated_at, numero) FROM stdin;
\.


--
-- Name: asientos_contables_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asientos_contables_numero_seq', 1, true);


--
-- Name: sync_outbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sync_outbox_id_seq', 27, true);


--
-- Name: ventas_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ventas_numero_seq', 1, true);


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
-- Name: idx_sync_outbox_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sync_outbox_pending ON public.sync_outbox USING btree (id) WHERE (synced_at IS NULL);


--
-- Name: asiento_lineas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.asiento_lineas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: asientos_contables trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.asientos_contables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: calendario_eventos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.calendario_eventos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: contactos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.contactos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: empleados trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.empleados FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: gastos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.gastos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: piscina_consumos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.piscina_consumos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: piscina_materiales trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.piscina_materiales FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: piscina_pagos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.piscina_pagos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: piscinas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.piscinas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: plan_cuentas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.plan_cuentas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: productos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: proyecto_empleados trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.proyecto_empleados FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: proyecto_items trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.proyecto_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: proyectos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: usuarios trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: venta_lineas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.venta_lineas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ventas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.ventas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


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

\unrestrict dPIO9fD1RzGaSVlbct2vXTJgY91eEDKcQHmqKOjPrJrb4sbUo0ZW2SFjgLmCBJV

