"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ActivationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const prenom = searchParams.get("prenom") || "";
  const nom = searchParams.get("nom") || "";
  const societe = searchParams.get("societe") || "";
  const portable = searchParams.get("portable") || "";
  const email = searchParams.get("email") || "";

  const message = `Bonjour, je suis ${prenom} ${nom} de ${societe}. Je souhaite profiter du tracking gratuit de 15 jours.`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=33757942886&text=${encodeURIComponent(message)}`;

  const handleSend = async () => {
    setStatus("sending");
    try {
      const params = new URLSearchParams();
      if (prenom) params.set("prenom", prenom);
      if (nom) params.set("nom", nom);
      if (societe) params.set("societe", societe);
      if (portable) params.set("portable", portable);
      if (email) params.set("email", email);

      const res = await fetch(`/api/activation-tracking?${params.toString()}`);
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f5f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Verdana, Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          maxWidth: "560px",
          width: "100%",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #27ae60, #2ecc71)",
            padding: "28px 40px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
            Booster
          </span>
          <span style={{ fontSize: "24px", fontWeight: 400, color: "rgba(255,255,255,0.85)" }}>VO</span>
          <br />
          <span
            style={{
              display: "inline-block",
              marginTop: "8px",
              background: "rgba(255,255,255,0.2)",
              padding: "5px 16px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Activation du tracking gratuit
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "36px 40px" }}>
          {status === "idle" && (
            <>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#333",
                  margin: "0 0 20px 0",
                  lineHeight: 1.3,
                }}
              >
                {prenom ? `${prenom}, confirmez` : "Confirmez"} votre demande de tracking gratuit
              </h1>

              {/* Message preview */}
              <div
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #e8e8e8",
                  borderRadius: "10px",
                  padding: "20px 24px",
                  marginBottom: "28px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Votre message
                </p>
                <p style={{ margin: 0, fontSize: "15px", color: "#333", lineHeight: 1.6 }}>
                  {message}
                </p>
              </div>

              {/* Info box */}
              <div
                style={{
                  background: "#f0f7ff",
                  borderLeft: "4px solid #27ae60",
                  borderRadius: "6px",
                  padding: "14px 18px",
                  marginBottom: "28px",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: 1.5 }}>
                  Choisissez comment envoyer votre demande. Un conseiller BoosterVO vous contactera sous 24h.
                </p>
              </div>

              {/* Two buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "16px 24px",
                    background: "#25D366",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Envoyer via WhatsApp
                </a>

                <div style={{ textAlign: "center", color: "#aaa", fontSize: "12px", fontWeight: 600, padding: "4px 0" }}>
                  ou
                </div>

                <button
                  onClick={handleSend}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "16px 24px",
                    background: "linear-gradient(135deg, #1B4F9B, #2a6bc7)",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    boxShadow: "0 4px 14px rgba(27,79,155,0.3)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                  Envoyer ma demande directement
                </button>
              </div>
            </>
          )}

          {status === "sending" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "48px",
                  height: "48px",
                  border: "4px solid #eee",
                  borderTop: "4px solid #27ae60",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ marginTop: "16px", fontSize: "16px", color: "#555" }}>
                Envoi de votre demande en cours...
              </p>
            </div>
          )}

          {status === "success" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "64px",
                    height: "64px",
                    background: "rgba(39,174,96,0.1)",
                    borderRadius: "50%",
                    fontSize: "32px",
                    color: "#27ae60",
                  }}
                >
                  &#10003;
                </div>
              </div>
              <h1
                style={{
                  textAlign: "center",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#333",
                  margin: "0 0 12px 0",
                }}
              >
                Demande envoy&eacute;e !
              </h1>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "15px",
                  color: "#555",
                  lineHeight: 1.6,
                  margin: "0 0 24px 0",
                }}
              >
                Merci{prenom ? ` ${prenom}` : ""}. Votre demande d&apos;activation du tracking gratuit
                {societe ? ` pour ${societe}` : ""} a bien &eacute;t&eacute; transmise.
              </p>
              <div
                style={{
                  background: "#f0f7ff",
                  borderLeft: "4px solid #27ae60",
                  borderRadius: "6px",
                  padding: "16px 20px",
                  marginBottom: "24px",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                  <strong>Prochaine &eacute;tape :</strong> Un conseiller BoosterVO vous contactera sous 24h pour mettre en place votre tracking gratuit de 15 jours.
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <a
                  href="https://boostervo.fr"
                  style={{
                    display: "inline-block",
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #27ae60, #2ecc71)",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  Retour au site BoosterVO
                </a>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "64px",
                    height: "64px",
                    background: "rgba(231,76,60,0.1)",
                    borderRadius: "50%",
                    fontSize: "32px",
                    color: "#e74c3c",
                  }}
                >
                  !
                </div>
              </div>
              <h1
                style={{
                  textAlign: "center",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#333",
                  margin: "0 0 12px 0",
                }}
              >
                Oups, une erreur est survenue
              </h1>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "15px",
                  color: "#555",
                  lineHeight: 1.6,
                  margin: "0 0 24px 0",
                }}
              >
                Pas de panique ! Vous pouvez nous contacter directement sur WhatsApp.
              </p>
              <div style={{ textAlign: "center" }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "14px 32px",
                    background: "#25D366",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  Nous contacter sur WhatsApp
                </a>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            background: "#f8f9fa",
            padding: "16px 40px",
            textAlign: "center",
            borderTop: "1px solid #eee",
          }}
        >
          <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
            BoosterVO &mdash; Mercure SAS &mdash; Tracking gratuit et sans engagement
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ActivationTracking() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Verdana, Arial, sans-serif",
            color: "#555",
          }}
        >
          Chargement...
        </div>
      }
    >
      <ActivationContent />
    </Suspense>
  );
}
