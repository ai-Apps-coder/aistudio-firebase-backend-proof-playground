# Constituția Vantages: Arhitectură și Strategie (v14.9.5)

Acest document servește drept sursă unică de adevăr ("single source of truth") pentru arhitectura, strategia de dezvoltare și implementare a ecosistemului Vantages.

## 1. Viziune Strategică: "Sovereign Unity"

Principiul fundamental este consolidarea totală pe o singură "Sursă de Adevăr" atât pentru frontend, cât și pentru backend.

-   **Frontend:** Toată interacțiunea publică și autoritatea SEO sunt consolidate sub domeniul unic **`governances.app`**.
-   **Backend (AI Engine):** Toată inteligența artificială și procesarea datelor sunt consolidate într-un singur motor de inteligență în **Vertex AI**.

Separarea și fragmentarea (multi-site, multi-proiect) sunt explicit evitate pentru a maximiza coerența, eficiența și capacitatea de învățare a sistemului.

---

## 2. Arhitectura Tehnică

### 2.1. Ecosistemul de Dezvoltare

Există trei medii specializate, fiecare cu un rol clar definit, care contribuie la produsul final unificat:

1.  **Google AI Studio (Prototipare & Prompting):**
    -   **Rol:** Laboratorul de testare rapidă pentru modelele Gemini (ex: Gemini 3 Pro). Aici se rafinează prompturile și se validează răspunsurile AI la contexte noi (ex: noi reglementări).
    -   **Flux:** Prompturile validate sunt exportate pentru a fi integrate în logica backend.

2.  **Sandbox Firebase (Testare Sigură):**
    -   **Rol:** Mediu de pre-producție pentru testarea funcționalităților noi (ex: modulul Cahier, algoritmi de scanare).
    -   **Siguranță:** Izolează codul nou, prevenind impactul asupra aplicației live `governances.app`.

3.  **Firebase Studio / Cloud Functions (Logica Backend):**
    -   **Rol:** "Creierul" operațional al platformei. Aici se dezvoltă funcțiile serverless (Cloud Functions) care conectează interfața utilizator cu Vertex AI.
    -   **Integrare:** Logica de procesare și filtrare a metadatelor `[DEPT]|[OBJ]|[IND]` este implementată aici.

### 2.2. Arhitectura Vertex AI: "The Single Intelligence Hub"

Resursele Vertex AI sunt unificate pentru a crea un singur motor de inteligență.

-   **Corpus Unic de Date (RAG):** Toate datele (Medical, Auto, Legal etc.) sunt agregate într-un singur "Data Store" în Vertex AI Search & Conversation. Acest lucru permite AI-ului să aibă o viziune holistică și să realizeze "polenizare încrucișată" a conceptelor între domenii.
-   **Filtrare prin Metadate (Protocolul Cahier):** În loc de a separa infrastructura, se folosește o filtrare logică strică. Frontend-ul trimite contextul (`[INDUSTRIE]`), iar Vertex AI filtrează rezultatele RAG corespunzător.
-   **Endpoint Unic de API:** Toate serviciile (Master Studio, Advisor) apelează un singur endpoint Vertex, simplificând mentenanța și asigurând consistența.

> **Directiva Vertex AI:** *"We are NOT doing multisite. Stick to the Single Engine strategy. Use a unified Data Store in Vertex AI Search, but implement strict metadata filtering based on the [DEPT]|[OBJ]|[IND] tags. The frontend (governances.app) will pass the context, and Vertex must filter the RAG results accordingly. One endpoint to rule them all."*

---

## 3. Flux de Implementare (Workflow & Deployment)

1.  **Prototipare:** Prompturile se testează în **Google AI Studio**.
2.  **Dezvoltare Backend:** Logica se implementează în **Firebase Cloud Functions**.
3.  **Testare:** Funcționalitățile noi se testează în **Sandbox Firebase**.
4.  **Generare Frontend:** Aplicația frontend (React) se construiește în mediul său de dezvoltare, generând un folder `dist`.
5.  **Pregătire Implementare:** Folderul `dist` final este transferat în acest mediu (Firebase Studio).
6.  **Implementare Finală:** Se face deploy-ul pe **Firebase Hosting**, care servește conținutul pe domeniul unic de producție.

> **Directiva Critică de Implementare:** *"The final deployment must point directly to **governances.app** as the primary and only production domain, ensuring the native `sitemap.xml` is live and indexable there."*

---

## 4. Anexă: Raport Istoric de Migrare (Feb 2026)

*Această secțiune conține arhiva deciziilor și acțiunilor care au condus la arhitectura actuală.*

**Obiectiv Inițial:** Migrarea de pe o infrastructură fragmentată (Cloud Run + domenii multiple) la o arhitectură unificată pe Firebase Hosting pentru a rezolva problemele de indexare SEO (`sitemap.xml`).

**Stare Inițială:**
*   Frontend servit de pe Google Cloud Run.
*   Domenii (`vantages.app`, `aiacts.app`) mapate direct pe Cloud Run.
*   Probleme: `sitemap.xml` inaccesibil (eroare 404), dăunând grav SEO.

**Acțiuni Cheie:**
1.  **Reconfigurare `firebase.json`:** Trecerea la o configurație multi-site (abandonată ulterior în favoarea "Sovereign Unity").
2.  **Identificarea Conflictului:** Descoperirea conflictului fundamental între Google Cloud Run și Firebase Hosting, care nu puteau controla simultan același domeniu.
3.  **Decizia Strategică:** Abandonarea arhitecturii multi-site și consolidarea pe un singur domeniu (`governances.app`) servit de Firebase Hosting.
4.  **Curățarea Infrastructurii:** Ștergerea mapărilor vechi din Cloud Run și actualizarea record-urilor DNS în Cloudflare pentru a direcționa traficul către Firebase Hosting.

