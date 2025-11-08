import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyTerms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Πίσω
          </Button>
        </Link>

        <section className="prose prose-sm max-w-none">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Momster — Together Women Thrive
          </h1>
          <p className="text-muted-foreground italic mb-8">
            Τελευταία ενημέρωση: 7 Νοεμβρίου 2025
          </p>

          <hr className="my-8 border-border" />

          <h2 className="text-3xl font-bold text-primary mb-4">
            Πολιτική Απορρήτου (Privacy Policy)
          </h2>
          <p className="mb-4">
            Η εφαρμογή <strong>Momster</strong> δημιουργήθηκε με σκοπό να συνδέει μαμάδες μεταξύ τους, προσφέροντας έναν ασφαλή και ζεστό χώρο γνωριμίας, επικοινωνίας και ανταλλαγής εμπειριών. Η προστασία των προσωπικών σας δεδομένων είναι ύψιστης σημασίας για εμάς.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            1. Ποια δεδομένα συλλέγουμε
          </h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Όνομα ή ψευδώνυμο</li>
            <li>Email</li>
            <li>Τοποθεσία (πόλη ή περιοχή)</li>
            <li>Ηλικία παιδιού (εύρος)</li>
            <li>Ενδιαφέροντα</li>
            <li>Φωτογραφία προφίλ</li>
            <li>Μηνύματα, αναρτήσεις, προϊόντα που ανεβάζετε στην εφαρμογή</li>
          </ul>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            2. Πώς χρησιμοποιούμε τα δεδομένα σας
          </h3>
          <p className="mb-2">Τα δεδομένα χρησιμοποιούνται για:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Δημιουργία και προβολή προφίλ</li>
            <li>Εύρεση χρηστριών με κοινά ενδιαφέροντα ή κοντινή τοποθεσία</li>
            <li>Αποστολή/λήψη μηνυμάτων και συμμετοχή στο community</li>
            <li>Υποστήριξη χρηστών (support)</li>
          </ul>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            3. Πού αποθηκεύονται και πώς προστατεύονται
          </h3>
          <p className="mb-2">
            Τα δεδομένα αποθηκεύονται στη βάση δεδομένων της πλατφόρμας <strong>Lovable</strong>. Λαμβάνουμε τεχνικά και οργανωτικά μέτρα για την ασφάλεια των δεδομένων:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Κρυπτογράφηση passwords</li>
            <li>Περιορισμένη πρόσβαση (μόνο διαχειριστές / moderators)</li>
            <li>Μη κοινοποίηση προσωπικών δεδομένων σε τρίτους χωρίς συγκατάθεση</li>
          </ul>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            4. Δικαιώματα χρηστριών
          </h3>
          <p className="mb-2">Κάθε χρήστρια έχει το δικαίωμα να:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Ζητήσει πρόσβαση στα προσωπικά της δεδομένα</li>
            <li>Διόρθωση ή ενημέρωση των στοιχείων της</li>
            <li>Ζητήσει διαγραφή του λογαριασμού της («Delete My Account»)</li>
            <li>Ανακαλέσει τη συγκατάθεσή της για ειδοποιήσεις / emails</li>
          </ul>
          <p className="mb-4">
            Για αιτήματα σχετικά με τα δεδομένα σας, επικοινωνήστε στο{" "}
            <a href="mailto:support@momster.app" className="text-primary hover:underline">
              support@momster.app
            </a>
            .
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            5. Cookies & Analytics
          </h3>
          <p className="mb-4">
            Αυτή τη στιγμή η εφαρμογή δεν χρησιμοποιεί cookies ή analytics. Αν προστεθούν, θα ενημερωθείτε και θα ζητηθεί εκ νέου συγκατάθεση.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            6. Διάρκεια διατήρησης δεδομένων
          </h3>
          <p className="mb-2">Τα προσωπικά δεδομένα διαγράφονται οριστικά όταν:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Η χρήστρια ζητήσει τη διαγραφή του λογαριασμού της</li>
            <li>Ο λογαριασμός παραμείνει ανενεργός για 12 μήνες (ή όσο έχει οριστεί από την πολιτική)</li>
          </ul>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            7. Αναφορές και ασφάλεια κοινότητας
          </h3>
          <p className="mb-4">
            Η εφαρμογή διαθέτει μηχανισμό <strong>Report Profile</strong> για αναφορές ύποπτων προφίλ. Προφίλ με πολλαπλές αναφορές μπορούν να απενεργοποιηθούν προσωρινά ή να μπουν σε επανεξέταση από moderators.
          </p>

          <hr className="my-8 border-border" />

          <h2 className="text-3xl font-bold text-primary mb-4">
            Όροι Χρήσης (Terms of Service)
          </h2>
          <p className="mb-4">
            Με τη δημιουργία λογαριασμού στην εφαρμογή <strong>Momster</strong>, συμφωνείτε με τους παρακάτω όρους:
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            1. Περιγραφή υπηρεσίας
          </h3>
          <p className="mb-4">
            Η Momster είναι μια κοινωνική πλατφόρμα για μαμάδες που επιτρέπει τη δημιουργία προφίλ, την επικοινωνία μεταξύ χρηστριών, τη συμμετοχή σε community posts, την οργάνωση events και τη συναλλαγή σε marketplace.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            2. Καταλληλότητα χρήσης
          </h3>
          <p className="mb-4">
            Η εφαρμογή προορίζεται για μαμάδες ή γυναίκες σε φάση μητρότητας. Απαγορεύεται η δημιουργία ψεύτικων προφίλ ή η υποδύση άλλων προσώπων. Η Momster διατηρεί το δικαίωμα να απενεργοποιεί προφίλ που θεωρούνται ύποπτα.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            3. Συμπεριφορά χρηστριών
          </h3>
          <p className="mb-4">
            Οι χρήστριες οφείλουν να συμπεριφέρονται με σεβασμό και ευγένεια. Απαγορεύεται η δημοσίευση παράνομου, προσβλητικού ή ρατσιστικού περιεχομένου. Η παραβίαση μπορεί να οδηγήσει σε προσωρινή ή οριστική απενεργοποίηση λογαριασμού.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            4. Περιεχόμενο χρηστριών
          </h3>
          <p className="mb-4">
            Κάθε χρήστρια παραμένει υπεύθυνη για το περιεχόμενο που δημοσιεύει. Η Momster μπορεί να αφαιρέσει περιεχόμενο που κρίνεται ακατάλληλο.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            5. Διακοπή υπηρεσίας
          </h3>
          <p className="mb-4">
            Η Momster μπορεί να τροποποιήσει ή να διακόψει προσωρινά τη λειτουργία της εφαρμογής για τεχνικούς ή λειτουργικούς λόγους, με ή χωρίς προειδοποίηση.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            6. Περιορισμός ευθύνης
          </h3>
          <p className="mb-4">
            Η εφαρμογή παρέχεται «ως έχει». Η Momster δεν φέρει ευθύνη για ζημίες που προκύπτουν από χρήση ή μη διαθεσιμότητα της υπηρεσίας, ούτε για την ακρίβεια πληροφοριών που παρέχουν άλλες χρήστριες.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">
            7. Επικοινωνία
          </h3>
          <p className="mb-4">
            Για ερωτήσεις, αναφορές ή παράπονα σχετικά με τους Όρους Χρήσης, επικοινωνήστε στο{" "}
            <a href="mailto:support@momster.app" className="text-primary hover:underline">
              support@momster.app
            </a>
            .
          </p>

          <hr className="my-8 border-border" />

          <footer className="text-sm text-muted-foreground mt-8">
            <p>© Momster — Together Women Thrive. Όλα τα δικαιώματα διατηρούνται.</p>
          </footer>
        </section>
      </div>
    </div>
  );
}
