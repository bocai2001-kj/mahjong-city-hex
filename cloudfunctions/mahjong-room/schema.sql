CREATE TABLE IF NOT EXISTS public.mahjong_rooms (
  code varchar(6) PRIMARY KEY,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mahjong_players (
  id text PRIMARY KEY,
  room_code varchar(6) NOT NULL REFERENCES public.mahjong_rooms(code) ON DELETE CASCADE,
  seat text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_code, seat)
);

CREATE INDEX IF NOT EXISTS mahjong_players_room_code_idx
  ON public.mahjong_players(room_code);

REVOKE ALL ON public.mahjong_rooms FROM anon, authenticated, service_role;
REVOKE ALL ON public.mahjong_players FROM anon, authenticated, service_role;
REVOKE ALL ON public.mahjong_rooms FROM "cloudbase_functions_admin_pgdb_a1jcm7tn";
REVOKE ALL ON public.mahjong_players FROM "cloudbase_functions_admin_pgdb_a1jcm7tn";

DROP VIEW IF EXISTS public.mahjong_current_role_view;
DROP FUNCTION IF EXISTS public.mahjong_current_role();
