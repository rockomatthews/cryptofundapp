import { Container, Typography, Box } from "@mui/material";

export default function PrivacyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h3" component="h1">Privacy Policy</Typography>
        <Typography>
          This Privacy Policy describes how CryptoGofundme collects, uses, and shares your personal information when you use our platform.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>1. Information We Collect</Typography>
        <Typography>
          We collect information you provide when creating an account, such as your name, email address, and wallet information. We also collect data about your usage of the platform and donations made.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>2. How We Use Your Information</Typography>
        <Typography>
          We use your information to provide and improve our services, process transactions, communicate with you, and ensure platform security.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>3. Information Sharing</Typography>
        <Typography>
          We may share your information with service providers who help us operate our platform, and when required by law or to protect our rights.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>4. Data Security</Typography>
        <Typography>
          We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>5. Your Rights</Typography>
        <Typography>
          Depending on your location, you may have rights to access, correct, or delete your personal information. Contact us to exercise these rights.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>6. Cookies and Tracking</Typography>
        <Typography>
          We use cookies and similar technologies to enhance your experience on our platform and collect usage data.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>7. Changes to this Policy</Typography>
        <Typography>
          We may update this Privacy Policy periodically. We will notify you of any significant changes.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>8. Contact Us</Typography>
        <Typography>
          If you have questions about this Privacy Policy, please contact us at privacy@cryptogofundme.com.
        </Typography>
      </Box>
    </Container>
  );
} 