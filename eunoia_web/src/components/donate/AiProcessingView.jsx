import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  LinearProgress, 
  Chip 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import CompassAnimation from '../CompassAnimation';

const StepContent = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: '400px',
}));

const AiProcessingView = ({
  visionPrompt,
  totalDonationAmount,
  setCurrentStage,
  setAiMatchedCharities,
  setAiSuggestedAllocations,
  setSemanticSearchLoading,
  setSemanticSearchError,
  semanticSearchLoading,
  semanticSearchError,
  setCombinedMissionStatement,
  setCompassRecommendations,
  setGroupedMatches
}) => { 
  console.log('AiProcessingView render');
  
  useEffect(() => {
    const performSemanticSearch = async () => {
      if (!visionPrompt.trim()) {
        setSemanticSearchError("Please enter your vision before searching.");
        setCurrentStage('visionPrompt');
        return;
      }

      setSemanticSearchLoading(true);
      setSemanticSearchError(null);
      setAiMatchedCharities([]);
      setAiSuggestedAllocations({});

      // // Artificial delay for testing animation visibility
      // await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay

      try {
        console.log(`Compass matching for: "${visionPrompt}"`);
        const response = await axios.post(`${API_BASE_URL}/compass/match/`, {
          query: visionPrompt,
          top_k: 10,
        });

        console.log("Compass response:", response.data);

        const grouped = response.data?.grouped_matches || {};
        const recommendations = response.data?.recommendations?.top_recommendations || [];

        const byCharityId = new Map();
        const priorityIds = [];

        // Prioritize charities present in recommendations first
        recommendations.forEach(rec => {
          const group = Object.values(grouped).find(g => g.charity_name === rec.charity_name);
          if (group && !byCharityId.has(group.charity_id)) {
            byCharityId.set(group.charity_id, group);
            priorityIds.push(group.charity_id);
          }
        });

        // Add remaining groups ordered by highest movement score
        const remaining = Object.values(grouped)
          .filter(g => !byCharityId.has(g.charity_id))
          .sort((a,b) => {
            const atop = Math.max(...a.movements.map(m => m.score || 0), 0);
            const btop = Math.max(...b.movements.map(m => m.score || 0), 0);
            return btop - atop;
          });
        remaining.forEach(g => {
          byCharityId.set(g.charity_id, g);
          priorityIds.push(g.charity_id);
        });

        if (priorityIds.length === 0) {
          setSemanticSearchError("No strong matches were found for your vision.");
          setCombinedMissionStatement("");
          setCurrentStage('charityResults');
          return;
        }

        // Fetch full charity details for each id
        const detailResponses = await Promise.all(
          priorityIds.map(id => axios.get(`${API_BASE_URL}/charities/${id}/`).catch(() => null))
        );

        const detailsById = new Map();
        detailResponses.forEach((res, idx) => {
          const id = priorityIds[idx];
          if (res && res.data) detailsById.set(id, res.data);
        });

        // Build cards data
        const charities = priorityIds.map((id, index) => {
          const group = byCharityId.get(id);
          const detail = detailsById.get(id) || {};
          const topScore = Math.max(...(group.movements || []).map(m => m.score || 0), 0);
          const reasonForThisCharity = recommendations.find(r => r.charity_name === group.charity_name)?.reason || '';

          return {
            id: id,
            name: detail.name || group.charity_name,
            description: detail.description || group.charity_description || "No description available.",
            logo: (detail.logo_url || detail.logo) || 'https://via.placeholder.com/300x200.png?text=No+Logo',
            aptos_wallet_address: detail.aptos_wallet_address || "N/A",
            category: detail.category_display || detail.category || "Other",
            match_score_percent: topScore ? Math.round(topScore * 100) : (95 - (index * 5)),
            trust_score_grade: 'A',
            ai_explanation: reasonForThisCharity || `Top movements from ${group.charity_name} align with your vision.`,
            // Extra data (not used directly by cards but handy)
            movements: group.movements || [],
          };
        });

        setAiMatchedCharities(charities);

        // Compute allocations from match scores
        const totalScore = charities.reduce((sum, c) => sum + (c.match_score_percent || 0), 0);
        const allocations = {};
        let cumulativeAllocation = 0;
        if (totalScore > 0) {
          charities.forEach((charity, index) => {
            let rawAllocation;
            if (index === charities.length - 1) {
              rawAllocation = totalDonationAmount - cumulativeAllocation;
            } else {
              rawAllocation = ((charity.match_score_percent || 0) / totalScore) * totalDonationAmount;
            }
            const finalAllocation = Math.max(0, parseFloat(rawAllocation.toFixed(2)));
            allocations[charity.id] = finalAllocation;
            cumulativeAllocation += finalAllocation;
          });
          const sumOfAllocations = Object.values(allocations).reduce((s,v)=>s+v,0);
          if (sumOfAllocations !== totalDonationAmount && charities.length > 0) {
            const lastId = charities[charities.length - 1].id;
            const diff = totalDonationAmount - sumOfAllocations;
            allocations[lastId] = Math.max(0, parseFloat((allocations[lastId] + diff).toFixed(2)));
          }
        } else if (charities.length > 0) {
          const equalShare = parseFloat((totalDonationAmount / charities.length).toFixed(2));
          charities.forEach(c => allocations[c.id] = equalShare);
          const sumOfAllocations = Object.values(allocations).reduce((s,v)=>s+v,0);
          if (sumOfAllocations !== totalDonationAmount && charities.length > 0) {
            const lastId = charities[charities.length - 1].id;
            const diff = totalDonationAmount - sumOfAllocations;
            allocations[lastId] = Math.max(0, parseFloat((allocations[lastId] + diff).toFixed(2)));
          }
        }
        setAiSuggestedAllocations(allocations);
        setCombinedMissionStatement(""); // We no longer use combined mission; Compass provides recs
        setCompassRecommendations(recommendations);
        setGroupedMatches(grouped);
        setCurrentStage('charityResults');
      } catch (error) {
        console.error('Error during semantic search:', error);
        let detailedError = "Failed to fetch charity recommendations. Please try again later.";
        if (error.response) {
          detailedError += ` (Server responded with ${error.response.status})`;
          console.error("Error response data:", error.response.data);
        } else if (error.request) {
          detailedError += " (No response from server)";
        }
        setSemanticSearchError(detailedError);
        setCombinedMissionStatement(""); // Clear combined mission on error
        setCurrentStage('charityResults');
      } finally {
        setSemanticSearchLoading(false);
      }
    };

    performSemanticSearch();
  }, [visionPrompt, totalDonationAmount, setCurrentStage, setAiMatchedCharities, setAiSuggestedAllocations, setSemanticSearchLoading, setSemanticSearchError, setCombinedMissionStatement]);

  const keywords = visionPrompt.split(' ').filter(k => k.length > 3);
  if(keywords.length === 0) keywords.push(...['Impact', 'Faith', 'Children', 'Education', 'Africa']);

  if (semanticSearchLoading) {
      return (
          <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
              <Box sx={{ mb: 4 }}> 
                  <CompassAnimation />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontFamily: "'Space Grotesk', sans-serif"}}>
                  Finding the causes that truly fit you…
              </Typography>
              <Box sx={{my:3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1}}>
                  {keywords.slice(0,5).map(kw => <Chip key={kw} label={kw} variant="outlined" />)}
              </Box>
              <LinearProgress sx={{my:2, maxWidth: 300, mx:'auto'}}/> 
              <Typography variant="body2" color="text.secondary">
                  <i>Consulting the Eunoia Compass...</i>
              </Typography>
          </StepContent>
      );
  }
  
  return (
    <StepContent sx={{ textAlign: 'center', py: {xs:4, sm:6}}}>
      <CircularProgress sx={{mb:2}} />
      <Typography variant="h6" fontWeight="medium">Processing your vision...</Typography>
      {semanticSearchError && <Typography color="error" sx={{mt:1}}>{semanticSearchError}</Typography>}
    </StepContent>
  );
};

export default AiProcessingView;

