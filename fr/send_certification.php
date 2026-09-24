<?php
// ============================================================
// send_certification.php - Envoi des emails de certification
// Chemin : www/fr/send_certification.php
// ============================================================

// ✅ CONFIGURATION - MODIFIÉ AVEC VOS INFORMATIONS
$admin_email = "maarak.said@gmail.com"; // 🔥 VOTRE EMAIL ADMIN
$site_name = "ETEO E-learning To EveryOne";
$site_url = "https://eteo-dental.com"; // 🔥 VOTRE URL

// ✅ FONCTION POUR ENVOYER UN EMAIL
function sendEmail($to, $subject, $htmlContent, $from = null) {
    global $admin_email, $site_name;
    
    $from = $from ?: $admin_email;
    
    // 📧 Headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . $site_name . " <" . $from . ">\r\n";
    $headers .= "Reply-To: " . $from . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    
    // 📧 Envoi
    return mail($to, $subject, $htmlContent, $headers);
}

// ✅ RÉCUPÉRER LA REQUÊTE
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

// ============================================================
// 1. EMAIL DE CONFIRMATION POUR L'UTILISATEUR
// ============================================================

if ($action === 'confirmation') {
    $fullName = htmlspecialchars($input['fullName'] ?? '');
    $email = htmlspecialchars($input['email'] ?? '');
    $reference = htmlspecialchars($input['reference'] ?? '');
    $specialty = htmlspecialchars($input['specialty'] ?? '');
    $phone = htmlspecialchars($input['phone'] ?? '');
    $message = htmlspecialchars($input['message'] ?? '');
    
    if (!$email || !$reference) {
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        exit;
    }
    
    // ✅ EMAIL UTILISATEUR
    $subject = "📋 Confirmation de votre demande de certification - ETEO";
    
    $htmlContent = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset=\"UTF-8\">
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background: #f8f9fa; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 1.8rem; }
            .header p { margin: 5px 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .ref-box { background: #e8f5e9; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border-left: 4px solid #4caf50; }
            .ref-box .label { font-size: 0.85rem; color: #666; }
            .ref-box .ref { font-size: 1.4rem; font-weight: 800; color: #2e7d32; font-family: monospace; letter-spacing: 1px; }
            .steps { margin: 20px 0; padding: 0; list-style: none; }
            .steps li { padding: 10px 15px; background: #f0f4ff; margin: 6px 0; border-radius: 8px; display: flex; align-items: center; gap: 12px; }
            .steps li .num { background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 35px; border-radius: 30px; text-decoration: none; font-weight: 600; margin-top: 10px; }
            .btn:hover { opacity: 0.9; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 0.8rem; border-top: 1px solid #eee; }
            .highlight { color: #667eea; font-weight: 600; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
            .info-row .label { color: #888; }
            .info-row .value { font-weight: 500; }
        </style>
    </head>
    <body>
        <div class=\"container\">
            <div class=\"header\">
                <h1>🎓 ETEO Certification</h1>
                <p>Confirmation de votre demande</p>
            </div>
            <div class=\"content\">
                <h2>Bonjour Dr. $fullName,</h2>
                <p>Nous avons bien reçu votre demande de certification pour la spécialité : <strong class=\"highlight\">$specialty</strong>.</p>
                
                <div class=\"ref-box\">
                    <div class=\"label\">🔑 Votre référence de demande</div>
                    <div class=\"ref\">$reference</div>
                </div>
                
                <h3>📋 Informations de votre demande</h3>
                <div class=\"info-row\">
                    <span class=\"label\">👤 Nom</span>
                    <span class=\"value\">$fullName</span>
                </div>
                <div class=\"info-row\">
                    <span class=\"label\">📧 Email</span>
                    <span class=\"value\">$email</span>
                </div>
                " . ($phone ? "<div class=\"info-row\"><span class=\"label\">📱 Téléphone</span><span class=\"value\">$phone</span></div>" : "") . "
                <div class=\"info-row\">
                    <span class=\"label\">🦷 Spécialité</span>
                    <span class=\"value\">$specialty</span>
                </div>
                " . ($message ? "<div class=\"info-row\"><span class=\"label\">💬 Message</span><span class=\"value\">$message</span></div>" : "") . "
                
                <h3 style=\"margin-top: 25px;\">📌 Prochaines étapes</h3>
                <ul class=\"steps\">
                    <li><span class=\"num\">1</span> Nous vérifions votre paiement de <strong>20€</strong> sur notre compte.</li>
                    <li><span class=\"num\">2</span> Sous <strong>48h</strong>, vous recevrez votre certificat nominatif en PDF.</li>
                    <li><span class=\"num\">3</span> Si vous avez des questions, répondez à cet email.</li>
                </ul>
                
                <div style=\"text-align: center; margin: 25px 0;\">
                    <a href=\"{$site_url}\" class=\"btn\">📚 Accéder à ETEO</a>
                </div>
                
                <p style=\"margin-top: 20px; color: #888; font-size: 0.9rem;\">
                    📧 Une copie de cette demande a été envoyée à notre équipe pour traitement.
                </p>
            </div>
            <div class=\"footer\">
                © 2024 {$site_name} - Tous droits réservés<br>
                <span style=\"font-size: 0.7rem;\">Cet email est généré automatiquement, merci de ne pas y répondre.</span>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $userSuccess = sendEmail($email, $subject, $htmlContent);
    
    // ✅ EMAIL ADMIN - NOTIFICATION
    $adminSubject = "📌 NOUVELLE DEMANDE DE CERTIFICATION - $fullName";
    $adminContent = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight-box { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 15px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 10px 25px; border-radius: 30px; text-decoration: none; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class=\"container\">
            <div class=\"header\">
                <h1>📌 Nouvelle demande de certification</h1>
                <p>Une demande nécessite votre attention</p>
            </div>
            <div class=\"content\">
                <h2>👤 Demandeur : $fullName</h2>
                
                <div class=\"highlight-box\">
                    <strong>🔑 Référence :</strong> $reference
                </div>
                
                <div class=\"info-row\"><strong>Email</strong> <span>$email</span></div>
                " . ($phone ? "<div class=\"info-row\"><strong>Téléphone</strong> <span>$phone</span></div>" : "") . "
                <div class=\"info-row\"><strong>Spécialité</strong> <span>$specialty</span></div>
                <div class=\"info-row\"><strong>Date</strong> <span>" . date('d/m/Y H:i') . "</span></div>
                " . ($message ? "<div class=\"info-row\"><strong>Message</strong> <span>$message</span></div>" : "") . "
                
                <div style=\"text-align: center; margin: 20px 0;\">
                    <a href=\"{$site_url}/fr/admin_certifications.php\" class=\"btn\">📋 Gérer les demandes</a>
                </div>
                
                <p style=\"color: #888; font-size: 0.85rem;\">
                    ⚠️ Connectez-vous à l'admin pour vérifier le paiement et générer le certificat.
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $adminSuccess = sendEmail($admin_email, $adminSubject, $adminContent);
    
    echo json_encode([
        'success' => $userSuccess && $adminSuccess,
        'message' => 'Emails envoyés avec succès',
        'userEmail' => $email,
        'adminEmail' => $admin_email
    ]);
    exit;
}

// ============================================================
// 2. ENVOI DU CERTIFICAT (LORSQUE VALIDÉ)
// ============================================================

if ($action === 'send_certificate') {
    $fullName = htmlspecialchars($input['fullName'] ?? '');
    $email = htmlspecialchars($input['email'] ?? '');
    $specialty = htmlspecialchars($input['specialty'] ?? '');
    $certificateUrl = htmlspecialchars($input['certificateUrl'] ?? '');
    $certificateId = htmlspecialchars($input['certificateId'] ?? '');
    
    if (!$email || !$certificateUrl) {
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        exit;
    }
    
    $subject = "🎓 Votre certificat ETEO est prêt - Félicitations !";
    
    $htmlContent = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset=\"UTF-8\">
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background: #f8f9fa; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4caf50, #43a047); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 1.8rem; }
            .header p { margin: 5px 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .cert-badge { text-align: center; font-size: 4rem; margin: 10px 0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #4caf50, #388e3c); color: white; padding: 14px 40px; border-radius: 30px; text-decoration: none; font-weight: 700; margin: 10px 0; font-size: 1.1rem; }
            .btn:hover { opacity: 0.9; transform: scale(1.02); }
            .cert-info { background: #f0f4ff; padding: 20px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #667eea; }
            .cert-info .label { color: #888; font-size: 0.85rem; }
            .cert-info .value { font-weight: 700; color: #2c3e50; font-family: monospace; font-size: 1.1rem; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 0.8rem; border-top: 1px solid #eee; }
            .highlight { color: #4caf50; font-weight: 600; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
            .feature { background: #f8f9fa; padding: 10px; border-radius: 8px; text-align: center; font-size: 0.85rem; }
            .feature .icon { font-size: 1.5rem; display: block; margin-bottom: 4px; }
        </style>
    </head>
    <body>
        <div class=\"container\">
            <div class=\"header\">
                <h1>🎓 Félicitations !</h1>
                <p>Votre certification ETEO est prête</p>
            </div>
            <div class=\"content\">
                <div class=\"cert-badge\">🏆</div>
                
                <h2 style=\"text-align: center;\">Cher(e) Dr. $fullName,</h2>
                
                <p style=\"text-align: center; font-size: 1.05rem;\">
                    Nous sommes ravis de vous annoncer que votre <strong class=\"highlight\">certificat ETEO</strong> 
                    pour la spécialité <strong class=\"highlight\">$specialty</strong> est prêt.
                </p>
                
                <div style=\"text-align: center; margin: 25px 0;\">
                    <a href=\"$certificateUrl\" class=\"btn\">📥 Télécharger mon certificat</a>
                </div>
                
                <div class=\"cert-info\">
                    <div class=\"label\">🔑 Référence du certificat</div>
                    <div class=\"value\">$certificateId</div>
                </div>
                
                <h3>📋 Contenu du certificat</h3>
                <div class=\"features\">
                    <div class=\"feature\"><span class=\"icon\">👤</span> Nom nominatif</div>
                    <div class=\"feature\"><span class=\"icon\">🦷</span> Spécialité certifiée</div>
                    <div class=\"feature\"><span class=\"icon\">📱</span> QR Code unique</div>
                    <div class=\"feature\"><span class=\"icon\">🔒</span> Authentifiable</div>
                </div>
                
                <p style=\"font-size: 0.9rem; color: #888; margin-top: 15px;\">
                    ⚠️ Ce certificat est <strong>nominatif</strong> et ne peut être utilisé que par vous.
                    Il contient un QR Code unique permettant de vérifier son authenticité.
                </p>
                
                <hr style=\"margin: 20px 0; border: none; border-top: 1px solid #eee;\">
                
                <p style=\"font-size: 0.9rem; color: #888;\">
                    💡 Si vous avez des questions concernant votre certificat, 
                    répondez simplement à cet email.
                </p>
            </div>
            <div class=\"footer\">
                © 2024 ETEO E-learning To EveryOne - Tous droits réservés<br>
                <span style=\"font-size: 0.7rem;\">Cet email est généré automatiquement.</span>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $success = sendEmail($email, $subject, $htmlContent);
    
    // ✅ COPIE ADMIN
    $adminSubject = "📨 Certificat envoyé - $fullName";
    $adminContent = "
    <h2>📨 Certificat envoyé</h2>
    <p><strong>Nom :</strong> $fullName</p>
    <p><strong>Email :</strong> $email</p>
    <p><strong>Spécialité :</strong> $specialty</p>
    <p><strong>Référence :</strong> $certificateId</p>
    <p><strong>URL :</strong> <a href=\"$certificateUrl\">$certificateUrl</a></p>
    <p><strong>Date :</strong> " . date('d/m/Y H:i') . "</p>
    ";
    sendEmail($admin_email, $adminSubject, $adminContent);
    
    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Certificat envoyé par email' : 'Erreur lors de l\'envoi',
        'email' => $email,
        'certificateId' => $certificateId
    ]);
    exit;
}

// ============================================================
// 3. RÉPONSE PAR DÉFAUT
// ============================================================

echo json_encode([
    'success' => false, 
    'message' => 'Action non reconnue',
    'available_actions' => ['confirmation', 'send_certificate']
]);
exit;
?>