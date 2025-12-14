import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, EnvelopeIcon, UserIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { servicesData } from '../data/servicesData';

const Page = styled.div`
  background: #f9fafb;
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem 4rem;

  @media (max-width: 768px) {
    padding: 5rem 1rem 3rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -0.02em;
`;

const SubTitle = styled(motion.p)`
  color: #666;
  margin-top: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const AnimatedCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 2rem;
`;

const WideCard = styled(AnimatedCard)`
  grid-column: 1 / -1;
`;

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #6A1B82;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    font-size: 0.85rem;
    color: #888;
  }

  strong {
    font-size: 1.05rem;
    color: #1a1a1a;
  }
`;

const Form = styled(motion.form)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  &:focus-within label {
    top: -10px;
    font-size: 0.75rem;
    color: #6A1B82;
  }
  &[data-has-value='true'] label {
    top: -10px;
    font-size: 0.75rem;
    color: #6A1B82;
  }
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 6px;
  color: #888;
  transition: all 0.2s ease;
  pointer-events: none;
`;

const IconLeft = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6A1B82;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #6A1B82;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.12);
  }
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  font-size: 1rem;
  outline: none;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    border-color: #6A1B82;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.12);
  }
`;

const TextArea = styled.textarea`
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  min-height: 180px;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #6A1B82;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.12);
  }
`;

const FullRow = styled.div`
  grid-column: 1 / -1;
`;

const Submit = styled.button`
  background: #6A1B82;
  color: #ffffff;
  border: 2px solid #6A1B82;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #7C2E9B;
    border-color: #7C2E9B;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Progress = styled.div`
  height: 8px;
  background: #f0f0f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6A1B82 0%, #7C2E9B 100%);
  width: ${props => props.percent || 0}%;
  transition: width 0.3s ease;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1a1a;
  }
  span {
    font-size: 0.9rem;
    color: #666;
  }
`;

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const SuccessCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 360px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

const ContactUs = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    packageId: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    const pkgLabel = (() => {
      const allPkgs = [];
      for (const s of servicesData) {
        if (s.packages) {
          for (const p of s.packages) {
            allPkgs.push({ id: p.id, label: `${s.title} — ${p.title}` });
          }
        }
      }
      const found = allPkgs.find(x => x.id === form.packageId);
      return found ? found.label : form.destination;
    })();
    const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nDestination: ${form.destination}\nMessage: ${form.message}`;
    const finalBody = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nSelected Package: ${pkgLabel || 'N/A'}\nMessage: ${form.message}`;
    window.location.href = `mailto:info@gowritours.com?subject=Luxury%20Travel%20Inquiry&body=${encodeURIComponent(finalBody)}`;
    setShowSuccess(true);
  };

  useEffect(() => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Please enter your full name';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) errs.email = 'Enter a valid email address';
    if (!form.message || form.message.trim().length < 10) errs.message = 'Tell us more about your trip';
    setErrors(errs);
    const fields = ['name','email','message'];
    const filled = fields.filter(f => !errs[f]).length;
    setProgress(Math.round((filled/fields.length)*100));
  }, [form]);

  return (
    <Page>
      <Container>
        <Header>
          <Title initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Get in Touch</Title>
          <SubTitle initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Plan Your Luxury Experience</SubTitle>
        </Header>

        <Grid>
          <AnimatedCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InfoItem>
              <IconWrap><PhoneIcon style={{ width: 20, height: 20 }} /></IconWrap>
              <InfoText>
                <span>Telephone</span>
                <strong>+44 20 8830 8611</strong>
                <span>Main Office</span>
              </InfoText>
            </InfoItem>

            <InfoItem>
              <IconWrap><PhoneIcon style={{ width: 20, height: 20 }} /></IconWrap>
              <InfoText>
                <span>Mobile</span>
                <strong>07956 375 803</strong>
                <span>24/7 Support</span>
              </InfoText>
            </InfoItem>

            <InfoItem>
              <IconWrap><EnvelopeIcon style={{ width: 20, height: 20 }} /></IconWrap>
              <InfoText>
                <span>E-mail</span>
                <strong>info@gowritours.com</strong>
                <span>Response within 24 hours</span>
              </InfoText>
              </InfoItem>
          </AnimatedCard>

          <WideCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FormHeader>
              <h3>Plan Your Luxury Experience</h3>
              <span>{progress}% complete</span>
            </FormHeader>
            <Progress><ProgressFill percent={progress} /></Progress>
            <Form onSubmit={submit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FullRow>
                <Label>Full Name *</Label>
                <InputWrapper data-has-value={Boolean(form.name)}>
                  <IconLeft><UserIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <FloatingLabel>Enter your full name</FloatingLabel>
                  <Input name="name" value={form.name} onChange={update} required />
                </InputWrapper>
                {errors.name && <span style={{ color: '#e11d48', fontSize: '0.9rem' }}>{errors.name}</span>}
              </FullRow>

              <FullRow>
                <Label>Email Address *</Label>
                <InputWrapper data-has-value={Boolean(form.email)}>
                  <IconLeft><EnvelopeIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <FloatingLabel>your.email@example.com</FloatingLabel>
                  <Input type="email" name="email" value={form.email} onChange={update} required />
                </InputWrapper>
                {errors.email && <span style={{ color: '#e11d48', fontSize: '0.9rem' }}>{errors.email}</span>}
              </FullRow>

              <Field>
                <Label>Phone Number</Label>
                <InputWrapper data-has-value={Boolean(form.phone)}>
                  <IconLeft><PhoneIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <FloatingLabel>+44 20 8830 8611</FloatingLabel>
                  <Input name="phone" value={form.phone} onChange={update} />
                </InputWrapper>
              </Field>

              <Field>
                <Label>Select Your Package</Label>
                <InputWrapper>
                  <IconLeft><MapPinIcon style={{ width: 18, height: 18 }} /></IconLeft>
                  <Select name="packageId" value={form.packageId} onChange={update}>
                    <option value="">Select a package</option>
                    {servicesData.flatMap(service => (service.packages || []).map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{`${service.title} — ${pkg.title}`}</option>
                    )))}
                  </Select>
                </InputWrapper>
              </Field>

              <FullRow>
                <Label>Message *</Label>
                <TextArea name="message" placeholder="Tell us about your dream luxury travel experience..." value={form.message} onChange={update} required />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Min 10 characters</span>
                  <span style={{ color: '#6A1B82', fontSize: '0.85rem' }}>{form.message.length} chars</span>
                </div>
                {errors.message && <span style={{ color: '#e11d48', fontSize: '0.9rem' }}>{errors.message}</span>}
              </FullRow>

              <FullRow>
                <Submit type="submit" disabled={Object.keys(errors).length > 0}>Send Message</Submit>
              </FullRow>
            </Form>
            <AnimatePresence>
              {showSuccess && (
                <SuccessOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSuccess(false)}
                >
                  <SuccessCard
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <CheckCircleIcon style={{ width: 48, height: 48, color: '#6A1B82', marginBottom: '0.75rem' }} />
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Message ready to send</h4>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Your email client will open with details.</p>
                    <Submit onClick={() => setShowSuccess(false)}>Close</Submit>
                  </SuccessCard>
                </SuccessOverlay>
              )}
            </AnimatePresence>
          </WideCard>
        </Grid>
      </Container>
    </Page>
  );
};

export default ContactUs;
