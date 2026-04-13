start npm run dev
build npm run build

Logica di on focus
Utente clicca su edificio (Plane004)
↓
Model.jsx calcola bounding box e muove la camera con GSAP
↓
Model chiama onFocusEnter(name)
↓
Land riceve → aggiorna stato di focus
↓
App.jsx mostra <FocusOverlay /> sopra il Canvas
↓
Utente clicca sulla ❌
↓
App chiama onFocusExit()
↓
Model resetta camera e controlli
