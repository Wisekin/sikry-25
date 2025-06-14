"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/src/utils/supabase/client"

export function useRealtime<T>(table: string, filter?: Record<string, any>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    const fetchData = async () => {
      try {
        setLoading(true)
        let query = supabase.from(table).select("*")

        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }

        const { data: initialData, error: fetchError } = await query.order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        if (initialData) {
          setData(initialData as T[])
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error occurred"))
        console.error(`Error fetching ${table}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Check if the new record matches our filter
            let matches = true
            if (filter) {
              Object.entries(filter).forEach(([key, value]) => {
                if (payload.new[key] !== value) {
                  matches = false
                }
              })
            }

            if (matches) {
              setData((current) => [payload.new as T, ...current])
            }
          } else if (payload.eventType === "UPDATE") {
            setData((current) => current.map((item: any) => (item.id === payload.new.id ? (payload.new as T) : item)))
          } else if (payload.eventType === "DELETE") {
            setData((current) => current.filter((item: any) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, JSON.stringify(filter)])

  return { data, loading, error }
}

export function useRealtimeItem<T>(table: string, id: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data: item, error: fetchError } = await supabase.from(table).select("*").eq("id", id).single()

        if (fetchError) {
          throw fetchError
        }

        setData(item as T)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error occurred"))
        console.error(`Error fetching ${table} item:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}_item_${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setData(payload.new as T)
          } else if (payload.eventType === "DELETE") {
            setData(null)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, id])

  return { data, loading, error }
}
