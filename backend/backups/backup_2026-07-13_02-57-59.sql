--
-- PostgreSQL database dump
--

\restrict NNsUMheBfs4Va56fK5ye06MgSXXO3nOcAWwDzAecOvuVJSHZ9MSHDipEihjXjDg

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: administradores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administradores (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    contrasena character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.administradores OWNER TO postgres;

--
-- Name: administradores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administradores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administradores_id_seq OWNER TO postgres;

--
-- Name: administradores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administradores_id_seq OWNED BY public.administradores.id;


--
-- Name: aportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aportes (
    id integer NOT NULL,
    socio_id integer,
    monto numeric(10,2) NOT NULL,
    mes character varying(20) NOT NULL,
    anio integer NOT NULL,
    tipo character varying(50) DEFAULT 'aporte'::character varying,
    descripcion text,
    estado character varying(20) DEFAULT 'Pendiente'::character varying,
    fecha date DEFAULT CURRENT_DATE,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aportes OWNER TO postgres;

--
-- Name: aportes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aportes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aportes_id_seq OWNER TO postgres;

--
-- Name: aportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aportes_id_seq OWNED BY public.aportes.id;


--
-- Name: balance_general; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.balance_general (
    id integer NOT NULL,
    socio_id integer,
    fecha date DEFAULT CURRENT_DATE,
    aporte_inicial numeric(15,2) DEFAULT 0,
    saldo_ahorros numeric(15,2) DEFAULT 0,
    retiro numeric(15,2) DEFAULT 0,
    interes_generado numeric(15,2) DEFAULT 0,
    activo_circulante numeric(15,2) DEFAULT 0,
    activo_fijo numeric(15,2) DEFAULT 0,
    pasivo_corto_plazo numeric(15,2) DEFAULT 0,
    pasivo_largo_plazo numeric(15,2) DEFAULT 0,
    patrimonio_neto numeric(15,2) DEFAULT 0,
    total_activo numeric(15,2) DEFAULT 0,
    total_pasivo numeric(15,2) DEFAULT 0,
    total_patrimonio numeric(15,2) DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.balance_general OWNER TO postgres;

--
-- Name: balance_general_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.balance_general_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.balance_general_id_seq OWNER TO postgres;

--
-- Name: balance_general_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.balance_general_id_seq OWNED BY public.balance_general.id;


--
-- Name: caja_chica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_chica (
    id integer NOT NULL,
    reunion integer DEFAULT 1,
    fecha date NOT NULL,
    descripcion text NOT NULL,
    ingresos numeric(10,2) DEFAULT 0,
    egresos numeric(10,2) DEFAULT 0,
    saldo numeric(10,2) DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.caja_chica OWNER TO postgres;

--
-- Name: caja_chica_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caja_chica_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caja_chica_id_seq OWNER TO postgres;

--
-- Name: caja_chica_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caja_chica_id_seq OWNED BY public.caja_chica.id;


--
-- Name: caja_general; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_general (
    id integer NOT NULL,
    concepto character varying(255),
    tipo character varying(20) NOT NULL,
    monto numeric(10,2) NOT NULL,
    responsable character varying(255),
    descripcion text,
    fecha date DEFAULT CURRENT_DATE,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.caja_general OWNER TO postgres;

--
-- Name: caja_general_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caja_general_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caja_general_id_seq OWNER TO postgres;

--
-- Name: caja_general_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caja_general_id_seq OWNED BY public.caja_general.id;


--
-- Name: cuerpo_normativo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuerpo_normativo (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion text,
    contenido text,
    tipo_documento character varying(100) NOT NULL,
    version character varying(50),
    fecha_vigencia date,
    archivo_url character varying(500),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cuerpo_normativo OWNER TO postgres;

--
-- Name: cuerpo_normativo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuerpo_normativo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuerpo_normativo_id_seq OWNER TO postgres;

--
-- Name: cuerpo_normativo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuerpo_normativo_id_seq OWNED BY public.cuerpo_normativo.id;


--
-- Name: directiva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directiva (
    id integer NOT NULL,
    cargo character varying(100) NOT NULL,
    nombre character varying(255) NOT NULL,
    telefono character varying(20),
    imagen_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.directiva OWNER TO postgres;

--
-- Name: directiva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directiva_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directiva_id_seq OWNER TO postgres;

--
-- Name: directiva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directiva_id_seq OWNED BY public.directiva.id;


--
-- Name: intereses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.intereses (
    id integer NOT NULL,
    socio_id integer,
    socio_nombre character varying(255) NOT NULL,
    anio character varying(4) NOT NULL,
    estado character varying(20) DEFAULT 'COBRADO'::character varying,
    enero numeric(10,2) DEFAULT 0,
    febrero numeric(10,2) DEFAULT 0,
    marzo numeric(10,2) DEFAULT 0,
    abril numeric(10,2) DEFAULT 0,
    mayo numeric(10,2) DEFAULT 0,
    junio numeric(10,2) DEFAULT 0,
    julio numeric(10,2) DEFAULT 0,
    agosto numeric(10,2) DEFAULT 0,
    septiembre numeric(10,2) DEFAULT 0,
    octubre numeric(10,2) DEFAULT 0,
    noviembre numeric(10,2) DEFAULT 0,
    diciembre numeric(10,2) DEFAULT 0,
    total_anio numeric(10,2) DEFAULT 0,
    orden integer DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.intereses OWNER TO postgres;

--
-- Name: intereses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.intereses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.intereses_id_seq OWNER TO postgres;

--
-- Name: intereses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.intereses_id_seq OWNED BY public.intereses.id;


--
-- Name: libretas_prestamos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libretas_prestamos (
    id integer NOT NULL,
    socio_id integer,
    socio_nombre character varying(255) NOT NULL,
    fecha_inicio date DEFAULT CURRENT_DATE,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.libretas_prestamos OWNER TO postgres;

--
-- Name: libretas_prestamos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.libretas_prestamos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.libretas_prestamos_id_seq OWNER TO postgres;

--
-- Name: libretas_prestamos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.libretas_prestamos_id_seq OWNED BY public.libretas_prestamos.id;


--
-- Name: normativa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.normativa (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion text,
    tipo_documento character varying(100) NOT NULL,
    archivo_url character varying(500),
    archivo_original character varying(255),
    archivo_hash character varying(128),
    tamano_archivo integer,
    usuario_creador character varying(100),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true
);


ALTER TABLE public.normativa OWNER TO postgres;

--
-- Name: normativa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.normativa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.normativa_id_seq OWNER TO postgres;

--
-- Name: normativa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.normativa_id_seq OWNED BY public.normativa.id;


--
-- Name: prestamos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prestamos (
    id integer NOT NULL,
    socio_id integer,
    prestatario character varying(255),
    monto numeric(10,2) NOT NULL,
    plazo integer NOT NULL,
    interes numeric(5,2) DEFAULT 5.0,
    descripcion text,
    estado character varying(20) DEFAULT 'activo'::character varying,
    pagado boolean DEFAULT false,
    fecha date DEFAULT CURRENT_DATE,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prestamos OWNER TO postgres;

--
-- Name: prestamos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prestamos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prestamos_id_seq OWNER TO postgres;

--
-- Name: prestamos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prestamos_id_seq OWNED BY public.prestamos.id;


--
-- Name: rapa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rapa (
    id integer NOT NULL,
    socio_id integer,
    socio_nombre character varying(255),
    mes character varying(20) DEFAULT 'SIN MES'::character varying,
    anio character varying(4) DEFAULT '2026'::character varying,
    asistencia boolean DEFAULT false,
    ahorro numeric(10,2) DEFAULT 0,
    retiro numeric(10,2) DEFAULT 0,
    saldo numeric(10,2) DEFAULT 0,
    concedido numeric(10,2) DEFAULT 0,
    interes numeric(10,2) DEFAULT 0,
    total_adeudado numeric(10,2) DEFAULT 0,
    pago_prestamo numeric(10,2) DEFAULT 0,
    saldo_prestamo numeric(10,2) DEFAULT 0,
    orden integer DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rapa OWNER TO postgres;

--
-- Name: rapa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rapa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rapa_id_seq OWNER TO postgres;

--
-- Name: rapa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rapa_id_seq OWNED BY public.rapa.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    token_hash character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    revoked_at timestamp without time zone
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: registro_aportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_aportes (
    id integer NOT NULL,
    socio_id integer,
    reporte_mes integer NOT NULL,
    reporte_anio integer NOT NULL,
    socio_nombre character varying(255),
    saldo_actual numeric(10,2) DEFAULT 0,
    deposito numeric(10,2) DEFAULT 0,
    aporte_inicial numeric(10,2) DEFAULT 0,
    retiro numeric(10,2) DEFAULT 0,
    saldo_ahorros numeric(10,2) DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.registro_aportes OWNER TO postgres;

--
-- Name: registro_aportes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registro_aportes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_aportes_id_seq OWNER TO postgres;

--
-- Name: registro_aportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registro_aportes_id_seq OWNED BY public.registro_aportes.id;


--
-- Name: registro_prestamos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_prestamos (
    id integer NOT NULL,
    mes character varying(20) DEFAULT 'SIN MES'::character varying,
    anio character varying(4) DEFAULT '2026'::character varying,
    socio character varying(255) NOT NULL,
    concedido numeric(10,2) DEFAULT 0,
    interes numeric(10,2) DEFAULT 0,
    total_adeudado numeric(10,2) DEFAULT 0,
    pago_prestamo numeric(10,2) DEFAULT 0,
    mora numeric(10,2) DEFAULT 0,
    saldo numeric(10,2) DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.registro_prestamos OWNER TO postgres;

--
-- Name: registro_prestamos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registro_prestamos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_prestamos_id_seq OWNER TO postgres;

--
-- Name: registro_prestamos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registro_prestamos_id_seq OWNED BY public.registro_prestamos.id;


--
-- Name: socios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.socios (
    id integer NOT NULL,
    numero_socio integer NOT NULL,
    nombre_completo character varying(100) NOT NULL,
    cedula character varying(20) NOT NULL,
    telefono character varying(20),
    mes_ingreso character varying(20),
    ahorro_mensual numeric(10,2) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.socios OWNER TO postgres;

--
-- Name: socios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.socios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.socios_id_seq OWNER TO postgres;

--
-- Name: socios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.socios_id_seq OWNED BY public.socios.id;


--
-- Name: administradores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores ALTER COLUMN id SET DEFAULT nextval('public.administradores_id_seq'::regclass);


--
-- Name: aportes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aportes ALTER COLUMN id SET DEFAULT nextval('public.aportes_id_seq'::regclass);


--
-- Name: balance_general id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_general ALTER COLUMN id SET DEFAULT nextval('public.balance_general_id_seq'::regclass);


--
-- Name: caja_chica id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_chica ALTER COLUMN id SET DEFAULT nextval('public.caja_chica_id_seq'::regclass);


--
-- Name: caja_general id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_general ALTER COLUMN id SET DEFAULT nextval('public.caja_general_id_seq'::regclass);


--
-- Name: cuerpo_normativo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuerpo_normativo ALTER COLUMN id SET DEFAULT nextval('public.cuerpo_normativo_id_seq'::regclass);


--
-- Name: directiva id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directiva ALTER COLUMN id SET DEFAULT nextval('public.directiva_id_seq'::regclass);


--
-- Name: intereses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intereses ALTER COLUMN id SET DEFAULT nextval('public.intereses_id_seq'::regclass);


--
-- Name: libretas_prestamos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libretas_prestamos ALTER COLUMN id SET DEFAULT nextval('public.libretas_prestamos_id_seq'::regclass);


--
-- Name: normativa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.normativa ALTER COLUMN id SET DEFAULT nextval('public.normativa_id_seq'::regclass);


--
-- Name: prestamos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos ALTER COLUMN id SET DEFAULT nextval('public.prestamos_id_seq'::regclass);


--
-- Name: rapa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapa ALTER COLUMN id SET DEFAULT nextval('public.rapa_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: registro_aportes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_aportes ALTER COLUMN id SET DEFAULT nextval('public.registro_aportes_id_seq'::regclass);


--
-- Name: registro_prestamos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_prestamos ALTER COLUMN id SET DEFAULT nextval('public.registro_prestamos_id_seq'::regclass);


--
-- Name: socios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socios ALTER COLUMN id SET DEFAULT nextval('public.socios_id_seq'::regclass);


--
-- Data for Name: administradores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administradores (id, nombre, email, contrasena, created_at) FROM stdin;
1	mariasdb	maria@gmail.com	12345678	2026-06-24 15:01:54.542613
\.


--
-- Data for Name: aportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aportes (id, socio_id, monto, mes, anio, tipo, descripcion, estado, fecha, fecha_registro, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: balance_general; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.balance_general (id, socio_id, fecha, aporte_inicial, saldo_ahorros, retiro, interes_generado, activo_circulante, activo_fijo, pasivo_corto_plazo, pasivo_largo_plazo, patrimonio_neto, total_activo, total_pasivo, total_patrimonio, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: caja_chica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caja_chica (id, reunion, fecha, descripcion, ingresos, egresos, saldo, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: caja_general; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caja_general (id, concepto, tipo, monto, responsable, descripcion, fecha, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: cuerpo_normativo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuerpo_normativo (id, titulo, descripcion, contenido, tipo_documento, version, fecha_vigencia, archivo_url, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: directiva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directiva (id, cargo, nombre, telefono, imagen_url, created_at) FROM stdin;
\.


--
-- Data for Name: intereses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.intereses (id, socio_id, socio_nombre, anio, estado, enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre, total_anio, orden, fecha_creacion, fecha_actualizacion) FROM stdin;
1	1	jkjghjgkgl	2022	PENDIENTE	45.00	0.00	0.00	56.00	0.00	34.00	0.00	56.00	0.00	0.00	0.00	0.00	191.00	0	2026-07-12 21:57:40.717022	2026-07-12 21:57:40.717022
\.


--
-- Data for Name: libretas_prestamos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libretas_prestamos (id, socio_id, socio_nombre, fecha_inicio, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: normativa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.normativa (id, titulo, descripcion, tipo_documento, archivo_url, archivo_original, archivo_hash, tamano_archivo, usuario_creador, fecha_creacion, fecha_actualizacion, activo) FROM stdin;
\.


--
-- Data for Name: prestamos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prestamos (id, socio_id, prestatario, monto, plazo, interes, descripcion, estado, pagado, fecha, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: rapa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rapa (id, socio_id, socio_nombre, mes, anio, asistencia, ahorro, retiro, saldo, concedido, interes, total_adeudado, pago_prestamo, saldo_prestamo, orden, fecha_creacion, fecha_actualizacion) FROM stdin;
1	1	jkjghjgkgl	ABRIL	2021	t	4.00	45.00	-41.00	0.00	56.00	56.00	0.00	56.00	0	2026-07-12 21:57:20.097032	2026-07-12 21:57:20.097032
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, admin_id, token_hash, expires_at, created_at, revoked_at) FROM stdin;
1	1	7522604d4406040adea00c5c1c95b0f94474035c0299f947f5f2198617da5595	2026-07-01 15:02:08.279	2026-06-24 15:02:08.280218	\N
2	1	c13dda1a5d3ce1780b647fcf46906219d2aa75b996c395b5cb8ef0ffa6c62eab	2026-07-01 23:50:15.328	2026-06-24 23:50:15.329577	\N
3	1	4db28dcfd9f8abb6ca7deeabe2c4f2f1c073119c82db02cfce2f3792b7fec1db	2026-07-12 16:34:53.889	2026-07-05 16:34:53.890836	2026-07-05 16:55:45.258849
4	1	369ed559b96de7f56bebffe8887fdfc98445e9d4e29fe1fb31e97995cf00f225	2026-07-12 16:56:00.596	2026-07-05 16:56:00.597748	\N
5	1	3483e4f2cb41c6606232dff892e89ac1ecd78134751595ca34b27b99a6433839	2026-07-19 21:56:49.238	2026-07-12 21:56:49.240089	\N
\.


--
-- Data for Name: registro_aportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_aportes (id, socio_id, reporte_mes, reporte_anio, socio_nombre, saldo_actual, deposito, aporte_inicial, retiro, saldo_ahorros, fecha_creacion) FROM stdin;
1	1	2	2026	jkjghjgkgl	34.00	0.00	0.00	0.00	34.00	2026-07-05 18:44:20.573215
\.


--
-- Data for Name: registro_prestamos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_prestamos (id, mes, anio, socio, concedido, interes, total_adeudado, pago_prestamo, mora, saldo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	ENERO	2024	jkjghjgkgl	78.00	0.00	78.00	0.00	0.00	78.00	2026-07-05 18:37:04.619213	2026-07-05 18:37:04.619213
2	ENERO	2024	jkjghjgkgl	78.00	0.00	78.00	89.00	0.00	-11.00	2026-07-05 18:37:18.295558	2026-07-05 18:37:18.295558
\.


--
-- Data for Name: socios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.socios (id, numero_socio, nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual, fecha_creacion, fecha_actualizacion) FROM stdin;
1	1	jkjghjgkgl	8888888888	8888888888	2026-08	70.00	2026-06-25 00:14:34.406825	2026-06-25 00:14:34.406825
\.


--
-- Name: administradores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administradores_id_seq', 1, true);


--
-- Name: aportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aportes_id_seq', 1, false);


--
-- Name: balance_general_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.balance_general_id_seq', 1, false);


--
-- Name: caja_chica_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caja_chica_id_seq', 1, false);


--
-- Name: caja_general_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caja_general_id_seq', 1, false);


--
-- Name: cuerpo_normativo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuerpo_normativo_id_seq', 1, false);


--
-- Name: directiva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directiva_id_seq', 1, false);


--
-- Name: intereses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.intereses_id_seq', 1, true);


--
-- Name: libretas_prestamos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libretas_prestamos_id_seq', 1, false);


--
-- Name: normativa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.normativa_id_seq', 1, false);


--
-- Name: prestamos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_id_seq', 1, false);


--
-- Name: rapa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rapa_id_seq', 1, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 5, true);


--
-- Name: registro_aportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_aportes_id_seq', 1, true);


--
-- Name: registro_prestamos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_prestamos_id_seq', 2, true);


--
-- Name: socios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.socios_id_seq', 1, true);


--
-- Name: administradores administradores_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_email_key UNIQUE (email);


--
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (id);


--
-- Name: aportes aportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aportes
    ADD CONSTRAINT aportes_pkey PRIMARY KEY (id);


--
-- Name: balance_general balance_general_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_general
    ADD CONSTRAINT balance_general_pkey PRIMARY KEY (id);


--
-- Name: caja_chica caja_chica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_chica
    ADD CONSTRAINT caja_chica_pkey PRIMARY KEY (id);


--
-- Name: caja_general caja_general_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_general
    ADD CONSTRAINT caja_general_pkey PRIMARY KEY (id);


--
-- Name: cuerpo_normativo cuerpo_normativo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuerpo_normativo
    ADD CONSTRAINT cuerpo_normativo_pkey PRIMARY KEY (id);


--
-- Name: directiva directiva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directiva
    ADD CONSTRAINT directiva_pkey PRIMARY KEY (id);


--
-- Name: intereses intereses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intereses
    ADD CONSTRAINT intereses_pkey PRIMARY KEY (id);


--
-- Name: libretas_prestamos libretas_prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libretas_prestamos
    ADD CONSTRAINT libretas_prestamos_pkey PRIMARY KEY (id);


--
-- Name: normativa normativa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.normativa
    ADD CONSTRAINT normativa_pkey PRIMARY KEY (id);


--
-- Name: prestamos prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_pkey PRIMARY KEY (id);


--
-- Name: rapa rapa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapa
    ADD CONSTRAINT rapa_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: registro_aportes registro_aportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_aportes
    ADD CONSTRAINT registro_aportes_pkey PRIMARY KEY (id);


--
-- Name: registro_prestamos registro_prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_prestamos
    ADD CONSTRAINT registro_prestamos_pkey PRIMARY KEY (id);


--
-- Name: socios socios_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socios
    ADD CONSTRAINT socios_cedula_key UNIQUE (cedula);


--
-- Name: socios socios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socios
    ADD CONSTRAINT socios_pkey PRIMARY KEY (id);


--
-- Name: idx_aportes_socio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_aportes_socio_id ON public.aportes USING btree (socio_id);


--
-- Name: idx_balance_general_socio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_balance_general_socio_id ON public.balance_general USING btree (socio_id);


--
-- Name: idx_libretas_prestamos_socio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_libretas_prestamos_socio_id ON public.libretas_prestamos USING btree (socio_id);


--
-- Name: idx_normativa_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_normativa_activo ON public.normativa USING btree (activo);


--
-- Name: idx_normativa_fecha_creacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_normativa_fecha_creacion ON public.normativa USING btree (fecha_creacion);


--
-- Name: idx_normativa_tipo_documento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_normativa_tipo_documento ON public.normativa USING btree (tipo_documento);


--
-- Name: idx_prestamos_socio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prestamos_socio_id ON public.prestamos USING btree (socio_id);


--
-- Name: idx_refresh_tokens_admin_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_admin_id ON public.refresh_tokens USING btree (admin_id);


--
-- Name: idx_refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_expires_at ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_registro_aportes_mes_anio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registro_aportes_mes_anio ON public.registro_aportes USING btree (reporte_mes, reporte_anio);


--
-- Name: idx_registro_aportes_socio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registro_aportes_socio_id ON public.registro_aportes USING btree (socio_id);


--
-- Name: aportes aportes_socio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aportes
    ADD CONSTRAINT aportes_socio_id_fkey FOREIGN KEY (socio_id) REFERENCES public.socios(id) ON DELETE CASCADE;


--
-- Name: balance_general balance_general_socio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_general
    ADD CONSTRAINT balance_general_socio_id_fkey FOREIGN KEY (socio_id) REFERENCES public.socios(id) ON DELETE SET NULL;


--
-- Name: intereses intereses_socio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intereses
    ADD CONSTRAINT intereses_socio_id_fkey FOREIGN KEY (socio_id) REFERENCES public.socios(id) ON DELETE SET NULL;


--
-- Name: libretas_prestamos libretas_prestamos_socio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libretas_prestamos
    ADD CONSTRAINT libretas_prestamos_socio_id_fkey FOREIGN KEY (socio_id) REFERENCES public.socios(id) ON DELETE CASCADE;


--
-- Name: prestamos prestamos_socio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_socio_id_fkey FOREIGN KEY (socio_id) REFERENCES public.socios(id) ON DELETE SET NULL;


--
-- Name: rapa rapa_socio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapa
    ADD CONSTRAINT rapa_socio_id_fkey FOREIGN KEY (socio_id) REFERENCES public.socios(id) ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.administradores(id) ON DELETE CASCADE;


--
-- Name: registro_aportes registro_aportes_socio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_aportes
    ADD CONSTRAINT registro_aportes_socio_id_fkey FOREIGN KEY (socio_id) REFERENCES public.socios(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict NNsUMheBfs4Va56fK5ye06MgSXXO3nOcAWwDzAecOvuVJSHZ9MSHDipEihjXjDg

