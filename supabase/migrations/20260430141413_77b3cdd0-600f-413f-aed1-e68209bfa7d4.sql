
DROP POLICY "pickups insertable by all" ON public.pickups;
CREATE POLICY "pickups insertable with valid data"
ON public.pickups
FOR INSERT
WITH CHECK (
  length(trim(address)) > 0
  AND length(trim(code)) > 0
  AND amount >= 0
  AND status IN ('requested','accepted','collected','completed')
);
