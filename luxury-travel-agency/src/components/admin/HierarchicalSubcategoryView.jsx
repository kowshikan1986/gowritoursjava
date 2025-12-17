import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Info = styled.div`
  color: #4b5563;
`;

const Tag = styled.span`
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: ${(p) => (p.$variant === 'warn' ? '#fef3c7' : '#e0e7ff')};
  color: ${(p) => (p.$variant === 'warn' ? '#92400e' : '#3730a3')};
`;

const HierarchicalSubcategoryView = ({ categories, resolveMedia }) => {
  const navigate = useNavigate();
  
  const subCategories = categories.filter(c => c.parent_id);
  
  if (subCategories.length === 0) {
    return <Info>No subcategories yet.</Info>;
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Group subcategories by their main parent category */}
      {categories
        .filter(c => !c.parent_id) // Get all main categories
        .filter(mainCat => categories.some(c => c.parent_id === mainCat.id)) // Only show if has subcategories
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map((mainCat) => {
          // Get only L1 subcategories for this main category
          const l1Subs = categories.filter(c => c.parent_id === mainCat.id);
          
          return (
            <div 
              key={mainCat.id}
              style={{
                padding: '1.25rem',
                background: '#fef3c7',
                borderRadius: '12px',
                border: '1px solid #fbbf24'
              }}
            >
              <h4 style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '1.15rem' }}>
                {mainCat.name} Subcategories
              </h4>
              
              {/* L1 Subcategories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {l1Subs.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((l1Sub) => {
                  const l2Children = categories.filter(c => c.parent_id === l1Sub.id);
                  
                  return (
                    <div key={l1Sub.id}>
                      {/* L1 Card */}
                      <div
                        onClick={() => navigate(`/admin/category/edit/${l1Sub.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          background: '#fff',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #fbbf24',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          marginBottom: l2Children.length > 0 ? '0.75rem' : '0'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fef3c7';
                          e.currentTarget.style.borderColor = '#92400e';
                          e.currentTarget.style.transform = 'translateX(3px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.borderColor = '#fbbf24';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        title={`Click to edit ${l1Sub.name} (L1)`}
                      >
                        {l1Sub.image && (
                          <img
                            src={resolveMedia(l1Sub.image)}
                            alt={l1Sub.name}
                            style={{ 
                              width: '120px',
                              height: '80px',
                              objectFit: 'cover', 
                              borderRadius: 6 
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: '0.25rem' }}>
                            {l1Sub.name}
                          </div>
                          {l1Sub.description && (
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                              {l1Sub.description.replace(/<[^>]*>/g, '').substring(0, 100)}{l1Sub.description.length > 100 ? '...' : ''}
                            </div>
                          )}
                        </div>
                        <Tag style={{ background: '#e9d5ff', color: '#6b21a8' }}>L1</Tag>
                      </div>
                      
                      {/* L2 Children Grid - Nested under L1 */}
                      {l2Children.length > 0 && (
                        <div style={{ 
                          marginLeft: '2rem',
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                          gap: '0.75rem',
                          paddingLeft: '1rem',
                          borderLeft: '3px solid #e9d5ff'
                        }}>
                          {l2Children.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((l2Sub) => (
                            <div
                              key={l2Sub.id}
                              onClick={() => navigate(`/admin/category/edit/${l2Sub.id}`)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: '#fff',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '2px dashed #d1d5db',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3e8ff';
                                e.currentTarget.style.borderColor = '#a855f7';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              title={`Click to edit ${l2Sub.name} (L2)`}
                            >
                              {l2Sub.image && (
                                <img
                                  src={resolveMedia(l2Sub.image)}
                                  alt={l2Sub.name}
                                  style={{ 
                                    width: '100%',
                                    height: '70px',
                                    objectFit: 'cover', 
                                    borderRadius: 6 
                                  }}
                                />
                              )}
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>
                                {l2Sub.name}
                              </span>
                              <Tag style={{ background: '#e9d5ff', color: '#6b21a8', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>L2</Tag>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default HierarchicalSubcategoryView;
