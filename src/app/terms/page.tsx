import { Container, Heading, Text, VStack } from "@chakra-ui/react";

export default function TermsPage() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Terms of Service</Heading>
        <Text>
          Welcome to CryptoGofundme. By using our services, you agree to comply with and be bound by the following terms and conditions.
        </Text>
        
        <Heading as="h2" size="lg" mt={4}>1. Acceptance of Terms</Heading>
        <Text>
          By accessing or using our platform, you agree to these Terms of Service and our Privacy Policy.
        </Text>
        
        <Heading as="h2" size="lg" mt={4}>2. Platform Usage</Heading>
        <Text>
          Our platform allows users to create fundraising campaigns and donate to campaigns using cryptocurrency. All users must comply with applicable laws and regulations.
        </Text>
        
        <Heading as="h2" size="lg" mt={4}>3. User Accounts</Heading>
        <Text>
          You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
        </Text>
        
        <Heading as="h2" size="lg" mt={4}>4. Prohibited Activities</Heading>
        <Text>
          Users may not engage in fraudulent activities, create misleading campaigns, or use our platform for illegal purposes.
        </Text>
        
        <Heading as="h2" size="lg" mt={4}>5. Intellectual Property</Heading>
        <Text>
          All content on our platform is owned by us or our licensors and is protected by intellectual property laws.
        </Text>
        
        <Heading as="h2" size="lg" mt={4}>6. Limitation of Liability</Heading>
        <Text>
          We are not liable for any damages arising from your use of our platform or any content posted on it.
        </Text>
        
        <Heading as="h2" size="lg" mt={4}>7. Changes to Terms</Heading>
        <Text>
          We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
        </Text>
      </VStack>
    </Container>
  );
} 