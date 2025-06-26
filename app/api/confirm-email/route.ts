import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });
  }

  // Buscar confirmação
  const { data, error } = await supabase
    .from("email_confirmations")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  // Marcar como confirmado
  await supabase
    .from("email_confirmations")
    .update({ confirmed: true })
    .eq("id", data.id);

  return NextResponse.json({ success: true });
} 