import { createClient } from "@libsql/client";


let _turso: ReturnType<typeof createClient> | null = null;
export function useTurso(/* event: H3Event */) {
  const { turso_token, db_url } = useRuntimeConfig(/* event */);

    if (!_turso) {
        _turso = createClient({
        url: db_url,
        authToken: turso_token,
        });
    }

  return _turso;
}
