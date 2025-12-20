# MyHome - Copilot Instructions

## Architecture Overview

MyHome est un tableau de bord personnel combinant un frontend Angular 20 et un backend Express Node.js. L'application fonctionne en monorepo avec deux dossiers principaux : `frontend/` et `backend/`.

### Structure de l'Application

- **Frontend**: Angular 20 standalone (sans modules NgModule), utilisant PrimeNG pour les composants UI et le thème Aura
- **Backend**: Express.js qui sert à la fois l'API et les fichiers statiques Angular en production
- **Locale**: Application configurée en français (`fr-FR`) avec `registerLocaleData(localeFr)`

## Workflows de Développement Critiques

### Démarrage du Projet

```bash
# Frontend (dev avec proxy) - Terminal 1
cd frontend
ng serve  # Lance sur http://localhost:4200 avec proxy vers backend

# Backend (serveur API) - Terminal 2
cd backend
node server.js  # Lance sur http://localhost:3000
```

### Build & Déploiement

```bash
# Depuis la racine : Build frontend + backend en une commande
npm run build

# Lancer en production (sert le frontend buildé depuis backend)
npm start
```

### Configuration du Proxy

Le fichier `frontend/src/proxy.conf.json` redirige `/api/*` vers `https://conso.boris.sh` (API Linky externe). Les autres appels backend vont vers `localhost:3000` via le `GoogleService.backendUrl`.

## Patterns et Conventions Spécifiques

### 1. Architecture des Services Angular

**Pattern de Cache Unifié**: Tous les services externes utilisent `CacheService` avec localStorage et TTL

```typescript
// Exemple dans MeteoService, LinkyService, FinanceService
const data = this.cacheService.get<T>(this.storageKey);
if (data) return of(data);

return this.http.get<T>(url).pipe(
  tap((data) => this.cacheService.set(this.storageKey, data, 24)) // TTL en heures
);
```

**Injection de Dépendances**: Utiliser `inject()` moderne plutôt que constructor injection

```typescript
http = inject(HttpClient);
cacheService = inject(CacheService);
```

### 2. Organisation des Fonctionnalités par Domaine

Structure feature-based (pas de dossiers shared/components génériques) :

- `energie/` : `light/` (Philips Hue), `linky/` (consommation électrique)
- `google/` : `calendar/`, `mail/` (OAuth via backend)
- `finance/`, `meteo/`, `tcl/`, `video/`
- `shared/` : Uniquement services réutilisables (`cache.service.ts`, `timeTo.pipe.ts`)

### 3. Secrets et Configuration

**Ne JAMAIS commiter** : `backend/secret/google.config.json` (OAuth credentials Google)

**Fichier de secrets** : `frontend/src/app/secret/secret.config.ts` contient :

- `FINANCE_KEY` (MarketStack API)
- `LINKY_KEY` + `LINKY_PRM` (Enedis avec token JWT et expiration)
- `OMDB_API_KEY` (recherche de films)
- Clés hardcodées dans `LightService` (`ip`, `key` pour Philips Hue Bridge)

### 4. Backend Express - Points Critiques

**Authentification Google OAuth 2.0** (session-based) :

1. `/auth/google` : Initie le flow OAuth avec `redirect` query param
2. `/auth/google/callback` : Stocke tokens dans `req.session.tokens`
3. `/calendar/events` & `/mail/count` : Vérifient `req.session.tokens` et utilisent Google APIs

**Serveur de Fichiers Vidéos** :

```javascript
const VIDEO_FOLDER = "D:/Films";
app.get('/api/videos', ...) // Liste des fichiers .mp4/.mkv/.avi/.mov
app.use('/videos', express.static(VIDEO_FOLDER)); // Streaming statique
```

**Fallback SPA** : Route catch-all `app.get(/.*/)` sert `frontend/dist/my-home/browser/index.html` pour le routing Angular côté client.

### 5. Composants Standalone Angular

**Imports Directs** : Tous les composants sont standalone, importer directement les dépendances

```typescript
@Component({
  selector: 'app-main',
  imports: [
    LightListComponent,
    LinkyComponent,
    FinanceComponent,
    CalendarComponent,
    TramComponent,
    Card  // PrimeNG components
  ],
  templateUrl: './main.component.html',
})
```

**Routing** : `app.routes.ts` définit des routes simples avec catch-all sur `MainComponent`

```typescript
{ path: '**', component: MainComponent } // Dashboard principal
```

### 6. Pipe Personnalisée

`TimeToPipe` : Convertit une date en temps relatif ("5 min", "2h 30min") pour afficher les prochains trams/événements.

## Intégrations Externes

### APIs Utilisées

- **Google Calendar & Gmail** : OAuth 2.0 server-side (scopes dans `backend/server.js`)
- **Open-Meteo** : Météo (Lyon coordinates hardcodées)
- **MarketStack** : Données boursières (HO.XPAR symbol)
- **Enedis/Linky** : Consommation électrique (proxy `/api/*` + Bearer token)
- **TCL Lyon** : Temps réels des trams (endpoint hardcodé ligne T4)
- **OMDB** : Métadonnées films
- **Philips Hue Bridge** : Contrôle lumières (IP locale `192.168.1.191`)

### Conversions Spéciales

`LightService.getRGBtoXY()` : Convertit RGB → XY color space Philips Hue (gamut triangle avec gamma correction)

## Commandes de Test

```bash
cd frontend
ng test  # Karma + Jasmine (quelques specs existent : calendar.component.spec.ts)
```

## Notes Importantes

- **CORS** : Backend autorise uniquement `http://localhost:4200` avec credentials
- **Session** : `express-session` avec `secret: 'google-oauth-secret'`, `secure: false` (à changer en prod)
- **PrimeNG** : Thème Aura configuré dans `app.config.ts` avec `providePrimeNG()`
- **HTTP Client** : Configuré avec `withFetch()` dans `app.config.ts`
- **Component Prefix** : `app-` (défini dans `angular.json`)

## Checklist pour Nouvelles Fonctionnalités

1. Créer un dossier feature dans `frontend/src/app/[feature]/`
2. Ajouter `.service.ts` avec cache si appel externe (utiliser `CacheService`)
3. Définir `.model.ts` pour les types TypeScript
4. Créer composant standalone avec imports explicites
5. Ajouter route dans `app.routes.ts` si navigation dédiée
6. Si API externe, ajouter clé dans `secret.config.ts` ou variables d'environnement
7. Pour backend : ajouter endpoint dans `server.js` avec gestion erreurs
