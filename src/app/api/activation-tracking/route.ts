import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const prenom = searchParams.get("prenom") || "Non renseigné";
  const nom = searchParams.get("nom") || "Non renseigné";
  const societe = searchParams.get("societe") || "Non renseigné";
  const portable = searchParams.get("portable") || "Non renseigné";
  const email = searchParams.get("email") || "Non renseigné";

  // Vérification anti-spam : au moins société ou nom requis
  if (societe === "Non renseigné" && nom === "Non renseigné") {
    return NextResponse.json(
      { error: "Paramètres manquants" },
      { status: 400 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B4F9B; padding: 20px 30px; border-radius: 8px 8px 0 0;">
          <span style="font-size: 22px; font-weight: 700; color: #fff;">Booster</span><span style="font-size: 22px; font-weight: 700; color: #FF6600;">VO</span>
          <span style="display: block; margin-top: 6px; font-size: 13px; color: rgba(255,255,255,0.8);">Nouvelle demande d'activation tracking</span>
        </div>
        <div style="background: #fff; padding: 28px 30px; border: 1px solid #eee; border-top: none;">
          <h2 style="color: #1B4F9B; font-size: 18px; margin: 0 0 20px 0;">Un négociant souhaite activer son tracking gratuit</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555; width: 140px;">Prénom</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${prenom}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Nom</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${nom}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Société</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222; font-weight: 700;">${societe}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Téléphone</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${portable}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 600; color: #555;">Email</td>
              <td style="padding: 10px 0; color: #1B4F9B;">${email}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #f0f7ff; border-radius: 6px; border-left: 4px solid #FF6600;">
            <p style="margin: 0; font-size: 14px; color: #333;">
              <strong>Action requise :</strong> Contacter le négociant pour mettre en place le tracking gratuit de 15 jours.
            </p>
          </div>
        </div>
        <div style="padding: 16px 30px; background: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #eee; border-top: none;">
          <p style="margin: 0; font-size: 11px; color: #aaa;">BoosterVO — Mercure SAS — Email automatique</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"BoosterVO" <${process.env.SMTP_USER}>`,
      to: "lucas@boostervo.fr, contact@boostervo.fr",
      subject: `Demande activation tracking gratuit — ${societe}`,
      html: htmlBody,
      replyTo: email !== "Non renseigné" ? email : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
