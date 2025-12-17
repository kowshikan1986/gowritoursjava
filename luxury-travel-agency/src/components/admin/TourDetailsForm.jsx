import React, { useState } from 'react';
import styled from 'styled-components';

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  min-height: 90px;
  font-size: 0.95rem;
  font-family: inherit;
`;

const Input = styled.input`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const GalleryCard = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
`;

const GalleryImage = styled.div`
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const GalleryContent = styled.div`
  padding: 0.75rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$variant === 'danger' ? '#fca5a5' : '#6A1B82'};
  background: ${props => props.$variant === 'danger' ? 'transparent' : '#6A1B82'};
  color: ${props => props.$variant === 'danger' ? '#b91c1c' : '#fff'};
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    opacity: 0.9;
  }
`;

const AddGalleryForm = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 1rem;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TourDetailsForm = ({ details, onChange }) => {
  const [newGalleryItem, setNewGalleryItem] = useState({ image: '', title: '', description: '' });
  
  const handleDetailsChange = (field, value) => {
    onChange({ ...details, [field]: value });
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddGalleryImage = async () => {
    if (!newGalleryItem.image && !newGalleryItem.title) return;
    
    const galleryImages = details.galleryImages || [];
    onChange({
      ...details,
      galleryImages: [...galleryImages, { ...newGalleryItem }]
    });
    setNewGalleryItem({ image: '', title: '', description: '' });
  };

  const handleRemoveGalleryImage = (index) => {
    const galleryImages = details.galleryImages || [];
    onChange({
      ...details,
      galleryImages: galleryImages.filter((_, i) => i !== index)
    });
  };

  const handleGalleryFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setNewGalleryItem({ ...newGalleryItem, image: base64 });
      } catch (err) {
        console.error('Error converting image:', err);
      }
    }
  };

  return (
    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
      <h4 style={{ marginBottom: '1rem', color: '#6A1B82' }}>Tour Details</h4>
      
      <Field>
        <Label>Early Bird Offer</Label>
        <TextArea
          value={details.earlyBirdOffer}
          onChange={(e) => handleDetailsChange('earlyBirdOffer', e.target.value)}
          placeholder="Book 2026 Tours Now & Get upto 10% Off | Offer Ends on 31th Dec 2025."
        />
      </Field>
      
      <Field>
        <Label>Hotels</Label>
        <TextArea
          value={details.hotels}
          onChange={(e) => handleDetailsChange('hotels', e.target.value)}
          placeholder="3 nights at Premier Inn or Holiday Inn Express Strathclyde or Similar"
        />
      </Field>
      
      <Field>
        <Label>Tour Highlights (one per line)</Label>
        <TextArea
          value={details.highlights.join('\n')}
          onChange={(e) => handleDetailsChange('highlights', e.target.value.split('\n').filter(h => h.trim()))}
          placeholder="Nevis Range* with entrance&#10;Glasgow City Tour covering Glasgow Cathedral"
          rows="6"
        />
      </Field>
      
      <Field>
        <Label>Price Includes (one per line)</Label>
        <TextArea
          value={details.priceIncludes.join('\n')}
          onChange={(e) => handleDetailsChange('priceIncludes', e.target.value.split('\n').filter(h => h.trim()))}
          placeholder="Return transportation by deluxe AC vehicle&#10;3 nights accommodation in 3/4* hotel with breakfast"
          rows="6"
        />
      </Field>
      
      <Field>
        <Label>The Star Difference (one per line)</Label>
        <TextArea
          value={details.starDifference.join('\n')}
          onChange={(e) => handleDetailsChange('starDifference', e.target.value.split('\n').filter(h => h.trim()))}
          placeholder="Indian Lunch included in Edinburgh&#10;Whiskey Tasting with a short introduction to the dram"
          rows="5"
        />
      </Field>
      
      <Field>
        <Label>Pick Up Points (Format: Location | Time, one per line)</Label>
        <TextArea
          value={details.pickupPoints.map(p => `${p.location} | ${p.time}`).join('\n')}
          onChange={(e) => {
            const points = e.target.value.split('\n').filter(line => line.trim()).map(line => {
              const [location, time] = line.split('|').map(s => s.trim());
              return { location: location || '', time: time || '' };
            });
            handleDetailsChange('pickupPoints', points);
          }}
          placeholder="East Ham (E6 2LL) | 05:15 hrs&#10;Southall (UB1 3DB) | 05:45 hrs"
          rows="6"
        />
      </Field>
      
      <Field>
        <Label>Additional Excursions (Format: Name | Adult Price | Child Price, one per line)</Label>
        <TextArea
          value={details.additionalExcursions.map(e => `${e.name} | ${e.adult} | ${e.child}`).join('\n')}
          onChange={(e) => {
            const excursions = e.target.value.split('\n').filter(line => line.trim()).map(line => {
              const [name, adult, child] = line.split('|').map(s => s.trim());
              return { name: name || '', adult: adult || '', child: child || '' };
            });
            handleDetailsChange('additionalExcursions', excursions);
          }}
          placeholder="Loch Lomond | £15 | £10 (5-15 Years)"
          rows="3"
        />
      </Field>
      
      {/* Gallery Images Section */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
        <h4 style={{ marginBottom: '1rem', color: '#6A1B82' }}>📸 Sidebar Gallery Images</h4>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
          Add destination images that will appear on the tour detail page sidebar (like Edinburgh Castle, Glasgow Cathedral, etc.)
        </p>
        
        {/* Existing Gallery Images */}
        {(details.galleryImages || []).length > 0 && (
          <GalleryGrid>
            {(details.galleryImages || []).map((item, index) => (
              <GalleryCard key={index}>
                <GalleryImage style={{ backgroundImage: item.image ? `url(${item.image})` : 'none' }}>
                  {!item.image && '📷'}
                </GalleryImage>
                <GalleryContent>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1f2937' }}>{item.title || 'Untitled'}</strong>
                  {item.description && (
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0.5rem' }}>{item.description}</p>
                  )}
                  <Button $variant="danger" onClick={() => handleRemoveGalleryImage(index)} style={{ width: '100%', fontSize: '0.8rem' }}>
                    Remove
                  </Button>
                </GalleryContent>
              </GalleryCard>
            ))}
          </GalleryGrid>
        )}
        
        {/* Add New Gallery Image */}
        <AddGalleryForm style={{ marginTop: '1rem' }}>
          <Label>Add New Gallery Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleGalleryFileChange}
          />
          {newGalleryItem.image && (
            <img src={newGalleryItem.image} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }} />
          )}
          <Input
            placeholder="Image Title (e.g., Edinburgh Castle)"
            value={newGalleryItem.title}
            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
          />
          <Input
            placeholder="Short Description (optional)"
            value={newGalleryItem.description}
            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
          />
          <Button onClick={handleAddGalleryImage} disabled={!newGalleryItem.image && !newGalleryItem.title}>
            + Add Image
          </Button>
        </AddGalleryForm>
      </div>
    </div>
  );
};

export default TourDetailsForm;
