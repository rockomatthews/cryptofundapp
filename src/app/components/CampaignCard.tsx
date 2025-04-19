import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box, 
  LinearProgress,
  Stack
} from '@mui/material';
import Link from 'next/link';

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  creatorName: string;
  daysLeft: number;
}

const CampaignCard = ({
  id,
  title,
  description,
  imageUrl,
  goalAmount,
  currentAmount,
  creatorName,
  daysLeft
}: CampaignCardProps) => {
  const progressPercentage = (currentAmount / goalAmount) * 100;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={imageUrl}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component={Link} 
          href={`/campaign/${id}`}
          sx={{ 
            textDecoration: 'none', 
            color: 'text.primary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {currentAmount.toLocaleString()} ETH
            </Typography>
            <Typography variant="body2" color="text.secondary">
              of {goalAmount.toLocaleString()} ETH
            </Typography>
          </Stack>
          
          <LinearProgress 
            variant="determinate" 
            value={Math.min(progressPercentage, 100)} 
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
          />
          
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              by {creatorName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {daysLeft} days left
            </Typography>
          </Stack>
          
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            component={Link}
            href={`/campaign/${id}`}
          >
            Fund This Project
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CampaignCard; 