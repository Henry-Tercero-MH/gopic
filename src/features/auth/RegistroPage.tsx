import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';
import { RUTAS } from '@/lib/rutas';

/**
 * Registro de cliente (prototipo mock).
 * Sin backend: valida el formulario y simula la creación de la cuenta.
 * En producción crearía un Cliente + su Usuario y dispararía verificación por correo.
 */
export function RegistroPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [clave, setClave] = useState('');
  const [confirma, setConfirma] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!nombre.trim() || !email.trim() || !clave) {
      setError('Completa nombre, correo y contraseña.');
      return;
    }
    if (clave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (clave !== confirma) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    // Demo: simulamos la creación de la cuenta.
    setTimeout(() => {
      setCargando(false);
      toast.exito(`Cuenta creada para ${nombre.trim()}. Ya puedes iniciar sesión.`);
      navigate(RUTAS.login, { replace: true });
    }, 700);
  }

  const inputCls =
    'h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-base text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunk px-4 py-6">
      <main className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <img src="/img/logo.png" alt="GOPIC" className="h-20 w-20 rounded-full object-cover" />
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h1 className="font-display text-xl font-semibold text-text">Crear cuenta</h1>
          <p className="mt-1 text-sm text-text-muted">Regístrate para acumular visitas y recibir promociones.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="reg-nombre" className="mb-1 block text-sm font-medium text-text">Nombre completo</label>
              <input id="reg-nombre" autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-text">Correo</label>
              <input id="reg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={inputCls} />
            </div>
            <div>
              <label htmlFor="reg-tel" className="mb-1 block text-sm font-medium text-text">Teléfono <span className="text-text-muted">(opcional)</span></label>
              <input id="reg-tel" type="tel" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+502 …" className={inputCls} />
            </div>
            <div>
              <label htmlFor="reg-clave" className="mb-1 block text-sm font-medium text-text">Contraseña</label>
              <div className="relative">
                <input
                  id="reg-clave"
                  type={verClave ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={inputCls + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:bg-surface-sunk hover:text-text"
                >
                  {verClave ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirma" className="mb-1 block text-sm font-medium text-text">Confirmar contraseña</label>
              <input id="reg-confirma" type={verClave ? 'text' : 'password'} autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} className={inputCls} />
            </div>

            {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

            <Button type="submit" size="lg" className="w-full" loading={cargando}>
              <UserPlus size={18} /> Crear cuenta
            </Button>
          </form>
        </div>

        <Link
          to={RUTAS.login}
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
        >
          <ArrowLeft size={16} /> Ya tengo cuenta
        </Link>
      </main>
    </div>
  );
}
