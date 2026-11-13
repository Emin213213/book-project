import {INestApplication} from '@nestjs/common'
import {DocumentBuilder, SwaggerModule, OpenAPIObject} from '@nestjs/swagger'
import type {Request, Response} from 'express'

const RELAXED_CSP =
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; " +
    "font-src 'self' https: data:; img-src 'self' data: https:; connect-src 'self'; worker-src 'self' blob:; child-src 'self' blob:"

const ELEMENTS_JS = require.resolve('@stoplight/elements/web-components.min.js')
const ELEMENTS_CSS = require.resolve('@stoplight/elements/styles.min.css')
const REDOC_BUNDLE = require.resolve('redoc/bundles/redoc.standalone.js')

function topnav(active: string, base: string): string {
    const link = (href: string, label: string) =>
        `<a href="${href}"${active === href ? ' style="background:#1d4ed8;color:#fff"' : ''}>${label}</a>`
    return `<div class="topnav"><span class="brand">📘 Blog API</span><span class="badge">v1.0.0</span>
    <span style="flex:1"></span>${link(`${base}/docs`, 'Reference')}${link(`${base}/redoc`, 'Redoc')}${link(`${base}/swagger`, 'Swagger')}
    <a href="${base}/openapi.json">openapi.json</a></div>`
}

const NAV_CSS = `body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif}
.topnav{display:flex;align-items:center;gap:12px;padding:10px 20px;background:#0f172a;color:#fff}
.topnav .brand{font-weight:700}.topnav .badge{background:#1e293b;border-radius:999px;padding:2px 10px;font-size:12px;color:#cbd5e1}
.topnav a{color:#93c5fd;text-decoration:none;font-weight:500;font-size:14px;padding:4px 8px;border-radius:6px}`

function elementsPage(base: string): string {
    return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Blog API — Reference</title><link rel="stylesheet" href="${base}/docs/elements/styles.min.css"/>
<style>${NAV_CSS} html,body{height:100%} elements-api{display:block;height:calc(100vh - 45px)}</style></head>
<body>${topnav(`${base}/docs`, base)}
<elements-api apiDescriptionUrl="${base}/openapi.json" router="hash" layout="sidebar" hideSchemas="true"></elements-api>
<script src="${base}/docs/elements/web-components.min.js"></script></body></html>`
}

function redocPage(base: string): string {
    return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Blog API — Redoc</title><style>${NAV_CSS}</style></head>
<body>${topnav(`${base}/redoc`, base)}<div id="redoc"></div>
<script src="${base}/redoc/redoc.standalone.js"></script>
<script>Redoc.init('${base}/openapi.json', { expandResponses: '200,201' }, document.getElementById('redoc'));</script>
</body></html>`
}

export function setupDocs(app: INestApplication, basePath = ''): OpenAPIObject {
    // Normalize: '' | '/api/v1' (leading slash, no trailing slash).
    const base = basePath ? '/' + basePath.replace(/^\/+|\/+$/g, '') : ''

    const config = new DocumentBuilder()
        .setTitle('Blog API')
        .setVersion('1.0.0')
        .addServer('api/v1')
        .setDescription(
            [
                'REST API for a blog: authentication, role-based access, categories, and posts.',
                '',
                '**Base path:** all endpoints are served under `/api`.',
                '',
                '**Authentication:** obtain a JWT via `POST /api/auth/register` or `POST /api/auth/login`,',
                'then send it as `Authorization: Bearer <token>`. Endpoints marked with a lock require it;',
                'some public endpoints (e.g. listing posts) use the token, when present, to widen visibility.',
                '',
                '**Roles:** `USER` (default) and `ADMIN`. Category writes are admin-only;',
                'post writes are restricted to the author or an admin.',
                '',
                '**Errors:** every non-2xx response uses a single envelope —',
                '`{ "error": { "code": string, "message": string, "details": object[] | null } }`.',
                'Branch on the stable `code`, not the human-readable `message`.',
                '',
                '**Rate limiting:** auth endpoints allow 100 requests per 15-minute window per client.',
            ].join('\n'),
        )
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)

    const http = app.getHttpAdapter()

    // Raw spec.
    http.get(`${base}/openapi.json`, (_req: Request, res: Response) => res.json(document))

    // Swagger UI at {base}/swagger.
    SwaggerModule.setup(`${base}/swagger`, app, document, {
        customSiteTitle: 'Blog API — Swagger UI',
        swaggerOptions: {defaultModelsExpandDepth: -1},
    })

    // Stoplight Elements (primary) at {base}/docs + local assets.
    const sendCsp = (res: Response) => res.setHeader('Content-Security-Policy', RELAXED_CSP)
    http.get(`${base}/docs/elements/web-components.min.js`, (_req: Request, res: Response) => {
        sendCsp(res);
        res.sendFile(ELEMENTS_JS)
    })
    http.get(`${base}/docs/elements/styles.min.css`, (_req: Request, res: Response) => {
        sendCsp(res);
        res.sendFile(ELEMENTS_CSS)
    })
    http.get(`${base}/docs`, (_req: Request, res: Response) => {
        sendCsp(res);
        res.type('html').send(elementsPage(base))
    })

    // Redoc at {base}/redoc + local bundle.
    http.get(`${base}/redoc/redoc.standalone.js`, (_req: Request, res: Response) => {
        sendCsp(res);
        res.sendFile(REDOC_BUNDLE)
    })
    http.get(`${base}/redoc`, (_req: Request, res: Response) => {
        sendCsp(res);
        res.type('html').send(redocPage(base))
    })

    return document
}
