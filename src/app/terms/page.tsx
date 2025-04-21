import { Container, Typography, Box } from "@mui/material";

export default function TermsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h3" component="h1">Terms of Service</Typography>
        <Typography>
          Welcome to CryptoGofundme. By using our services, you agree to comply with and be bound by the following terms and conditions.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>1. Acceptance of Terms</Typography>
        <Typography>
          By accessing or using our platform, you agree to these Terms of Service and our Privacy Policy.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>2. Platform Usage</Typography>
        <Typography>
          Our platform allows users to create fundraising campaigns and donate to campaigns using cryptocurrency. All users must comply with applicable laws and regulations.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>3. User Accounts</Typography>
        <Typography>
          You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>4. Prohibited Activities</Typography>
        <Typography>
          Users may not engage in fraudulent activities, create misleading campaigns, or use our platform for illegal purposes.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>5. Intellectual Property</Typography>
        <Typography>
          All content on our platform is owned by us or our licensors and is protected by intellectual property laws.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>6. Limitation of Liability</Typography>
        <Typography>
          We are not liable for any damages arising from your use of our platform or any content posted on it.
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>7. Changes to Terms</Typography>
        <Typography>
          We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
        </Typography>
      </Box>
    </Container>
  );
} 