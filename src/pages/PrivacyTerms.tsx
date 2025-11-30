import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyTerms() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "el" ? "Πίσω" : "Back"}
          </Button>
        </Link>

        {language === "el" ? (
          // Greek Content
          <section className="prose prose-sm max-w-none space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                Πολιτική Απορρήτου, GDPR, Cookies & Όροι Χρήσης
              </h1>
              <p className="text-muted-foreground italic mb-8">
                Τελευταία ενημέρωση: Νοέμβριος 2025
              </p>
            </div>

            <hr className="my-8 border-border" />

            {/* Section 1 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">1. Εισαγωγή</h2>
              <p className="mb-4">
                Η εφαρμογή Momster ("Εφαρμογή") δεσμεύεται για την προστασία των προσωπικών δεδομένων των χρηστών σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR 2016/679), την ελληνική νομοθεσία και τις διεθνείς βέλτιστες πρακτικές. Με τη χρήση της Εφαρμογής αποδέχεστε την παρούσα Πολιτική.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 2 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">2. Επεξεργασία Προσωπικών Δεδομένων (GDPR Compliance)</h2>
              
              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">2.1 Ποια δεδομένα συλλέγουμε</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Στοιχεία λογαριασμού (email, όνομα/ψευδώνυμο, κωδικός – κρυπτογραφημένος)</li>
                <li>Προφίλ χρήστη (ηλικία, περιοχή, φωτογραφία προφίλ)</li>
                <li>Περιεχόμενο που ανεβάζετε (posts, φωτογραφίες, μηνύματα)</li>
                <li>Δεδομένα συσκευής (IP, τύπος συσκευής, logs)</li>
                <li>Cookies για λειτουργικούς και αναλυτικούς σκοπούς</li>
                <li>Δεδομένα τοποθεσίας (κατά προσέγγιση περιοχή, όχι ακριβής διεύθυνση)</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">2.1.1 Χρήση Δεδομένων Τοποθεσίας</h3>
              <p className="mb-2">
                Η εφαρμογή «Momster» μπορεί να συλλέγει και να χρησιμοποιεί δεδομένα τοποθεσίας της χρήστριας, 
                μόνο εφόσον δοθεί σχετική άδεια μέσα από το pop-up του συστήματος (iOS/Android).
              </p>
              <p className="mb-2">
                Χρησιμοποιούμε κατά προσέγγιση τοποθεσία (approximate location) ή/και γεωγραφική περιοχή, με σκοπό:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>την εμφάνιση άλλων μαμάδων που βρίσκονται κοντά</li>
                <li>τη βελτίωση των προτάσεων γνωριμίας (matching)</li>
                <li>τη δημιουργία πιο σχετικού περιεχομένου και προτεινόμενων επαφών</li>
              </ul>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Απόλυτη Ιδιωτικότητα & Ασφάλεια</h4>
              <p className="mb-4">
                Η εφαρμογή <strong>δεν συλλέγει, δεν αποθηκεύει και δεν μοιράζεται ποτέ την ακριβή διεύθυνση της χρήστριας</strong>. 
                Η τοποθεσία χρησιμοποιείται μόνο σε μορφή "ευρύτερης περιοχής" (π.χ. Δήμος ή γειτονιά) και 
                <strong> δεν εμφανίζεται ποτέ δημόσια ή σε άλλες χρήστριες</strong>.
              </p>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Άδεια & Έλεγχος</h4>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Η χρήση της τοποθεσίας γίνεται μόνο με τη ρητή συγκατάθεσή σας</li>
                <li>Μπορείτε να ενεργοποιήσετε ή να απενεργοποιήσετε την πρόσβαση στην τοποθεσία οποιαδήποτε στιγμή μέσα από τις ρυθμίσεις της συσκευής σας</li>
              </ul>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Τρόπος Επεξεργασίας</h4>
              <p className="mb-2">Τα δεδομένα τοποθεσίας επεξεργάζονται αυτόματα και <strong>δεν χρησιμοποιούνται για</strong>:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>διαφημιστικούς σκοπούς</li>
                <li>εμπορική εκμετάλλευση</li>
                <li>παρακολούθηση</li>
                <li>αποστολή στοχευμένων ειδοποιήσεων πέρα από τη λειτουργία της εφαρμογής</li>
              </ul>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Τρίτοι Πάροχοι</h4>
              <p className="mb-4">
                Δεν κοινοποιούμε δεδομένα τοποθεσίας σε τρίτους. 
                Αν χρησιμοποιηθούν υπηρεσίες χαρτών (π.χ. Google Maps APIs), αφορούν μόνο τεχνική λειτουργικότητα 
                και δεν περιλαμβάνουν προσωπικά δεδομένα.
              </p>

              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">2.2 Νομικές βάσεις επεξεργασίας</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Συναίνεση χρήστη</li>
                <li>Εκτέλεση σύμβασης (λειτουργία λογαριασμού)</li>
                <li>Έννομο συμφέρον (ασφάλεια, βελτιστοποίηση)</li>
                <li>Συμμόρφωση με νομικές υποχρεώσεις</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">2.3 Σκοπός επεξεργασίας</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Λειτουργία προφίλ & συνομιλιών</li>
                <li>Εμφάνιση προτάσεων συνδέσεων</li>
                <li>Διαχείριση events & marketplace</li>
                <li>Ασφάλεια συστήματος & αποτροπή απάτης</li>
                <li>Εξυπηρέτηση χρηστών</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">2.4 Δικαιώματα χρήστη (GDPR)</h3>
              <p className="mb-2">Ο χρήστης δικαιούται:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>πρόσβαση στα δεδομένα του</li>
                <li>διόρθωση/διαγραφή δεδομένων</li>
                <li>φορητότητα δεδομένων</li>
                <li>περιορισμό επεξεργασίας</li>
                <li>ανάκληση συναίνεσης ανά πάσα στιγμή</li>
              </ul>
              <p className="mb-4">
                Αιτήματα αποστέλλονται στο{" "}
                <a href="mailto:momster.helpdesk@gmail.com" className="text-primary hover:underline">
                  momster.helpdesk@gmail.com
                </a>
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 3 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">3. Cookies Policy</h2>
              <p className="mb-2">Χρησιμοποιούμε:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Απολύτως απαραίτητα cookies (authentication)</li>
                <li>Λειτουργικά cookies (ρυθμίσεις χρήστη)</li>
                <li>Analytics cookies (στατιστικά χρήσης)</li>
              </ul>
              <p className="mb-4">
                Με τη συνέχιση της χρήσης της Εφαρμογής αποδέχεστε τη χρήση cookies.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 4 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">4. Διαγραφή Λογαριασμού & Δεδομένων</h2>
              <p className="mb-2">Ο χρήστης μπορεί να διαγράψει τον λογαριασμό του μέσα από το προφίλ. Με τη διαγραφή:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Το προφίλ και το περιεχόμενο του χρήστη διαγράφονται</li>
                <li>Τα δεδομένα logs διατηρούνται για λόγους ασφαλείας έως 12 μήνες</li>
              </ul>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 5 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">5. Marketplace & Αποποίηση Ευθύνης</h2>
              <p className="mb-2">Το Momster δεν είναι μέρος καμίας συναλλαγής. Δεν εγγυάται:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>ποιότητα προϊόντων</li>
                <li>γνησιότητα αγγελιών</li>
                <li>πληρωμές ή επιστροφές</li>
                <li>συναντήσεις μεταξύ χρηστών</li>
              </ul>
              <p className="mb-4">
                Οι συναλλαγές γίνονται αποκλειστικά με ευθύνη των χρηστών.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 6 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">6. Συναντήσεις & Ασφάλεια</h2>
              <p className="mb-2">Το Momster δεν φέρει ευθύνη για:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>offline συναντήσεις χρηστών</li>
                <li>περιστατικά, ζημιές, διαφορές</li>
              </ul>
              <p className="mb-4">
                Ο χρήστης οφείλει να ακολουθεί βασικές πρακτικές ασφάλειας.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 7 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7. Απαγορευμένο Περιεχόμενο</h2>
              <p className="mb-2">Απαγορεύονται:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>παρενόχληση, απειλές, προσβλητικό περιεχόμενο</li>
                <li>ψεύτικα προφίλ</li>
                <li>spam, διαφημίσεις, απάτες</li>
                <li>πορνογραφικό, ακατάλληλο ή παράνομο υλικό</li>
              </ul>
              <p className="mb-4">
                Λογαριασμοί που παραβιάζουν τους όρους διαγράφονται άμεσα.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 7.1 - Post-Moderation */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7.1 Post-Moderation / Περιεχόμενο Χρηστών</h2>
              <p className="mb-4">
                Το περιεχόμενο που δημοσιεύεται στην ενότητα "Ρώτα μια Μαμά" εμφανίζεται αμέσως, χωρίς προέγκριση από τη Momster.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Οι χρήστες είναι αποκλειστικά υπεύθυνοι για ό,τι δημοσιεύουν.</li>
                <li>Η Momster διατηρεί το δικαίωμα να αφαιρεί, να αποκρύπτει ή να περιορίζει οποιοδήποτε περιεχόμενο θεωρηθεί ακατάλληλο, προσβλητικό, παραπλανητικό ή αντίθετο στους Κανόνες Κοινότητας, χωρίς προειδοποίηση.</li>
                <li>Η Momster δεν ευθύνεται για τις συμβουλές, πληροφορίες, γνώμες ή δηλώσεις που κοινοποιούνται από τους χρήστες και δεν εγγυάται την ακρίβεια ή την αξιοπιστία τους. Οι χρήστες οφείλουν να αξιολογούν και να χρησιμοποιούν την πληροφορία με δική τους κρίση.</li>
              </ul>
              <p className="mb-4 font-medium">
                Εμπιστευόμαστε τη μαμαδο-κοινότητα, αλλά θέλουμε να παραμένει ένα ασφαλές και υποστηρικτικό μέρος.
                Αν δεις κάτι που δεν ταιριάζει στο πνεύμα του Momster, μπορείς να το αναφέρεις και θα το ελέγξουμε άμεσα. 💕
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 8 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">8. Αποποίηση Ευθύνης (Full Disclaimer)</h2>
              <p className="mb-2">Η Εφαρμογή παρέχεται "ως έχει". Δεν εγγυάται:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>συνεχή ή απρόσκοπτη λειτουργία</li>
                <li>ακρίβεια περιεχομένου χρηστών</li>
                <li>ασφάλεια συναντήσεων</li>
                <li>μηδενικό ρίσκο παραβίασης δεδομένων (αν και λαμβάνονται όλα τα μέτρα)</li>
              </ul>
              <p className="mb-4">
                Ο χρήστης αποδέχεται ότι χρησιμοποιεί την Εφαρμογή με αποκλειστική δική του ευθύνη.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 9 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">9. Αλλαγές στην Πολιτική</h2>
              <p className="mb-4">
                Η εφαρμογή διατηρεί το δικαίωμα ενημέρωσης των πολιτικών οποτεδήποτε.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 10 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">10. Επικοινωνία</h2>
              <p className="mb-4">
                <a href="mailto:momster.helpdesk@gmail.com" className="text-primary hover:underline">
                  momster.helpdesk@gmail.com
                </a>
              </p>
            </div>

            <hr className="my-8 border-border" />

            <footer className="text-sm text-muted-foreground mt-8">
              <p>© Momster — Together Women Thrive. Όλα τα δικαιώματα διατηρούνται.</p>
            </footer>
          </section>
        ) : (
          // English Content
          <section className="prose prose-sm max-w-none space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                Privacy Policy, GDPR Compliance, Cookies & Terms
              </h1>
              <p className="text-muted-foreground italic mb-8">
                Last updated: November 2025
              </p>
            </div>

            <hr className="my-8 border-border" />

            {/* Section 1 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">1. Introduction</h2>
              <p className="mb-4">
                Momster is committed to protecting your personal data under GDPR (2016/679) and applicable laws.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 2 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">2. Data We Collect</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Account data (email, username, encrypted password)</li>
                <li>Profile information (age, region, profile photo)</li>
                <li>User-generated content (posts, messages)</li>
                <li>Device data (IP, logs)</li>
                <li>Cookies</li>
                <li>Location data (approximate area, not exact address)</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">2.1 Location Data Usage</h3>
              <p className="mb-2">
                Momster may collect and use your location data only if you grant permission through the system pop-up (iOS/Android).
              </p>
              <p className="mb-2">
                We use approximate location or geographic area to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Show nearby moms</li>
                <li>Improve matching suggestions</li>
                <li>Create more relevant content and connection recommendations</li>
              </ul>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Privacy & Security</h4>
              <p className="mb-4">
                The app <strong>never collects, stores or shares your exact address</strong>. 
                Location is only used as "broader area" (e.g. municipality or neighborhood) and 
                <strong> is never displayed publicly or to other users</strong>.
              </p>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Permission & Control</h4>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Location is only used with your explicit consent</li>
                <li>You can enable or disable location access at any time in your device settings</li>
              </ul>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Processing Method</h4>
              <p className="mb-2">Location data is processed automatically and <strong>is NOT used for</strong>:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Advertising purposes</li>
                <li>Commercial exploitation</li>
                <li>Tracking</li>
                <li>Sending targeted notifications beyond app functionality</li>
              </ul>

              <h4 className="text-xl font-semibold text-foreground mt-4 mb-2">Third Parties</h4>
              <p className="mb-4">
                We do not share location data with third parties. 
                If map services (e.g. Google Maps APIs) are used, they are for technical functionality only 
                and do not include personal data.
              </p>

              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">Legal Basis</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Consent</li>
                <li>Contract performance</li>
                <li>Legitimate interest</li>
                <li>Legal obligation</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">User Rights (GDPR)</h3>
              <p className="mb-2">You may request:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>access, correction, deletion</li>
                <li>data portability</li>
                <li>restriction of processing</li>
                <li>withdrawal of consent</li>
              </ul>
              <p className="mb-4">
                Contact:{" "}
                <a href="mailto:momster.helpdesk@gmail.com" className="text-primary hover:underline">
                  momster.helpdesk@gmail.com
                </a>
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 3 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">3. Cookies</h2>
              <p className="mb-4">We use essential, functional and analytics cookies.</p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 4 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">4. Account & Data Deletion</h2>
              <p className="mb-4">
                Users may delete their account at any time. Log data may remain for 12 months for security purposes.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 5 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">5. Marketplace Disclaimer</h2>
              <p className="mb-4">
                Momster is not responsible for transactions, product quality, payments or meetings. All interactions occur at users' own risk.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 6 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">6. Safety Notice</h2>
              <p className="mb-4">
                Momster is not liable for incidents related to offline meetings.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 7 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7. Prohibited Content</h2>
              <p className="mb-4">
                Includes harassment, scams, illegal content, explicit material.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 8 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">8. Full Disclaimer</h2>
              <p className="mb-4">
                Momster is provided "as is" with no guarantees of uninterrupted operation, content accuracy or user behavior.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 9 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">9. Changes</h2>
              <p className="mb-4">
                Policies may be updated anytime.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 10 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">10. Contact</h2>
              <p className="mb-4">
                <a href="mailto:momster.helpdesk@gmail.com" className="text-primary hover:underline">
                  momster.helpdesk@gmail.com
                </a>
              </p>
            </div>

            <hr className="my-8 border-border" />

            <footer className="text-sm text-muted-foreground mt-8">
              <p>© Momster — Together Women Thrive. All rights reserved.</p>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
}
