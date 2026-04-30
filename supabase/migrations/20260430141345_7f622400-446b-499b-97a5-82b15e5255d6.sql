
-- Materials catalog (publicly readable)
CREATE TABLE public.materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  icon TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  color TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collectors directory (publicly readable)
CREATE TABLE public.collectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 0,
  pickups INT NOT NULL DEFAULT 0,
  badge TEXT NOT NULL DEFAULT 'verified',
  distance TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pickups (public for demo: anyone can read/insert their own requests)
CREATE TABLE public.pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'requested',
  pickup_date DATE NOT NULL DEFAULT CURRENT_DATE,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  collector_id TEXT REFERENCES public.collectors(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  address TEXT NOT NULL,
  preferred_time TEXT NOT NULL DEFAULT 'morning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials readable by all" ON public.materials FOR SELECT USING (true);
CREATE POLICY "collectors readable by all" ON public.collectors FOR SELECT USING (true);
CREATE POLICY "pickups readable by all" ON public.pickups FOR SELECT USING (true);
CREATE POLICY "pickups insertable by all" ON public.pickups FOR INSERT WITH CHECK (true);

-- Seed materials
INSERT INTO public.materials (id, name, name_ta, icon, price, unit, color, sort_order) VALUES
('iron','Iron / Steel','இரும்பு','⚙',28,'kg','#607D8B',1),
('copper','Copper','செம்பு','🔩',550,'kg','#E67E22',2),
('plastic','Plastic','பிளாஸ்டிக்','♻',12,'kg','#3498DB',3),
('cardboard','Cardboard','அட்டை','📦',8,'kg','#8D6E63',4),
('coconut','Coconut Shells','தேங்காய் ஓடு','🥥',5,'kg','#6D4C41',5),
('bronze','Bronze / Brass','வெண்கலம்','🏺',320,'kg','#B8860B',6),
('aluminum','Aluminum','அலுமினியம்','🫙',95,'kg','#90A4AE',7),
('paper','Newspaper','பேப்பர்','📰',10,'kg','#78909C',8);

-- Seed collectors
INSERT INTO public.collectors (id, name, name_ta, rating, pickups, badge, distance, phone) VALUES
('c1','Rajan Kumar','ராஜன் குமார்',4.8,342,'verified','1.2 km','+91 98401 23456'),
('c2','Selvi Murugan','செல்வி முருகன்',4.6,218,'verified','2.1 km','+91 87654 32109'),
('c3','Balu Krishnan','பாலு கிருஷ்ணன்',4.9,501,'top','0.8 km','+91 99887 76655');

-- Seed pickups
INSERT INTO public.pickups (code, status, pickup_date, materials, collector_id, amount, address, preferred_time) VALUES
('P001','completed','2025-04-28','[{"id":"iron","weight":5.2},{"id":"plastic","weight":2.1}]'::jsonb,'c1',170.8,'12, Kovai Road, Pollachi','morning'),
('P002','accepted','2025-04-30','[{"id":"copper","weight":0.8}]'::jsonb,'c3',440,'45, Anna Nagar, Pollachi','afternoon'),
('P003','requested','2025-04-30','[{"id":"cardboard","weight":8}]'::jsonb,NULL,64,'7, Temple Street, Pollachi','evening');
