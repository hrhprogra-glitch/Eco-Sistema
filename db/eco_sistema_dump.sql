--
-- PostgreSQL database dump
--

\restrict wQQjSqGeRIqI7hBPsapENVKwt9MiFFcXJpxBFMB2CdbsbEStsWtPAmMQHTi9roL

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
-- Name: almacenes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.almacenes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    ubicacion character varying(200),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


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
-- Name: calendario_evento_empleados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendario_evento_empleados (
    evento_id uuid NOT NULL,
    empleado_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: calendario_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendario_eventos (
    titulo text NOT NULL,
    fecha date NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT now(),
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    tipo character varying(50) DEFAULT 'nota'::character varying,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    piscina_id uuid,
    proyecto_id uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT calendario_eventos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'completado'::character varying, 'seguimiento'::character varying, 'cancelado'::character varying])::text[])))
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
    codigo character varying(50),
    nombre_fiscal character varying(255),
    fax character varying(50),
    movil character varying(50),
    persona_contacto character varying(255),
    nif character varying(50),
    agente character varying(255),
    tipo_cliente character varying(50),
    ubicacion_url text,
    CONSTRAINT contactos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['cliente'::character varying, 'proveedor'::character varying, 'otro'::character varying])::text[])))
);


--
-- Name: cotizacion_lineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cotizacion_lineas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cotizacion_id uuid NOT NULL,
    producto_id uuid,
    cantidad numeric(12,2) NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    descripcion text,
    descripcion_superior text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cotizacion_lineas_producto_o_descripcion CHECK (((producto_id IS NOT NULL) OR (descripcion IS NOT NULL)))
);


--
-- Name: cotizaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cotizaciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero bigint NOT NULL,
    contacto_id uuid NOT NULL,
    estado character varying(20) DEFAULT 'borrador'::character varying NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    moneda character varying(3) DEFAULT 'PEN'::character varying NOT NULL,
    lineas_detalle jsonb DEFAULT '[]'::jsonb NOT NULL,
    lineas_modo text DEFAULT 'tarjetas'::text NOT NULL,
    lineas_libres jsonb,
    CONSTRAINT cotizaciones_estado_check CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'enviada'::character varying, 'aceptada'::character varying, 'rechazada'::character varying, 'confirmada'::character varying, 'cancelada'::character varying])::text[]))),
    CONSTRAINT cotizaciones_moneda_check CHECK (((moneda)::text = ANY ((ARRAY['PEN'::character varying, 'USD'::character varying])::text[])))
);


--
-- Name: cotizaciones_numero_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cotizaciones_numero_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cotizaciones_numero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cotizaciones_numero_seq OWNED BY public.cotizaciones.numero;


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
-- Name: entrada_lineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entrada_lineas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entrada_id uuid NOT NULL,
    producto_id uuid NOT NULL,
    almacen_id uuid NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    costo_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    fecha_vencimiento date
);


--
-- Name: entradas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entradas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero bigint NOT NULL,
    proveedor_id uuid NOT NULL,
    numero_factura_proveedor character varying(50),
    estado character varying(20) DEFAULT 'borrador'::character varying NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    moneda character varying(3) DEFAULT 'PEN'::character varying NOT NULL,
    CONSTRAINT entradas_estado_check CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'confirmada'::character varying, 'cancelada'::character varying])::text[]))),
    CONSTRAINT entradas_moneda_check CHECK (((moneda)::text = ANY ((ARRAY['PEN'::character varying, 'USD'::character varying])::text[])))
);


--
-- Name: entradas_numero_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entradas_numero_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entradas_numero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entradas_numero_seq OWNED BY public.entradas.numero;


--
-- Name: factura_lineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factura_lineas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    factura_id uuid NOT NULL,
    producto_id uuid,
    descripcion text,
    cantidad numeric(12,2) NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT factura_lineas_producto_o_descripcion CHECK (((producto_id IS NOT NULL) OR (descripcion IS NOT NULL)))
);


--
-- Name: factura_pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factura_pagos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    factura_id uuid NOT NULL,
    monto numeric(12,2) NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    metodo character varying(30),
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facturas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero bigint NOT NULL,
    contacto_id uuid NOT NULL,
    cotizacion_id uuid,
    estado character varying(20) DEFAULT 'borrador'::character varying NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT facturas_estado_check CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'enviada'::character varying, 'pagada'::character varying, 'vencida'::character varying])::text[])))
);


--
-- Name: facturas_numero_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.facturas_numero_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: facturas_numero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.facturas_numero_seq OWNED BY public.facturas.numero;


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
-- Name: lotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    producto_id uuid NOT NULL,
    almacen_id uuid NOT NULL,
    numero_lote character varying(50),
    cantidad_inicial numeric(12,2) NOT NULL,
    cantidad_actual numeric(12,2) NOT NULL,
    costo_unitario numeric(12,2) DEFAULT 0 NOT NULL,
    fecha_vencimiento date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: movimientos_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimientos_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    producto_id uuid NOT NULL,
    almacen_id uuid NOT NULL,
    lote_id uuid,
    tipo character varying(10) NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    motivo character varying(200) NOT NULL,
    entrada_id uuid,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT movimientos_stock_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['entrada'::character varying, 'salida'::character varying, 'ajuste'::character varying])::text[])))
);


--
-- Name: oportunidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oportunidades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo text NOT NULL,
    contacto_id uuid NOT NULL,
    etapa character varying(20) DEFAULT 'nuevo'::character varying NOT NULL,
    monto_estimado numeric(12,2) DEFAULT 0 NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT oportunidades_etapa_check CHECK (((etapa)::text = ANY ((ARRAY['nuevo'::character varying, 'calificado'::character varying, 'propuesta'::character varying, 'ganado'::character varying, 'perdido'::character varying])::text[])))
);


--
-- Name: pedido_lineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_lineas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pedido_id uuid NOT NULL,
    producto_id uuid NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedidos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero bigint NOT NULL,
    contacto_id uuid NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pedidos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'en_preparacion'::character varying, 'enviado'::character varying, 'entregado'::character varying, 'cancelado'::character varying])::text[])))
);


--
-- Name: pedidos_numero_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedidos_numero_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedidos_numero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedidos_numero_seq OWNED BY public.pedidos.numero;


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
    CONSTRAINT piscinas_estado_check CHECK (((estado)::text = ANY ((ARRAY['operativa'::character varying, 'mantenimiento'::character varying, 'cerrada'::character varying])::text[]))),
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
    CONSTRAINT productos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['bienes'::character varying, 'servicio'::character varying, 'combo'::character varying])::text[])))
);


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proveedores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(150) NOT NULL,
    ruc character varying(20),
    contacto character varying(150),
    telefono character varying(30),
    email character varying(150),
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
-- Name: asientos_contables numero; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asientos_contables ALTER COLUMN numero SET DEFAULT nextval('public.asientos_contables_numero_seq'::regclass);


--
-- Name: cotizaciones numero; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizaciones ALTER COLUMN numero SET DEFAULT nextval('public.cotizaciones_numero_seq'::regclass);


--
-- Name: entradas numero; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas ALTER COLUMN numero SET DEFAULT nextval('public.entradas_numero_seq'::regclass);


--
-- Name: facturas numero; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas ALTER COLUMN numero SET DEFAULT nextval('public.facturas_numero_seq'::regclass);


--
-- Name: pedidos numero; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN numero SET DEFAULT nextval('public.pedidos_numero_seq'::regclass);


--
-- Name: sync_outbox id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_outbox ALTER COLUMN id SET DEFAULT nextval('public.sync_outbox_id_seq'::regclass);


--
-- Data for Name: almacenes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.almacenes (id, nombre, ubicacion, created_at) FROM stdin;
70591ccd-7b96-44d3-a14c-f65ec633cb1f	Almacén Principal	\N	2026-07-15 17:36:40.71408-05
\.


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
-- Data for Name: calendario_evento_empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendario_evento_empleados (evento_id, empleado_id, updated_at) FROM stdin;
8ee1ecdc-09e0-4de2-bf2f-f154d8c0522b	4e6a0bcb-3f7e-5c8d-a2c4-e7b5acc5c6f9	2026-07-16 10:40:28.616921-05
\.


--
-- Data for Name: calendario_eventos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendario_eventos (titulo, fecha, descripcion, created_at, estado, tipo, id, piscina_id, proyecto_id, updated_at) FROM stdin;
BRISEÑO	2026-07-01	Programacion de riego 	2026-07-13 19:00:43.822997	pendiente	recordatorio	8ee1ecdc-09e0-4de2-bf2f-f154d8c0522b	\N	f1b30cad-e0dc-5867-bf91-323fbf08d8bf	2026-07-13 19:00:43.822997-05
\.


--
-- Data for Name: contactos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contactos (nombre, tipo, es_empresa, email, telefono, sitio_web, puesto_trabajo, direccion, identificaciones, etiquetas, contactos_relacionados, notas, created_at, id, updated_at, codigo, nombre_fiscal, fax, movil, persona_contacto, nif, agente, tipo_cliente, ubicacion_url) FROM stdin;
Harry	cliente	t	harry@gmail	946000608			{"zip": "", "pais": "", "calle": "", "calle2": "", "ciudad": "", "estado": "", "distrito": ""}	[]	[]	[]		2026-07-05 20:56:22.216318-05	d142ef26-317d-56bd-aa3b-6b5d29bb6fdb	2026-07-11 15:14:59.630758-05	\N	\N	\N	\N	\N	\N	\N	\N	\N
Billy el poderoso	otro	f		985832096			{"zip": "", "pais": "", "calle": "Mz A lt 9 Nueva gales Cieneguilla", "calle2": "", "ciudad": "", "estado": "", "distrito": ""}	[]	[]	[]		2026-07-13 18:56:12.713652-05	94ed37e9-c0fd-485a-ad1c-fee4a2b33451	2026-07-13 18:56:12.713652-05	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: cotizacion_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cotizacion_lineas (id, cotizacion_id, producto_id, cantidad, precio_unitario, subtotal, descripcion, descripcion_superior, updated_at) FROM stdin;
\.


--
-- Data for Name: cotizaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cotizaciones (id, numero, contacto_id, estado, total, fecha, notas, created_at, updated_at, moneda, lineas_detalle, lineas_modo, lineas_libres) FROM stdin;
b6f7fc59-e3ae-4046-a71f-ff3c53d0da58	10	d142ef26-317d-56bd-aa3b-6b5d29bb6fdb	confirmada	0.00	2026-07-14		2026-07-13 19:11:47.829353-05	2026-07-13 19:12:05.717631-05	PEN	[]	tarjetas	\N
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empleados (nombre, puesto, area, created_at, foto_url, email_trabajo, telefono_trabajo, jefe_directo, dni, dni_foto_url, monto_pago, id, updated_at) FROM stdin;
Harry			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	c5cd0632-9e14-5593-89d6-ac08c593f99c	2026-07-11 15:14:59.630758-05
Billy			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	4e6a0bcb-3f7e-5c8d-a2c4-e7b5acc5c6f9	2026-07-11 15:14:59.630758-05
Jhon			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	66b52108-2089-531c-bf99-80c34a530b9f	2026-07-11 15:14:59.630758-05
Marco			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	374d65b5-5f34-5cb6-b863-eb15cdc62bc4	2026-07-11 15:14:59.630758-05
Raul			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	21f63bd5-c546-5b6b-a0e3-ff0f503aa6cd	2026-07-11 15:14:59.630758-05
Antony			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	472f6b7d-fe4f-5e67-80b4-cb44cd378833	2026-07-11 15:14:59.630758-05
Amador			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	a5c7a01b-43d6-5d2d-a880-a817a94137a9	2026-07-11 15:14:59.630758-05
Jose			2026-07-05 22:54:56.766021-05	\N	\N	\N	Ulices	\N	\N	0.00	8b93c12e-2240-5566-bec3-4f3231fc50d5	2026-07-11 15:14:59.630758-05
Ulices	Jefe		2026-07-05 22:54:56.766021-05	\N	\N	\N	\N	\N	\N	0.00	c5a1a2b1-f683-582f-b851-01e3ad78643c	2026-07-11 15:14:59.630758-05
\.


--
-- Data for Name: entrada_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entrada_lineas (id, entrada_id, producto_id, almacen_id, cantidad, costo_unitario, subtotal, fecha_vencimiento) FROM stdin;
\.


--
-- Data for Name: entradas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entradas (id, numero, proveedor_id, numero_factura_proveedor, estado, total, fecha, notas, created_at, updated_at, moneda) FROM stdin;
\.


--
-- Data for Name: factura_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.factura_lineas (id, factura_id, producto_id, descripcion, cantidad, precio_unitario, subtotal, updated_at) FROM stdin;
\.


--
-- Data for Name: factura_pagos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.factura_pagos (id, factura_id, monto, fecha, metodo, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facturas (id, numero, contacto_id, cotizacion_id, estado, total, fecha, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gastos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gastos (concepto, categoria, monto, fecha, estado, notas, comprobante_url, created_at, id, updated_at) FROM stdin;
\.


--
-- Data for Name: lotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lotes (id, producto_id, almacen_id, numero_lote, cantidad_inicial, cantidad_actual, costo_unitario, fecha_vencimiento, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: movimientos_stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimientos_stock (id, producto_id, almacen_id, lote_id, tipo, cantidad, motivo, entrada_id, fecha, created_at) FROM stdin;
\.


--
-- Data for Name: oportunidades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.oportunidades (id, titulo, contacto_id, etapa, monto_estimado, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pedido_lineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido_lineas (id, pedido_id, producto_id, cantidad, precio_unitario, subtotal, updated_at) FROM stdin;
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedidos (id, numero, contacto_id, estado, total, fecha, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: piscina_consumos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscina_consumos (nombre_externo, cantidad, notas, created_at, id, piscina_id, producto_id, updated_at) FROM stdin;
\N	1	\N	2026-07-08 19:23:58.377284-05	65c89c42-cd87-5b73-bbed-be0aacda6770	1363072c-725a-5da3-b05d-c4f115a416ec	f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2	2026-07-11 15:14:59.630758-05
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
0.00	2026-07-01	2026-07-31	f	\N		2026-07-09 13:56:18.953035-05	a60357e6-0f5b-5334-85a3-b28aa838d3e3	1363072c-725a-5da3-b05d-c4f115a416ec	2026-07-11 15:14:59.630758-05
0.00	2026-07-01	2026-07-31	f	\N		2026-07-09 13:56:28.813652-05	b2e0a4c8-03a2-51d6-ba6b-71a9f986ccb2	1363072c-725a-5da3-b05d-c4f115a416ec	2026-07-11 15:14:59.630758-05
\.


--
-- Data for Name: piscinas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.piscinas (nombre, ubicacion, volumen_m3, estado, nivel_cloro, notas, created_at, frecuencia, precio_mantenimiento, id, contacto_id, updated_at) FROM stdin;
		0.00	operativa	\N		2026-07-08 14:51:31.719776-05	semanal	0.00	1363072c-725a-5da3-b05d-c4f115a416ec	d142ef26-317d-56bd-aa3b-6b5d29bb6fdb	2026-07-11 15:14:59.630758-05
\.


--
-- Data for Name: plan_cuentas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_cuentas (codigo, nombre, tipo, created_at, id, updated_at) FROM stdin;
1000	Caja	activo	2026-07-08 15:58:25.294339-05	e6c8eb16-17f9-52fc-abbb-7f36971f570a	2026-07-11 15:14:59.630758-05
1010	Bancos	activo	2026-07-08 15:58:25.294339-05	c65a99cf-e12d-5d74-84e9-74086cc54e1d	2026-07-11 15:14:59.630758-05
1020	Cuentas por Cobrar	activo	2026-07-08 15:58:25.294339-05	08bec2bd-a8a0-5abb-b35f-0d9839557e19	2026-07-11 15:14:59.630758-05
1030	Inventario de Mercaderías	activo	2026-07-08 15:58:25.294339-05	42dac88b-a716-5576-a1ec-dff1ac565931	2026-07-11 15:14:59.630758-05
1040	Activos Fijos	activo	2026-07-08 15:58:25.294339-05	1242c481-688e-502f-9cb9-7f12e526ac46	2026-07-11 15:14:59.630758-05
2000	Cuentas por Pagar	pasivo	2026-07-08 15:58:25.294339-05	e72ed80c-f9e0-59d1-a1da-06afc35a8191	2026-07-11 15:14:59.630758-05
2010	Impuestos por Pagar	pasivo	2026-07-08 15:58:25.294339-05	536b4b51-1cd0-5be5-b8aa-f77f38afec52	2026-07-11 15:14:59.630758-05
2020	Préstamos por Pagar	pasivo	2026-07-08 15:58:25.294339-05	d24a0457-b5bf-5546-ba3e-ef46cfa11bf6	2026-07-11 15:14:59.630758-05
3000	Capital Social	patrimonio	2026-07-08 15:58:25.294339-05	9b67c169-d4c6-57b4-8f38-9de006b068e5	2026-07-11 15:14:59.630758-05
3010	Resultados Acumulados	patrimonio	2026-07-08 15:58:25.294339-05	77a75c46-82bd-546f-946b-b8b3d4ac30f2	2026-07-11 15:14:59.630758-05
4000	Ventas	ingreso	2026-07-08 15:58:25.294339-05	4a5b180b-2dc0-5388-bad7-49934450937f	2026-07-11 15:14:59.630758-05
4010	Otros Ingresos	ingreso	2026-07-08 15:58:25.294339-05	2039d4bd-441e-5230-a62c-7e3c9a71eb78	2026-07-11 15:14:59.630758-05
5000	Costo de Ventas	gasto	2026-07-08 15:58:25.294339-05	d55babbb-dff9-59dc-a207-9c4ed9304a9e	2026-07-11 15:14:59.630758-05
5010	Gastos Operativos	gasto	2026-07-08 15:58:25.294339-05	3b4cd1a3-0d15-56d6-8402-edeeeba9c118	2026-07-11 15:14:59.630758-05
5020	Gastos de Personal	gasto	2026-07-08 15:58:25.294339-05	2b3a09bd-6559-5cec-81b5-7977730b5973	2026-07-11 15:14:59.630758-05
5030	Gastos Financieros	gasto	2026-07-08 15:58:25.294339-05	7d991356-f736-58d6-ac14-2f4d3932cf74	2026-07-11 15:14:59.630758-05
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (nombre, sku, stock, precio, created_at, favorito, foto_url, vende, compra, es_gasto, tipo, rastrear_inventario, unidad, impuesto_venta, codigo_detraccion, costo, categoria, referencia, codigo_barras, notas_internas, limite_stock, id, updated_at) FROM stdin;
TEE DE 1" S/P INYECTOPLAST	ACC-048	-1	0.00	2026-07-08 16:48:35.329802-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	f2184d14-d793-5542-8093-935bb6e4b137	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 1/2" PVC	ACC-001	100	0.00	2026-07-08 16:48:35.302-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	40d309f7-efe2-5e18-a8b5-a39cf3c19048	2026-07-13 20:50:12.280895-05
CODO DE 1/2" MX INYECTOPLAST	ACC-002	0	0.00	2026-07-08 16:48:35.307804-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	cc5cad1a-732b-528e-a616-b8feee0b7219	2026-07-11 15:14:59.630758-05
CODO DE 1/2" S/P INYECTOPLAST	ACC-003	0	0.00	2026-07-08 16:48:35.308474-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	381542e7-b890-55a3-967f-2c5d087871ab	2026-07-11 15:14:59.630758-05
CODO DE 1/2" S/P PAVCO	ACC-004	0	0.00	2026-07-08 16:48:35.309158-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	91e92481-eb3d-5bd4-be1b-2f2b23d2dd39	2026-07-11 15:14:59.630758-05
CODO DE 1/2" X 45° S/P HECHIZO	ACC-005	0	0.00	2026-07-08 16:48:35.309785-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	75b2b6d6-3c42-5968-936f-cba813162083	2026-07-11 15:14:59.630758-05
TEE DE 1/2" S/P INYECTOPLAST	ACC-006	0	0.00	2026-07-08 16:48:35.310407-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	bde314c9-492d-5e47-95b8-aba976a9043a	2026-07-11 15:14:59.630758-05
TEE DE 1/2" S/P PAVCO	ACC-007	0	0.00	2026-07-08 16:48:35.310987-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7dbe0235-e65e-571a-954f-428f42a3b9fb	2026-07-11 15:14:59.630758-05
UNIÓN DE 1/2" C/R INYECTOPLAST	ACC-008	0	0.00	2026-07-08 16:48:35.311669-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3c7d9d56-d50f-57d2-bc4c-ff95f778eb54	2026-07-11 15:14:59.630758-05
UNIÓN DE 1/2" MX INYECTOPLAST	ACC-009	0	0.00	2026-07-08 16:48:35.312319-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	87813572-acfa-53a9-9abd-573591a23da4	2026-07-11 15:14:59.630758-05
UNIÓN DE 1/2" S/P HECHIZO	ACC-010	0	0.00	2026-07-08 16:48:35.312972-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	760efc73-558f-57fe-8985-8f740656b39f	2026-07-11 15:14:59.630758-05
UNIÓN DE 1/2" S/P INYECTOPLAST	ACC-011	0	0.00	2026-07-08 16:48:35.313452-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	22473a7b-e905-5ca7-bd83-502123019aaa	2026-07-11 15:14:59.630758-05
CURVA DE 3/4" LUZ	ACC-020	0	0.00	2026-07-08 16:48:35.317497-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0376cf0e-311b-5688-8a0d-ccd69f12e153	2026-07-11 15:14:59.630758-05
TEE DE 1" S/P PAVCO	ACC-049	0	0.00	2026-07-08 16:48:35.330233-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	89df1bdb-b965-5f56-8217-a40c8177ba1c	2026-07-11 15:14:59.630758-05
TAPÓN DE 1 1/2" S/P HEM	ACC-114	0	0.00	2026-07-08 16:48:35.359784-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	6fba2f9b-13a2-5111-8ebb-45b7ea3e897e	2026-07-11 15:14:59.630758-05
TAPÓN DE 2" S/P HEM ERA	ACC-115	0	0.00	2026-07-08 16:48:35.360311-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b47be98c-12fe-56b2-aac8-c31c9c413718	2026-07-11 15:14:59.630758-05
UNIÓN DE 1/2" S/P PAVCO	ACC-012	0	0.00	2026-07-08 16:48:35.313933-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	9872caba-4641-5f5e-bf09-e6bd2e9ae09d	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 3/4" PVC	ACC-013	0	0.00	2026-07-08 16:48:35.314387-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	572f9fb9-3be3-55d9-b896-a61198905d65	2026-07-11 15:14:59.630758-05
BUSHING DE 3/4" X 1/2" INYECTOPLAST	ACC-014	0	0.00	2026-07-08 16:48:35.314821-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	cc13ee29-cbe5-52f5-b097-62adb968c2f9	2026-07-11 15:14:59.630758-05
BUSHING DE 3/4" X 1/2" PAVCO	ACC-015	0	0.00	2026-07-08 16:48:35.315262-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	32c8ad44-cb67-5727-9404-b0ade3ad3eb8	2026-07-11 15:14:59.630758-05
CODO DE 3/4" MX INYECTOPLAST	ACC-016	0	0.00	2026-07-08 16:48:35.315705-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3c1e2987-bdc7-5672-9c60-c346cd2ecc30	2026-07-11 15:14:59.630758-05
CODO DE 3/4" S/P INYECTOPLAST	ACC-017	0	0.00	2026-07-08 16:48:35.316151-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	37874425-e7d0-5e8a-bc86-af12a2df4fe6	2026-07-11 15:14:59.630758-05
CODO DE 3/4" S/P PAVCO	ACC-018	0	0.00	2026-07-08 16:48:35.316581-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e9651d08-8f4c-537e-bc7e-8febe75bcf16	2026-07-11 15:14:59.630758-05
CODO DE 3/4" X 45° HECHIZO	ACC-019	0	0.00	2026-07-08 16:48:35.317031-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a9dae332-0c8b-54f5-a5f4-984fefd909bb	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 3/4" X 1/2" C/R (HECHIZO)	ACC-021	0	0.00	2026-07-08 16:48:35.317939-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	99ce1d3e-5e14-54eb-ab08-0aad42b778b7	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 3/4" X 1/2" S/P (HECHIZO)	ACC-022	0	0.00	2026-07-08 16:48:35.31837-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	390f9f80-ed55-5020-85de-7128b039fdc7	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 3/4" X 1/2" S/P PAVCO	ACC-023	0	0.00	2026-07-08 16:48:35.318766-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e07b5382-7cfd-5657-a01c-4051ba7f0a5b	2026-07-11 15:14:59.630758-05
TEE DE 3/4" S/P INYECTOPLAST	ACC-024	0	0.00	2026-07-08 16:48:35.31918-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	d9e94aef-df3d-5db4-88e4-f560d0981a58	2026-07-11 15:14:59.630758-05
TEE DE 3/4" S/P PAVCO	ACC-025	0	0.00	2026-07-08 16:48:35.319606-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	6baf29a4-90cc-5a29-9d6b-d1630f2b78dd	2026-07-11 15:14:59.630758-05
UNIÓN DE 3/4" C/R INYECTOPLAST	ACC-026	0	0.00	2026-07-08 16:48:35.320071-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	49996c70-9223-546d-952c-d256b4418ffc	2026-07-11 15:14:59.630758-05
UNIÓN DE 3/4" MIXTO INYECTOPLAST	ACC-027	0	0.00	2026-07-08 16:48:35.320459-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	99b4ea0e-5cab-5334-bbb6-88224ce45beb	2026-07-11 15:14:59.630758-05
UNIÓN DE 3/4" S/P HECHIZO	ACC-028	0	0.00	2026-07-08 16:48:35.320833-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3a3eec23-75ae-53c7-9106-227d535d5f39	2026-07-11 15:14:59.630758-05
UNIÓN DE 3/4" S/P INYECTOPLAST	ACC-029	0	0.00	2026-07-08 16:48:35.321275-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b46ec589-2b62-5ab4-93cd-1377bcab828d	2026-07-11 15:14:59.630758-05
UNIÓN DE 3/4" S/P PAVCO	ACC-030	0	0.00	2026-07-08 16:48:35.32172-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7e52bb7f-91da-56ef-8f67-8826b85571a1	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 1" PAVCO	ACC-031	0	0.00	2026-07-08 16:48:35.322147-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	77642961-99c3-5ab9-9c8a-7cf71901a31c	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 1" PVC	ACC-032	0	0.00	2026-07-08 16:48:35.322561-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4d0b8c17-4cf1-584b-bb6f-946308d9bd67	2026-07-11 15:14:59.630758-05
BUSHING DE 1" X 1/2" INYECTOPLAST	ACC-033	0	0.00	2026-07-08 16:48:35.322984-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c0ba6de3-ab23-5fbc-84fa-df046e7de64b	2026-07-11 15:14:59.630758-05
BUSHING DE 1" X 1/2" PAVCO	ACC-034	0	0.00	2026-07-08 16:48:35.323426-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8b125c01-d3d2-5267-85dd-87c40b4d6dce	2026-07-11 15:14:59.630758-05
BUSHING DE 1" X 3/4" INYECTOPLAST	ACC-035	0	0.00	2026-07-08 16:48:35.323876-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7453c0a6-eba9-5205-ac4a-8e62f4f916fe	2026-07-11 15:14:59.630758-05
TAPÓN DE 2" C/R HEM ERA	ACC-116	0	0.00	2026-07-08 16:48:35.360677-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	29e5f975-e94f-5e97-8337-b6490bb08499	2026-07-11 15:14:59.630758-05
TAPÓN DE 3" S/P HEM ERA	ACC-117	0	0.00	2026-07-08 16:48:35.361082-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	dc7957da-6ba3-55ca-90df-ff06a426c130	2026-07-11 15:14:59.630758-05
BUSHING DE 1" X 3/4" PAVCO	ACC-036	0	0.00	2026-07-08 16:48:35.324298-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2d897a75-6aca-523c-9a5b-480ca0c16fed	2026-07-11 15:14:59.630758-05
CODO DE 1" S/P INYECTOPLAST	ACC-037	0	0.00	2026-07-08 16:48:35.324724-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	43986777-f738-577f-af1c-e80c7390902b	2026-07-11 15:14:59.630758-05
CODO DE 1" S/P PAVCO	ACC-038	0	0.00	2026-07-08 16:48:35.325404-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a5a9cd9b-3cc3-5f56-8a73-7fb21219698a	2026-07-11 15:14:59.630758-05
CODO DE 1" X 45° HECHIZO	ACC-039	0	0.00	2026-07-08 16:48:35.325819-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	3b13c771-120f-52f6-ad09-99d9803d4db9	2026-07-11 15:14:59.630758-05
CODO DE 1" X 45° INYECTOPLAST	ACC-040	0	0.00	2026-07-08 16:48:35.326212-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	78f0e96c-f9da-5ad4-b3b8-272f1f53d683	2026-07-11 15:14:59.630758-05
CURVA DE 1" LUZ	ACC-041	0	0.00	2026-07-08 16:48:35.326632-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0480012b-36e6-5c17-b2c7-830cdf871eca	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1" X 1/2"  C/R	ACC-042	0	0.00	2026-07-08 16:48:35.327176-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	65e5b0df-424a-5616-92e3-2f99addc4d32	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1" X 1/2" PAVCO	ACC-043	0	0.00	2026-07-08 16:48:35.327628-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	83afd834-715f-5c16-b25a-a95f1dd215f2	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1" X 1/2" S/P	ACC-044	0	0.00	2026-07-08 16:48:35.32808-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	938c79dd-a78b-52fe-b5b1-7dc8c3402e27	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1" X 3/4" C/R	ACC-045	0	0.00	2026-07-08 16:48:35.328498-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c871218e-0326-53d9-a009-71688b4a6036	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1" X 3/4" PAVCO	ACC-046	0	0.00	2026-07-08 16:48:35.328935-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	cd8a5a14-1c4c-5b84-b060-08a817f45117	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1" X 3/4" S/P	ACC-047	0	0.00	2026-07-08 16:48:35.329376-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	68c758fc-c132-589d-8922-d6026f6eda2b	2026-07-11 15:14:59.630758-05
UNIÓN DE 1" C/R INYECTOPLAST	ACC-050	0	0.00	2026-07-08 16:48:35.331342-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1a1e22be-f271-52bd-a3ef-2a8557e9ae09	2026-07-11 15:14:59.630758-05
UNIÓN DE 1" MX INYECTOPLAST	ACC-051	0	0.00	2026-07-08 16:48:35.331814-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	ed3ea75a-5278-5456-9d04-437ccf02d49e	2026-07-11 15:14:59.630758-05
UNIÓN DE 1" S/P HECHIZO	ACC-052	0	0.00	2026-07-08 16:48:35.332281-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b0cc10af-6bd3-5db2-b767-bde9f7f44585	2026-07-11 15:14:59.630758-05
UNIÓN DE 1" S/P INYECTOPLAST	ACC-053	0	0.00	2026-07-08 16:48:35.33271-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	d5867674-d4e4-5b33-bf2c-bf34edfd5dfc	2026-07-11 15:14:59.630758-05
UNIÓN DE 1" S/P PAVCO	ACC-054	0	0.00	2026-07-08 16:48:35.333144-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	fbae89c5-c2b7-5474-ac58-670f2b75cf33	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 1 1/4"	ACC-055	0	0.00	2026-07-08 16:48:35.333547-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c4c9b9d2-56ff-5b1e-a245-b1facf78c2bf	2026-07-11 15:14:59.630758-05
CODO DE 1 1/4" S/P INY	ACC-056	0	0.00	2026-07-08 16:48:35.333952-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b31cbc61-31e9-5a74-9a3b-301797e1ba2a	2026-07-11 15:14:59.630758-05
CODO DE 1 1/4" S/P PAVCO	ACC-057	0	0.00	2026-07-08 16:48:35.334356-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	6bc0da10-1394-5d66-9305-5cd508cff2a6	2026-07-11 15:14:59.630758-05
TEE DE 1 1/4"	ACC-058	0	0.00	2026-07-08 16:48:35.334804-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	64351fee-56ae-543c-86a3-29fdf973385b	2026-07-11 15:14:59.630758-05
REDUCCIÓN 1 1/4" X 1" C/R	ACC-059	0	0.00	2026-07-08 16:48:35.335202-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7123701e-bc4e-5456-9042-4e0b7d77421a	2026-07-11 15:14:59.630758-05
REDUCCIÓN 1 1/4" X 1" S/P	ACC-060	0	0.00	2026-07-08 16:48:35.335617-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	eb46241c-803d-5560-9ad0-16da41bbc89a	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 1 1/2"	ACC-062	0	0.00	2026-07-08 16:48:35.336458-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0ebec45b-3a42-5153-9553-bd1c747f23d5	2026-07-11 15:14:59.630758-05
CODO DE 1 1/2" S/P INYECTOPLAST	ACC-064	0	0.00	2026-07-08 16:48:35.337394-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	426afc45-d4d5-5e20-b286-5132bd35c5e8	2026-07-11 15:14:59.630758-05
CODO DE 1 1/2" S/P PAVCO	ACC-065	0	0.00	2026-07-08 16:48:35.337814-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e3b897ae-b9d3-5aaf-9462-daf834c8c088	2026-07-11 15:14:59.630758-05
CODO DE 1 1/2" X 45° HECHIZO	ACC-066	0	0.00	2026-07-08 16:48:35.338302-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1a9210ee-bdf4-5795-aab4-dbe2542aedd4	2026-07-11 15:14:59.630758-05
CODO DE 1 1/2" X 45° S/P ERA	ACC-067	0	0.00	2026-07-08 16:48:35.338752-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	48a15ed1-5b22-54a7-8c32-e0744a9b60f1	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1 1/2" X 1" C/R	ACC-068	0	0.00	2026-07-08 16:48:35.339238-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	31b0f73a-f7fa-534e-94eb-bd1e68f160c6	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1 1/2" X 1" S/P	ACC-069	0	0.00	2026-07-08 16:48:35.339652-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4c2fcba8-2426-54ff-9fd7-08d3557837af	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1 1/2" X 1/2" C/R	ACC-070	0	0.00	2026-07-08 16:48:35.340085-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2889229d-6e81-5dd2-8901-09cb2f5fc48b	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1 1/2" X 1/2" S/P	ACC-071	0	0.00	2026-07-08 16:48:35.340487-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	46f66b10-9c5d-5246-8ea4-1cc34b02baa3	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1 1/2" X 3/4" C/R	ACC-072	0	0.00	2026-07-08 16:48:35.340883-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b5398bfc-2831-548f-8d49-ca164bba11c4	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 1 1/2" X 3/4" S/P	ACC-073	0	0.00	2026-07-08 16:48:35.34128-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	78109a30-d5ea-5b55-8e7b-f112d6a7989b	2026-07-11 15:14:59.630758-05
TEE DE 1 1/2" S/P ERA	ACC-074	0	0.00	2026-07-08 16:48:35.341718-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b5c77901-6f06-5693-bb83-646b48a7df54	2026-07-11 15:14:59.630758-05
TEE DE 1 1/2" S/P INYECTOPLAST	ACC-075	0	0.00	2026-07-08 16:48:35.342211-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	37f14383-509c-5367-b426-d17b22e25eda	2026-07-11 15:14:59.630758-05
TEE DE 1 1/2" S/P PAVCO	ACC-076	0	0.00	2026-07-08 16:48:35.342741-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0826dae6-3103-5764-b57e-e59be2d61871	2026-07-11 15:14:59.630758-05
UNIÓN DE 1 1/2" S/P INYECTOPLAST	ACC-077	0	0.00	2026-07-08 16:48:35.343188-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	613475e7-ef03-5ffe-805e-e414fcb5cd3a	2026-07-11 15:14:59.630758-05
UNIÓN DE 1 1/2" S/P PAVCO	ACC-078	0	0.00	2026-07-08 16:48:35.343619-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2910dcf9-d4dd-59cc-af84-8a2e4a36b263	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 2"	ACC-079	0	0.00	2026-07-08 16:48:35.344058-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	99f2a75e-eb02-5dc0-ba43-4cf8d28ea026	2026-07-11 15:14:59.630758-05
CODO DE 2" S/P ERA	ACC-080	0	0.00	2026-07-08 16:48:35.344481-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0d273e7a-9ed0-5fa9-9afc-c59a763f0be4	2026-07-11 15:14:59.630758-05
CODO DE 2" S/P INYECTOPLAST	ACC-081	0	0.00	2026-07-08 16:48:35.344872-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8d1f0c86-5abb-5f6d-a4db-86407c98185e	2026-07-11 15:14:59.630758-05
CODO DE 2" S/P PAVCO	ACC-082	0	0.00	2026-07-08 16:48:35.345547-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1756fe94-47be-5bcd-90b5-840756033066	2026-07-11 15:14:59.630758-05
CODO DE 2" X 45° S/P ERA	ACC-083	0	0.00	2026-07-08 16:48:35.346037-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5505c592-f222-513e-9300-8194feaa3ae7	2026-07-11 15:14:59.630758-05
CODO DE 2" X 45° S/P HECHIZO	ACC-084	0	0.00	2026-07-08 16:48:35.346507-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8cd39b4b-0a87-575c-9981-a308feb17259	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE  2" X 1 1/2" C/R	ACC-085	0	0.00	2026-07-08 16:48:35.34704-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	df5ee723-d9b5-5e5c-9238-2ce0a027b591	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE  2" X 1 1/2" S/P	ACC-086	0	0.00	2026-07-08 16:48:35.347505-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	277eb69e-1289-51e2-b7bc-edf74d5736c0	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE  2" X 1/2" C/R	ACC-087	0	0.00	2026-07-08 16:48:35.34795-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	473c4088-be47-53af-9166-b535d87a5a13	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE  2" X 1/2" S/P	ACC-088	0	0.00	2026-07-08 16:48:35.348428-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c3829407-2470-57c5-9ef2-f027a327675d	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE  2" X 3/4" C/R	ACC-089	0	0.00	2026-07-08 16:48:35.348834-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8c8d88d1-41ae-5202-9182-8c224e1c8ec7	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE  2" X 3/4" S/P	ACC-090	0	0.00	2026-07-08 16:48:35.349318-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	976209aa-82f1-5a44-8f80-b36cb9e3e234	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 2" X 1" C/R	ACC-091	0	0.00	2026-07-08 16:48:35.349743-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	fa2f987a-73b7-5102-a9ac-80a6eeaa8e0d	2026-07-11 15:14:59.630758-05
REDUCCIÓN DE 2" X 1" S/P	ACC-092	0	0.00	2026-07-08 16:48:35.35017-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	675b5ce6-000b-5d88-8f40-afa4ac8f7028	2026-07-11 15:14:59.630758-05
TEE DE 2" S/P ERA	ACC-093	0	0.00	2026-07-08 16:48:35.350577-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c556ca43-1b69-5854-99ff-345141513c57	2026-07-11 15:14:59.630758-05
TEE DE 2" S/P INYECTOPLAST	ACC-094	0	0.00	2026-07-08 16:48:35.350988-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	70349a12-ee8f-54da-af7d-617e35517610	2026-07-11 15:14:59.630758-05
TEE DE 2" S/P PAVCO	ACC-095	0	0.00	2026-07-08 16:48:35.351374-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	02c6b755-3f6d-5015-a52e-202afd068228	2026-07-11 15:14:59.630758-05
UNIÓN DE 2" S/P INYECTOPLAST	ACC-096	0	0.00	2026-07-08 16:48:35.351764-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a4ae5c14-6f49-5420-965a-29b588243734	2026-07-11 15:14:59.630758-05
UNIÓN DE 2" S/P PAVCO	ACC-097	0	0.00	2026-07-08 16:48:35.352182-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	51328acf-30eb-5aa5-b294-837207b690a8	2026-07-11 15:14:59.630758-05
TEE DE 3" S/P ERA	ACC-098	0	0.00	2026-07-08 16:48:35.352566-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	d24d37fe-2076-559f-a539-5cc50aa5e468	2026-07-11 15:14:59.630758-05
CODO DE 3" S/P ERA	ACC-099	0	0.00	2026-07-08 16:48:35.352923-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7a627a58-497f-55a1-91ae-5b362092b27d	2026-07-11 15:14:59.630758-05
CODO DE 3" X 45° S/P ERA	ACC-100	0	0.00	2026-07-08 16:48:35.353366-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	895f344c-c2a7-5f6d-86f7-363975030473	2026-07-11 15:14:59.630758-05
CINTA AISLANTE 3M	ACC-101	0	0.00	2026-07-08 16:48:35.353759-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a42a170c-d142-5b01-bbb8-725ff1481341	2026-07-11 15:14:59.630758-05
CINTA TEFLÓN	ACC-102	0	0.00	2026-07-08 16:48:35.354291-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	fe65c97a-47ed-5766-936f-eae5a44fdbf3	2026-07-11 15:14:59.630758-05
PEGAMENTO DE 1/32 AZUL	ACC-103	0	0.00	2026-07-08 16:48:35.354902-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	26d6dc7e-1fcb-5008-9b03-1e73064c253a	2026-07-11 15:14:59.630758-05
PEGAMENTO DE 1/32 DORADO	ACC-104	0	0.00	2026-07-08 16:48:35.355486-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5e1a7eb5-5644-5189-bafc-1873d1aeec6e	2026-07-11 15:14:59.630758-05
PEGAMENTO DE 1/4 DORADO	ACC-105	0	0.00	2026-07-08 16:48:35.355914-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	c7706c29-e09c-5cab-892a-60385cab5678	2026-07-11 15:14:59.630758-05
PEGAMENTO DE 1/4 NEGRO	ACC-106	0	0.00	2026-07-08 16:48:35.356331-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	343d3e1b-6e56-5d66-a4d8-61559df55a61	2026-07-11 15:14:59.630758-05
TAPÓN DE 1/2" S/P HEM	ACC-107	0	0.00	2026-07-08 16:48:35.35676-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	9936fdc6-d62d-5848-a355-8067c2d98375	2026-07-11 15:14:59.630758-05
TAPÓNDE 1/2" C/R HEM	ACC-108	0	0.00	2026-07-08 16:48:35.357192-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	50635ee0-6fe2-5caa-9043-e696a8d73dc9	2026-07-11 15:14:59.630758-05
TAPÓN DE  3/4" S/P HEM	ACC-109	0	0.00	2026-07-08 16:48:35.357605-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0a757210-25b3-5e11-8789-db5ef24ca8f1	2026-07-11 15:14:59.630758-05
TAPÓN DE  3/4" C/R HEM	ACC-110	0	0.00	2026-07-08 16:48:35.358021-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	07e39420-bfc4-5506-88fc-fbea80a367bb	2026-07-11 15:14:59.630758-05
TAPÓN DE 1" C/R HEM	ACC-111	0	0.00	2026-07-08 16:48:35.358533-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2cd91b16-9e02-523b-9b49-3c5f50b58068	2026-07-11 15:14:59.630758-05
TAPÓN DE 1" S/P HEM	ACC-112	0	0.00	2026-07-08 16:48:35.358918-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	364af1ec-e913-5ca0-b535-2b5a6e981c1a	2026-07-11 15:14:59.630758-05
TAPÓN DE 1 1/2" C/R HEM	ACC-113	0	0.00	2026-07-08 16:48:35.359382-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	63be48da-170c-51ef-9f2f-5c8140f1abc9	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1/2" C/R	ACC-118	0	0.00	2026-07-08 16:48:35.361458-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	34c0ae40-8eae-5288-a3f7-6ad06241ba3e	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1/2" S/P	ACC-119	0	0.00	2026-07-08 16:48:35.361833-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	7a1ebb26-5b4f-5c83-9285-659ad7c58bb5	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 3/4" C/R	ACC-120	0	0.00	2026-07-08 16:48:35.362256-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e050958a-3542-5ea8-b405-4a3140a09e99	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 3/4" S/P	ACC-121	0	0.00	2026-07-08 16:48:35.362671-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	128f6352-dc01-5e85-a197-c1867e1167a6	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1" C/R	ACC-122	0	0.00	2026-07-08 16:48:35.363148-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0c842fa2-c56d-5519-9a36-288f9618a19d	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1" S/P	ACC-123	0	0.00	2026-07-08 16:48:35.363559-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	bd8567e8-83e6-515e-904b-6de1b6d4e7c6	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1 1/2" C/R	ACC-124	0	0.00	2026-07-08 16:48:35.36393-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	62b795c2-93f2-54e3-b4a1-c318774ec84e	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1 1/2" S/P	ACC-125	0	0.00	2026-07-08 16:48:35.364336-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5d8dc9a9-99f1-531c-8212-9756067631c3	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1 1/4" C/R	ACC-126	0	0.00	2026-07-08 16:48:35.365027-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	019ba977-8e2b-52bb-b771-17ff4caf278f	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 1 1/4" S/P	ACC-127	0	0.00	2026-07-08 16:48:35.365442-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4c2383ba-e5ae-5260-ac64-f0be3a5233ab	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 2" C/R	ACC-128	0	0.00	2026-07-08 16:48:35.36587-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	a2bcc95d-d211-5757-9a30-3fc45ebc9c2d	2026-07-11 15:14:59.630758-05
UNIÓN UNIVERSAL DE 2" S/P	ACC-129	0	0.00	2026-07-08 16:48:35.366281-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	191fdea1-312e-5790-ab06-0c8f29872019	2026-07-11 15:14:59.630758-05
VÁLVULA DE PASO DE 1/2" S/P SANKING	ACC-130	0	0.00	2026-07-08 16:48:35.36668-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	1d0c6d97-68ac-5e42-a1c6-4e26822fd2e4	2026-07-11 15:14:59.630758-05
VÁLVULA DE PASO DE 3/4" S/P SANKING	ACC-131	0	0.00	2026-07-08 16:48:35.367063-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	661ed685-141d-50a9-8d30-b5481b6ecdb7	2026-07-11 15:14:59.630758-05
VÁLVULA DE PASO DE 1" S/P SANKING	ACC-132	0	0.00	2026-07-08 16:48:35.367462-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5a563239-ed7d-5f66-bcce-1c294b0201bd	2026-07-11 15:14:59.630758-05
VÁLVULA DE PASO DE 1 1/2" S/P SANKING	ACC-133	0	0.00	2026-07-08 16:48:35.367884-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	5d47f643-ee7f-54d4-80bd-65590e493290	2026-07-11 15:14:59.630758-05
VÁLVULA DE PASO DE 2" S/P SANKING	ACC-134	0	0.00	2026-07-08 16:48:35.368274-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	922f85c4-e5c7-53fd-9275-ef2dba106106	2026-07-11 15:14:59.630758-05
BOQUILLA 4 VAN AJUSTABLE AMARILLO RAIN BIRD	ACC-135	0	0.00	2026-07-08 16:48:35.36868-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	b3a441a5-1f4d-5574-906c-3a023b41cfcb	2026-07-11 15:14:59.630758-05
BOQUILLA 6 VAN AJUSTABLE NARANJA RAIN BIRD	ACC-136	0	0.00	2026-07-08 16:48:35.369133-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	35cd7882-7a27-5b56-8688-123a291d4f03	2026-07-11 15:14:59.630758-05
BOQUILLA 8 VAN AJUSTABLE VERDE RAIN BIRD	ACC-137	0	0.00	2026-07-08 16:48:35.369609-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	4515e9da-a481-5799-bbf8-767ecc6a084d	2026-07-11 15:14:59.630758-05
BOQUILLA 10 VAN AJUSTABLE AZUL RAIN BIRD	ACC-138	0	0.00	2026-07-08 16:48:35.37007-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	0430b658-b059-5d51-8763-c5887bc26c19	2026-07-11 15:14:59.630758-05
BOQUILLA 12 VAN AJUSTABLE MARRON RAIN BIRD	ACC-139	0	0.00	2026-07-08 16:48:35.370458-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	e17c498b-09c4-5be0-8838-e643ae616810	2026-07-11 15:14:59.630758-05
BOQUILLA 4 A AJUSTABLE HUNTER	ACC-140	0	0.00	2026-07-08 16:48:35.370831-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	76231af3-1071-516f-9986-f05216c562da	2026-07-11 15:14:59.630758-05
BOQUILLA 6 A AJUSTABLE HUNTER	ACC-141	0	0.00	2026-07-08 16:48:35.3712-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	53665884-a8b4-589b-84b6-441cd7d86904	2026-07-11 15:14:59.630758-05
BOQUILLA 8 A AJUSTABLE HUNTER	ACC-142	0	0.00	2026-07-08 16:48:35.371573-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	2e85468b-0b08-5828-888b-41579c6c4b57	2026-07-11 15:14:59.630758-05
BOQUILLA 10 A AJUSTABLE HUNTER	ACC-143	0	0.00	2026-07-08 16:48:35.371961-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	8a4457cf-6ae8-50c1-a8ed-c5fcacab53f0	2026-07-11 15:14:59.630758-05
CODO DE 1 1/2" S/P ERA	ACC-063	-4	0.00	2026-07-08 16:48:35.336946-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	93c7236b-7274-58cc-8e79-291f1706e4be	2026-07-11 15:14:59.630758-05
ADAPTADOR DE 1 1/2 ERA	ACC-061	0	0.00	2026-07-08 16:48:35.336-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00		\N	\N		10	34511404-c08a-5451-b2fe-bc875d6e5a80	2026-07-16 11:41:41.505811-05
BOQUILLA 12 A AJUSTABLE HUNTER	ACC-144	-1	0.00	2026-07-08 16:48:35.372-05	f	\N	t	f	f	bienes	t	Unidad	\N	\N	0.00	\N	\N	\N	\N	10	f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2	2026-07-16 19:53:59.781621-05
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proveedores (id, nombre, ruc, contacto, telefono, email, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proyecto_empleados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_empleados (proyecto_id, empleado_id, updated_at) FROM stdin;
18ba31e5-6b1b-5f99-a316-8d9ed10ab398	c5cd0632-9e14-5593-89d6-ac08c593f99c	2026-07-11 15:14:59.630758-05
f1b30cad-e0dc-5867-bf91-323fbf08d8bf	374d65b5-5f34-5cb6-b863-eb15cdc62bc4	2026-07-11 15:14:59.630758-05
\.


--
-- Data for Name: proyecto_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyecto_items (nombre_externo, cantidad, justificacion, created_at, id, proyecto_id, producto_id, updated_at) FROM stdin;
\N	1	\N	2026-07-05 23:36:59.82473	e5dfc08c-9df0-5b26-ba46-24dfaf7a5087	18ba31e5-6b1b-5f99-a316-8d9ed10ab398	\N	2026-07-11 15:14:59.630758-05
MANOMETRO	1	1234	2026-07-08 18:49:54.850774	f04a546e-9673-5d8c-8a57-c66707729f62	f1b30cad-e0dc-5867-bf91-323fbf08d8bf	\N	2026-07-11 15:14:59.630758-05
\N	1	\N	2026-07-08 18:47:59.805756	02b1ca0c-09a3-5fef-ac25-902095864cb6	f1b30cad-e0dc-5867-bf91-323fbf08d8bf	f2184d14-d793-5542-8093-935bb6e4b137	2026-07-11 15:14:59.630758-05
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyectos (nombre, estado, created_at, id, updated_at) FROM stdin;
OMAR	en_progreso	2026-07-05 23:36:31.023452	18ba31e5-6b1b-5f99-a316-8d9ed10ab398	2026-07-11 15:14:59.630758-05
harry	en_progreso	2026-07-07 22:34:28.39086	8a382110-66d5-593a-bf3d-44f335189c05	2026-07-11 15:14:59.630758-05
BRISEÑO	en_progreso	2026-07-08 18:47:59.789192	f1b30cad-e0dc-5867-bf91-323fbf08d8bf	2026-07-11 15:14:59.630758-05
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
15	usuarios	DELETE	{"id": 8, "username": "preview_test", "created_at": "2026-07-09T23:55:53.388862-05:00", "password_hash": "$2b$10$6OGuHoGqMQG1b/Q2dbtDiOc478QJpo1T/k/F7YrGVbuDi0VOHn7N6", "nombre_completo": "Preview Test"}	2026-07-09 23:59:41.643611-05	\N	5	invalid input syntax for type uuid: "8"
16	usuarios	INSERT	{"id": 9, "username": "preview_test", "created_at": "2026-07-10T00:05:36.178061-05:00", "password_hash": "$2b$10$7gqjqaESkoIJVCM9riaSDOtK80qW2ybdLJ/tAk2tSQO.FGo05787C", "nombre_completo": "Preview Test"}	2026-07-10 00:05:36.178061-05	\N	5	invalid input syntax for type uuid: "9"
17	usuarios	DELETE	{"id": 9, "username": "preview_test", "created_at": "2026-07-10T00:05:36.178061-05:00", "password_hash": "$2b$10$7gqjqaESkoIJVCM9riaSDOtK80qW2ybdLJ/tAk2tSQO.FGo05787C", "nombre_completo": "Preview Test"}	2026-07-10 00:06:41.871027-05	\N	5	invalid input syntax for type uuid: "9"
20	oportunidades	INSERT	{"id": "64257c4e-69dd-4f19-b8b9-a19e37327680", "etapa": "nuevo", "notas": "smoke test", "titulo": "Prueba CRM", "created_at": "2026-07-11T15:29:13.670644-05:00", "updated_at": "2026-07-11T15:29:13.670644-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 1500.00}	2026-07-11 15:29:13.670644-05	\N	5	relation "oportunidades" does not exist
21	cotizaciones	INSERT	{"id": "cb403f21-9cec-4499-9f56-22d75c52d635", "fecha": "2026-07-11", "notas": "smoke test", "total": 100.00, "estado": "borrador", "numero": 1, "created_at": "2026-07-11T15:29:13.713851-05:00", "updated_at": "2026-07-11T15:29:13.713851-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-11 15:29:13.713851-05	\N	5	relation "cotizaciones" does not exist
22	cotizacion_lineas	INSERT	{"id": "4ec22da6-87a0-4e45-b6f3-54d6adb90ea9", "cantidad": 2.00, "subtotal": 100.00, "producto_id": "f2184d14-d793-5542-8093-935bb6e4b137", "cotizacion_id": "cb403f21-9cec-4499-9f56-22d75c52d635", "precio_unitario": 50.00}	2026-07-11 15:29:13.713851-05	\N	5	relation "cotizacion_lineas" does not exist
23	oportunidades	DELETE	{"id": "64257c4e-69dd-4f19-b8b9-a19e37327680", "etapa": "nuevo", "notas": "smoke test", "titulo": "Prueba CRM", "created_at": "2026-07-11T15:29:13.670644-05:00", "updated_at": "2026-07-11T15:29:13.670644-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 1500.00}	2026-07-11 15:29:13.735853-05	\N	5	relation "oportunidades" does not exist
25	cotizacion_lineas	DELETE	{"id": "4ec22da6-87a0-4e45-b6f3-54d6adb90ea9", "cantidad": 2.00, "subtotal": 100.00, "producto_id": "f2184d14-d793-5542-8093-935bb6e4b137", "cotizacion_id": "cb403f21-9cec-4499-9f56-22d75c52d635", "precio_unitario": 50.00}	2026-07-11 15:29:13.737953-05	\N	5	relation "cotizacion_lineas" does not exist
27	contactos	DELETE	{"id": "f9f04445-b9d9-4b21-b34a-d3f020e670e1", "fax": null, "nif": null, "tipo": "proveedor", "email": "qa@prueba.com", "movil": "666-5678", "notas": "", "agente": null, "codigo": null, "nombre": "Cliente de Prueba QA", "telefono": "555-1234", "direccion": {}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-12T21:10:06.875611-05:00", "es_empresa": false, "updated_at": "2026-07-12T21:10:06.875611-05:00", "tipo_cliente": null, "nombre_fiscal": null, "puesto_trabajo": "", "identificaciones": [], "persona_contacto": "Juan QA", "contactos_relacionados": []}	2026-07-12 21:11:32.441335-05	2026-07-13 18:32:49.046447-05	0	\N
28	oportunidades	INSERT	{"id": "acc9b173-d398-4639-b331-7a8e03c0d71e", "etapa": "nuevo", "notas": "", "titulo": "QA Oportunidad Kanban", "created_at": "2026-07-13T09:30:02.063357-05:00", "updated_at": "2026-07-13T09:30:02.063357-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 1234.50}	2026-07-13 09:30:02.063357-05	\N	5	relation "oportunidades" does not exist
29	oportunidades	DELETE	{"id": "acc9b173-d398-4639-b331-7a8e03c0d71e", "etapa": "nuevo", "notas": "", "titulo": "QA Oportunidad Kanban", "created_at": "2026-07-13T09:30:02.063357-05:00", "updated_at": "2026-07-13T09:30:02.063357-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 1234.50}	2026-07-13 09:30:27.128778-05	\N	5	relation "oportunidades" does not exist
30	oportunidades	INSERT	{"id": "611d76b6-4cb6-4fc7-9e48-27d8ceedb1f6", "etapa": "nuevo", "notas": "", "titulo": "QA Oportunidad Kanban", "created_at": "2026-07-13T09:34:09.3888-05:00", "updated_at": "2026-07-13T09:34:09.3888-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 1234.50}	2026-07-13 09:34:09.3888-05	\N	5	relation "oportunidades" does not exist
31	oportunidades	UPDATE	{"id": "611d76b6-4cb6-4fc7-9e48-27d8ceedb1f6", "etapa": "propuesta", "notas": "", "titulo": "QA Oportunidad Kanban", "created_at": "2026-07-13T09:34:09.3888-05:00", "updated_at": "2026-07-13T09:34:11.770217-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 1234.50}	2026-07-13 09:34:11.770217-05	\N	5	relation "oportunidades" does not exist
32	oportunidades	DELETE	{"id": "611d76b6-4cb6-4fc7-9e48-27d8ceedb1f6", "etapa": "propuesta", "notas": "", "titulo": "QA Oportunidad Kanban", "created_at": "2026-07-13T09:34:09.3888-05:00", "updated_at": "2026-07-13T09:34:11.770217-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 1234.50}	2026-07-13 09:34:12.880115-05	\N	5	relation "oportunidades" does not exist
33	oportunidades	INSERT	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:36:14.835763-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:36:14.835763-05	\N	5	relation "oportunidades" does not exist
34	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:36:28.317674-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:36:28.317674-05	\N	5	relation "oportunidades" does not exist
35	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "propuesta", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:36:29.551103-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:36:29.551103-05	\N	5	relation "oportunidades" does not exist
36	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "ganado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:36:30.299931-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:36:30.299931-05	\N	5	relation "oportunidades" does not exist
37	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "perdido", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:36:31.916616-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:36:31.916616-05	\N	5	relation "oportunidades" does not exist
38	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:36:33.524304-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:36:33.524304-05	\N	5	relation "oportunidades" does not exist
39	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:38:41.768188-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:38:41.768188-05	\N	5	relation "oportunidades" does not exist
40	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "propuesta", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:38:42.880694-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:38:42.880694-05	\N	5	relation "oportunidades" does not exist
41	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:38:43.908361-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:38:43.908361-05	\N	5	relation "oportunidades" does not exist
42	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:43:30.417601-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:43:30.417601-05	\N	5	relation "oportunidades" does not exist
45	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "propuesta", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:43:32.825579-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:43:32.825579-05	\N	5	relation "oportunidades" does not exist
46	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:43:34.016959-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:43:34.016959-05	\N	5	relation "oportunidades" does not exist
47	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:43:34.4968-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:43:34.4968-05	\N	5	relation "oportunidades" does not exist
49	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:44:25.254478-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:44:25.254478-05	\N	5	relation "oportunidades" does not exist
50	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:44:25.932211-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:44:25.932211-05	\N	5	relation "oportunidades" does not exist
51	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:55:24.58779-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:55:24.58779-05	\N	5	relation "oportunidades" does not exist
52	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:55:25.025505-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:55:25.025505-05	\N	5	relation "oportunidades" does not exist
53	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:55:25.56218-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:55:25.56218-05	\N	5	relation "oportunidades" does not exist
54	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:56:49.455383-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:56:49.455383-05	\N	5	relation "oportunidades" does not exist
55	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:56:50.092956-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:56:50.092956-05	\N	5	relation "oportunidades" does not exist
56	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T10:04:24.692655-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:04:24.692655-05	\N	5	relation "oportunidades" does not exist
58	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdaswaaaaaaaaaaaaaaaaa", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T10:16:32.734037-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:16:32.734037-05	\N	5	relation "oportunidades" does not exist
59	oportunidades	INSERT	{"id": "9f39a631-650d-4589-a481-1edeaa4dad57", "etapa": "nuevo", "notas": "", "titulo": "hasdaswaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "created_at": "2026-07-13T10:18:23.521573-05:00", "updated_at": "2026-07-13T10:18:23.521573-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:18:23.521573-05	\N	5	relation "oportunidades" does not exist
60	oportunidades	DELETE	{"id": "9f39a631-650d-4589-a481-1edeaa4dad57", "etapa": "nuevo", "notas": "", "titulo": "hasdaswaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "created_at": "2026-07-13T10:18:23.521573-05:00", "updated_at": "2026-07-13T10:18:23.521573-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:18:25.271852-05	\N	5	relation "oportunidades" does not exist
61	oportunidades	DELETE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdaswaaaaaaaaaaaaaaaaa", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T10:16:32.734037-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:26:46.930188-05	\N	5	relation "oportunidades" does not exist
62	oportunidades	INSERT	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:38:56.147479-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:38:56.147479-05	\N	5	relation "oportunidades" does not exist
63	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:38:57.231795-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:38:57.231795-05	\N	5	relation "oportunidades" does not exist
64	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:38:59.454976-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:38:59.454976-05	\N	5	relation "oportunidades" does not exist
66	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "propuesta", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:00.696279-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:00.696279-05	\N	5	relation "oportunidades" does not exist
68	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "perdido", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:02.04163-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:02.04163-05	\N	5	relation "oportunidades" does not exist
69	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "ganado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:03.055562-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:03.055562-05	\N	5	relation "oportunidades" does not exist
70	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "perdido", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:03.560791-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:03.560791-05	\N	5	relation "oportunidades" does not exist
71	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "ganado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:05.116955-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:05.116955-05	\N	5	relation "oportunidades" does not exist
72	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "propuesta", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:07.20767-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:07.20767-05	\N	5	relation "oportunidades" does not exist
73	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:09.209483-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:09.209483-05	\N	5	relation "oportunidades" does not exist
74	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "propuesta", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:28.743238-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:28.743238-05	\N	5	relation "oportunidades" does not exist
75	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "ganado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:33.258016-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:33.258016-05	\N	5	relation "oportunidades" does not exist
77	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "perdido", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:42.348862-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:42.348862-05	\N	5	relation "oportunidades" does not exist
78	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:50:34.447116-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:50:34.447116-05	\N	5	relation "oportunidades" does not exist
79	cotizaciones	INSERT	{"id": "55485082-7548-44d5-bcd5-0b37c9a75b65", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 2, "created_at": "2026-07-13T10:51:20.352434-05:00", "updated_at": "2026-07-13T10:51:20.352434-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 10:51:20.352434-05	\N	5	relation "cotizaciones" does not exist
80	cotizaciones	INSERT	{"id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "fecha": "2026-08-15", "notas": "", "total": 1350.50, "estado": "borrador", "numero": 3, "created_at": "2026-07-13T13:06:07.375563-05:00", "updated_at": "2026-07-13T13:06:07.375563-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 13:06:07.375563-05	\N	5	relation "cotizaciones" does not exist
81	cotizacion_lineas	INSERT	{"id": "6463ab4f-7a97-4dba-be9a-deae78a4d681", "cantidad": 1.00, "subtotal": 450.00, "descripcion": "BOMBA DE AGUA 1HP", "producto_id": null, "cotizacion_id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "precio_unitario": 450.00}	2026-07-13 13:06:07.375563-05	\N	5	relation "cotizacion_lineas" does not exist
82	cotizacion_lineas	INSERT	{"id": "bd85a7a8-5670-4d12-b20c-6bd302f7a5ab", "cantidad": 1.00, "subtotal": 780.50, "descripcion": "FILTRO DE ARENA N4", "producto_id": null, "cotizacion_id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "precio_unitario": 780.50}	2026-07-13 13:06:07.375563-05	\N	5	relation "cotizacion_lineas" does not exist
83	cotizacion_lineas	INSERT	{"id": "7529b3ba-bb28-4d9e-9ee4-e53decb1ddee", "cantidad": 1.00, "subtotal": 120.00, "descripcion": "TUBERIA PVC 2 PULG", "producto_id": null, "cotizacion_id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "precio_unitario": 120.00}	2026-07-13 13:06:07.375563-05	\N	5	relation "cotizacion_lineas" does not exist
84	cotizaciones	DELETE	{"id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "fecha": "2026-08-15", "notas": "", "total": 1350.50, "estado": "borrador", "numero": 3, "created_at": "2026-07-13T13:06:07.375563-05:00", "updated_at": "2026-07-13T13:06:07.375563-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 13:06:29.736044-05	\N	5	relation "cotizaciones" does not exist
85	cotizacion_lineas	DELETE	{"id": "6463ab4f-7a97-4dba-be9a-deae78a4d681", "cantidad": 1.00, "subtotal": 450.00, "descripcion": "BOMBA DE AGUA 1HP", "producto_id": null, "cotizacion_id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "precio_unitario": 450.00}	2026-07-13 13:06:29.736044-05	\N	5	relation "cotizacion_lineas" does not exist
86	cotizacion_lineas	DELETE	{"id": "bd85a7a8-5670-4d12-b20c-6bd302f7a5ab", "cantidad": 1.00, "subtotal": 780.50, "descripcion": "FILTRO DE ARENA N4", "producto_id": null, "cotizacion_id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "precio_unitario": 780.50}	2026-07-13 13:06:29.736044-05	\N	5	relation "cotizacion_lineas" does not exist
88	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:18:40.747417-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:18:40.747417-05	\N	5	relation "oportunidades" does not exist
90	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:18:50.21982-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:18:50.21982-05	\N	5	relation "oportunidades" does not exist
91	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "propuesta", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:18:52.592409-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:18:52.592409-05	\N	5	relation "oportunidades" does not exist
92	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "ganado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:18:54.079859-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:18:54.079859-05	\N	5	relation "oportunidades" does not exist
93	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "perdido", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:18:55.696406-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:18:55.696406-05	\N	5	relation "oportunidades" does not exist
94	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "ganado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:18:57.128197-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:18:57.128197-05	\N	5	relation "oportunidades" does not exist
95	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "perdido", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:19:05.592142-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:19:05.592142-05	\N	5	relation "oportunidades" does not exist
96	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "ganado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:19:09.974805-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:19:09.974805-05	\N	5	relation "oportunidades" does not exist
97	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "propuesta", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:19:10.757562-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:19:10.757562-05	\N	5	relation "oportunidades" does not exist
98	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "perdido", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:19:11.48703-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:19:11.48703-05	\N	5	relation "oportunidades" does not exist
100	cotizacion_lineas	INSERT	{"id": "25495e39-cf4a-4f5b-a195-2a9975c61065", "cantidad": 1.00, "subtotal": 450.00, "descripcion": "BOMBA DE AGUA 1HP", "producto_id": null, "cotizacion_id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "precio_unitario": 450.00}	2026-07-13 17:28:43.386152-05	\N	5	relation "cotizacion_lineas" does not exist
101	cotizacion_lineas	INSERT	{"id": "55d83f8a-1098-4987-a724-5238a2d82df9", "cantidad": 1.00, "subtotal": 780.50, "descripcion": "FILTRO DE ARENA N4", "producto_id": null, "cotizacion_id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "precio_unitario": 780.50}	2026-07-13 17:28:43.386152-05	\N	5	relation "cotizacion_lineas" does not exist
102	cotizacion_lineas	INSERT	{"id": "120b2adb-9deb-42d3-bfae-3151f92e3cb6", "cantidad": 1.00, "subtotal": 120.00, "descripcion": "TUBERIA PVC 2 PULG", "producto_id": null, "cotizacion_id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "precio_unitario": 120.00}	2026-07-13 17:28:43.386152-05	\N	5	relation "cotizacion_lineas" does not exist
103	cotizaciones	DELETE	{"id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "fecha": "2026-08-15", "notas": "", "total": 1350.50, "estado": "borrador", "numero": 4, "created_at": "2026-07-13T17:28:43.386152-05:00", "updated_at": "2026-07-13T17:28:43.386152-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 17:32:20.269175-05	\N	5	relation "cotizaciones" does not exist
104	cotizacion_lineas	DELETE	{"id": "25495e39-cf4a-4f5b-a195-2a9975c61065", "cantidad": 1.00, "subtotal": 450.00, "descripcion": "BOMBA DE AGUA 1HP", "producto_id": null, "cotizacion_id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "precio_unitario": 450.00}	2026-07-13 17:32:20.269175-05	\N	5	relation "cotizacion_lineas" does not exist
105	cotizacion_lineas	DELETE	{"id": "55d83f8a-1098-4987-a724-5238a2d82df9", "cantidad": 1.00, "subtotal": 780.50, "descripcion": "FILTRO DE ARENA N4", "producto_id": null, "cotizacion_id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "precio_unitario": 780.50}	2026-07-13 17:32:20.269175-05	\N	5	relation "cotizacion_lineas" does not exist
106	cotizacion_lineas	DELETE	{"id": "120b2adb-9deb-42d3-bfae-3151f92e3cb6", "cantidad": 1.00, "subtotal": 120.00, "descripcion": "TUBERIA PVC 2 PULG", "producto_id": null, "cotizacion_id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "precio_unitario": 120.00}	2026-07-13 17:32:20.269175-05	\N	5	relation "cotizacion_lineas" does not exist
107	cotizaciones	DELETE	{"id": "55485082-7548-44d5-bcd5-0b37c9a75b65", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 2, "created_at": "2026-07-13T10:51:20.352434-05:00", "updated_at": "2026-07-13T10:51:20.352434-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 17:33:16.763426-05	\N	5	relation "cotizaciones" does not exist
109	productos	UPDATE	{"id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "sku": "ACC-001", "tipo": "bienes", "costo": 0.00, "stock": 100, "vende": true, "compra": false, "nombre": "ADAPTADOR DE 1/2\\" PVC", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.302771-05:00", "referencia": null, "updated_at": "2026-07-13T18:17:08.444298-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-13 18:17:08.444298-05	2026-07-13 20:48:30.783127-05	0	\N
113	cotizaciones	UPDATE	{"id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "confirmada", "numero": 6, "created_at": "2026-07-13T18:21:50.590418-05:00", "updated_at": "2026-07-13T18:21:53.778968-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:21:53.778968-05	\N	5	relation "cotizaciones" does not exist
110	cotizaciones	INSERT	{"id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 6, "created_at": "2026-07-13T18:21:50.590418-05:00", "updated_at": "2026-07-13T18:21:50.590418-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:21:50.590418-05	\N	5	relation "cotizaciones" does not exist
18	usuarios	INSERT	{"id": 10, "username": "preview_test", "created_at": "2026-07-10T00:35:41.319191-05:00", "password_hash": "$2b$10$GL5n6eA5Ieh1nSiseeZ6ieJ9wBg6Uow.DOWeDo/ntJQp.mH6eIT2e", "nombre_completo": "Preview Test"}	2026-07-10 00:35:41.319191-05	\N	5	invalid input syntax for type uuid: "10"
114	productos	UPDATE	{"id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "sku": "ACC-001", "tipo": "bienes", "costo": 0.00, "stock": 100, "vende": true, "compra": false, "nombre": "ADAPTADOR DE 1/2\\" PVC", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.302771-05:00", "referencia": null, "updated_at": "2026-07-13T18:23:07.979273-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-13 18:23:07.979273-05	2026-07-13 20:53:30.66879-05	0	\N
111	cotizacion_lineas	INSERT	{"id": "83fd7401-3fda-4dae-82c0-772b6fb15978", "cantidad": 3.00, "subtotal": 0.00, "descripcion": null, "producto_id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "cotizacion_id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "precio_unitario": 0.00}	2026-07-13 18:21:50.590418-05	\N	5	relation "cotizacion_lineas" does not exist
19	usuarios	DELETE	{"id": 10, "username": "preview_test", "created_at": "2026-07-10T00:35:41.319191-05:00", "password_hash": "$2b$10$GL5n6eA5Ieh1nSiseeZ6ieJ9wBg6Uow.DOWeDo/ntJQp.mH6eIT2e", "nombre_completo": "Preview Test"}	2026-07-10 00:36:48.298582-05	\N	5	invalid input syntax for type uuid: "10"
116	productos	UPDATE	{"id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "sku": "ACC-001", "tipo": "bienes", "costo": 0.00, "stock": 97, "vende": true, "compra": false, "nombre": "ADAPTADOR DE 1/2\\" PVC", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.302771-05:00", "referencia": null, "updated_at": "2026-07-13T18:24:20.51933-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-13 18:24:20.51933-05	2026-07-13 20:55:10.587355-05	0	\N
112	productos	UPDATE	{"id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "sku": "ACC-001", "tipo": "bienes", "costo": 0.00, "stock": 97, "vende": true, "compra": false, "nombre": "ADAPTADOR DE 1/2\\" PVC", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.302771-05:00", "referencia": null, "updated_at": "2026-07-13T18:21:53.778968-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-13 18:21:53.778968-05	2026-07-13 20:51:50.527066-05	0	\N
115	cotizaciones	UPDATE	{"id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "aceptada", "numero": 6, "created_at": "2026-07-13T18:21:50.590418-05:00", "updated_at": "2026-07-13T18:23:07.979273-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:23:07.979273-05	\N	5	relation "cotizaciones" does not exist
117	cotizaciones	UPDATE	{"id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "confirmada", "numero": 6, "created_at": "2026-07-13T18:21:50.590418-05:00", "updated_at": "2026-07-13T18:24:20.51933-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:24:20.51933-05	\N	5	relation "cotizaciones" does not exist
118	productos	UPDATE	{"id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "sku": "ACC-001", "tipo": "bienes", "costo": 0.00, "stock": 100, "vende": true, "compra": false, "nombre": "ADAPTADOR DE 1/2\\" PVC", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.302771-05:00", "referencia": null, "updated_at": "2026-07-13T18:24:21.868018-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-13 18:24:21.868018-05	2026-07-13 20:56:51.104397-05	0	\N
24	cotizaciones	DELETE	{"id": "cb403f21-9cec-4499-9f56-22d75c52d635", "fecha": "2026-07-11", "notas": "smoke test", "total": 100.00, "estado": "borrador", "numero": 1, "created_at": "2026-07-11T15:29:13.713851-05:00", "updated_at": "2026-07-11T15:29:13.713851-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-11 15:29:13.737953-05	\N	5	relation "cotizaciones" does not exist
26	contactos	INSERT	{"id": "f9f04445-b9d9-4b21-b34a-d3f020e670e1", "fax": null, "nif": null, "tipo": "proveedor", "email": "qa@prueba.com", "movil": "666-5678", "notas": "", "agente": null, "codigo": null, "nombre": "Cliente de Prueba QA", "telefono": "555-1234", "direccion": {}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-12T21:10:06.875611-05:00", "es_empresa": false, "updated_at": "2026-07-12T21:10:06.875611-05:00", "tipo_cliente": null, "nombre_fiscal": null, "puesto_trabajo": "", "identificaciones": [], "persona_contacto": "Juan QA", "contactos_relacionados": []}	2026-07-12 21:10:06.875611-05	2026-07-13 18:32:48.74944-05	0	\N
121	cotizaciones	DELETE	{"id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "aceptada", "numero": 6, "created_at": "2026-07-13T18:21:50.590418-05:00", "updated_at": "2026-07-13T18:24:21.868018-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:37:33.209145-05	\N	5	relation "cotizaciones" does not exist
122	cotizacion_lineas	DELETE	{"id": "83fd7401-3fda-4dae-82c0-772b6fb15978", "cantidad": 3.00, "subtotal": 0.00, "descripcion": null, "producto_id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "cotizacion_id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "precio_unitario": 0.00}	2026-07-13 18:37:33.209145-05	\N	5	relation "cotizacion_lineas" does not exist
123	productos	UPDATE	{"id": "40d309f7-efe2-5e18-a8b5-a39cf3c19048", "sku": "ACC-001", "tipo": "bienes", "costo": 0.00, "stock": 0, "vende": true, "compra": false, "nombre": "ADAPTADOR DE 1/2\\" PVC", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.302771-05:00", "referencia": null, "updated_at": "2026-07-13T18:37:33.217301-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-13 18:37:33.217301-05	2026-07-13 21:03:30.772451-05	0	\N
124	cotizaciones	INSERT	{"id": "822212f6-00bd-4da4-99b0-25f10b3fd5fd", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 7, "created_at": "2026-07-13T18:48:28.860851-05:00", "updated_at": "2026-07-13T18:48:28.860851-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:48:28.860851-05	\N	5	relation "cotizaciones" does not exist
125	cotizaciones	UPDATE	{"id": "822212f6-00bd-4da4-99b0-25f10b3fd5fd", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "confirmada", "numero": 7, "created_at": "2026-07-13T18:48:28.860851-05:00", "updated_at": "2026-07-13T18:51:52.438663-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:51:52.438663-05	\N	5	relation "cotizaciones" does not exist
126	cotizaciones	UPDATE	{"id": "822212f6-00bd-4da4-99b0-25f10b3fd5fd", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "aceptada", "numero": 7, "created_at": "2026-07-13T18:48:28.860851-05:00", "updated_at": "2026-07-13T18:52:30.124538-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:52:30.124538-05	\N	5	relation "cotizaciones" does not exist
127	calendario_eventos	DELETE	{"id": "c6f9a7a6-fb9a-54a7-a117-57b2f424ee15", "tipo": "nota", "fecha": "2026-07-09", "estado": "pendiente", "titulo": "matenimiendo", "created_at": "2026-07-08T19:22:58.459099", "piscina_id": "1363072c-725a-5da3-b05d-c4f115a416ec", "updated_at": "2026-07-11T15:14:59.630758-05:00", "descripcion": null, "proyecto_id": null}	2026-07-13 18:53:58.156354-05	2026-07-14 13:37:41.663787-05	0	\N
128	cotizaciones	INSERT	{"id": "b4ce5f61-ed42-4f1b-b866-97452ad66085", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 8, "created_at": "2026-07-13T18:55:03.800882-05:00", "updated_at": "2026-07-13T18:55:03.800882-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:55:03.800882-05	\N	5	relation "cotizaciones" does not exist
129	cotizaciones	UPDATE	{"id": "b4ce5f61-ed42-4f1b-b866-97452ad66085", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "confirmada", "numero": 8, "created_at": "2026-07-13T18:55:03.800882-05:00", "updated_at": "2026-07-13T18:55:42.509127-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:55:42.509127-05	\N	5	relation "cotizaciones" does not exist
131	cotizaciones	INSERT	{"id": "7351a15d-d27c-49d7-a566-5f5136f3fa24", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 9, "created_at": "2026-07-13T18:56:49.371923-05:00", "updated_at": "2026-07-13T18:56:49.371923-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:56:49.371923-05	\N	5	relation "cotizaciones" does not exist
132	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:23.209786-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 18:57:23.209786-05	\N	5	relation "oportunidades" does not exist
133	cotizaciones	DELETE	{"id": "822212f6-00bd-4da4-99b0-25f10b3fd5fd", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "aceptada", "numero": 7, "created_at": "2026-07-13T18:48:28.860851-05:00", "updated_at": "2026-07-13T18:52:30.124538-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:57:30.497737-05	\N	5	relation "cotizaciones" does not exist
134	cotizaciones	DELETE	{"id": "b4ce5f61-ed42-4f1b-b866-97452ad66085", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "confirmada", "numero": 8, "created_at": "2026-07-13T18:55:03.800882-05:00", "updated_at": "2026-07-13T18:55:42.509127-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:57:30.497737-05	\N	5	relation "cotizaciones" does not exist
150	calendario_evento_empleados	INSERT	{"evento_id": "8ee1ecdc-09e0-4de2-bf2f-f154d8c0522b", "empleado_id": "4e6a0bcb-3f7e-5c8d-a2c4-e7b5acc5c6f9"}	2026-07-13 19:00:43.822997-05	\N	5	relation "calendario_evento_empleados" does not exist
48	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:43:49.678576-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:43:49.678576-05	\N	5	relation "oportunidades" does not exist
43	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:43:31.340176-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:43:31.340176-05	\N	5	relation "oportunidades" does not exist
44	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "calificado", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T09:43:31.927515-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 09:43:31.927515-05	\N	5	relation "oportunidades" does not exist
135	cotizaciones	DELETE	{"id": "7351a15d-d27c-49d7-a566-5f5136f3fa24", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 9, "created_at": "2026-07-13T18:56:49.371923-05:00", "updated_at": "2026-07-13T18:56:49.371923-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:57:30.497737-05	\N	5	relation "cotizaciones" does not exist
136	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:36.183429-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:36.183429-05	\N	5	relation "oportunidades" does not exist
138	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:39.684342-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:39.684342-05	\N	5	relation "oportunidades" does not exist
139	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:40.392837-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:40.392837-05	\N	5	relation "oportunidades" does not exist
140	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:41.179083-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:41.179083-05	\N	5	relation "oportunidades" does not exist
141	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:41.772088-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:41.772088-05	\N	5	relation "oportunidades" does not exist
142	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:42.351251-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:42.351251-05	\N	5	relation "oportunidades" does not exist
143	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:42.939414-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:42.939414-05	\N	5	relation "oportunidades" does not exist
144	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "propuesta", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:57.884106-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:57.884106-05	\N	5	relation "oportunidades" does not exist
145	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:58.932044-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:58.932044-05	\N	5	relation "oportunidades" does not exist
147	oportunidades	INSERT	{"id": "10ec1af9-b80e-4361-9b6e-9c077b0a6f81", "etapa": "calificado", "notas": "", "titulo": "A LO BRAVO", "created_at": "2026-07-13T18:58:37.256571-05:00", "updated_at": "2026-07-13T18:58:37.256571-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 18:58:37.256571-05	\N	5	relation "oportunidades" does not exist
148	oportunidades	UPDATE	{"id": "10ec1af9-b80e-4361-9b6e-9c077b0a6f81", "etapa": "nuevo", "notas": "", "titulo": "A LO BRAVO", "created_at": "2026-07-13T18:58:37.256571-05:00", "updated_at": "2026-07-13T18:58:38.27699-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 18:58:38.27699-05	\N	5	relation "oportunidades" does not exist
149	calendario_eventos	INSERT	{"id": "8ee1ecdc-09e0-4de2-bf2f-f154d8c0522b", "tipo": "recordatorio", "fecha": "2026-07-01", "estado": "pendiente", "titulo": "BRISEÑO", "created_at": "2026-07-13T19:00:43.822997", "piscina_id": null, "updated_at": "2026-07-13T19:00:43.822997-05:00", "descripcion": "Programacion de riego ", "proyecto_id": "f1b30cad-e0dc-5867-bf91-323fbf08d8bf"}	2026-07-13 19:00:43.822997-05	2026-07-14 14:14:15.542988-05	0	\N
151	cotizaciones	INSERT	{"id": "b6f7fc59-e3ae-4046-a71f-ff3c53d0da58", "fecha": "2026-07-14", "notas": "", "total": 0.00, "estado": "borrador", "numero": 10, "created_at": "2026-07-13T19:11:47.829353-05:00", "updated_at": "2026-07-13T19:11:47.829353-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 19:11:47.829353-05	\N	5	relation "cotizaciones" does not exist
152	cotizaciones	UPDATE	{"id": "b6f7fc59-e3ae-4046-a71f-ff3c53d0da58", "fecha": "2026-07-14", "notas": "", "total": 0.00, "estado": "confirmada", "numero": 10, "created_at": "2026-07-13T19:11:47.829353-05:00", "updated_at": "2026-07-13T19:12:05.717631-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 19:12:05.717631-05	\N	5	relation "cotizaciones" does not exist
57	oportunidades	UPDATE	{"id": "45e991c2-42da-47d2-a5e6-72840cc67e81", "etapa": "nuevo", "notas": "", "titulo": "hasdasw", "created_at": "2026-07-13T09:36:14.835763-05:00", "updated_at": "2026-07-13T10:04:25.151254-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:04:25.151254-05	\N	5	relation "oportunidades" does not exist
119	cotizaciones	UPDATE	{"id": "a005edd9-79db-4a92-8b89-eb33b9473e5e", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "aceptada", "numero": 6, "created_at": "2026-07-13T18:21:50.590418-05:00", "updated_at": "2026-07-13T18:24:21.868018-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:24:21.868018-05	\N	5	relation "cotizaciones" does not exist
65	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "calificado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:00.033601-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:00.033601-05	\N	5	relation "oportunidades" does not exist
87	cotizacion_lineas	DELETE	{"id": "7529b3ba-bb28-4d9e-9ee4-e53decb1ddee", "cantidad": 1.00, "subtotal": 120.00, "descripcion": "TUBERIA PVC 2 PULG", "producto_id": null, "cotizacion_id": "9ff69043-f773-4c41-a379-1aa60a325ecc", "precio_unitario": 120.00}	2026-07-13 13:06:29.736044-05	\N	5	relation "cotizacion_lineas" does not exist
67	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "ganado", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:01.330461-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:01.330461-05	\N	5	relation "oportunidades" does not exist
108	cotizaciones	INSERT	{"id": "b7d5f4a3-9838-450c-ac4c-49122ec4de94", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 5, "created_at": "2026-07-13T17:33:32.910036-05:00", "updated_at": "2026-07-13T17:33:32.910036-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 17:33:32.910036-05	\N	5	relation "cotizaciones" does not exist
76	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T10:39:42.314268-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 10:39:42.314268-05	\N	5	relation "oportunidades" does not exist
99	cotizaciones	INSERT	{"id": "1bb22524-bfe6-455c-8c1d-10edb7448253", "fecha": "2026-08-15", "notas": "", "total": 1350.50, "estado": "borrador", "numero": 4, "created_at": "2026-07-13T17:28:43.386152-05:00", "updated_at": "2026-07-13T17:28:43.386152-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 17:28:43.386152-05	\N	5	relation "cotizaciones" does not exist
89	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "asdasdasd", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T16:18:41.356557-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-13 16:18:41.356557-05	\N	5	relation "oportunidades" does not exist
130	contactos	INSERT	{"id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "fax": null, "nif": null, "tipo": "otro", "email": "", "movil": null, "notas": "", "agente": null, "codigo": null, "nombre": "Billy el poderoso", "telefono": "985832096", "direccion": {"zip": "", "pais": "", "calle": "Mz A lt 9 Nueva gales Cieneguilla", "calle2": "", "ciudad": "", "estado": "", "distrito": ""}, "etiquetas": [], "sitio_web": "", "created_at": "2026-07-13T18:56:12.713652-05:00", "es_empresa": false, "updated_at": "2026-07-13T18:56:12.713652-05:00", "tipo_cliente": null, "nombre_fiscal": null, "ubicacion_url": null, "puesto_trabajo": "", "identificaciones": [], "persona_contacto": null, "contactos_relacionados": []}	2026-07-13 18:56:12.713652-05	2026-07-14 13:41:01.596929-05	0	\N
120	cotizaciones	DELETE	{"id": "b7d5f4a3-9838-450c-ac4c-49122ec4de94", "fecha": "2026-07-13", "notas": "", "total": 0.00, "estado": "borrador", "numero": 5, "created_at": "2026-07-13T17:33:32.910036-05:00", "updated_at": "2026-07-13T17:33:32.910036-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 18:37:33.209145-05	\N	5	relation "cotizaciones" does not exist
137	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:37.43394-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:37.43394-05	\N	5	relation "oportunidades" does not exist
154	cotizaciones	DELETE	{"id": "6b912352-a097-4155-8c22-447cf91f505c", "fecha": "2026-07-14", "notas": "", "total": 0.00, "estado": "borrador", "moneda": "USD", "numero": 11, "created_at": "2026-07-13T19:22:39.949081-05:00", "updated_at": "2026-07-13T19:22:39.949081-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 19:23:00.027698-05	\N	5	relation "cotizaciones" does not exist
155	cotizaciones	INSERT	{"id": "58a4f244-e291-4b4f-af17-710e7ba1ab25", "fecha": "2026-07-14", "notas": "", "total": 450.00, "estado": "borrador", "moneda": "PEN", "numero": 12, "created_at": "2026-07-13T20:16:09.086307-05:00", "updated_at": "2026-07-13T20:16:09.086307-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 20:16:09.086307-05	\N	5	relation "cotizaciones" does not exist
156	cotizacion_lineas	INSERT	{"id": "95733f3e-e250-4f3c-bf2a-77424bd2d40b", "cantidad": 1.00, "subtotal": 450.00, "descripcion": "cableado especial", "producto_id": null, "cotizacion_id": "58a4f244-e291-4b4f-af17-710e7ba1ab25", "precio_unitario": 450.00, "descripcion_superior": "INSTALACIÓN ELÉCTRICA"}	2026-07-13 20:16:09.086307-05	\N	5	relation "cotizacion_lineas" does not exist
157	cotizaciones	DELETE	{"id": "58a4f244-e291-4b4f-af17-710e7ba1ab25", "fecha": "2026-07-14", "notas": "", "total": 450.00, "estado": "borrador", "moneda": "PEN", "numero": 12, "created_at": "2026-07-13T20:16:09.086307-05:00", "updated_at": "2026-07-13T20:16:09.086307-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 20:16:29.758672-05	\N	5	relation "cotizaciones" does not exist
158	cotizacion_lineas	DELETE	{"id": "95733f3e-e250-4f3c-bf2a-77424bd2d40b", "cantidad": 1.00, "subtotal": 450.00, "descripcion": "cableado especial", "producto_id": null, "cotizacion_id": "58a4f244-e291-4b4f-af17-710e7ba1ab25", "precio_unitario": 450.00, "descripcion_superior": "INSTALACIÓN ELÉCTRICA"}	2026-07-13 20:16:29.758672-05	\N	5	relation "cotizacion_lineas" does not exist
146	oportunidades	UPDATE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:59.517476-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-13 18:57:59.517476-05	\N	5	relation "oportunidades" does not exist
159	cotizaciones	INSERT	{"id": "813ad070-8a94-47b4-9fdf-6d5fceed0132", "fecha": "2026-07-14", "notas": "", "total": 1149.00, "estado": "borrador", "moneda": "PEN", "numero": 13, "created_at": "2026-07-14T14:26:51.608398-05:00", "updated_at": "2026-07-14T14:26:51.608398-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_detalle": [{"id": "c0894fee-77e4-48bd-b25b-32cec9846f23", "tipo": "descripcion", "precio": 150, "descripcion": "Servicio de mantenimiento"}, {"id": "2e6f1f9e-82e3-444f-83e5-118ff2ce176f", "tipo": "producto", "productos": [{"id": "3860d167-b8c2-46a7-b366-92b74a93055c", "esLibre": true, "cantidad": 3, "descripcion": "Cable HDMI de prueba", "producto_id": null, "precio_unitario": 25.5}, {"id": "07754ece-8ba9-46c5-9d93-0b764c9df7f8", "esLibre": true, "cantidad": 2, "descripcion": "Cable de red", "producto_id": null, "precio_unitario": 10}], "precio_general": 999, "descripcion_superior": "Paquete de instalación"}]}	2026-07-14 14:26:51.608398-05	\N	5	relation "cotizaciones" does not exist
153	cotizaciones	INSERT	{"id": "6b912352-a097-4155-8c22-447cf91f505c", "fecha": "2026-07-14", "notas": "", "total": 0.00, "estado": "borrador", "moneda": "USD", "numero": 11, "created_at": "2026-07-13T19:22:39.949081-05:00", "updated_at": "2026-07-13T19:22:39.949081-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb"}	2026-07-13 19:22:39.949081-05	\N	5	relation "cotizaciones" does not exist
160	cotizaciones	INSERT	{"id": "99c6bd75-5a06-48fd-bcb7-f1274a0e9ab6", "fecha": "2026-07-14", "notas": "", "total": 1149.00, "estado": "borrador", "moneda": "PEN", "numero": 14, "created_at": "2026-07-14T14:27:50.330249-05:00", "updated_at": "2026-07-14T14:27:50.330249-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_detalle": [{"id": "1823df8d-f8fc-48c8-9a7c-c67f0b9fc202", "tipo": "descripcion", "precio": 150, "descripcion": "Servicio de mantenimiento"}, {"id": "c37bf7aa-9da0-4491-9fac-7cea141300a6", "tipo": "producto", "productos": [{"id": "d74be577-edd2-471c-b065-650eb05b6aec", "esLibre": true, "cantidad": 3, "descripcion": "Cable HDMI de prueba", "producto_id": null, "precio_unitario": 25.5}, {"id": "a9178abe-6c4b-4f80-a48a-0c33da63d98b", "esLibre": true, "cantidad": 2, "descripcion": "Cable de red", "producto_id": null, "precio_unitario": 10}], "precio_general": 999, "descripcion_superior": "Paquete de instalación"}]}	2026-07-14 14:27:50.330249-05	\N	5	relation "cotizaciones" does not exist
162	cotizaciones	UPDATE	{"id": "99c6bd75-5a06-48fd-bcb7-f1274a0e9ab6", "fecha": "2026-07-14", "notas": "", "total": 1149.00, "estado": "aceptada", "moneda": "PEN", "numero": 14, "created_at": "2026-07-14T14:27:50.330249-05:00", "updated_at": "2026-07-14T14:29:43.389023-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_detalle": [{"id": "1823df8d-f8fc-48c8-9a7c-c67f0b9fc202", "tipo": "descripcion", "precio": 150, "descripcion": "Servicio de mantenimiento"}, {"id": "c37bf7aa-9da0-4491-9fac-7cea141300a6", "tipo": "producto", "productos": [{"id": "d74be577-edd2-471c-b065-650eb05b6aec", "esLibre": true, "cantidad": 3, "descripcion": "Cable HDMI de prueba", "producto_id": null, "precio_unitario": 25.5}, {"id": "a9178abe-6c4b-4f80-a48a-0c33da63d98b", "esLibre": true, "cantidad": 2, "descripcion": "Cable de red", "producto_id": null, "precio_unitario": 10}], "precio_general": 999, "descripcion_superior": "Paquete de instalación"}]}	2026-07-14 14:29:43.389023-05	\N	5	relation "cotizaciones" does not exist
161	cotizaciones	UPDATE	{"id": "99c6bd75-5a06-48fd-bcb7-f1274a0e9ab6", "fecha": "2026-07-14", "notas": "", "total": 1149.00, "estado": "confirmada", "moneda": "PEN", "numero": 14, "created_at": "2026-07-14T14:27:50.330249-05:00", "updated_at": "2026-07-14T14:29:41.63815-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_detalle": [{"id": "1823df8d-f8fc-48c8-9a7c-c67f0b9fc202", "tipo": "descripcion", "precio": 150, "descripcion": "Servicio de mantenimiento"}, {"id": "c37bf7aa-9da0-4491-9fac-7cea141300a6", "tipo": "producto", "productos": [{"id": "d74be577-edd2-471c-b065-650eb05b6aec", "esLibre": true, "cantidad": 3, "descripcion": "Cable HDMI de prueba", "producto_id": null, "precio_unitario": 25.5}, {"id": "a9178abe-6c4b-4f80-a48a-0c33da63d98b", "esLibre": true, "cantidad": 2, "descripcion": "Cable de red", "producto_id": null, "precio_unitario": 10}], "precio_general": 999, "descripcion_superior": "Paquete de instalación"}]}	2026-07-14 14:29:41.63815-05	\N	5	relation "cotizaciones" does not exist
165	cotizaciones	INSERT	{"id": "84e3d2d4-ab1d-4291-a160-2e374d703175", "fecha": "2026-08-15", "notas": "", "total": 1350.50, "estado": "borrador", "moneda": "PEN", "numero": 15, "created_at": "2026-07-14T21:30:54.918076-05:00", "updated_at": "2026-07-14T21:30:54.918076-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_modo": "libre", "lineas_libres": {"filas": [{"id": "2a3e0adf-3669-424c-8956-df227fc95ab6", "html": "BOMBA DE AGUA EDITADA 2HP", "precio": "S/ 450.00"}, {"id": "bef32dc7-06f6-4992-9d3f-ec11224d6662", "html": "FILTRO DE ARENA N4", "precio": "S/ 780.50"}, {"id": "e32ffacd-ca20-4a57-9034-02bab3acda68", "html": "SERVICIO ADICIONAL", "precio": ""}], "total": "S/ 1350.50", "cantidad": "01"}, "lineas_detalle": []}	2026-07-14 21:30:54.918076-05	\N	5	relation "cotizaciones" does not exist
164	cotizaciones	DELETE	{"id": "813ad070-8a94-47b4-9fdf-6d5fceed0132", "fecha": "2026-07-14", "notas": "", "total": 1149.00, "estado": "borrador", "moneda": "PEN", "numero": 13, "created_at": "2026-07-14T14:26:51.608398-05:00", "updated_at": "2026-07-14T14:26:51.608398-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_detalle": [{"id": "c0894fee-77e4-48bd-b25b-32cec9846f23", "tipo": "descripcion", "precio": 150, "descripcion": "Servicio de mantenimiento"}, {"id": "2e6f1f9e-82e3-444f-83e5-118ff2ce176f", "tipo": "producto", "productos": [{"id": "3860d167-b8c2-46a7-b366-92b74a93055c", "esLibre": true, "cantidad": 3, "descripcion": "Cable HDMI de prueba", "producto_id": null, "precio_unitario": 25.5}, {"id": "07754ece-8ba9-46c5-9d93-0b764c9df7f8", "esLibre": true, "cantidad": 2, "descripcion": "Cable de red", "producto_id": null, "precio_unitario": 10}], "precio_general": 999, "descripcion_superior": "Paquete de instalación"}]}	2026-07-14 14:31:30.575896-05	\N	5	relation "cotizaciones" does not exist
163	cotizaciones	DELETE	{"id": "99c6bd75-5a06-48fd-bcb7-f1274a0e9ab6", "fecha": "2026-07-14", "notas": "", "total": 1149.00, "estado": "aceptada", "moneda": "PEN", "numero": 14, "created_at": "2026-07-14T14:27:50.330249-05:00", "updated_at": "2026-07-14T14:29:43.389023-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_detalle": [{"id": "1823df8d-f8fc-48c8-9a7c-c67f0b9fc202", "tipo": "descripcion", "precio": 150, "descripcion": "Servicio de mantenimiento"}, {"id": "c37bf7aa-9da0-4491-9fac-7cea141300a6", "tipo": "producto", "productos": [{"id": "d74be577-edd2-471c-b065-650eb05b6aec", "esLibre": true, "cantidad": 3, "descripcion": "Cable HDMI de prueba", "producto_id": null, "precio_unitario": 25.5}, {"id": "a9178abe-6c4b-4f80-a48a-0c33da63d98b", "esLibre": true, "cantidad": 2, "descripcion": "Cable de red", "producto_id": null, "precio_unitario": 10}], "precio_general": 999, "descripcion_superior": "Paquete de instalación"}]}	2026-07-14 14:30:25.499002-05	\N	5	relation "cotizaciones" does not exist
172	productos	UPDATE	{"id": "62f5014a-acbd-4395-9311-532fb903435b", "sku": "__TEST-SKU__", "tipo": "bienes", "costo": 0.00, "stock": 25, "vende": true, "compra": false, "nombre": "__TEST producto__", "precio": 10.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-15T18:04:44.44232-05:00", "referencia": null, "updated_at": "2026-07-15T18:04:44.482531-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-15 18:04:44.482531-05	2026-07-15 18:05:04.218204-05	0	\N
173	productos	UPDATE	{"id": "62f5014a-acbd-4395-9311-532fb903435b", "sku": "__TEST-SKU__", "tipo": "bienes", "costo": 0.00, "stock": 15, "vende": true, "compra": false, "nombre": "__TEST producto__", "precio": 10.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-15T18:04:44.44232-05:00", "referencia": null, "updated_at": "2026-07-15T18:04:44.498644-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-15 18:04:44.498644-05	2026-07-15 18:05:04.386088-05	0	\N
171	productos	INSERT	{"id": "62f5014a-acbd-4395-9311-532fb903435b", "sku": "__TEST-SKU__", "tipo": "bienes", "costo": 0.00, "stock": 0, "vende": true, "compra": false, "nombre": "__TEST producto__", "precio": 10.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-15T18:04:44.44232-05:00", "referencia": null, "updated_at": "2026-07-15T18:04:44.44232-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-15 18:04:44.44232-05	2026-07-15 18:05:03.880172-05	0	\N
167	oportunidades	DELETE	{"id": "10ec1af9-b80e-4361-9b6e-9c077b0a6f81", "etapa": "nuevo", "notas": "", "titulo": "A LO BRAVO", "created_at": "2026-07-13T18:58:37.256571-05:00", "updated_at": "2026-07-13T18:58:38.27699-05:00", "contacto_id": "d142ef26-317d-56bd-aa3b-6b5d29bb6fdb", "monto_estimado": 0.00}	2026-07-15 11:51:51.807703-05	\N	5	relation "oportunidades" does not exist
166	cotizaciones	DELETE	{"id": "84e3d2d4-ab1d-4291-a160-2e374d703175", "fecha": "2026-08-15", "notas": "", "total": 1350.50, "estado": "borrador", "moneda": "PEN", "numero": 15, "created_at": "2026-07-14T21:30:54.918076-05:00", "updated_at": "2026-07-14T21:30:54.918076-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "lineas_modo": "libre", "lineas_libres": {"filas": [{"id": "2a3e0adf-3669-424c-8956-df227fc95ab6", "html": "BOMBA DE AGUA EDITADA 2HP", "precio": "S/ 450.00"}, {"id": "bef32dc7-06f6-4992-9d3f-ec11224d6662", "html": "FILTRO DE ARENA N4", "precio": "S/ 780.50"}, {"id": "e32ffacd-ca20-4a57-9034-02bab3acda68", "html": "SERVICIO ADICIONAL", "precio": ""}], "total": "S/ 1350.50", "cantidad": "01"}, "lineas_detalle": []}	2026-07-14 21:32:20.826344-05	\N	5	relation "cotizaciones" does not exist
168	oportunidades	DELETE	{"id": "a0447f25-e4a4-44a4-b06a-c907acf924bb", "etapa": "nuevo", "notas": "", "titulo": "NOSE", "created_at": "2026-07-13T10:38:56.147479-05:00", "updated_at": "2026-07-13T18:57:59.517476-05:00", "contacto_id": "94ed37e9-c0fd-485a-ad1c-fee4a2b33451", "monto_estimado": 0.00}	2026-07-15 11:51:55.137016-05	\N	5	relation "oportunidades" does not exist
169	productos	INSERT	{"id": "2136bdd6-ab2c-45e9-aab3-532563a5051e", "sku": "__TEST-SKU__", "tipo": "bienes", "costo": 0.00, "stock": 0, "vende": true, "compra": false, "nombre": "__TEST producto__", "precio": 10.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-15T18:00:43.2659-05:00", "referencia": null, "updated_at": "2026-07-15T18:00:43.2659-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-15 18:00:43.2659-05	2026-07-15 18:00:55.688384-05	0	\N
170	productos	DELETE	{"id": "2136bdd6-ab2c-45e9-aab3-532563a5051e", "sku": "__TEST-SKU__", "tipo": "bienes", "costo": 0.00, "stock": 0, "vende": true, "compra": false, "nombre": "__TEST producto__", "precio": 10.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-15T18:00:43.2659-05:00", "referencia": null, "updated_at": "2026-07-15T18:00:43.2659-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-15 18:02:39.770449-05	2026-07-15 18:02:56.910368-05	0	\N
174	productos	DELETE	{"id": "62f5014a-acbd-4395-9311-532fb903435b", "sku": "__TEST-SKU__", "tipo": "bienes", "costo": 0.00, "stock": 15, "vende": true, "compra": false, "nombre": "__TEST producto__", "precio": 10.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-15T18:04:44.44232-05:00", "referencia": null, "updated_at": "2026-07-15T18:04:44.498644-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-15 18:04:44.51111-05	2026-07-15 18:05:04.784308-05	0	\N
175	usuarios	UPDATE	{"id": "c40ab922-aaca-545a-9f8c-0be28f1c5c8e", "username": "harry", "created_at": "2026-07-05T15:25:03.511624-05:00", "updated_at": "2026-07-16T17:31:31.063235-05:00", "password_hash": "$2b$10$2j9tjrA6JiEPV1cyKr5qweYBDYpykBqqoK0UzQn9l0JfQpPNLKkr6", "nombre_completo": "harry"}	2026-07-16 17:31:31.063235-05	2026-07-16 17:31:34.266172-05	0	\N
176	productos	INSERT	{"id": "da7cce1e-c089-49eb-89b8-bc5ee68f87cf", "sku": "TEST-CLAUDE-001", "tipo": "bienes", "costo": 0.00, "stock": 0, "vende": true, "compra": false, "nombre": "Manguera de Prueba Claude", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": "", "created_at": "2026-07-16T18:56:51.555687-05:00", "referencia": null, "updated_at": "2026-07-16T18:56:51.555687-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": "", "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-16 18:56:51.555687-05	2026-07-16 18:56:56.002254-05	0	\N
177	productos	DELETE	{"id": "da7cce1e-c089-49eb-89b8-bc5ee68f87cf", "sku": "TEST-CLAUDE-001", "tipo": "bienes", "costo": 0.00, "stock": 0, "vende": true, "compra": false, "nombre": "Manguera de Prueba Claude", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": "", "created_at": "2026-07-16T18:56:51.555687-05:00", "referencia": null, "updated_at": "2026-07-16T18:56:51.555687-05:00", "limite_stock": 0, "codigo_barras": null, "impuesto_venta": null, "notas_internas": "", "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-16 18:58:04.53485-05	2026-07-16 18:58:16.312334-05	0	\N
178	productos	UPDATE	{"id": "f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2", "sku": "ACC-144", "tipo": "bienes", "costo": 0.00, "stock": 109, "vende": true, "compra": false, "nombre": "BOQUILLA 12 A AJUSTABLE HUNTER", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.372374-05:00", "referencia": null, "updated_at": "2026-07-16T19:49:54.049539-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-16 19:49:54.049539-05	2026-07-16 19:49:57.379803-05	0	\N
179	productos	UPDATE	{"id": "f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2", "sku": "ACC-144", "tipo": "bienes", "costo": 0.00, "stock": 94, "vende": true, "compra": false, "nombre": "BOQUILLA 12 A AJUSTABLE HUNTER", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.372-05:00", "referencia": null, "updated_at": "2026-07-16T19:50:58.405688-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-16 19:50:58.405688-05	2026-07-16 19:51:17.125972-05	0	\N
180	productos	UPDATE	{"id": "f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2", "sku": "ACC-144", "tipo": "bienes", "costo": 0.00, "stock": 99, "vende": true, "compra": false, "nombre": "BOQUILLA 12 A AJUSTABLE HUNTER", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.372-05:00", "referencia": null, "updated_at": "2026-07-16T19:51:39.30645-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-16 19:51:39.30645-05	2026-07-16 19:51:57.262569-05	0	\N
181	productos	UPDATE	{"id": "f0eca9c1-3f0f-5c42-9a8f-6ff1a685a2d2", "sku": "ACC-144", "tipo": "bienes", "costo": 0.00, "stock": -1, "vende": true, "compra": false, "nombre": "BOQUILLA 12 A AJUSTABLE HUNTER", "precio": 0.00, "unidad": "Unidad", "es_gasto": false, "favorito": false, "foto_url": null, "categoria": null, "created_at": "2026-07-08T16:48:35.372-05:00", "referencia": null, "updated_at": "2026-07-16T19:53:40.320993-05:00", "limite_stock": 10, "codigo_barras": null, "impuesto_venta": null, "notas_internas": null, "codigo_detraccion": null, "rastrear_inventario": true}	2026-07-16 19:53:40.320993-05	2026-07-16 19:53:58.194683-05	0	\N
\.


--
-- Data for Name: sync_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sync_state (id, is_online, last_check_at, last_success_at, last_pull_at) FROM stdin;
t	t	2026-07-16 20:02:57.473446-05	2026-07-16 20:02:44.158871-05	2026-07-16 20:02:40.137-05
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (username, password_hash, nombre_completo, created_at, id, updated_at) FROM stdin;
harry	$2b$10$2j9tjrA6JiEPV1cyKr5qweYBDYpykBqqoK0UzQn9l0JfQpPNLKkr6	harry	2026-07-05 15:25:03.511-05	c40ab922-aaca-545a-9f8c-0be28f1c5c8e	2026-07-16 17:31:34.581667-05
\.


--
-- Name: asientos_contables_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asientos_contables_numero_seq', 1, false);


--
-- Name: cotizaciones_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cotizaciones_numero_seq', 15, true);


--
-- Name: entradas_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entradas_numero_seq', 3, true);


--
-- Name: facturas_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.facturas_numero_seq', 1, false);


--
-- Name: pedidos_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedidos_numero_seq', 1, false);


--
-- Name: sync_outbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sync_outbox_id_seq', 181, true);


--
-- Name: almacenes almacenes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_pkey PRIMARY KEY (id);


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
-- Name: calendario_evento_empleados calendario_evento_empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendario_evento_empleados
    ADD CONSTRAINT calendario_evento_empleados_pkey PRIMARY KEY (evento_id, empleado_id);


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
-- Name: cotizacion_lineas cotizacion_lineas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizacion_lineas
    ADD CONSTRAINT cotizacion_lineas_pkey PRIMARY KEY (id);


--
-- Name: cotizaciones cotizaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizaciones
    ADD CONSTRAINT cotizaciones_pkey PRIMARY KEY (id);


--
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);


--
-- Name: entrada_lineas entrada_lineas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrada_lineas
    ADD CONSTRAINT entrada_lineas_pkey PRIMARY KEY (id);


--
-- Name: entradas entradas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas
    ADD CONSTRAINT entradas_pkey PRIMARY KEY (id);


--
-- Name: factura_lineas factura_lineas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura_lineas
    ADD CONSTRAINT factura_lineas_pkey PRIMARY KEY (id);


--
-- Name: factura_pagos factura_pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura_pagos
    ADD CONSTRAINT factura_pagos_pkey PRIMARY KEY (id);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- Name: gastos gastos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_pkey PRIMARY KEY (id);


--
-- Name: lotes lotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes
    ADD CONSTRAINT lotes_pkey PRIMARY KEY (id);


--
-- Name: movimientos_stock movimientos_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_pkey PRIMARY KEY (id);


--
-- Name: oportunidades oportunidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oportunidades
    ADD CONSTRAINT oportunidades_pkey PRIMARY KEY (id);


--
-- Name: pedido_lineas pedido_lineas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_lineas
    ADD CONSTRAINT pedido_lineas_pkey PRIMARY KEY (id);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


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
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


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
-- Name: idx_lotes_producto_almacen; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lotes_producto_almacen ON public.lotes USING btree (producto_id, almacen_id);


--
-- Name: idx_movimientos_stock_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_movimientos_stock_producto ON public.movimientos_stock USING btree (producto_id, fecha DESC);


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
-- Name: calendario_evento_empleados trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.calendario_evento_empleados FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: calendario_eventos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.calendario_eventos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: contactos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.contactos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cotizacion_lineas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.cotizacion_lineas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cotizaciones trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: empleados trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.empleados FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: entradas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.entradas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: factura_lineas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.factura_lineas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: factura_pagos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.factura_pagos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: facturas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: gastos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.gastos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: lotes trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.lotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: oportunidades trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pedido_lineas trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.pedido_lineas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pedidos trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


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
-- Name: proveedores trg_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.proveedores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


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
-- Name: asiento_lineas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.asiento_lineas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: asientos_contables trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.asientos_contables FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: calendario_evento_empleados trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.calendario_evento_empleados FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: calendario_eventos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.calendario_eventos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: contactos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.contactos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: cotizacion_lineas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.cotizacion_lineas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: cotizaciones trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: empleados trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.empleados FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: factura_lineas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.factura_lineas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: factura_pagos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.factura_pagos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: facturas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: gastos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.gastos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: oportunidades trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: pedido_lineas trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.pedido_lineas FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


--
-- Name: pedidos trg_sync_outbox; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_outbox AFTER INSERT OR DELETE OR UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.sync_outbox_capture();


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
-- Name: calendario_evento_empleados calendario_evento_empleados_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendario_evento_empleados
    ADD CONSTRAINT calendario_evento_empleados_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: calendario_evento_empleados calendario_evento_empleados_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendario_evento_empleados
    ADD CONSTRAINT calendario_evento_empleados_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.calendario_eventos(id) ON DELETE CASCADE;


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
-- Name: cotizacion_lineas cotizacion_lineas_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizacion_lineas
    ADD CONSTRAINT cotizacion_lineas_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizaciones(id) ON DELETE CASCADE;


--
-- Name: cotizacion_lineas cotizacion_lineas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizacion_lineas
    ADD CONSTRAINT cotizacion_lineas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: cotizaciones cotizaciones_contacto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizaciones
    ADD CONSTRAINT cotizaciones_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id) ON DELETE CASCADE;


--
-- Name: entrada_lineas entrada_lineas_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrada_lineas
    ADD CONSTRAINT entrada_lineas_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(id);


--
-- Name: entrada_lineas entrada_lineas_entrada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrada_lineas
    ADD CONSTRAINT entrada_lineas_entrada_id_fkey FOREIGN KEY (entrada_id) REFERENCES public.entradas(id) ON DELETE CASCADE;


--
-- Name: entrada_lineas entrada_lineas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrada_lineas
    ADD CONSTRAINT entrada_lineas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: entradas entradas_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas
    ADD CONSTRAINT entradas_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id);


--
-- Name: factura_lineas factura_lineas_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura_lineas
    ADD CONSTRAINT factura_lineas_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(id) ON DELETE CASCADE;


--
-- Name: factura_lineas factura_lineas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura_lineas
    ADD CONSTRAINT factura_lineas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: factura_pagos factura_pagos_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura_pagos
    ADD CONSTRAINT factura_pagos_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(id) ON DELETE CASCADE;


--
-- Name: facturas facturas_contacto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id) ON DELETE CASCADE;


--
-- Name: facturas facturas_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizaciones(id);


--
-- Name: lotes lotes_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes
    ADD CONSTRAINT lotes_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(id);


--
-- Name: lotes lotes_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes
    ADD CONSTRAINT lotes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: movimientos_stock movimientos_stock_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(id);


--
-- Name: movimientos_stock movimientos_stock_entrada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_entrada_id_fkey FOREIGN KEY (entrada_id) REFERENCES public.entradas(id);


--
-- Name: movimientos_stock movimientos_stock_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lotes(id);


--
-- Name: movimientos_stock movimientos_stock_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: oportunidades oportunidades_contacto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oportunidades
    ADD CONSTRAINT oportunidades_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id) ON DELETE CASCADE;


--
-- Name: pedido_lineas pedido_lineas_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_lineas
    ADD CONSTRAINT pedido_lineas_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- Name: pedido_lineas pedido_lineas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_lineas
    ADD CONSTRAINT pedido_lineas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: pedidos pedidos_contacto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id) ON DELETE CASCADE;


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
-- PostgreSQL database dump complete
--

\unrestrict wQQjSqGeRIqI7hBPsapENVKwt9MiFFcXJpxBFMB2CdbsbEStsWtPAmMQHTi9roL

