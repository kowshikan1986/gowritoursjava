// Simple instruction to update the Subcategories section in AdminDashboard.jsx

/*
INSTRUCTIONS TO MAKE SUBCATEGORIES HIERARCHICAL:

1. Find the Subcategories section in AdminDashboard.jsx (around line 1605)

2. Replace the <List> section (lines 1605-1774) with this hierarchical view:

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              {categories
                .filter(c => !c.parent_id)
                .filter(mainCat => categories.some(c => c.parent_id === mainCat.id))
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map((mainCat) => {
                  const l1Subs = categories.filter(c => c.parent_id === mainCat.id);
                  
                  return (
                    <div 
                      key={mainCat.id}
                      style={{
                        border: '2px solid #a855f7',
                        borderRadius: '12px',
                        padding: '1rem',
                        background: '#faf5ff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #e9d5ff' }}>
                        {mainCat.image && (
                          <img src={resolveMedia(mainCat.image)} alt={mainCat.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        )}
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#7c3aed', flex: 1 }}>
                          {mainCat.name}
                        </h4>
                        <Tag style={{ background: '#e9d5ff', color: '#6b21a8' }}>{l1Subs.length} L1</Tag>
                      </div>

                      {l1Subs.map((l1Sub) => {
                        const l2Subs = categories.filter(c => c.parent_id === l1Sub.id);
                        
                        return (
                          <div key={l1Sub.id} style={{ marginBottom: '0.75rem' }}>
                            <div
                              style={{ border: '1px solid #c4b5fd', borderRadius: '8px', padding: '0.75rem', background: '#fff', cursor: 'pointer' }}
                              onClick={() => navigate(`/admin/category/edit/${l1Sub.id}`)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {l1Sub.image && (<img src={resolveMedia(l1Sub.image)} alt={l1Sub.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />)}
                                <div style={{ flex: 1, fontWeight: 600, color: '#7c3aed' }}>↳ {l1Sub.name}</div>
                                <Tag style={{ background: '#e9d5ff', color: '#6b21a8' }}>L1</Tag>
                              </div>
                            </div>
                            
                            {l2Subs.length > 0 && (
                              <div style={{ marginLeft: '2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {l2Subs.map((l2Sub) => (
                                  <div key={l2Sub.id} style={{ border: '1px solid #ddd6fe', borderRadius: '6px', padding: '0.5rem 0.75rem', background: '#faf5ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    onClick={() => navigate(`/admin/category/edit/${l2Sub.id}`)}>
                                    {l2Sub.image && (<img src={resolveMedia(l2Sub.image)} alt={l2Sub.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />)}
                                    <div style={{ flex: 1, fontWeight: 500, color: '#8b5cf6' }}>↳↳ {l2Sub.name}</div>
                                    <Tag style={{ background: '#f3e8ff', color: '#7c3aed', fontSize: '0.75rem' }}>L2</Tag>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
            {!subCategories.length && <Info>No subcategories yet.</Info>}

This creates a hierarchical view with:
- Main categories as headers
- L1 subcategories grouped under each main category
- L2 subcategories nested under their L1 parents
- Click any subcategory to edit it
*/
