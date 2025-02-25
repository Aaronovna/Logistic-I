import { useState } from 'react';
import axios from 'axios';

const usePrediction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPrediction = async (id, demands, setPrediction) => {
    setLoading(true);
    setError(null);

    const payload = {
      product_id: id,
      demands: demands,
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', payload);
      const totalDemand = Math.ceil(
        response.data.predicted_demand.reduce((sum, value) => sum + value, 0)
      );
      setPrediction(totalDemand);
      return totalDemand;
    } catch (err) {
      console.error('Error fetching prediction:', err);
      setError('Failed to fetch prediction');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getPrediction };
};

export default usePrediction;
