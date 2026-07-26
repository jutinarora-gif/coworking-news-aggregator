
UPDATE public.dispatches SET title = replace(title, '—', ','), excerpt = replace(excerpt, '—', ',');
UPDATE public.reviews SET title = replace(title, '—', ','), body = replace(body, '—', ',');
UPDATE public.questions SET title = replace(title, '—', ','), body = replace(body, '—', ',');
UPDATE public.answers SET body = replace(body, '—', ',');
UPDATE public.spaces SET description = replace(description, '—', ',');
UPDATE public.sales_questions SET text = replace(text, '—', ',');
UPDATE public.space_of_week SET editorial_note = replace(editorial_note, '—', ',');
