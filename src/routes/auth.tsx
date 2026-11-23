import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { billingCopy } from '@/lib/i18n/billing';
import { useI18n } from '@/lib/i18n';
import { seoHead, usePageSeo } from '@/lib/i18n/seo';

export const Route = createFileRoute('/auth')({
  head: () => seoHead('auth'),
  component: Auth,
});

function Auth() {
  usePageSeo('auth');
  const { lang } = useI18n();
  const t = billingCopy[lang];
  const navigate = useNavigate();
  const [email, setEmail] = useState('solidaristjordi@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setSignedIn(true);
      }
    });
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      setSignedIn(true);
      navigate({ to: '/facturacio' });
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-page py-16">
      <h1 className="font-display text-4xl">{t.access}</h1>
      {!signedIn ? (
        <form onSubmit={handleLogin} className="mt-8 max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contrasenya</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? '...' : t.login}
            </Button>
            <Button asChild variant="outline">
              <Link to="/facturacio">{t.title}</Link>
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/facturacio">{t.title}</Link>
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}