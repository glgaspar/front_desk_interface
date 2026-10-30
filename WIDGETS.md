# Writing your own widget

A widget is one `.tsx` file in `src/app/widgets/components/`. Drop the file in, run the app, and it shows up on the Widgets page.

If your widget needs to talk to some service (Gitea, Home Assistant, Prowlarr, anything with an HTTP API), you **don't need to touch the backend**. The widget says what it needs at the top of the file, an admin fills that in on the Widgets page, and Front Desk makes the calls for it.

This guide is for widgets without official support: written by you, for a service the backend knows nothing about. `src/app/widgets/components/gitea.tsx` is a complete working example. Keep it open while you read.

- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Anatomy of a widget file](#anatomy-of-a-widget-file)
- [The manifest](#the-manifest)
- [Calling the service](#calling-the-service)
- [The states every widget goes through](#the-states-every-widget-goes-through)
- [What you can import](#what-you-can-import)
- [Security: what Front Desk enforces](#security-what-front-desk-enforces)
- [Limits](#limits)
- [When this is not enough](#when-this-is-not-enough)
- [Checklist before you share it](#checklist-before-you-share-it)
- [Troubleshooting](#troubleshooting)

## How it works

The browser never talks to your service directly. That wouldn't work anyway: the service is usually on your LAN, it doesn't allow calls from another site (CORS), and its API key would be readable by anyone with the page open. Instead, every call goes through the Front Desk API:

```
your widget                       Front Desk API                          your service
-----------                       --------------                          ------------
useWidgetApi('/api/v1/...')  -->  POST /widgets/gitea/call
                                  loads what an admin saved for "gitea":
                                    url   = https://git.example.com
                                    token = ********
                                  checks the path is allowed
                                  builds https://git.example.com/api/v1/...
                                  adds  Authorization: token ********  -->  GET /api/v1/...
data, error  <------------------  sends the answer back  <--------------  200 [ ... ]
```

The API doesn't know what Gitea is. It only follows the **manifest**, the small object your widget exports, which says:

- which fields an admin has to fill in (the url, a token...)
- how those values are sent (a header, a query param, basic auth)
- which paths the widget is allowed to call, and which of them are admin-only

The manifest is saved **together with the values** when an admin clicks Save, and from then on the API only uses that saved copy. The browser never sends the manifest again when making calls, so nobody can change where a call goes or what is attached to it from the browser.

## Quick start

1. Create `src/app/widgets/components/my_widget.tsx`. The file name is the widget name: lowercase letters, numbers and `_`, up to 50 characters. The title on the card is the name in uppercase, `MY WIDGET`.
2. Export a manifest called `config` and a default component (see the next section).
3. Run `npm run dev`. `generate-widgets.js` runs first and picks up the new file.
4. Open **Widgets**, turn on **Edit Mode** and click **Enable** on your widget.
5. Open its gear menu, click **Configure**, fill in the fields and click **Save**. Configure only shows for admins.
6. That's it. Use **Attach to home** if you want it on the home page (at most 5 widgets there).

No backend restart or rebuild is needed for a new widget. The backend already has everything it needs.

## Anatomy of a widget file

A shortened version of the Gitea widget:

```tsx
"use client";

import React from 'react'
import { defineWidget, useWidgetApi } from '../sdk';

// 1. the manifest: what the admin fills in, how it is sent, what can be called
export const config = defineWidget({
  fields: {
    url: { label: 'Gitea url', placeholder: 'https://git.example.com' },
    token: { label: 'Access token', secret: true },
  },
  auth: { headers: { Authorization: 'token {token}' } },
  allow: [{ method: 'GET', path: '/api/v1/repos/issues/search' }],
});

// 2. the shape of what the service answers, only the parts you use
interface Issue {
  id: number
  title: string
  html_url: string
}

// 3. fake data, shown while the widget is disabled so people can see what it looks like
const demo: Issue[] = [
  { id: 1, title: 'fix the thing', html_url: '#' },
];

// 4. the component. it receives `enabled`
export default function Gitea({ enabled = false }: { enabled?: boolean }) {
  const { data, error } = useWidgetApi<Issue[]>('/api/v1/repos/issues/search?state=open', { interval: 300000 });
  const items = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!items) return null;   // first load

  return (
    <div className="flex flex-col gap-1 w-full px-3 pb-3 text-xs">
      {items.map(issue => <a key={issue.id} href={issue.html_url}>{issue.title}</a>)}
    </div>
  )
}
```

The rules:

- **`"use client";`** on the first line. Widgets run in the browser.
- **`export const config`**, exactly that name. It's how the generator finds your manifest. A widget that doesn't talk to any service (a clock, a link list) just doesn't export it, and then there's no Configure item.
- **`export default`** the component.
- **Demo data when `enabled` is false.** Every widget does this. The "Not enabled widgets" list in Edit Mode shows them with fake data, so people can decide whether they want it.

## The manifest

```ts
interface WidgetManifest {
  fields: { url: WidgetField } & Record<string, WidgetField>
  auth?: {
    headers?: Record<string, string>
    query?: Record<string, string>
    basic?: { username: string, password: string }
  }
  allow?: WidgetRule[]
}
```

Wrap it in `defineWidget(...)`. That function does nothing at runtime, but it makes your editor check the manifest while you type.

### `fields`

What the admin fills in on Configure. The key is the name you use in `auth` templates, and the order you write them in is the order of the form (except `url`, which always comes first).

```ts
fields: {
  url:    { label: 'Url', placeholder: 'http://192.168.0.10:8989' },
  apiKey: { label: 'API key', secret: true },
  user:   { label: 'Username', optional: true },
}
```

| Property | Meaning |
|---|---|
| `label` | Text above the input. Say where to find the value, e.g. `'API key (Settings > General)'`. |
| `placeholder` | Example value shown inside the empty input. |
| `secret` | Stored on the API and **never sent back to the browser**. The input is a password field, and after saving it shows `(unchanged)`. Leaving it empty on a later save keeps the saved value. |
| `optional` | Can be left empty. Required fields block the Save button. |

`url` is **mandatory**. It's the base every call is glued to, so it has to be `http://` or `https://` with a host. It can carry a base path (`https://example.com/prowlarr`), and that path is kept: calling `/api/v1/indexer` goes to `https://example.com/prowlarr/api/v1/indexer`. A trailing `/` is removed for you.

### `auth`

How the values reach the service. Write `{fieldName}` anywhere in a value and it's replaced with what the admin saved.

**A header**, the most common case (Sonarr, Radarr, Prowlarr, Bazarr...):

```ts
auth: { headers: { 'X-Api-Key': '{apiKey}' } }
```

**Bearer token** (Home Assistant, Tailscale...):

```ts
auth: { headers: { Authorization: 'Bearer {token}' } }
```

**A custom scheme** (Gitea):

```ts
auth: { headers: { Authorization: 'token {token}' } }
```

**Query param**, for APIs that want `?apikey=...`:

```ts
auth: { query: { apikey: '{apiKey}' } }
```

**Basic auth**:

```ts
auth: { basic: { username: '{user}', password: '{password}' } }
```

You can combine them. A header or query param whose value comes out empty (an optional key that wasn't filled in) is **not sent at all**, instead of being sent empty. So `'x-api-key': '{apiKey}'` with an optional `apiKey` works for a service that only sometimes has auth turned on.

### `allow`

Which calls the widget may make. Each rule is a method plus a path **prefix**:

```ts
allow: [
  { method: 'GET',  path: '/api/v1/indexer' },               // /api/v1/indexer, /api/v1/indexerstatus, /api/v1/indexer/3...
  { method: 'POST', path: '/api/v1/indexer/test', admin: true },
]
```

- The prefix is matched against the path **without** the query string.
- **`admin: true`** means only admins can make that call. Use it for anything that changes something on the other side (restart, approve, delete, test, trigger). Regular users get an error.
- **If you leave `allow` out**, the widget can only `GET`, on any path under the url.
- Keep the list as narrow as you can. It's what an admin is agreeing to when they click Save.

Some APIs use `POST` just to read (Tdarr's statistics are a `POST`). That's fine: list it without `admin`.

### Changing the manifest later

When a widget loads, it compares the manifest in the file with the one saved by the admin. If they differ in any way (a new field, a new path, a changed header), the widget stops making calls and shows:

> This widget changed since it was configured. An admin needs to open Configure and save again.

That's on purpose. An updated widget file can't quietly start calling new paths or sending keys somewhere new until an admin has seen the new manifest. Saving again keeps the secrets already stored, as long as the field names didn't change.

## Calling the service

Import from `../sdk`.

### `useWidgetApi<T>(path, options?)`

Calls the service and keeps calling it every `interval`. Use it for whatever the widget displays.

```ts
const { data, error, reload } = useWidgetApi<Issue[]>('/api/v1/repos/issues/search?state=open', {
  method: 'GET',     // default GET
  body: undefined,   // anything JSON, sent to the service as the request body
  interval: 300000,  // ms between calls, default 60000
});
```

| Returns | |
|---|---|
| `data` | What the service answered: parsed JSON when it's JSON, a plain string otherwise. `null` until the first answer arrives. |
| `error` | `''`, or a message you can show as is: not configured, manifest changed, the service answered 500, path not allowed... |
| `reload()` | Calls again right now, for example after an action. |

- It does nothing while the widget is disabled, which is when you show the demo data.
- Pick an `interval` that matches how fast the data changes. Every widget on the page polls, and every poll is a request to your service. Something like open issues can be every 5 minutes. Something like live download speed can be every 5 seconds.
- Passing a `body` makes it a POST-style read:

```ts
useWidgetApi<Stats>('/api/v2/cruddb', {
  method: 'POST',
  body: { data: { collection: 'StatisticsJSONDB', mode: 'getById', docID: 'statistics' } },
});
```

### `useWidgetAction()`

For buttons. Returns a function that makes **one** call and resolves with the answer, or rejects with the API's error.

```tsx
const call = useWidgetAction();
const { data, reload } = useWidgetApi<Indexer[]>('/api/v1/indexer');

function test(indexer: Indexer) {
  call('POST', '/api/v1/indexer/test', indexer)
    .then(() => toast.success(indexer.name + ' works'))
    .catch(err => toast.error(err?.response?.data?.message || 'Test failed'))
    .finally(reload);
}
```

Actions are usually `admin: true` in `allow`. Hide the button from everyone else with `useUser()`:

```tsx
import { useUser } from '@/Components/User';
const { isAdmin } = useUser();
{isAdmin && <button onClick={() => test(indexer)}>test</button>}
```

Hiding it is only for good UX. The API refuses non-admins either way.

### `useWidget()`

Rarely needed. Returns `{ name, manifest, enabled, status, refresh }`, where `status` is `'loading' | 'ready' | 'unconfigured' | 'outdated'`. Use it if you want a custom screen for "not configured" instead of the default error message.

## The states every widget goes through

| Situation | What `useWidgetApi` gives you | What you show |
|---|---|---|
| Disabled (Edit Mode list) | nothing happens | your demo data |
| Enabled, never configured | `error` = "Not configured yet..." | the error |
| Enabled, manifest changed since the last save | `error` = "This widget changed since..." | the error |
| First call in flight | `data === null`, `error === ''` | nothing, or a spinner |
| Service answered | `data` | the real thing |
| Service down or answered 4xx/5xx | `error` = "gitea answered 401: ..." | the error |
| Answered nothing (empty list) | `data` = `[]` | an "all clear" message, see `gitea.tsx` |

Show `error` as is, since the messages are written for whoever is looking at the page. The pattern used by every widget in this folder:

```tsx
if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
if (!items) return null;
```

## What you can import

Anything already in the project. The ones widgets usually need:

| Import | What for |
|---|---|
| `../sdk` | `defineWidget`, `useWidgetApi`, `useWidgetAction`, `useWidget` |
| `../service` | `timeAgo(date)` ("5m ago"), `daysUntil(date)`, `<Dot critical />` (red/amber status dot) |
| `../TorrentItem` | `formatBytes(n)`, `formatSpeed(n)` |
| `@/Components/User` | `useUser()` → `{ user, isAdmin }` |
| `@/Components/ProgressBar` | `<ProgressBar percentage={42} color="#4ade80" className="h-1.5" />` |
| `@/Utils/usageColor` | `getUsageColor(percent)`: green, yellow or red |
| `lucide-react` | icons |
| `react-hot-toast` | `toast.success(...)`, `toast.error(...)` |

Don't import from another widget in `components/`. Every file in that folder becomes a widget, so shared code belongs next to the folder (like `TorrentItem.tsx` and `service.tsx`), not inside it.

**Look and feel**, so it doesn't look out of place: Tailwind classes, a dark background, `text-xs` for content, `text-gray-200` for the main text, `text-gray-500` for secondary text, `#e04fbf` / `#b3078b` for accents, emerald for good, amber for warning, red for bad. Wrap long lists in `max-h-[28rem] overflow-y-auto` and truncate long names with `truncate`. The card, title and menu come from the page, so the component only renders its content.

## Security: what Front Desk enforces

You don't have to do anything for these. They're listed so you know what to expect, and so an admin knows what they're agreeing to.

- **Secrets stay on the server.** Fields marked `secret` are never sent back to the browser, not even to admins. The browser only learns whether they're set.
- **Only admins configure.** Saving a widget config (the url, the keys, the manifest) is admin-only. Everyone logged in can see the non-secret values.
- **The url is fixed.** Calls only go to the url saved for that widget. The path is glued to it and the result is checked again: it must have the same scheme and host. Paths must start with `/` and can't contain `..` or `\`, so they can't climb out of a base path like `/prowlarr` into another app on the same host.
- **Redirects are not followed.** If the service answers with a redirect, the widget gets that answer (as an error) instead of Front Desk following it to wherever it points.
- **Only the calls in `allow`.** Anything else is refused before leaving the server.
- **Admin-only calls are enforced on the server**, not just hidden in the UI.
- **The manifest the server uses is the one an admin saved**, never one sent along with a call. A changed widget file has to be saved again by an admin before it takes effect.
- **Activity log.** Admin-only calls show up on the Activity page as "widget action". Regular reads don't, otherwise a widget polling every minute would bury everything else.

A widget file is still code that runs in the browser of everyone who opens the page, so **read a widget file before you add it to your install**, like you would any code. The rules above limit what it can do through Front Desk, not what any JavaScript can do in a page.

## Limits

| Limit | Value |
|---|---|
| Time for the service to answer | 15 seconds |
| Size of the answer | 2 MB (use the API's paging or `limit` params) |
| Size of a body you send | 1 MB |
| Widget name | `a-z`, `0-9`, `_`, up to 50 characters (it's the file name) |
| Widgets attached to home | 5 |

## When this is not enough

The single-file way covers "url + key, call some paths, show the answer". These need official support (Go code in the API, like the Tdarr, Sonarr or Pi-hole integrations), so open an issue or a PR on the backend:

- **Login sessions.** Services where you log in with a user and password, get a cookie or token back, and have to log in again when it expires (qBittorrent, Pi-hole v6). The proxy can't hold a session.
- **More than one service in one widget.** Each widget has one config, so one url. "Coming soon" mixes Seerr, Sonarr, Radarr and Jellyfin, so it's built into the backend.
- **History or background work.** Anything that has to run when nobody has the page open, or remember values over time (the disk forecast, uptime, the daily summary).
- **Feeding other features.** If you want the service to show up in **Needs attention** or in alerts, the backend needs to know about it.
- **Answers that aren't JSON or text,** like images or files.
- **Plain HTTP to a service with a self-signed certificate on HTTPS.** The API verifies certificates. Use the plain `http://` address on the LAN.

## Checklist before you share it

- [ ] File name is lowercase with `_`, and it says what the widget is (`gitea`, `prowlarr_health`).
- [ ] `"use client";` on top, `export const config`, `export default` the component.
- [ ] Demo data when `enabled` is false, close to what real data looks like.
- [ ] Each field label says where to find the value, and secrets are marked `secret: true`.
- [ ] `allow` is as narrow as possible, and anything that changes something is `admin: true`.
- [ ] Action buttons are hidden for non-admins.
- [ ] `error` is shown, and an empty answer shows a friendly "all clear" instead of a blank card.
- [ ] `interval` makes sense for the data. Don't poll every 5s for something that changes once a day.
- [ ] Long lists scroll and long names truncate.
- [ ] `npx tsc --noEmit` passes.
- [ ] A comment at the top saying which service, which version you tested, and which permissions the key or token needs.

## Troubleshooting

**The widget doesn't show up on the Widgets page.**
Restart `npm run dev` or rebuild, since the list of widgets is generated at start. Check the file is in `src/app/widgets/components/` and ends with `.tsx`. If the page says "New widget found", refresh once.

**There's no Configure in the menu.**
You're not an admin, the widget is disabled (enable it first), or the file doesn't `export const config`. Configure lives on the Widgets page, not on the home row.

**"Not configured yet" after saving.**
Look for a red toast on Save. A required field was empty, or the url isn't `http(s)://host`.

**"This widget changed since it was configured".**
The manifest in the file isn't the one that was saved. Open Configure and click Save. Secrets are kept.

**"this widget is not allowed to GET /api/..."**
The path or method isn't covered by any `allow` rule. Remember the prefix is matched without the query string, and the method has to match exactly.

**"gitea answered 401" (or 403).**
The key is wrong, or it lacks a permission or scope. Also check the auth format: some APIs want `Bearer {token}`, some want `token {token}`, some want a custom header.

**"gitea answered 404".**
Usually a base path issue. If the service lives under a path (`/prowlarr`), put that in the url field, not in the path you call.

**"gitea answered 30x".**
The service wanted to redirect, often from `http` to `https`, or to add a trailing slash. Fix the url field, because redirects aren't followed.

**Timeouts.**
The service took more than 15 seconds. Ask for less (`limit`, `pageSize`) or check that the API container can reach that address. It's the API container making the call, not your browser, so `localhost` means the API container itself.
