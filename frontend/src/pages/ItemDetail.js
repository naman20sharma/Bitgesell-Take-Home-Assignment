import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:3001/api/items/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/');
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const itemData = await response.json();
        
        if (mounted) {
          setItem(itemData);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: '#d32f2f' }}>Error loading item: {error}</p>
        <button onClick={() => navigate('/')}>← Back to items</button>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: 16 }}>
        <p>Item not found</p>
        <button onClick={() => navigate('/')}>← Back to items</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <button 
        onClick={() => navigate('/')}
        style={{
          marginBottom: 16,
          padding: '8px 16px',
          border: '1px solid #ddd',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        ← Back to items
      </button>
      
      <h2>{item.name}</h2>
      <div style={{ fontSize: '1.1em', marginBottom: 8 }}>
        <strong>Category:</strong> {item.category}
      </div>
      <div style={{ fontSize: '1.1em', color: '#2e7d32' }}>
        <strong>Price:</strong> ${item.price.toFixed(2)}
      </div>
    </div>
  );
}

export default ItemDetail;