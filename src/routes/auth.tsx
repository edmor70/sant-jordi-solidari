import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { billingCopy } from '@/lib/i18n/billing';
import { useI18n } from '@/lib/i18n';
import { seoHead, usePageSeo } from '@/lib/i18n/seo';
export const Route=createFileRoute('/auth')({head:()=>seoHead('auth'),component:Auth});
function Auth(){usePageSeo('auth');const {lang}=useI18n();const t=billingCopy[lang];const [error,setError]=useState(false);
  const [signedIn,setSignedIn]=useState(false);
  useEffect(()=>{supabase.auth.getUser().then(({data})=>setSignedIn(Boolean(data.user)));},[]);
  async function login(provider:'google'|'lovable'){setError(false);try{const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:`${window.location.origin}/auth`});if(result.error){setError(true);return;}const {data}=await supabase.auth.getUser();setSignedIn(Boolean(data.user));}catch{setError(true);}}
  return <section className="container-page py-16"><h1 className="font-display text-4xl">{t.access}</h1><div className="mt-8 flex flex-wrap gap-4">{!signedIn&&<><Button onClick={()=>login('google')}>{t.login}</Button><Button variant="outline" onClick={()=>login('lovable')}>{t.lovable}</Button></>}<Button asChild variant="outline"><Link to="/facturacio">{t.title}</Link></Button></div>{error&&<p role="alert" className="mt-4 text-destructive">{t.error}</p>}</section>;
}