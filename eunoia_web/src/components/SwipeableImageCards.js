import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton as MuiIconButton, Typography, Paper } from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Or FavoriteIcon for a filled heart

// --- Styled Components --- //

const CardContainerUI = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '450px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  overflow: 'hidden',
}));

const CardUI = styled(Paper)(({ theme, imageUrl, zIndexOffset = 0 }) => ({
  width: '90%',
  maxWidth: '320px',
  height: '400px',
  position: 'absolute',
  willChange: 'transform',
  transition: 'all 0.3s ease-out',
  cursor: 'grab',
  userSelect: 'none',
  touchAction: 'none',
  borderRadius: '20px',
  // Using theme shadow for a less "boxed" feel
  boxShadow: theme.shadows[12],
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  // display: 'flex', // No longer needed if CardContentUI is removed
  // flexDirection: 'column',
  // justifyContent: 'flex-end',
  overflow: 'hidden',
  zIndex: 3 - zIndexOffset,
  transform: `translateY(${zIndexOffset * 10}px) rotate(${zIndexOffset * (zIndexOffset % 2 === 0 ? 2 : -2)}deg)`,

  '&.swipe-left': {
    transform: 'translateX(-250px) rotate(-30deg) !important',
    opacity: 0,
  },
  '&.swipe-right': {
    transform: 'translateX(250px) rotate(30deg) !important',
    opacity: 0,
  },
}));

// CardContentUI is no longer used if text is removed from images
// const CardContentUI = styled(Box)({
//   background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
//   color: 'white',
//   padding: '24px',
//   borderBottomLeftRadius: '20px',
//   borderBottomRightRadius: '20px',
// });

const ActionButtonsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginTop: '20px',
});

const ActionButtonUI = styled(MuiIconButton)(({ theme, colorvariant }) => ({
  width: '60px',
  height: '60px',
  backgroundColor: 'white',
  boxShadow: theme.shadows[4], // Using theme shadow
  color: colorvariant === 'like' ? theme.palette.success.main : theme.palette.error.main,
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'white',
  },
  // MUI Icons have their own sizing, adjust if needed via fontSize prop on the icon itself
}));

const EmptyStateUI = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: '20px',
  boxShadow: theme.shadows[6],
  maxWidth: '350px',
  margin: '0 auto',
  '& .empty-state-icon': {
    fontSize: '60px',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));

// --- React Component --- //

const SwipeableImageCards = ({ imagesData, onSwipe }) => {
  const [currentCardsData, setCurrentCardsData] = useState([]);
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const cardElementsRef = useRef({}); // Store refs by card ID

  useEffect(() => {
    const initialLoadCount = Math.min(3, imagesData.length);
    setCurrentCardsData(imagesData.slice(0, initialLoadCount));
    setNextImageIndex(initialLoadCount);
    // Initialize refs for initially loaded cards
    const initialRefs = {};
    imagesData.slice(0, initialLoadCount).forEach(card => {
      initialRefs[card.id] = React.createRef();
    });
    cardElementsRef.current = initialRefs;

  }, [imagesData]);

  const handleSwipe = (direction, swipedCardId) => {
    if (isAnimating || currentCardsData.length === 0) return;
    
    const swipedCard = currentCardsData.find(card => card.id === swipedCardId);
    if (!swipedCard) return;

    setIsAnimating(true);

    const cardElement = cardElementsRef.current[swipedCardId]?.current;
    if (cardElement) {
      cardElement.classList.add(direction === 'right' ? 'swipe-right' : 'swipe-left');
    }

    if (onSwipe) {
      onSwipe(direction, swipedCard);
    }

    setTimeout(() => {
      // Prepare the next state for cards
      let updatedCardsData = currentCardsData.filter(card => card.id !== swipedCardId);
      let updatedNextImageIndex = nextImageIndex;
      const updatedCardElementsRef = { ...cardElementsRef.current };
      delete updatedCardElementsRef[swipedCardId]; // Remove ref of swiped card

      // Add a new card if available
      if (updatedNextImageIndex < imagesData.length) {
        const newCard = imagesData[updatedNextImageIndex];
        updatedCardsData.push(newCard);
        updatedCardElementsRef[newCard.id] = React.createRef(); // Add ref for new card
        updatedNextImageIndex++;
      }

      setCurrentCardsData(updatedCardsData);
      setNextImageIndex(updatedNextImageIndex);
      cardElementsRef.current = updatedCardElementsRef;
      setIsAnimating(false);

      if (updatedCardsData.length === 0 && updatedNextImageIndex >= imagesData.length) {
        setShowEmptyState(true);
      }
    }, 300); // Corresponds to CSS transition time
  };

  if (showEmptyState) {
    return (
      <EmptyStateUI>
        <FavoriteBorderIcon className="empty-state-icon" /> {/* Or CheckCircleOutlineIcon */}
        <Typography variant="h6" component="h3" fontWeight="semibold" gutterBottom>
          All Set!
        </Typography>
        <Typography color="text.secondary" paragraph>
          You've indicated your preferences.
        </Typography>
      </EmptyStateUI>
    );
  }

  // Ensure we only try to access card at index 0 if it exists
  const topCard = currentCardsData.length > 0 ? currentCardsData[0] : null;

  return (
    <Box>
      <CardContainerUI>
        {currentCardsData.map((cardData, index) => (
          <CardUI
            key={cardData.id} // Key should be stable and unique
            ref={cardElementsRef.current[cardData.id]} // Assign ref using card ID
            imageUrl={cardData.imgSrc} 
            zIndexOffset={index} // For stacking effect (topmost card has index 0)
            // Drag handlers will be added in a future step
          >
            {/* CardContentUI removed to not show text on images */}
          </CardUI>
        ))}
      </CardContainerUI>
      <ActionButtonsContainer>
        <ActionButtonUI 
          colorvariant="dislike" 
          onClick={() => topCard && handleSwipe('left', topCard.id)}
          disabled={isAnimating || !topCard}
        >
          <CloseIcon fontSize="large" />
        </ActionButtonUI>
        <ActionButtonUI 
          colorvariant="like" 
          onClick={() => topCard && handleSwipe('right', topCard.id)}
          disabled={isAnimating || !topCard}
        >
          <FavoriteBorderIcon fontSize="large" />
        </ActionButtonUI>
      </ActionButtonsContainer>
    </Box>
  );
};

export default SwipeableImageCards; 