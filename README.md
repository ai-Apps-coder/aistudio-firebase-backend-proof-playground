# Raport de Migrare și Corectare a Infrastructurii Web (feb 2026)

## 1. Context și Starea Inițială

Acest document descrie procesul de diagnosticare și corectare a infrastructurii web pentru domeniile `vantages.app`, `governances.app`, și `aiacts.app`.

La începutul intervenției, sistemul se prezenta astfel:

*   **Servire Frontend:** Aplicația principală (construită cu React, folder `dist`) era implementată și servită folosind **Google Cloud Run**.
*   **Mapare Domenii:** Domeniile rădăcină (`vantages.app`, `aiacts.app`, etc.) erau mapate direct în Cloud Run pentru a servi aplicația frontend.
*   **Configurare DNS:** În Cloudflare, înregistrările DNS de tip `A` și `AAAA` pentru domeniile rădăcină direcționau traficul către adresele IP furnizate de Google Cloud Run.
*   **Servicii Backend:** Subdomeniile critice, precum `api.vantages.app` (backend-ul) și `proof.vantages.app` (dashboard), erau de asemenea mapate și servite corect prin Cloud Run.

### Problema Principală Identificată

**Lipsa vizibilității `sitemap.xml`:** Deși un fișier `sitemap.xml` era generat corect în procesul de build (în folderul `dist`), acesta nu era accesibil public. O solicitare către `https://vantages.app/sitemap.xml` rezulta într-o eroare 404 sau servea aplicația React. Această problemă este extrem de dăunătoare pentru indexarea corectă a site-urilor de către motoarele de căutare (SEO).

**Cauza Rădăcină:** Servirea unei aplicații de tip Single-Page Application (SPA) cu un fișier static specific (precum `sitemap.xml`) din Cloud Run necesită configurații complexe (un server custom sau un container multi-stage). Infrastructura existentă nu era optimizată pentru acest caz de utilizare.

## 2. Obiectivul Intervenției

Scopul principal a fost restructurarea infrastructurii pentru a rezolva problema SEO, păstrând în același timp funcționalitatea completă a sistemului.

1.  **Migrarea Frontend-ului:** Mutarea servirii aplicației frontend (conținutul static din `dist`) de pe Cloud Run pe **Firebase Hosting**. Firebase Hosting este special conceput pentru a servi conținut static, oferă un CDN global performant și gestionează nativ și corect fișierele statice precum `sitemap.xml` și `robots.txt`.
2.  **Configurare Multi-Site:** Implementarea unei arhitecturi multi-site în Firebase pentru a gestiona fiecare domeniu (`vantages.app`, `governances.app`, etc.) ca o entitate separată, dar dintr-un singur proiect.
3.  **Păstrarea Backend-ului:** Asigurarea că serviciile de backend și dashboard (`api.vantages.app`, `proof.vantages.app`) rămân funcționale și neafectate pe Cloud Run.

## 3. Acțiuni Realizate (Istoricul Intervenției)

1.  **Modificarea `firebase.json`:** Am actualizat fișierul `firebase.json` pentru a suporta o configurație multi-site, transformând secțiunea `hosting` dintr-un singur obiect într-o listă de obiecte, fiecare cu o "țintă" (`target`) specifică: `vantages-app`, `governances-app`, `aiacts-app`.
2.  **Prima Încercare de Implementare:** Comanda `firebase deploy` a eșuat deoarece țintele definite în `firebase.json` nu erau asociate cu nicio resursă reală în proiectul Firebase.
3.  **Crearea Resurselor în Firebase:** V-am ghidat pentru a crea **Site-uri de Hosting** separate în consola Firebase pentru `aiacts-app` și `governances-app`.
4.  **Descoperirea Conflictului de Infrastructură:** Am identificat că domeniile rădăcină nu puteau fi conectate la Firebase Hosting deoarece erau deja active și mapate în **Google Cloud Run**. Acest conflict fundamental a fost cauza principală a tuturor erorilor ulterioare, deoarece două servicii Google Cloud nu pot controla simultan același domeniu.

## 4. Acțiuni Imediate Următoare (Planul Final)

Pentru a finaliza migrarea și a rezolva conflictul, trebuie să executați următorii pași, care vor muta responsabilitatea pentru domeniile publice de la Cloud Run la Firebase Hosting.

### Pasul 1: Ștergeți Mapările din Cloud Run

Acest pas îi spune lui Google Cloud să nu mai servească frontend-ul prin Cloud Run.

1.  Navigați în Google Cloud Console la secțiunea **Cloud Run** > **Domain mappings**.
2.  Pentru următoarele domenii (și **doar pentru acestea**), faceți clic pe meniul cu trei puncte și selectați **"Delete"**:
    *   `vantages.app`
    *   `governances.app`
    *   `aiacts.app`
    *   `eu.aiacts.app`
3.  **NU ȘTERGEȚI** mapările pentru `api.vantages.app` sau `proof.vantages.app`. Acestea trebuie să rămână active pe Cloud Run.

### Pasul 2: Actualizați DNS-ul în Cloudflare

Acest pas direcționează traficul web pentru domeniile publice către Firebase Hosting.

1.  Navigați în panoul de administrare **Cloudflare** pentru fiecare domeniu în parte (ex: `vantages.app`).
2.  **Ștergeți TOATE** înregistrările de tip `A` și `AAAA` care există pentru domeniul rădăcină (`@` sau `vantages.app`). Acestea sunt înregistrările vechi care duceau către Cloud Run.
3.  **Adăugați** înregistrările **noi**, furnizate de Firebase:
    *   **Înregistrarea de tip A:**
        *   **Type:** `A`
        *   **Name:** `@` (sau numele domeniului, ex: `vantages.app`)
        *   **IPv4 address:** `199.36.158.100`
        *   **Proxy status:** **DNS only** (norișorul trebuie să fie **gri**).
    *   **Înregistrarea de tip TXT (dacă este cerută de Firebase pentru verificare):**
        *   **Type:** `TXT`
        *   **Name:** `@`
        *   **Content:** `hosting-site=vantage-proof-prod` (sau valoarea specifică dată de Firebase).

### Pasul 3: Verificați și Finalizați în Firebase

1.  Reveniți la consola **Firebase Hosting**.
2.  Apăsați butonul **"Verify"** pentru a finaliza conectarea domeniului.
3.  Odată ce domeniul apare ca **"Connected"**, anunțați-mă pentru a rula comanda finală de implementare.

### Rezultatul Așteptat

La finalul acestor pași, site-urile publice vor fi servite de pe infrastructura optimizată a Firebase Hosting, `sitemap.xml` va fi accesibil public, iar serviciile de backend vor continua să funcționeze neîntrerupt pe Cloud Run.
