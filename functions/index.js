const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleAuth } = require("google-auth-library");

initializeApp();
const db = getFirestore();

exports.finalizeAudit = onCall({ region: "europe-west3" }, async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const auditId = request.data.auditId;
    if (!auditId || typeof auditId !== 'string') {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'auditId' string."
      );
    }

    const auditLogRef = db.collection("audits").doc(auditId).collection("logs");
    await auditLogRef.add({
        timestamp: new Date(),
        agent: 'ORCHESTRATOR',
        action: 'finalizeAudit Invoked',
        status: 'THINKING',
        detail: `Received request to finalize audit ${auditId}.`
    });

    try {
        const sourcesSnapshot = await db.collection('audits').doc(auditId).collection('sources').get();
        if (sourcesSnapshot.empty) {
            throw new HttpsError('not-found', 'No source documents found for this audit.');
        }

        let fullContext = sourcesSnapshot.docs.map(doc => doc.data().content).join('\n\n---\n\n');

        const modelPrompt = `
        **SYSTEM PROMPT**
        Analyze the provided context (policies, code, logs) to produce a "Blueprint V5" compliant audit report. The output must be a single, valid JSON object containing these exact keys: "resilienceScore", "piiFindings", "policyViolations", "mitigationSteps".
        - resilienceScore: A number between 0 and 100.
        - piiFindings: An array of strings describing Personally Identifiable Information risks.
        - policyViolations: An array of strings detailing policy breaches.
        - mitigationSteps: An array of strings with actionable recommendations.
        
        **CONTEXT**
        ${fullContext}
        `;

        await auditLogRef.add({ 
            timestamp: new Date(), 
            agent: 'ALCHEMIST', 
            action: 'Calling Generative AI', 
            status: 'EXECUTING', 
            detail: 'Generating Blueprint V5 report from compiled context.' 
        });

        const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
        const client = await auth.getClient();
        const accessToken = (await client.getAccessToken()).token;

        const vertexAIEndpoint = `https://europe-west3-aiplatform.googleapis.com/v1/projects/vantage-proof-prod/locations/europe-west3/publishers/google/models/gemini-1.5-pro-preview-0409:predict`;

        const response = await client.request({
            method: 'POST',
            url: vertexAIEndpoint,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            data: {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{ "text": modelPrompt }]
                    }
                ],
                "generationConfig": {
                    "response_mime_type": "application/json",
                }
            }
        });

        const modelResponse = response.data.predictions[0].content.parts[0].text;
        const reportData = JSON.parse(modelResponse);

        await auditLogRef.add({ 
            timestamp: new Date(), 
            agent: 'ALCHEMIST', 
            action: 'AI Response Received', 
            status: 'VERIFIED', 
            detail: 'Successfully parsed Blueprint V5 from model.' 
        });

        await db.collection("audits").doc(auditId).collection("artifacts").add({
            type: 'REPORT',
            title: 'Blueprint V5 Compliance Report',
            content: reportData,
            timestamp: new Date(),
            tenant: 'AUDITOR'
        });

        await db.collection("audits").doc(auditId).update({ 
            status: 'LOCKED', 
            resilienceScore: reportData.resilienceScore,
            lastUpdated: new Date().toISOString()
        });

        await auditLogRef.add({ 
            timestamp: new Date(), 
            agent: 'JUDGE',
            action: 'Audit Finalized',
            status: 'VERIFIED', 
            detail: `Audit ${auditId} is now LOCKED. Report artifact created.` 
        });

        return {
            status: "SUCCESS",
            auditId: auditId,
            message: "Audit finalized and report generated.",
            reportId: (await db.collection("audits").doc(auditId).collection("artifacts").limit(1).get()).docs[0].id
        };

    } catch (error) {
        console.error("Error in finalizeAudit:", error);
        await auditLogRef.add({
            timestamp: new Date(),
            agent: 'ORCHESTRATOR',
            status: 'FAILED',
            detail: error.message || 'An unexpected error occurred.'
        });
        throw new HttpsError("internal", "Failed to finalize audit.", error);
    }
});
