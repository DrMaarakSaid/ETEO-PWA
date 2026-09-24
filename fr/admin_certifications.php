<?php
// ============================================================
// admin_certifications.php - Interface Admin
// Emplacement : ETEO_Apple/www/fr/admin_certifications.php
// ============================================================

// ✅ PROTECTION - MOT DE PASSE (À CHANGER !)
$admin_password = "admin123";

// ✅ VÉRIFICATION AUTH
if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_PW'] !== $admin_password) {
    header('WWW-Authenticate: Basic realm="Admin ETEO"');
    header('HTTP/1.0 401 Unauthorized');
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>🔒 Accès réservé</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f4ff; margin: 0; }
            .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #2c3e50; }
            p { color: #888; }
            .lock { font-size: 4rem; }
            .hint { font-size: 0.8rem; color: #999; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="lock">🔒</div>
            <h1>Accès réservé</h1>
            <p>Veuillez vous authentifier pour accéder à l\'administration.</p>
            <p class="hint">Identifiant : admin / Mot de passe : admin123</p>
        </div>
    </body>
    </html>';
    exit;
}

// ✅ CONFIGURATION
$admin_email = "maarak.said@gmail.com";
$site_name = "ETEO E-learning To EveryOne";
$site_url = "https://eteo-dental.com";
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Admin - Certifications ETEO</title>
    <link rel="stylesheet" href="../css/style.css">
    
    <script type="importmap">
    {
        "imports": {
            "firebase/app": "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js",
            "firebase/firestore": "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
        }
    }
    </script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #f0f4ff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 20px;
        }
        
        .admin-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.10);
        }
        
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .admin-header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 1.6rem;
        }
        
        .admin-header .stats {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .stat-badge {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .stat-badge.pending { background: #fff3cd; color: #856404; }
        .stat-badge.verified { background: #c8e6c9; color: #2e7d32; }
        .stat-badge.completed { background: #bbdefb; color: #0d47a1; }
        .stat-badge.rejected { background: #ffcdd2; color: #c62828; }
        .stat-badge.total { background: #e8e8e8; color: #555; }
        
        .badge-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 600;
            display: inline-block;
        }
        
        .badge-status.pending { background: #fff3cd; color: #856404; }
        .badge-status.verified { background: #c8e6c9; color: #2e7d32; }
        .badge-status.completed { background: #bbdefb; color: #0d47a1; }
        .badge-status.rejected { background: #ffcdd2; color: #c62828; }
        
        .request-card {
            border: 1px solid #eee;
            border-radius: 12px;
            padding: 20px;
            margin: 12px 0;
            transition: all 0.3s ease;
            background: #fafafa;
        }
        
        .request-card:hover {
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border-color: #667eea;
        }
        
        .request-card .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .request-card .info {
            flex: 1;
            min-width: 200px;
        }
        
        .request-card .info .name {
            font-weight: 700;
            color: #2c3e50;
            font-size: 1.1rem;
        }
        
        .request-card .info .email {
            color: #667eea;
        }
        
        .request-card .info .ref {
            color: #888;
            font-size: 0.85rem;
            font-family: monospace;
        }
        
        .request-card .info .date {
            color: #999;
            font-size: 0.8rem;
        }
        
        .request-card .info .specialty {
            display: inline-block;
            background: #e8f0fe;
            padding: 2px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            color: #667eea;
        }
        
        .request-card .info .message {
            color: #888;
            font-size: 0.85rem;
            margin-top: 4px;
            padding: 6px 10px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 3px solid #667eea;
        }
        
        .request-card .actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .btn-verify {
            padding: 8px 18px;
            border: none;
            border-radius: 20px;
            background: #4caf50;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.85rem;
        }
        
        .btn-verify:hover { transform: scale(1.05); background: #388e3c; }
        
        .btn-reject {
            padding: 8px 18px;
            border: none;
            border-radius: 20px;
            background: #e74c3c;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.85rem;
        }
        
        .btn-reject:hover { transform: scale(1.05); background: #c62828; }
        
        .btn-download {
            padding: 8px 18px;
            border: none;
            border-radius: 20px;
            background: #667eea;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.85rem;
        }
        
        .btn-download:hover { transform: scale(1.05); background: #5a6fd6; }
        
        .btn-complete {
            padding: 8px 18px;
            border: none;
            border-radius: 20px;
            background: #ff9800;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.85rem;
        }
        
        .btn-complete:hover { transform: scale(1.05); background: #f57c00; }
        
        .btn-resend {
            padding: 8px 18px;
            border: none;
            border-radius: 20px;
            background: #9b59b6;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.85rem;
        }
        
        .btn-resend:hover { transform: scale(1.05); background: #8e44ad; }
        
        .empty-state {
            text-align: center;
            padding: 60px;
            color: #888;
        }
        
        .empty-state .icon { font-size: 4rem; }
        
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 20px;
            border: 2px solid #ddd;
            border-radius: 20px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 0.85rem;
        }
        
        .filter-btn.active {
            border-color: #667eea;
            background: #667eea;
            color: white;
        }
        
        .filter-btn:hover:not(.active) { border-color: #667eea; }
        
        .refresh-btn {
            padding: 8px 20px;
            border: none;
            border-radius: 20px;
            background: #667eea;
            color: white;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .refresh-btn:hover { transform: scale(1.05); }
        
        .loading-spinner {
            display: none;
            text-align: center;
            padding: 40px;
        }
        
        .loading-spinner .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .toast-custom {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #2c3e50;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 0.9rem;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: fadeInToast 0.3s ease;
            max-width: 90%;
            text-align: center;
        }
        
        @keyframes fadeInToast {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        .admin-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .admin-footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .admin-footer a:hover { text-decoration: underline; }
        
        @media (max-width: 600px) {
            .admin-container { padding: 15px; }
            .request-card .row { flex-direction: column; }
            .request-card .actions { width: 100%; justify-content: flex-start; }
            .admin-header { flex-direction: column; gap: 10px; text-align: center; }
            .admin-header .stats { justify-content: center; }
            .stat-badge { font-size: 0.7rem; padding: 4px 12px; }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <div>
                <h1>📋 Administration - Certifications</h1>
                <p style="color: #888; margin: 0; font-size: 0.9rem;">Gérez les demandes de certification ETEO</p>
            </div>
            <div class="stats">
                <span class="stat-badge total" id="totalCount">📋 Total: 0</span>
                <span class="stat-badge pending" id="pendingCount">⏳ En attente: 0</span>
                <span class="stat-badge verified" id="verifiedCount">✅ Vérifiées: 0</span>
                <span class="stat-badge completed" id="completedCount">🎓 Certifiées: 0</span>
                <span class="stat-badge rejected" id="rejectedCount">❌ Rejetées: 0</span>
            </div>
        </div>
        
        <div class="filters">
            <button class="filter-btn active" data-filter="all">📋 Toutes</button>
            <button class="filter-btn" data-filter="pending">⏳ En attente</button>
            <button class="filter-btn" data-filter="verified">✅ Vérifiées</button>
            <button class="filter-btn" data-filter="completed">🎓 Certifiées</button>
            <button class="filter-btn" data-filter="rejected">❌ Rejetées</button>
            <button class="refresh-btn" id="refreshBtn">🔄 Actualiser</button>
        </div>
        
        <div id="requestsContainer">
            <div class="loading-spinner" id="loadingSpinner">
                <div class="spinner"></div>
                <p style="margin-top: 10px; color: #888;">Chargement des demandes...</p>
            </div>
            <div id="requestsList">
                <!-- Généré par JavaScript -->
            </div>
        </div>
        
        <div class="admin-footer">
            <span style="color: #999; font-size: 0.8rem;">
                🔒 Accès sécurisé • <?php echo date('d/m/Y H:i'); ?>
            </span>
            <a href="quiz.html">🔙 Retour au quiz</a>
        </div>
    </div>
    
    <script type="module">
        // ============================================================
        // IMPORTS FIREBASE
        // ============================================================
        
        import { initializeApp } from 'firebase/app';
        import { getFirestore, collection, query, getDocs, updateDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
        
        // ============================================================
        // CONFIG FIREBASE
        // ============================================================
        
        const firebaseConfig = {
            apiKey: "AIzaSyDcIvbmmqiEqWbjNqTUwx1JGWkj6dxK-DE",
            authDomain: "eteo-endo-to-every-one.firebaseapp.com",
            databaseURL: "https://eteo-endo-to-every-one-default-rtdb.firebaseio.com",
            projectId: "eteo-endo-to-every-one",
            storageBucket: "eteo-endo-to-every-one.firebasestorage.app",
            messagingSenderId: "511524282020",
            appId: "1:511524282020:web:5a25c021fd84f026969031"
        };
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // ============================================================
        // ÉTAT
        // ============================================================
        
        let allRequests = [];
        let currentFilter = 'all';
        
        // ============================================================
        // TOAST
        // ============================================================
        
        function showToast(message) {
            const existing = document.querySelector('.toast-custom');
            if (existing) existing.remove();
            
            const toast = document.createElement('div');
            toast.className = 'toast-custom';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        
        // ============================================================
        // FORMATER LA DATE
        // ============================================================
        
        function formatDate(timestamp) {
            if (!timestamp) return 'Date inconnue';
            try {
                const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
                return date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return 'Date inconnue';
            }
        }
        
        // ============================================================
        // CHARGER LES DEMANDES EN TEMPS RÉEL
        // ============================================================
        
        function loadRequests() {
            const loadingSpinner = document.getElementById('loadingSpinner');
            const requestsList = document.getElementById('requestsList');
            
            loadingSpinner.style.display = 'block';
            requestsList.innerHTML = '';
            
            try {
                const q = query(
                    collection(db, 'certification_requests'),
                    orderBy('createdAt', 'desc')
                );
                
                onSnapshot(q, (snapshot) => {
                    allRequests = [];
                    snapshot.forEach((doc) => {
                        allRequests.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    loadingSpinner.style.display = 'none';
                    updateStats();
                    renderRequests(currentFilter);
                    
                    console.log('✅ Demandes chargées:', allRequests.length);
                    
                }, (error) => {
                    console.error('❌ Erreur Firestore:', error);
                    loadingSpinner.style.display = 'none';
                    requestsList.innerHTML = `
                        <div class="empty-state">
                            <div class="icon">⚠️</div>
                            <h3>Erreur de chargement</h3>
                            <p>${error.message}</p>
                            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 20px; border: none; border-radius: 20px; background: #667eea; color: white; cursor: pointer;">
                                🔄 Réessayer
                            </button>
                        </div>
                    `;
                });
                
            } catch (error) {
                console.error('❌ Erreur:', error);
                loadingSpinner.style.display = 'none';
                requestsList.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">⚠️</div>
                        <p>Erreur de chargement des données</p>
                    </div>
                `;
            }
        }
        
        // ============================================================
        // METTRE À JOUR LES STATISTIQUES
        // ============================================================
        
        function updateStats() {
            const total = allRequests.length;
            const pending = allRequests.filter(r => r.status === 'pending').length;
            const verified = allRequests.filter(r => r.status === 'verified').length;
            const completed = allRequests.filter(r => r.status === 'completed').length;
            const rejected = allRequests.filter(r => r.status === 'rejected').length;
            
            document.getElementById('totalCount').textContent = `📋 Total: ${total}`;
            document.getElementById('pendingCount').textContent = `⏳ En attente: ${pending}`;
            document.getElementById('verifiedCount').textContent = `✅ Vérifiées: ${verified}`;
            document.getElementById('completedCount').textContent = `🎓 Certifiées: ${completed}`;
            document.getElementById('rejectedCount').textContent = `❌ Rejetées: ${rejected}`;
        }
        
        // ============================================================
        // RENDRE LES DEMANDES
        // ============================================================
        
        function renderRequests(filter) {
            const list = document.getElementById('requestsList');
            
            let filtered = allRequests;
            if (filter !== 'all') {
                filtered = allRequests.filter(r => r.status === filter);
            }
            
            if (filtered.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📭</div>
                        <h3>Aucune demande ${filter !== 'all' ? filter : ''}</h3>
                        <p>Les nouvelles demandes apparaîtront ici automatiquement.</p>
                    </div>
                `;
                return;
            }
            
            const statusLabels = {
                pending: { label: '⏳ En attente', class: 'pending' },
                verified: { label: '✅ Vérifiée', class: 'verified' },
                completed: { label: '🎓 Certifiée', class: 'completed' },
                rejected: { label: '❌ Rejetée', class: 'rejected' }
            };
            
            list.innerHTML = filtered.map(request => {
                const status = statusLabels[request.status] || statusLabels.pending;
                const date = formatDate(request.createdAt);
                
                let actions = '';
                
                if (request.status === 'pending') {
                    actions = `
                        <button class="btn-verify" onclick="updateStatus('${request.id}', 'verified')">
                            ✅ Vérifier
                        </button>
                        <button class="btn-reject" onclick="updateStatus('${request.id}', 'rejected')">
                            ❌ Rejeter
                        </button>
                    `;
                } else if (request.status === 'verified') {
                    actions = `
                        <button class="btn-complete" onclick="generateCertificate('${request.id}')">
                            🎓 Générer le certificat
                        </button>
                        <button class="btn-reject" onclick="updateStatus('${request.id}', 'rejected')">
                            ❌ Rejeter
                        </button>
                    `;
                } else if (request.status === 'completed') {
                    actions = `
                        <button class="btn-download" onclick="downloadCertificate('${request.id}')">
                            📥 Télécharger
                        </button>
                        <button class="btn-resend" onclick="resendCertificate('${request.id}')">
                            📧 Renvoyer
                        </button>
                    `;
                } else if (request.status === 'rejected') {
                    actions = `
                        <button class="btn-verify" onclick="updateStatus('${request.id}', 'pending')">
                            🔄 Réactiver
                        </button>
                    `;
                }
                
                const messageHtml = request.message ? `<div class="message">💬 ${request.message}</div>` : '';
                
                return `
                    <div class="request-card" id="card-${request.id}">
                        <div class="row">
                            <div class="info">
                                <div class="name">👤 ${request.fullName || 'Nom inconnu'}</div>
                                <div class="email">📧 ${request.email || 'Email inconnu'}</div>
                                <div style="margin-top: 4px;">
                                    <span class="specialty">🦷 ${request.specialty || 'Spécialité non spécifiée'}</span>
                                    <span class="badge-status ${status.class}">${status.label}</span>
                                </div>
                                <div class="ref">🔑 ${request.reference || 'Sans référence'}</div>
                                <div class="date">📅 ${date}</div>
                                ${messageHtml}
                                ${request.certificateId ? `<div style="font-size: 0.8rem; color: #667eea; margin-top: 4px;">📜 Certificat: ${request.certificateId}</div>` : ''}
                            </div>
                            <div class="actions">
                                ${actions}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // ============================================================
        // EXPOSER LES FONCTIONS GLOBALEMENT
        // ============================================================
        
        window.updateStatus = async function(id, newStatus) {
            if (!confirm(`Confirmer le passage au statut "${newStatus}" ?`)) return;
            
            try {
                const docRef = doc(db, 'certification_requests', id);
                await updateDoc(docRef, {
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                });
                showToast(`✅ Statut mis à jour : ${newStatus}`);
            } catch (error) {
                console.error('❌ Erreur:', error);
                showToast('❌ Erreur lors de la mise à jour');
            }
        };
        
        window.generateCertificate = async function(id) {
            const request = allRequests.find(r => r.id === id);
            if (!request) {
                showToast('❌ Demande introuvable');
                return;
            }
            
            if (!confirm(`Générer le certificat pour ${request.fullName} ?`)) return;
            
            try {
                // ✅ SIMULATION DE GÉNÉRATION (à remplacer par votre vraie génération)
                const certificateId = 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                const certificateUrl = `certificats/${certificateId}.pdf`;
                
                // ✅ METTRE À JOUR LE STATUT
                const docRef = doc(db, 'certification_requests', id);
                await updateDoc(docRef, {
                    status: 'completed',
                    certificateUrl: certificateUrl,
                    certificateId: certificateId,
                    updatedAt: new Date().toISOString()
                });
                
                showToast('🎓 Certificat généré avec succès !');
                
                // ✅ ENVOYER L'EMAIL
                try {
                    const response = await fetch('send_certification.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'send_certificate',
                            fullName: request.fullName,
                            email: request.email,
                            specialty: request.specialty,
                            certificateUrl: certificateUrl,
                            certificateId: certificateId
                        })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        showToast('📧 Certificat envoyé par email !');
                    }
                } catch (emailError) {
                    console.warn('⚠️ Erreur envoi email:', emailError);
                }
                
            } catch (error) {
                console.error('❌ Erreur:', error);
                showToast('❌ Erreur lors de la génération');
            }
        };
        
        window.downloadCertificate = function(id) {
            const request = allRequests.find(r => r.id === id);
            if (request?.certificateUrl) {
                window.open(request.certificateUrl, '_blank');
            } else {
                showToast('❌ Certificat non disponible');
            }
        };
        
        window.resendCertificate = async function(id) {
            const request = allRequests.find(r => r.id === id);
            if (!request) {
                showToast('❌ Demande introuvable');
                return;
            }
            
            try {
                const response = await fetch('send_certification.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send_certificate',
                        fullName: request.fullName,
                        email: request.email,
                        specialty: request.specialty,
                        certificateUrl: request.certificateUrl,
                        certificateId: request.certificateId
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    showToast('📧 Certificat renvoyé par email !');
                } else {
                    showToast(`❌ Erreur: ${result.message}`);
                }
            } catch (error) {
                console.error('❌ Erreur:', error);
                showToast('❌ Erreur lors de l\'envoi');
            }
        };
        
        // ============================================================
        // FILTRES
        // ============================================================
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderRequests(currentFilter);
            });
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            showToast('🔄 Actualisation...');
            loadRequests();
        });
        
        // ============================================================
        // INIT
        // ============================================================
        
        loadRequests();
        
        console.log('✅ Admin Certifications chargé');
        console.log('📋 Firebase : collection certification_requests');
        console.log('🔒 Accès sécurisé');
        console.log('👤 Email admin: maarak.said@gmail.com');
    </script>
</body>
</html>