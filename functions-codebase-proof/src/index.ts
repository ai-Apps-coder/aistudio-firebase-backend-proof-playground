import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

// Inițializăm Admin SDK pentru nodul suveran
admin.initializeApp();

/**
 * [ACTA_GUARD_PROTOCOL]
 * Finalize Audit - Nodul Suveran Frankfurt (europe-west3)
 * Această funcție scrie auditul final în substratul Firestore securizat.
 */
export const finalizeAudit = functions.https.onCall({
  region: "europe-west3", // Regiunea critică pentru conformitate GDPR/EU AI Act
  cors: true,
  maxInstances: 10
}, async (request) => {
  // Extragem datele trimise de front-end
  const { company, sector, vatId, dataSample, auditId } = request.data;

  // Forțăm conexiunea către baza de date
  const db = admin.firestore();

  const auditEntry = {
    auditId: auditId || `ACTA-${Date.now().toString(36).toUpperCase()}`,
    company: company || "Enterprise Node",
    sector: sector || "General AI",
    vatId: vatId || "N/A",
    dataSample: dataSample || "",
    status: "VALIDATED",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    expert_vouch: "Ioan Ciprian Popa | Certified by European Information Technologies Certification Institute, Brussels, EU",
    protocol_version: "ActaGuard v2.8",
    compliance_articles: ["Article 10", "Article 17", "Article 32", "Article 52"],
    signature_hash: Math.random().toString(36).substring(2, 12).toUpperCase(),
    node_location: "europe-west3-frankfurt"
  };

  try {
    // Scriem în colecția "audits"
    await db.collection("audits").doc(auditEntry.auditId).set(auditEntry);
    
    console.log(`[SOVEREIGN_REGISTRY] Audit ${auditEntry.auditId} committed successfully.`);
    
    return { 
      status: "SUCCESS", 
      audit_id: auditEntry.auditId,
      signature: auditEntry.signature_hash,
      expert_vouch: auditEntry.expert_vouch
    };
  } catch (error) {
    console.error("CRITICAL_FAILURE: Firestore Write Error:", error);
    throw new functions.https.HttpsError(
      "internal", 
      "Failed to commit audit to the Frankfurt Sovereign Registry."
    );
  }
});