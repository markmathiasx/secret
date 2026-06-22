# Commerce OS Production Public Validation

Generated at: 2026-06-22T06:31:20.728Z
Overall: PASS

## Base URLs
- http://127.0.0.1:3000

## HTML routes

| Base | Route | Status | Count | Result |
| --- | --- | ---: | ---: | --- |
| http://127.0.0.1:3000 | / | 200 | 843 | PASS |
| http://127.0.0.1:3000 | /loja | 200 |  | PASS |
| http://127.0.0.1:3000 | /ofertas | 200 |  | PASS |
| http://127.0.0.1:3000 | /catalogo | 200 | 843 | PASS |
| http://127.0.0.1:3000 | /sob-medida | 200 |  | PASS |
| http://127.0.0.1:3000 | /jogue | 200 |  | PASS |
| http://127.0.0.1:3000 | /como-funciona | 200 |  | PASS |
| http://127.0.0.1:3000 | /blog | 200 |  | PASS |
| http://127.0.0.1:3000 | /atendimento | 200 | 843 | PASS |

## Feeds

| Base | Route | Status | Items | Content-Type | Result |
| --- | --- | ---: | ---: | --- | --- |
| http://127.0.0.1:3000 | /meta/catalog.csv | 200 | 840 | text/csv; charset=utf-8 | PASS |
| http://127.0.0.1:3000 | /feeds/google-shopping.xml | 200 | 306 | application/xml; charset=utf-8 | PASS |
| http://127.0.0.1:3000 | /feeds/products.json | 200 | 306 | application/json | PASS |
| http://127.0.0.1:3000 | /sitemap-products.xml | 200 | 1149 | application/xml; charset=utf-8 | PASS |

## Count consistency

Official counts found: 843, 843, 843
Counts consistent: yes

