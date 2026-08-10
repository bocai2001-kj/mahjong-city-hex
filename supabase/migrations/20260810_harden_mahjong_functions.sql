revoke all on function public.mahjong_pick_city(text) from public, anon, authenticated;
revoke all on function public.mahjong_pick_rarity() from public, anon, authenticated;
revoke all on function public.mahjong_pick_candidates(text,text) from public, anon, authenticated;
revoke all on function public.mahjong_room_public(text) from public, anon, authenticated;
revoke all on function public.mahjong_create_room(text) from public, anon, authenticated;
revoke all on function public.mahjong_get_room(text) from public, anon, authenticated;
revoke all on function public.mahjong_join_room(text,text,uuid) from public, anon, authenticated;
revoke all on function public.mahjong_select_hex(text,text,uuid,integer) from public, anon, authenticated;
revoke all on function public.mahjong_next_round(text,uuid) from public, anon, authenticated;

grant execute on function public.mahjong_create_room(text) to anon, authenticated;
grant execute on function public.mahjong_get_room(text) to anon, authenticated;
grant execute on function public.mahjong_join_room(text,text,uuid) to anon, authenticated;
grant execute on function public.mahjong_select_hex(text,text,uuid,integer) to anon, authenticated;
grant execute on function public.mahjong_next_round(text,uuid) to anon, authenticated;
