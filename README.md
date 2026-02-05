# Constituția Vantages: Protocolul de Operare Hibrid (v15.2.0)

## 1. Arhitectura de Deploy Actuală
Sistemul operează într-un mod **Decuplat Strategic** pentru a maximiza viteza de dezvoltare UI/UX:

- **Frontend Active Node (Google AI Studio)**: 
  - Sursa principală pentru UI/UX și logica de client.
  - Deployment automat către **Google Cloud Run** prin butonul nativ "Deploy".
  - Rol: Interfața publică rapidă și sandbox de producție.

- **Backend Persistence Node (Firebase Studio)**:
  - Gestionează colecția `audits` (Firestore), Cloud Functions (Frankfurt) și regulile de securitate.
  - Deployment manual prin Firebase CLI (`firebase deploy`).
  - Rol: Autoritatea de date și garantul imunității fiduciar-tehnice.

## 2. Tranziția "Sovereign Unity" (In Progress)
Recunoaștem viziunea de consolidare sub un singur domeniu servit de **Firebase Hosting**. 
- Fișierele `firebase.json`, `firestore.rules` și `storage.rules` din acest mediu sunt păstrate ca **Referință de Sincronizare**. 
- Momentan, acestea sunt neutralizate pentru a nu interfera cu containerul Cloud Run, dar vor fi activate când DNS-ul principal va fi mutat definitiv pe Hosting.

## 3. Instrucțiuni pentru Coderi (Sincronizare Context)
- **În AI Studio**: Ignorați orice comandă de `firebase deploy`. Concentrați-vă pe componentele React și optimizarea pentru Cloud Run.
- **În Firebase Studio**: Gestionați exclusiv regulile și funcțiile. Nu modificați structura de hosting fără a verifica maparea DNS din Google Cloud.

---
**expert_vouch**: "Ioan Ciprian Popa | Principal Architect"
**status**: HYBRID_DEPLOY_ACTIVE // **target**: SOVEREIGN_UNITY_CONSOLIDATION