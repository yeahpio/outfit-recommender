--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-07-13 22:20:56

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
-- TOC entry 219 (class 1259 OID 16609)
-- Name: default_wardrobe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.default_wardrobe (
    id_default integer NOT NULL,
    nama_pakaian character varying(100) NOT NULL,
    kategori character varying(20) NOT NULL,
    style character varying(20) NOT NULL,
    warna_grup character varying(20) NOT NULL,
    image_url text
);


ALTER TABLE public.default_wardrobe OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16608)
-- Name: default_wardrobe_id_default_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.default_wardrobe_id_default_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.default_wardrobe_id_default_seq OWNER TO postgres;

--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 218
-- Name: default_wardrobe_id_default_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.default_wardrobe_id_default_seq OWNED BY public.default_wardrobe.id_default;


--
-- TOC entry 4752 (class 2604 OID 16612)
-- Name: default_wardrobe id_default; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_wardrobe ALTER COLUMN id_default SET DEFAULT nextval('public.default_wardrobe_id_default_seq'::regclass);


--
-- TOC entry 4901 (class 0 OID 16609)
-- Dependencies: 219
-- Data for Name: default_wardrobe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.default_wardrobe (id_default, nama_pakaian, kategori, style, warna_grup, image_url) FROM stdin;
1	Kemeja Putih	atasan	formal	neutral	static/default/white-shirt.webp
11	Sweater Merah	atasan	casual	warm	static/default/red-sweater.webp
3	Kaos Hitam	atasan	casual	neutral	static/default/black-tshirt.webp
4	Hoodie Biru	atasan	sporty	cool	static/default/blue-hoodie.webp
5	Celana Bahan Hitam	bawahan	formal	neutral	static/default/black-trousers.webp
6	Celana Jeans Biru	bawahan	casual	cool	static/default/blue-jeans.jpg
12	Cardigan Biru	atasan	casual	cool	static/default/blue-cardigan.jfif
13	Kemeja Oxford Biru	atasan	formal	cool	static/default/blue-oxford-shirt.webp
14	Polo Shirt Putih	atasan	sporty	neutral	static/default/white-polo-shirt.avif
15	Training Jacket Merah	atasan	sporty	warm	static/default/red-track-jacket.webp
17	Celana Cargo Hitam	bawahan	casual	neutral	static/default/black-cargo-pants.jfif
18	Celana Bahan Coklat	bawahan	formal	warm	static/default/brown-trousers.webp
19	Celana Bahan Navy	bawahan	formal	cool	static/default/navy-trousers.jfif
20	Celana Training Merah	bawahan	sporty	warm	static/default/red-track-pants.webp
21	Celana Track Biru	bawahan	sporty	cool	static/default/blue-track-pants.webp
23	Canvas Shoes Biru	sepatu	casual	cool	static/default/blue-canvas-shoes.jfif
24	Oxford Shoes Coklat	sepatu	formal	warm	static/default/brown-oxford-shoes.jfif
25	Oxford Shoes Navy	sepatu	formal	cool	static/default/navy-oxford-shoes.jfif
26	Basketball Shoes Merah	sepatu	sporty	warm	static/default/red-basketball-shoes.jfif
27	Basketball Shoes Biru	sepatu	sporty	cool	static/default/blue-basketball-shoes.jfif
8	Loafers Hitam	sepatu	formal	neutral	static/default/black-loafers.webp
7	Jogger Abu-abu	bawahan	sporty	neutral	static/default/gray-jogger.jpg
16	Celana Chino Coklat	bawahan	casual	warm	static/default/brown-chinos.webp
2	Blouse Beige	atasan	formal	warm	static/default/beige-blouse.jfif
22	Canvas Shoes Merah	sepatu	casual	warm	static/default/red-canvas-shoes.webp
9	Sneakers Putih	sepatu	casual	neutral	static/default/white-sneakers.jfif
10	Running Shoes Abu-abu	sepatu	sporty	neutral	static/default/gray-rshoes.jfif
\.


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 218
-- Name: default_wardrobe_id_default_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.default_wardrobe_id_default_seq', 27, true);


--
-- TOC entry 4754 (class 2606 OID 16614)
-- Name: default_wardrobe default_wardrobe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_wardrobe
    ADD CONSTRAINT default_wardrobe_pkey PRIMARY KEY (id_default);


-- Completed on 2026-07-13 22:20:57

--
-- PostgreSQL database dump complete
--

