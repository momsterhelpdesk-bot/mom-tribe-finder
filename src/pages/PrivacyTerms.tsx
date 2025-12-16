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
              <p className="mb-4">
                Το Momster Marketplace είναι ένας χώρος όπου οι μαμάδες μπορούν να ανταλλάσσουν, να πωλούν ή να δωρίζουν 
                παιδικά είδη και άλλα προϊόντα. <strong>Το Momster δεν λειτουργεί ως μεσάζοντας, έμπορος ή 
                εγγυητής οποιασδήποτε συναλλαγής.</strong>
              </p>
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Αποποίηση Ευθύνης Marketplace</h3>
              <p className="mb-2">Το Momster δεν φέρει καμία ευθύνη για:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Την ποιότητα, ασφάλεια ή καταλληλότητα οποιουδήποτε προϊόντος ή υπηρεσίας που προσφέρεται</li>
                <li>Την ακρίβεια, πληρότητα ή γνησιότητα των αγγελιών και περιγραφών</li>
                <li>Τυχόν ζημιές, απώλειες ή τραυματισμούς που προκύπτουν από τη χρήση προϊόντων</li>
                <li>Τις πληρωμές, επιστροφές χρημάτων ή διαφορές μεταξύ χρηστών</li>
                <li>Την παράδοση, αποστολή ή παραλαβή προϊόντων</li>
                <li>Οποιαδήποτε απάτη, παραπλάνηση ή ψευδείς δηλώσεις από χρήστες</li>
              </ul>
              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                ⚠️ <strong>Σημαντικό:</strong> Οι συναλλαγές γίνονται αποκλειστικά με ευθύνη των χρηστών. 
                Συνιστούμε να επιθεωρείτε τα προϊόντα πριν την αγορά, να συναντιέστε σε δημόσιους χώρους 
                και να μην κοινοποιείτε προσωπικά δεδομένα (διεύθυνση, τραπεζικά στοιχεία) πριν την ολοκλήρωση της συναλλαγής.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 6 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">6. Playdates, Συναντήσεις & Ασφάλεια</h2>
              <p className="mb-4">
                Το Momster διευκολύνει τη γνωριμία μεταξύ μαμάδων, αλλά <strong>δεν οργανώνει, δεν εποπτεύει 
                και δεν φέρει ευθύνη για οποιαδήποτε offline συνάντηση, playdate ή δραστηριότητα</strong> 
                που προκύπτει από τη χρήση της εφαρμογής.
              </p>
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Αποποίηση Ευθύνης για Συναντήσεις</h3>
              <p className="mb-2">Το Momster δεν φέρει ευθύνη για:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Τραυματισμούς, ατυχήματα ή ζημιές που μπορεί να προκύψουν κατά τη διάρκεια playdates ή συναντήσεων</li>
                <li>Τη συμπεριφορά, τις ενέργειες ή τις παραλείψεις οποιουδήποτε χρήστη</li>
                <li>Την επίβλεψη παιδιών κατά τη διάρκεια συναντήσεων</li>
                <li>Οποιαδήποτε διαφορά, σύγκρουση ή παρεξήγηση μεταξύ χρηστών</li>
                <li>Περιπτώσεις κλοπής, απάτης ή παραβατικής συμπεριφοράς</li>
              </ul>
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Συστάσεις Ασφαλείας</h3>
              <p className="mb-2">Συνιστούμε ιδιαίτερα:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Να συναντιέστε πάντα σε δημόσιους χώρους τις πρώτες φορές</li>
                <li>Να ενημερώνετε κάποιον οικείο σας για τη συνάντηση</li>
                <li>Να μην αφήνετε παιδιά χωρίς επίβλεψη σε συναντήσεις με άγνωστα άτομα</li>
                <li>Να εμπιστεύεστε το ένστικτό σας - αν κάτι δεν σας φαίνεται σωστό, αποχωρήστε</li>
                <li>Να αναφέρετε οποιαδήποτε ύποπτη ή ανησυχητική συμπεριφορά</li>
              </ul>
              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                💡 <strong>Θυμηθείτε:</strong> Η ασφάλεια δική σας και των παιδιών σας είναι αποκλειστικά 
                δική σας ευθύνη. Το Momster παρέχει μόνο την πλατφόρμα γνωριμίας.
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

            {/* Section 7.2 - Photo Safety & Moderation */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7.2 Ασφάλεια Φωτογραφιών & Έλεγχος</h2>
              <p className="mb-4">
                Οι φωτογραφίες που ανεβάζουν οι χρήστριες ελέγχονται για να προστατεύσουμε την κοινότητα 
                από ψεύτικους λογαριασμούς και ακατάλληλο περιεχόμενο.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Ο έλεγχος γίνεται με αυτοματοποιημένες διαδικασίες και manual review, μόνο για σκοπούς ασφάλειας.</li>
                <li>Δεν κοινοποιούμε φωτογραφίες και δεν χρησιμοποιούμε αυτές τις εικόνες για άλλους σκοπούς.</li>
                <li>Οι φωτογραφίες πρέπει να δείχνουν πραγματικές μαμάδες — χωρίς παιδιά, χωρίς τρίτα άτομα και χωρίς ακατάλληλο περιεχόμενο.</li>
              </ul>
              
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Αποτροπή Ψεύτικων Προφίλ</h3>
              <p className="mb-4">
                Το Momster μπορεί να περιορίσει ή να απενεργοποιήσει λογαριασμούς που φαίνονται ψεύτικοι 
                ή παραβιάζουν τους κανόνες ασφάλειας.
              </p>

              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Αποποίηση Ευθύνης</h3>
              <p className="mb-4">
                Το Momster δεν ευθύνεται για τις πληροφορίες που δηλώνουν οι χρήστριες, αλλά παρέχει 
                εργαλεία αναφοράς και αποκλεισμού για την ασφάλεια της κοινότητας.
              </p>

              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                📷 <strong>Κανόνες Φωτογραφιών:</strong> Οι φωτογραφίες πρέπει να είναι καθαρές, φυσικές 
                και να δείχνουν το πρόσωπό σου. Αποφύγε πολύ έντονα φίλτρα, φωτογραφίες από Google/internet, 
                ή εικόνες που δημιουργήθηκαν με AI. Φωτογραφίες με παιδιά δεν γίνονται δεκτές για λόγους ασφαλείας.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 7.3 - Profile Reporting */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7.3 Αναφορά Προφίλ</h2>
              <p className="mb-4">
                Η εφαρμογή παρέχει ένα περιβάλλον γνωριμίας μεταξύ χρηστών. Δεν εγγυόμαστε για την ταυτότητα, 
                την ακρίβεια στοιχείων ή τη συμπεριφορά των χρηστών.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Οι αναφορές είναι ανώνυμες και μας βοηθούν να κρατήσουμε την κοινότητα ασφαλή.</li>
                <li>Οι αναφορές εξετάζονται κατά την κρίση της ομάδας μας και μπορεί να οδηγήσουν ή όχι σε ενέργειες.</li>
                <li>Ο χρήστης που αναφέρθηκε δεν ειδοποιείται για την αναφορά.</li>
              </ul>
              <p className="mb-4">
                Αν δεις κάτι ύποπτο ή ανησυχητικό, μπορείς να το αναφέρεις μέσω του κουμπιού αναφοράς στο προφίλ του χρήστη.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 7.4 - Recipe Disclaimer */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7.4 🍽️ Αποποίηση Ευθύνης για Συνταγές & Διατροφικό Περιεχόμενο</h2>
              <p className="mb-4">
                Στη Momster μοιραζόμαστε ιδέες, εμπειρίες και έμπνευση μεταξύ μαμάδων, με αγάπη και φροντίδα. 💗
              </p>
              <p className="mb-4">
                Παρ' όλα αυτά, κάθε παιδί είναι διαφορετικό και γι' αυτό είναι σημαντικό να λαμβάνονται πάντα εξατομικευμένες 
                συμβουλές από ειδικούς. Οι συνταγές και οι διατροφικές πληροφορίες που παρέχονται στην εφαρμογή Momster έχουν 
                αποκλειστικά ενημερωτικό και υποστηρικτικό χαρακτήρα και βασίζονται σε εμπειρίες μαμάδων και γενικές πρακτικές διατροφής.
              </p>
              
              <p className="mb-4 font-medium bg-amber-50 p-4 rounded-lg border border-amber-200">
                ⚠️ <strong>Δεν αποτελούν ιατρική, διατροφική ή επαγγελματική συμβουλή</strong> και δεν υποκαθιστούν 
                τη γνώμη παιδιάτρου, διατροφολόγου ή άλλου επαγγελματία υγείας.
              </p>
              
              <p className="mb-4">
                <strong>Κάθε παιδί είναι μοναδικό.</strong> Οι ανάγκες, οι αλλεργίες, οι δυσανεξίες και τα στάδια 
                ανάπτυξης διαφέρουν από παιδί σε παιδί.
              </p>

              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Ο γονέας ή κηδεμόνας φέρει την αποκλειστική ευθύνη για:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Την επιλογή των τροφών</li>
                <li>Τον τρόπο παρασκευής</li>
                <li>Τον έλεγχο των υλικών</li>
                <li>Την ασφάλεια, την υφή και την καταλληλότητα των γευμάτων</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Η εφαρμογή Momster, οι δημιουργοί της και οι συντάκτες του περιεχομένου δεν φέρουν καμία ευθύνη για:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Αλλεργικές αντιδράσεις</li>
                <li>Πνιγμό</li>
                <li>Δυσανεξίες</li>
                <li>Προβλήματα υγείας</li>
                <li>Οποιαδήποτε άμεση ή έμμεση ζημία που μπορεί να προκύψει από τη χρήση των συνταγών</li>
              </ul>

              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                💗 <strong>Πριν εισάγετε νέες τροφές</strong> ή ακολουθήσετε μεθόδους όπως Baby-Led Weaning, 
                συμβουλευτείτε πάντα τον παιδίατρό σας.
              </p>

              <p className="text-center text-muted-foreground italic mt-6">
                Με αγάπη, η ομάδα του Momster 🐷🌸
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
                Momster Marketplace is a space where moms can exchange, sell or donate children's items and other products. 
                <strong> Momster does not act as intermediary, merchant or guarantor of any transaction.</strong>
              </p>
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Marketplace Liability Disclaimer</h3>
              <p className="mb-2">Momster is not responsible for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The quality, safety or suitability of any product or service offered</li>
                <li>The accuracy, completeness or authenticity of listings and descriptions</li>
                <li>Any damages, losses or injuries resulting from product use</li>
                <li>Payments, refunds or disputes between users</li>
                <li>Delivery, shipping or receipt of products</li>
                <li>Any fraud, deception or false statements by users</li>
              </ul>
              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                ⚠️ <strong>Important:</strong> All transactions are solely at users' own risk. 
                We recommend inspecting products before purchase, meeting in public places, 
                and not sharing personal data (address, bank details) before completing transactions.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 6 */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">6. Playdates, Meetings & Safety</h2>
              <p className="mb-4">
                Momster facilitates connections between moms, but <strong>does not organize, supervise or bear 
                responsibility for any offline meeting, playdate or activity</strong> resulting from app use.
              </p>
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Meeting Liability Disclaimer</h3>
              <p className="mb-2">Momster is not responsible for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Injuries, accidents or damages during playdates or meetings</li>
                <li>The behavior, actions or omissions of any user</li>
                <li>Child supervision during meetings</li>
                <li>Any disputes, conflicts or misunderstandings between users</li>
                <li>Cases of theft, fraud or criminal behavior</li>
              </ul>
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Safety Recommendations</h3>
              <p className="mb-2">We strongly recommend:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Always meet in public places for initial meetings</li>
                <li>Inform someone close about your meeting plans</li>
                <li>Never leave children unsupervised with unfamiliar people</li>
                <li>Trust your instincts - if something feels wrong, leave</li>
                <li>Report any suspicious or concerning behavior</li>
              </ul>
              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                💡 <strong>Remember:</strong> Your safety and your children's safety is solely your responsibility. 
                Momster only provides the connection platform.
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

            {/* Section 7.1 - Photo Safety & Moderation */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7.1 Photo Safety & Moderation</h2>
              <p className="mb-4">
                Photos uploaded by users are reviewed to protect our community from fake accounts 
                and inappropriate content.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Review is done through automated processes and manual review, for safety purposes only.</li>
                <li>We do not share photos or use these images for any other purposes.</li>
                <li>Photos must show real moms — no children, no third parties, and no inappropriate content.</li>
              </ul>
              
              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Fake Profile Prevention</h3>
              <p className="mb-4">
                Momster may restrict or disable accounts that appear fake or violate safety rules.
              </p>

              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Disclaimer</h3>
              <p className="mb-4">
                Momster is not responsible for the information provided by users, but provides 
                reporting and blocking tools for community safety.
              </p>

              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                📷 <strong>Photo Rules:</strong> Photos must be clear, natural and show your face. 
                Avoid heavy filters, photos from Google/internet, or AI-generated images. 
                Photos with children are not accepted for safety reasons.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 7.2 - Profile Reporting */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7.2 Profile Reporting</h2>
              <p className="mb-4">
                The app provides a social environment for users. We do not guarantee the identity, 
                accuracy of information, or behavior of users.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Reports are anonymous and help us keep the community safe.</li>
                <li>Reports are reviewed at our team's discretion and may or may not result in action.</li>
                <li>The reported user is not notified about the report.</li>
              </ul>
              <p className="mb-4">
                If you see something suspicious or concerning, you can report it via the report button on the user's profile.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* Section 7.3 - Recipe Disclaimer */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">7.3 🍽️ Recipe & Nutritional Content Disclaimer</h2>
              <p className="mb-4">
                At Momster, we share ideas, experiences and inspiration among moms, with love and care. 💗
              </p>
              <p className="mb-4">
                However, every child is different and therefore it's important to always seek personalized advice 
                from professionals. The recipes and nutritional information provided in the Momster app are purely 
                informational and supportive in nature, based on mom experiences and general dietary practices.
              </p>
              
              <p className="mb-4 font-medium bg-amber-50 p-4 rounded-lg border border-amber-200">
                ⚠️ <strong>This does not constitute medical, nutritional or professional advice</strong> and does 
                not substitute the opinion of a pediatrician, nutritionist or other healthcare professional.
              </p>
              
              <p className="mb-4">
                <strong>Every child is unique.</strong> Needs, allergies, intolerances and developmental stages 
                vary from child to child.
              </p>

              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">The parent or guardian bears sole responsibility for:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Food selection</li>
                <li>Preparation method</li>
                <li>Ingredient checking</li>
                <li>Safety, texture and meal suitability</li>
              </ul>

              <h3 className="text-2xl font-semibold text-foreground mt-4 mb-3">Momster app, its creators and content authors bear no responsibility for:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Allergic reactions</li>
                <li>Choking</li>
                <li>Intolerances</li>
                <li>Health problems</li>
                <li>Any direct or indirect damage that may result from using the recipes</li>
              </ul>

              <p className="mb-4 font-medium bg-primary/10 p-4 rounded-lg">
                💗 <strong>Before introducing new foods</strong> or following methods like Baby-Led Weaning, 
                always consult your pediatrician.
              </p>

              <p className="text-center text-muted-foreground italic mt-6">
                With love, the Momster team 🐷🌸
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
