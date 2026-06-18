import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { TERMINAL_STATUSES } from "@/lib/constants";

/**
 * Polls GET /tasks/{id} until the task reaches a terminal status.
 * Mirrors the backend's webhook+polling async model from the frontend side.
 *
 * Returns { task, status, error, isPolling, start, reset }.
 */
export function useTaskPolling(intervalMs = 3500) {
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const timer = useRef(null);
  const idRef = useRef(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setIsPolling(false);
  }, []);

  const tick = useCallback(async () => {
    const id = idRef.current;
    if (!id || !alive.current) return;
    try {
      const fresh = await api.getTask(id);
      if (!alive.current) return;
      setTask(fresh);
      if (TERMINAL_STATUSES.includes(fresh.status)) {
        stop();
        return;
      }
    } catch (e) {
      if (!alive.current) return;
      setError(e);
      // keep polling on transient errors, but back off slightly
    }
    timer.current = setTimeout(tick, intervalMs);
  }, [intervalMs, stop]);

  /** Begin polling. Accepts either a task id or an initial task object. */
  const start = useCallback(
    (initial) => {
      const id = typeof initial === "string" ? initial : initial?.id;
      if (!id) return;
      if (timer.current) clearTimeout(timer.current);
      idRef.current = id;
      setError(null);
      setTask(typeof initial === "string" ? null : initial);
      setIsPolling(true);
      timer.current = setTimeout(tick, intervalMs);
    },
    [tick, intervalMs]
  );

  const reset = useCallback(() => {
    stop();
    idRef.current = null;
    setTask(null);
    setError(null);
  }, [stop]);

  return { task, status: task?.status, error, isPolling, start, stop, reset };
}
