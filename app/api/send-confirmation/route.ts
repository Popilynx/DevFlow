import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { email, user_id } = await req.json();
  if (!email || !user_id) {
    return NextResponse.json({ error: "Email e user_id obrigatórios" }, { status: 400 });
  }

  const token = uuidv4();

  // Salvar token na tabela
  const { error: insertError } = await supabase.from("email_confirmations").insert({
    user_id,
    email,
    token,
  });
  if (insertError) {
    return NextResponse.json({ error: "Erro ao salvar token" }, { status: 500 });
  }

  // Enviar e-mail via Resend
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: "noreply@v0-devflow-full-stack-app.vercel.app",
    to: email,
    subject: "Seu código de confirmação do DevFlow",
    html: `<p>Olá!</p><p>Seu código de confirmação é:</p><h2 style='color:#2563eb;'>${token}</h2><p>Copie e cole este código na tela de confirmação do DevFlow para ativar sua conta.</p>`
  });

  return NextResponse.json({ success: true });
} 