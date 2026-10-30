"use client";

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Api from '@/Components/Api'
import Modal from '@/Components/Modal/Modal'
import Button from '@/Components/Button'
import { useWidget } from './sdk'

const inputClass = 'w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all'

// the form comes from the fields the widget declared, url always first
export default function WidgetConfig({ close }: { close: () => void }) {
  const { name, manifest, refresh } = useWidget();
  const [values, setValues] = useState<Record<string, string>>({});
  const [secretsSet, setSecretsSet] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Api().get(`/widgets/${name}/config`)
      .then(res => {
        if (res?.data?.status !== true) return;
        setValues(res.data.data.values || {});
        setSecretsSet(res.data.data.secretsSet || []);
      })
      .catch(() => {});
  }, [name]);

  if (!manifest) return null;
  const keys = ['url', ...Object.keys(manifest.fields).filter(key => key !== 'url')];

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    // the manifest goes with it, so an admin is the one who agrees with where the calls go
    Api().post(`/widgets/${name}/config`, { manifest: JSON.stringify(manifest), values })
      .then(() => {
        toast.success('Widget configured');
        refresh();
        close();
      })
      .catch(error => toast.error(error?.response?.data?.message || 'Could not save it'))
      .finally(() => setSaving(false));
  }

  return (
    <Modal title={'Configure ' + name.replaceAll('_', ' ')} close={close} className='w-[95vw] md:w-[32rem]'>
      <form className='grid gap-4 p-1' onSubmit={save}>
        {keys.map(key => {
          const field = manifest.fields[key];
          const kept = field.secret && secretsSet.includes(key);
          return (
            <label key={key} className='grid gap-1 text-sm text-gray-300'>
              {field.label}{field.optional && <span className='text-gray-500'> (optional)</span>}
              <input
                type={field.secret ? 'password' : 'text'}
                className={inputClass}
                placeholder={kept ? '(unchanged)' : field.placeholder}
                value={values[key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                required={!field.optional && !kept}
              />
            </label>
          )
        })}
        <Button type='submit' id={'configure_' + name} role='action' className='p-2.5 mt-2 rounded-md font-medium' disabled={saving}>Save</Button>
      </form>
    </Modal>
  )
}
