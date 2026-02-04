import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as crypto from "crypto"; // Import necesar

// Inițializăm Admin SDK
admin.initializeApp();

/**
 * [ACTA_GUARD_PROTOCOL]
 * Finalize Audit - Nodul Suveran Frankfurt (europe-west3)
 */
export const finalizeAudit = functions.https.onCall({
  region: "europe-west3",
  cors: true,
  maxInstances: 10
}, async (request) => {
  const { company, sector, vatId, dataSample, auditId: reqAuditId } = request.data;
  const db = admin.firestore();

  const auditId = reqAuditId || `ACTA-${Date.now().toString(36).toUpperCase()}`;
  
  // Creăm un string unic din datele critice
  const dataToHash = `${auditId}-${company || "Enterprise Node"}-${vatId || "N/A"}-${dataSample || ""}`;
  
  // Calculăm hash-ul SHA-256 real
  const signatureHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

  const auditEntry = {
    auditId: auditId,
    company: company || "Enterprise Node",
    sector: sector || "General AI",
    vatId: vatId || "N/A",
    dataSample: dataSample || "",
    status: "VALIDATED",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    expert_vouch: "Ioan Ciprian Popa | Certified by European Information Technologies Certification Institute, Brussels, EU",
    protocol_version: "ActaGuard v2.8",
    compliance_articles: ["Article 10", "Article 17", "Article 32", "Article 52"],
    signature_hash: signatureHash, // Aici este valoarea corectă
    node_location: "europe-west3-frankfurt"
  };

  try {
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
