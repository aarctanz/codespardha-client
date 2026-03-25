import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { serverTimeQuery } from "@/lib/queries";

/**
 * Returns a Date representing "server now" that ticks every second.
 * Syncs with the server every 30s (serverTimeQuery staleTime),
 * then uses client-side interval + offset for smooth countdown.
 */
export function useServerNow(): Date {
  const { data } = useQuery(serverTimeQuery);
  const offsetRef = useRef(0);

  // Recalculate offset whenever server time is fetched
  useEffect(() => {
    if (data) {
      offsetRef.current =
        new Date(data.serverTime).getTime() - Date.now();
    }
  }, [data]);

  const [now, setNow] = useState(
    () => new Date(Date.now() + offsetRef.current),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date(Date.now() + offsetRef.current));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}
