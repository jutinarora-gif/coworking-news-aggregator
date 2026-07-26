
DO $$
DECLARE
  male_urls text[] := ARRAY[
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1546456073-6712f79251bb?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1583864697784-a0efc8379f70?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1621355532321-46cb50fdafc8?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=faces'
  ];
  female_urls text[] := ARRAY[
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1616002411855-d329c5ff5fa8?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1618835962148-cf177563c6c0?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1601931935934-d55c8f36d1de?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1621347284037-8ba1c39dd6d0?w=200&h=200&fit=crop&crop=faces'
  ];
  female_names text[] := ARRAY['Anaya','Diya','Sara','Meera','Aisha','Riya','Neha','Zoya','Priya','Ananya','Tara','Ira','Aditi','Kavya','Simran','Isha','Nisha','Pooja','Sneha','Divya','Shreya','Ritu','Mansi','Preeti','Rhea','Nikita','Sonia','Payal','Kritika','Trisha'];
  r record;
  first_name text;
  is_female boolean;
  idx int;
  m_i int := 0;
  f_i int := 0;
BEGIN
  FOR r IN SELECT id, display_name FROM public.profiles ORDER BY created_at LOOP
    first_name := split_part(r.display_name, ' ', 1);
    is_female := first_name = ANY(female_names);
    IF is_female THEN
      idx := f_i % array_length(female_urls, 1);
      f_i := f_i + 1;
      UPDATE public.profiles SET avatar_url = female_urls[idx + 1] WHERE id = r.id;
    ELSE
      idx := m_i % array_length(male_urls, 1);
      m_i := m_i + 1;
      UPDATE public.profiles SET avatar_url = male_urls[idx + 1] WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
