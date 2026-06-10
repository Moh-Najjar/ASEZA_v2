/* eslint-disable react/prop-types */
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardMedia, Grid, Typography, alpha, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface ImageCard {
  id: string;
  title: string;
  image: string;
  path: string;
}

export interface ImageCardGridProps {
  /**
   * Array of card objects to display
   */
  cards: readonly ImageCard[];
  /**
   * Optional spacing between grid items
   * @default { xs: 3, md: 10 }
   */
  spacing?: { xs?: number; md?: number } | number;
  /**
   * Optional padding bottom for the grid container
   * @default { xs: 10, md: 5 }
   */
  paddingBottom?: { xs?: number; md?: number } | number;
  /**
   * Optional custom styles for the grid container
   */
  containerSx?: SxProps<Theme>;
  /**
   * Optional custom styles for individual cards
   */
  cardSx?: SxProps<Theme>;
  /**
   * Optional custom styles for the title typography
   */
  titleSx?: SxProps<Theme>;
  /**
   * Card dimensions
   * @default { xs: "150px", md: "300px" }
   */
  cardSize?: {
    width?: { xs?: string; md?: string } | string;
    height?: { xs?: string; md?: string } | string;
  };
  /**
   * Optional custom object fit for the card media
   * @default 'contain'
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Reusable Image Card Grid Component
 * 
 * Displays a grid of image cards with navigation functionality.
 * Cards show an active state based on the current route pathname.
 */
const ImageCardGrid: React.FC<ImageCardGridProps> = ({
  cards,
  spacing = { xs: 3, md: 10 },
  paddingBottom = { xs: 10, md: 5 },
  containerSx,
  cardSx,
  titleSx,
  cardSize = {
    width: { xs: '150px', md: '300px' },
    height: { xs: '150px', md: '300px' },
  },
  objectFit = 'contain',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <Grid
      container
      spacing={spacing}
      sx={{
        justifyContent: 'center',
        pb: paddingBottom,
        ...containerSx,
      }}>
      {cards.map((card) => {
        const isActive = location.pathname === card.path;
        return (
          <Grid key={card.id}>
            <Card
              onClick={() => navigate(card.path)}
              sx={{
                position: 'relative',
                borderRadius: '16px',
                cursor: 'pointer',
                boxShadow: isActive
                  ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                  : `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                border: isActive
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.12)}`,
                },
                height: cardSize.height,
                width: cardSize.width,
                ...cardSx,
              }}>
              <CardMedia
                component="img"
                width="100%"
                image={card.image}
                alt={card.title}
                sx={{
                  objectFit: objectFit,
                  filter: isActive ? 'none' : 'grayscale(0.2)',
                  position: 'relative',
                  zIndex: 2,
                  marginTop: { xs: '40px', md: '70px' },
                  height: { xs: '80%', md: '80%' },
                }}
              />
              {/* Overlay Title at the Top */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  p: '17px',
                  zIndex: 1,
                  textAlign: 'center',
                }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'LyonArabicDisplay',
                    color: theme.palette.text.secondary,
                    fontWeight: 'normal',
                    fontSize: { xs: '13px', md: '32px' },
                    ...titleSx,
                  }}>
                  {card.title}
                </Typography>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ImageCardGrid;
