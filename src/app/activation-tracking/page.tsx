"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ActivationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [sent, setSent] = useState(false);

  const prenom = searchParams.get("prenom") || "";
  const societe = searchParams.get("societe") || "";

  useEffect(() => {
    if (sent) return;
    setSent(true);

    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    fetch(`/api/activation-tracking?${params.toString()}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams, sent]);

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
          maxWidth: "520px",
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
        </div>

        {/* Content */}
        <div style={{ padding: "40px" }}>
          {status === "loading" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
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
              </div>
              <p style={{ textAlign: "center", fontSize: "16px", color: "#555" }}>
                Envoi de votre demande en cours...
              </p>
            </>
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
                {societe ? ` pour ${societe}` : ""} a bien &eacute;t&eacute; transmise &agrave; notre &eacute;quipe.
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
                Pas de panique ! Contactez-nous directement sur WhatsApp pour activer votre tracking gratuit.
              </p>
              <div style={{ textAlign: "center" }}>
                <a
                  href="https://wa.me/33757942886?text=Bonjour%2C%20je%20souhaite%20activer%20mon%20tracking%20gratuit."
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
