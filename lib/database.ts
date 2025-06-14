import { Database } from "./database.types";
import { supabase } from "./supabase";

export type Dress = Database["public"]["Tables"]["dresses"]["Row"];
export type DressAvailability =
  Database["public"]["Tables"]["dress_availability"]["Row"];

// Dress operations
export async function createDress(
  dress: Database["public"]["Tables"]["dresses"]["Insert"]
) {
  const { data, error } = await supabase
    .from("dresses")
    .insert(dress)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDress(id: string) {
  const { data, error } = await supabase
    .from("dresses")
    .select("*, dress_availability(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getDresses(filters?: {
  types?: string[];
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
}) {
  let query = supabase
    .from("dresses")
    .select("*, dress_availability(*)")
    .eq("is_active", true);

  if (filters?.types?.length) {
    query = query.contains("types", filters.types);
  }

  if (filters?.colors?.length) {
    query = query.contains("colors", filters.colors);
  }

  if (filters?.sizes?.length) {
    query = query.in("size", filters.sizes);
  }

  if (filters?.minPrice) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters?.isAvailable) {
    query = query.eq("dress_availability.is_available", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function updateDress(
  id: string,
  updates: Database["public"]["Tables"]["dresses"]["Update"]
) {
  const { data, error } = await supabase
    .from("dresses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDress(id: string) {
  const { error } = await supabase
    .from("dresses")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

// Availability operations
export async function createAvailability(
  availability: Database["public"]["Tables"]["dress_availability"]["Insert"]
) {
  const { data, error } = await supabase
    .from("dress_availability")
    .insert(availability)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDressAvailability(dressId: string) {
  const { data, error } = await supabase
    .from("dress_availability")
    .select("*")
    .eq("dress_id", dressId)
    .order("start_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateAvailability(
  id: string,
  updates: Database["public"]["Tables"]["dress_availability"]["Update"]
) {
  const { data, error } = await supabase
    .from("dress_availability")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkAvailability(
  dressId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("dress_availability")
    .select("*")
    .eq("dress_id", dressId)
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
    .eq("is_available", false);

  if (error) throw error;
  return data.length === 0; // true if available, false if not
}
