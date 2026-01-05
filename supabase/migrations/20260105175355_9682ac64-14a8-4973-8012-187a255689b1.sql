-- Allow anyone to delete from queue (for host to clear it)
CREATE POLICY "Anyone can delete from queue"
ON public.queue
FOR DELETE
USING (true);