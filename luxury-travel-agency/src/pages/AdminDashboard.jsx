import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import client from '../api/client';

const Page = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: ${(p) => (p.$active ? '#6A1B82' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : '#111827')};
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
`;

const Flex = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1 1 220px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  min-height: 90px;
  font-size: 0.95rem;
`;

const Select = styled.select`
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
`;

const Button = styled.button`
  padding: 0.75rem 1.4rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  background: ${(p) => (p.$variant === 'outline' ? '#fff' : '#6A1B82')};
  color: ${(p) => (p.$variant === 'outline' ? '#111827' : '#fff')};
  border: ${(p) => (p.$variant === 'outline' ? '1px solid #d1d5db' : 'none')};
  box-shadow: ${(p) =>
    p.$variant === 'outline' ? 'none' : '0 10px 20px rgba(106,27,130,0.25)'};
`;

const List = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const Item = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: ${(p) => (p.$variant === 'warn' ? '#fef3c7' : '#e0e7ff')};
  color: ${(p) => (p.$variant === 'warn' ? '#92400e' : '#3730a3')};
`;

const ErrorMsg = styled.div`
  color: #b91c1c;
  font-weight: 600;
`;

const Info = styled.div`
  color: #4b5563;
`;

const sections = [
  { key: 'tours', label: 'Tours' },
  { key: 'categories', label: 'Categories' },
  { key: 'subcategories', label: 'Subcategories' },
  { key: 'hero', label: 'Hero Banners' },
  { key: 'ads', label: 'Ads' },
  { key: 'logos', label: 'Logos' },
];

const AdminDashboard = () => {
  const [active, setActive] = useState('tours');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [ads, setAds] = useState([]);
  const [logos, setLogos] = useState([]);

  const [tourForm, setTourForm] = useState({
    title: '',
    price: '',
    duration: '',
    location: '',
    description: '',
    category: '',
    is_active: true,
    is_featured: false,
    featured_image: null,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: null,
  });
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [categoryEditForm, setCategoryEditForm] = useState({
    name: '',
    description: '',
    image: null,
  });

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    priority: 10,
    is_active: true,
    background_image: null,
  });
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    description: '',
    category: '',
    image: null,
  });
  const [editSubCategoryId, setEditSubCategoryId] = useState(null);
  const [subCategoryEditForm, setSubCategoryEditForm] = useState({
    name: '',
    description: '',
    category: '',
    image: null,
  });

  const apiBase = useMemo(() => client.defaults.baseURL?.replace(/\/$/, ''), []);

  const resolveMedia = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${apiBase?.replace('/api', '')}${url}`;
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData(active);
    }
  }, [active, user]);

  const checkSession = async () => {
    setAuthLoading(true);
    try {
      const res = await client.get('/auth/me/');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/login/', loginForm);
      setUser(res.data);
      fetchData(active);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await client.post('/auth/logout/');
      setUser(null);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (key) => {
    setError('');
    setLoading(true);
    try {
      if (key === 'tours') {
        const [tourRes, catRes] = await Promise.all([
          client.get('/tours/'),
          client.get('/categories/'),
        ]);
        setTours(Array.isArray(tourRes.data) ? tourRes.data : tourRes.data.results || []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
      } else if (key === 'categories') {
        const [catRes, subCatRes] = await Promise.all([
          client.get('/categories/'),
          client.get('/subcategories/'),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
        setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : subCatRes.data.results || []);
      } else if (key === 'subcategories') {
        const [catRes, subCatRes] = await Promise.all([
          client.get('/categories/'),
          client.get('/subcategories/'),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
        setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : subCatRes.data.results || []);
      } else if (key === 'hero') {
        const res = await client.get('/hero-banners/');
        setBanners(Array.isArray(res.data) ? res.data : res.data.results || []);
      } else if (key === 'ads') {
        const res = await client.get('/ads/');
        setAds(Array.isArray(res.data) ? res.data : res.data.results || []);
      } else if (key === 'logos') {
        const res = await client.get('/logos/');
        setLogos(Array.isArray(res.data) ? res.data : res.data.results || []);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTour = async () => {
    if (!tourForm.title || !tourForm.featured_image) {
      setError('Title and featured image are required for a tour.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(tourForm).forEach(([k, v]) => {
        if (v !== null && v !== '') {
          fd.append(k, v);
        }
      });
      await client.post('/tours/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTourForm({
        title: '',
        price: '',
        duration: '',
        location: '',
        description: '',
        category: '',
        is_active: true,
        is_featured: false,
        featured_image: null,
      });
      fetchData('tours');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to create tour');
    } finally {
      setLoading(false);
    }
  };

  const toggleTourFlag = async (tour, field) => {
    try {
      await client.patch(`/tours/${tour.slug}/`, { [field]: !tour[field] });
      fetchData('tours');
    } catch (err) {
      setError(err?.response?.data?.detail || `Unable to update ${field}`);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      setError('Category name is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(categoryForm).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      await client.post('/categories/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCategoryForm({ name: '', description: '', image: null });
      fetchData('categories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditCategory = (cat) => {
    setEditCategoryId(cat.id);
    setCategoryEditForm({
      name: cat.name || '',
      description: cat.description || '',
      image: null,
    });
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryId) return;
    const cat = categories.find((c) => c.id === editCategoryId);
    if (!cat) return;
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', categoryEditForm.name);
      fd.append('description', categoryEditForm.description || '');
      if (categoryEditForm.image) {
        fd.append('image', categoryEditForm.image);
      }
      await client.patch(`/categories/${cat.slug}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditCategoryId(null);
      setCategoryEditForm({ name: '', description: '', image: null });
      fetchData('categories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCategoryImage = async (cat) => {
    setError('');
    setLoading(true);
    try {
      await client.patch(`/categories/${cat.slug}/`, { image: null });
      fetchData('categories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to remove image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!cat) return;
    setError('');
    setLoading(true);
    try {
      await client.delete(`/categories/${cat.slug}/`);
      setEditCategoryId(null);
      fetchData('categories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubCategory = async () => {
    if (!subCategoryForm.name || !subCategoryForm.category) {
      setError('Subcategory name and parent category are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(subCategoryForm).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      await client.post('/subcategories/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubCategoryForm({ name: '', description: '', category: '', image: null });
      fetchData('subcategories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to create subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditSubCategory = (sub) => {
    setEditSubCategoryId(sub.id);
    setSubCategoryEditForm({
      name: sub.name || '',
      description: sub.description || '',
      category: sub.category || '',
      image: null,
    });
  };

  const handleUpdateSubCategory = async () => {
    if (!editSubCategoryId) return;
    const sub = subCategories.find((s) => s.id === editSubCategoryId);
    if (!sub) return;
    if (!subCategoryEditForm.name || !subCategoryEditForm.category) {
      setError('Subcategory name and parent category are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', subCategoryEditForm.name);
      fd.append('description', subCategoryEditForm.description || '');
      fd.append('category', subCategoryEditForm.category);
      if (subCategoryEditForm.image) {
        fd.append('image', subCategoryEditForm.image);
      }
      await client.patch(`/subcategories/${sub.slug}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditSubCategoryId(null);
      setSubCategoryEditForm({ name: '', description: '', category: '', image: null });
      fetchData('subcategories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to update subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSubCategoryImage = async (sub) => {
    setError('');
    setLoading(true);
    try {
      await client.patch(`/subcategories/${sub.slug}/`, { image: null });
      fetchData('subcategories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to remove subcategory image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubCategory = async (sub) => {
    if (!sub) return;
    setError('');
    setLoading(true);
    try {
      await client.delete(`/subcategories/${sub.slug}/`);
      setEditSubCategoryId(null);
      fetchData('subcategories');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to delete subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async () => {
    if (!bannerForm.title || !bannerForm.background_image) {
      setError('Banner title and background image are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(bannerForm).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      await client.post('/hero-banners/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBannerForm({
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        priority: 10,
        is_active: true,
        background_image: null,
      });
      fetchData('hero');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to create banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Header>
        <div>
          <Title>Admin Dashboard</Title>
          <Info>Manage tours, categories, hero banners, ads and logos.</Info>
        </div>
        {user && (
          <Tabs>
            {sections.map((s) => (
              <Tab
                key={s.key}
                $active={active === s.key}
                onClick={() => setActive(s.key)}
              >
                {s.label}
              </Tab>
            ))}
          </Tabs>
        )}
      </Header>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {(loading || authLoading) && <Info>Loading...</Info>}

      {!authLoading && !user && (
        <Card>
          <h3>Login</h3>
          <Flex>
            <Field>
              <Label>Username</Label>
              <Input
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </Field>
            <Field>
              <Label>Password</Label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </Field>
          </Flex>
          <Button onClick={handleLogin}>Sign In</Button>
          <Info>Staff accounts only. Uses backend session auth.</Info>
        </Card>
      )}

      {user && (
        <Card>
          <Flex style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{user.username}</strong> (staff)
            </div>
            <Button $variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </Flex>
        </Card>
      )}

      {user && active === 'tours' && (
        <>
          <Card>
            <h3>Create Tour</h3>
            <Flex>
              <Field>
                <Label>Title</Label>
                <Input
                  value={tourForm.title}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, title: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={tourForm.price}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, price: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Duration</Label>
                <Input
                  value={tourForm.duration}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, duration: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Location</Label>
                <Input
                  value={tourForm.location}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, location: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Category</Label>
                <Select
                  value={tourForm.category}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>Featured Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setTourForm({ ...tourForm, featured_image: e.target.files[0] })
                  }
                />
              </Field>
              <Field>
                <Label>Description</Label>
                <TextArea
                  value={tourForm.description}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, description: e.target.value })
                  }
                />
              </Field>
            </Flex>
            <Flex>
              <Field>
                <Label>Active</Label>
                <Select
                  value={tourForm.is_active ? 'yes' : 'no'}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, is_active: e.target.value === 'yes' })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
              <Field>
                <Label>Featured</Label>
                <Select
                  value={tourForm.is_featured ? 'yes' : 'no'}
                  onChange={(e) =>
                    setTourForm({
                      ...tourForm,
                      is_featured: e.target.value === 'yes',
                    })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
            </Flex>
            <Button onClick={handleCreateTour}>Save Tour</Button>
          </Card>

          <Card>
            <h3>Tours</h3>
            <List>
              {tours.map((t) => (
                <Item key={t.id || t.slug}>
                  <div>
                    <strong>{t.title}</strong>
                    <Info>
                      {t.category_name || 'Uncategorized'} · £{t.price} · {t.location}
                    </Info>
                  </div>
                  <Flex>
                    <Tag $variant={t.is_active ? undefined : 'warn'}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                    <Tag>{t.is_featured ? 'Featured' : 'Standard'}</Tag>
                    <Button
                      $variant="outline"
                      onClick={() => toggleTourFlag(t, 'is_active')}
                    >
                      Toggle Active
                    </Button>
                    <Button
                      $variant="outline"
                      onClick={() => toggleTourFlag(t, 'is_featured')}
                    >
                      Toggle Featured
                    </Button>
                  </Flex>
                </Item>
              ))}
            </List>
            {!tours.length && <Info>No tours yet.</Info>}
          </Card>
        </>
      )}

      {user && active === 'categories' && (
        <>
          <Card>
            <h3>Create Category</h3>
            <Flex>
              <Field>
                <Label>Name</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Description</Label>
                <Input
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, image: e.target.files[0] })
                  }
                />
              </Field>
            </Flex>
            <Button onClick={handleCreateCategory}>Save Category</Button>
          </Card>
          <Card>
            <h3>Categories</h3>
            <List>
              {categories.map((c) => (
                <Item key={c.id || c.slug}>
                  <div style={{ flex: '1 1 auto', minWidth: 220 }}>
                    {editCategoryId === c.id ? (
                      <>
                        <Field>
                          <Label>Name</Label>
                          <Input
                            value={categoryEditForm.name}
                            onChange={(e) =>
                              setCategoryEditForm({ ...categoryEditForm, name: e.target.value })
                            }
                          />
                        </Field>
                        <Field>
                          <Label>Description</Label>
                          <Input
                            value={categoryEditForm.description}
                            onChange={(e) =>
                              setCategoryEditForm({
                                ...categoryEditForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field>
                          <Label>Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setCategoryEditForm({
                                ...categoryEditForm,
                                image: e.target.files[0],
                              })
                            }
                          />
                        </Field>
                      </>
                    ) : (
                      <>
                        <strong>{c.name}</strong>
                        <Info>{c.description || 'No description'}</Info>
                        <Info>
                          {subCategories.filter((s) => s.category === c.id).length} subcategories
                        </Info>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                          {subCategories
                            .filter((s) => s.category === c.id)
                            .map((s) => (
                              <span
                                key={s.id}
                                style={{
                                  background: '#f3e8ff',
                                  color: '#4c1d95',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '999px',
                                  fontSize: '0.85rem',
                                  border: '1px solid #e9d5ff',
                                }}
                              >
                                {s.name}
                              </span>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                  {c.image && (
                    <img
                      src={resolveMedia(c.image)}
                      alt={c.name}
                      style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                  <Flex>
                    {editCategoryId === c.id ? (
                      <>
                        <Button onClick={handleUpdateCategory}>Save</Button>
                        <Button
                          $variant="outline"
                          onClick={() => {
                            setEditCategoryId(null);
                            setCategoryEditForm({ name: '', description: '', image: null });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          $variant="outline"
                          onClick={() => handleDeleteCategory(c)}
                          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button $variant="outline" onClick={() => handleStartEditCategory(c)}>
                        Edit
                      </Button>
                    )}
                    <Button $variant="outline" onClick={() => handleClearCategoryImage(c)}>
                      Remove Image
                    </Button>
                  </Flex>
                </Item>
              ))}
            </List>
            {!categories.length && <Info>No categories yet.</Info>}
          </Card>
        </>
      )}

      {user && active === 'subcategories' && (
        <>
          <Card>
            <h3>Create Subcategory</h3>
            <Flex>
              <Field>
                <Label>Name</Label>
                <Input
                  value={subCategoryForm.name}
                  onChange={(e) =>
                    setSubCategoryForm({ ...subCategoryForm, name: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Description</Label>
                <Input
                  value={subCategoryForm.description}
                  onChange={(e) =>
                    setSubCategoryForm({ ...subCategoryForm, description: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Parent Category</Label>
                <Select
                  value={subCategoryForm.category}
                  onChange={(e) =>
                    setSubCategoryForm({ ...subCategoryForm, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSubCategoryForm({ ...subCategoryForm, image: e.target.files[0] })
                  }
                />
              </Field>
            </Flex>
            <Button onClick={handleCreateSubCategory}>Save Subcategory</Button>
          </Card>

          <Card>
            <h3>Subcategories</h3>
            <List>
              {subCategories.map((s) => (
                <Item key={s.id || s.slug}>
                  <div style={{ flex: '1 1 auto', minWidth: 220 }}>
                    {editSubCategoryId === s.id ? (
                      <>
                        <Field>
                          <Label>Name</Label>
                          <Input
                            value={subCategoryEditForm.name}
                            onChange={(e) =>
                              setSubCategoryEditForm({
                                ...subCategoryEditForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field>
                          <Label>Description</Label>
                          <Input
                            value={subCategoryEditForm.description}
                            onChange={(e) =>
                              setSubCategoryEditForm({
                                ...subCategoryEditForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field>
                          <Label>Parent Category</Label>
                          <Select
                            value={subCategoryEditForm.category}
                            onChange={(e) =>
                              setSubCategoryEditForm({
                                ...subCategoryEditForm,
                                category: e.target.value,
                              })
                            }
                          >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field>
                          <Label>Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setSubCategoryEditForm({
                                ...subCategoryEditForm,
                                image: e.target.files[0],
                              })
                            }
                          />
                        </Field>
                      </>
                    ) : (
                      <>
                        <strong>{s.name}</strong>
                        <Info>
                          {categories.find((c) => c.id === s.category)?.name || '—'}
                        </Info>
                        <Info>{s.description || 'No description'}</Info>
                      </>
                    )}
                  </div>
                  {s.image && (
                    <img
                      src={resolveMedia(s.image)}
                      alt={s.name}
                      style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                  <Flex>
                    {editSubCategoryId === s.id ? (
                      <>
                        <Button onClick={handleUpdateSubCategory}>Save</Button>
                        <Button
                          $variant="outline"
                          onClick={() => {
                            setEditSubCategoryId(null);
                            setSubCategoryEditForm({
                              name: '',
                              description: '',
                              category: '',
                              image: null,
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          $variant="outline"
                          onClick={() => handleDeleteSubCategory(s)}
                          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button $variant="outline" onClick={() => handleStartEditSubCategory(s)}>
                        Edit
                      </Button>
                    )}
                    <Button $variant="outline" onClick={() => handleClearSubCategoryImage(s)}>
                      Remove Image
                    </Button>
                  </Flex>
                </Item>
              ))}
            </List>
            {!subCategories.length && <Info>No subcategories yet.</Info>}
          </Card>
        </>
      )}

      {active === 'hero' && (
        <>
          <Card>
            <h3>Create Hero Banner</h3>
            <Flex>
              <Field>
                <Label>Title</Label>
                <Input
                  value={bannerForm.title}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, title: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Subtitle</Label>
                <Input
                  value={bannerForm.subtitle}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, subtitle: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>CTA Text</Label>
                <Input
                  value={bannerForm.cta_text}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, cta_text: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>CTA Link</Label>
                <Input
                  value={bannerForm.cta_link}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, cta_link: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={bannerForm.priority}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, priority: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label>Background Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setBannerForm({
                      ...bannerForm,
                      background_image: e.target.files[0],
                    })
                  }
                />
              </Field>
            </Flex>
            <Flex>
              <Field>
                <Label>Active</Label>
                <Select
                  value={bannerForm.is_active ? 'yes' : 'no'}
                  onChange={(e) =>
                    setBannerForm({
                      ...bannerForm,
                      is_active: e.target.value === 'yes',
                    })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
            </Flex>
            <Button onClick={handleCreateBanner}>Save Banner</Button>
          </Card>
          <Card>
            <h3>Hero Banners</h3>
            <List>
              {banners.map((b) => (
                <Item key={b.id}>
                  <div>
                    <strong>{b.title}</strong>
                    <Info>{b.subtitle || 'No subtitle'}</Info>
                    <Tag $variant={b.is_active ? undefined : 'warn'}>
                      {b.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                  </div>
                  {b.background_image && (
                    <img
                      src={resolveMedia(b.background_image)}
                      alt={b.title}
                      style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                </Item>
              ))}
            </List>
            {!banners.length && <Info>No hero banners yet.</Info>}
          </Card>
        </>
      )}

      {active === 'ads' && (
        <Card>
          <h3>Ads</h3>
          <List>
            {ads.map((a) => (
              <Item key={a.id}>
                <div>
                  <strong>{a.title}</strong>
                  <Info>Priority {a.priority}</Info>
                </div>
                {a.image && (
                  <img
                    src={resolveMedia(a.image)}
                    alt={a.title}
                    style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 8 }}
                  />
                )}
              </Item>
            ))}
          </List>
          {!ads.length && <Info>No ads yet.</Info>}
          <Info>Creation/edit for ads can be added next; API is wired at /api/ads/.</Info>
        </Card>
      )}

      {active === 'logos' && (
        <Card>
          <h3>Logos</h3>
          <List>
            {logos.map((l) => (
              <Item key={l.id}>
                <div>
                  <strong>{l.title}</strong>
                  <Tag $variant={l.is_active ? undefined : 'warn'}>
                    {l.is_active ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
                {l.image && (
                  <img
                    src={resolveMedia(l.image)}
                    alt={l.title}
                    style={{ width: 80, height: 50, objectFit: 'contain', borderRadius: 8 }}
                  />
                )}
              </Item>
            ))}
          </List>
          {!logos.length && <Info>No logos yet.</Info>}
          <Info>Creation/edit for logos can be added next; API is wired at /api/logos/.</Info>
        </Card>
      )}
    </Page>
  );
};

export default AdminDashboard;

