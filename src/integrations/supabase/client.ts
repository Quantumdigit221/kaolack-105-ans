// Client factice pour éviter les erreurs Supabase
// Ce projet n'utilise plus Supabase, mais ce fichier est conservé pour éviter les erreurs d'import

// Client factice qui ne fait rien
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
    eq: () => ({ data: [], error: null }),
    in: () => ({ data: [], error: null }),
    order: () => ({ data: [], error: null })
  })
};