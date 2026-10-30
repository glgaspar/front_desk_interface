"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Api from '@/Components/Api'

// everything a widget needs to talk to a service without touching the api code.
// the widget declares what it needs (the manifest), an admin fills it on the widgets page,
// and the calls go through the api, which adds the url and the keys. WIDGETS.md has the long version

export interface WidgetField {
  label: string
  placeholder?: string
  secret?: boolean
  optional?: boolean
}

export interface WidgetRule {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  admin?: boolean
}

export interface WidgetManifest {
  fields: { url: WidgetField } & Record<string, WidgetField>
  auth?: {
    headers?: Record<string, string>
    query?: Record<string, string>
    basic?: { username: string, password: string }
  }
  allow?: WidgetRule[]
}

// does nothing, its here so the editor checks the manifest while you write it
export function defineWidget(manifest: WidgetManifest) {
  return manifest;
}

type Status = 'loading' | 'ready' | 'unconfigured' | 'outdated'

interface WidgetContextData {
  name: string
  manifest?: WidgetManifest
  enabled: boolean
  status: Status
  refresh: () => void
}

const WidgetContext = createContext<WidgetContextData>({ name: '', enabled: false, status: 'loading', refresh: () => {} });

export function useWidget() {
  return useContext(WidgetContext);
}

// wraps every widget on the widgets page and on home. it checks once if the widget was configured,
// and if it was configured with this same manifest. a changed manifest needs an admin to save again
export function WidgetProvider({ name, manifest, enabled, children }: { name: string, manifest?: WidgetManifest, enabled: boolean, children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!manifest || !enabled) return;
    Api().get(`/widgets/${name}/config`)
      .then(res => {
        if (res?.data?.status !== true) return setStatus('unconfigured');
        setStatus(res.data.data.manifest === JSON.stringify(manifest) ? 'ready' : 'outdated');
      })
      .catch(() => setStatus('unconfigured'));
  }, [name, manifest, enabled, tick]);

  return (
    <WidgetContext.Provider value={{ name, manifest, enabled, status, refresh: () => setTick(prev => prev + 1) }}>
      {children}
    </WidgetContext.Provider>
  )
}

const messages: Record<string, string> = {
  unconfigured: 'Not configured yet. An admin can set it up with Configure in the widget menu.',
  outdated: 'This widget changed since it was configured. An admin needs to open Configure and save again.',
};

interface ApiOptions {
  method?: WidgetRule['method']
  body?: unknown
  interval?: number
}

// asks the service through the api and keeps asking every interval. does nothing while the
// widget is disabled, that is when it shows its demo data
export function useWidgetApi<T>(path: string, { method = 'GET', body, interval = 60000 }: ApiOptions = {}) {
  const { name, enabled, status } = useWidget();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  // the body object is new on every render, the string is not
  const bodyKey = JSON.stringify(body ?? null);

  useEffect(() => {
    if (!enabled || status === 'loading') return;
    if (status !== 'ready') {
      setError(messages[status]);
      return;
    }

    function load() {
      Api().post(`/widgets/${name}/call`, { method, path, body: JSON.parse(bodyKey) })
        .then(res => {
          setData(res?.data?.data ?? null);
          setError('');
        })
        .catch(err => setError(err?.response?.data?.message || 'Could not load'));
    }
    load();
    const timer = setInterval(load, interval);
    return () => clearInterval(timer);
  }, [name, enabled, status, method, path, bodyKey, interval, tick]);

  return { data, error, reload: () => setTick(prev => prev + 1) };
}

// for buttons. returns a function that makes one call and gives back what the service answered
export function useWidgetAction() {
  const { name } = useWidget();
  return useCallback(<T = unknown,>(method: WidgetRule['method'], path: string, body?: unknown) =>
    Api().post(`/widgets/${name}/call`, { method, path, body }).then(res => res?.data?.data as T), [name]);
}
